import { describe, expect, it, vi } from 'vitest';
import {
  h,
  mount,
  lmount,
  mountCallback,
  nextTick,
  render,
  updateCallback,
  useParentMemo,
  useRenew,
  getComponentKey,
  getComponentSubInfo,
  replaceWDom,
} from '@/index';
import type { CompKey, Props, Renew, TagFunction, WDom } from '@/types';
import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';

const redrawNow = (key: CompKey) => {
  const node = getComponentSubInfo(key, 'vd')!.value!;
  redrawNode(node);
};

const redrawNode = (node: WDom) => {
  replaceWDom(
    node.ctor as TagFunction,
    node.compProps as Props,
    node.compChild as WDom[],
    node
  );
};

const fixture = (
  selector: (props: Readonly<Props>) => readonly unknown[] = next => [
    next.label,
  ],
  enabled = true
) => {
  let nextProps: Props = { label: 'before', ignored: 0 };
  let slots: WDom[] = [];
  let local = 0;
  let shown = true;
  let bumpParent: Renew = () => false;
  let bumpChild: Renew = () => false;
  let parentKey: CompKey;
  let childKey: CompKey;
  let held: Props;
  let failure: 'selector' | 'pre' | 'render' | 'post' | undefined;
  let requeue = false;
  const trace: string[] = [];
  const Child = mount<Props>((renew, props, children) => {
    held = props;
    childKey = getComponentKey()!;
    bumpChild = renew;
    if (enabled) {
      useParentMemo(next => {
        if (failure === 'selector') throw Error('selector');
        return selector(next);
      });
    }
    mountCallback(() => () => trace.push('unmount'));
    updateCallback(() => {
      trace.push('pre');
      if (failure === 'pre') throw Error('pre');
      return () => {
        trace.push('post');
        if (failure === 'post') throw Error('post');
        if (requeue) {
          requeue = false;
          local++;
          renew();
        }
      };
    });
    return () => {
      trace.push('render');
      if (failure === 'render') throw Error('render');
      return (
        <section>
          <input value={`${props.label}:${local}`} />
          {children}
        </section>
      );
    };
  });
  const Parent = mount(renew => {
    parentKey = getComponentKey()!;
    bumpParent = renew;
    return () => <main>{shown ? h(Child, nextProps, ...slots) : null}</main>;
  });
  const host = document.createElement('div');
  const tree = <Parent />;
  const dispose = render(tree, host);
  const input = host.querySelector('input')!;
  trace.length = 0;
  return {
    host,
    input,
    trace,
    dispose,
    held: () => held,
    parent: () => bumpParent(),
    child: () => bumpChild(),
    parentNow: () => redrawNow(parentKey),
    parentNode: () => getComponentSubInfo(parentKey, 'vd')!.value!,
    childNow: () => redrawNow(childKey),
    edit: () => local++,
    props: (value: Props) => (nextProps = value),
    slots: (value: WDom[]) => (slots = value),
    remove: () => (shown = false),
    fail: (stage: typeof failure) => (failure = stage),
    requeue: () => (requeue = true),
  };
};

describe('C3 base parent memo candidate', () => {
  it('rejects registration outside setup and duplicate registration', () => {
    expect(() => useParentMemo(() => [])).toThrow(
      /once during component setup/
    );
    const Duplicate = mount(() => {
      useParentMemo(() => []);
      useParentMemo(() => []);
      return () => null;
    });
    expect(() => h(Duplicate, {})).toThrow(/once during component setup/);
    expect(() => useParentMemo(() => [])).toThrow(
      /once during component setup/
    );
  });

  it('rejects registration in the initial updater or a mount callback', () => {
    const Invalid = mount(() => () => {
      useParentMemo(() => []);
      return null;
    });
    expect(() => h(Invalid, {})).toThrow(/once during component setup/);
    const App = mount(() => {
      mountCallback(() => {
        expect(() => useParentMemo(() => [])).toThrow(/component setup/);
      });
      return () => null;
    });
    render(h(App, {}), document.createElement('div'))();
  });

  it('supports lmount setup and keeps self renew active', async () => {
    let bump: Renew = () => false;
    let parent: Renew = () => false;
    let runs = 0;
    const Child = lmount(() => {
      useParentMemo(() => []);
      bump = useRenew();
      return () => <b>{++runs}</b>;
    });
    const Parent = mount(renew => {
      parent = renew;
      return () => (
        <div>
          <Child />
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    parent();
    await nextTick();
    expect(runs).toBe(1);
    bump();
    await nextTick();
    expect(host.textContent).toBe('2');
    dispose();
  });

  it('skips the updater and both callbacks but syncs held props on a hit', () => {
    const p = fixture();
    const held = p.held();
    p.props({ label: 'before', ignored: 1 });
    p.parentNow();
    expect(p.trace).toEqual([]);
    expect(p.held()).toBe(held);
    expect(held.ignored).toBe(1);
    expect(p.host.querySelector('input')).toBe(p.input);
    p.childNow();
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.dispose();
  });

  it('reads incoming props before synchronization and invalidates key changes', () => {
    const p = fixture();
    p.props({ label: 'after', ignored: 0 });
    p.parentNow();
    expect(p.input.value).toBe('after:0');
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.trace.length = 0;
    p.props({ label: 'after' });
    p.parentNow();
    expect(p.held()).not.toHaveProperty('ignored');
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.trace.length = 0;
    p.props({ label: 'after', ignored: 2 });
    p.parentNow();
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.dispose();
  });

  it('copies reused dependency arrays, including length changes', () => {
    const deps: unknown[] = [];
    const p = fixture(() => deps);
    p.parentNow();
    expect(p.trace).toEqual([]);
    for (const next of [[undefined], [undefined, 1], [undefined], []]) {
      deps.splice(0, deps.length, ...next);
      p.parentNow();
      expect(p.trace.splice(0)).toEqual(['pre', 'render', 'post']);
      p.parentNow();
      expect(p.trace).toEqual([]);
    }
    p.dispose();
  });

  it('uses Object.is for NaN and signed zero', () => {
    let value = NaN;
    const p = fixture(() => [value]);
    p.parentNow();
    expect(p.trace).toEqual([]);
    value = -0;
    p.parentNow();
    expect(p.trace.splice(0)).toEqual(['pre', 'render', 'post']);
    value = 0;
    p.parentNow();
    expect(p.trace.splice(0)).toEqual(['pre', 'render', 'post']);
    p.parentNow();
    expect(p.trace).toEqual([]);
    p.dispose();
  });

  it('detects scalar changes inside a shared mutable object', () => {
    const row = { version: 0 };
    const p = fixture(next => [(next.row as typeof row)?.version]);
    p.props({ label: 'before', row });
    p.parentNow();
    p.trace.length = 0;
    row.version++;
    p.parentNow();
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toEqual([]);
    p.dispose();
  });

  it('falls back for nonempty slots, including reused descriptions', () => {
    const p = fixture();
    const slot = h('b', {}, 'slot');
    p.slots([slot]);
    p.parentNow();
    expect(p.host.querySelector('b')!.textContent).toBe('slot');
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.trace.length = 0;
    p.slots([]);
    p.parentNow();
    expect(p.host.querySelector('b')).toBeNull();
    expect(p.trace.splice(0)).toEqual(['pre', 'render', 'post']);
    p.parentNow();
    expect(p.trace).toEqual([]);
    p.dispose();
  });

  it.each(['accessor', 'symbol', 'frozen', 'sealed', 'prototype'])(
    'falls back for %s props without extra getter reads',
    kind => {
      const p = fixture();
      let reads = 0;
      let props: Props = { label: 'before', ignored: 0 };
      if (kind === 'accessor') {
        Object.defineProperty(props, 'label', {
          enumerable: true,
          get: () => {
            reads++;
            return 'before';
          },
        });
      } else if (kind === 'symbol') {
        Object.assign(props, { [Symbol('input')]: 1 });
      } else if (kind === 'frozen') {
        props = Object.freeze(props);
      } else if (kind === 'sealed') {
        props = Object.seal(props);
      } else {
        props = Object.assign(Object.create({ extra: 1 }), props);
      }
      p.props(props);
      p.parentNow();
      expect(p.trace).toEqual(['pre', 'render', 'post']);
      expect(reads).toBe(kind === 'accessor' ? 1 : 0);
      p.dispose();
    }
  );

  it.each([
    { order: 'parent-child', miss: false, runs: 1 },
    { order: 'child-parent', miss: false, runs: 1 },
    { order: 'parent-child', miss: true, runs: 1 },
    { order: 'child-parent', miss: true, runs: 2 },
  ])(
    'preserves $order batching with miss=$miss',
    async ({ order, miss, runs }) => {
      const p = fixture();
      p.edit();
      if (miss) p.props({ label: 'after', ignored: 0 });
      if (order === 'parent-child') {
        p.parent();
        p.child();
      } else {
        p.child();
        p.parent();
      }
      await nextTick();
      expect(p.trace).toEqual(
        Array.from({ length: runs }, () => ['pre', 'render', 'post']).flat()
      );
      expect(p.input.value).toBe(`${miss ? 'after' : 'before'}:1`);
      p.trace.length = 0;
      p.parentNow();
      expect(p.trace).toEqual([]);
      p.dispose();
    }
  );

  it('keeps the latest generation when the post callback renews again', async () => {
    const p = fixture();
    p.edit();
    p.requeue();
    p.child();
    await nextTick();
    expect(p.trace).toEqual(['pre', 'render', 'post', 'pre', 'render', 'post']);
    expect(p.input.value).toBe('before:2');
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toEqual([]);
    expect(p.input.value).toBe('before:2');
    p.dispose();
  });

  it.each(['selector', 'pre', 'render', 'post'] as const)(
    'forces a miss after %s failure even with unchanged dependencies',
    stage => {
      const p = fixture();
      p.fail(stage);
      expect(() => p.childNow()).toThrow(stage);
      p.fail(undefined);
      p.trace.length = 0;
      p.parentNow();
      // The baseline does not roll back its hook cursor/queued callback when
      // output evaluation throws. Memo invalidation must still force a render.
      expect(p.trace).toEqual(
        stage === 'render' || stage === 'selector'
          ? ['render', 'post']
          : ['pre', 'render', 'post']
      );
      p.trace.length = 0;
      p.parentNow();
      expect(p.trace).toEqual([]);
      p.dispose();
    }
  );

  it('invalidates a throwing parent comparison and retries from the previous tree', () => {
    const p = fixture();
    const previous = p.parentNode();
    p.fail('selector');
    expect(() => p.parentNow()).toThrow('selector');
    p.fail(undefined);
    p.trace.length = 0;
    // Public replaceWDom can retry from the unretired previous tree. Base
    // does not transactionally restore its published parent after diff throws.
    redrawNode(previous);
    expect(p.trace).toEqual(['pre', 'render', 'post']);
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toEqual([]);
    p.dispose();
  });

  it('preserves the baseline callback behavior after an updater throws', () => {
    const baseline = fixture(undefined, false);
    baseline.fail('render');
    expect(() => baseline.childNow()).toThrow('render');
    baseline.fail(undefined);
    baseline.trace.length = 0;
    baseline.parentNow();
    expect(baseline.trace).toEqual(['render', 'post']);
    baseline.dispose();
  });

  it('does not resurrect a removed child or retain a live memo hit', async () => {
    const p = fixture();
    p.remove();
    p.parent();
    p.child();
    await nextTick();
    expect(p.trace).toEqual(['unmount']);
    expect(p.host.querySelector('input')).toBeNull();
    expect(p.child()).toBe(false);
    p.dispose();
  });

  it('leaves undeclared input changes to the caller until self renew', () => {
    const p = fixture(() => []);
    p.props({ label: 'after', ignored: 0 });
    p.parentNow();
    expect(p.trace).toEqual([]);
    expect(p.held().label).toBe('after');
    expect(p.input.value).toBe('before:0');
    p.childNow();
    expect(p.input.value).toBe('after:0');
    p.dispose();
  });

  it('snapshots the input after the pre callback changes it', () => {
    let version = 0;
    let parentKey: CompKey;
    let childKey: CompKey;
    let runs = 0;
    const Child = mount(() => {
      childKey = getComponentKey()!;
      useParentMemo(() => [version]);
      updateCallback(() => {
        version++;
      });
      return () => <b>{`${++runs}:${version}`}</b>;
    });
    const Parent = mount(() => {
      parentKey = getComponentKey()!;
      return () => (
        <div>
          <Child />
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    redrawNow(childKey!);
    redrawNow(parentKey!);
    expect(host.textContent).toBe('2:1');
    expect(runs).toBe(2);
    dispose();
  });

  it('does not publish an output whose DOM update throws', () => {
    const p = fixture();
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!;
    let failOnce = true;
    const setter = vi
      .spyOn(p.input, 'value', 'set')
      .mockImplementation(function (this: HTMLInputElement, value: string) {
        if (failOnce) {
          failOnce = false;
          throw Error('DOM setter');
        }
        descriptor.set!.call(this, value);
      });
    p.edit();
    expect(() => p.childNow()).toThrow('DOM setter');
    setter.mockRestore();
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toContain('render');
    expect(p.input.value).toBe('before:1');
    p.trace.length = 0;
    p.parentNow();
    expect(p.trace).toEqual([]);
    p.dispose();
  });

  it('does not publish an eager output or a failed initial mount', () => {
    let shouldThrow = true;
    let runs = 0;
    let parentKey: CompKey;
    const Child = mount(() => {
      useParentMemo(() => []);
      mountCallback(() => {
        if (shouldThrow) throw Error('mount');
      });
      return () => <b>{++runs}</b>;
    });
    const Parent = mount(() => {
      parentKey = getComponentKey()!;
      return () => (
        <div>
          <Child />
        </div>
      );
    });
    const tree = <Parent />;
    expect(runs).toBe(1);
    const host = document.createElement('div');
    expect(() => render(tree, host)).toThrow('mount');
    shouldThrow = false;
    redrawNode(tree);
    expect(host.textContent).toBe('2');
    redrawNow(parentKey!);
    expect(runs).toBe(2);
    // A throwing initial render returns no disposer. Clean the test's live
    // tree explicitly rather than leaving its component entries registered.
    const live = getComponentSubInfo(parentKey!, 'vd')!.value!;
    runUnmountQueueFromWDom(live);
    host.textContent = '';
  });

  it('retains state, DOM, and self renew through keyed moves and replacement', async () => {
    let ids = [1, 2, 3];
    let alternate = false;
    let parent: Renew = () => false;
    let runs = 0;
    let mounts = 0;
    let unmounts = 0;
    const renews = new Map<number, () => void>();
    const Row = mount<{ id: number; key?: number }>((renew, props) => {
      let count = 0;
      useParentMemo<{ id: number }>(next => [next.id]);
      renews.set(props.id, () => {
        count++;
        renew();
      });
      mountCallback(() => {
        mounts++;
        return () => {
          unmounts++;
        };
      });
      return () => {
        runs++;
        return <input data-id={props.id} value={`${props.id}:${count}`} />;
      };
    });
    const Other = mount<{ id: number; key?: number }>(() => () => (
      <em>other</em>
    ));
    const List = mount(renew => {
      parent = renew;
      return () => (
        <div>
          {ids.map(id =>
            alternate ? <Other key={id} id={id} /> : <Row key={id} id={id} />
          )}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<List />, host);
    const nodes = [...host.querySelectorAll('input')];
    ids = [3, 1, 2];
    parent();
    await nextTick();
    expect(runs).toBe(3);
    expect([...host.querySelectorAll('input')]).toEqual([
      nodes[2],
      nodes[0],
      nodes[1],
    ]);
    renews.get(1)!();
    await nextTick();
    expect(nodes[0].value).toBe('1:1');
    ids = [2, 1];
    parent();
    await nextTick();
    expect(runs).toBe(4);
    expect(mounts).toBe(3);
    expect(unmounts).toBe(1);
    alternate = true;
    parent();
    await nextTick();
    expect(host.textContent).toBe('otherother');
    expect(unmounts).toBe(3);
    dispose();
  });

  it('creates independent memo instances for a description used twice', async () => {
    const renews: (() => void)[] = [];
    let parent: Renew = () => false;
    let runs = 0;
    let unmounts = 0;
    const Child = mount(renew => {
      let count = 0;
      useParentMemo(() => []);
      renews.push(() => {
        count++;
        renew();
      });
      mountCallback(() => () => {
        unmounts++;
      });
      return () => {
        runs++;
        return <b>{count}</b>;
      };
    });
    const description = <Child />;
    const Parent = mount(renew => {
      parent = renew;
      return () => (
        <div>
          {description}
          {description}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    expect(renews).toHaveLength(2);
    expect(runs).toBe(2);
    renews[0]();
    await nextTick();
    parent();
    await nextTick();
    expect(host.textContent).toBe('10');
    expect(runs).toBe(3);
    dispose();
    expect(unmounts).toBe(2);
  });

  it('removes child registrations when their enclosing initialization fails', () => {
    let orphan: WDom;
    let runs = 0;
    let parentKey: CompKey;
    const Child = mount(() => {
      useParentMemo(() => []);
      return () => <b>{++runs}</b>;
    });
    const Failed = mount(() => () => {
      orphan = <Child />;
      throw Error('initialization');
    });
    expect(() => h(Failed, {})).toThrow('initialization');
    let first = true;
    const Parent = mount(() => {
      parentKey = getComponentKey()!;
      return () => <div>{first ? orphan : <Child />}</div>;
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    first = false;
    redrawNow(parentKey!);
    // The recovered orphan renders normally, without the registration from
    // the failed enclosing initialization being published during adoption.
    expect(runs).toBe(2);
    dispose();
  });
});

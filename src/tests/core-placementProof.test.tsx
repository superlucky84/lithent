import { describe, expect, it } from 'vitest';
import * as core from '@/index';
import {
  Fragment,
  getComponentKey,
  h,
  mount,
  mountCallback,
  nextTick,
  portal,
  render,
  replaceWDom,
  getComponentSubInfo,
  updateCallback,
} from '@/index';
import type { CompKey, WDom } from '@/types';

const isConcurrent = 'deferRender' in core;

// Baseline contracts for DC-17; these also run on the unchanged concurrent core.
describe('keyed placement proof baseline', () => {
  it('preserves children access order relative to original key-map reads', async () => {
    const trace: string[] = [];
    let refresh = () => {};
    let phase = 'old';
    const Parent = mount(renew => {
      refresh = renew;
      return () => {
        const source = phase;
        let children = [0, 1].map(key =>
          h(
            'b',
            {
              get key() {
                trace.push(`${source}:${key}`);
                return key;
              },
            },
            key
          )
        );
        const loop: WDom = {
          type: 'l',
          get children() {
            trace.push('children');
            return children;
          },
          set children(value) {
            children = value || [];
          },
        };
        return <section>{loop}</section>;
      };
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    const original = [...host.querySelectorAll('b')];
    trace.length = 0;
    phase = 'next';
    refresh();
    await nextTick();
    const lastOriginalKey = trace.indexOf('old:1');
    expect(lastOriginalKey).toBeGreaterThan(-1);
    // Base reads the next children array after building the original key Map.
    // Concurrent captures its children before building that Map.
    expect(trace[lastOriginalKey + 1] === 'children').toBe(!isConcurrent);
    expect(host.textContent).toBe('01');
    expect([...host.querySelectorAll('b')]).toEqual(original);
    dispose();
  });

  it('preserves same-order falsy, NaN, object and Symbol keys and local state', async () => {
    const keys: unknown[] = [0, false, '', NaN, {}, Symbol('row')];
    let version = 0;
    let refresh = () => {};
    const updates: (() => void)[] = [];
    const removed: number[] = [];
    const Row = mount<{ key?: unknown; id: number; version: number }>(
      (renew, props) => {
        const id = props.id;
        let local = 0;
        updates[id] = () => {
          local++;
          renew();
        };
        mountCallback(() => () => removed.push(id));
        return () => <input value={`${props.version}:${id}:${local}`} />;
      }
    );
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {keys.map((key, id) => (
            <Row key={key} id={id} version={version} />
          ))}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const inputs = [...host.querySelectorAll('input')];
    for (version = 1; version <= 3; version++) {
      refresh();
      await nextTick();
      expect([...host.querySelectorAll('input')]).toEqual(inputs);
      expect(inputs.map(input => input.value)).toEqual(
        keys.map((_, id) => `${version}:${id}:0`)
      );
      expect(removed).toEqual([]);
    }
    updates[0]();
    updates[5]();
    await nextTick();
    expect(inputs[0].value).toBe('3:0:1');
    expect(inputs[5].value).toBe('3:5:1');
    dispose();
    expect(removed.sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('consumes only the first duplicate even when order and length stay equal', async () => {
    let refresh = () => {};
    let version = 0;
    let created = 0;
    const removed: number[] = [];
    const Row = mount<{ key?: unknown; label: string }>((_renew, props) => {
      const id = ++created;
      mountCallback(() => () => removed.push(id));
      return () => <b data-instance={id}>{props.label}</b>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {[0, 1].map(id => (
            <Row key="duplicate" label={`${version}:${id}`} />
          ))}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const first = host.querySelector('b');
    for (version = 1; version <= 2; version++) {
      refresh();
      await nextTick();
      expect(host.querySelector('b')).toBe(first);
      expect(
        [...host.querySelectorAll('b')].map(node => node.textContent)
      ).toEqual([`${version}:0`, `${version}:1`]);
      expect(removed).toEqual(version === 1 ? [2] : [2, 3]);
    }
    dispose();
    expect(removed.sort()).toEqual([1, 2, 3, 4]);
  });

  it('handles mixed keys, empty children, tag replacement and changed keys', async () => {
    let refresh = () => {};
    let phase = 0;
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          {phase === 0
            ? [<b key="a">a</b>, null, <i>u</i>, <b key="b">b</b>]
            : phase === 1
              ? [<b key="a">A</b>, null, <i>U</i>, <em key="b">B</em>]
              : phase === 2
                ? [null, <b key="new">N</b>, <i>V</i>, <em key="b">C</em>]
                : []}
          <footer>end</footer>
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const first = host.querySelector('b');
    const unkeyed = host.querySelector('i');
    for (phase = 1; phase <= 3; phase++) {
      refresh();
      await nextTick();
      expect(host.textContent).toBe(['', 'AUBend', 'NVCend', 'end'][phase]);
      if (phase < 3) expect(host.querySelector('i')).toBe(unkeyed);
      if (phase === 1) expect(host.querySelector('b')).toBe(first);
    }
    dispose();
  });

  it('preserves each core matching time when a pre-callback mutates a later key', async () => {
    let refresh = () => {};
    let laterProps = { key: 'late', id: 'late' };
    let updating = false;
    let instances = 0;
    const removed: number[] = [];
    const trace: string[] = [];
    const Row = mount<{ key?: unknown; id: string }>((_renew, props) => {
      const instance = ++instances;
      updateCallback(() => {
        trace.push(`pre:${props.id}`);
        if (props.id === 'first') laterProps.key = 'changed';
      });
      mountCallback(() => () => removed.push(instance));
      return () => {
        if (updating) trace.push(`render:${props.id}:${instance}`);
        return <b data-instance={instance}>{props.id}</b>;
      };
    });
    const App = mount(renew => {
      refresh = renew;
      return () => {
        const first = <Row key="first" id="first" />;
        const later = <Row key="late" id="late" />;
        laterProps = later.props as typeof laterProps;
        return <div>{[first, later]}</div>;
      };
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const previous = [...host.querySelectorAll('b')];
    updating = true;
    refresh();
    await nextTick();
    // Concurrent prepares its key matches before running these callbacks;
    // base reads each later key only after the previous updater has run.
    expect(trace).toEqual(
      isConcurrent
        ? ['pre:first', 'render:first:1', 'pre:late', 'render:late:2']
        : ['pre:first', 'render:first:1', 'render:late:3']
    );
    expect(host.querySelector('b')).toBe(previous[0]);
    expect(host.querySelectorAll('b')[1] === previous[1]).toBe(isConcurrent);
    expect(removed).toEqual(isConcurrent ? [] : [2]);
    dispose();
    expect(removed.sort()).toEqual(isConcurrent ? [1, 2] : [1, 2, 3]);
  });

  it('preserves keyed component identity across fragment output arity changes', async () => {
    let refresh = () => {};
    let count = 1;
    const mounted: string[] = [];
    const Part = mount<{ key?: unknown; label: string }>((_renew, props) => {
      mountCallback(() => {
        mounted.push(props.label);
      });
      return () => <i>{props.label}</i>;
    });
    const Row = mount<{ key?: unknown; id: number }>((_renew, props) => () => (
      <>
        <b>{props.id}</b>
        {Array.from({ length: count }, (_, i) => (
          <Part key={i} label={`${props.id}:${i}`} />
        ))}
      </>
    ));
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          {[1, 2].map(id => (
            <Row key={id} id={id} />
          ))}
          <footer>end</footer>
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const anchors = [...host.querySelectorAll('b')];
    mounted.length = 0;
    count = 2;
    refresh();
    await nextTick();
    expect(host.textContent).toBe('11:01:122:02:1end');
    expect(mounted).toEqual(['1:1', '2:1']);
    count = 0;
    refresh();
    await nextTick();
    expect(host.textContent).toBe('12end');
    expect([...host.querySelectorAll('b')]).toEqual(anchors);
    dispose();
  });

  it('keeps portal hosts and external siblings while keyed contents change', async () => {
    let refresh = () => {};
    let version = 0;
    const host = document.createElement('div');
    const external = document.createElement('aside');
    const after = document.createElement('footer');
    after.textContent = 'external';
    host.appendChild(after);
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <>
          {[
            <b key="a">{version}</b>,
            portal(<i>{version}</i>, external),
            <b key="b">{version + 1}</b>,
          ]}
        </>
      );
    });
    const dispose = render(<App />, host, after);
    const initial = [...host.querySelectorAll('b')];
    for (version = 1; version <= 2; version++) {
      refresh();
      await nextTick();
      expect([...host.querySelectorAll('b')]).toEqual(initial);
      expect(host.textContent).toBe(`${version}${version + 1}external`);
      expect(external.textContent).toBe(String(version));
      expect(host.lastChild).toBe(after);
    }
    dispose();
    expect(host.textContent).toBe('external');
  });

  it('does not reinsert focused same-order inputs and permits later self renew', async () => {
    let refresh = () => {};
    let local = 0;
    const updates: (() => void)[] = [];
    const Row = mount<{ key?: unknown; id: number }>((renew, props) => {
      updates[props.id] = renew;
      return () => <input value={`${props.id}:${local}`} />;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {[0, 1].map(id => (
            <Row key={id} id={id} />
          ))}
        </div>
      );
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const dispose = render(<App />, host);
    try {
      const input = host.querySelectorAll('input')[1];
      input.focus();
      input.setSelectionRange(1, 2);
      refresh();
      await nextTick();
      expect(document.activeElement).toBe(input);
      expect(input.selectionStart).toBe(1);
      local++;
      updates[1]();
      await nextTick();
      expect(input.value).toBe('1:1');
      expect(document.activeElement).toBe(input);
    } finally {
      dispose();
      host.remove();
    }
  });

  it('keeps left-to-right post callbacks and a self renew queued from them', async () => {
    const trace: string[] = [];
    let refresh = () => {};
    let requeue = false;
    const Row = mount<{ key?: unknown; id: number }>((renew, props) => {
      let count = 0;
      updateCallback(() => {
        trace.push(`pre:${props.id}`);
        return () => {
          trace.push(`post:${props.id}:${count}`);
          if (props.id === 0 && requeue) {
            requeue = false;
            count++;
            renew();
          }
        };
      });
      return () => <b>{`${props.id}:${count}`}</b>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {[0, 1].map(id => (
            <Row key={id} id={id} />
          ))}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    requeue = true;
    refresh();
    await nextTick();
    expect(trace).toEqual([
      'pre:0',
      'pre:1',
      'post:0:0',
      'post:1:0',
      'pre:0',
      'post:0:1',
    ]);
    expect(host.textContent).toBe('0:11:0');
    dispose();
  });

  it('recovers a queued sibling and later same-order updates after a diff throws', async () => {
    let fail = false;
    let refresh = () => {};
    let siblingRefresh = () => {};
    let version = 0;
    const Row = mount<{ key?: unknown; id: number }>((_renew, props) => () => (
      <b>{props.id}</b>
    ));
    const Fail = mount(() => () => {
      if (fail) throw Error('placement proof diff failure');
      return <i>safe</i>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          {[0, 1].map(id => (
            <Row key={id} id={id} />
          ))}
          <Fail />
        </section>
      );
    });
    const Sibling = mount(renew => {
      siblingRefresh = renew;
      return () => <em>{version}</em>;
    });
    const host = document.createElement('div');
    const dispose = render(
      <div>
        <App />
        <Sibling />
      </div>,
      host
    );
    const errors: unknown[] = [];
    const onError = (error: unknown) => errors.push(error);
    process.on('uncaughtException', onError);
    try {
      fail = true;
      refresh();
      version++;
      siblingRefresh();
      await new Promise(resolve => setTimeout(resolve));
      expect(errors).toEqual([Error('placement proof diff failure')]);
      expect(host.querySelector('em')?.textContent).toBe('1');
      // Failed parent trees are not automatically rolled back by either core.
      // Verify recovery on the still-live sibling, without inventing that contract.
      fail = false;
      version++;
      siblingRefresh();
      await nextTick();
      expect(host.querySelector('em')?.textContent).toBe('2');
    } finally {
      process.off('uncaughtException', onError);
      dispose();
    }
  });

  it('allows synchronous wrapper replacement from a post callback', async () => {
    let refresh = () => {};
    let nestedKey: CompKey | null = null;
    let count = 0;
    let replace = false;
    const Nested = mount<{ label?: unknown }>((_renew, props) => {
      nestedKey = getComponentKey();
      return () => <i>{`${props.label}:${count}`}</i>;
    });
    const Row = mount<{ key?: unknown; id: number }>((_renew, props) => {
      updateCallback(() => () => {
        if (props.id === 0 && replace) {
          replace = false;
          count++;
          const previous = getComponentSubInfo(nestedKey!, 'vd')!.value!;
          replaceWDom(
            Nested,
            previous.compProps!,
            previous.compChild!,
            previous
          );
        }
      });
      return () => <b>{props.id}</b>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          {[0, 1].map(id => (
            <Row key={id} id={id} />
          ))}
          <Nested label="n" />
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    replace = true;
    refresh();
    await nextTick();
    expect(host.textContent).toBe('01n:1');
    refresh();
    await nextTick();
    expect(host.textContent).toBe('01n:1');
    dispose();
  });
});

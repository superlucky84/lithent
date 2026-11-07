import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  componentMap,
  disposeComponentEntry,
  getComponentKey,
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  setComponentMapManualMode,
} from '@/index';
import type { CompKey, Props } from '@/index';

// The concurrent runner applies its own alias table to this same suite.
let reported: unknown[];
beforeEach(() => {
  reported = [];
  vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
});
afterEach(() => {
  setComponentMapManualMode(false);
  vi.unstubAllGlobals();
});
const settle = async () => {
  await nextTick();
  await nextTick();
};

describe('cleanup errors do not interrupt teardown', () => {
  it('finishes remaining, nested and sibling cleanups before reporting the original error', async () => {
    const calls: string[] = [];
    const keys: CompKey[] = [];
    const host = document.createElement('div');
    const boom = new Error('parent cleanup');
    const make = (name: string) =>
      mount(() => {
        keys.push(getComponentKey()!);
        mountCallback(() => () => calls.push(name));
        return () => h('p', {}, name);
      });
    const Child = make('child');
    const Sibling = make('sibling');
    const Parent = mount(() => {
      keys.push(getComponentKey()!);
      mountCallback(() => () => {
        calls.push('throwing');
        throw boom;
      });
      mountCallback(() => () => calls.push('remaining'));
      return () => h('section', {}, h(Child, {}));
    });
    const observations: [unknown, string, boolean][] = [];
    vi.stubGlobal('reportError', (error: unknown) => {
      observations.push([
        error,
        host.innerHTML,
        keys.some(key => componentMap.has(key)),
      ]);
    });
    const destroy = render(h('div', {}, h(Parent, {}), h(Sibling, {})), host);

    expect(destroy).not.toThrow();
    expect(calls).toEqual(['throwing', 'remaining', 'child', 'sibling']);
    expect(host.innerHTML).toBe('');
    expect(keys.every(key => !componentMap.has(key))).toBe(true);
    expect(observations).toEqual([]);
    await settle();
    expect(observations).toEqual([[boom, '', false]]);
  });

  it('runs duplicate registrations once each and never retries their failed cleanup', async () => {
    const boom = new Error('duplicate cleanup');
    const cleanup = vi.fn(() => {
      throw boom;
    });
    const remaining = vi.fn();
    const App = mount(() => {
      mountCallback(() => cleanup);
      mountCallback(() => cleanup);
      mountCallback(() => remaining);
      return () => h('p', {}, 'app');
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    destroy();
    destroy();
    await settle();

    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(remaining).toHaveBeenCalledOnce();
    expect(reported).toEqual([boom, boom]);
    expect(host.innerHTML).toBe('');
  });

  it('keeps the surviving keyed row while removing every retired row', async () => {
    const boom = new Error('row cleanup');
    const cleanups: number[] = [];
    let ids = [1, 2, 3];
    let renew = () => {};
    const Row = mount<Props>((_renew, props) => {
      const id = props.id as number;
      mountCallback(() => () => {
        cleanups.push(id);
        if (id === 1) throw boom;
      });
      return () => h('li', {}, String(id));
    });
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'ul',
          {},
          ids.map(id => h(Row, { id, key: id }))
        );
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    const survivor = host.querySelectorAll('li')[2];
    ids = [3];
    renew();
    await settle();

    expect([...host.querySelectorAll('li')]).toEqual([survivor]);
    expect(cleanups).toEqual([1, 2]);
    expect(reported).toEqual([boom]);
    destroy();
    expect(cleanups).toEqual([1, 2, 3]);
  });

  it('replaces a throwing component and releases its persistent portal handler', async () => {
    const boom = new Error('portal cleanup');
    const target = document.createElement('div');
    const external = vi.fn();
    const owned = vi.fn();
    target.addEventListener('click', external);
    let replace = false;
    let renew = () => {};
    const Old = mount(() => {
      mountCallback(() => () => {
        throw boom;
      });
      return () =>
        h('portal', { portal: target, onClick: owned }, h('b', {}, 'old'));
    });
    const New = mount(() => () => h('p', {}, 'new'));
    const App = mount(bump => {
      renew = bump;
      return () => h('section', {}, h(replace ? New : Old, { key: 'row' }));
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    target.click();
    expect(owned).toHaveBeenCalledOnce();
    replace = true;
    renew();
    await settle();
    target.click();

    expect(host.textContent).toBe('new');
    expect(target.innerHTML).toBe('');
    expect(owned).toHaveBeenCalledOnce();
    expect(external).toHaveBeenCalledTimes(2);
    expect(reported).toEqual([boom]);
    destroy();
  });

  it('preserves manual map ownership until explicit disposal', async () => {
    const boom = new Error('manual cleanup');
    let key: CompKey;
    const remaining = vi.fn();
    const App = mount(() => {
      key = getComponentKey()!;
      mountCallback(() => () => {
        throw boom;
      });
      mountCallback(() => remaining);
      return () => h('p', {}, 'manual');
    });
    setComponentMapManualMode(true);
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    destroy();
    expect(host.innerHTML).toBe('');
    expect(componentMap.has(key!)).toBe(true);
    expect(() => disposeComponentEntry(key!)).not.toThrow();
    await settle();

    expect(componentMap.has(key!)).toBe(false);
    expect(remaining).toHaveBeenCalledOnce();
    expect(reported).toEqual([boom]);
  });

  it('finishes explicit disposal even if an owned cleanup throws', async () => {
    const boom = new Error('explicit disposal');
    let key: CompKey;
    const remaining = vi.fn();
    const App = mount(() => {
      key = getComponentKey()!;
      mountCallback(() => () => {
        throw boom;
      });
      mountCallback(() => remaining);
      return () => h('p', {}, 'mounted');
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    expect(() => disposeComponentEntry(key!)).not.toThrow();
    expect(componentMap.has(key!)).toBe(false);
    expect(remaining).toHaveBeenCalledOnce();
    destroy();
    await settle();
    expect(host.innerHTML).toBe('');
    expect(reported).toEqual([boom]);
  });

  it('does not run the same cleanup again when destroy reenters teardown', async () => {
    const boom = new Error('reentrant cleanup');
    const first = vi.fn();
    const remaining = vi.fn();
    const childCleanup = vi.fn();
    let destroy = () => {};
    let reentered = false;
    const Child = mount(() => {
      mountCallback(() => childCleanup);
      return () => h('b', {}, 'child');
    });
    const App = mount(() => {
      mountCallback(() => () => {
        first();
        if (!reentered) {
          reentered = true;
          destroy();
        }
        throw boom;
      });
      mountCallback(() => remaining);
      return () => h('div', {}, h(Child, {}));
    });
    const host = document.createElement('div');
    destroy = render(h(App, {}), host);
    expect(destroy).not.toThrow();
    await settle();
    expect(host.innerHTML).toBe('');
    expect(first).toHaveBeenCalledOnce();
    expect(remaining).toHaveBeenCalledOnce();
    expect(childCleanup).toHaveBeenCalledOnce();
    expect(reported).toEqual([boom]);
  });

  it('preserves non-Error thrown values without losing later cleanup', async () => {
    const values = [undefined, null, 0, 'cleanup', Symbol('cleanup')];
    const remaining = vi.fn();
    const App = mount(() => {
      values.forEach(value =>
        mountCallback(() => () => {
          throw value;
        })
      );
      mountCallback(() => remaining);
      return () => h('p', {}, 'app');
    });
    const destroy = render(h(App, {}), document.createElement('div'));
    destroy();
    await settle();
    expect(reported).toEqual(values);
    expect(remaining).toHaveBeenCalledOnce();
  });

  it.each(['missing', 'throws', 'not callable'])(
    'throws the original error after teardown when reportError is %s',
    kind => {
      const boom = new Error('original cleanup');
      const tasks: (() => void)[] = [];
      vi.stubGlobal('queueMicrotask', (task: () => void) => tasks.push(task));
      vi.stubGlobal(
        'reportError',
        kind === 'throws'
          ? () => {
              throw new Error('broken reporter');
            }
          : kind === 'not callable'
            ? 1
            : undefined
      );
      const remaining = vi.fn();
      const App = mount(() => {
        mountCallback(() => () => {
          throw boom;
        });
        mountCallback(() => remaining);
        return () => h('p', {}, 'app');
      });
      const host = document.createElement('div');
      const destroy = render(h(App, {}), host);
      expect(destroy).not.toThrow();
      expect(host.innerHTML).toBe('');
      expect(remaining).toHaveBeenCalledOnce();
      expect(tasks).toHaveLength(1);
      let caught: unknown;
      try {
        tasks[0]();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBe(boom);
    }
  );
});

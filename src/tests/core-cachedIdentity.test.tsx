import { describe, expect, it } from 'vitest';
import {
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  updateCallback,
} from '@/index';
import type { WDom } from '@/types';

describe('cached VDOM identity', () => {
  it('runs component update callbacks on cache hits and leaves reused props intact', async () => {
    let bump = () => {};
    let renders = 0;
    let updates = 0;
    let unmounts = 0;
    const props = Object.freeze({ title: 'cached' });
    let cached = h('span', props, '0');
    const App = mount(renew => {
      bump = renew;
      mountCallback(() => () => {
        unmounts++;
      });
      updateCallback(() => {
        updates++;
      });
      return () => {
        renders++;
        return cached;
      };
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const span = host.querySelector('span');

    for (let index = 0; index < 3; index++) {
      bump();
      await nextTick();
    }
    expect(renders).toBe(4);
    expect(updates).toBe(3);
    expect(host.querySelector('span')).toBe(span);
    expect(host.textContent).toBe('0');

    cached = h('span', props, '1');
    bump();
    await nextTick();
    expect(renders).toBe(5);
    expect(updates).toBe(4);
    expect(host.querySelector('span')).toBe(span);
    expect(host.textContent).toBe('1');
    expect(props).toEqual({ title: 'cached' });
    expect(unmounts).toBe(0);
    dispose();
    expect(unmounts).toBe(1);
  });

  it('keeps cached keyed subtree identity and child renew after moves and deletion', async () => {
    let rows = [1, 2, 3];
    let bump = () => {};
    const views = new Map<number, WDom>();
    const unmounted: number[] = [];
    const mounted: number[] = [];
    const Counter = mount<{ id: number }>((renew, props) => {
      let count = 0;
      mountCallback(() => {
        mounted.push(props.id);
        return () => unmounted.push(props.id);
      });
      return () => (
        <button
          onClick={() => {
            count++;
            renew();
          }}
        >
          {`${props.id}:${count}`}
        </button>
      );
    });
    const view = (id: number) => {
      if (!views.has(id)) {
        views.set(
          id,
          <section key={id} data-id={id}>
            <Counter id={id} />
          </section>
        );
      }
      return views.get(id) as WDom;
    };
    const List = mount(renew => {
      bump = renew;
      return () => <div>{rows.map(view)}</div>;
    });
    const host = document.createElement('div');
    const dispose = render(<List />, host);
    const original = [...host.querySelectorAll('section')];
    const update = async (next: number[]) => {
      rows = next;
      bump();
      await nextTick();
    };

    await update([1, 2, 3]);
    await update([3, 1, 2]);
    expect([...host.querySelectorAll('section')]).toEqual([
      original[2],
      original[0],
      original[1],
    ]);
    original[0].querySelector('button')?.click();
    await nextTick();
    expect(original[0].textContent).toBe('1:1');
    expect(host.querySelector('[data-id="1"]')).toBe(original[0]);
    expect(mounted).toEqual([1, 2, 3]);
    expect(unmounted).toEqual([]);

    await update([3, 1]);
    expect([...host.querySelectorAll('section')]).toEqual([
      original[2],
      original[0],
    ]);
    expect(unmounted).toEqual([2]);
    original[0].querySelector('button')?.click();
    await nextTick();
    expect(original[0].textContent).toBe('1:2');
    dispose();
    expect(unmounted).toEqual([2, 3, 1]);
  });

  it('still deletes an identical node whose type becomes empty', async () => {
    const cached = (<span>removed</span>) as WDom;
    let bump = () => {};
    const App = mount(renew => {
      bump = renew;
      return () => cached;
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    expect(host.textContent).toBe('removed');

    cached.type = null;
    bump();
    await nextTick();
    expect(host.innerHTML).toBe('');
    dispose();
  });
});

import { describe, expect, it } from 'vitest';
import {
  getComponentKey,
  getComponentSubInfo,
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  replaceWDom,
} from '@/index';
import type { CompKey, WDom } from '@/types';

describe('component replacement positions', () => {
  it('keeps local state and DOM after repeated renews, reorder, insert and removal', async () => {
    let order = [0, 1, 2, 3];
    let refresh = () => {};
    const updates = new Map<number, () => void>();
    const unmounted: number[] = [];
    const Row = mount<{ key: number; id: number }>((renew, props) => {
      let count = 0;
      updates.set(props.id, () => {
        count++;
        renew();
      });
      mountCallback(() => () => unmounted.push(props.id));
      return () => <input data-id={props.id} value={`${props.id}:${count}`} />;
    });
    const List = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {order.map(id => (
            <Row key={id} id={id} />
          ))}
          <em>footer</em>
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<List />, host);
    const original = new Map(
      [...host.querySelectorAll('input')].map(input => [
        Number(input.dataset.id),
        input,
      ])
    );
    for (const id of [0, 3, 0, 3]) {
      updates.get(id)!();
      await nextTick();
    }
    expect(original.get(0)?.value).toBe('0:2');
    expect(original.get(3)?.value).toBe('3:2');

    order = [3, 1, 4, 0, 2];
    refresh();
    await nextTick();
    updates.get(3)!();
    updates.get(0)!();
    await nextTick();
    order = [4, 3, 0];
    refresh();
    await nextTick();
    updates.get(0)!();
    updates.get(3)!();
    await nextTick();

    expect([...host.querySelectorAll('input')].map(x => x.value)).toEqual([
      '4:0',
      '3:4',
      '0:4',
    ]);
    expect(host.querySelector('[data-id="0"]')).toBe(original.get(0));
    expect(host.querySelector('[data-id="3"]')).toBe(original.get(3));
    expect(host.querySelector('em')?.textContent).toBe('footer');
    expect(unmounted).toEqual([1, 2]);
    dispose();
    expect([...unmounted].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('retains first-occurrence synchronization when a slot array gains an earlier alias', async () => {
    let bump = () => {};
    let key: CompKey | null = null;
    let slots: WDom[] = [];
    const Child = mount(renew => {
      key = getComponentKey();
      let count = 0;
      bump = () => {
        count++;
        renew();
      };
      return () => <span>{count}</span>;
    });
    const Slot = mount((_renew, _props, children) => {
      slots = children;
      return () => <section>{children}</section>;
    });
    const host = document.createElement('div');
    const dispose = render(
      <Slot>
        <i>before</i>
        <Child />
      </Slot>,
      host
    );
    bump();
    await nextTick();
    const previous = getComponentSubInfo(key!, 'vd')!.value!;
    expect(slots[1]).toBe(previous);
    // The second occurrence still validates by identity. indexOf must update
    // the newly introduced first occurrence in this shared description array.
    slots[0] = previous;
    bump();
    await nextTick();
    const current = getComponentSubInfo(key!, 'vd')!.value!;
    expect(current).not.toBe(previous);
    expect(slots[0]).toBe(current);
    expect(slots[1]).toBe(previous);
    expect(host.querySelector('span')?.textContent).toBe('2');
    dispose();
  });

  it('keeps two uses of the same component description independent', async () => {
    const bumps: (() => void)[] = [];
    const cleanups: number[] = [];
    const Counter = mount(renew => {
      const id = bumps.length;
      let count = 0;
      bumps.push(() => {
        count++;
        renew();
      });
      mountCallback(() => () => cleanups.push(id));
      return () => <span>{count}</span>;
    });
    const shared = <Counter />;
    const host = document.createElement('div');
    const dispose = render(
      <div>
        {shared}
        {shared}
      </div>,
      host
    );
    const spans = [...host.querySelectorAll('span')];
    expect(bumps).toHaveLength(2);
    for (const id of [0, 1, 0, 1]) {
      bumps[id]();
      await nextTick();
    }
    expect([...host.querySelectorAll('span')]).toEqual(spans);
    expect(spans.map(span => span.textContent)).toEqual(['2', '2']);
    dispose();
    expect(cleanups.sort()).toEqual([0, 1]);
  });

  it('supports public replacement of a child without a component key', () => {
    const before = <i>before</i>;
    const root = (
      <section>
        {before}
        <em>footer</em>
      </section>
    );
    const host = document.createElement('div');
    const dispose = render(root, host);
    const section = host.querySelector('section');
    expect(before.compKey).toBeUndefined();
    const After = mount(() => () => <b>after</b>);
    replaceWDom(After, {}, [], before);
    expect(host.querySelector('section')).toBe(section);
    expect(host.innerHTML).toBe(
      '<section><b>after</b><em>footer</em></section>'
    );
    dispose();
  });
});

import { describe, expect, it } from 'vitest';
import { h, mount, mountCallback, nextTick, render } from '@/index';

describe('subtrees added during an update', () => {
  it('resolves new keyed components and preserves slots, renew and lifecycle after moves', async () => {
    let rows: number[] = [];
    let renewList = () => {};
    const mounted: number[] = [];
    const unmounted: number[] = [];
    const Child = mount<{ id: number; key: number }>(
      (renew, props, children) => {
        let clicks = 0;
        mountCallback(() => {
          mounted.push(props.id);
          return () => unmounted.push(props.id);
        });
        return () => (
          <section
            data-id={props.id}
            onClick={() => {
              clicks++;
              renew();
            }}
          >
            <b>{`${props.id}:${clicks}`}</b>
            <i>{children}</i>
          </section>
        );
      }
    );
    const List = mount(renew => {
      renewList = renew;
      return () => (
        <div>
          {rows.map(id => (
            <Child key={id} id={id}>
              {`slot-${id}`}
            </Child>
          ))}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<List />, host);
    const update = async (next: number[]) => {
      rows = next;
      renewList();
      await nextTick();
    };

    await update([1]);
    const first = host.querySelector('section') as HTMLElement;
    expect(first.textContent).toBe('1:0slot-1');
    expect(mounted).toEqual([1]);

    await update([1, 2]);
    const second = host.querySelector('[data-id="2"]') as HTMLElement;
    expect(second.textContent).toBe('2:0slot-2');
    expect(mounted).toEqual([1, 2]);

    await update([2, 1]);
    expect([...host.querySelectorAll('section')]).toEqual([second, first]);
    first.click();
    await nextTick();
    const updatedFirst = host.querySelector('[data-id="1"]');
    expect(updatedFirst).toBe(first);
    expect(first.textContent).toBe('1:1slot-1');
    expect([...host.querySelectorAll('section')]).toEqual([second, first]);
    expect(unmounted).toEqual([]);

    await update([2]);
    expect(unmounted).toEqual([1]);
    expect(host.querySelector('section')).toBe(second);
    dispose();
    expect(unmounted).toEqual([1, 2]);
  });
});

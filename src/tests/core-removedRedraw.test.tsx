import { describe, it, expect } from 'vitest';
import { h, render, mount, nextTick } from '@/index';

/**
 * A redraw that was queued before its component was removed must not draw the
 * component back in. Both renders sit in the same flush: the parent's removal
 * runs first (insertion order), then the child's stale entry.
 */
describe('a redraw queued for a component that is then removed', () => {
  it('does not resurrect a removed keyed row', async () => {
    let rows = [1, 2, 3, 4];
    let bumpList = () => {};
    const bumps = new Map<number, () => void>();

    const Row = mount<{ n: number; key?: number }>((renew, props) => {
      bumps.set(props.n, renew);
      return () => <i>{props.n}</i>;
    });
    const List = mount(renew => {
      bumpList = renew;
      return () => (
        <div>
          {rows.map(n => (
            <Row key={n} n={n} />
          ))}
        </div>
      );
    });

    const el = document.createElement('div');
    render(<List />, el);
    await nextTick();

    rows = [1, 2];
    bumpList();
    (bumps.get(3) as () => void)();
    (bumps.get(4) as () => void)();
    await nextTick();

    expect(
      Array.from(el.querySelectorAll('i')).map(n => n.textContent)
    ).toEqual(['1', '2']);
  });

  it('does not resurrect a conditionally removed child', async () => {
    let show = true;
    let bumpParent = () => {};
    let bumpChild = () => {};

    const Child = mount(renew => {
      bumpChild = renew;
      return () => <b>child</b>;
    });
    const Parent = mount(renew => {
      bumpParent = renew;
      return () => <div>{show ? <Child /> : <em>gone</em>}</div>;
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    await nextTick();

    show = false;
    bumpParent();
    bumpChild();
    await nextTick();

    expect(el.textContent).toBe('gone');
  });
});

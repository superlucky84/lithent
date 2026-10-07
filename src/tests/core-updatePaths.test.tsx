import { describe, it, expect } from 'vitest';
import * as core from '@/index';
import { h, Fragment, render, mount, nextTick } from '@/index';

// This suite also runs against the concurrent core (lithentConcurrent's
// vitest config aliases `@/index`).
const isConcurrent = 'deferRender' in core;

/**
 * Behaviour the update fast paths must keep (docs/benchmark/STATUS.md):
 * props are synced in place, the previous props object is never edited, the
 * redraw action is bound once per component, and a list of multi-root
 * components is removed without touching its neighbours.
 */
describe('update paths', () => {
  it('leaves a props object that is reused across renders untouched', async () => {
    const shared = { class: 'a', title: 't' };
    let count = 0;
    let bump = () => {};

    // The same object is handed to h() on every render.
    const Reuse = mount(renew => {
      bump = renew;
      return () => h('p', shared, String(count));
    });

    const el = document.createElement('div');
    render(<Reuse />, el);

    for (let i = 0; i < 3; i++) {
      count += 1;
      bump();
      await nextTick();
    }

    const p = el.querySelector('p') as HTMLElement;
    expect(shared).toEqual({ class: 'a', title: 't' });
    expect(p.getAttribute('class')).toBe('a');
    expect(p.getAttribute('title')).toBe('t');
    expect(p.textContent).toBe('3');
  });

  it('removes an attribute whose prop is gone and keeps the others', async () => {
    let props: Record<string, string> = { class: 'a', title: 't', id: 'x' };
    let bump = () => {};

    const Comp = mount(renew => {
      bump = renew;
      return () => h('p', props);
    });

    const el = document.createElement('div');
    render(<Comp />, el);
    const before = props;

    props = { class: 'b', id: 'x' };
    bump();
    await nextTick();

    const p = el.querySelector('p') as HTMLElement;
    expect(p.getAttribute('class')).toBe('b');
    expect(p.getAttribute('id')).toBe('x');
    expect(p.hasAttribute('title')).toBe(false);
    expect(before).toEqual({ class: 'a', title: 't', id: 'x' });
  });

  it('syncs component props in place: same object, removed keys gone', async () => {
    let next: Record<string, unknown> = { a: 1, b: 2 };
    let bump = () => {};
    const seen: Record<string, unknown>[] = [];
    let held: Record<string, unknown> | undefined;

    const Child = mount<Record<string, unknown>>((_renew, props) => {
      held = props;
      return () => {
        seen.push({ ...props });
        return <i>{Object.keys(props).join(',')}</i>;
      };
    });
    const Parent = mount(renew => {
      bump = renew;
      return () => (
        <div>
          <Child {...next} />
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);

    next = { a: 3, c: 4 };
    bump();
    await nextTick();

    expect(seen).toEqual([
      { a: 1, b: 2 },
      { a: 3, c: 4 },
    ]);
    expect(held).toEqual({ a: 3, c: 4 });
    expect('b' in (held as object)).toBe(false);
    expect(el.querySelector('i')!.textContent).toBe('a,c');
  });

  it('skips a redraw queued for a node its parent has already redrawn', async () => {
    let bumpParent = () => {};
    let bumpChild = () => {};
    let childRuns = 0;

    const Child = mount(renew => {
      bumpChild = renew;
      return () => {
        childRuns += 1;
        return <b>{childRuns}</b>;
      };
    });
    const Parent = mount(renew => {
      bumpParent = renew;
      return () => (
        <div>
          <Child />
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    expect(childRuns).toBe(1);

    // Parent first: its redraw re-renders the child, so the child's own
    // queued redraw is for a node that is no longer current.
    bumpParent();
    bumpChild();
    await nextTick();

    // The concurrent core does not skip it and renders the child once more.
    const afterBoth = isConcurrent ? 3 : 2;
    expect(childRuns).toBe(afterBoth);
    expect(el.querySelector('b')!.textContent).toBe(String(afterBoth));

    // The child can still redraw itself afterwards.
    bumpChild();
    await nextTick();
    expect(childRuns).toBe(afterBoth + 1);
    expect(el.querySelector('b')!.textContent).toBe(String(afterBoth + 1));
  });

  it('keeps renew bound after many renders', async () => {
    let bump = () => {};
    let n = 0;

    const Comp = mount(renew => {
      bump = renew;
      return () => <u>{n}</u>;
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    for (let i = 0; i < 5; i++) {
      n += 1;
      bump();
      await nextTick();
      expect(el.querySelector('u')!.textContent).toBe(String(n));
    }
  });

  describe('a list of components that each render two siblings', () => {
    const setup = (withNeighbours: boolean) => {
      let ids: number[] = [1, 2, 3];
      let bump = () => {};

      const Pair = mount<{ id: number; key?: number }>(
        (_renew, props) => () => (
          <Fragment>
            <dt>{props.id}</dt>
            <dd>{props.id}</dd>
          </Fragment>
        )
      );
      const List = mount(renew => {
        bump = renew;
        return () => (
          <dl>
            {withNeighbours ? <span>head</span> : null}
            {ids.map(id => (
              <Pair key={id} id={id} />
            ))}
            {withNeighbours ? <span>tail</span> : null}
          </dl>
        );
      });

      const el = document.createElement('div');
      render(<List />, el);

      return {
        el,
        set: async (nextIds: number[]) => {
          ids = nextIds;
          bump();
          await nextTick();
        },
        text: () =>
          Array.from(el.querySelector('dl')!.children).map(
            node => node.localName + ':' + node.textContent
          ),
      };
    };

    it('clears the list and leaves its neighbours', async () => {
      const list = setup(true);
      await list.set([]);
      expect(list.text()).toEqual(['span:head', 'span:tail']);

      await list.set([7]);
      expect(list.text()).toEqual(['span:head', 'dt:7', 'dd:7', 'span:tail']);
    });

    it('clears a list that is the only content', async () => {
      const list = setup(false);
      await list.set([]);
      expect(list.text()).toEqual([]);

      await list.set([8, 9]);
      expect(list.text()).toEqual(['dt:8', 'dd:8', 'dt:9', 'dd:9']);
    });

    it('removes one component from the middle', async () => {
      const list = setup(true);
      await list.set([1, 3]);
      expect(list.text()).toEqual([
        'span:head',
        'dt:1',
        'dd:1',
        'dt:3',
        'dd:3',
        'span:tail',
      ]);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { h, Fragment, mount, nextTick, portal, render } from '@/index';
import type { WDom } from '@/types';

/**
 * A keyed list between two fixed siblings, redrawn from one order to another.
 * The placement pass of a list update has four inputs that mix freely:
 * children that keep their place, children that move, children created
 * before the trailing run of additions, and that trailing run itself. Each
 * test pins one mix: the final order, which nodes are the same objects, and
 * which nodes were never taken out of the document.
 */
type Draw = (id: string) => WDom;

const li: Draw = id => <li key={id} id={id} />;

const setup = (initial: string[], draw: Draw = li, tag = 'ul') => {
  let ids = initial;
  let refresh = () => {};
  const host = document.createElement('div');
  const App = mount(renew => {
    refresh = renew;
    return () =>
      h(
        tag,
        {},
        <b id="head" />,
        ids.map(id => draw(id)),
        <b id="end" />
      );
  });
  const dispose = render(<App />, host);
  const list = host.firstElementChild as HTMLElement;
  const order = () => [...list.children].map(node => node.id);
  const nodes = () =>
    Object.fromEntries([...list.children].map(node => [node.id, node]));
  const observer = new MutationObserver(() => {});
  observer.observe(list, { childList: true });

  return {
    list,
    order,
    nodes,
    dispose,
    // Redraws with the new order; returns the ids of the nodes the redraw
    // inserted or removed.
    async to(next: string[]) {
      ids = next;
      observer.takeRecords();
      refresh();
      await nextTick();

      const touched = new Set<string>();
      observer.takeRecords().forEach(record => {
        [...record.addedNodes, ...record.removedNodes].forEach(node =>
          touched.add((node as Element).id)
        );
      });
      return touched;
    },
  };
};

describe('placement pass of a keyed list update', () => {
  it('creates before the trailing run, moves one child and appends in one redraw', async () => {
    const view = setup(['a', 'b', 'c', 'd', 'e']);
    const before = view.nodes();
    const touched = await view.to([
      'e',
      'x',
      'a',
      'b',
      'y',
      'c',
      'd',
      'z1',
      'z2',
    ]);

    expect(view.order()).toEqual([
      'head',
      'e',
      'x',
      'a',
      'b',
      'y',
      'c',
      'd',
      'z1',
      'z2',
      'end',
    ]);
    ['a', 'b', 'c', 'd', 'e'].forEach(id =>
      expect(view.nodes()[id]).toBe(before[id])
    );
    // The four that keep their order stay where they are.
    expect([...touched].sort()).toEqual(['e', 'x', 'y', 'z1', 'z2']);
    view.dispose();
  });

  it('creates before the trailing run when nothing moves', async () => {
    const view = setup(['a', 'b', 'c']);
    const before = view.nodes();
    const touched = await view.to(['x', 'a', 'y', 'b', 'c']);

    expect(view.order()).toEqual(['head', 'x', 'a', 'y', 'b', 'c', 'end']);
    ['a', 'b', 'c'].forEach(id => expect(view.nodes()[id]).toBe(before[id]));
    expect([...touched].sort()).toEqual(['x', 'y']);
    view.dispose();
  });

  it('appends a trailing run in front of the next sibling', async () => {
    const view = setup(['a', 'b']);
    const before = view.nodes();
    const touched = await view.to(['a', 'b', 'c', 'd']);

    expect(view.order()).toEqual(['head', 'a', 'b', 'c', 'd', 'end']);
    ['a', 'b', 'head', 'end'].forEach(id =>
      expect(view.nodes()[id]).toBe(before[id])
    );
    expect([...touched].sort()).toEqual(['c', 'd']);
    view.dispose();
  });

  it('fills an empty list and empties it again', async () => {
    const view = setup([]);

    await view.to(['a', 'b', 'c']);
    expect(view.order()).toEqual(['head', 'a', 'b', 'c', 'end']);

    await view.to([]);
    expect(view.order()).toEqual(['head', 'end']);
    view.dispose();
  });

  it('moves without creating: one to the front, then a full reversal', async () => {
    const view = setup(['a', 'b', 'c', 'd']);
    const before = view.nodes();
    const touched = await view.to(['d', 'a', 'b', 'c']);

    expect(view.order()).toEqual(['head', 'd', 'a', 'b', 'c', 'end']);
    expect([...touched]).toEqual(['d']);

    await view.to(['c', 'b', 'a', 'd']);
    expect(view.order()).toEqual(['head', 'c', 'b', 'a', 'd', 'end']);
    ['a', 'b', 'c', 'd'].forEach(id =>
      expect(view.nodes()[id]).toBe(before[id])
    );
    view.dispose();
  });

  it('removes, moves and creates together', async () => {
    const view = setup(['a', 'b', 'c', 'd', 'e']);
    const before = view.nodes();

    await view.to(['d', 'x', 'b', 'y']);

    expect(view.order()).toEqual(['head', 'd', 'x', 'b', 'y', 'end']);
    ['b', 'd'].forEach(id => expect(view.nodes()[id]).toBe(before[id]));
    ['a', 'c', 'e'].forEach(id => expect(before[id].isConnected).toBe(false));
    view.dispose();
  });

  it('replaces a child whose tag changed while another moves', async () => {
    let other = '';
    const view = setup(
      ['a', 'b', 'c'],
      id => (id === other ? <p key={id} id={id} /> : <span key={id} id={id} />),
      'div'
    );
    const before = view.nodes();

    other = 'a';
    await view.to(['c', 'a', 'b', 'z']);

    expect(view.order()).toEqual(['head', 'c', 'a', 'b', 'z', 'end']);
    expect(view.nodes().a.tagName).toBe('P');
    expect(before.a.isConnected).toBe(false);
    ['b', 'c'].forEach(id => expect(view.nodes()[id]).toBe(before[id]));
    view.dispose();
  });

  it('moves every node of a keyed component that draws a fragment', async () => {
    const Pair = mount<{ key?: unknown; id: string }>(() => ({ id }) => (
      <Fragment>
        <li id={`${id}1`} />
        <li id={`${id}2`} />
      </Fragment>
    ));
    const view = setup(['a', 'b', 'c'], id => <Pair key={id} id={id} />);
    const before = view.nodes();

    await view.to(['x', 'c', 'a', 'b', 'y']);

    expect(view.order()).toEqual([
      'head',
      'x1',
      'x2',
      'c1',
      'c2',
      'a1',
      'a2',
      'b1',
      'b2',
      'y1',
      'y2',
      'end',
    ]);
    ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].forEach(id =>
      expect(view.nodes()[id]).toBe(before[id])
    );
    view.dispose();
  });

  it('leaves a portal target outside the list when its place changes', async () => {
    const target = document.createElement('aside');
    const view = setup(['a', '*', 'b'], id =>
      id === '*' ? portal(<i id="inside" />, target) : li(id)
    );
    const before = view.nodes();

    expect(view.order()).toEqual(['head', 'a', 'b', 'end']);
    expect(target.children.length).toBe(1);

    await view.to(['x', 'b', '*', 'a']);

    expect(view.order()).toEqual(['head', 'x', 'b', 'a', 'end']);
    ['a', 'b'].forEach(id => expect(view.nodes()[id]).toBe(before[id]));
    expect(target.parentNode).toBe(null);
    expect([...target.children].map(node => node.id)).toEqual(['inside']);

    await view.to(['a', 'b']);
    expect(view.order()).toEqual(['head', 'a', 'b', 'end']);
    expect(target.children.length).toBe(0);
    view.dispose();
  });
});

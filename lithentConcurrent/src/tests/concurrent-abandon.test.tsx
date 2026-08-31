import { describe, it, expect } from 'vitest';
import {
  h,
  render,
  mount,
  nextTick,
  getComponentKey,
  getComponentSubInfo,
} from '../index';
import { makeNewWDomTree, commitEffects } from '@/diff';
import type { Effects } from '@/diff';
import type { WDom } from '@/types';

/**
 * Phase 4-10 — a build pass can be thrown away.
 *
 * This is what Phase 4 was for. Before it, the diff pass destroyed the tree it
 * was diffing against as it went (`il = true`, `delete children`), so a pass
 * that was abandoned halfway left nothing to fall back to. Now every mutation
 * waits in the effect list, and dropping the list drops the render.
 *
 * Double buffering is a precondition for abandoning a transition (T2), not a
 * feature yet — so what is asserted here is exactly that precondition: after a
 * full build the previous tree is untouched, and it still renders.
 */

/** Walks a tree and reports any node the build pass has already retired. */
const retiredNodes = (wDom: WDom): WDom[] => [
  ...(wDom.il ? [wDom] : []),
  ...(wDom.children || []).flatMap(retiredNodes),
];

const liveNodeOf = (compKey: object) =>
  (getComponentSubInfo(compKey as never, 'vd') as { value: WDom }).value;

describe('abandoning a build pass', () => {
  it('records the work instead of performing it', () => {
    const host = document.createElement('div');
    let compKey: object = {};

    const List = mount(() => {
      compKey = getComponentKey() as object;
      return () => (
        <ul>
          <li key="a">a</li>
          <li key="b">b</li>
          <li key="c">c</li>
        </ul>
      );
    });

    render(<List />, host);
    const before = host.innerHTML;
    const original = liveNodeOf(compKey);

    // Build a tree that drops two rows — the path that records unmount, detach
    // and delete effects — and never commit it.
    const effects: Effects = [];
    const built = makeNewWDomTree(
      (
        <ul>
          <li key="b">b</li>
        </ul>
      ) as WDom,
      (original.children || [])[0],
      effects
    );

    expect(built, 'the build produced a tree').toBeTruthy();
    expect(effects.length, 'and recorded work to do').toBeGreaterThan(0);
    expect(host.innerHTML, 'but changed no DOM').toBe(before);
    expect(retiredNodes(original), 'and retired nothing').toEqual([]);
  });

  it('still renders from the original tree after a build is discarded', async () => {
    const host = document.createElement('div');
    let compKey: object = {};
    let bump = () => {};

    const Counter = mount((renew: () => boolean) => {
      let count = 0;
      compKey = getComponentKey() as object;
      bump = () => {
        count += 1;
        renew();
      };
      return () => (
        <ul>
          <li key="head">{`count ${count}`}</li>
          <li key="tail">tail</li>
        </ul>
      );
    });

    render(<Counter />, host);
    expect(host.textContent).toBe('count 0tail');

    // Build something against the live tree, then walk away from it.
    const discarded: Effects = [];
    makeNewWDomTree(
      (
        <ul>
          <li key="head">discarded</li>
        </ul>
      ) as WDom,
      (liveNodeOf(compKey).children || [])[0],
      discarded
    );

    expect(discarded.length).toBeGreaterThan(0);

    // The real update must behave as if the discarded pass never happened.
    bump();
    await nextTick();
    expect(host.textContent).toBe('count 1tail');

    bump();
    await nextTick();
    expect(host.textContent).toBe('count 2tail');
  });

  it('the recorded effects are real — committing them does retire the original', () => {
    const host = document.createElement('div');
    let compKey: object = {};

    const List = mount(() => {
      compKey = getComponentKey() as object;
      return () => (
        <ul>
          <li key="a">a</li>
          <li key="b">b</li>
        </ul>
      );
    });

    render(<List />, host);
    const original = liveNodeOf(compKey);
    const target = (original.children || [])[0];

    const effects: Effects = [];
    makeNewWDomTree((<ul />) as WDom, target, effects);

    expect(retiredNodes(original)).toEqual([]);

    commitEffects(effects);

    expect(
      retiredNodes(original).length,
      'committing is what makes the pass irreversible'
    ).toBeGreaterThan(0);
  });
});

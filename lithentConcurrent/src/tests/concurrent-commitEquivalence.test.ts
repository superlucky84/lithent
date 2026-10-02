import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Phase 4-9 — the commit effect list produces what the base core produces.
 *
 * Up to Phase 3 `diff.ts` and `wDom.ts` were byte-identical to the base core, so
 * equivalence was free. Phase 4 moves every side effect the diff pass used to
 * perform inline into a list replayed at commit, and from here on equivalence
 * only holds if it is tested.
 *
 * The comparison runs the SAME scenario against both BUILT bundles in one
 * process and compares two things:
 *
 *   - the resulting DOM, and
 *   - the order of mount/unmount callbacks.
 *
 * The callback order is the part that matters. Deferring the effects is easy;
 * deferring them so that a node's `retire` still happens before its parent's
 * unmount walk is the part that can silently break, and it shows up as extra or
 * missing unmount callbacks rather than as wrong DOM.
 *
 * Requires `pnpm build` (both bundles).
 *
 * PHASE 5 (BC-1) — equivalence is no longer total, and that is deliberate.
 * `mountCallback` now flushes once at the commit boundary instead of at each of
 * the four DOM-insertion sites the base core flushes from. What that does and
 * does NOT change is pinned by the last describe block in this file; everything
 * above it must still match the base core exactly.
 */

type Core = {
  h: any;
  Fragment: any;
  mount: any;
  render: any;
  mountCallback: any;
  nextTick: any;
};

const repoRoot = resolve(__dirname, '../../..');
const bundles = {
  base: resolve(repoRoot, 'dist/lithent.mjs'),
  concurrent: resolve(repoRoot, 'lithentConcurrent/dist/lithentConcurrent.mjs'),
};

let base: Core;
let concurrent: Core;

beforeAll(async () => {
  for (const [name, file] of Object.entries(bundles)) {
    expect(
      existsSync(file),
      `${name} bundle missing at ${file} — run \`pnpm build\` first`
    ).toBe(true);
  }

  base = await import(/* @vite-ignore */ bundles.base);
  concurrent = await import(/* @vite-ignore */ bundles.concurrent);
});

/** One scenario, run against whichever core is handed to it. */
type Scenario = (core: Core, log: string[]) => Promise<string>;

const compare = async (name: string, scenario: Scenario) => {
  const baseLog: string[] = [];
  const concurrentLog: string[] = [];

  const baseHtml = await scenario(base, baseLog);
  const concurrentHtml = await scenario(concurrent, concurrentLog);

  expect(concurrentHtml, `${name}: DOM`).toBe(baseHtml);
  expect(concurrentLog, `${name}: lifecycle order`).toEqual(baseLog);
};

/** Component that reports its own mount and unmount. */
const traced = (core: Core, name: string, log: string[], body: any) =>
  core.mount(() => {
    core.mountCallback(() => {
      log.push(`mount:${name}`);
      return () => log.push(`unmount:${name}`);
    });
    return body;
  });

describe('commit effect list ≡ base core', () => {
  it('replacing a component subtree', async () => {
    await compare('replace', async (core, log) => {
      const { h, render, mount, nextTick } = core;
      const host = document.createElement('div');
      let toggle = () => {};

      const Leaf = traced(core, 'leaf', log, () => h('i', {}, 'leaf'));
      const Branch = traced(core, 'branch', log, () => h('b', {}, h(Leaf, {})));

      const App = mount((renew: () => void) => {
        let shown = true;
        toggle = () => {
          shown = !shown;
          renew();
        };
        return () =>
          h('div', {}, shown ? h(Branch, {}) : h('span', {}, 'gone'));
      });

      render(h(App, {}), host);
      toggle();
      await nextTick();

      return host.innerHTML;
    });
  });

  it('removing keyed rows', async () => {
    await compare('keyed removal', async (core, log) => {
      const { h, render, mount, nextTick } = core;
      const host = document.createElement('div');
      let setRows = (_: number[]) => {};

      const Row = (props: any) =>
        traced(core, `row${props.id}`, log, () =>
          h('li', {}, String(props.id))
        );

      const App = mount((renew: () => void) => {
        let rows = [1, 2, 3, 4, 5];
        setRows = next => {
          rows = next;
          renew();
        };
        return () =>
          h(
            'ul',
            {},
            rows.map(id => h(Row({ id } as any), { key: id }))
          );
      });

      render(h(App, {}), host);
      setRows([1, 3, 5]);
      await nextTick();
      setRows([5, 3]);
      await nextTick();

      return host.innerHTML;
    });
  });

  it('unmounting a nested tree', async () => {
    await compare('nested unmount', async (core, log) => {
      const { h, render, mount, nextTick } = core;
      const host = document.createElement('div');
      let hide = () => {};

      const Deep = traced(core, 'deep', log, () => h('i', {}, 'deep'));
      const Mid = traced(core, 'mid', log, () => h('b', {}, h(Deep, {})));
      const Top = traced(core, 'top', log, () => h('div', {}, h(Mid, {})));

      const App = mount((renew: () => void) => {
        let shown = true;
        hide = () => {
          shown = false;
          renew();
        };
        return () => h('section', {}, shown ? h(Top, {}) : null);
      });

      render(h(App, {}), host);
      hide();
      await nextTick();

      return host.innerHTML;
    });
  });

  it('reordering keyed rows without unmounting them', async () => {
    await compare('keyed reorder', async core => {
      const { h, render, mount, nextTick } = core;
      const host = document.createElement('div');
      let setRows = (_: number[]) => {};

      const App = mount((renew: () => void) => {
        let rows = [1, 2, 3, 4];
        setRows = next => {
          rows = next;
          renew();
        };
        return () =>
          h(
            'ul',
            {},
            rows.map(id => h('li', { key: id }, String(id)))
          );
      });

      render(h(App, {}), host);
      setRows([4, 1, 3, 2]);
      await nextTick();
      setRows([2, 4]);
      await nextTick();

      return host.innerHTML;
    });
  });

  it('replacing a subtree whose children match by type', async () => {
    // Exercises the 'D' path, where children ARE diffed against originals and
    // therefore retire before the parent's unmount walk reaches them. This is
    // the case the collection order exists to preserve.
    await compare('empty-element replace', async (core, log) => {
      const { h, render, mount, nextTick } = core;
      const host = document.createElement('div');
      let empty = () => {};

      const Child = traced(core, 'child', log, () => h('i', {}, 'x'));

      const Holder = mount((renew: () => void) => {
        let full = true;
        empty = () => {
          full = false;
          renew();
        };
        return () => (full ? h('div', {}, h(Child, {}), h(Child, {})) : null);
      });

      render(h(Holder, {}), host);
      empty();
      await nextTick();

      return host.innerHTML;
    });
  });
});

/**
 * BC-1 — the one intended divergence, stated as an executable claim.
 *
 * The base core flushes the mount queue at every insertion site, so the first
 * of two sibling components sees a DOM that is still being built. The commit
 * boundary makes both of them see the finished tree.
 *
 * The two cores are pinned to DIFFERENT values on purpose. Re-adding a flush
 * inside `typeAdd`/`typeReplace`/`updateChildren` makes the concurrent side
 * read `A:1` again and fails here; dropping the flush altogether empties the
 * log and also fails. The DOM is asserted identical either way — BC-1 changes
 * when callbacks observe the tree, never what the tree ends up as.
 */
describe('BC-1 — commit-boundary flush (intended divergence)', () => {
  /** Two sibling components appear in one update; each reports what it sees. */
  const siblingsSeenAtMount = async (core: Core) => {
    const { h, render, mount, mountCallback, nextTick } = core;
    const host = document.createElement('div');
    const log: string[] = [];
    let reveal = () => {};

    const reporter = (name: string) =>
      mount(() => {
        mountCallback(() => {
          const parent = host.firstChild as HTMLElement | null;
          log.push(`${name}:${parent ? parent.childElementCount : 0}`);
        });
        return () => h('i', {}, name);
      });

    const A = reporter('A');
    const B = reporter('B');

    const App = mount((renew: () => void) => {
      let shown = false;
      reveal = () => {
        shown = true;
        renew();
      };
      return () =>
        h('div', {}, shown ? h(A, {}) : null, shown ? h(B, {}) : null);
    });

    render(h(App, {}), host);
    reveal();
    await nextTick();

    return { log, html: host.innerHTML };
  };

  it('base: the first sibling sees a half-built DOM', async () => {
    const { log } = await siblingsSeenAtMount(base);
    expect(log).toEqual(['A:1', 'B:2']);
  });

  it('concurrent: both siblings see the finished commit', async () => {
    const { log } = await siblingsSeenAtMount(concurrent);
    expect(log).toEqual(['A:2', 'B:2']);
  });

  it('the resulting DOM is identical', async () => {
    const fromBase = await siblingsSeenAtMount(base);
    const fromConcurrent = await siblingsSeenAtMount(concurrent);
    expect(fromConcurrent.html).toBe(fromBase.html);
  });
});

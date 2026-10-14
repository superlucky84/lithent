import { describe, it, expect } from 'vitest';
import * as core from '@/index';
import { nextTick } from '@/index';
import {
  createHarness,
  collectLocalIds,
  makeRandom,
  type CompKind,
  type Spec,
  type Store,
} from './helpers/renderSpec';

// Base core only: lithentConcurrent's runner aliases `@/index` to its fork,
// which has not taken the fixes these suites guard.
const describeCore = describe.skipIf('deferRender' in core);

/**
 * Seeded random render trees. Each run renders a tree and then applies a
 * series of edits: small mutations redrawn from the root, whole new trees,
 * and output changes of a single stateful component redrawn on its own.
 * After every step the DOM must equal the HTML the current spec has to
 * produce, and exactly the expected component instances must be mounted.
 *
 * A failure message carries the seed and step; set ONLY_SEED to replay one.
 */
const SEEDS = 300;
const STEPS = 15;
const ONLY_SEED: number | undefined = undefined;

type Random = ReturnType<typeof makeRandom>;
type Ctx = { rnd: Random; store: Store; nextId: number };

const TAGS = ['div', 'span', 'p', 'ul', 'li'];
const CLASSES = [undefined, 'a', 'b'];
const TEXTS = ['x', 'y', 'z', 'w'];
const KEYS = ['k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7'];
const COMPS: CompKind[] = ['A', 'B', 'Arrow', 'L', 'Slot'];

const newLocal = (ctx: Ctx, depth: number, key?: string): Spec => {
  const id = `s${ctx.nextId++}`;
  ctx.store[id] = gen(ctx, depth - 1);
  return { k: 's', id, key };
};

/** Something a keyed list can hold: element, component or stateful one. */
const genKeyable = (ctx: Ctx, depth: number, key: string): Spec => {
  const { rnd } = ctx;
  const roll = rnd.int(3);
  if (roll === 0) {
    return {
      k: 'e',
      tag: rnd.pick(TAGS),
      cls: rnd.pick(CLASSES),
      key,
      children: genChildren(ctx, depth - 1),
    };
  }
  if (roll === 1) {
    return { k: 'c', comp: rnd.pick(COMPS), key, child: gen(ctx, depth - 1) };
  }
  return newLocal(ctx, depth, key);
};

const genChildren = (ctx: Ctx, depth: number): Spec[] =>
  Array.from({ length: ctx.rnd.int(4) }, () => gen(ctx, depth));

const genList = (ctx: Ctx, depth: number): Spec => {
  const { rnd } = ctx;
  if (rnd.int(2)) {
    const keys = rnd.shuffle(KEYS).slice(0, rnd.int(5));
    return {
      k: 'l',
      keyed: true,
      items: keys.map(key => genKeyable(ctx, depth - 1, key)),
    };
  }
  return { k: 'l', keyed: false, items: genChildren(ctx, depth - 1) };
};

const gen = (ctx: Ctx, depth: number): Spec => {
  const { rnd } = ctx;
  const leaf = depth <= 0;
  switch (rnd.int(leaf ? 4 : 10)) {
    case 0:
      return { k: 't', text: rnd.pick(TEXTS) };
    case 1:
      return { k: 'n' };
    case 2:
      return { k: 'x' };
    case 3:
      return {
        k: 'e',
        tag: rnd.pick(TAGS),
        cls: rnd.pick(CLASSES),
        children: [],
      };
    case 4:
    case 5:
      return {
        k: 'e',
        tag: rnd.pick(TAGS),
        cls: rnd.pick(CLASSES),
        children: genChildren(ctx, depth - 1),
      };
    case 6:
      return { k: 'f', children: genChildren(ctx, depth - 1) };
    case 7:
      return genList(ctx, depth);
    case 8:
      return { k: 'c', comp: rnd.pick(COMPS), child: gen(ctx, depth - 1) };
    default:
      return newLocal(ctx, depth);
  }
};

const replaceAt = <T>(items: T[], index: number, item: T) =>
  items.map((it, i) => (i === index ? item : it));

/**
 * A small, copy-on-write edit somewhere in the tree, so most of it stays the
 * same type and goes through the update (not replace) paths.
 */
const mutate = (ctx: Ctx, spec: Spec, depth: number): Spec => {
  const { rnd } = ctx;
  if (rnd.int(5) === 0) {
    // Replace this node; keep its key so keyed lists stay keyed.
    const key = 'key' in spec ? spec.key : undefined;
    return key !== undefined
      ? genKeyable(ctx, depth, key)
      : gen(ctx, Math.max(depth, 1));
  }

  switch (spec.k) {
    case 'e': {
      const roll = rnd.int(5);
      if (roll === 0) return { ...spec, cls: rnd.pick(CLASSES) };
      if (roll === 1) return { ...spec, tag: rnd.pick(TAGS) };
      if (roll === 2 || !spec.children.length) {
        const children = [...spec.children];
        if (children.length && rnd.int(2)) {
          children.splice(rnd.int(children.length), 1);
        } else {
          children.splice(rnd.int(children.length + 1), 0, gen(ctx, depth - 1));
        }
        return { ...spec, children };
      }
      const i = rnd.int(spec.children.length);
      return {
        ...spec,
        children: replaceAt(
          spec.children,
          i,
          mutate(ctx, spec.children[i], depth - 1)
        ),
      };
    }
    case 'f': {
      if (!spec.children.length || rnd.int(3) === 0) {
        const children = [...spec.children];
        children.splice(rnd.int(children.length + 1), 0, gen(ctx, depth - 1));
        return { ...spec, children };
      }
      const i = rnd.int(spec.children.length);
      return {
        ...spec,
        children: replaceAt(
          spec.children,
          i,
          mutate(ctx, spec.children[i], depth - 1)
        ),
      };
    }
    case 'l': {
      const items = [...spec.items];
      const roll = rnd.int(5);
      if (roll === 0 || !items.length) {
        if (spec.keyed) {
          const free = KEYS.filter(
            k => !items.some(item => 'key' in item && item.key === k)
          );
          if (free.length) {
            items.splice(
              rnd.int(items.length + 1),
              0,
              genKeyable(ctx, depth - 1, rnd.pick(free))
            );
          }
        } else {
          items.splice(rnd.int(items.length + 1), 0, gen(ctx, depth - 1));
        }
        return { ...spec, items };
      }
      if (roll === 1) {
        items.splice(rnd.int(items.length), 1);
        return { ...spec, items };
      }
      if (roll === 2) return { ...spec, items: rnd.shuffle(items) };
      if (roll === 3 && items.length > 1) {
        // Move one item.
        const [moved] = items.splice(rnd.int(items.length), 1);
        items.splice(rnd.int(items.length + 1), 0, moved);
        return { ...spec, items };
      }
      const i = rnd.int(items.length);
      return {
        ...spec,
        items: replaceAt(items, i, mutate(ctx, items[i], depth - 1)),
      };
    }
    case 'c':
      return rnd.int(3) === 0
        ? { ...spec, comp: rnd.pick(COMPS) }
        : { ...spec, child: mutate(ctx, spec.child, depth - 1) };
    case 's':
      // Redrawn from the root this time: the store changes, the parent
      // redraws, and the stateful component picks up its new output.
      ctx.store[spec.id] = mutate(ctx, ctx.store[spec.id], depth - 1);
      return spec;
    default:
      return gen(ctx, Math.max(depth, 1));
  }
};

const runSeed = async (seed: number) => {
  const rnd = makeRandom(seed);
  const ctx: Ctx = { rnd, store: {}, nextId: 0 };
  const withSiblings = rnd.int(2) === 1;
  const depth = 3 + rnd.int(2);

  let root = gen(ctx, depth);
  const hn = createHarness(root, ctx.store, { withSiblings });
  let label = `seed ${seed}: initial ${JSON.stringify(root)}`;

  const check = () => {
    expect(hn.html(), label).toBe(hn.expected());
    expect(hn.liveCounts(), `${label} (mounted components)`).toEqual(
      hn.expectedCounts()
    );
  };
  check();

  for (let step = 0; step < STEPS; step++) {
    const before = JSON.stringify(root);
    const roll = rnd.int(20);
    const localIds = collectLocalIds(root, hn.store);

    if (roll < 7 && localIds.length) {
      // One stateful component changes its own output and redraws alone.
      const id = rnd.pick(localIds);
      ctx.store = { ...hn.store };
      const next =
        rnd.int(3) === 0
          ? gen(ctx, depth - 1)
          : mutate(ctx, ctx.store[id], depth - 1);
      label = `seed ${seed} step ${step}: local ${id} ${JSON.stringify(
        hn.store[id]
      )} -> ${JSON.stringify(next)}`;
      hn.setLocal(id, next, ctx.store);
    } else {
      ctx.store = { ...hn.store };
      root =
        roll < 17
          ? mutate(ctx, root, depth)
          : roll < 19
            ? gen(ctx, depth)
            : root; // redraw with nothing changed
      label = `seed ${seed} step ${step}: ${before} -> ${JSON.stringify(
        root
      )} store ${JSON.stringify(ctx.store)}`;
      hn.setRoot(root, ctx.store);
    }

    await nextTick();
    check();
  }

  hn.destroy();
  expect(hn.html(), `seed ${seed}: destroy`).toBe(
    withSiblings ? '<i>head</i><i>tail</i>' : ''
  );
  expect(hn.liveCounts(), `seed ${seed}: destroy (mounted)`).toEqual({});
};

describeCore('random render trees', () => {
  const seeds =
    ONLY_SEED !== undefined
      ? [ONLY_SEED]
      : Array.from({ length: SEEDS }, (_v, i) => i + 1);
  const chunk = 25;

  for (let start = 0; start < seeds.length; start += chunk) {
    const group = seeds.slice(start, start + chunk);
    it(`seeds ${group[0]}-${group[group.length - 1]}`, async () => {
      for (const seed of group) {
        await runSeed(seed);
      }
    });
  }
});

import { describe, it, expect } from 'vitest';
import { nextTick } from '@/index';
import {
  createHarness,
  countSlots,
  makeRandom,
  type CompKind,
  type Spec,
  type Store,
} from './helpers/renderSpec';

/**
 * Seeded random render trees. Each run renders a tree and then applies a
 * series of edits: small mutations redrawn from the root, whole new trees,
 * output changes of single stateful components redrawn on their own, and
 * several of those queued in the same tick. Trees also hold hoisted nodes
 * (the same objects in every render and place) and stateful wrappers that
 * draw the child objects they were given somewhere else, or twice.
 *
 * After every step the DOM must equal the HTML the current spec has to
 * produce, and exactly the expected component instances must be mounted. A
 * redraw with nothing changed must not touch the DOM at all.
 *
 * A failure message carries the seed and step; set ONLY_SEED to replay one.
 */
const SEEDS = 300;
const STEPS = 15;
const ONLY_SEED: number | undefined = undefined;

type Random = ReturnType<typeof makeRandom>;
/**
 * tree: anything. stateless: no `s`/`w` (it may be drawn twice).
 * layout: a wrapper's layout, where `slot` draws its children; no components.
 */
type Mode = 'tree' | 'stateless' | 'layout';
type Ctx = { rnd: Random; store: Store; pool: Spec[]; nextId: number };

const TAGS = ['div', 'span', 'p', 'ul', 'li'];
const CLASSES = [undefined, 'a', 'b'];
const TEXTS = ['x', 'y', 'z', 'w'];
const KEYS = ['k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7'];
const COMPS: CompKind[] = ['A', 'B', 'Arrow', 'L', 'Slot'];
const HOLES: Spec[] = [{ k: 'n' }, { k: 'x' }, { k: 'y' }];

const world = (ctx: Ctx) => ({ store: ctx.store, pool: ctx.pool });

const hasStateful = (specs: Spec[], ctx: Ctx): boolean =>
  specs.some(spec => {
    switch (spec.k) {
      case 's':
      case 'w':
        return true;
      case 'e':
      case 'f':
        return hasStateful(spec.children, ctx);
      case 'l':
        return hasStateful(spec.items, ctx);
      case 'c':
        return hasStateful([spec.child], ctx);
      default:
        return false;
    }
  });

/** Turn every `slot` past the first `max` into null. */
const limitSlots = (spec: Spec, max: number): Spec => {
  let seen = 0;
  const visit = (node: Spec): Spec => {
    if (node.k === 'slot') return seen++ < max ? node : { k: 'n' };
    if (node.k === 'e' || node.k === 'f') {
      return { ...node, children: node.children.map(visit) };
    }
    if (node.k === 'l') return { ...node, items: node.items.map(visit) };
    return node;
  };
  return visit(spec);
};

// Stateful children may be drawn once only: two copies of one stateful
// component would be two instances, and redrawing one would leave the other.
const maxSlots = (children: Spec[], ctx: Ctx) =>
  hasStateful(children, ctx) ? 1 : 2;

const newLocal = (ctx: Ctx, depth: number, key?: string): Spec => {
  const id = `s${ctx.nextId++}`;
  ctx.store[id] = gen(ctx, depth - 1, 'tree');
  return { k: 's', id, key };
};

const newWrap = (ctx: Ctx, depth: number, mode: Mode, key?: string): Spec => {
  const id = `w${ctx.nextId++}`;
  const children = genChildren(ctx, depth - 1, mode);
  ctx.store[id] = limitSlots(
    gen(ctx, depth - 1, 'layout'),
    maxSlots(children, ctx)
  );
  return { k: 'w', id, key, children };
};

/** Something a keyed list can hold. */
const genKeyable = (ctx: Ctx, depth: number, key: string, mode: Mode) => {
  const { rnd } = ctx;
  const roll = rnd.int(mode === 'tree' ? 4 : mode === 'stateless' ? 2 : 1);
  if (roll === 0) {
    return {
      k: 'e',
      tag: rnd.pick(TAGS),
      cls: rnd.pick(CLASSES),
      key,
      children: genChildren(ctx, depth - 1, mode),
    } as Spec;
  }
  if (roll === 1) {
    return {
      k: 'c',
      comp: rnd.pick(COMPS),
      key,
      child: gen(ctx, depth - 1, mode),
    } as Spec;
  }
  return roll === 2
    ? newLocal(ctx, depth, key)
    : newWrap(ctx, depth, mode, key);
};

const genChildren = (ctx: Ctx, depth: number, mode: Mode): Spec[] =>
  Array.from({ length: ctx.rnd.int(4) }, () => gen(ctx, depth, mode));

const genList = (ctx: Ctx, depth: number, mode: Mode): Spec => {
  const { rnd } = ctx;
  if (rnd.int(2)) {
    const keys = rnd.shuffle(KEYS).slice(0, rnd.int(5));
    const items = keys.map(key => genKeyable(ctx, depth - 1, key, mode));
    // Holes: hidden rows (`cond && <Row key=.../>`) between keyed items.
    for (let i = rnd.int(3); i > 0; i--) {
      items.splice(rnd.int(items.length + 1), 0, rnd.pick(HOLES));
    }
    return { k: 'l', keyed: true, items };
  }
  return { k: 'l', keyed: false, items: genChildren(ctx, depth - 1, mode) };
};

const gen = (ctx: Ctx, depth: number, mode: Mode): Spec => {
  const { rnd } = ctx;
  const leaves = mode === 'layout' ? 7 : 6;
  const kinds = mode === 'tree' ? 14 : mode === 'stateless' ? 12 : 10;
  const roll = rnd.int(depth <= 0 ? leaves : kinds);
  switch (roll) {
    case 0:
      return { k: 't', text: rnd.pick(TEXTS) };
    case 1:
      return rnd.pick(HOLES);
    case 2:
      return {
        k: 'e',
        tag: rnd.pick(TAGS),
        cls: rnd.pick(CLASSES),
        children: [],
      };
    case 3:
    case 4:
      return ctx.pool.length
        ? { k: 'h', id: rnd.int(ctx.pool.length) }
        : { k: 'n' };
    case 5:
      return { k: 't', text: rnd.pick(TEXTS) };
    case 6:
      // Only a layout draws slots.
      return mode === 'layout' ? { k: 'slot' } : { k: 't', text: 'v' };
    case 7:
    case 8:
      return {
        k: 'e',
        tag: rnd.pick(TAGS),
        cls: rnd.pick(CLASSES),
        children: genChildren(ctx, depth - 1, mode),
      };
    case 9:
      return rnd.int(2)
        ? { k: 'f', children: genChildren(ctx, depth - 1, mode) }
        : genList(ctx, depth, mode);
    case 10:
      return {
        k: 'c',
        comp: rnd.pick(COMPS),
        child: gen(ctx, depth - 1, mode),
      };
    case 11:
      return genList(ctx, depth, mode);
    case 12:
      return newLocal(ctx, depth);
    default:
      return newWrap(ctx, depth, mode);
  }
};

const replaceAt = <T>(items: T[], index: number, item: T) =>
  items.map((it, i) => (i === index ? item : it));

/**
 * A small, copy-on-write edit somewhere in the tree, so most of it stays the
 * same type and goes through the update (not replace) paths.
 */
const mutate = (ctx: Ctx, spec: Spec, depth: number, mode: Mode): Spec => {
  const { rnd } = ctx;
  if (rnd.int(5) === 0) {
    // Replace this node; keep its key so keyed lists stay keyed.
    const key = 'key' in spec ? spec.key : undefined;
    return key !== undefined
      ? genKeyable(ctx, depth, key, mode)
      : gen(ctx, Math.max(depth, 1), mode);
  }

  switch (spec.k) {
    case 'e':
    case 'f': {
      const roll = rnd.int(5);
      if (spec.k === 'e' && roll === 0) {
        return { ...spec, cls: rnd.pick(CLASSES) };
      }
      if (spec.k === 'e' && roll === 1) return { ...spec, tag: rnd.pick(TAGS) };
      const children = [...spec.children];
      if (roll === 2 || !children.length) {
        if (children.length && rnd.int(2)) {
          children.splice(rnd.int(children.length), 1);
        } else {
          children.splice(
            rnd.int(children.length + 1),
            0,
            gen(ctx, depth - 1, mode)
          );
        }
        return { ...spec, children };
      }
      const i = rnd.int(children.length);
      return {
        ...spec,
        children: replaceAt(
          children,
          i,
          mutate(ctx, children[i], depth - 1, mode)
        ),
      };
    }
    case 'l': {
      const items = [...spec.items];
      const roll = rnd.int(6);
      if (roll === 0 || !items.length) {
        if (spec.keyed) {
          const free = KEYS.filter(
            k => !items.some(item => 'key' in item && item.key === k)
          );
          if (free.length) {
            items.splice(
              rnd.int(items.length + 1),
              0,
              genKeyable(ctx, depth - 1, rnd.pick(free), mode)
            );
          }
        } else {
          items.splice(rnd.int(items.length + 1), 0, gen(ctx, depth - 1, mode));
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
      if (roll === 4 && spec.keyed) {
        // Hide or show a row: a hole appears or goes away.
        const hole = items.findIndex(item => !('key' in item));
        if (hole !== -1 && rnd.int(2)) items.splice(hole, 1);
        else items.splice(rnd.int(items.length + 1), 0, rnd.pick(HOLES));
        return { ...spec, items };
      }
      const i = rnd.int(items.length);
      return {
        ...spec,
        items: replaceAt(items, i, mutate(ctx, items[i], depth - 1, mode)),
      };
    }
    case 'c':
      return rnd.int(3) === 0
        ? { ...spec, comp: rnd.pick(COMPS) }
        : { ...spec, child: mutate(ctx, spec.child, depth - 1, mode) };
    case 's':
      // Redrawn from the root this time: the store changes, the parent
      // redraws, and the stateful component picks up its new output.
      ctx.store[spec.id] = mutate(ctx, ctx.store[spec.id], depth - 1, 'tree');
      return spec;
    case 'w': {
      const layout = ctx.store[spec.id];
      if (rnd.int(2)) {
        ctx.store[spec.id] = limitSlots(
          mutate(ctx, layout, depth - 1, 'layout'),
          maxSlots(spec.children, ctx)
        );
        return spec;
      }
      // New children; drawn twice they must stay stateless.
      const childMode = countSlots(layout, world(ctx)) > 1 ? 'stateless' : mode;
      const at = rnd.int(spec.children.length);
      const children = spec.children.length
        ? replaceAt(
            spec.children,
            at,
            mutate(ctx, spec.children[at], depth - 1, childMode)
          )
        : [gen(ctx, depth - 1, childMode)];
      return { ...spec, children };
    }
    default:
      return gen(ctx, Math.max(depth, 1), mode);
  }
};

/** A new output for one stateful component, keeping the slot rule. */
const nextLocalSpec = (ctx: Ctx, id: string, depth: number, root: Spec) => {
  const { rnd } = ctx;
  const current = ctx.store[id];
  if (id[0] === 's') {
    return rnd.int(3) === 0
      ? gen(ctx, depth - 1, 'tree')
      : mutate(ctx, current, depth - 1, 'tree');
  }
  const owner = findWrap(root, id, ctx);
  const max = owner ? maxSlots(owner.children, ctx) : 1;
  const next =
    rnd.int(3) === 0
      ? gen(ctx, depth - 1, 'layout')
      : mutate(ctx, current, depth - 1, 'layout');
  return limitSlots(next, max);
};

const findWrap = (
  spec: Spec,
  id: string,
  ctx: Ctx
): Extract<Spec, { k: 'w' }> | undefined => {
  let found: Extract<Spec, { k: 'w' }> | undefined;
  const visit = (node: Spec) => {
    if (found) return;
    if (node.k === 'w') {
      if (node.id === id) found = node;
      node.children.forEach(visit);
      visit(ctx.store[node.id]);
    }
    if (node.k === 'e' || node.k === 'f') node.children.forEach(visit);
    if (node.k === 'l') node.items.forEach(visit);
    if (node.k === 'c') visit(node.child);
    if (node.k === 's') visit(ctx.store[node.id]);
  };
  visit(spec);
  return found;
};

const nodeName = (node: Node) =>
  node.nodeType === 3 ? `"${node.textContent}"` : node.nodeName.toLowerCase();
const describeWrites = (records: MutationRecord[]) =>
  records
    .map(record =>
      [
        `${record.type} in ${nodeName(record.target)}`,
        ...[...record.addedNodes].map(node => `+${nodeName(node)}`),
        ...[...record.removedNodes].map(node => `-${nodeName(node)}`),
      ].join(' ')
    )
    .join('; ');

const runSeed = async (seed: number) => {
  const rnd = makeRandom(seed);
  const ctx: Ctx = { rnd, store: {}, pool: [], nextId: 0 };
  // Hoisted nodes, built before (and outside) every render.
  for (let i = rnd.int(4); i > 0; i--) {
    ctx.pool.push(gen(ctx, 2, 'stateless'));
  }
  const withSiblings = rnd.int(2) === 1;
  const depth = 3 + rnd.int(2);

  let root = gen(ctx, depth, 'tree');
  const hn = createHarness(root, ctx.store, { withSiblings, pool: ctx.pool });
  let label = `seed ${seed}: initial ${JSON.stringify(root)}`;

  const check = () => {
    expect(hn.html(), label).toBe(hn.expected());
    expect(hn.liveCounts(), `${label} (mounted components)`).toEqual(
      hn.expectedCounts()
    );
    expect(hn.leftBehind(), `${label} (instance left behind)`).toBe(0);
  };
  check();

  // Replaying one seed prints every step, to follow how a failure built up.
  const trace = () => {
    if (ONLY_SEED !== undefined) {
      console.log(
        `${label} => ${hn.html()} ${JSON.stringify(hn.liveCounts())}`
      );
    }
  };

  const context = () =>
    `pool ${JSON.stringify(ctx.pool)} store ${JSON.stringify(hn.store)}`;

  for (let step = 0; step < STEPS; step++) {
    const before = JSON.stringify(root);
    const roll = rnd.int(20);
    const localIds = hn.localIds();
    ctx.store = { ...hn.store };

    if (roll < 3) {
      // Nothing changes: the DOM must be left exactly as it is.
      const nodes = hn.nodes();
      hn.takeMutations();
      label = `seed ${seed} step ${step}: no-op redraw ${before} ${context()}`;
      if (localIds.length && rnd.int(2)) {
        const id = rnd.pick(localIds);
        hn.setLocal(id, hn.store[id]);
      } else {
        hn.setRoot(root);
      }
      await nextTick();
      trace();
      check();
      expect(describeWrites(hn.takeMutations()), `${label} (DOM writes)`).toBe(
        ''
      );
      expect(
        hn.nodes().every((node, i) => node === nodes[i]),
        `${label} (same nodes)`
      ).toBe(true);
      continue;
    }

    if (roll < 8 && localIds.length) {
      // One stateful component changes its own output and redraws alone.
      const id = rnd.pick(localIds);
      const next = nextLocalSpec(ctx, id, depth, root);
      label = `seed ${seed} step ${step}: local ${id} ${JSON.stringify(
        hn.store[id]
      )} -> ${JSON.stringify(next)} in ${before} ${context()}`;
      hn.setLocal(id, next, ctx.store);
    } else if (roll < 11 && localIds.length) {
      // Several redraws queued in the same tick, in random order, maybe with
      // the root among them.
      const ids = rnd.shuffle(localIds).slice(0, 1 + rnd.int(3));
      const ops: string[] = [];
      const withRoot = rnd.int(2) === 1;
      const rootAt = rnd.int(ids.length + 1);
      const doRoot = () => {
        ctx.store = { ...hn.store };
        root = mutate(ctx, root, depth, 'tree');
        ops.push(`root -> ${JSON.stringify(root)}`);
        hn.setRoot(root, ctx.store);
      };
      ids.forEach((id, i) => {
        if (withRoot && i === rootAt) doRoot();
        ctx.store = { ...hn.store };
        const next = nextLocalSpec(ctx, id, depth, root);
        ops.push(`local ${id} -> ${JSON.stringify(next)}`);
        hn.setLocal(id, next, ctx.store);
      });
      if (withRoot && rootAt === ids.length) doRoot();
      label = `seed ${seed} step ${step}: batch from ${before}: ${ops.join(
        '; '
      )} ${context()}`;
    } else {
      root =
        roll < 18 ? mutate(ctx, root, depth, 'tree') : gen(ctx, depth, 'tree');
      label = `seed ${seed} step ${step}: ${before} -> ${JSON.stringify(
        root
      )} ${context()}`;
      hn.setRoot(root, ctx.store);
    }

    await nextTick();
    trace();
    check();
  }

  hn.destroy();
  expect(hn.html(), `seed ${seed}: destroy`).toBe(
    withSiblings ? '<i>head</i><i>tail</i>' : ''
  );
  expect(hn.liveCounts(), `seed ${seed}: destroy (mounted)`).toEqual({});
};

describe('random render trees', () => {
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

import {
  h,
  Fragment,
  render,
  mount,
  lmount,
  mountCallback,
  useRenew,
} from '@/index';
import type { WDom, TagFunction } from '@/index';

/**
 * A render tree described as data. The same spec is turned into a lithent
 * tree (`build`) and, independently, into the HTML it must produce
 * (`specToHtml`), so every update can be checked against what a fresh render
 * of the target spec has to look like.
 *
 *   e: element             t: text          n: null    x: false    y: true
 *   f: Fragment            l: array (loop, keyed or not)
 *   c: component rendering `child` (from props, or as a slot child)
 *   s: stateful component whose output lives in the store under `id`, so the
 *      test can renew it on its own (bottom-up update)
 *   h: a hoisted node: built once, the very same object in every render and
 *      in every place it appears
 *   w: stateful wrapper: renders the layout in the store under `id`, where
 *      each `slot` draws the children it was given. Redrawn on its own it
 *      draws the same child objects again, possibly somewhere else or twice.
 */
export type CompKind = 'A' | 'B' | 'Arrow' | 'L' | 'Slot';

export type Spec =
  | { k: 'e'; tag: string; cls?: string; key?: string; children: Spec[] }
  | { k: 't'; text: string }
  | { k: 'n' }
  | { k: 'x' }
  | { k: 'y' }
  | { k: 'f'; children: Spec[] }
  | { k: 'l'; keyed: boolean; items: Spec[] }
  | { k: 'c'; comp: CompKind; key?: string; child: Spec }
  | { k: 's'; id: string; key?: string }
  | { k: 'h'; id: number }
  | { k: 'w'; id: string; key?: string; children: Spec[] }
  | { k: 'slot' };

export type Store = Record<string, Spec>;

// Shorthands for hand-written specs.
export const el = (tag: string, ...children: Spec[]): Spec => ({
  k: 'e',
  tag,
  children,
});
export const txt = (text: string): Spec => ({ k: 't', text });
export const nul: Spec = { k: 'n' };
export const no: Spec = { k: 'x' };
export const yes: Spec = { k: 'y' };
export const slot: Spec = { k: 'slot' };
export const frag = (...children: Spec[]): Spec => ({ k: 'f', children });
export const list = (keyed: boolean, ...items: Spec[]): Spec => ({
  k: 'l',
  keyed,
  items,
});
export const comp = (kind: CompKind, child: Spec, key?: string): Spec => ({
  k: 'c',
  comp: kind,
  child,
  key,
});
export const local = (id: string, key?: string): Spec => ({ k: 's', id, key });
export const hoisted = (id: number): Spec => ({ k: 'h', id });
export const wrap = (id: string, ...children: Spec[]): Spec => ({
  k: 'w',
  id,
  children,
});
export const keyed = (key: string, spec: Spec): Spec =>
  spec.k === 'e' || spec.k === 'c' || spec.k === 's' || spec.k === 'w'
    ? { ...spec, key }
    : spec;

export type World = { store: Store; pool: Spec[] };

/**
 * Visit every spec node that ends up drawn, with `slot` leaves replaced by
 * the children of the wrapper whose layout they are in.
 */
const walk = (
  spec: Spec,
  world: World,
  visit: (spec: Spec) => void,
  slotChildren: Spec[] = []
): void => {
  visit(spec);
  const into = (items: Spec[]) =>
    items.forEach(c => walk(c, world, visit, slotChildren));
  switch (spec.k) {
    case 'e':
    case 'f':
      return into(spec.children);
    case 'l':
      return into(spec.items);
    case 'c':
      return into([spec.child]);
    case 's':
      return into([world.store[spec.id]]);
    case 'h':
      return into([world.pool[spec.id]]);
    case 'w':
      return walk(world.store[spec.id], world, visit, spec.children);
    case 'slot':
      return into(slotChildren);
  }
};

/**
 * The HTML a spec has to produce, written without lithent.
 */
export const specToHtml = (
  spec: Spec,
  world: World,
  slotChildren: Spec[] = []
): string => {
  const inner = (items: Spec[]) =>
    items.map(c => specToHtml(c, world, slotChildren)).join('');
  switch (spec.k) {
    case 'e': {
      const cls = spec.cls !== undefined ? ` class="${spec.cls}"` : '';
      return `<${spec.tag}${cls}>${inner(spec.children)}</${spec.tag}>`;
    }
    case 't':
      return spec.text;
    case 'n':
    case 'x':
    case 'y':
      return '';
    case 'f':
      return inner(spec.children);
    case 'l':
      return inner(spec.items);
    case 'c':
      return inner([spec.child]);
    case 's':
      return inner([world.store[spec.id]]);
    case 'h':
      return inner([world.pool[spec.id]]);
    case 'w':
      return specToHtml(world.store[spec.id], world, spec.children);
    case 'slot':
      return inner(slotChildren);
  }
};

/**
 * Component instances a spec mounts, per kind (`Arrow` keeps no lifecycle).
 * A node drawn in two places is two instances.
 */
export const countComponents = (spec: Spec, world: World) => {
  const acc: Record<string, number> = {};
  const add = (kind: string) => (acc[kind] = (acc[kind] || 0) + 1);
  walk(spec, world, node => {
    if (node.k === 'c' && node.comp !== 'Arrow') add(node.comp);
    if (node.k === 's') add('Local');
    if (node.k === 'w') add('Wrap');
  });
  return acc;
};

/**
 * Ids of the drawn components that can redraw on their own (`s` and `w`).
 */
export const collectLocalIds = (spec: Spec, world: World): string[] => {
  const acc: string[] = [];
  walk(spec, world, node => {
    if (node.k === 's' || node.k === 'w') acc.push(node.id);
  });
  return acc;
};

/** How many times a layout draws its children. */
export const countSlots = (spec: Spec, world: World) => {
  let count = 0;
  const visit = (node: Spec) => {
    if (node.k === 'slot') count++;
    if (node.k === 'e' || node.k === 'f') node.children.forEach(visit);
    if (node.k === 'l') node.items.forEach(visit);
    if (node.k === 'h') visit(world.pool[node.id]);
  };
  visit(spec);
  return count;
};

type ChildProps = { child: Spec; key?: string; b?: number };
type LocalProps = { id: string; key?: string; b?: number };

/**
 * One isolated set of components, registries and a host. Each harness owns
 * its component constructors so lifecycle counts never leak between tests.
 */
export const createHarness = (
  initial: Spec,
  initialStore: Store = {},
  options: { withSiblings?: boolean; pool?: Spec[] } = {}
) => {
  let root = initial;
  let store: Store = { ...initialStore };
  const pool = options.pool || [];
  const live: Record<string, Set<object>> = {};
  const renews = new Map<string, () => boolean>();
  let hostRenew: () => boolean = () => false;
  const poolNodes: unknown[] = [];

  // The instances made from each built component node (props.b). Several
  // are fine, one per place it is drawn in, but not one left behind never
  // mounted next to another: a copy was drawn instead of the instance
  // already set up. (One alone may stay unmounted: slot children a wrapper
  // does not draw, a pool node not drawn yet.)
  let builds = 0;
  const instances = new Map<number | undefined, { mounted: boolean }[]>();

  const track = (kind: string, props: { b?: number }) => {
    const token = {};
    const instance = { mounted: false };
    const made = instances.get(props.b) || [];
    made.push(instance);
    instances.set(props.b, made);
    mountCallback(() => {
      instance.mounted = true;
      (live[kind] = live[kind] || new Set()).add(token);
      return () => live[kind].delete(token);
    });
  };

  const build = (spec: Spec, slotChildren?: WDom[]): unknown => {
    const all = (items: Spec[]) =>
      items.map(c => build(c, slotChildren)) as WDom[];
    switch (spec.k) {
      case 'e': {
        const props: Record<string, unknown> = {};
        if (spec.key !== undefined) props.key = spec.key;
        if (spec.cls !== undefined) props.class = spec.cls;
        return h(spec.tag, props, ...all(spec.children));
      }
      case 't':
        return spec.text;
      case 'n':
        return null;
      case 'x':
        return false;
      case 'y':
        return true;
      case 'f':
        return h(Fragment as unknown as TagFunction, {}, ...all(spec.children));
      case 'l':
        return all(spec.items);
      case 'c': {
        const props: Record<string, unknown> = { child: spec.child };
        props.b = ++builds;
        if (spec.key !== undefined) props.key = spec.key;
        if (spec.comp === 'Slot') {
          return h(
            Slot as unknown as TagFunction,
            props,
            build(spec.child) as WDom
          );
        }
        return h(comps[spec.comp] as unknown as TagFunction, props);
      }
      case 's': {
        const props: Record<string, unknown> = { id: spec.id, b: ++builds };
        if (spec.key !== undefined) props.key = spec.key;
        return h(Local as unknown as TagFunction, props);
      }
      case 'h':
        return poolNodes[spec.id];
      case 'w': {
        const props: Record<string, unknown> = { id: spec.id, b: ++builds };
        if (spec.key !== undefined) props.key = spec.key;
        return h(
          Wrap as unknown as TagFunction,
          props,
          ...(spec.children.map(c => build(c)) as WDom[])
        );
      }
      case 'slot':
        // The very child objects the wrapper was given.
        return slotChildren || [];
    }
  };

  const A = mount<ChildProps>((_renew, props) => {
    track('A', props);
    return () => build(props.child) as WDom;
  });
  const B = mount<ChildProps>((_renew, props) => {
    track('B', props);
    return () => build(props.child) as WDom;
  });
  const L = lmount<ChildProps>(props => {
    track('L', props);
    useRenew();
    return () => build(props.child) as WDom;
  });
  // Stateless: re-run on every render.
  const Arrow = (props: ChildProps) => build(props.child) as WDom;
  const Slot = mount<ChildProps>((_renew, props, children) => {
    track('Slot', props);
    return () =>
      h(Fragment as unknown as TagFunction, {}, ...(children as WDom[]));
  });
  const Local = mount<LocalProps>((renew, props) => {
    track('Local', props);
    return () => {
      // Read at render time: a reused instance may have been handed a new id.
      renews.set(props.id, renew);
      return build(store[props.id]) as WDom;
    };
  });
  const Wrap = mount<LocalProps>((renew, props, children) => {
    track('Wrap', props);
    return () => {
      renews.set(props.id, renew);
      return build(store[props.id], children) as WDom;
    };
  });
  const comps = { A, B, L, Arrow };

  // Built once, outside any render, like a module-level constant. A later
  // entry may hold an earlier one.
  pool.forEach(spec => poolNodes.push(build(spec)));

  const Host = mount(renew => {
    hostRenew = renew;
    return () => build(root) as WDom;
  });

  const container = document.createElement('div');
  const head = options.withSiblings ? '<i>head</i>' : '';
  const tail = options.withSiblings ? '<i>tail</i>' : '';
  container.innerHTML = head + tail;
  document.body.appendChild(container);

  const destroy = render(
    h(Host as unknown as TagFunction, {}),
    container,
    options.withSiblings ? (container.lastChild as HTMLElement) : undefined
  );

  const world = (): World => ({ store, pool });
  const expected = () => head + specToHtml(root, world()) + tail;

  const liveCounts = () => {
    const result: Record<string, number> = {};
    Object.keys(live).forEach(kind => {
      if (live[kind].size) result[kind] = live[kind].size;
    });
    return result;
  };

  // DOM writes, to check that a redraw with nothing changed touches nothing.
  const observer = new MutationObserver(() => {});
  observer.observe(container, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  const nodes = () => {
    const result: Node[] = [];
    const walker = document.createTreeWalker(container);
    while (walker.nextNode()) result.push(walker.currentNode);
    return result;
  };

  return {
    container,
    html: () => container.innerHTML,
    expected,
    liveCounts,
    /** Instances left behind never mounted next to a copy drawn instead. */
    leftBehind: () =>
      [...instances.values()].filter(
        made => made.length > 1 && made.some(instance => !instance.mounted)
      ).length,
    expectedCounts: () => countComponents(root, world()),
    localIds: () => collectLocalIds(root, world()),
    /** Every DOM node in order, for identity checks. */
    nodes,
    /** DOM writes since the last call. */
    takeMutations: () => observer.takeRecords(),
    get root() {
      return root;
    },
    get store() {
      return store;
    },
    /** Swap the whole tree and redraw from the host. */
    setRoot(next: Spec, nextStore?: Store) {
      root = next;
      if (nextStore) store = { ...store, ...nextStore };
      hostRenew();
    },
    /** Change one stateful component's output and redraw only that one. */
    setLocal(id: string, next: Spec, nextStore?: Store) {
      store = { ...store, ...(nextStore || {}), [id]: next };
      const renew = renews.get(id);
      if (!renew) throw new Error(`no renew for ${id}`);
      renew();
    },
    destroy() {
      observer.disconnect();
      destroy();
      container.remove();
    },
  };
};

export type Harness = ReturnType<typeof createHarness>;

/**
 * Deterministic PRNG (mulberry32) so a failing seed can be replayed.
 */
export const makeRandom = (seed: number) => {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  const pick = <T>(items: readonly T[]): T => items[int(items.length)];
  const shuffle = <T>(items: T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  return { next, int, pick, shuffle };
};

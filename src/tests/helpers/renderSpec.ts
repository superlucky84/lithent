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
 *   e: element             t: text          n: null       x: false
 *   f: Fragment            l: array (loop, keyed or not)
 *   c: component rendering `child` (from props, or as a slot child)
 *   s: stateful component whose output lives in the store under `id`, so the
 *      test can renew it on its own (bottom-up update)
 */
export type CompKind = 'A' | 'B' | 'Arrow' | 'L' | 'Slot';

export type Spec =
  | { k: 'e'; tag: string; cls?: string; key?: string; children: Spec[] }
  | { k: 't'; text: string }
  | { k: 'n' }
  | { k: 'x' }
  | { k: 'f'; children: Spec[] }
  | { k: 'l'; keyed: boolean; items: Spec[] }
  | { k: 'c'; comp: CompKind; key?: string; child: Spec }
  | { k: 's'; id: string; key?: string };

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
export const keyed = (key: string, spec: Spec): Spec =>
  spec.k === 'e' || spec.k === 'c' || spec.k === 's' ? { ...spec, key } : spec;

/**
 * The HTML a spec has to produce, written without lithent.
 */
export const specToHtml = (spec: Spec, store: Store): string => {
  switch (spec.k) {
    case 'e': {
      const cls = spec.cls !== undefined ? ` class="${spec.cls}"` : '';
      const inner = spec.children.map(c => specToHtml(c, store)).join('');
      return `<${spec.tag}${cls}>${inner}</${spec.tag}>`;
    }
    case 't':
      return spec.text;
    case 'n':
    case 'x':
      return '';
    case 'f':
      return spec.children.map(c => specToHtml(c, store)).join('');
    case 'l':
      return spec.items.map(c => specToHtml(c, store)).join('');
    case 'c':
      return specToHtml(spec.child, store);
    case 's':
      return specToHtml(store[spec.id], store);
  }
};

/**
 * Component instances a spec mounts, per kind (`Arrow` keeps no lifecycle).
 */
export const countComponents = (
  spec: Spec,
  store: Store,
  acc: Record<string, number> = {}
): Record<string, number> => {
  const add = (kind: string) => (acc[kind] = (acc[kind] || 0) + 1);
  switch (spec.k) {
    case 'e':
    case 'f':
      spec.children.forEach(c => countComponents(c, store, acc));
      break;
    case 'l':
      spec.items.forEach(c => countComponents(c, store, acc));
      break;
    case 'c':
      if (spec.comp !== 'Arrow') add(spec.comp);
      countComponents(spec.child, store, acc);
      break;
    case 's':
      add('Local');
      countComponents(store[spec.id], store, acc);
      break;
  }
  return acc;
};

/**
 * Stateful component ids reachable from a spec.
 */
export const collectLocalIds = (
  spec: Spec,
  store: Store,
  acc: string[] = []
): string[] => {
  switch (spec.k) {
    case 'e':
    case 'f':
      spec.children.forEach(c => collectLocalIds(c, store, acc));
      break;
    case 'l':
      spec.items.forEach(c => collectLocalIds(c, store, acc));
      break;
    case 'c':
      collectLocalIds(spec.child, store, acc);
      break;
    case 's':
      acc.push(spec.id);
      collectLocalIds(store[spec.id], store, acc);
      break;
  }
  return acc;
};

type ChildProps = { child: Spec; key?: string };
type LocalProps = { id: string; key?: string };

/**
 * One isolated set of components, registries and a host. Each harness owns
 * its component constructors so lifecycle counts never leak between tests.
 */
export const createHarness = (
  initial: Spec,
  initialStore: Store = {},
  options: { withSiblings?: boolean } = {}
) => {
  let root = initial;
  let store: Store = { ...initialStore };
  const live: Record<string, Set<object>> = {};
  const renews = new Map<string, () => boolean>();
  let hostRenew: () => boolean = () => false;

  const track = (kind: string) => {
    const token = {};
    mountCallback(() => {
      (live[kind] = live[kind] || new Set()).add(token);
      return () => live[kind].delete(token);
    });
  };

  const build = (spec: Spec): unknown => {
    switch (spec.k) {
      case 'e': {
        const props: Record<string, unknown> = {};
        if (spec.key !== undefined) props.key = spec.key;
        if (spec.cls !== undefined) props.class = spec.cls;
        return h(spec.tag, props, ...(spec.children.map(build) as WDom[]));
      }
      case 't':
        return spec.text;
      case 'n':
        return null;
      case 'x':
        return false;
      case 'f':
        return h(
          Fragment as unknown as TagFunction,
          {},
          ...(spec.children.map(build) as WDom[])
        );
      case 'l':
        return spec.items.map(build);
      case 'c': {
        const props: Record<string, unknown> = { child: spec.child };
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
        const props: Record<string, unknown> = { id: spec.id };
        if (spec.key !== undefined) props.key = spec.key;
        return h(Local as unknown as TagFunction, props);
      }
    }
  };

  const A = mount<ChildProps>((_renew, props) => {
    track('A');
    return () => build(props.child) as WDom;
  });
  const B = mount<ChildProps>((_renew, props) => {
    track('B');
    return () => build(props.child) as WDom;
  });
  const L = lmount<ChildProps>(props => {
    track('L');
    useRenew();
    return () => build(props.child) as WDom;
  });
  // Stateless: re-run on every render.
  const Arrow = (props: ChildProps) => build(props.child) as WDom;
  const Slot = mount<ChildProps>((_renew, _props, children) => {
    track('Slot');
    return () =>
      h(Fragment as unknown as TagFunction, {}, ...(children as WDom[]));
  });
  const Local = mount<LocalProps>((renew, props) => {
    track('Local');
    return () => {
      // Read at render time: a reused instance may have been handed a new id.
      renews.set(props.id, renew);
      return build(store[props.id]) as WDom;
    };
  });
  const comps = { A, B, L, Arrow };

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

  const expected = () => head + specToHtml(root, store) + tail;

  const liveCounts = () => {
    const result: Record<string, number> = {};
    Object.keys(live).forEach(kind => {
      if (live[kind].size) result[kind] = live[kind].size;
    });
    return result;
  };

  return {
    container,
    html: () => container.innerHTML,
    expected,
    liveCounts,
    expectedCounts: () => countComponents(root, store),
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

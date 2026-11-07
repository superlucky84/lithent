// Experimental base-only owner. This is not a public Lithent export.
import { h, Fragment } from '@/wDom';
import { makeNewWDomTree } from '@/diff';
import { wDomUpdate } from '@/render';
import type { WDom, FragmentFunction } from '@/types';

declare const __C4_DIAGNOSTIC__: boolean;
type Key = string | number;

export function createListBoundary<T>(
  keyOf: (item: T) => Key,
  view: (item: T) => WDom
) {
  let items: T[] = [];
  let indexes = new Map<Key, number>();
  let current = h(Fragment as unknown as FragmentFunction, {}, []) as WDom;
  let structural = false;
  let scheduled = false;
  let busy = false;
  let disposed = false;
  const dirty = new Set<Key>();
  const metrics = { flushes: 0, structural: 0, itemViews: 0, indexed: 0 };
  const assertWritable = () => {
    if (disposed || busy) throw Error('C4 disposed or reentrant write');
  };
  const checkKey = (key: Key) => {
    if ((typeof key !== 'string' && typeof key !== 'number') || key !== key)
      throw Error('C4 requires a string or non-NaN number key');
  };
  const describe = (item: T, key: Key) => {
    const node = view(item);
    if (
      node.type !== 'e' ||
      node.tag === 'portal' ||
      node.ctor ||
      node.props?.key !== key
    )
      throw Error('C4 item requires one keyed element root');
    // Bounded experiment: caller owns plain VDOM output (no components/portals).
    if (__C4_DIAGNOSTIC__) metrics.itemViews++;
    return node;
  };
  function enqueue() {
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        if (!disposed) flush();
      });
    }
  }
  function flush() {
    if (disposed || (!structural && !dirty.size)) return;
    if (busy) throw Error('C4 reentrant flush');
    if (!current.el || current.il) throw Error('C4 owner is not mounted');
    busy = true;
    try {
      if (__C4_DIAGNOSTIC__) metrics.flushes++;
      if (structural) {
        const children = items.map(item => describe(item, keyOf(item)));
        const parent = current.getParent?.();
        const siblings = parent?.children;
        const slot = siblings?.indexOf(current) ?? -1;
        if (slot < 0 || !siblings) throw Error('C4 lost its owner slot');
        const next = makeNewWDomTree(
          h(Fragment as unknown as FragmentFunction, {}, children),
          current
        );
        next.getParent = current.getParent;
        siblings[slot] = next;
        current = next;
        wDomUpdate(next);
        structural = false;
        dirty.clear();
        if (__C4_DIAGNOSTIC__) metrics.structural++;
      } else {
        // Resolve all dirty keys and run views before starting any DOM commit.
        // indexOf is not used for locating items in a stable list.
        const pending = [...dirty].map(key => {
          const index = indexes.get(key);
          if (index === undefined) throw Error('C4 unknown key');
          const item = items[index];
          if (keyOf(item) !== key) throw Error('C4 item key changed');
          return { index, node: describe(item, key) };
        });
        const list = current.children![0];
        const children = list.children!;
        for (const { index, node } of pending) {
          const previous = children[index];
          const next = makeNewWDomTree(node, previous);
          next.getParent = previous.getParent;
          children[index] = next;
          wDomUpdate(next);
        }
        dirty.clear();
      }
    } catch (error) {
      // A throwing view can be retried explicitly. A partial diff/DOM failure
      // requires rebuilding the owner; no general transactional rollback claim.
      throw error;
    } finally {
      busy = false;
    }
  }
  return {
    get node() {
      return current;
    },
    metrics,
    has: (key: Key) => indexes.has(key),
    set(nextItems: readonly T[]) {
      assertWritable();
      const snapshot = [...nextItems];
      const nextIndexes = new Map<Key, number>();
      snapshot.forEach((item, index) => {
        const key = keyOf(item);
        checkKey(key);
        if (nextIndexes.has(key)) throw Error('C4 duplicate key');
        nextIndexes.set(key, index);
      });
      items = snapshot;
      indexes = nextIndexes;
      structural = true;
      dirty.clear();
      if (__C4_DIAGNOSTIC__) metrics.indexed += snapshot.length;
      enqueue();
    },
    invalidate(keys: Iterable<Key>) {
      assertWritable();
      const checked = [...keys];
      for (const key of checked)
        if (!indexes.has(key)) throw Error('C4 unknown key');
      for (const key of checked) dirty.add(key);
      enqueue();
    },
    flush,
    dispose() {
      assertWritable();
      disposed = true;
      items = [];
      indexes.clear();
      dirty.clear();
      structural = false;
      current = undefined as unknown as WDom;
    },
  };
}

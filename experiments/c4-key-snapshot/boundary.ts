// C4 P3: scalar key snapshot, preserving the P2 owner contract. Not public.
import { h, Fragment, mount } from '@/wDom';
import { makeNewWDomTree } from '@/diff';
import { wDomUpdate } from '@/render';
import { mountCallback } from '@/hook/mountCallback';
import { getKey } from '@/utils/predicator';
import { componentMap, compKeyRef, needDiffRef } from '@/utils/universalRef';
import type {
  CompKey,
  WDom,
  TagFunctionResolver,
  FragmentFunction,
} from '@/types';

declare const __C4_DIAGNOSTIC__: boolean;
type Key = string | number;
type Description = WDom | TagFunctionResolver;
type Session = {
  key: CompKey;
  content?: WDom;
  mounted: boolean;
  active: boolean;
  queued: boolean;
  fault: boolean;
};

export function createListBoundary<T>(
  keyOf: (item: T) => Key,
  view: (item: T) => Description
) {
  let items: T[] = [];
  let keys: Key[] = [];
  let indexes = new Map<Key, number>();
  let dirty = new Set<Key>();
  let structural = false;
  let version = 0;
  let disposed = false;
  let busy = false;
  let phase = '';
  let owner: Session | undefined;
  const metrics = { flushes: 0, structural: 0, itemViews: 0, indexed: 0 };
  const fragment = (children: Description[]) =>
    h(Fragment as unknown as FragmentFunction, {}, children as WDom[]) as WDom;
  const assertWritable = () => {
    if (disposed || phase === 'view')
      throw Error('C4 disposed or write during view');
  };
  const checkKey = (key: Key) => {
    if ((typeof key !== 'string' && typeof key !== 'number') || key !== key)
      throw Error('C4 requires a string or non-NaN number key');
  };
  const describe = (item: T, key: Key) => {
    if (keyOf(item) !== key) throw Error('C4 item key changed');
    const node = view(item);
    if (!node || getKey(node as WDom) !== key)
      throw Error('C4 item requires a keyed root');
    if (__C4_DIAGNOSTIC__) metrics.itemViews++;
    return node;
  };
  function enqueue() {
    const session = owner;
    if (!session?.mounted || session.queued || session.fault || disposed)
      return;
    session.queued = true;
    queueMicrotask(() => {
      session.queued = false;
      if (owner === session && session.active && !session.fault && !disposed)
        flush();
    });
  }
  function flush() {
    const session = owner;
    if (disposed || !session?.mounted || !session.active) return;
    if (session.fault) throw Error('C4 fault: remount owner before retry');
    if (busy) throw Error('C4 reentrant flush');
    if (!structural && !dirty.size) return;
    const wrapper = componentMap.get(session.key)?.vd.value;
    const current = session.content;
    if (!wrapper || wrapper.il || wrapper.children?.[0] !== current || !current)
      throw Error('C4 lost its owner');
    const batchItems = items,
      batchKeys = keys,
      batchIndexes = indexes,
      batchDirty = dirty;
    const batchStructural = structural,
      batchVersion = version;
    dirty = new Set();
    structural = false;
    const previousDiff = needDiffRef.value;
    busy = true;
    needDiffRef.value = true;
    try {
      if (__C4_DIAGNOSTIC__) metrics.flushes++;
      phase = 'view';
      if (batchStructural) {
        const descriptions = batchItems.map((item, index) =>
          describe(item, batchKeys[index])
        );
        const description = fragment(descriptions);
        phase = 'diff';
        const next = makeNewWDomTree(description, current);
        next.getParent = current.getParent;
        wrapper.children![0] = next;
        session.content = next;
        phase = 'commit';
        wDomUpdate(next);
        if (__C4_DIAGNOSTIC__) metrics.structural++;
      } else {
        const pending = [...batchDirty]
          .map(key => {
            const index = batchIndexes.get(key);
            if (index === undefined) throw Error('C4 unknown key');
            return { index, node: describe(batchItems[index], key) };
          })
          .sort((a, b) => a.index - b.index);
        const children = current.children![0].children!;
        for (const { index, node } of pending) {
          if (!session.active || disposed) break;
          const previous = children[index];
          phase = 'diff';
          const next = makeNewWDomTree(node, previous);
          next.getParent = previous.getParent;
          children[index] = next;
          phase = 'commit';
          wDomUpdate(next);
        }
      }
    } catch (error) {
      if (phase !== 'view') session.fault = true;
      if (version === batchVersion) {
        structural ||= batchStructural;
        for (const key of batchDirty) if (indexes.has(key)) dirty.add(key);
      }
      throw error;
    } finally {
      needDiffRef.value = previousDiff;
      phase = '';
      busy = false;
    }
    if (structural || dirty.size) enqueue();
  }
  const View = mount(() => {
    if (disposed || owner?.active) throw Error('C4 requires one active owner');
    const session: Session = {
      key: compKeyRef.value!,
      mounted: false,
      active: true,
      queued: false,
      fault: false,
    };
    owner = session;
    mountCallback(() => {
      session.mounted = true;
      if (structural || dirty.size) enqueue();
      return () => {
        session.active = false;
        session.content = undefined;
        if (owner === session) owner = undefined;
      };
    });
    return () => {
      if (!session.content) {
        const previousPhase = phase;
        phase = 'view';
        try {
          session.content = fragment(
            items.map((item, index) => describe(item, keys[index]))
          );
          structural = false;
          dirty.clear();
        } catch (error) {
          session.active = false;
          if (owner === session) owner = undefined;
          throw error;
        } finally {
          phase = previousPhase;
        }
      }
      return session.content;
    };
  });
  return {
    View,
    metrics,
    has: (key: Key) => indexes.has(key),
    set(nextItems: readonly T[]) {
      assertWritable();
      const snapshot = [...nextItems];
      const nextIndexes = new Map<Key, number>();
      const nextKeys: Key[] = [];
      snapshot.forEach((item, index) => {
        const key = keyOf(item);
        checkKey(key);
        if (nextIndexes.has(key)) throw Error('C4 duplicate key');
        nextIndexes.set(key, index);
        nextKeys[index] = key;
      });
      items = snapshot;
      keys = nextKeys;
      indexes = nextIndexes;
      version++;
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
    edit(key: Key, mutate: (item: T) => void) {
      assertWritable();
      const index = indexes.get(key);
      if (index === undefined) throw Error('C4 unknown key');
      const item = items[index];
      try {
        mutate(item);
      } finally {
        if (indexes.has(key)) {
          dirty.add(key);
          enqueue();
        }
      }
      if (keyOf(item) !== key) throw Error('C4 item key changed');
    },
    flush,
    dispose() {
      if (disposed) return;
      if (phase === 'view') throw Error('C4 dispose during view');
      disposed = true;
      items = [];
      keys = [];
      indexes.clear();
      dirty.clear();
      structural = false;
      if (owner) {
        owner.active = false;
        owner.content = undefined;
        owner = undefined;
      }
    },
  };
}

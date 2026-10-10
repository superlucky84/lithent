import { componentMap, getComponentKey, mountCallback } from 'lithent';
import type { Props, WDom } from 'lithent';
import { getRenderProtocol } from './renderProtocol';

export interface RenderBoundary {
  readonly active: boolean;
  readonly disposed: boolean;
  pause(): void;
  resume(): void;
  dispose(): void;
}

type Entry = { active: boolean; dirty: boolean };
const entries = new WeakMap<Props, Entry>();
const requested = new WeakSet<Props>();
let count = 0;
let paused = 0;
let memberships = new WeakMap<Props, Entry[]>();

// Membership outlives a component's replaced WDOM. Cache by its stable key;
// a retained node being reparented can change the ancestry of its descendants.
const reparent = () => {
  memberships = new WeakMap();
};

const ownersOf = (node: WDom): Entry[] => {
  const key = node.compKey;
  const cached = key && memberships.get(key);
  if (cached) return cached;
  const owners: Entry[] = [];
  const visited = new Set<WDom>();
  let current: WDom | undefined = node;
  while (current && !visited.has(current)) {
    visited.add(current);
    const entry = current.compKey && entries.get(current.compKey);
    if (entry) owners.push(entry);
    current = current.getParent?.();
  }
  if (key) memberships.set(key, owners);
  return owners;
};

const blocks = (node: WDom) => {
  if (!paused) return false;
  let blocked = false;
  for (const entry of ownersOf(node)) {
    if (!entry.active) {
      entry.dirty = true;
      blocked = true;
    }
  }
  return blocked;
};

/** Call in a mounter. Initial construction is allowed, even if inactive. */
export const useRenderBoundary = (initialActive = true): RenderBoundary => {
  const key = getComponentKey();
  const protocol = getRenderProtocol();
  if (!protocol?.beforePause || typeof protocol.settle !== 'function')
    throw new Error('Child freezing requires the Concurrent lifecycle core');
  if (!key) throw new Error('Use render boundary in a component mounter');
  if (requested.has(key))
    throw new Error('Use one render boundary per component');
  requested.add(key);
  const entry: Entry = { active: initialActive, dirty: false };
  let disposed = false;
  let registered = false;
  const releasePauseHooks = () => {
    if (paused) return;
    memberships = new WeakMap();
    if (protocol.blocks === blocks) delete protocol.blocks;
    if (protocol.reparent === reparent) delete protocol.reparent;
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    requested.delete(key);
    if (registered) {
      entries.delete(key);
      memberships = new WeakMap();
      count--;
      if (!entry.active) paused--;
      releasePauseHooks();
      if (!count && protocol.boundaryOwner === blocks)
        delete protocol.boundaryOwner;
    }
  };
  // Register only after commit: failed construction and SSR own no gate.
  mountCallback(() => {
    if (disposed) return;
    if (
      (protocol.boundaryOwner && protocol.boundaryOwner !== blocks) ||
      (protocol.blocks && protocol.blocks !== blocks)
    )
      throw new Error('A different render boundary adapter is installed');
    entries.set(key, entry);
    memberships = new WeakMap();
    count++;
    if (!entry.active) paused++;
    if (paused) {
      protocol.blocks = blocks;
      protocol.reparent = reparent;
    }
    registered = true;
    // Reserve the adapter independently of the callbacks used by rendering.
    protocol.boundaryOwner = blocks;
    return dispose;
  });
  return {
    get active() {
      return !disposed && entry.active;
    },
    get disposed() {
      return disposed;
    },
    pause() {
      if (disposed || !entry.active) return;
      protocol.beforePause(key);
      entry.active = false;
      if (registered) {
        paused++;
        protocol.blocks = blocks;
        protocol.reparent = reparent;
      }
    },
    resume() {
      if (disposed || entry.active) return;
      entry.active = true;
      if (registered) paused--;
      releasePauseHooks();
      if (entry.dirty) {
        entry.dirty = false;
        componentMap.get(key)?.up();
      }
    },
    dispose,
  };
};

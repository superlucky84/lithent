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

const blocks = (node: WDom) => {
  if (!paused) return false;
  const visited = new Set<WDom>();
  let current: WDom | undefined = node;
  let blocked = false;
  while (current && !visited.has(current)) {
    visited.add(current);
    const entry = current.compKey && entries.get(current.compKey);
    if (entry && !entry.active) {
      entry.dirty = true;
      blocked = true;
    }
    current = current.getParent?.();
  }
  return blocked;
};

/** Call in a mounter. Initial construction is allowed, even if inactive. */
export const useRenderBoundary = (initialActive = true): RenderBoundary => {
  const key = getComponentKey();
  const protocol = getRenderProtocol();
  if (!protocol?.beforePause)
    throw new Error('Child freezing requires the Concurrent lifecycle core');
  if (!key) throw new Error('Use render boundary in a component mounter');
  if (requested.has(key))
    throw new Error('Use one render boundary per component');
  requested.add(key);
  const entry: Entry = { active: initialActive, dirty: false };
  let disposed = false;
  let registered = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    requested.delete(key);
    if (registered) {
      entries.delete(key);
      count--;
      if (!entry.active) paused--;
      if (!count && protocol.blocks === blocks) delete protocol.blocks;
    }
  };
  // Register only after commit: failed construction and SSR own no gate.
  mountCallback(() => {
    if (disposed) return;
    if (protocol.blocks && protocol.blocks !== blocks)
      throw new Error('A different render boundary adapter is installed');
    entries.set(key, entry);
    count++;
    if (!entry.active) paused++;
    registered = true;
    protocol.blocks = blocks;
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
      protocol.beforePause();
      entry.active = false;
      if (registered) paused++;
    },
    resume() {
      if (disposed || entry.active) return;
      entry.active = true;
      if (registered) paused--;
      if (entry.dirty) {
        entry.dirty = false;
        componentMap.get(key)?.up();
      }
    },
    dispose,
  };
};

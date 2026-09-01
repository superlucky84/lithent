import { Props } from '@/types';
import { componentMap } from '@/utils/universalRef';

// ============================================================================
// Lanes (D1, D2 — DC-1 ambient, DC-2 two lanes, DC-3 MessageChannel)
// ============================================================================

export type Lane = 'sync' | 'low';

/**
 * The lane an update lands in, read at `renew()` time.
 *
 * Ambient rather than a `renew` argument so `Renew = () => boolean` keeps its
 * signature and no satellite package has to change (C3). Matches how the core
 * already carries `compKeyRef` / `needDiffRef`.
 */
const laneRef: { value: Lane } = { value: 'sync' };

/**
 * One queue per lane, still keyed by compKey. The dedup is load-bearing, not an
 * optimization: it is what discards a stale transition when a newer update for
 * the same component arrives before the queue drains.
 */
const lanes: Record<Lane, Map<Props, () => void>> = {
  sync: new Map(),
  low: new Map(),
};

/**
 * Runs `scope` with updates routed to the low lane.
 *
 * `scope` itself runs synchronously, right now — only the renders it triggers
 * are deferred. Anything `scope` defers to a later task queues at whatever lane
 * is in effect then, not this one.
 *
 * NOTE: this defers the RENDER, not the state. Lithent keeps state in the
 * component's closure and the setter mutates it eagerly, so a component that
 * also renders at sync priority in the meantime observes the new value right
 * away. Deferring the state as well would require a per-lane copy of it, which
 * the closure model rules out (P2).
 *
 * Named for that contract rather than after React's `startTransition`, which
 * promises a state snapshot and a reactive `isPending` — neither of which this
 * has (DC-15).
 */
export const deferRender = (scope: () => void) => {
  const previous = laneRef.value;
  laneRef.value = 'low';
  try {
    scope();
  } finally {
    // Restored even on throw: a stuck `low` would silently downgrade every
    // later update in the app.
    laneRef.value = previous;
  }
};

// ============================================================================
// Scheduling
// ============================================================================

/** Time slice a low-lane flush may hold the main thread, in ms. */
const LOW_LANE_BUDGET = 5;

let syncScheduled = false;
let lowScheduled = false;
let lowDeadline = 0;
let lowPort: MessagePort | null = null;
let idleWaiters: (() => void)[] = [];

/**
 * Whether the current low-lane flush has used up its slice. Phase 8's work loop
 * consults this between units of work; for now only `flushLow` does.
 */
export const shouldYield = () => performance.now() >= lowDeadline;

const postLowTask = () => {
  if (typeof MessageChannel !== 'function') {
    setTimeout(flushLow);
    return;
  }

  if (!lowPort) {
    const channel = new MessageChannel();
    channel.port1.onmessage = flushLow;
    lowPort = channel.port2;
  }

  lowPort.postMessage(null);
};

const scheduleFlush = (lane: Lane) => {
  if (lane === 'sync') {
    if (!syncScheduled) {
      syncScheduled = true;
      queueMicrotask(flushSync);
    }
  } else if (!lowScheduled) {
    lowScheduled = true;
    postLowTask();
  }
};

/**
 * Identical in shape to the base core's `execRedrawQueue`, deliberately (BC-3).
 *
 * `syncScheduled` stays true for the whole pass so an update raised during a
 * render joins this same flush instead of booking another microtask, and the
 * clear-after-forEach ordering is what the existing suite already pins down.
 */
const flushSync = () => {
  lanes.sync.forEach((item: () => void) => {
    item();
  });

  lanes.sync.clear();
  syncScheduled = false;
};

/**
 * Drains the low lane until its slice runs out, then hands the rest to a later
 * task. Entries are removed before running so the carried-over remainder is
 * exactly what has not run yet.
 */
const flushLow = () => {
  lowScheduled = false;
  lowDeadline = performance.now() + LOW_LANE_BUDGET;

  const queue = lanes.low;

  for (const [compKey, item] of queue) {
    queue.delete(compKey);
    item();

    if (queue.size && shouldYield()) {
      scheduleFlush('low');
      return;
    }
  }

  // Drained. Entries queued by the renders above were picked up by the loop,
  // so reaching here means the lane really is empty.
  const waiters = idleWaiters;
  idleWaiters = [];
  waiters.forEach(resolve => resolve());
};

// ============================================================================
// Public wiring (same names the base core exports)
// ============================================================================

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  const comp = componentMap.get(compKey);
  if (comp) {
    comp.up = () => {
      const lane = laneRef.value;

      if (lane === 'sync') {
        // Sync wins: a pending low entry for this component would only redo
        // the render this flush is about to perform.
        lanes.low.delete(compKey);
      } else if (lanes.sync.has(compKey)) {
        return;
      }

      lanes[lane].set(compKey, exec);
      scheduleFlush(lane);
    };
  }
};

/**
 * Whether `compKey` is waiting in a lane — in either one when `lane` is omitted.
 *
 * Phase 2 wraps this as the helper-level `hasPendingRender` (RC-3). It lands here
 * already because the sync-wins rule above is otherwise unobservable: a stale
 * queue entry is also caught by `replaceWDom`'s `il` guard, so render counts
 * alone cannot tell the two mechanisms apart.
 */
export const hasPending = (compKey: Props, lane?: Lane) =>
  lane
    ? lanes[lane].has(compKey)
    : lanes.sync.has(compKey) || lanes.low.has(compKey);

/**
 * Resolves once the low lane has drained — DC-9's answer to BC-4.
 *
 * `nextTick()` is a microtask, so `await nextTick()` only guarantees a sync
 * commit; low-lane work is a task and is still pending at that point. Rather
 * than redefine `nextTick` (12 call sites across the satellites depend on it),
 * the lane-aware wait is a separate function.
 *
 * On the base core there is no low lane, so the helper wrapper resolves
 * immediately — which is the truthful answer there, not a stub.
 */
export const whenIdle = (): Promise<void> =>
  lanes.low.size || lowScheduled
    ? new Promise<void>(resolve => {
        idleWaiters.push(resolve);
      })
    : Promise.resolve();

// ============================================================================
// Store consistency (D6 — DC-5 version check)
// ============================================================================

/**
 * Monotonic counter bumped by `lithent/helper`'s store on every write.
 *
 * The wiring is one-directional and optional on purpose. The core cannot import
 * the helper (that would invert the dependency), and the helper has to keep
 * building and running against the FROZEN base core, which has no such counter.
 * So the helper reaches for `notifyStoreWrite` on the core's module namespace
 * and calls it only if it is there — `undefined` on the base core, where the
 * store then behaves exactly as it always did.
 */
const storeVersionRef = { value: 0 };

/** Read by the build/commit pair in `wDom.ts` to detect a write mid-build. */
export const storeVersion = () => storeVersionRef.value;

export const notifyStoreWrite = () => {
  storeVersionRef.value += 1;
};

export const componentUpdate = (compKey: Props) => () => {
  const comp = componentMap.get(compKey);
  const up = comp && comp.up;
  if (up) {
    up();
    return true;
  }
  return false;
};

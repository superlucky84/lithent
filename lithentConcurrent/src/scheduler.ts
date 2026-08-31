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
 * Only synchronous work inside `scope` is covered — anything deferred to a
 * later task queues at the lane in effect then.
 *
 * NOTE: this defers the RENDER, not the state. Lithent keeps state in the
 * component's closure and the setter mutates it eagerly, so a component that
 * also renders at sync priority in the meantime observes the transition value
 * right away. Deferring the state as well would require a per-lane copy of it,
 * which the closure model rules out (P2).
 */
export const startTransition = (scope: () => void) => {
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
 * Phase 2 wraps this as the helper-level `isPending` (RC-3). It lands here
 * already because the sync-wins rule above is otherwise unobservable: a stale
 * queue entry is also caught by `replaceWDom`'s `il` guard, so render counts
 * alone cannot tell the two mechanisms apart.
 */
export const hasPending = (compKey: Props, lane?: Lane) =>
  lane
    ? lanes[lane].has(compKey)
    : lanes.sync.has(compKey) || lanes.low.has(compKey);

export const componentUpdate = (compKey: Props) => () => {
  const comp = componentMap.get(compKey);
  const up = comp && comp.up;
  if (up) {
    up();
    return true;
  }
  return false;
};

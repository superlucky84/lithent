import type { CompKey, WDom } from '@/types';

/**
 * Update session for concurrent/interruptible rendering.
 * Keeps runtime logic in utils while sharing a pure type shape.
 */
export type UpdateSession = {
  id: symbol;
  compKeyRef: { value: CompKey | null };
  depth: number;
  execute: (work: () => void) => void;
  shouldDefer: () => boolean;
  isConcurrentMode: boolean;
  pendingWorkCount: number;
  upCBQueue: Array<{
    wDom: WDom;
    depth: number;
  }>;
};

export type WorkScheduler = {
  scheduleWork: (compKey: CompKey, work: () => void, priority: number) => void;
  cancelWork?: (compKey: CompKey) => void;
};

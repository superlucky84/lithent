import { CompKey, Props, Renew } from '@/types';
import {
  componentMap,
  createUpdateSession,
  activateSession,
  deactivateSession,
  sessionWorkStart,
  sessionWorkComplete,
  setScheduler,
  getScheduler,
  getSchedulerContext,
  getActiveSession,
  getComponentKey,
} from '@/utils/universalRef';
import { runUpdatedQueueFromWDom } from '@/hook/internal/useUpdate';
import type { UpdateSession, WorkScheduler } from '@/types/session';

export type RenewSchedulerOptions = {
  onPendingChange?: (pending: boolean) => void;
};

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
};

// Execute all pending upCB callbacks after session completes
// Executes in reverse depth order (leaf → root) to ensure child DOM is ready
const executeSessionUpCBQueue = (session: UpdateSession) => {
  for (let i = session.upCBQueue.length - 1; i >= 0; i--) {
    const { wDom } = session.upCBQueue[i];
    runUpdatedQueueFromWDom(wDom, session.id);
  }

  // Clear queue after execution
  session.upCBQueue = [];
};

const basicScheduler = (key: Props, work: () => void) => {
  redrawQueue.set(key, work);
  if (!redrawQueueTimeout) {
    redrawQueueTimeout = true;
    queueMicrotask(execRedrawQueue);
  }
};

const basicShouldDefer = () => false;

const createSessionForRun = (
  compKey: Props,
  scheduler: WorkScheduler | null
): UpdateSession => {
  const scheduleWork = scheduler
    ? (key: Props, work: () => void) => scheduler.scheduleWork(key, work, 0)
    : basicScheduler;

  const session = createUpdateSession(compKey, scheduleWork, basicShouldDefer);

  if (scheduler) {
    session.shouldDefer = () => session.depth > 0;
    session.isConcurrentMode = true;
    const schedulerContext = getSchedulerContext();
    schedulerContext?.attachSession?.(session, compKey);
  } else {
    session.shouldDefer = basicShouldDefer;
    session.isConcurrentMode = false;
  }

  return session;
};

export const createScheduler = (scheduler: WorkScheduler) => {
  const pendingFinalizers = new Map<CompKey, Map<symbol, () => void>>();
  let lastKnownCompKey: CompKey | null = null;

  const resolveCompKey = (): CompKey | null => {
    const compKey = getComponentKey();
    if (compKey) {
      lastKnownCompKey = compKey;
      return compKey;
    }
    return lastKnownCompKey;
  };

  const flushFinalizersForKey = (
    compKey: CompKey | null,
    shouldRunCallbacks: boolean
  ) => {
    if (!compKey) {
      return;
    }

    const finalizers = pendingFinalizers.get(compKey);
    if (!finalizers) {
      return;
    }

    if (shouldRunCallbacks) {
      finalizers.forEach(finalize => finalize());
    }
    pendingFinalizers.delete(compKey);
  };

  const flushAllFinalizers = (shouldRunCallbacks: boolean) => {
    Array.from(pendingFinalizers.keys()).forEach(key =>
      flushFinalizersForKey(key, shouldRunCallbacks)
    );
  };

  const cancelPendingWork = (options?: {
    runFinalizers?: boolean;
    compKey?: CompKey | null;
  }) => {
    const shouldRun = options?.runFinalizers ?? true;
    const compKey = options?.compKey ?? resolveCompKey();
    if (compKey) {
      scheduler.cancelWork?.(compKey);
      flushFinalizersForKey(compKey, shouldRun);
      return;
    }
    flushAllFinalizers(shouldRun);
  };

  const bindRenewScheduler = (
    renew: Renew,
    options?: RenewSchedulerOptions
  ): Renew => {
    return () => {
      const compKey = resolveCompKey();
      cancelPendingWork({ runFinalizers: false, compKey });

      if (options?.onPendingChange) {
        const pendingChange = options.onPendingChange;
        setScheduler(scheduler, {
          onPendingChange: pendingChange,
          attachSession: (session, compKey) => {
            lastKnownCompKey = compKey;
            const finalize = () => {
              const finalizers = pendingFinalizers.get(compKey);
              if (!finalizers?.has(session.id)) {
                return;
              }
              finalizers.delete(session.id);
              if (!finalizers.size) {
                pendingFinalizers.delete(compKey);
              }
              pendingChange(false);
              renew();
            };

            let finalizers = pendingFinalizers.get(compKey);
            if (!finalizers) {
              finalizers = new Map();
              pendingFinalizers.set(compKey, finalizers);
            }

            finalizers.set(session.id, finalize);
            session.onConcurrentComplete = finalize;
          },
        });
        pendingChange(true);
      } else {
        setScheduler(scheduler);
      }

      return renew();
    };
  };

  const runWithScheduler = (
    compKey: CompKey,
    work: () => void,
    priority = 0
  ) => {
    scheduler.scheduleWork(compKey, work, priority);
  };

  return { bindRenewScheduler, runWithScheduler, cancelPendingWork };
};

export const setRedrawAction = (compKey: Props, domUpdate: () => void) => {
  const comp = componentMap.get(compKey);
  if (!comp) return;

  comp.up = (sessionOverride?: UpdateSession | null) => {
    const session = sessionOverride ?? createSessionForRun(compKey, null);

    const scheduleRun = () => {
      activateSession(session);
      session.depth = -1; // Start from -1 so root component becomes depth 0

      domUpdate();

      // Complete scheduleRun tracking and execute upCB queue only in concurrent mode
      if (session.isConcurrentMode) {
        sessionWorkComplete(session, () => {
          // All deferred scheduleRun complete - execute pending upCB callbacks
          executeSessionUpCBQueue(session);
          session.onConcurrentComplete?.();
          session.onConcurrentComplete = null;
        });
      }

      deactivateSession();
    };

    // Execute using session's strategy (batched async by default, can be overridden)
    session.execute(scheduleRun);
  };
};

export const componentUpdate = (compKey: Props) => () => {
  const comp = componentMap.get(compKey);
  const up = comp && comp.up;

  if (!up) {
    setScheduler(null);
    return false;
  }

  const activeSession = getActiveSession();
  const shouldReuseActiveSession =
    activeSession && activeSession.isConcurrentMode;

  if (shouldReuseActiveSession && activeSession) {
    sessionWorkStart(activeSession);
    up(activeSession);
    return true;
  }

  const customScheduler = getScheduler();
  const session = createSessionForRun(compKey, customScheduler);
  setScheduler(null);

  if (session.isConcurrentMode) {
    sessionWorkStart(session);
  }

  up(session);
  return true;
};

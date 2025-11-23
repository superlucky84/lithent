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
  getActiveSession,
} from '@/utils/universalRef';
import { runUpdatedQueueFromWDom } from '@/hook/internal/useUpdate';
import type { UpdateSession, WorkScheduler } from '@/types/session';

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
  session.upCBQueue.forEach(({ wDom }) => {
    runUpdatedQueueFromWDom(wDom);
  });

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
  } else {
    session.shouldDefer = basicShouldDefer;
    session.isConcurrentMode = false;
  }

  return session;
};

export const createScheduler = (scheduler: WorkScheduler) => {
  const bindRenewScheduler = (renew: Renew): Renew => {
    return () => {
      setScheduler(scheduler);
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

  return { bindRenewScheduler, runWithScheduler };
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

import { Props } from '@/types';
import {
  componentMap,
  createUpdateSession,
  activateSession,
  deactivateSession,
  sessionWorkStart,
  sessionWorkComplete,
  getActiveSession,
  registerComponentScheduler,
  getRegisteredComponentScheduler,
  pushSchedulerContext,
  popSchedulerContext,
  peekSchedulerContext,
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
  } else {
    session.shouldDefer = basicShouldDefer;
    session.isConcurrentMode = false;
  }

  return session;
};

export const setRedrawAction = (compKey: Props, domUpdate: () => void) => {
  const comp = componentMap.get(compKey);
  if (!comp) return;

  const inheritedScheduler = peekSchedulerContext();
  if (inheritedScheduler) {
    registerComponentScheduler(compKey, inheritedScheduler);
  }

  comp.up = (sessionOverride?: UpdateSession | null) => {
    const session = sessionOverride ?? createSessionForRun(compKey, null);

    const scheduleRun = () => {
      activateSession(session);
      session.depth = -1; // Start from -1 so root component becomes depth 0

      domUpdate();

      // Complete scheduleRun tracking and execute upCB queue only in concurrent mode
      if (session.isConcurrentMode) {
        sessionWorkComplete(session, () => {
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

  const registeredScheduler = getRegisteredComponentScheduler(compKey);
  const session = createSessionForRun(compKey, registeredScheduler);

  if (session.isConcurrentMode) {
    sessionWorkStart(session);
  }

  const shouldPushSchedulerContext = !!registeredScheduler;
  if (shouldPushSchedulerContext) {
    pushSchedulerContext(registeredScheduler);
  }

  try {
    up(session);
  } finally {
    if (shouldPushSchedulerContext) {
      popSchedulerContext();
    }
  }
  return true;
};

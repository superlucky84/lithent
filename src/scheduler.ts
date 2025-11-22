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
  // Sort by depth in descending order (deeper components first)
  session.upCBQueue
    .sort((a, b) => b.depth - a.depth)
    .forEach(({ wDom }) => {
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

export const createScheduler = (scheduler: WorkScheduler) => {
  const bindRenewScheduler = (renew: Renew) => {
    setScheduler(scheduler);
    renew();
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
  if (componentMap.get(compKey)) {
    // Create a new session for this update and capture it in closure
    // Pass scheduler that uses redrawQueue + microtask (default behavior)

    componentMap.get(compKey)!.up = () => {
      let session: UpdateSession;
      const customScheduler = getScheduler();
      const shouldDefer = customScheduler ? () => session.depth > 0 : undefined;

      session = createUpdateSession(
        compKey,
        customScheduler
          ? (key: Props, work: () => void) =>
              customScheduler.scheduleWork(key, work, 0)
          : basicScheduler,
        shouldDefer
      );
      setScheduler(null);

      // Wrap domUpdator with session activation/deactivation
      const scheduleRun = () => {
        activateSession(session);
        session.depth = -1; // Start from -1 so root component becomes depth 0

        // Track scheduleRun and execute upCB queue only in concurrent mode
        if (session.isConcurrentMode) {
          sessionWorkStart(session);
        }

        domUpdate();

        // Complete scheduleRun tracking and execute upCB queue in concurrent mode
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
  }
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

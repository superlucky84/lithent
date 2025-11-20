import { Props } from '@/types';
import {
  componentMap,
  createUpdateSession,
  activateSession,
  deactivateSession,
  sessionWorkStart,
  sessionWorkComplete,
} from '@/utils/universalRef';
import { runUpdatedQueueFromWDom } from '@/hook/internal/useUpdate';
import type { UpdateSession } from '@/types/session';

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

export const setRedrawAction = (compKey: Props, domUpdate: () => void) => {
  if (componentMap.get(compKey)) {
    // Create a new session for this update and capture it in closure
    // Pass scheduler that uses redrawQueue + microtask (default behavior)

    // Setting Scheduler
    const session = createUpdateSession(
      compKey,
      basicScheduler
      // shouldDefer strategy will be determined by scheduler or global config
    );

    componentMap.get(compKey)!.up = () => {
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

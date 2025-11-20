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
const executeSessionUpCBQueue = (
  session: import('@/utils/universalRef').UpdateSession
) => {
  // Sort by depth in descending order (deeper components first)
  session.upCBQueue
    .sort((a, b) => b.depth - a.depth)
    .forEach(({ wDom }) => {
      runUpdatedQueueFromWDom(wDom);
    });

  // Clear queue after execution
  session.upCBQueue = [];
};

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  if (componentMap.get(compKey)) {
    // Create a new session for this update and capture it in closure
    // Pass scheduler that uses redrawQueue + microtask (default behavior)

    // 여기서 스캐줄러 세팅
    const session = createUpdateSession(
      compKey,
      (key, work) => {
        redrawQueue.set(key, work);
        if (!redrawQueueTimeout) {
          redrawQueueTimeout = true;
          queueMicrotask(execRedrawQueue);
        }
      }
      // shouldDefer strategy will be determined by scheduler or global config
    );

    // 여기서 실행전 세션 변경 및 세션 초기화
    componentMap.get(compKey)!.up = () => {
      // Wrap exec with session activation/deactivation
      const work = () => {
        activateSession(session);
        session.depth = -1; // Start from -1 so root component becomes depth 0

        // Start tracking root component work
        sessionWorkStart(session);

        exec();

        // Complete root component work and execute upCB queue if all work done
        sessionWorkComplete(session, () => {
          // All deferred work complete - execute pending upCB callbacks
          if (session.isConcurrentMode) {
            executeSessionUpCBQueue(session);
          }
        });

        deactivateSession();
      };

      // Execute using session's strategy (batched async by default, can be overridden)
      session.execute(work);
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

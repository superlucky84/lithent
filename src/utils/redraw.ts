import { Props } from '@/types';
import {
  componentMap,
  createUpdateSession,
  activateSession,
  deactivateSession,
} from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
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
        exec();
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

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
    const session = createUpdateSession(compKey, (key, work) => {
      redrawQueue.set(key, work);
      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
    });

    componentMap.get(compKey)!.up = () => {
      // Wrap exec with session activation/deactivation
      const work = () => {
        activateSession(session);
        try {
          exec();
        } finally {
          deactivateSession();
        }
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

import { Props } from '@/types';
import { componentMap } from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  const comp = componentMap.get(compKey);
  if (comp) {
    comp.up = () => {
      redrawQueue.set(compKey, exec);

      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
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

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
};

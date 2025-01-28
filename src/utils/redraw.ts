import { Props } from '@/types';
import { componentMap } from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  if (componentMap.get(compKey)) {
    componentMap.get(compKey)!.up = () => {
      redrawQueue.set(compKey, exec);

      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
    };
  }
};

export const componentUpdate = (compKey: Props) => () => {
  const up = componentMap.get(compKey)?.up;
  let result = false;
  if (up) {
    up();
    result = true;
  }

  return result;
};

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
};

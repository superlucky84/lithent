import { Props } from '@/types';
import { componentRef } from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  if (componentRef.get(compKey)) {
    componentRef.get(compKey)!.up = () => {
      redrawQueue.set(compKey, exec);

      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
    };
  }
};

export const componentUpdate = (compKey: Props) => () => {
  const up = componentRef.get(compKey)?.up;
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

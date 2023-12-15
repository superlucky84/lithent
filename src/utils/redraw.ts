import { Props } from '@/types';
import { componentRef } from '@/utils/universalRef';

let redrawQueue: { compKey: Props; exec: () => void }[] = [];
let redrawQueueTimeout: boolean = false;

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  componentRef.get(compKey)!.up = () => {
    redrawQueue.push({
      compKey,
      exec,
    });

    if (!redrawQueueTimeout) {
      redrawQueueTimeout = true;
      queueMicrotask(execRedrawQueue);
    }
  };
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
  redrawQueue.forEach(item => {
    item.exec();
  });

  redrawQueue = [];
  redrawQueueTimeout = false;
};

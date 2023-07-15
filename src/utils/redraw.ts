import { Props, WDom, RedrawQueueList } from '@/types';
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

const recursiveGetChildKeys = (wDom: WDom, result: Props[]) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.compKey;
    if (childComKey) {
      result.push(childComKey);
    }

    recursiveGetChildKeys(item, result);
  });
};

const execRedrawQueue = () => {
  let childItemList: Props[] = [];

  redrawQueue.forEach(item => {
    const childVd = componentRef.get(item.compKey)?.vd?.value;
    if (childVd) {
      recursiveGetChildKeys(childVd, childItemList);
    }
  });

  const addedKey: Props[] = [];
  const result = redrawQueue.reduce((acc, item) => {
    const { compKey } = item;

    if (childItemList.includes(compKey) || addedKey.includes(compKey)) {
      return acc;
    }

    addedKey.push(compKey);
    acc.push(item);

    return acc;
  }, [] as RedrawQueueList);

  while (result.length) {
    const action = result.shift();
    if (action) {
      action.exec();
    }
  }

  redrawQueue = [];
  redrawQueueTimeout = false;
};

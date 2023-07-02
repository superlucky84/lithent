import { ComponentRef, ComponentSubKey, Props, WDom } from '@/types';

type RedrawQueueList = {
  compKey: Props;
  exec: () => void;
}[];

let redrawQueue: { compKey: Props; exec: () => void }[] = [];
let redrawQueueTimeout: boolean = false;

/**
 * Common
 */
export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentRef: ComponentRef = new WeakMap();

export const componentRender = (compKey: Props) => () => {
  const up = componentRef.get(compKey)?.up;
  let result = false;
  if (up) {
    up();
    result = true;
  }

  return result;
};

const setComponetRef = (compKey: Props) => {
  componentRef.set(compKey, {
    vd: { value: null },
    up: () => {},
    upR: [],
    upS: { value: 0 },
    upD: [],
    upCB: [],
    mts: [],
    umts: [],
  });
};

export const getComponentKey = () => compKeyRef.value;

export const getComponentSubInfo = (compKey: Props, subKey: ComponentSubKey) =>
  componentRef.get(compKey)![subKey];

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

export const initUpdateHookState = (compKey: Props) =>
  (compKeyRef.value = compKey);

export const initMountHookState = (compKey: Props) => {
  compKeyRef.value = compKey;
  setComponetRef(compKey);
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

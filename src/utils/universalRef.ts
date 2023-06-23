import { ComponentRef, ComponentSubKey, Props, WDom } from '@/types';

type RedrawQueueList = {
  componentKey: Props;
  exec: () => void;
}[];

/**
 * Common
 */
export const componentKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentRef: ComponentRef = new WeakMap();
export const redrawQueue: {
  value: { componentKey: Props; exec: () => void }[];
} = { value: [] };
export const redrawQueueTimeout: { value: null | number } = { value: null };
export const componentRender = (componentKey: Props) => () => {
  const up = componentRef.get(componentKey)?.up;
  let result = false;
  if (up) {
    up();
    result = true;
  }

  return result;
};

const setComponetRef = (componentKey: Props) => {
  componentRef.set(componentKey, {
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

export const getComponentKey = () => componentKeyRef.value;

export const getComponentSubInfo = (
  componentKey: Props,
  subKey: ComponentSubKey
) => componentRef.get(componentKey)![subKey];

export const setRedrawAction = (componentKey: Props, exec: () => void) => {
  componentRef.get(componentKey)!.up = () => {
    redrawQueue.value.push({
      componentKey,
      exec,
    });
    if (!redrawQueueTimeout.value) {
      redrawQueueTimeout.value = setTimeout(execRedrawQueue);
    }
  };
};

export const initUpdateHookState = (componentKey: Props) =>
  (componentKeyRef.value = componentKey);

export const initMountHookState = (componentKey: Props) => {
  componentKeyRef.value = componentKey;
  setComponetRef(componentKey);
};

const recursiveGetChildKeys = (wDom: WDom, result: Props[]) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.componentKey;
    if (childComKey) {
      result.push(childComKey);
    }

    recursiveGetChildKeys(item, result);
  });
};

const execRedrawQueue = () => {
  let childItemList: Props[] = [];

  redrawQueue.value.forEach(item => {
    const childVd = componentRef.get(item.componentKey)?.vd?.value;
    if (childVd) {
      recursiveGetChildKeys(childVd, childItemList);
    }
  });

  const addedKey: Props[] = [];
  const result = redrawQueue.value.reduce((acc, item) => {
    const { componentKey } = item;

    if (
      childItemList.includes(componentKey) ||
      addedKey.includes(componentKey)
    ) {
      return acc;
    }

    addedKey.push(componentKey);
    acc.push(item);

    return acc;
  }, [] as RedrawQueueList);

  while (result.length) {
    const action = result.shift();
    if (action) {
      action.exec();
    }
  }
};

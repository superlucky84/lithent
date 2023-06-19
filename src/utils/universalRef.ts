import { ComponentRef, ComponentSubKey, Props, NodeChildKey } from '@/types';

type RedrawQueueList = {
  componentKey: Props;
  nodeChildKey: Props;
  exec: () => void;
}[];

/**
 * Common
 */
export const componentKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentRef: ComponentRef = new WeakMap();
export const redrawQueue: {
  value: { componentKey: Props; nodeChildKey: Props; exec: () => void }[];
} = { value: [] };
export const redrawQueueTimeout: { value: null | number } = { value: null };
export const nodeChildKeyList: { value: NodeChildKey[] } = { value: [] };

export const pushNodeChildKey = (key: Props) => {
  // nodeChildKeyList.value.forEach(item => item.value.push(key));
  const nodeChild = nodeChildKeyList.value.pop();
  if (nodeChild) {
    nodeChild.value = key;
  }
};

export const cleanNodeChildKey = () => (nodeChildKeyList.value = []);

export const startMakeNodeChildKey = (componentKey: Props) => {
  const nodeChildKey: NodeChildKey = { value: {} };
  pushNodeChildKey(componentKey);
  nodeChildKeyList.value.push(nodeChildKey);

  return nodeChildKey;
};

export const componentRender = (componentKey: Props) => () => {
  const up = componentRef.get(componentKey)?.up;
  let result = false;
  if (up) {
    up();
    result = true;
  }

  return result;
};

export const setComponetRef = (componentKey: Props) => {
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

export const setRedrawAction = (
  componentKey: Props,
  nodeChildKey: { value: Props },
  exec: () => void
) => {
  componentRef.get(componentKey)!.up = () => {
    redrawQueue.value.push({
      componentKey,
      nodeChildKey: nodeChildKey.value,
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

const findNodeChilds = (nodeChildKey: Props, result: Props[]): Props[] => {
  if (nodeChildKey) {
    result.push(nodeChildKey);
    const childVd = componentRef.get(nodeChildKey)?.vd?.value;

    if (childVd?.nodeChildKey?.value) {
      return findNodeChilds(childVd.nodeChildKey.value, result);
    }
  }

  return result;
};

const execRedrawQueue = () => {
  let childItemList: Props[] = [];

  redrawQueue.value.forEach(item => {
    childItemList = childItemList.concat(
      findNodeChilds(item.nodeChildKey, childItemList)
    );
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

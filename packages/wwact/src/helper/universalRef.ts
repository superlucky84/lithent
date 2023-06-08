import {
  UseDataStoreValue,
  ComponentRef,
  ComponentSubKey,
  Props,
} from '@/types';

type redrawQueueList = {
  componentKey: Props;
  nodeChildKey: Props[];
  exec: () => void;
}[];

/**
 * Common
 */
export const componentKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentRef: ComponentRef = new WeakMap();
export const redrawQueue: {
  value: { componentKey: Props; nodeChildKey: Props[]; exec: () => void }[];
} = { value: [] };
export const redrawQueueTimeout: { value: null | number } = { value: null };

/**
 * DataStore
 */
export const dataStoreStore: { [key: string]: UseDataStoreValue } = {};
export const dataStoreRenderQueue: {
  [key: string]: (() => (() => void) | undefined)[];
} = {};

/**
 * Router
 */
export const routerParams: { value: { [key: string]: string } } = { value: {} };

export const componentRender = (componentKey: Props) => () =>
  componentRef.get(componentKey)?.up();

export const setComponetRef = (componentKey: Props) => {
  componentRef.set(componentKey, {
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

export const setRedrawAction = ({
  componentKey,
  nodeChildKey,
  exec,
}: {
  componentKey: Props;
  nodeChildKey: Props[];
  exec: () => void;
}) => {
  componentRef.get(componentKey)!.up = () => {
    redrawQueue.value.push({
      componentKey,
      nodeChildKey,
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

const execRedrawQueue = () => {
  let childItemList: Props[] = [];

  redrawQueue.value.forEach(
    item => (childItemList = childItemList.concat(item.nodeChildKey))
  );

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
  }, [] as redrawQueueList);

  while (result.length) {
    const action = result.shift();
    if (action) {
      action.exec();
    }
  }
};

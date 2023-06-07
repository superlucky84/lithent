import {
  UseDataStoreValue,
  ComponentSubKey,
  ComponentRef,
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

/**
 * Ref helpers
 */
export const makeQueueRef = (
  componentKey: Props,
  name: ComponentSubKey
): (() => void)[] => {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }

  if (name === 'updateCallbacks' || name === 'mounts' || name === 'unmounts') {
    componentRef.get(componentKey)![name] ??= [];
  }

  return componentRef.get(componentKey)![name] as (() => void)[];
};

export const makeUpdatedStore = (
  componentKey: Props
): [{ value: number }, unknown[][]] => {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }
  componentRef.get(componentKey)!.updateDefs ??= [];
  componentRef.get(componentKey)!.updateSeq ??= { value: 0 };

  return [
    componentRef.get(componentKey)!.updateSeq as {
      value: number;
    },
    componentRef.get(componentKey)!.updateDefs as unknown[][],
  ];
};

export const makeStateStore = <T>(
  componentKey: Props
): [{ value: number }, T[]] => {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }
  componentRef.get(componentKey)!.stateVal ??= [];
  componentRef.get(componentKey)!.stateSeq ??= { value: 0 };

  return [
    componentRef.get(componentKey)!.stateSeq as {
      value: number;
    },
    componentRef.get(componentKey)!.stateVal as T[],
  ];
};

export const setRedrawAction = ({
  componentKey,
  nodeChildKey,
  exec,
}: {
  componentKey: Props;
  nodeChildKey: Props[];
  exec: () => void;
}) => {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }

  componentRef.get(componentKey)!.redrawAction = () => {
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

export const initMountHookState = (componentKey: Props) =>
  (componentKeyRef.value = componentKey);

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

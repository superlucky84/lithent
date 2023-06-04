import {
  UseDataStoreValue,
  ComponentSubKey,
  ComponentRef,
  Props,
} from '@/types';

/**
 * Common
 */
export const componentKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentRef: ComponentRef = new WeakMap();
export const redrawQueue: { value: (() => void)[] } = { value: [] };
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
export function makeQueueRef(
  componentKey: Props,
  name: ComponentSubKey
): (() => void)[] {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }

  if (
    name === 'updateSubscribeList' ||
    name === 'mountSubscribeList' ||
    name === 'unmountSubscribeList'
  ) {
    componentRef.get(componentKey)![name] ??= [];
  }

  return componentRef.get(componentKey)![name] as (() => void)[];
}

export function makeUpdatedStore(
  componentKey: Props
): [{ value: number }, unknown[][]] {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }
  componentRef.get(componentKey)!.updateSubscribeDefList ??= [];
  componentRef.get(componentKey)!.updateSubscribeSequence ??= { value: 0 };

  return [
    componentRef.get(componentKey)!.updateSubscribeSequence as {
      value: number;
    },
    componentRef.get(componentKey)!.updateSubscribeDefList as unknown[][],
  ];
}

export function setRedrawAction(componentKey: Props, action: () => void) {
  if (!componentRef.get(componentKey)) {
    componentRef.set(componentKey, {});
  }

  componentRef.get(componentKey)!.redrawAction = () => {
    redrawQueue.value.push(action);
    if (!redrawQueueTimeout.value) {
      redrawQueueTimeout.value = setTimeout(execRedrawQueue);
    }
  };
}

export function initUpdateHookState(componentKey: Props) {
  componentKeyRef.value = componentKey;
}

export function initMountHookState(componentKey: Props) {
  componentKeyRef.value = componentKey;
}

function execRedrawQueue() {
  redrawQueue.value = redrawQueue.value.filter(
    (item, index) => redrawQueue.value.indexOf(item) === index
  );

  while (redrawQueue.value.length) {
    const action = redrawQueue.value.shift();
    if (action) {
      action();
    }
  }
  redrawQueueTimeout.value = null;
}

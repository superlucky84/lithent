import { UseDataStoreValue, ComponentSubKey, ComponentRef } from '@/types';

/**
 * Common
 */
export const componentKeyRef: { value: symbol } = { value: Symbol('null') };
export const needDiffRef: { value: boolean } = { value: false };
export const updatedCallSeq: { value: number } = { value: 0 };
export const componentRef: ComponentRef = {};

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
  componentKey: symbol,
  name: ComponentSubKey
): (() => void)[] {
  componentRef[componentKey] ??= {};

  if (
    name === 'updateSubscribeList' ||
    name === 'mountSubscribeList' ||
    name === 'unmountSubscribeList'
  ) {
    componentRef[componentKey][name] ??= [];
  }

  return componentRef[componentKey][name] as (() => void)[];
}

export function makeUpdatedStore(
  componentKey: symbol
): WeakMap<() => void, unknown[]> {
  componentRef[componentKey] ??= {};
  componentRef[componentKey].updateSubscribeDefList ??= new WeakMap<
    () => void,
    unknown[]
  >();

  return componentRef[componentKey].updateSubscribeDefList as WeakMap<
    () => void,
    unknown[]
  >;
}

export function setRedrawAction(componentKey: symbol, action: () => void) {
  componentRef[componentKey] ??= {};
  componentRef[componentKey].redrawAction = action;
}

export function initUpdateHookState(componentKey: symbol) {
  updatedCallSeq.value = 0;
  componentKeyRef.value = componentKey;
}

export function initMountHookState(componentKey: symbol) {
  updatedCallSeq.value = 0;
  componentKeyRef.value = componentKey;
}

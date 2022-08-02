import { UseDataStoreValue, ComponentSubKey, ComponentRef } from '@/types';

/**
 * Common
 */
export const stateKeyRef: { value: symbol } = { value: Symbol('null') };
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
  stateKey: symbol,
  name: ComponentSubKey
): (() => void)[] {
  componentRef[stateKey] ??= {};

  if (
    name === 'updateSubscribeList' ||
    name === 'mountSubscribeList' ||
    name === 'unmountSubscribeList'
  ) {
    componentRef[stateKey][name] ??= [];
  }

  return componentRef[stateKey][name] as (() => void)[];
}

export function makeUpdatedStore(stateKey: symbol): (() => void)[] {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].updateSubscribeDefList ??= [];

  return componentRef[stateKey].updateSubscribeDefList as (() => void)[];
}

export function setRedrawAction(stateKey: symbol, action: () => void) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].redrawAction = action;
}

export function initUpdateHookState(stateKey: symbol) {
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

export function initMountHookState(stateKey: symbol) {
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

import { UseDataStoreValue } from '@/types';

/**
 * Common
 */
export const stateKeyRef: { value: symbol } = { value: Symbol('null') };
export const needDiffRef: { value: boolean } = { value: false };

type ComponentSubKey =
  | 'redrawAction'
  | 'dataStore'
  | 'updateSubscribeDefList'
  | 'updateSubscribeList'
  | 'mountSubscribeList'
  | 'unmountSubscribeList';

type ComponentRef = {
  [key: symbol]: {
    redrawAction?: () => void;
    dataStore?: unknown[];
    updateSubscribeDefList?: any[];
    updateSubscribeList?: (() => void)[];
    mountSubscribeList?: (() => void)[];
    unmountSubscribeList?: (() => void)[];
  };
};

export const componentRef: ComponentRef = {};

/**
 * Data
 */
export const dataCallSeq: { value: number } = { value: 0 };

/**
 * DataStore
 */
export const dataStoreStore: { [key: string]: UseDataStoreValue } = {};
export const dataStoreRenderQueue: {
  [key: string]: (() => (() => void) | undefined)[];
} = {};

/**
 * Updated
 */
export const updatedCallSeq: { value: number } = { value: 0 };

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

export function setDataStore(stateKey: symbol, data: unknown) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].dataStore ??= [];
  componentRef[stateKey].dataStore?.push(data);
}

export function initUpdateHookState(stateKey: symbol) {
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

export function initMountHookState(stateKey: symbol) {
  dataCallSeq.value = 0;
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

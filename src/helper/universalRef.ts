import { UseDataStoreValue } from '@/types';

/**
 * Common
 */
export const stateKeyRef: { value: symbol } = { value: Symbol('null') };
export const needDiffRef: { value: boolean } = { value: false };

type ComponentRef = {
  [key: symbol]: {
    redrawAction?: () => void;
    dataStore?: unknown[];
    // 모든 타입의 변수에 대해 체크해야 하기 때문에 정말 any타입임
    updatedStore?: any[];
    updatedQueue?: (() => void)[];
    mountedQueue?: (() => void)[];
    unmountQueue?: (() => void)[];
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

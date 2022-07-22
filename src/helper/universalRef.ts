/**
 * Common
 */
export const stateKeyRef: { value: symbol } = { value: Symbol('null') };
export const needDiffRef: { value: boolean } = { value: false };

type ComponentRef = {
  [key: symbol]: {
    redrawAction?: any;
    dataStore?: any;
    dataStoreQueue?: any;
    updatedStore?: any;
    updatedQueue?: any;
    mountedQueue?: any;
    unmountQueue?: any;
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
export const dataStoreStore = {};
export const dataStoreRenderQueue = {};

/**
 * Updated
 */
export const updatedCallSeq: { value: number } = { value: 0 };

/**
 * Router
 */
export const routerParams = { value: {} };

/**
 * Ref helpers
 */
export function setRedrawAction(stateKey: symbol, action: any) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].redrawAction = action;
}

export function setDataStore(stateKey: symbol, data: any) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].dataStore ??= [];
  componentRef[stateKey].dataStore.push(data);
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

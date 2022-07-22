/**
 * Common
 */
export const stateKeyRef = { value: null };
export const needDiffRef: { value: boolean } = { value: false };

// componentRef[stateKey].redrawAction
// componentRef[stateKey].dataStore
// componentRef[stateKey].dataStoreQueue
// componentRef[stateKey].updatedStore
// componentRef[stateKey].updatedQueue
// componentRef[stateKey].mountedQueue
// componentRef[stateKey].unmountQueue
export const componentRef = {};

/**
 * Data
 */
export const dataCallSeq = { value: null };

/**
 * DataStore
 */
export const dataStoreStore = {};
export const dataStoreRenderQueue = {};

/**
 * Updated
 */
export const updatedCallSeq = { value: null };

/**
 * Router
 */
export const routerParams = { value: {} };

/**
 * Ref helpers
 */
export function setRedrawAction(stateKey, action) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].redrawAction = action;
}

export function setDataStore(stateKey, data) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].dataStore ??= [];
  componentRef[stateKey].dataStore.push(data);
}

export function initUpdateHookState(stateKey) {
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

export function initMountHookState(stateKey) {
  dataCallSeq.value = 0;
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

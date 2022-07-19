/**
 * Common
 */
export const stateKeyRef = { value: null };
export const needDiffRef = { value: null };

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
 * Mounted
 */
export const mountedCallSeq = { value: null };

/**
 * UnMount
 */
export const unmountCallSeq = { value: null };

/**
 * Router
 */
export const routerParams = { value: {} };

export function setRedrawAction(stateKey, action) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].redrawAction = action;
}

export function setDataStore(stateKey, dataCallSeq, data) {
  componentRef[stateKey] ??= {};
  componentRef[stateKey].dataStore ??= {};
  componentRef[stateKey].dataStore[dataCallSeq] = data;
}

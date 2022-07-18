/**
 * Common
 */
export const stateKeyRef = { value: null };
export const needDiff = { value: null };

/**
 * Router
 */
export const routerParams = { value: {} };

/**
 * Data
 */
export const dataCallSeq = { value: null };
export const dataStore = { value: {} };
export const redrawActionMap = {};

/**
 * DataStore
 */
export const dataStoreCallSeq = { value: null };
export const dataStoreStore = { value: {} };
export const dataStoreRenderQueue = { value: {} };

/**
 * Updated
 */
export const updatedCallSeq = { value: null };
export const updatedStore = { value: {} };
export const updatedQueue = { value: {} };

/**
 * Mounted
 */
export const mountedCallSeq = { value: null };
export const mountedQueue = { value: {} };

/**
 * UnMount
 */
export const unmountCallSeq = { value: null };
export const unmountQueue = { value: {} };

/**
 * Update init state
 */
export function initUpdateHookState(stateKey) {
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

/**
 * Mount init state
 */
export function initMountHookState(stateKey) {
  dataCallSeq.value = 0;
  mountedCallSeq.value = 0;
  unmountCallSeq.value = 0;
  updatedCallSeq.value = 0;
  stateKeyRef.value = stateKey;
}

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

export function getVdomType(vDom) {
  const isComponent = checkCustemComponent(vDom);
  const isFragment = checkFragment(vDom);
  const isTagElement = checkTagElement(vDom);
  const isLoopElement = checkLoopElement(vDom);
  const isTextElement = checkTextElement(vDom);
  const isEmptyElement = checkEmptyElement(vDom);

  if (isComponent) {
    return 'component';
  } else if (isFragment) {
    return 'fragment';
  } else if (isTagElement) {
    return 'element';
  } else if (isLoopElement) {
    return 'loop';
  } else if (isTextElement) {
    return 'text';
  } else if (isEmptyElement) {
    return 'empty';
  }

  return false;
}

export const checkSameVdomWithOriginal = {
  component: checkSameCustomComponent,
  loop: checkSameLoopElement,
  text: checkSameTextElement,
  element: checkSameTagElement,
  fragment: checkSameFragment,
  empty: checkSameEmptyElement,
};

/**
 * Predicator
 */
export function checkCustemComponent(vDom) {
  return typeof vDom === 'function';
}

export function checkFragment(vDom) {
  return vDom.type === 'fragment';
}

export function checkTagElement(vDom) {
  return vDom.type === 'element';
}

export function checkLoopElement(vDom) {
  return vDom.type === 'loop';
}

export function checkTextElement(vDom) {
  return vDom.type === 'text';
}

export function checkEmptyElement(vDom) {
  return !vDom.type;
}

export function checkSameCustomComponent({ originalVdom, newVdom }) {
  return newVdom.tagName === originalVdom?.tagName;
}

export function checkSameFragment({ originalVdom, newVdom }) {
  return (
    originalVdom?.type === 'fragment' &&
    originalVdom?.children?.length === newVdom.children.length
  );
}

export function checkSameTagElement({ originalVdom, newVdom }) {
  return originalVdom?.type === 'element' && originalVdom?.tag === newVdom.tag;
}

export function checkSameLoopElement({ originalVdom, newVdom }) {
  return originalVdom?.type === newVdom.type;
}

export function checkSameTextElement({ originalVdom, newVdom }) {
  return originalVdom?.type === newVdom.type;
}

export function checkSameEmptyElement({ originalVdom, newVdom }) {
  return originalVdom?.type === newVdom.type;
}

export function isExisty(value) {
  return value !== null && value !== undefined;
}

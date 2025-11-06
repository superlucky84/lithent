import { ComponentMap, ComponentSubKey, CompKey, ComponentInfo } from '@/types';

export const wdomSymbol = Symbol.for('lithentWDomSymbol');
export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: CompKey | null } = { value: null };
export const needDiffRef: { value: boolean } = { value: false };

// Update session for concurrent/interruptible rendering
export type UpdateSession = {
  id: symbol;
  compKeyRef: { value: CompKey | null };
};

// Currently active session
let activeSession: UpdateSession | null = null;

// Create a new update session
export const createUpdateSession = (): UpdateSession => {
  return {
    id: Symbol('update-session'),
    compKeyRef: { value: null },
  };
};

// Activate a session (context switch)
export const activateSession = (session: UpdateSession): void => {
  activeSession = session;
};

// Deactivate current session
export const deactivateSession = (): void => {
  activeSession = null;
};

export const componentMap: ComponentMap = new WeakMap();
let componentMapManualMode = false;

const setComponetRef = (compKey: CompKey): void => {
  componentMap.set(compKey, {
    vd: { value: null },
    up: () => {},
    upR: [],
    upS: { value: 0 },
    upD: [],
    upCB: [],
    mts: [],
    umts: [],
    wdCB: [], // WDom creation callback queue
  });
};

export const getComponentKey = (): CompKey | null => {
  // Use active session if available, otherwise fall back to global compKeyRef
  return activeSession ? activeSession.compKeyRef.value : compKeyRef.value;
};

export const setComponentKey = (compKey: CompKey): void => {
  // Use active session if available, otherwise fall back to global compKeyRef
  if (activeSession) {
    activeSession.compKeyRef.value = compKey;
  } else {
    compKeyRef.value = compKey;
  }
};

export const getComponentSubInfo = <K extends ComponentSubKey>(
  compKey: CompKey,
  subKey: K
): ComponentInfo[K] | null => {
  const component = componentMap.get(compKey);
  if (component) {
    return component[subKey];
  }
  return null;
};

export const initUpdateHookState = (compKey: CompKey): void => {
  // Use active session if available, otherwise fall back to global compKeyRef
  if (activeSession) {
    activeSession.compKeyRef.value = compKey;
  } else {
    compKeyRef.value = compKey;
  }
};

export const initMountHookState = (compKey: CompKey): void => {
  // Use active session if available, otherwise fall back to global compKeyRef
  if (activeSession) {
    activeSession.compKeyRef.value = compKey;
  } else {
    compKeyRef.value = compKey;
  }
  setComponetRef(compKey);
};

export const setComponentMapManualMode = (enabled: boolean): void => {
  componentMapManualMode = enabled;
};

export const isComponentMapManualMode = (): boolean => componentMapManualMode;

export const runUnmountEffects = (compKey: CompKey): void => {
  const subInfo = componentMap.get(compKey);
  if (subInfo) {
    subInfo.umts.forEach(effect => effect());
    subInfo.umts = [];
  }
};

export const disposeComponentEntry = (compKey: CompKey): void => {
  runUnmountEffects(compKey);
  componentMap.delete(compKey);
};

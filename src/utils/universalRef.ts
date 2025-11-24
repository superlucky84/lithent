import { ComponentMap, ComponentSubKey, CompKey, ComponentInfo } from '@/types';
import type { UpdateSession, WorkScheduler } from '@/types/session';
export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: CompKey | null } = { value: null };
export const needDiffRef: { value: boolean } = { value: false };

// Currently active session
let activeSession: UpdateSession | null = null;

// Optional scheduler instance
let scheduler: WorkScheduler | null = null;

// Create a new update session
export const createUpdateSession = (
  compKey: CompKey,
  scheduleWork: (compKey: CompKey, work: () => void) => void,
  shouldDefer?: (() => boolean) | null
): UpdateSession => {
  const session: UpdateSession = {
    id: Symbol('update-session'),
    compKeyRef: { value: null },
    depth: 0,

    /**
     * Execute using the provided scheduler
     */
    execute: (work: () => void) => {
      scheduleWork(compKey, work);
    },

    /**
     * Default: no deferring (synchronous execution of all children)
     */
    shouldDefer: shouldDefer || (() => false),

    /**
     * Concurrent mode is enabled when shouldDefer is provided
     */
    isConcurrentMode: !!shouldDefer,

    /**
     * Initialize work counter to 0
     */
    pendingWorkCount: 0,

    /**
     * Initialize empty upCB queue
     */
    upCBQueue: [],
  };

  return session;
};

// Activate a session (context switch)
export const activateSession = (session: UpdateSession): void => {
  activeSession = session;
};

// Deactivate current session
export const deactivateSession = (): void => {
  activeSession = null;
};

// Get currently active session
export const getActiveSession = (): UpdateSession | null => {
  return activeSession;
};

// Increment pending work counter when a deferred task starts
export const sessionWorkStart = (session: UpdateSession): void => {
  session.pendingWorkCount++;
};

// Decrement pending work counter and execute callback when all work completes
export const sessionWorkComplete = (
  session: UpdateSession,
  onAllComplete: () => void
): void => {
  session.pendingWorkCount--;
  if (session.pendingWorkCount === 0) {
    onAllComplete();
  }
};

// Schedule upCB execution for after session completes
export const scheduleUpCBExecution = (
  session: UpdateSession,
  wDom: import('@/types').WDom
): void => {
  session.upCBQueue.push({ wDom, depth: session.depth });
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

  const component = componentMap.get(compKey);
  if (component && component.upS) {
    component.upS.value = 0;
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

export const setScheduler = (s: WorkScheduler | null): void => {
  scheduler = s;
};

export const getScheduler = (): WorkScheduler | null => {
  return scheduler;
};

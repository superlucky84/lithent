import { ComponentMap, ComponentSubKey, CompKey, ComponentInfo } from '@/types';

export const wdomSymbol = Symbol.for('lithentWDomSymbol');
export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: CompKey | null } = { value: null };
export const needDiffRef: { value: boolean } = { value: false };
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

export const getComponentKey = (): CompKey | null => compKeyRef.value;

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
  compKeyRef.value = compKey;
};

export const initMountHookState = (compKey: CompKey): void => {
  compKeyRef.value = compKey;
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

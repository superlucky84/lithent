import { ComponentMap, ComponentSubKey, Props } from '@/types';

export const wdomSymbol = Symbol.for('lithentWDomSymbol');
export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: Props } = { value: {} };
export const needDiffRef: { value: boolean } = { value: false };
export const componentMap: ComponentMap = new WeakMap();

const setComponetRef = (compKey: Props) => {
  componentMap.set(compKey, {
    vd: { value: null },
    up: () => {},
    upR: [],
    upS: { value: 0 },
    upD: [],
    upCB: [],
    mts: [],
    umts: [],
  });
};

export const getComponentKey = () => compKeyRef.value;

export const getComponentSubInfo = (
  compKey: Props,
  subKey: ComponentSubKey
) => {
  if (componentMap.get(compKey)) {
    return componentMap.get(compKey)![subKey];
  }
  return null;
};

export const initUpdateHookState = (compKey: Props) =>
  (compKeyRef.value = compKey);

export const initMountHookState = (compKey: Props) => {
  compKeyRef.value = compKey;
  setComponetRef(compKey);
};

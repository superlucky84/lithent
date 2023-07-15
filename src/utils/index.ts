import { WDom } from '@/types';

export const getParent = (vDom: WDom) => {
  const parentVDom = vDom.getParent && vDom.getParent();

  return parentVDom as WDom;
};

export const getEventName = (eventKey: string) =>
  eventKey.replace(/^on(.*)/, (_match, p1) => p1.toLowerCase());

export const getAttrKey = (keyName: string) =>
  keyName === 'className' ? 'class' : keyName;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;

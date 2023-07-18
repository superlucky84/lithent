import { WDom } from '@/types';

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;

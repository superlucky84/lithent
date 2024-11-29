import { WDom, Props } from '@/types';

import { wdomSymbol } from '@/utils/universalRef';

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;
export const isPropType = (obj: unknown): obj is Props => {
  return (
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    !Object.getOwnPropertySymbols(obj).includes(wdomSymbol)
  );
};

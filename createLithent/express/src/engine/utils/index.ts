import { WDom, Props } from '@/engine/types';

import { wdomSymbol } from '@/engine/utils/universalRef';

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;
export const isPropType = (obj: unknown): obj is Props => {
  return (
    typeof obj === 'object' &&
    !Object.getOwnPropertySymbols(obj).includes(wdomSymbol)
  );
};

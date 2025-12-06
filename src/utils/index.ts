import { WDom, Props } from '@/types';

import { wdomSymbol } from '@/utils/universalRef';

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

export const entries = Object.entries;
export const keys = Object.keys;

export const isObject = (target: unknown): target is Record<string, unknown> =>
  typeof target === 'object' && target !== null;

export const assign = Object.assign;
export const isPropType = (obj: unknown): obj is Props => {
  return (
    isObject(obj) &&
    !Array.isArray(obj) &&
    !Object.getOwnPropertySymbols(obj).includes(wdomSymbol)
  );
};

import { WDom, Props } from '@/types';

import { wdomSymbol } from '@/utils/universalRef';

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

// A separate scope keeps parent links from retaining a diff's old children.
export const makeParentGetter = (parent: WDom) => () => parent;

export const entries = Object.entries;
export const keys = Object.keys;

export const isEnumerableProp = (props: Props, key: string) =>
  Object.prototype.propertyIsEnumerable.call(props, key);

// DOM props use for...in, including inherited enumerable keys. A hidden own
// key shadows the same name on the prototype and must not keep an old prop.
export const hasEnumerableProp = (props: Props, key: string): boolean => {
  if (isEnumerableProp(props, key)) return true;
  const prototype = Object.getPrototypeOf(props);
  return (
    !Object.prototype.hasOwnProperty.call(props, key) &&
    !!prototype &&
    hasEnumerableProp(prototype, key)
  );
};

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

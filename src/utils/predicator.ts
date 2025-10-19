import { Fragment } from '@/wDom';
import {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  WDomType,
} from '@/types';

type WDomParam =
  | string
  | WDom
  | TagFunction
  | TagFunctionResolver
  | FragmentFunction;

/**
 * Predicator
 */

const checkPlainWDomType = (wDom: WDomParam): wDom is WDom =>
  typeof wDom === 'object' && !('resolve' in wDom);

const checkPlainType = (wDom: WDomParam, typeName: string) =>
  checkPlainWDomType(wDom) && wDom.type === typeName;

const checkSameCustomComponent = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  'ctor' in newWDom
    ? newWDom.ctor === originalWDom?.ctor
    : newWDom === originalWDom?.ctor;

const checkSameFragment = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'f' && // fragment
  originalWDom?.children?.length === newWDom?.children?.length;

const checkSameTagElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'e' && // element
  originalWDom?.tag === newWDom.tag &&
  originalWDom?.children?.length === newWDom?.children?.length;

const checkNormalTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) => checkPlainWDomType(newWDom) && originalWDom?.type === newWDom.type;

const checkLoopTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === newWDom.type &&
  ((checkExisty(getKey((newWDom.children || [])[0])) &&
    checkExisty(getKey((originalWDom?.children || [])[0]))) ||
    originalWDom?.children?.length === newWDom?.children?.length);

export const getKey = (target: WDom) =>
  target?.compProps?.key ?? target?.props?.key;

/**
 * Check if the type is virtual (fragment or loop)
 * Virtual types don't create real DOM elements themselves
 */
export const checkVirtualType = (type?: string | null) =>
  type && ['f', 'l'].includes(type); // 'f': fragment, 'l': loop

export const checkCustemComponentFunction = (
  target: WDomParam
): target is TagFunction | TagFunctionResolver =>
  (typeof target === 'function' && !checkFragmentFunction(target)) ||
  (typeof target === 'object' && 'resolve' in target);

export const checkFragmentFunction = (
  target: unknown
): target is FragmentFunction =>
  typeof target === 'function' && target === Fragment;

export const checkEmptyElement = (wDom: WDomParam) =>
  checkPlainWDomType(wDom) && !wDom.type;

export const checkExisty = (value: unknown) =>
  value !== null && value !== undefined;

export const checkStyleData = (
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> =>
  dataKey === 'style' && typeof dataValue === 'object';

export const checkRefData = (
  dataKey: string,
  dataValue: unknown
): dataValue is {
  value: HTMLElement | Element | DocumentFragment | Text | undefined;
} => dataKey === 'ref' && typeof dataValue === 'object';

export const hasAccessorMethods = (target: unknown, dataKey: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    target!.constructor.prototype,
    dataKey
  );

  return descriptor && descriptor.get && descriptor.set;
};

/**
 * Get WDom type as a single character code
 * 'c': component, 'f': fragment, 'e': element, 'l': loop, 't': text, 'et': empty/null
 */
export const getWDomType = (
  wDom: WDom | TagFunction | TagFunctionResolver
): WDomType =>
  checkCustemComponentFunction(wDom)
    ? 'c' // component
    : checkPlainType(wDom, 'f')
      ? 'f' // fragment
      : checkPlainType(wDom, 'e')
        ? 'e' // element
        : checkPlainType(wDom, 'l')
          ? 'l' // loop
          : checkPlainType(wDom, 't')
            ? 't' // text
            : 'et'; // empty/null

export const checkSameWDomWithOriginal = {
  c: checkSameCustomComponent,
  l: checkLoopTypeElement,
  t: checkNormalTypeElement,
  e: checkSameTagElement,
  f: checkSameFragment,
  et: checkNormalTypeElement,
};

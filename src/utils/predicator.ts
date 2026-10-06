import { Fragment } from '@/wDom';
import {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  WDomType,
} from '@/types';
import { isObject } from '@/utils';

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
  isObject(wDom) && !('resolve' in wDom);

const checkPlainType = (wDom: WDomParam, typeName: string) =>
  checkPlainWDomType(wDom) && wDom.type === typeName;

const checkSameCustomComponent = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  'ctor' in newWDom
    ? newWDom.ctor === (originalWDom && originalWDom.ctor)
    : newWDom === (originalWDom && originalWDom.ctor);

const checkSameFragment = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === 'f' &&
    originalWDom.children &&
    originalWDom.children.length ===
      (newWDom.children && newWDom.children.length)
  );

const checkSameTagElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === 'e' &&
    originalWDom.tag === newWDom.tag &&
    originalWDom.children &&
    originalWDom.children.length ===
      (newWDom.children && newWDom.children.length)
  );

const checkNormalTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === newWDom.type
  );

const checkLoopTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === newWDom.type &&
    ((checkExistyKey((newWDom.children || [])[0]) &&
      checkExistyKey((originalWDom.children || [])[0])) ||
      (originalWDom.children &&
        newWDom.children &&
        originalWDom.children.length === newWDom.children.length))
  );

export const getKey = (target: WDom) =>
  (target && target.compProps && target.compProps.key) ??
  (target && target.props && target.props.key);

/**
 * Check if the type is virtual (fragment or loop)
 * Virtual types don't create real DOM elements themselves
 */
export const checkVirtualType = (
  type?: string | null // 'f': fragment, 'l': loop
) => type === 'f' || type === 'l';

export const checkCustemComponentFunction = (
  target: WDomParam
): target is TagFunction | TagFunctionResolver =>
  (typeof target === 'function' && !checkFragmentFunction(target)) ||
  (isObject(target) && 'resolve' in target);

export const checkFragmentFunction = (
  target: unknown
): target is FragmentFunction =>
  typeof target === 'function' && target === Fragment;

export const checkEmptyElement = (wDom: WDomParam) =>
  checkPlainWDomType(wDom) && !wDom.type;

export const checkExistyKey = (target: WDom) => checkExisty(getKey(target));

export const checkExisty = (value: unknown) =>
  value !== null && value !== undefined;

export const checkStyleData = (
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> =>
  dataKey === 'style' && isObject(dataValue);

export const checkRefData = (
  dataKey: string,
  dataValue: unknown
): dataValue is {
  value: HTMLElement | Element | DocumentFragment | Text | undefined;
} => dataKey === 'ref' && isObject(dataValue);

// Descriptor lookups are cached per prototype+key. Keying by prototype
// rather than nodeName matters for custom elements: one rendered before its
// definition is upgraded later and gets a new prototype, which must be looked
// up again instead of reusing the "no accessor" answer for its tag name.
const accessorCache = new WeakMap<object, Map<string, boolean>>();

export const hasAccessorMethods = (target: unknown, dataKey: string) => {
  const proto = target!.constructor.prototype;
  let byKey = accessorCache.get(proto);
  if (!byKey) accessorCache.set(proto, (byKey = new Map()));
  let result = byKey.get(dataKey);

  if (result === undefined) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, dataKey);
    result = !!(descriptor && descriptor.get && descriptor.set);
    byKey.set(dataKey, result);
  }

  return result;
};

// A custom element tag whose definition has not arrived, or whose instance
// has not been upgraded yet: still a plain HTMLElement, with no accessors.
export const isPendingCustomElement = (target: unknown) =>
  (target as Element).localName.includes('-') &&
  (target as Element).constructor === HTMLElement;

/**
 * Get WDom type as a single character code
 * 'c': component, 'f': fragment, 'e': element, 'l': loop, 't': text, 'et': empty/null
 */
export const getWDomType = (
  wDom: WDom | TagFunction | TagFunctionResolver
): WDomType =>
  checkCustemComponentFunction(wDom)
    ? 'c'
    : checkPlainType(wDom, 'f')
      ? 'f'
      : checkPlainType(wDom, 'e')
        ? 'e'
        : checkPlainType(wDom, 'l')
          ? 'l'
          : checkPlainType(wDom, 't')
            ? 't'
            : 'et';

export const checkSameWDomWithOriginal = {
  c: checkSameCustomComponent,
  l: checkLoopTypeElement,
  t: checkNormalTypeElement,
  e: checkSameTagElement,
  f: checkSameFragment,
  et: checkNormalTypeElement,
};

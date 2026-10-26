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

const checkSameCustomComponent = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  'ctor' in newWDom
    ? newWDom.ctor === (originalWDom && originalWDom.ctor)
    : newWDom === (originalWDom && originalWDom.ctor);

// The checks below are reached through checkSameWDomWithOriginal only: with
// a plain node of that type (getWDomType) and an original.
const checkSameFragment = (newWDom: WDom, originalWDom: WDom): boolean =>
  originalWDom.type === 'f' &&
  // A component's node is a one-child fragment too: never update it in
  // place as a plain fragment, or the component is never unmounted, nor
  // update a plain fragment with one (a hoisted <Comp /> first drawn by a
  // redraw), or it is never mounted.
  !originalWDom.ctor &&
  !newWDom.ctor &&
  !!originalWDom.children &&
  originalWDom.children.length ===
    (newWDom.children && newWDom.children.length);

const checkSameTagElement = (newWDom: WDom, originalWDom: WDom): boolean =>
  originalWDom.type === 'e' &&
  originalWDom.tag === newWDom.tag &&
  !!originalWDom.children &&
  originalWDom.children.length ===
    (newWDom.children && newWDom.children.length);

const checkNormalTypeElement = (newWDom: WDom, originalWDom: WDom): boolean =>
  originalWDom.type === newWDom.type;

const checkLoopTypeElement = (newWDom: WDom, originalWDom: WDom): boolean =>
  originalWDom.type === newWDom.type &&
  ((checkKeyedChildren(newWDom) && checkKeyedChildren(originalWDom)) ||
    (!!originalWDom.children &&
      originalWDom.children.length ===
        (newWDom.children && newWDom.children.length)));

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
): target is FragmentFunction => target === Fragment;

// A diffed node (resolved already): empty when it has no type.
export const checkEmptyElement = (wDom: WDom) => !wDom.type;

// Whether the node's element is a portal target, which lies outside the
// parent the portal sits in: a portal's own element, or the one a node
// replacing or deleting a portal still holds, with that portal's props (op),
// until it is drawn.
export const checkPortalElement = ({ el, op, props }: WDom) =>
  !!el && (el === (op && op.portal) || el === (props && props.portal));

export const checkEventKey = (key: string) => key[0] === 'o' && key[1] === 'n';

export const checkExistyKey = (target: WDom) => checkExisty(getKey(target));

// A list is keyed when any child has a key: a leading null or false (a hidden
// row) must not turn key matching off for the rest.
export const checkKeyedChildren = (target?: WDom) =>
  !!target && !!target.children && target.children.some(checkExistyKey);

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
    : ((wDom as WDom).type as WDomType) || 'et';

export const checkSameWDomWithOriginal = {
  c: checkSameCustomComponent,
  l: checkLoopTypeElement,
  t: checkNormalTypeElement,
  e: checkSameTagElement,
  f: checkSameFragment,
  et: checkNormalTypeElement,
};

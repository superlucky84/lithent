import { Fragment } from '@/wDom';
import {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  WDomType,
} from '@/types';

type DiffParam = {
  originalWDom?: WDom;
  newWDom: WDom | TagFunction | TagFunctionResolver;
};

type WDomParam =
  | string
  | WDom
  | TagFunction
  | TagFunctionResolver
  | FragmentFunction;

export function getWDomType(
  wDom: WDom | TagFunction | TagFunctionResolver
): WDomType | undefined {
  if (checkCustemComponentFunction(wDom)) {
    return 'component';
  } else if (checkPlainType(wDom, 'fragment')) {
    return 'fragment';
  } else if (checkPlainType(wDom, 'element')) {
    return 'element';
  } else if (checkPlainType(wDom, 'loop')) {
    return 'loop';
  } else if (checkPlainType(wDom, 'text')) {
    return 'text';
  } else if (checkEmptyElement(wDom)) {
    return 'empty';
  }

  return undefined;
}

export const checkSameWDomWithOriginal = {
  component: checkSameCustomComponent,
  loop: checkNormalTypeElement,
  text: checkNormalTypeElement,
  element: checkSameTagElement,
  fragment: checkSameFragment,
  empty: checkNormalTypeElement,
};

/**
 * Predicator
 */
export function checkCustemComponentFunction(
  target: WDomParam
): target is TagFunction | TagFunctionResolver {
  const isTagTagFunction =
    typeof target === 'function' && target.prototype.constructor !== Fragment;
  const TagFunctionResolver = typeof target === 'object' && 'resolve' in target;

  return isTagTagFunction || TagFunctionResolver;
}

export function checkFragmentFunction(
  target: unknown
): target is FragmentFunction {
  return (
    typeof target === 'function' && target.prototype.constructor === Fragment
  );
}

export function checkPlainWDomType(wDom: WDomParam): wDom is WDom {
  return typeof wDom === 'object' && !('resolve' in wDom);
}

export function checkPlainType(wDom: WDomParam, typeName: string) {
  return checkPlainWDomType(wDom) && wDom.type === typeName;
}

export function checkEmptyElement(wDom: WDomParam) {
  return checkPlainWDomType(wDom) && !wDom.type;
}

export function checkSameCustomComponent({ originalWDom, newWDom }: DiffParam) {
  // Todo need Fix Function type check
  // @ts-ignore
  return newWDom.tagName === originalWDom?.tagName;
}

export function checkSameFragment({ originalWDom, newWDom }: DiffParam) {
  return (
    checkPlainWDomType(newWDom) &&
    originalWDom?.type === 'fragment' &&
    originalWDom?.children?.length === newWDom?.children?.length
  );
}

export function checkSameTagElement({ originalWDom, newWDom }: DiffParam) {
  return (
    checkPlainWDomType(newWDom) &&
    originalWDom?.type === 'element' &&
    originalWDom?.tag === newWDom.tag
  );
}

export function checkNormalTypeElement({ originalWDom, newWDom }: DiffParam) {
  return checkPlainWDomType(newWDom) && originalWDom?.type === newWDom.type;
}

export function isExisty(value: unknown) {
  return value !== null && value !== undefined;
}

export function checkFunction(target: unknown): target is Function {
  return typeof target === 'function';
}

export function checkEventFunction(
  target: unknown
): target is (e: Event) => void {
  return typeof target === 'function';
}

export function checkStyleData(
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> {
  return dataKey === 'style' && typeof dataValue === 'object';
}

export function checkRefData(
  dataKey: string,
  dataValue: unknown
): dataValue is { value: HTMLElement | DocumentFragment | Text | undefined } {
  return dataKey === 'ref' && typeof dataValue === 'object';
}

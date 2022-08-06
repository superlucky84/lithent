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
  const isComponent = checkCustemComponentFunction(wDom);
  const isFragment = checkFragment(wDom);
  const isTagElement = checkTagElement(wDom);
  const isLoopElement = checkLoopElement(wDom);
  const isTextElement = checkTextElement(wDom);
  const isEmptyElement = checkEmptyElement(wDom);

  if (isComponent) {
    return 'component';
  } else if (isFragment) {
    return 'fragment';
  } else if (isTagElement) {
    return 'element';
  } else if (isLoopElement) {
    return 'loop';
  } else if (isTextElement) {
    return 'text';
  } else if (isEmptyElement) {
    return 'empty';
  }

  return undefined;
}

export const checkSameWDomWithOriginal = {
  component: checkSameCustomComponent,
  loop: checkSameLoopElement,
  text: checkSameTextElement,
  element: checkSameTagElement,
  fragment: checkSameFragment,
  empty: checkSameEmptyElement,
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

export function checkFragment(wDom: WDomParam) {
  return checkPlainWDomType(wDom) && wDom.type === 'fragment';
}

export function checkTagElement(wDom: WDomParam) {
  return checkPlainWDomType(wDom) && wDom.type === 'element';
}

export function checkLoopElement(wDom: WDomParam) {
  return checkPlainWDomType(wDom) && wDom.type === 'loop';
}

export function checkTextElement(wDom: WDomParam) {
  return checkPlainWDomType(wDom) && wDom.type === 'text';
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

export function checkSameLoopElement({ originalWDom, newWDom }: DiffParam) {
  return checkPlainWDomType(newWDom) && originalWDom?.type === newWDom.type;
}

export function checkSameTextElement({ originalWDom, newWDom }: DiffParam) {
  return checkPlainWDomType(newWDom) && originalWDom?.type === newWDom.type;
}

export function checkSameEmptyElement({ originalWDom, newWDom }: DiffParam) {
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

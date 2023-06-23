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
) => newWDom.constructor === originalWDom?.constructor;

const checkSameFragment = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'fragment' &&
  originalWDom?.children?.length === newWDom?.children?.length;

const checkSameTagElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'element' &&
  originalWDom?.tag === newWDom.tag &&
  originalWDom?.children?.length === newWDom?.children?.length;

const checkNormalTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === newWDom.type &&
  (originalWDom?.children?.length === newWDom?.children?.length ||
    newWDom.type === 'loop');

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
): dataValue is { value: HTMLElement | DocumentFragment | Text | undefined } =>
  dataKey === 'ref' && typeof dataValue === 'object';

export const checkOptionElement = (element: any): element is HTMLElement =>
  element.nodeType === 1 && element.tagName === 'OPTION';

export const checkTextareaElement = (element: any): element is HTMLElement =>
  element.nodeType === 1 && element.tagName === 'TEXTAREA';

export const checkCheckboxElement = (element: any): element is HTMLElement =>
  element.nodeType === 1 && element.type === 'checkbox';

export const checkRadioElement = (element: any): element is HTMLElement =>
  element.nodeType === 1 && element.type === 'radio';

export const checkNormalAttribute = (
  dataValue: unknown
): dataValue is number | string =>
  typeof dataValue === 'number' || typeof dataValue === 'string';

export const getWDomType = (
  wDom: WDom | TagFunction | TagFunctionResolver
): WDomType | undefined => {
  let result: WDomType | undefined;

  if (checkCustemComponentFunction(wDom)) {
    result = 'c';
  } else if (checkPlainType(wDom, 'fragment')) {
    result = 'f';
  } else if (checkPlainType(wDom, 'element')) {
    result = 'e';
  } else if (checkPlainType(wDom, 'loop')) {
    result = 'l';
  } else if (checkPlainType(wDom, 'text')) {
    result = 't';
  } else if (checkEmptyElement(wDom)) {
    result = 'et';
  }

  return result;
};

export const checkSameWDomWithOriginal = {
  c: checkSameCustomComponent,
  l: checkNormalTypeElement,
  t: checkNormalTypeElement,
  e: checkSameTagElement,
  f: checkSameFragment,
  et: checkNormalTypeElement,
};

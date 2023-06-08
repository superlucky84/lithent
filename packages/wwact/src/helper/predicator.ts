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

/**
 * Predicator
 */
export const checkCustemComponentFunction = (
  target: WDomParam
): target is TagFunction | TagFunctionResolver =>
  (typeof target === 'function' && !checkFragmentFunction(target)) ||
  (typeof target === 'object' && 'resolve' in target);

export const checkFragmentFunction = (
  target: unknown
): target is FragmentFunction =>
  typeof target === 'function' && target === Fragment;

export const checkPlainWDomType = (wDom: WDomParam): wDom is WDom =>
  typeof wDom === 'object' && !('resolve' in wDom);

export const checkPlainType = (wDom: WDomParam, typeName: string) =>
  checkPlainWDomType(wDom) && wDom.type === typeName;

export const checkEmptyElement = (wDom: WDomParam) =>
  checkPlainWDomType(wDom) && !wDom.type;

export const checkSameCustomComponent = ({
  originalWDom,
  newWDom,
}: DiffParam) => newWDom.constructor === originalWDom?.constructor;

export const checkSameFragment = ({ originalWDom, newWDom }: DiffParam) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'fragment' &&
  originalWDom?.children?.length === newWDom?.children?.length;

export const checkSameTagElement = ({ originalWDom, newWDom }: DiffParam) =>
  checkPlainWDomType(newWDom) &&
  originalWDom?.type === 'element' &&
  originalWDom?.tag === newWDom.tag;

export const checkNormalTypeElement = ({ originalWDom, newWDom }: DiffParam) =>
  checkPlainWDomType(newWDom) && originalWDom?.type === newWDom.type;

export const checkExisty = (value: unknown) =>
  value !== null && value !== undefined;

export const checkFunction = (target: unknown): target is Function =>
  typeof target === 'function';

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

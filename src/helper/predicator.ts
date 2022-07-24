import { WDom, TagFunction, FragmentFunction } from '@/types';
type WDomType =
  | 'component'
  | 'fragment'
  | 'element'
  | 'loop'
  | 'text'
  | 'empty';
type DiffParam = { originalVdom?: WDom; newVdom: WDom };

export function getVdomType(vDom: WDom): WDomType | undefined {
  const isComponent = checkCustemComponent(vDom);
  const isFragment = checkFragment(vDom);
  const isTagElement = checkTagElement(vDom);
  const isLoopElement = checkLoopElement(vDom);
  const isTextElement = checkTextElement(vDom);
  const isEmptyElement = checkEmptyElement(vDom);

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

export const checkSameVdomWithOriginal = {
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
export function checkCustemComponent(target: unknown): target is TagFunction {
  return typeof target === 'function' && target.name !== 'Fragment';
}

export function checkFragment(target: unknown): target is FragmentFunction {
  return typeof target === 'function' && target.name === 'Fragment';
}

export function checkTagElement(vDom: WDom) {
  return vDom.type === 'element';
}

export function checkLoopElement(vDom: WDom) {
  return vDom.type === 'loop';
}

export function checkTextElement(vDom: WDom) {
  return vDom.type === 'text';
}

export function checkEmptyElement(vDom: WDom) {
  return !vDom.type;
}

export function checkSameCustomComponent({ originalVdom, newVdom }: DiffParam) {
  return newVdom.tagName === originalVdom?.tagName;
}

export function checkSameFragment({ originalVdom, newVdom }: DiffParam) {
  return (
    originalVdom?.type === 'fragment' &&
    originalVdom?.children?.length === newVdom.children.length
  );
}

export function checkSameTagElement({ originalVdom, newVdom }: DiffParam) {
  return originalVdom?.type === 'element' && originalVdom?.tag === newVdom.tag;
}

export function checkSameLoopElement({ originalVdom, newVdom }: DiffParam) {
  return originalVdom?.type === newVdom.type;
}

export function checkSameTextElement({ originalVdom, newVdom }: DiffParam) {
  return originalVdom?.type === newVdom.type;
}

export function checkSameEmptyElement({ originalVdom, newVdom }: DiffParam) {
  return originalVdom?.type === newVdom.type;
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
): dataValue is { value: HTMLElement } {
  return dataKey === 'ref' && typeof dataValue === 'object';
}

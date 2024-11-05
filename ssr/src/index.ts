import type { WDom } from 'lithent';
import { checkExisty, checkVirtualType } from 'lithent';

export function renderToString(wDom: WDom) {
  return wDomToString(wDom);
}

function wDomToString(wDom: WDom) {
  let element = '';
  // const { type, tag, text, props, children = [] } = wDom;
  const { type, tag, text, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  if (isVirtualType) {
    element = wDomChildrenToDom(children, element);
  } else if (type === 'element' && tag) {
    element = `<${tag}>`;
    element = wDomChildrenToDom(children, element);
    element = `${element}</${tag}>`;
  } else if (type === 'text' && checkExisty(text)) {
    element = String(text);
    element = wDomChildrenToDom(children, element);
  } else {
    element = '<e>';
    element = wDomChildrenToDom(children, element);
    element = `${element}</e>`;
  }

  // 태그 닫기
  // updateProps(props, element);

  return element;
}

function wDomChildrenToDom(children: WDom[], parentElement?: string) {
  const newString = children.reduce((acc: string, childItem: WDom) => {
    if (childItem.type) {
      const childElement = wDomToString(childItem);

      acc += childElement;
    }

    return acc;
  }, parentElement || '');

  return newString;
}

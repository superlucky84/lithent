import type { WDom } from 'lithent';

const SELF_CLOSE_ALLLOW = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

function isAllowSelfClose(tagname: string) {
  return SELF_CLOSE_ALLLOW.includes(tagname);
}

function checkExisty(value: unknown) {
  return value !== null && value !== undefined;
}

function checkVirtualType(type?: string | null) {
  return type && ['fragment', 'loop'].includes(type);
}

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
    if (isAllowSelfClose(tag) && !children.length) {
      element = `<${tag} ${makeProp()} />`;
    } else {
      element = `<${tag} ${makeProp()}>`;
      element = wDomChildrenToDom(children, element);
      element = `${element}</${tag}>`;
    }
  } else if (type === 'text' && checkExisty(text)) {
    element = String(text);
    element = wDomChildrenToDom(children, element);
  } else {
    element = `<e ${makeProp()} >`;
    element = wDomChildrenToDom(children, element);
    element = `${element}</e>`;
  }

  // 태그 닫기
  // updateProps(props, element);

  return element;
}

function makeProp() {
  return '';
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

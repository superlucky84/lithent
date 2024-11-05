import type { WDom, Props } from 'lithent';

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
      element = `<${tag}${makeProp()} />`;
    } else {
      element = `<${tag}${makeProp()}>`;
      element = wDomChildrenToDom(children, element);
      element = `${element}</${tag}>`;
    }
  } else if (type === 'text' && checkExisty(text)) {
    element = String(text);
    element = wDomChildrenToDom(children, element);
  } else {
    element = `<e${makeProp()} >`;
    element = wDomChildrenToDom(children, element);
    element = `${element}</e>`;
  }

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

function makeProp(
  props?: Props,
  element?: HTMLElement | Element | DocumentFragment | Text,
  oldProps?: Props
) {
  const originalProps = { ...oldProps };

  Object.entries(props || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      if (dataKey === 'key' || dataValue === originalProps[dataKey]) {
        // Do nothing
      } else if (dataKey === 'portal' && typeof dataValue === 'object') {
        // Do nothing
      } else if (dataKey === 'innerHTML' && typeof dataValue === 'string') {
        (element as HTMLElement).innerHTML = dataValue;
      } else if (checkStyleData(dataKey, dataValue)) {
        updateStyle(
          dataValue,
          checkStyleData(dataKey, originalProps.style)
            ? originalProps.style
            : {},
          element
        );
      } else if (checkRefData(dataKey, dataValue)) {
        dataValue.value = element;
      } else if (dataKey.match(/^on/)) {
        // Do nothing
      } else if (dataKey) {
        if (dataKey !== 'type' && hasAccessorMethods(element, dataKey)) {
          (element as { [key: string]: any })[dataKey] = dataValue;
        } else {
          setAttr(
            getAttrKey(dataKey),
            element as HTMLElement,
            dataValue as string
          );
        }
      }

      delete originalProps[dataKey];
    }
  );

  keys(originalProps).forEach(dataKey =>
    (element as HTMLElement).removeAttribute(dataKey)
  );
}

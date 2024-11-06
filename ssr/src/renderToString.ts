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

function checkStyleData(
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> {
  return dataKey === 'style' && typeof dataValue === 'object';
}

function checkRefData(
  dataKey: string,
  dataValue: unknown
): dataValue is {
  value: HTMLElement | Element | DocumentFragment | Text | undefined;
} {
  return dataKey === 'ref' && typeof dataValue === 'object';
}

function styleObjectToString(styleObj: Record<string, string>) {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      // camelCase를 kebab-case로 변환 (예: borderTop -> border-top)
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(' ');
}

export function renderToString(wDom: WDom) {
  return wDomToString(wDom);
}

function wDomToString(wDom: WDom) {
  console.log('wdom', wDom);
  let element = '';
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  if (isVirtualType) {
    element = wDomChildrenToDom(children, element);
  } else if (type === 'element' && tag) {
    const innerHTML = props?.innerHTML;

    if (innerHTML) {
      element = `<${tag}${makeProp(props)}>${innerHTML}</${tag}>`;
    } else if (isAllowSelfClose(tag) && !children.length) {
      element = `<${tag}${makeProp(props)} />`;
    } else {
      element = `<${tag}${makeProp(props)}>`;
      element = wDomChildrenToDom(children, element);
      element = `${element}</${tag}>`;
    }
  } else if (type === 'text' && checkExisty(text)) {
    element = String(text);
    element = wDomChildrenToDom(children, element);
  } else {
    const innerHTML = props?.innerHTML;

    if (innerHTML) {
      element = `<e${makeProp(props)}>${innerHTML}</e>`;
    } else {
      element = `<e${makeProp(props)}>`;
      element = wDomChildrenToDom(children, element);
      element = `${element}</e>`;
    }
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

function makeProp(props?: Props) {
  let attrGroup: string[] = [];

  Object.entries(props || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      const isKey = dataKey === 'key';
      const isPortal = dataKey === 'portal' && typeof dataValue === 'object';
      const isHtml = dataKey === 'innerHTML' && typeof dataValue === 'string';
      const isRef = checkRefData(dataKey, dataValue);
      const isEvent = dataKey.match(/^on/);

      if (!(isKey || isPortal || isHtml || isRef || isEvent)) {
        if (checkStyleData(dataKey, dataValue)) {
          const cssString = styleObjectToString(dataValue);
          attrGroup.push(`style="${cssString}"`);
        } else if (dataKey && dataValue === true) {
          attrGroup.push(`${dataKey}="${dataKey}"`);
        } else if (dataKey && typeof dataValue !== 'boolean') {
          attrGroup.push(`${dataKey}="${String(dataValue)}"`);
        }
      }
    }
  );

  return attrGroup.length ? ' ' + attrGroup.join(' ') : '';
}

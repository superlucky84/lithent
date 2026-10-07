import type { WDom, Props } from 'lithent';
import {
  isAllowSelfClose,
  checkExisty,
  checkVirtualType,
  checkStyleData,
  checkRefData,
  styleObjectToString,
} from './helper';

/**
 * Escape special HTML characters in text node content.
 * Prevents text like `<h-state>` from being parsed as HTML elements by the browser.
 */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Escape an attribute value. The value is written inside double quotes, so a
 * `"` in it would otherwise end the attribute and let the rest be parsed as
 * markup.
 */
function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

/**
 * Characters that cannot be part of an attribute name. A prop with such a name
 * (possible when props are spread from data) is not written at all.
 */
const invalidAttrName = /[\s"'<>/=]/;

/**
 * Main function of renderToString"
 */
export function renderToString(wDom: WDom) {
  return wDomToString(wDom);
}

/**
 * Converts a chunk of virtual DOM objects into string tags.
 */
function wDomToString(wDom: WDom) {
  let element = '';
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  if (isVirtualType) {
    element = wDomChildrenToDom(children, element);
  } else if (type === 'e' && tag) {
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
  } else if (type === 't' && checkExisty(text)) {
    element = escapeHtml(String(text));
    element = wDomChildrenToDom(children, element);
  } else {
    throw new Error(
      'An attempt was made to render an abnormal virtual DOM object.'
    );
  }

  return element;
}

/**
 * Converts all child nodes of a virtual DOM object into string tags.
 */
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

/**
 * Creates and attaches a prop string to the tag.
 */
function makeProp(props?: Props) {
  let attrGroup: string[] = [];

  Object.entries(props || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      const isKey = dataKey === 'key';
      const isPortal = dataKey === 'portal' && typeof dataValue === 'object';
      const isHtml = dataKey === 'innerHTML' && typeof dataValue === 'string';
      const isRef = checkRefData(dataKey, dataValue);
      const isEvent = dataKey.match(/^on/);

      const isInvalid = invalidAttrName.test(dataKey);

      if (!(isKey || isPortal || isHtml || isRef || isEvent || isInvalid)) {
        if (checkStyleData(dataKey, dataValue)) {
          const cssString = styleObjectToString(dataValue);
          attrGroup.push(`style="${escapeAttr(cssString)}"`);
        } else if (dataKey && dataValue === true) {
          attrGroup.push(`${dataKey}="${dataKey}"`);
        } else if (dataKey && typeof dataValue !== 'boolean') {
          attrGroup.push(`${dataKey}="${escapeAttr(String(dataValue))}"`);
        }
      }
    }
  );

  return attrGroup.length ? ' ' + attrGroup.join(' ') : '';
}

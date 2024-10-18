import type { WDom } from 'lithent';
import {
  h,
  mount,
  render,
  checkExisty,
  checkVirtualType,
  xmlnsRef,
} from 'lithent';

const DF = () => new DocumentFragment();
const CE = (t: string) => document.createElement(t);

export function renderToString(wDom: WDom) {
  return wDomToString(wDom);
}

function wDomToString(wDom: WDom) {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  if (tag === 'svg') {
    xmlnsRef.value = String(props?.xmlns);
  }

  if (isVirtualType) {
    element = DF();
  } else if (type === 'element' && tag) {
    if (tag === 'portal' && props?.portal) {
      element = props.portal as HTMLElement;
    } else {
      element = xmlnsRef.value
        ? document.createElementNS(xmlnsRef.value, tag)
        : CE(tag);
    }
  } else if (type === 'text' && checkExisty(text)) {
    element = document.createTextNode(String(text));
  } else {
    element = CE('e');
  }

  wDomChildrenToDom(children, element);
  // updateProps(props, element);

  wDom.el = element as HTMLElement;

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element;
}

function wDomChildrenToDom(
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text
) {
  const elementChildren = children.reduce(
    (acc: DocumentFragment, childItem: WDom) => {
      if (childItem.type) {
        const childElement = wDomToDom(childItem);

        if (childItem.tag !== 'portal') {
          acc.appendChild(childElement);
        }
      }

      return acc;
    },
    DF()
  );

  if (parentElement && elementChildren.hasChildNodes()) {
    parentElement.appendChild(elementChildren);
  }
}

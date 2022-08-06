/**
 * Rerender시 실제 dom에 반영해줘야 하는 상태
 *
 * 1. (ADD). 가상돔 비교시 오리지날이 없으면 새로 추가되는 dom으로 판단한다.
 * 2. (REPLACE). 오리지날이 있고 같은 엘리먼트타입이 아닌 경우 해당 위치의 태그 자체를 교체해준다.
 * 3. (UPDATE). 오리지날이 있고 같은 타입이면 dom의 속성만 변경해 주며, 텍스트 노드일 경우는 텍스트를 교체해준다.
 * 4. (DELETE). 오리지날이 있고 새로운 엘리먼트 타입은 null타입일 경우 dom을 삭제한다.
 * 5. (SORTED-REPLACE). loop의 경우 REPLACE라도 키값에 의해 순서가 변경될 수 있으므로 새로운 dom을 단순히 기존 위치에 교체하지 않고 새로 삼입하여 정렬한다.
 * 6. (SORTED-UPDATE). loop의 경우 UPDATE라도 키값에 의해 순서가 변경될수 있으므로 재 삽입하여 정렬한다.
 * 7. (NONE). text타입의 경우 text가 같다면 변경이 필요 없으므로 방치한다. (Todo. 다른 타입의 경우 처리필요)
 */

import { WDom, Props } from '@/types';
import {
  checkStyleData,
  checkRefData,
  checkEventFunction,
  isExisty,
} from '@/helper/predicator';
import { runMountedQueueFromWDom } from '@/hook/mounted';
import { runUpdatedQueueFromWDom } from '@/hook/updated';
import { getParent } from '@/helper';

export function render(wDom: WDom, wrapElement: HTMLElement | null) {
  if (!wrapElement) {
    throw Error('WrapELement is null');
  }
  wDom.isRoot = true;
  wDom.wrapElement = wrapElement;

  wrapElement.appendChild(wDomToDom(wDom, true));
}

export function wDomUpdate(newWDomTree: WDom) {
  const { needRerender } = newWDomTree;

  switch (needRerender) {
    case 'ADD':
      typeAdd(newWDomTree);
      break;
    case 'DELETE':
      typeDelete(newWDomTree);
      break;
    case 'REPLACE':
      typeReplace(newWDomTree);
      break;
    case 'UPDATE':
      typeUpdate(newWDomTree);
      break;
    case 'SORTED-REPLACE':
      typeSortedReplace(newWDomTree);
      break;
    case 'SORTED-UPDATE':
      typeSortedUpdate(newWDomTree);
      break;
    case 'NONE':
      break;
  }
}

function typeDelete(newWDom: WDom) {
  const parent = newWDom?.el?.parentNode;

  if (parent && newWDom.el) {
    parent.removeChild(newWDom.el);
    delete newWDom.el;
  }
}

function typeSortedReplace(newWDom: WDom) {
  typeDelete(newWDom);
  typeAdd(newWDom);
}

function typeSortedUpdate(newWDom: WDom) {
  typeDelete(newWDom);
  typeAdd(newWDom, newWDom.el);
}

function typeAdd(
  newWDom: WDom,
  newElement?: HTMLElement | DocumentFragment | Text
) {
  if (!newElement) {
    newElement = wDomToDom(newWDom, true);
  }

  const parentWDom = getParent(newWDom);
  if (parentWDom.type) {
    const parentEl = findRealParentElement(parentWDom);
    const nextEl = startFindNextBrotherElement(newWDom, parentWDom);

    if (newElement && parentEl) {
      if (nextEl) {
        parentEl.insertBefore(newElement, nextEl);
      } else {
        parentEl.appendChild(newElement);
      }
    }
  }

  runMountedQueueFromWDom(newWDom);
}

function startFindNextBrotherElement(
  wDom: WDom,
  parentWDom: WDom
): HTMLElement | DocumentFragment | Text | undefined {
  const brothers = parentWDom.children || [];
  const index = brothers.indexOf(wDom);
  const nextIndex = index + 1;
  const candidiateBrothers = brothers.slice(nextIndex);

  const finedNextEl = findChildFragmentNextElement(candidiateBrothers);
  const parentType = parentWDom.type || '';

  if (finedNextEl) {
    return finedNextEl;
  }

  if (!parentWDom.isRoot && ['fragment', 'loop'].includes(parentType)) {
    return startFindNextBrotherElement(parentWDom, getParent(parentWDom));
  }

  return undefined;
}

function findChildFragmentNextElement(
  candidiateBrothers: WDom[]
): HTMLElement | DocumentFragment | Text | undefined {
  return candidiateBrothers.reduce(
    (
      targetEl: HTMLElement | DocumentFragment | Text | undefined,
      bItem: WDom
    ) => {
      const type = bItem?.type;
      const el = bItem?.el;
      const isFragment = type === 'fragment' || type === 'loop';

      if (targetEl) {
        return targetEl;
      } else if (isFragment) {
        return findChildFragmentNextElement(bItem.children || []);
      } else if (el && el.nodeType !== 11) {
        return el;
      }

      return targetEl;
    },
    undefined
  );
}

function typeReplace(newWDom: WDom) {
  const parentWDom = getParent(newWDom);
  const orignalElement = newWDom.el;

  if (parentWDom.type && orignalElement) {
    const parentElement = parentWDom.el;
    const newElement = wDomToDom(newWDom, true);

    if (newWDom.oldProps) {
      removeEvent(newWDom.oldProps, orignalElement);
    }

    if (parentElement) {
      parentElement.replaceChild(newElement, orignalElement);
    }
  }

  runMountedQueueFromWDom(newWDom);
}

function typeUpdate(newWDom: WDom) {
  const element = newWDom.el;

  if (newWDom.type === 'text') {
    updateText(newWDom);

    return;
  }

  if (element) {
    const { oldProps, props } = newWDom;

    updateProps({ oldProps, props, element });

    delete newWDom.oldProps;

    if (newWDom.tag === 'input') {
      (element as HTMLInputElement).value = String(newWDom?.props?.value || '');
    }
  }

  (newWDom.children || []).forEach((childItem: WDom) => {
    wDomUpdate(childItem);
  });

  runUpdatedQueueFromWDom(newWDom);
}

function updateText(newWDom: WDom) {
  const element = newWDom.el;

  if (element) {
    element.nodeValue = String(newWDom.text);
  }
}

function removeEvent(
  oldProps: Props,
  element?: HTMLElement | DocumentFragment | Text
) {
  if (element) {
    if (checkEventFunction(oldProps?.onClick)) {
      element.removeEventListener('click', oldProps.onClick);
    }
    if (checkEventFunction(oldProps?.onInput)) {
      element.removeEventListener('input', oldProps.onInput);
    }
  }
}

function updateProps({
  oldProps,
  props,
  element,
}: {
  oldProps?: Props;
  props?: Props;
  element?: HTMLElement | DocumentFragment | Text;
}) {
  const originalProps = { ...oldProps };

  Object.entries(props || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      if (dataKey === 'key') {
        // Do nothing
      } else if (checkStyleData(dataKey, dataValue)) {
        const style = dataValue;
        const oldStyle = checkStyleData(dataKey, originalProps.style) || {};

        updateStyle({ style, oldStyle, element });
      } else if (checkRefData(dataKey, dataValue)) {
        dataValue.value = element;
      } else if (dataKey.match(/^on/)) {
        updateEvent({
          element: element as HTMLElement,
          eventKey: dataKey,
          newEventHandler: dataValue as (e: Event) => void,
          oldEventHandler: originalProps[dataKey] as (e: Event) => void,
        });
      } else if (
        typeof dataValue === 'number' ||
        typeof dataValue === 'string'
      ) {
        (element as HTMLElement).setAttribute(dataKey, String(dataValue));
      }

      delete originalProps[dataKey];
    }
  );

  Object.keys(originalProps).forEach(dataKey => {
    (element as HTMLElement).removeAttribute(dataKey);
  });
}

function wDomToDom(wDom: WDom, init: boolean) {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = type === 'fragment' || type === 'loop';

  if (isVirtualType) {
    element = new DocumentFragment();
  } else if (type === 'element' && tag) {
    element = document.createElement(tag);
  } else if (type === 'text' && isExisty(text)) {
    element = document.createTextNode(String(text));
  }

  wDomChildrenToDom(children, element, init);
  updateProps({ props, element });

  wDom.el = element;

  runMountedQueueFromWDom(wDom);

  return element || document.createElement('div');
}

function wDomChildrenToDom(
  children: WDom[],
  parentElement?: HTMLElement | DocumentFragment | Text,
  init?: boolean
) {
  if (init) {
    const elementChildren = children.reduce(
      (acc: DocumentFragment, childItem: WDom) => {
        if (childItem.type) {
          acc.appendChild(wDomToDom(childItem, init));
        }

        return acc;
      },
      new DocumentFragment()
    );

    if (parentElement && elementChildren.hasChildNodes()) {
      parentElement.appendChild(elementChildren);
    }
  }
}

function updateEvent({
  element,
  eventKey,
  newEventHandler,
  oldEventHandler,
}: {
  element: HTMLElement;
  eventKey: string;
  newEventHandler: (e: Event) => void;
  oldEventHandler: (e: Event) => void;
}) {
  const eventName = eventKey.replace(/^on(.*)/, function (_match, p1) {
    return p1.toLowerCase();
  });

  element.removeEventListener(eventName, oldEventHandler);
  element.addEventListener(eventName, newEventHandler);
}

function updateStyle({
  style,
  oldStyle,
  element,
}: {
  style: { [key: string]: string };
  oldStyle: { [key: string]: string };
  element?: HTMLElement | DocumentFragment | Text;
}) {
  const originalStyle = { ...oldStyle };
  const elementStyle = (element as HTMLElement)?.style;

  if (elementStyle) {
    Object.entries(style).forEach(([styleKey, dataValue]) => {
      elementStyle.setProperty(styleKey, dataValue);
      delete originalStyle[styleKey];
    });

    Object.entries(originalStyle).forEach(([styleKey]) => {
      elementStyle.removeProperty(styleKey);
    });
  }
}

function findRealParentElement(
  vDom: WDom
): HTMLElement | DocumentFragment | Text | undefined {
  const isVirtualType = vDom.type === 'fragment' || vDom.type === 'loop';

  if (vDom.isRoot) {
    return vDom.wrapElement;
  }

  if (!isVirtualType) {
    return vDom.el;
  }

  const parentVDom = getParent(vDom);

  return findRealParentElement(parentVDom);
}

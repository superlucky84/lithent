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
  checkNormalAttribute,
  checkExisty,
  checkOptionElement,
  checkTextareaElement,
  checkCheckboxElement,
  checkRadioElement,
} from '@/utils/predicator';

import { componentRef } from '@/utils/universalRef';
import { runUnmountQueueFromWDom } from '@/hook/unmount';
import { runMountedQueueFromWDom } from '@/hook/mountCallback';
import { runUpdatedQueueFromWDom } from '@/hook/useUpdate';
import { getParent } from '@/utils';

export const render = (
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) => {
  if (!wrapElement) {
    throw Error('WrapELement is null');
  }
  wDom.isRoot = true;
  wDom.wrapElement = wrapElement;

  const Dom = wDomToDom(wDom, true);

  if (afterElement) {
    wDom.afterElement = afterElement;
    wrapElement.insertBefore(Dom, afterElement);
  } else {
    wrapElement.appendChild(Dom);
  }

  return () => {
    if (wDom.componentProps) {
      const component = componentRef.get(wDom.componentProps)?.vd.value;
      if (component) {
        runUnmountQueueFromWDom(component);
        recursiveRemoveEvent(component);
        rootDelete(component);
      }
    }
  };
};

export const wDomUpdate = (newWDomTree: WDom) => {
  const { needRerender } = newWDomTree;

  if (needRerender && needRerender !== 'N') {
    const exec = {
      A: typeAdd,
      D: typeDelete,
      R: typeReplace,
      U: typeUpdate,
      SR: typeSortedReplace,
      SU: typeSortedUpdate,
    }[needRerender];
    exec(newWDomTree);
  }
};

export const recursiveRemoveEvent = (originalWDom: WDom) => {
  if (originalWDom.props && originalWDom.el) {
    removeEvent(originalWDom.props, originalWDom.el);
  }

  (originalWDom.children || []).forEach((childItem: WDom) => {
    recursiveRemoveEvent(childItem);
  });
};

const rootDelete = (newWDom: WDom) => {
  const parent = newWDom.wrapElement as HTMLElement;

  deleteRealDom(newWDom, parent);
};

const typeDelete = (newWDom: WDom) => {
  const parentWDom = getParent(newWDom);
  const parent = findRealParentElement(parentWDom) as HTMLElement;

  if (newWDom.oldProps && newWDom.el) {
    removeEvent(newWDom.oldProps, newWDom.el);
  }

  deleteRealDom(newWDom, parent);
};

const deleteRealDom = (newWDom: WDom, parent: HTMLElement) => {
  if (parent && newWDom.el) {
    if (newWDom.el?.nodeType === 1) {
      parent.removeChild(newWDom.el);
    } else if (newWDom.el?.nodeType === 11) {
      findChildWithRemoveElement(newWDom, parent as HTMLElement);
    }
    delete newWDom.el;
  }
};

const findChildWithRemoveElement = (newWDom: WDom, parent: HTMLElement) => {
  (newWDom?.oldChildren || newWDom?.children || []).forEach(item => {
    if (item.el?.nodeType === 1) {
      parent.removeChild(item?.el);
    } else if (item.el?.nodeType === 11) {
      findChildWithRemoveElement(item, parent);
    }
  });
};

const typeSortedReplace = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom);
};

const typeSortedUpdate = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom, newWDom.el);
};

const typeAdd = (
  newWDom: WDom,
  newElement?: HTMLElement | DocumentFragment | Text
) => {
  if (!newElement) {
    newElement = wDomToDom(newWDom, true);
  }

  const parentWDom = getParent(newWDom);
  if (parentWDom.type) {
    const parentEl = findRealParentElement(parentWDom);
    const isLoop = parentWDom.type === 'loop';

    let nextEl;
    if (isLoop) {
      nextEl = startFindNextBrotherElement(parentWDom, getParent(parentWDom));
    } else {
      nextEl = startFindNextBrotherElement(newWDom, parentWDom);
    }

    if (newElement && parentEl) {
      if (nextEl) {
        parentEl.insertBefore(newElement, nextEl);
      } else {
        parentEl.appendChild(newElement);
      }
    }
  }

  runMountedQueueFromWDom(newWDom);
};

const startFindNextBrotherElement = (
  wDom: WDom,
  parentWDom: WDom
): HTMLElement | DocumentFragment | Text | undefined => {
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
  } else if (parentWDom.isRoot && parentWDom.afterElement) {
    return parentWDom.afterElement;
  }

  return undefined;
};

const findChildFragmentNextElement = (
  candidiateBrothers: WDom[]
): HTMLElement | DocumentFragment | Text | undefined =>
  candidiateBrothers.reduce(
    (
      targetEl: HTMLElement | DocumentFragment | Text | undefined,
      bItem: WDom
    ) => {
      const type = bItem.type;
      const el = bItem.el;
      const isFragment = type && ['fragment', 'loop'].includes(type);

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

const typeReplace = (newWDom: WDom) => {
  const parentWDom = getParent(newWDom);
  const orignalElement = newWDom.el;

  if (parentWDom.type && orignalElement) {
    if (orignalElement.nodeType === 11) {
      typeSortedReplace(newWDom);
    } else {
      const parentElement = findRealParentElement(parentWDom);
      const newElement = wDomToDom(newWDom, true);

      if (parentElement) {
        parentElement.replaceChild(newElement, orignalElement);
      }
    }
  }

  runMountedQueueFromWDom(newWDom);
};

const removeEvent = (
  oldProps: Props,
  element?: HTMLElement | DocumentFragment | Text
) => {
  if (element) {
    Object.entries(oldProps || {}).forEach(
      ([dataKey, dataValue]: [string, unknown]) => {
        if (dataKey.match(/^on/)) {
          const eventName = dataKey.replace(/^on(.*)/, (_match, p1) =>
            p1.toLowerCase()
          );
          element.removeEventListener(
            eventName,
            dataValue as (e: Event) => void
          );
        }
      }
    );
  }
};

const typeUpdate = (newWDom: WDom) => {
  const element = newWDom.el;

  if (newWDom.type === 'text') {
    updateText(newWDom);

    return;
  }

  if (element) {
    const { oldProps, props } = newWDom;

    updateProps(props, element, oldProps);

    delete newWDom.oldProps;

    if (newWDom.tag === 'input') {
      (element as HTMLInputElement).value = String(newWDom?.props?.value || '');
    }
  }

  (newWDom.children || []).forEach((childItem: WDom) => wDomUpdate(childItem));

  runUpdatedQueueFromWDom(newWDom);
};

const updateText = (newWDom: WDom) => {
  const element = newWDom.el;

  if (element) {
    element.nodeValue = String(newWDom.text);
  }
};

const updateProps = (
  props?: Props,
  element?: HTMLElement | DocumentFragment | Text,
  oldProps?: Props
) => {
  const originalProps = { ...oldProps };

  Object.entries(props || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      if (dataKey === 'key') {
        // Do nothing
      } else if (
        dataKey === 'innerHTML' &&
        element &&
        typeof dataValue === 'string'
      ) {
        (element as HTMLElement).innerHTML = dataValue;
      } else if (checkStyleData(dataKey, dataValue)) {
        const style = dataValue;
        const oldStyle = checkStyleData(dataKey, originalProps.style) || {};

        updateStyle(style, oldStyle, element);
      } else if (checkRefData(dataKey, dataValue)) {
        dataValue.value = element;
      } else if (dataKey.match(/^on/)) {
        updateEvent(
          element as HTMLElement,
          dataKey,
          dataValue as (e: Event) => void,
          originalProps[dataKey] as (e: Event) => void
        );
      } else if (checkRadioElement(element) && dataKey === 'checked') {
        (element as HTMLInputElement).checked = !!dataValue;
      } else if (checkCheckboxElement(element) && dataKey === 'checked') {
        (element as HTMLInputElement).checked = !!dataValue;
      } else if (checkTextareaElement(element) && dataKey === 'value') {
        (element as HTMLInputElement).value = dataValue as string;
      } else if (checkOptionElement(element) && dataKey === 'selected') {
        (element as HTMLOptionElement).selected = !!dataValue;
      } else if (checkNormalAttribute(dataValue)) {
        (element as HTMLElement).setAttribute(dataKey, String(dataValue));
      }

      delete originalProps[dataKey];
    }
  );

  Object.keys(originalProps).forEach(dataKey =>
    (element as HTMLElement).removeAttribute(dataKey)
  );
};

const wDomToDom = (wDom: WDom, init: boolean) => {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = type === 'fragment' || type === 'loop';

  if (isVirtualType) {
    element = new DocumentFragment();
  } else if (type === 'element' && tag) {
    element = document.createElement(tag);
  } else if (type === 'text' && checkExisty(text)) {
    element = document.createTextNode(String(text));
  }

  wDomChildrenToDom(children, element, init);
  updateProps(props, element);

  wDom.el = element;

  runMountedQueueFromWDom(wDom);

  return element || document.createElement('div');
};

const wDomChildrenToDom = (
  children: WDom[],
  parentElement?: HTMLElement | DocumentFragment | Text,
  init?: boolean
) => {
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
};

const updateEvent = (
  element: HTMLElement,
  eventKey: string,
  newEventHandler: (e: Event) => void,
  oldEventHandler: (e: Event) => void
) => {
  const eventName = eventKey.replace(/^on(.*)/, (_match, p1) =>
    p1.toLowerCase()
  );

  if (oldEventHandler !== newEventHandler) {
    if (oldEventHandler) {
      element.removeEventListener(eventName, oldEventHandler);
    }

    if (newEventHandler) {
      element.addEventListener(eventName, newEventHandler);
    }
  }
};

const updateStyle = (
  style: Record<string, string>,
  oldStyle: Record<string, string>,
  element?: HTMLElement | DocumentFragment | Text
) => {
  const originalStyle = { ...oldStyle };
  const elementStyle = (element as HTMLElement)?.style;

  if (elementStyle) {
    Object.entries(style).forEach(([styleKey, dataValue]) => {
      (elementStyle as any)[styleKey] = dataValue;
      delete originalStyle[styleKey];
    });

    Object.entries(originalStyle).forEach(
      ([styleKey]) => ((elementStyle as any)[styleKey] = '')
    );
  }
};

const findRealParentElement = (
  vDom: WDom
): HTMLElement | DocumentFragment | Text | undefined => {
  const isVirtualType = vDom.type === 'fragment' || vDom.type === 'loop';
  if (vDom.isRoot && isVirtualType) {
    return vDom.wrapElement;
  }

  if (!isVirtualType) {
    return vDom.el as HTMLElement;
  }

  const parentVDom = getParent(vDom);

  return findRealParentElement(parentVDom);
};

import { WDom, Props } from '@/types';
import {
  checkStyleData,
  checkRefData,
  checkNormalAttribute,
  checkExisty,
  checkOptionElement,
  checkTextareaElement,
  checkCheckableElement,
} from '@/utils/predicator';

import { componentRef, xmlnsRef } from '@/utils/universalRef';
import { runUnmountQueueFromWDom } from '@/hook/unmount';
import { runMountedQueueFromWDom } from '@/hook/mountCallback';
import { runUpdatedQueueFromWDom } from '@/hook/useUpdate';
import { getParent, getEventName, getAttrKey } from '@/utils';

export const render = (
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) => {
  wrapElement ??= document.body;
  wDom.isRoot = true;
  wDom.wrapElement = wrapElement;

  const Dom = wDomToDom(wDom);

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
    ({
      A: typeAdd,
      D: typeDelete,
      R: typeReplace,
      U: typeUpdate,
      SR: typeSortedReplace,
      SU: typeSortedUpdate,
    })[needRerender](newWDomTree);
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
  deleteRealDom(newWDom, newWDom.wrapElement as HTMLElement);
};

const typeDelete = (newWDom: WDom) => {
  if (newWDom.oldProps && newWDom.el) {
    removeEvent(newWDom.oldProps, newWDom.el);
  }

  deleteRealDom(
    newWDom,
    findRealParentElement(getParent(newWDom)) as HTMLElement
  );
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
    newElement = wDomToDom(newWDom) as HTMLElement;
  }

  const parentWDom = getParent(newWDom);
  if (parentWDom.type) {
    const parentEl = findRealParentElement(parentWDom);
    const isLoop = parentWDom.type === 'loop';
    const nextEl = isLoop
      ? startFindNextBrotherElement(parentWDom, getParent(parentWDom))
      : startFindNextBrotherElement(newWDom, parentWDom);

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
      const newElement = wDomToDom(newWDom);

      if (parentElement) {
        parentElement.replaceChild(newElement, orignalElement);
      }
    }
  }

  runMountedQueueFromWDom(newWDom);
};

const removeEvent = (
  oldProps: Props,
  element: HTMLElement | DocumentFragment | Text
) => {
  Object.entries(oldProps || {}).forEach(
    ([dataKey, dataValue]: [string, unknown]) => {
      if (dataKey.match(/^on/)) {
        element.removeEventListener(
          getEventName(dataKey),
          dataValue as (e: Event) => void
        );
      }
    }
  );
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
  element?: HTMLElement | Element | DocumentFragment | Text,
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
        updateEvent(
          element as HTMLElement,
          dataKey,
          dataValue as (e: Event) => void,
          originalProps[dataKey] as (e: Event) => void
        );
      } else if (checkCheckableElement(element) && dataKey === 'checked') {
        (element as HTMLInputElement).checked = !!dataValue;
      } else if (checkTextareaElement(element) && dataKey === 'value') {
        (element as HTMLInputElement).value = dataValue as string;
      } else if (checkOptionElement(element) && dataKey === 'selected') {
        (element as HTMLOptionElement).selected = !!dataValue;
      } else if (checkNormalAttribute(dataValue)) {
        if (xmlnsRef.value && dataKey !== 'xmlns') {
          (element as HTMLElement).setAttributeNS(
            null,
            getAttrKey(dataKey),
            String(dataValue)
          );
        } else {
          (element as HTMLElement).setAttribute(
            getAttrKey(dataKey),
            String(dataValue)
          );
        }
      }

      delete originalProps[dataKey];
    }
  );

  Object.keys(originalProps).forEach(dataKey =>
    (element as HTMLElement).removeAttribute(dataKey)
  );
};

const wDomToDom = (wDom: WDom) => {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = type === 'fragment' || type === 'loop';

  if (tag === 'svg') {
    xmlnsRef.value = String(props?.xmlns || 'http://www.w3.org/2000/svg');
  }

  if (isVirtualType) {
    element = new DocumentFragment();
  } else if (type === 'element' && tag) {
    element = xmlnsRef.value
      ? document.createElementNS(xmlnsRef.value, tag)
      : document.createElement(tag);
  } else if (type === 'text' && checkExisty(text)) {
    element = document.createTextNode(String(text));
  } else {
    element = document.createElement('e');
  }

  wDomChildrenToDom(children, element);
  updateProps(props, element);

  wDom.el = element as HTMLElement;

  runMountedQueueFromWDom(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element;
};

const wDomChildrenToDom = (
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text
) => {
  const elementChildren = children.reduce(
    (acc: DocumentFragment, childItem: WDom) => {
      if (childItem.type) {
        acc.appendChild(wDomToDom(childItem));
      }

      return acc;
    },
    new DocumentFragment()
  );

  if (parentElement && elementChildren.hasChildNodes()) {
    parentElement.appendChild(elementChildren);
  }
};

const updateEvent = (
  element: HTMLElement,
  eventKey: string,
  newEventHandler: (e: Event) => void,
  oldEventHandler: (e: Event) => void
) => {
  const eventName = getEventName(eventKey);

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
  element?: HTMLElement | Element | DocumentFragment | Text
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

  return findRealParentElement(getParent(vDom));
};

import { WDom, Props } from '@/types';
import {
  checkStyleData,
  checkRefData,
  checkExisty,
  checkVirtualType,
  hasAccessorMethods,
} from '@/utils/predicator';

import { componentMap, xmlnsRef } from '@/utils/universalRef';
import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';
import { execMountedQueue, addMountedQueue } from '@/hook/mountCallback';
import { runWDomCallbacksFromWDom } from '@/hook/mountReadyCallback';
import { runUpdatedQueueFromWDom } from '@/hook/internal/useUpdate';
import { getParent, entries, keys } from '@/utils';

const DF = () => new DocumentFragment();
const CE = (t: string) => document.createElement(t);

export const render = (
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null,
  isHydration?: boolean
) => {
  wDom.isRoot = true;
  wrapElement = wrapElement || document.body;
  wDom.we = wrapElement;

  const Dom = wDomToDom(wDom, isHydration);

  if (afterElement) {
    wDom.ae = afterElement;
    wrapElement.insertBefore(Dom, afterElement);
  } else if (!isHydration) {
    if (wrapElement.tagName === 'HTML') {
      wrapElement.replaceWith(Dom);
    } else {
      wrapElement.appendChild(Dom);
    }
  }

  execMountedQueue();

  return () => {
    const compData = componentMap.get(wDom.compProps || {});
    const comp = (compData && compData.vd.value) || wDom;
    if (comp !== wDom) runUnmountQueueFromWDom(comp);
    recursiveRemoveEvent(comp);
    rootDelete(comp);
  };
};

export const recursiveRemoveEvent = (originalWDom: WDom) => {
  if (originalWDom.props && originalWDom.el) {
    removeEvent(originalWDom.props, originalWDom.el);
  }

  (originalWDom.children || []).forEach((childItem: WDom) => {
    recursiveRemoveEvent(childItem);
  });
};

const rootDelete = (newWDom: WDom) =>
  deleteRealDom(newWDom, newWDom.we as HTMLElement);

export const typeDelete = (newWDom: WDom) => {
  if (newWDom.op && newWDom.el) {
    removeEvent(newWDom.op, newWDom.el);
  }

  deleteRealDom(
    newWDom,
    findRealParentElement(getParent(newWDom)) as HTMLElement
  );
};

const deleteRealDom = (newWDom: WDom, parent: HTMLElement) => {
  if (parent && newWDom.el) {
    const nt = newWDom.el.nodeType;
    if ([1, 3].includes(nt)) {
      parent.removeChild(newWDom.el);
    } else if (nt === 11) {
      findChildWithRemoveElement(newWDom, parent);
    }
    delete newWDom.el;
  }
};

const findChildWithRemoveElement = (newWDom: WDom, parent: HTMLElement) => {
  ((newWDom && newWDom.oc) || (newWDom && newWDom.children) || []).forEach(
    item => {
      const nt = item.el && item.el.nodeType;
      if (nt) {
        if ([1, 3].includes(nt)) {
          const el = item.el as HTMLElement;
          el.tagName === 'HTML' ? (el.innerHTML = '') : el.remove();
        } else if (nt === 11) {
          findChildWithRemoveElement(item, parent);
        }
      }
    }
  );
};

const typeSortedReplace = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom);
};

const typeSortedUpdate = (newWDom: WDom) => {
  typeUpdate(newWDom);

  const parentWDom = getParent(newWDom);
  if (parentWDom.nr !== 'L') {
    const newElement = getElementFromFragment(newWDom);

    typeAdd(newWDom, newElement);
  }
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
    const isLoop = parentWDom.type === 'l';
    const nextEl =
      isLoop && parentWDom.nr && parentWDom.nr !== 'L'
        ? startFindNextBrotherElement(parentWDom, getParent(parentWDom))
        : startFindNextBrotherElement(newWDom, parentWDom);

    if (newElement && parentEl) {
      if (newWDom.tag !== 'portal') {
        nextEl
          ? parentEl.insertBefore(newElement, nextEl)
          : parentEl.appendChild(newElement);
      }
      execMountedQueue();
    }
  }
};

const getElementFromFragment = (newWDom: WDom) => {
  if (checkVirtualType(newWDom.type)) {
    return ((newWDom && newWDom.children) || []).reduce((acc, item) => {
      const element = getElementFromFragment(item);

      if (element) {
        acc.appendChild(element);
      }
      return acc;
    }, DF());
  }

  return newWDom.el;
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

  if (!parentWDom.isRoot && checkVirtualType(parentType)) {
    return startFindNextBrotherElement(parentWDom, getParent(parentWDom));
  } else if (
    parentWDom.isRoot &&
    checkVirtualType(parentType) &&
    parentWDom.ae
  ) {
    return parentWDom.ae;
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
      if (targetEl) return targetEl;
      const { type, el } = bItem;
      if (type && checkVirtualType(type))
        return findChildFragmentNextElement(bItem.children || []);
      if (el && el.nodeType !== 11) return el;
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

      if (parentElement && newWDom.tag !== 'portal') {
        parentElement.replaceChild(newElement, orignalElement);
      }
      execMountedQueue();
    }
  }
};

const removeEvent = (
  oldProps: Props,
  element: HTMLElement | DocumentFragment | Text
) => {
  entries(oldProps || {}).forEach(([dataKey, dataValue]: [string, unknown]) => {
    if (dataKey.match(/^on/)) {
      element.removeEventListener(
        dataKey.slice(2).toLowerCase(),
        dataValue as (e: Event) => void
      );
    }
  });
};

const typeUpdate = (newWDom: WDom) => {
  if (newWDom.type === 't') {
    updateText(newWDom);
    return;
  }

  if (newWDom.el) {
    const { op: oldProps, props } = newWDom;
    updateProps(props, newWDom.el, oldProps);
    delete newWDom.op;

    if (newWDom.tag === 'input') {
      (newWDom.el as HTMLInputElement).value = String(
        (props && props.value) || ''
      );
    }
  }

  (newWDom.children || []).forEach(childItem => wDomUpdate(childItem));
  runUpdatedQueueFromWDom(newWDom);
};

export const wDomUpdate = (newWDomTree: WDom) => {
  const { nr: needRerender } = newWDomTree;

  if (needRerender !== undefined && needRerender !== 'N') {
    renderHandlers[needRerender](newWDomTree);

    delete newWDomTree.nr;
    delete newWDomTree.oc;
    delete newWDomTree.op;
  }
};

const renderHandlers = {
  A: typeAdd,
  D: typeDelete,
  R: typeReplace,
  U: typeUpdate,
  S: typeSortedReplace,
  T: typeSortedUpdate,
  L: typeUpdate,
} as const;

const updateText = (newWDom: WDom) => {
  if (newWDom.el) {
    newWDom.el.nodeValue = String(newWDom.text);
  }
};

const updateProps = (
  props?: Props,
  element?: HTMLElement | Element | DocumentFragment | Text,
  oldProps?: Props | null,
  isHydration?: boolean
) => {
  const originalProps = { ...oldProps };

  entries(props || {}).forEach(([dataKey, dataValue]: [string, unknown]) => {
    if (isHydration && dataKey.match(/^on/)) {
      updateEvent(
        element as HTMLElement,
        dataKey,
        dataValue as (e: Event) => void,
        originalProps[dataKey] as (e: Event) => void
      );
    } else {
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
        updateEvent(
          element as HTMLElement,
          dataKey,
          dataValue as (e: Event) => void,
          originalProps[dataKey] as (e: Event) => void
        );
      } else if (dataKey) {
        if (dataKey !== 'type' && hasAccessorMethods(element, dataKey)) {
          (element as HTMLElement & Record<string, unknown>)[dataKey] =
            dataValue;
        } else {
          setAttr(
            dataKey === 'className' ? 'class' : dataKey,
            element as HTMLElement,
            dataValue as string
          );
        }
      }

      delete originalProps[dataKey];
    }
  });

  keys(originalProps).forEach(dataKey =>
    (element as HTMLElement).removeAttribute(dataKey)
  );
};

const setAttr = (k: string, el: HTMLElement, v: string) =>
  xmlnsRef.value && k !== 'xmlns'
    ? el.setAttributeNS(null, k, v)
    : el.setAttribute(k, v);

const wDomToDom = (wDom: WDom, isHydration?: boolean): HTMLElement => {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  runWDomCallbacksFromWDom(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = String(props && props.xmlns);
  }

  if (!isHydration) {
    if (isVirtualType) {
      element = DF();
    } else if (type === 'e' && tag) {
      // element
      if (tag === 'portal' && props && props.portal) {
        element = props.portal as HTMLElement;
      } else {
        element = xmlnsRef.value
          ? document.createElementNS(xmlnsRef.value, tag)
          : CE(tag);
      }
    } else if (type === 't' && checkExisty(text)) {
      // text node
      element = document.createTextNode(String(text));
    } else {
      element = CE('e');
    }

    wDom.el = element as HTMLElement;
  } else {
    element = wDom.el;
  }

  wDomChildrenToDom(children, element, isHydration);

  updateProps(props, element, null, isHydration);

  addMountedQueue(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element as HTMLElement;
};

const wDomChildrenToDom = (
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text,
  isHydration?: boolean
) => {
  const frag = children.reduce((acc: DocumentFragment, childItem: WDom) => {
    if (childItem.type) {
      const childElement = wDomToDom(childItem, isHydration);
      if (childItem.tag !== 'portal' && !isHydration) {
        acc.appendChild(childElement);
      }
    }
    return acc;
  }, DF());

  if (!isHydration && parentElement && frag.hasChildNodes()) {
    parentElement.appendChild(frag);
  }
};

const updateEvent = (
  element: HTMLElement,
  eventKey: string,
  newEventHandler: (e: Event) => void,
  oldEventHandler: (e: Event) => void
) => {
  const eventName = eventKey.slice(2).toLowerCase();

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
  const orig = { ...oldStyle };
  const htmlElement = element instanceof HTMLElement ? element : null;
  const cssStyle = htmlElement?.style;

  if (!cssStyle) return;

  const styleProxy = cssStyle as unknown as Record<string, string>;

  entries(style).forEach(([k, v]) => {
    styleProxy[k] = v;
    delete orig[k];
  });

  entries(orig).forEach(([k]) => {
    styleProxy[k] = '';
  });
};

const findRealParentElement = (
  vDom: WDom
): HTMLElement | DocumentFragment | Text | undefined => {
  const isVirtualType = checkVirtualType(vDom.type);
  if (vDom.isRoot && isVirtualType) {
    return vDom.we;
  }

  if (!isVirtualType) {
    return vDom.el as HTMLElement;
  }

  return findRealParentElement(getParent(vDom));
};

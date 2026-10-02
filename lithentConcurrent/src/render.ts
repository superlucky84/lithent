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
import { getParent, isObject } from '@/utils';

const DF = () => new DocumentFragment();

/**
 * Elements built during the BUILD phase, waiting for their commit (D7).
 *
 * Phase 8 measured where a unit's time goes: on a creation-heavy render 71% of
 * the commit is `wDomToDom`, which only allocates detached nodes. Doing it in
 * the build makes that share interruptible; the commit is then left with the
 * part that really is atomic — putting the nodes in the document.
 *
 * A WeakMap rather than a field on the node: `WDom` lives in the frozen base
 * core and cannot be widened (P1, same reason as DC-19). Abandoning a build
 * needs no cleanup — nothing takes the entry, the recorded callbacks never run,
 * and both the entry and the elements are collected.
 */
/**
 * Recorded instead of run while an element tree is built early.
 *
 * Node references, not thunks: a 10,000 row create walks ~20,000 nodes and two
 * closures each is a measurable tax the base core does not pay. Replaying keeps
 * each list's own order — the two lists do not have to interleave the way they
 * did originally, because `addMountedQueue` only appends to a queue that is
 * flushed later and nothing can observe it in between.
 */
type Prepared = { el: HTMLElement; ready: WDom[]; mounted: WDom[] };

const preparedDom = new WeakMap<WDom, Prepared>();

/** Builds a new subtree's elements ahead of time. Nothing observable happens. */
export const prepareDom = (wDom: WDom) => {
  // `wDomToDom` claims `el` for the node it builds. On a replace the OLD element
  // still has to be findable at commit — `typeReplace` reads it as the node to
  // swap out and `typeDelete` as the node to remove — so it is put back here and
  // handed over only when the commit takes the prepared one.
  const previousEl = wDom.el;
  const ready: WDom[] = [];
  const mounted: WDom[] = [];
  const el = wDomToDom(wDom, false, { ready, mounted });

  wDom.el = previousEl;
  preparedDom.set(wDom, { el, ready, mounted });
};

/**
 * Claims a prepared subtree and runs what its creation deferred.
 *
 * Called from exactly where `wDomToDom` used to be called, so the deferred
 * callbacks land at the same point in the commit as before.
 */
/**
 * An insertion anchor is only usable if it is actually a child of the parent.
 *
 * Since elements are built during the build phase (D7), a sibling that has not
 * been committed yet already HAS an element — one that is not in the document.
 * The anchor search happily returns it, and `insertBefore` then throws
 * NotFoundError. Falling back to `null` appends, which is what the base core
 * does in that situation: the sibling did not exist there yet either.
 */
const anchorIn = (parentEl: Node, node?: unknown) =>
  node && (node as Node).parentNode === parentEl ? (node as Node) : null;

const takeDom = (wDom: WDom) => {
  const prepared = preparedDom.get(wDom);

  if (!prepared) {
    return undefined;
  }

  preparedDom.delete(wDom);
  wDom.el = prepared.el;
  prepared.ready.forEach(runWDomCallbacksFromWDom);
  prepared.mounted.forEach(addMountedQueue);

  return prepared.el;
};
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

  const parentWDom = getParent(newWDom);
  const parentElement = newWDom.isRoot
    ? newWDom.we
    : parentWDom
      ? findRealParentElement(parentWDom)
      : undefined;

  if (parentElement) {
    deleteRealDom(newWDom, parentElement as HTMLElement);
  }
};

const deleteRealDom = (newWDom: WDom, parent: HTMLElement) => {
  if (parent && newWDom.el) {
    const nt = newWDom.el.nodeType;
    if (nt === 11 || newWDom?.tag === 'portal') {
      findChildWithRemoveElement(newWDom, parent);
    } else if (nt === 1 || nt === 3) {
      parent.removeChild(newWDom.el);
    }

    delete newWDom.el;
  }
};

const findChildWithRemoveElement = (newWDom: WDom, parent: HTMLElement) => {
  const items = (newWDom && newWDom.oc) || (newWDom && newWDom.children) || [];

  // Bulk fast path: the parent element contains exactly these children,
  // so they can all be dropped in a single operation.
  // (counted via sibling pointers -- childNodes would materialize a live list)
  let count = 0;
  for (let node = parent.firstChild; node; node = node.nextSibling) {
    count++;
  }

  if (
    items.length > 1 &&
    count === items.length &&
    items.every(item => {
      const nt = item.el && item.el.nodeType;
      return (
        (nt === 1 || nt === 3) &&
        (item.el as HTMLElement).tagName !== 'HTML' &&
        item.tag !== 'portal'
      );
    })
  ) {
    parent.textContent = '';
    items.forEach(item => delete item.el);
    return;
  }

  items.forEach(item => {
    const nt = item.el && item.el.nodeType;
    if (nt) {
      if (nt === 1 || nt === 3) {
        const el = item.el as HTMLElement;
        el.tagName === 'HTML' ? (el.innerHTML = '') : el.remove();
      } else if (nt === 11) {
        findChildWithRemoveElement(item, parent);
      }
    }
  });
};

/**
 * Unmount, detach events, and remove unused keyed children.
 */
export const typeDeleteUnused = (items: WDom[]) => {
  items.forEach(item => {
    runUnmountQueueFromWDom(item);
    recursiveRemoveEvent(item);
    typeDelete(item);
  });
};

const typeSortedReplace = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom);
};

const typeSortedUpdate = (newWDom: WDom) => {
  typeUpdate(newWDom);

  if (getParent(newWDom) || newWDom.isRoot) {
    typeAdd(newWDom, getElementFromFragment(newWDom));
  }
};

const typeAdd = (
  newWDom: WDom,
  newElement?: HTMLElement | DocumentFragment | Text
) => {
  if (!newElement) {
    newElement = (takeDom(newWDom) || wDomToDom(newWDom)) as HTMLElement;
  }

  const parentWDom = getParent(newWDom);
  if (!parentWDom || !parentWDom.type) {
    if (
      newWDom.isRoot &&
      newWDom.we &&
      newElement &&
      newWDom.tag !== 'portal'
    ) {
      if (newWDom.ae) {
        newWDom.we.insertBefore(newElement, newWDom.ae);
      } else if (newWDom.we.tagName === 'HTML') {
        newWDom.we.replaceWith(newElement);
      } else {
        newWDom.we.appendChild(newElement);
      }
    }
    return;
  }

  const parentEl = findRealParentElement(parentWDom);
  const nextEl =
    parentWDom.type === 'l' && parentWDom.nr
      ? startFindNextBrotherElement(parentWDom, getParent(parentWDom))
      : startFindNextBrotherElement(newWDom, parentWDom);

  if (newElement && parentEl) {
    if (newWDom.tag !== 'portal') {
      parentEl.insertBefore(newElement, anchorIn(parentEl, nextEl));
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
  candidiateBrothers.reduce<HTMLElement | DocumentFragment | Text | undefined>(
    (targetEl, bItem) => {
      if (targetEl) return targetEl;
      const { type, el } = bItem;
      if (type && checkVirtualType(type)) {
        const found = findChildFragmentNextElement(bItem.children || []);
        if (found) return found;
      }
      if (el && el.nodeType !== 11) return el;
      return targetEl;
    },
    undefined
  );

const typeReplace = (newWDom: WDom) => {
  const parentWDom = getParent(newWDom);
  const orignalElement = newWDom.el;

  if (newWDom.isRoot && !parentWDom && orignalElement) {
    typeSortedReplace(newWDom);
    return;
  }

  if (parentWDom && parentWDom.type && orignalElement) {
    if (orignalElement.nodeType === 11) {
      typeSortedReplace(newWDom);
    } else {
      const parentElement = findRealParentElement(parentWDom);
      const newElement = takeDom(newWDom) || wDomToDom(newWDom);

      if (parentElement && newWDom.tag !== 'portal') {
        parentElement.replaceChild(newElement, orignalElement);
      }
    }
  }
};

const removeEvent = (
  oldProps: Props,
  element: HTMLElement | DocumentFragment | Text
) => {
  for (const dataKey in oldProps) {
    if (dataKey[0] === 'o' && dataKey[1] === 'n') {
      element.removeEventListener(
        dataKey.slice(2).toLowerCase(),
        oldProps[dataKey] as (e: Event) => void
      );
    }
  }
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

  updateChildren(newWDom);
  runUpdatedQueueFromWDom(newWDom);
};

/**
 * Process child updates. Loop parents with added/moved children are handled
 * in O(n): a left-to-right content pass (keeps lifecycle order), an LIS over
 * the matched original indices (oi, recorded by the diff phase) to pick the
 * children that can stay in place, and a right-to-left placement pass that
 * inserts only added children and non-LIS moves before a running anchor.
 */
const updateChildren = (newWDom: WDom) => {
  const children = newWDom.children || [];
  let needPlace = false;

  if (newWDom.type === 'l') {
    for (const item of children) {
      if ('ATS'.includes(item.nr as string) || item.oi !== undefined) {
        needPlace = true;
        break;
      }
    }
  }

  if (!needPlace) {
    children.forEach(childItem => wDomUpdate(childItem));
    return;
  }

  // Content pass (left-to-right, keeps lifecycle order).
  // Added children are created here but inserted in the placement pass.
  const created: (HTMLElement | DocumentFragment | Text | undefined)[] = [];
  const matchedIndexes: number[] = [];
  const oiSeq: number[] = [];
  let createdCount = 0;

  children.forEach((item, index) => {
    const nr = item.nr;

    if (nr === 'A' || nr === 'S') {
      if (nr === 'S') {
        typeDelete(item);
      }
      created[index] = takeDom(item) || wDomToDom(item);
      createdCount++;
    } else if (nr === 'T') {
      typeUpdate(item);
    } else {
      wDomUpdate(item);
    }

    if (item.oi !== undefined && created[index] === undefined) {
      matchedIndexes.push(index);
      oiSeq.push(item.oi);
    }
  });

  const stay = new Set(getLisPositions(oiSeq).map(pos => matchedIndexes[pos]));
  const parentEl = findRealParentElement(newWDom);
  const baseAnchor = newWDom.isRoot
    ? newWDom.ae
    : startFindNextBrotherElement(newWDom, getParent(newWDom));

  // Fast-append the trailing run of added children in order
  // (a null anchor makes insertBefore behave as appendChild).
  let tail = children.length;
  while (tail > 0 && created[tail - 1] !== undefined) {
    tail--;
  }

  for (let i = tail; i < children.length; i++) {
    const el = created[i];

    if (el && parentEl && children[i].tag !== 'portal') {
      parentEl.insertBefore(el, anchorIn(parentEl, baseAnchor));
    }
  }

  if (
    stay.size !== matchedIndexes.length ||
    createdCount > children.length - tail
  ) {
    // Placement pass (right-to-left): insert added children and non-LIS
    // moves before a running anchor.
    let anchor =
      findChildFragmentNextElement(children.slice(tail)) || baseAnchor;

    for (let i = tail - 1; i >= 0; i--) {
      const item = children[i];
      const isNew = created[i] !== undefined;
      const needMove = item.oi !== undefined && !isNew && !stay.has(i);

      if ((isNew || needMove) && parentEl && item.tag !== 'portal') {
        const el = isNew ? created[i] : getElementFromFragment(item);

        if (el) {
          parentEl.insertBefore(el, anchorIn(parentEl, anchor));
        }
      }

      const first = findChildFragmentNextElement([item]);
      if (first) {
        anchor = first;
      }
    }
  }

  children.forEach(clearDiffMeta);
};

const clearDiffMeta = (item: WDom) => {
  delete item.oi;
  delete item.nr;
  delete item.oc;
  delete item.op;
};

/**
 * Longest increasing subsequence positions (binary search, O(n log n)).
 * Returns the positions in seq that form the LIS.
 */
const getLisPositions = (seq: number[]) => {
  const result: number[] = [];

  if (!seq.length) {
    return result;
  }

  const prev = new Array(seq.length);
  result.push(0);

  for (let i = 1; i < seq.length; i++) {
    const value = seq[i];

    if (seq[result[result.length - 1]] < value) {
      prev[i] = result[result.length - 1];
      result.push(i);
      continue;
    }

    let lo = 0;
    let hi = result.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (seq[result[mid]] < value) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    if (value < seq[result[lo]]) {
      if (lo > 0) {
        prev[i] = result[lo - 1];
      }
      result[lo] = i;
    }
  }

  let i = result.length;
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = prev[last];
  }

  return result;
};

export const wDomUpdate = (newWDomTree: WDom) => {
  const { nr: needRerender } = newWDomTree;

  if (needRerender !== undefined && needRerender !== 'N') {
    renderHandlers[needRerender](newWDomTree);
    clearDiffMeta(newWDomTree);
  }
};

const renderHandlers = {
  A: typeAdd,
  D: typeDelete,
  R: typeReplace,
  U: typeUpdate,
  S: typeSortedReplace,
  T: typeSortedUpdate,
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
  const originalProps = oldProps || {};

  for (const dataKey in props) {
    const dataValue: unknown = props[dataKey];

    if (dataValue === originalProps[dataKey]) {
      delete originalProps[dataKey];
      continue;
    }

    const isEvent = dataKey[0] === 'o' && dataKey[1] === 'n';

    if (isHydration && isEvent) {
      updateEvent(
        element as HTMLElement,
        dataKey,
        dataValue as (e: Event) => void,
        originalProps[dataKey] as (e: Event) => void
      );
    } else {
      if (dataKey === 'key') {
        // Do nothing
      } else if (dataKey === 'portal' && isObject(dataValue)) {
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
      } else if (isEvent) {
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
  }

  for (const dataKey in originalProps) {
    (element as HTMLElement).removeAttribute(dataKey);
  }
};

const setAttr = (k: string, el: HTMLElement, v: string) =>
  xmlnsRef.value && k !== 'xmlns'
    ? el.setAttributeNS(null, k, v)
    : el.setAttribute(k, v);

type Recorder = { ready: WDom[]; mounted: WDom[] };

const wDomToDom = (
  wDom: WDom,
  isHydration?: boolean,
  record?: Recorder
): HTMLElement => {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  // With a collector the two observable parts — the user's `mountReadyCallback`
  // and the mount queue entry — are recorded instead of run, so that creating
  // the elements early (during the build, D7) stays unobservable. They are
  // replayed at exactly the commit point that used to call this function, which
  // is what keeps the order identical to the base core.
  // Only component nodes carry these — both callees no-op without a `compKey`.
  // A 10,000 row list of plain elements therefore records nothing at all.
  if (record) {
    if (wDom.compKey) {
      record.ready.push(wDom);
    }
  } else {
    runWDomCallbacksFromWDom(wDom);
  }

  if (tag === 'svg') {
    xmlnsRef.value = String(props && props.xmlns);
  }

  if (!isHydration) {
    if (!type) {
      element = DF();
    } else if (isVirtualType) {
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
      throw Error('Invalid wDom');
    }

    wDom.el = element as HTMLElement;
  } else {
    element = wDom.el;
  }

  wDomChildrenToDom(children, element, isHydration, record);

  updateProps(props, element, null, isHydration);

  if (record) {
    if (wDom.compKey) {
      record.mounted.push(wDom);
    }
  } else {
    addMountedQueue(wDom);
  }

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element as HTMLElement;
};

const wDomChildrenToDom = (
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text,
  isHydration?: boolean,
  record?: Recorder
) => {
  // The parent is not attached to the document yet, so children can be
  // appended directly (no intermediate fragment allocation).
  children.forEach((childItem: WDom) => {
    if (childItem.type) {
      const childElement = wDomToDom(childItem, isHydration, record);
      if (childItem.tag !== 'portal' && !isHydration && parentElement) {
        parentElement.appendChild(childElement);
      }
    }
  });
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

  for (const k in style) {
    styleProxy[k] = style[k];
    delete orig[k];
  }

  for (const k in orig) {
    styleProxy[k] = '';
  }
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

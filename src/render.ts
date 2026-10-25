import { WDom, Props } from '@/types';
import {
  checkStyleData,
  checkRefData,
  checkExisty,
  checkVirtualType,
  hasAccessorMethods,
  isPendingCustomElement,
  checkEventKey,
} from '@/utils/predicator';

import { componentMap, xmlnsRef } from '@/utils/universalRef';
import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';
import { execMountedQueue, addMountedQueue } from '@/hook/mountCallback';
import { runWDomCallbacksFromWDom } from '@/hook/mountReadyCallback';
import { runUpdatedQueueFromWDom } from '@/hook/internal/useUpdate';
import {
  getParent,
  isObject,
  hasEnumerableProp,
  makeParentGetter,
} from '@/utils';
import { cloneWDom } from '@/wDom';
import { updateEvent } from '@/utils/event';

const DF = () => new DocumentFragment();

// Into the root's wrapper: before its after element, in place of <html>, or
// at the end.
const insertRoot = (
  wrapElement: HTMLElement,
  element: Node,
  afterElement?: HTMLElement | null
) =>
  afterElement
    ? wrapElement.insertBefore(element, afterElement)
    : wrapElement.tagName === 'HTML'
      ? wrapElement.replaceWith(element)
      : wrapElement.appendChild(element);
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

  wDom.ae = afterElement as HTMLElement;
  if (afterElement || !isHydration) {
    insertRoot(wrapElement, Dom, afterElement);
  }

  execMountedQueue();

  return () => {
    const compData = componentMap.get(wDom.compProps as Props);
    const comp = (compData && compData.vd.value) || wDom;
    runUnmountQueueFromWDom(comp);
    rootDelete(comp);
  };
};

const rootDelete = (newWDom: WDom) =>
  deleteRealDom(newWDom, newWDom.we as HTMLElement);

export const typeDelete = (newWDom: WDom) => {
  const parentWDom = getParent(newWDom);
  deleteRealDom(
    newWDom,
    (newWDom.isRoot
      ? newWDom.we
      : parentWDom && findRealParentElement(parentWDom)) as HTMLElement
  );
};

const deleteRealDom = (newWDom: WDom, parent: HTMLElement) => {
  if (parent && newWDom.el) {
    const nt = newWDom.el.nodeType;
    if (nt === 11 || newWDom.tag === 'portal') {
      findChildWithRemoveElement(newWDom, parent);
    } else if (nt === 1 || nt === 3) {
      parent.removeChild(newWDom.el);
    }

    newWDom.el = undefined;
  }
};

const findChildWithRemoveElement = (newWDom: WDom, parent: HTMLElement) => {
  const items = newWDom.oc || newWDom.children || [];

  // Bulk fast path: the parent element contains exactly these children,
  // so they can all be dropped in a single operation.
  if (
    items.length > 1 &&
    items.every(item => {
      const nt = item.el && item.el.nodeType;
      return (
        (nt === 1 || nt === 3) &&
        (item.el as HTMLElement).tagName !== 'HTML' &&
        item.tag !== 'portal'
      );
    })
  ) {
    // Stop one past the candidates: a component in a long list calls this
    // once per component, so counting every sibling there is quadratic.
    // (counted via sibling pointers -- childNodes would materialize a live list)
    let count = 0;
    for (
      let node = parent.firstChild;
      node && count <= items.length;
      node = node.nextSibling
    ) {
      count++;
    }

    if (count === items.length) {
      parent.textContent = '';
      items.forEach(item => (item.el = undefined));
      return;
    }
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
 * Unmount and remove unused keyed children. Listeners are left on the
 * discarded DOM and go away with it. The parent element is found from the
 * list they were in: a child's own parent link may have been moved on by
 * the same node being drawn in another place since.
 */
export const typeDeleteUnused = (items: WDom[], list: WDom) => {
  const parentElement = findRealParentElement(list) as HTMLElement;
  items.forEach(item => {
    runUnmountQueueFromWDom(item);
    deleteRealDom(item, parentElement);
  });
};

const typeSortedReplace = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom);
};

const typeAdd = (
  newWDom: WDom,
  newElement?: HTMLElement | DocumentFragment | Text
) => {
  newElement = newElement || wDomToDom(newWDom);

  const parentWDom = getParent(newWDom);
  if (!parentWDom || !parentWDom.type) {
    if (newWDom.isRoot && newWDom.we && newWDom.tag !== 'portal') {
      insertRoot(newWDom.we, newElement, newWDom.ae);
      execMountedQueue();
    }
    return;
  }

  const parentEl = findRealParentElement(parentWDom);
  // Children added or moved inside a loop are placed by updateChildren, so
  // anything that reaches here (e.g. a replaced fragment or component in an
  // unkeyed loop) goes right before its own next sibling.
  const nextEl = startFindNextBrotherElement(newWDom, parentWDom);

  if (parentEl) {
    if (newWDom.tag !== 'portal') {
      parentEl.insertBefore(newElement, nextEl || null);
    }
    execMountedQueue();
  }
};

const getElementFromFragment = (newWDom: WDom) => {
  if (checkVirtualType(newWDom.type)) {
    return (newWDom.children || []).reduce((acc, item) => {
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

  // After the brothers, a fragment or loop parent goes on with its own next
  // brother, up to the root's after element.
  return (
    findChildFragmentNextElement(brothers.slice(brothers.indexOf(wDom) + 1)) ||
    (checkVirtualType(parentWDom.type)
      ? parentWDom.isRoot
        ? parentWDom.ae
        : startFindNextBrotherElement(parentWDom, getParent(parentWDom))
      : undefined)
  );
};

// Children of a list being updated that move or are added: until its
// placement pass they are not where they will be, so they are no anchor for
// content inserted meanwhile. Kept here rather than as a flag on the node,
// which would give the nodes that get it another shape.
const moving = new Set<WDom>();

const findChildFragmentNextElement = (
  candidiateBrothers: WDom[]
): HTMLElement | DocumentFragment | Text | undefined =>
  candidiateBrothers.reduce<HTMLElement | DocumentFragment | Text | undefined>(
    (targetEl, bItem) => {
      if (targetEl || (moving.size && moving.has(bItem))) return targetEl;
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

  if (orignalElement && (parentWDom ? parentWDom.type : newWDom.isRoot)) {
    if (!parentWDom || orignalElement.nodeType === 11) {
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

const typeUpdate = (newWDom: WDom) => {
  if (newWDom.type === 't') {
    updateText(newWDom);
    return;
  }

  if (newWDom.el) {
    const { op: oldProps, props } = newWDom;
    updateProps(props, newWDom.el, oldProps);

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

  if (
    newWDom.type !== 'l' ||
    !children.some(
      item => 'ATS'.includes(item.nr as string) || item.oi !== undefined
    )
  ) {
    children.forEach(wDomUpdate);
    return;
  }

  // The matched children that keep their place: an LIS over their original
  // indexes (oi). Worked out before the content pass, because until the
  // placement pass a child that moves is still where it was, and so is the
  // old element of one replaced (S): neither may be the anchor for content
  // inserted meanwhile (moving), such as a kept row whose fragment changed.
  // An added child needs no such care: it has no element before the content
  // pass reaches it, and anchors are looked for after the child at hand.
  // Read up front: wDomUpdate clears oi on an unkeyed child matched by
  // position.
  const matchedIndexes: number[] = [];
  const oiSeq: number[] = [];

  // Replaced children, then the matched ones that move.
  const movers: WDom[] = [];
  let ordered = true;

  children.forEach((item, index) => {
    const oi = item.oi;
    const nr = item.nr;
    if (nr === 'S') {
      movers.push(item);
    } else if (nr !== 'A' && oi !== undefined) {
      if (oi < oiSeq[oiSeq.length - 1]) {
        ordered = false;
      }
      matchedIndexes.push(index);
      oiSeq.push(oi);
    }
  });

  // keep[i]: whether matched child i stays (unset when not matched).
  // Matched children still in their original order all stay, as in a redraw
  // that moves nothing: no LIS then. Only the children that move or are
  // added are flagged, so a long list's children are usually untouched.
  let keep: boolean[] | undefined;
  if (!ordered) {
    const lis: boolean[] = (keep = []);
    getLisPositions(oiSeq).forEach(pos => (lis[matchedIndexes[pos]] = true));
    matchedIndexes.forEach(
      i => lis[i] || ((lis[i] = false), movers.push(children[i]))
    );
  }

  // Content pass (left-to-right, keeps lifecycle order).
  // Added children are created here but inserted in the placement pass.
  const created: (HTMLElement | DocumentFragment | Text | undefined)[] = [];
  let createdCount = 0;

  movers.forEach(item => moving.add(item));
  try {
    children.forEach((item, index) => {
      const nr = item.nr;

      if (nr === 'A' || nr === 'S') {
        if (nr === 'S') {
          typeDelete(item);
        }
        created[index] = wDomToDom(item);
        createdCount++;
      } else {
        wDomUpdate(item);
      }
    });
  } finally {
    movers.forEach(item => moving.delete(item));
  }

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
      parentEl.insertBefore(el, baseAnchor || null);
    }
  }

  if (keep || createdCount > children.length - tail) {
    // Placement pass (right-to-left): insert added children and non-LIS
    // moves before a running anchor.
    let anchor =
      findChildFragmentNextElement(children.slice(tail)) || baseAnchor;

    for (let i = tail - 1; i >= 0; i--) {
      const item = children[i];
      const isNew = created[i] !== undefined;
      const needMove = !!keep && keep[i] === false;

      if ((isNew || needMove) && parentEl && item.tag !== 'portal') {
        const el = isNew ? created[i] : getElementFromFragment(item);

        if (el) {
          parentEl.insertBefore(el, anchor || null);
        }
      }

      const first = findChildFragmentNextElement([item]);
      if (first) {
        anchor = first;
      }
    }
  }

  children.forEach(clearDiffMeta);
  execMountedQueue();
};

// Assigned, not deleted: `delete` changes the object's shape, which makes
// every later access to the node slower. nr goes back to 'N' (nothing to
// do), not undefined: a node that has it is drawn (see makeNewWDomTree).
const clearDiffMeta = (item: WDom) => {
  item.oi = item.oc = item.op = undefined;
  item.nr = 'N';
};

/**
 * Longest increasing subsequence positions (binary search, O(n log n)).
 * Returns the positions in seq that form the LIS.
 */
const getLisPositions = (seq: number[]) => {
  // tails[k]: the position ending the smallest-tailed increasing run of
  // length k + 1. A value larger than the last tail just extends it.
  const tails: number[] = [];
  const prev: number[] = [];

  seq.forEach((value, i) => {
    let lo = 0;
    let hi = tails.length;

    if (hi && seq[tails[hi - 1]] < value) {
      lo = hi;
    } else {
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (seq[tails[mid]] < value) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
    }

    prev[i] = lo ? tails[lo - 1] : -1;
    tails[lo] = i;
  });

  let i = tails.length;
  let last = tails[i - 1];
  while (i-- > 0) {
    tails[i] = last;
    last = prev[last];
  }

  return tails;
};

export const wDomUpdate = (newWDomTree: WDom) => {
  const { nr: needRerender } = newWDomTree;

  if (needRerender && needRerender !== 'N') {
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
  // A keyed item reaches here only as a component redrawing itself: it has
  // not moved, so it is updated in place. Re-inserting its nodes would blur a
  // focused input inside it or reload an iframe. Moves within a list are
  // placed by updateChildren.
  T: typeUpdate,
} as const;

const updateText = (newWDom: WDom) => {
  if (newWDom.el) {
    newWDom.el.nodeValue = String(newWDom.text);
  }
};

const updateProps = (
  props?: Props,
  element?: HTMLElement | Element | DocumentFragment | Text,
  oldProps?: Props | null
) => {
  const originalProps = oldProps || {};

  for (const dataKey in props) {
    const dataValue: unknown = props[dataKey];

    if (dataValue === originalProps[dataKey]) {
      continue;
    }

    // An event key starts with "on", so it is none of the keys below.
    if (checkEventKey(dataKey)) {
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
          // Keep the real value too: once defined, the element absorbs own
          // properties through its accessors, so an object or `false` is not
          // left as the attribute string (B-3).
          // Only keys HTMLElement lacks: `textContent` or `offsetWidth` would
          // run a DOM setter or throw.
          if (
            isPendingCustomElement(element) &&
            !(dataKey in HTMLElement.prototype)
          ) {
            (element as HTMLElement & Record<string, unknown>)[dataKey] =
              dataValue;
          }
        }
      }
    }
  }

  // Props that are gone. The previous props object is left as it was: it may
  // be the caller's own object.
  for (const dataKey in originalProps) {
    if (props && hasEnumerableProp(props, dataKey)) {
      continue;
    }

    if (checkEventKey(dataKey)) {
      updateEvent(
        element as HTMLElement,
        dataKey,
        undefined,
        originalProps[dataKey] as (e: Event) => void
      );
      continue;
    }

    (element as HTMLElement).removeAttribute(dataKey);
    // A prop that went in as a custom element property is unset there too
    // (B-4). Not upgraded yet: drop the value kept for it (B-3); `delete`
    // never touches an inherited DOM property such as `title`. Upgraded:
    // only through the element's own accessors, never built-in ones such as
    // input.value, where `undefined` would read as "undefined".
    if (isPendingCustomElement(element)) {
      delete (element as HTMLElement & Record<string, unknown>)[dataKey];
    } else if (
      (element as Element).localName.includes('-') &&
      hasAccessorMethods(element, dataKey)
    ) {
      (element as HTMLElement & Record<string, unknown>)[dataKey] = undefined;
    }
  }
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
    if (!type || isVirtualType) {
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

  wDomChildrenToDom(wDom, children, element, isHydration);

  updateProps(props, element, null);

  addMountedQueue(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element as HTMLElement;
};

const wDomChildrenToDom = (
  wDom: WDom,
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text,
  isHydration?: boolean
) => {
  // The parent is not attached to the document yet, so children can be
  // appended directly (no intermediate fragment allocation).
  const getParent = makeParentGetter(wDom);
  children.forEach((childItem: WDom, index: number) => {
    // A child already drawn elsewhere (nr 'N': the same node twice, a
    // hoisted constant in several components) is drawn here as its own copy.
    // The children of an added subtree come from a diff, which copied those
    // already (nr 'A'). Drawn, the child gets nr 'N' (see makeNewWDomTree).
    if (childItem.nr === 'N' && !isHydration) {
      const copy = cloneWDom(childItem);
      childItem = children[index] = 'resolve' in copy ? copy.resolve() : copy;
    }
    // h() may have assigned a shared node to a later parent already. The
    // first occurrence needs its actual owner too, not only the copies.
    childItem.getParent = getParent;
    childItem.nr = 'N';
    if (childItem.type) {
      const childElement = wDomToDom(childItem, isHydration);
      if (childItem.tag !== 'portal' && !isHydration && parentElement) {
        parentElement.appendChild(childElement);
      }
    }
  });
};

const updateStyle = (
  style: Record<string, string>,
  oldStyle: Record<string, string>,
  element?: HTMLElement | Element | DocumentFragment | Text
) => {
  const orig = { ...oldStyle };
  if (!(element instanceof HTMLElement)) return;

  const styleProxy = element.style as unknown as Record<string, string>;

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
): HTMLElement | DocumentFragment | Text | undefined =>
  checkVirtualType(vDom.type)
    ? vDom.isRoot
      ? vDom.we
      : findRealParentElement(getParent(vDom) as WDom)
    : (vDom.el as HTMLElement);

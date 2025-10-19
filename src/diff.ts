import { WDom, TagFunctionResolver, RenderType, Props } from '@/types';
import { checkCustemComponentFunction, getKey } from '@/utils/predicator';
import { getParent } from '@/utils';
import { typeDelete, recursiveRemoveEvent } from '@/render';
import {
  checkEmptyElement,
  checkSameWDomWithOriginal,
  getWDomType,
  checkExisty,
} from '@/utils/predicator';

import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';
import { assign, keys, entries } from '@/utils';

/**
 * The starting point of the diffing process between the original virtual DOM and the new virtual DOM for re-rendering.
 */
export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom?: WDom
) =>
  remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );

/**
 * Create a new virtual DOM after comparing with the previous virtual DOM
 */
const remakeNewWDom = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
) => {
  const remakeWDom = generalize(newWDom, isSameType, originalWDom);
  const param: [newWDom: WDom, isSameType: boolean, originalWDom?: WDom] = [
    remakeWDom,
    isSameType,
    originalWDom,
  ];
  const needRerender = addReRenderTypeProperty(...param);
  const isNoting = needRerender === 'N';

  if (!isNoting) {
    remakeWDom.children = remakeChildrenForDiff(...param);
  }

  remakeWDom.needRerender = needRerender;
  inheritPropForRender(remakeWDom, originalWDom, needRerender);

  if (!isNoting && originalWDom) {
    originalWDom.isLegacy = true;
    delete originalWDom.children;
  }

  return remakeWDom;
};

/**
 * Handle what the new virtual DOM should inherit or reconcile from the original virtual DOM.
 */
const inheritPropForRender = (
  remakeWDom: WDom,
  originalWDom?: WDom,
  needRerender?: RenderType
) => {
  if (needRerender !== 'A' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (needRerender && ['D', 'R', 'SR'].includes(needRerender)) {
    if (originalWDom) {
      runUnmountQueueFromWDom(originalWDom);
      recursiveRemoveEvent(originalWDom);
    }
    remakeWDom.oldChildren = originalWDom?.children;
  }

  remakeWDom.oldProps = originalWDom?.props;
};

/**
 * Determine the render operation type (Add/Delete/Replace/Update/etc)
 * based on comparison between new and original WDom
 */
const addReRenderTypeProperty = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
): RenderType | undefined => {
  const existOriginalWDom = originalWDom && originalWDom.type;
  const isEmptyElement = checkEmptyElement(newWDom);
  const isRoot = newWDom.isRoot;
  const originalParentWDom = originalWDom && getParent(originalWDom);
  const origParentType = !isRoot && originalParentWDom?.type;
  const key = getKey(newWDom);
  const isKeyCheckedWDom = origParentType === 'l' && checkExisty(key); // 'l': loop
  const isSameText =
    newWDom.type === 't' && // 't': text node
    isSameType &&
    newWDom.text === originalWDom?.text;
  const isSameWDom = newWDom === originalWDom;

  let result: RenderType | undefined;
  if (isEmptyElement) {
    result = 'D';
  } else if (isSameText || isSameWDom) {
    result = 'N';
  } else if (!existOriginalWDom) {
    result = 'A';
  } else if (isSameType) {
    result = isKeyCheckedWDom ? 'SU' : 'U';
  } else {
    result = isKeyCheckedWDom ? 'SR' : 'R';
  }

  if (
    newWDom.type === 'l' && // 'l': loop
    result === 'U' &&
    originalWDom &&
    chkDiffLoopOrder(newWDom, originalWDom)
  ) {
    result = 'CNSU';
  }

  return result;
};

/**
 * Check if a reverse order swap is needed when updating types that require reordering.
 */
const chkDiffLoopOrder = (newWDom: WDom, originalWDom: WDom) => {
  const origChildren = [...(originalWDom?.children || [])];
  const newChildren = [...(newWDom?.children || [])].filter(item =>
    origChildren.find(newItem => getKey(item) === getKey(newItem))
  );
  const filteredChildren = origChildren.filter(item =>
    newChildren.find(newItem => getKey(item) === getKey(newItem))
  );
  let isSame = filteredChildren.length === newChildren.length;

  if (isSame) {
    isSame = filteredChildren.every(
      (item, index) => getKey(item) === getKey(newChildren[index])
    );
  }

  return isSame;
};

/**
 * Handling virtual DOM attribute updates.
 */
const updateProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    keys(props).forEach(key => delete props[key]);

    entries(infoProps || {}).forEach(([key, value]) => (props[key] = value));
  }
};

const updateChildren = (children: WDom[], infoChidren: WDom[]) => {
  if (children && infoChidren !== children) {
    children.splice(0, children.length);

    if (infoChidren) {
      infoChidren.forEach(childrenItem => children.push(childrenItem));
    }
  }
};

/**
 * Start handling when the virtual DOM is updated rather than completely replaced with a new type.
 * (Reflect the state of props or children to ensure the new state is applied)
 * (Handle the reflection of the new state while ensuring that the actual references of props or children are not changed)
 */
const runUpdate = (vDom: WDom, infoVdom: TagFunctionResolver) => {
  const { compProps: props, compChild: children } = vDom;
  const { props: infoProps, children: infoChidren } = infoVdom;

  if (props) {
    updateProps(props, infoProps);
  }

  if (children) {
    updateChildren(children, infoChidren);
  }

  const newVDom = vDom.reRender && vDom.reRender();

  return newVDom as WDom;
};

/**
 * Replace the compared virtual DOM with the new virtual DOM or simply update it.
 */
const generalize = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
): WDom => {
  if (checkCustemComponentFunction(newWDom)) {
    return isSameType && originalWDom
      ? runUpdate(originalWDom, newWDom)
      : newWDom.resolve();
  }

  return newWDom;
};

/**
 * 자식 가상돔들도 전부 재귀처리하며 똑같은 처리를 해준다.
 */
const remakeChildrenForDiff = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
) =>
  isSameType && originalWDom
    ? remakeChildrenForUpdate(newWDom, originalWDom)
    : remakeChildrenForAdd(newWDom);

/**
 * Recursive handling for the creation of a new virtual DOM.
 */
const remakeChildrenForAdd = (newWDom: WDom) =>
  (newWDom.children || []).map((item: WDom) =>
    assign(makeNewWDomTree(item), { getParent: () => newWDom })
  );

/**
 * Recursive handling for updates, not additions.
 * Uses key-based diffing for loops, index-based for others
 */
const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) =>
  newWDom.type === 'l' && checkExisty(getKey((newWDom.children || [])[0])) // 'l': loop
    ? remakeChildrenForLoopUpdate(newWDom, originalWDom)
    : (newWDom.children || []).map((item: WDom, index: number) =>
        assign(makeNewWDomTree(item, (originalWDom.children || [])[index]), {
          getParent: () => newWDom,
        })
      );

/**
 * Handling virtual DOM of loop-type elements.
 */
const remakeChildrenForLoopUpdate = (newWDom: WDom, originalWDom: WDom) => {
  const [remakedChildren, unUsedChildren] = diffLoopChildren(
    newWDom,
    originalWDom
  );

  unUsedChildren.forEach(unusedItem => {
    runUnmountQueueFromWDom(unusedItem);
    recursiveRemoveEvent(unusedItem);
    typeDelete(unusedItem);
  });

  return remakedChildren;
};

/**
 * Recursive handling of loop-type virtual DOM elements.
 */
const diffLoopChildren = (newWDom: WDom, originalWDom: WDom) => {
  const newChildren = [...(newWDom.children || [])];
  const originalChildren = [...(originalWDom.children || [])];
  const remakedChildren = newChildren.map(item => {
    const originalItem = findSameKeyOriginalItem(item, originalChildren);
    const childItem = makeNewWDomTree(item, originalItem);

    if (originalItem) {
      originalChildren.splice(originalChildren.indexOf(originalItem), 1);
    }

    childItem.getParent = () => newWDom;

    return childItem;
  });

  return [remakedChildren, originalChildren];
};

/**
 * When comparing loop-type virtual DOM elements, use the key to determine the comparison
 */
const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) =>
  originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === getKey(item)
  );

/**
 * 변경점의 컴포넌트로 부터 기존트리와 상태를 비교하며 새로 가상돔 트리를 새로 만든다.
 * (오리지널 가상돔으로 부터 유의미한 상태를 유지해야 하는 경우를 판별하여 새로운 트리를 만듬)
 *
 * 1. 동일한 트리의 위치해 있고 오리지널과 컴포넌트의 타입이 같은경우 기존 상태를 계승한다.
 * 2. 동일한 컴포넌트가 아니라고 판단되는 경우에는 기존 상태를 무시하는 새로운 트리를 생성한다.
 * 3. fragment타입의 경우에는 children의 갯수까지 같아야지 같은 타입이라고 판단한다.
 * 4. loop타입의 자식들은 같은 키값을 가졌는지로 동일한지 판단하며 키값이 없을경우 fragment타입처럼 취급한다.
 */
import { WDom, TagFunctionResolver, RenderType } from '@/types';
import { checkCustemComponentFunction } from '@/utils/predicator';
import { getParent, reRender } from '@/utils';
import { recursiveRemoveEvent } from '@/render';
import { cleanNodeChildKey } from '@/utils/universalRef';
import {
  checkEmptyElement,
  checkSameWDomWithOriginal,
  getWDomType,
  checkExisty,
} from '@/utils/predicator';

import { runUnmountQueueFromWDom } from '@/hook/unmount';

export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom?: WDom
) => {
  const type = getWDomType(newWDom);

  if (!type) {
    throw new Error('Unknown type wdom');
  }
  const isSameType = checkSameWDomWithOriginal[type](newWDom, originalWDom);

  const result = remakeNewWDom(newWDom, isSameType, originalWDom);

  if (result?.nodeChildKey) {
    cleanNodeChildKey();
  }

  return result;
};

const remakeNewWDom = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
) => {
  const remakeWDom = generalize(newWDom, isSameType, originalWDom);

  remakeWDom.children = remakeChildrenForDiff(
    remakeWDom,
    isSameType,
    originalWDom
  );

  const needRerender = addReRenderTypeProperty(
    remakeWDom,
    isSameType,
    originalWDom
  );

  remakeWDom.needRerender = needRerender;

  if (needRerender !== 'A' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (
    needRerender &&
    ['D', 'R', 'SR'].includes(needRerender) &&
    originalWDom?.componentKey
  ) {
    runUnmountQueueFromWDom(originalWDom);
    recursiveRemoveEvent(originalWDom);
    remakeWDom.oldChildren = originalWDom.children;
  }

  remakeWDom.oldProps = originalWDom?.props;

  return remakeWDom;
};

const addReRenderTypeProperty = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
): RenderType | undefined => {
  const existOriginalWDom = originalWDom && originalWDom.type;
  const isEmptyElement = checkEmptyElement(newWDom);
  const isRoot = !newWDom.getParent;
  const parentType = !isRoot && getParent(newWDom).type;
  const key = getKey(newWDom);
  const isKeyCheckedWDom = parentType === 'loop' && checkExisty(key);
  const isSameText =
    newWDom.type === 'text' &&
    isSameType &&
    newWDom.text === originalWDom?.text;

  let result: RenderType | undefined;
  if (isEmptyElement) {
    result = 'D';
  } else if (isSameText) {
    result = 'N';
  } else if (!existOriginalWDom) {
    result = 'A';
  } else if (isSameType) {
    result = isKeyCheckedWDom ? 'SU' : 'U';
  } else {
    result = isKeyCheckedWDom ? 'SR' : 'R';
  }

  return result;
};

const generalize = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
): WDom => {
  if (checkCustemComponentFunction(newWDom)) {
    return isSameType && originalWDom
      ? reRender(originalWDom, newWDom)
      : newWDom.resolve();
  }

  return newWDom;
};

const remakeChildrenForDiff = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
) =>
  isSameType && originalWDom
    ? remakeChildrenForUpdate(newWDom, originalWDom)
    : remakeChildrenForAdd(newWDom);

const remakeChildrenForAdd = (newWDom: WDom) =>
  (newWDom.children || []).map((item: WDom) => {
    const childItem = makeNewWDomTree(item);

    childItem.getParent = () => newWDom;

    return childItem;
  });

const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) => {
  if (
    newWDom.type === 'loop' &&
    checkExisty(getKey((newWDom.children || [])[0]))
  ) {
    return remakeChildrenForLoopUpdate(newWDom, originalWDom);
  }

  return (newWDom.children || []).map((item: WDom, index: number) => {
    const childItem = makeNewWDomTree(
      item,
      (originalWDom.children || [])[index]
    );

    childItem.getParent = () => newWDom;

    return childItem;
  });
};

const remakeChildrenForLoopUpdate = (newWDom: WDom, originalWDom: WDom) => {
  const { remakedChildren, unUsedChildren } = diffLoopChildren(
    newWDom,
    originalWDom
  );

  unUsedChildren.map(unusedItem => {
    const el = unusedItem.el;

    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  return remakedChildren;
};

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

  return {
    remakedChildren,
    unUsedChildren: originalChildren,
  };
};

const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) => {
  const key = getKey(item);

  return originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === key
  );
};

const getKey = (target: WDom) =>
  target?.componentProps?.key ?? target?.props?.key;

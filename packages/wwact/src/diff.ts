/**
 * 변경점의 컴포넌트로 부터 기존트리와 상태를 비교하며 새로 가상돔 트리를 새로 만든다.
 * (오리지널 가상돔으로 부터 유의미한 상태를 유지해야 하는 경우를 판별하여 새로운 트리를 만듬)
 *
 * 1. 동일한 트리의 위치해 있고 오리지널과 컴포넌트의 타입이 같은경우 기존 상태를 계승한다.
 * 2. 동일한 컴포넌트가 아니라고 판단되는 경우에는 기존 상태를 무시하는 새로운 트리를 생성한다.
 * 3. fragment타입의 경우에는 children의 갯수까지 같아야지 같은 타입이라고 판단한다.
 * 4. loop타입의 자식들은 같은 키값을 가졌는지로 동일한지 판단하며 키값이 없을경우 fragment타입처럼 취급한다.
 */

import { WDom, TagFunctionResolver } from '@/types';
import { checkCustemComponentFunction } from '@/helper/predicator';
import { getParent, reRender } from '@/helper';
import {
  checkEmptyElement,
  checkSameWDomWithOriginal,
  getWDomType,
  isExisty,
} from '@/helper/predicator';

import { runUnmountQueueFromWDom } from '@/hook/unmount';

type DiffPrimaryParam = {
  originalWDom?: WDom;
  newWDom: WDom | TagFunctionResolver;
  isSameType: boolean;
};

type DiffSecondeParam = {
  originalWDom?: WDom;
  newWDom: WDom;
  isSameType: boolean;
};

export default function makeNewWDomTree({
  originalWDom,
  newWDom,
}: {
  originalWDom?: WDom;
  newWDom: WDom | TagFunctionResolver;
}) {
  const type = getWDomType(newWDom);

  if (!type) {
    throw new Error('Unknown type wdom');
  }
  const isSameType = checkSameWDomWithOriginal[type]({ originalWDom, newWDom });

  return remakeNewWDom({ originalWDom, newWDom, isSameType });
}

function remakeNewWDom({
  newWDom,
  originalWDom,
  isSameType,
}: DiffPrimaryParam) {
  const remakeWDom = generalize({ newWDom, originalWDom, isSameType });

  remakeWDom.children = remakeChildrenForDiff({
    isSameType,
    newWDom: remakeWDom,
    originalWDom,
  });

  const needRerender = addReRenderTypeProperty({
    originalWDom,
    newWDom: remakeWDom,
    isSameType,
  });

  remakeWDom.needRerender = needRerender;

  if (needRerender !== 'ADD' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (
    ['DELETE', 'REPLACE'].includes(needRerender) &&
    originalWDom &&
    originalWDom.componentKey
  ) {
    runUnmountQueueFromWDom(originalWDom);
  }

  remakeWDom.oldProps = originalWDom?.props;

  return remakeWDom;
}

function addReRenderTypeProperty({
  originalWDom,
  newWDom,
  isSameType,
}: DiffSecondeParam) {
  const existOriginalWDom = originalWDom && originalWDom.type;
  const isEmptyElement = checkEmptyElement(newWDom);
  const isRoot = !newWDom.getParent;
  const parentType = !isRoot && getParent(newWDom).type;
  const key = getKey(newWDom);
  const isKeyCheckedWDom = parentType === 'loop' && isExisty(key);
  const isSameText =
    newWDom.type === 'text' &&
    isSameType &&
    newWDom.text === originalWDom?.text;

  if (isEmptyElement) {
    return 'DELETE';
  } else if (isSameText) {
    return 'NONE';
  } else if (!existOriginalWDom) {
    return 'ADD';
  } else if (isSameType) {
    return isKeyCheckedWDom ? 'SORTED-UPDATE' : 'UPDATE';
  }

  return isKeyCheckedWDom ? 'SORTED-REPLACE' : 'REPLACE';
}

function generalize({
  newWDom,
  originalWDom,
  isSameType,
}: DiffPrimaryParam): WDom {
  if (checkCustemComponentFunction(newWDom)) {
    return isSameType && originalWDom
      ? reRender(originalWDom, newWDom)
      : newWDom.resolve();
  }

  return newWDom;
}

function remakeChildrenForDiff({
  isSameType,
  newWDom,
  originalWDom,
}: DiffSecondeParam) {
  if (isSameType && originalWDom) {
    return remakeChildrenForUpdate(newWDom, originalWDom);
  }

  return remakeChildrenForAdd(newWDom);
}

function remakeChildrenForAdd(newWDom: WDom) {
  return (newWDom.children || []).map((item: WDom) => {
    const childItem = makeNewWDomTree({ newWDom: item });
    childItem.getParent = () => newWDom;

    return childItem;
  });
}

function remakeChildrenForUpdate(newWDom: WDom, originalWDom: WDom) {
  if (
    newWDom.type === 'loop' &&
    isExisty(getKey((newWDom.children || [])[0]))
  ) {
    return remakeChildrenForLoopUpdate(newWDom, originalWDom);
  }

  return (newWDom.children || []).map((item: WDom, index: number) => {
    const childItem = makeNewWDomTree({
      newWDom: item,
      originalWDom: (originalWDom.children || [])[index],
    });

    childItem.getParent = () => newWDom;

    return childItem;
  });
}

function remakeChildrenForLoopUpdate(newWDom: WDom, originalWDom: WDom) {
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
}

function diffLoopChildren(newWDom: WDom, originalWDom: WDom) {
  const newChildren = [...(newWDom.children || [])];
  const originalChildren = [...(originalWDom.children || [])];

  const remakedChildren = newChildren.map(item => {
    const originalItem = findSameKeyOriginalItem(item, originalChildren);
    const childItem = makeNewWDomTree({
      newWDom: item,
      originalWDom: originalItem,
    });

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
}

function findSameKeyOriginalItem(item: WDom, originalChildren: WDom[]) {
  const key = getKey(item);

  return originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === key
  );
}

function getKey(target: WDom) {
  return target?.componentProps?.key ?? target?.props?.key;
}

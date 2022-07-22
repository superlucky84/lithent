/**
 * 변경점의 컴포넌트로 부터 기존트리와 상태를 비교하며 새로 가상돔 트리를 새로 만든다.
 * (오리지널 가상돔으로 부터 유의미한 상태를 유지해야 하는 경우를 판별하여 새로운 트리를 만듬)
 *
 * 1. 동일한 트리의 위치해 있고 오리지널과 컴포넌트의 타입이 같은경우 기존 상태를 계승한다.
 * 2. 동일한 컴포넌트가 아니라고 판단되는 경우에는 기존 상태를 무시하는 새로운 트리를 생성한다.
 * 3. fragment타입의 경우에는 children의 갯수까지 같아야지 같은 타입이라고 판단한다.
 * 4. loop타입의 자식들은 같은 키값을 가졌는지로 동일한지 판단하며 키값이 없을경우 fragment타입처럼 취급한다.
 */

import { componentRef } from '@/helper/universalRef';
import {
  checkEmptyElement,
  checkSameVdomWithOriginal,
  getVdomType,
  isExisty,
} from '@/helper/predicator';

import { runUnmountQueueFromVdom } from '@/hook/unmount';

export default function makeNewVdomTree({ originalVdom, newVdom }) {
  const type = getVdomType(newVdom);

  if (!type) {
    throw new Error('Unknown type vdom');
  }

  const isSameType = checkSameVdomWithOriginal[type]({ originalVdom, newVdom });

  return remakeNewVdom({ originalVdom, newVdom, isSameType });
}

function remakeNewVdom({ newVdom, originalVdom, isSameType }) {
  const remakeVdom = generalize({ newVdom, originalVdom, isSameType });

  if (remakeVdom.children) {
    remakeVdom.children = remakeChildrenForDiff({
      isSameType,
      newVdom: remakeVdom,
      originalVdom,
    });
  }

  const needRerender = addReRenderTypeProperty({
    originalVdom,
    newVdom: remakeVdom,
    isSameType,
  });

  remakeVdom.needRerender = needRerender;

  if (needRerender !== 'ADD') {
    remakeVdom.el = originalVdom.el;
  }

  if (['DELETE', 'REPLACE'].includes(needRerender)) {
    runUnmountQueueFromVdom(originalVdom);

    delete componentRef[originalVdom.stateKey];
  }

  remakeVdom.oldProps = originalVdom?.props;

  return remakeVdom;
}

function addReRenderTypeProperty({ originalVdom, newVdom, isSameType }) {
  const existOriginalVdom = originalVdom && originalVdom.type;
  const isEmptyElement = checkEmptyElement(newVdom);
  const isRoot = !newVdom.getParent;
  const parentType = !isRoot && newVdom.getParent().type;
  const key = getKey(newVdom);
  const isKeyCheckedVdom = parentType === 'loop' && isExisty(key);
  const isSameText =
    newVdom.type === 'text' && isSameType && newVdom.text === originalVdom.text;

  if (isEmptyElement) {
    return 'DELETE';
  } else if (isSameText) {
    return 'NONE';
  } else if (!existOriginalVdom) {
    return 'ADD';
  } else if (isSameType) {
    return isKeyCheckedVdom ? 'SORTED-UPDATE' : 'UPDATE';
  }

  return isKeyCheckedVdom ? 'SORTED-REPLACE' : 'REPLACE';
}

function generalize({ newVdom, originalVdom, isSameType }) {
  if (typeof newVdom === 'function') {
    return isSameType ? originalVdom.reRender() : newVdom();
  }

  return newVdom;
}

function remakeChildrenForDiff({ isSameType, newVdom, originalVdom }) {
  if (isSameType) {
    return remakeChildrenForUpdate(newVdom, originalVdom);
  }

  return remakeChildrenForAdd(newVdom);
}

function remakeChildrenForAdd(newVdom) {
  return newVdom.children.map(item => {
    const childItem = makeNewVdomTree({ newVdom: item });
    childItem.getParent = () => newVdom;

    return childItem;
  });
}

function remakeChildrenForUpdate(newVdom, originalVdom) {
  if (newVdom.type === 'loop' && isExisty(getKey(newVdom.children[0]))) {
    return remakeChildrenForLoopUpdate(newVdom, originalVdom);
  }

  return newVdom.children.map((item, index) => {
    const childItem = makeNewVdomTree({
      newVdom: item,
      originalVdom: originalVdom.children[index],
    });

    childItem.getParent = () => newVdom;

    return childItem;
  });
}

function remakeChildrenForLoopUpdate(newVdom, originalVdom) {
  const { remakedChildren, unUsedChildren } = diffLoopChildren(
    newVdom,
    originalVdom
  );

  unUsedChildren.map(unusedItem => {
    const el = unusedItem.el;

    if (el) {
      const parent = el.parentNode;
      parent.removeChild(el);
    }
  });

  return remakedChildren;
}

function diffLoopChildren(newVdom, originalVdom) {
  const newChildren = [...newVdom.children];
  const originalChildren = [...originalVdom.children];

  const remakedChildren = newChildren.map(item => {
    const originalItem = findSameKeyOriginalItem(item, originalChildren);
    const childItem = makeNewVdomTree({
      newVdom: item,
      originalVdom: originalItem,
    });

    originalChildren.splice(originalChildren.indexOf(originalItem), 1);

    childItem.getParent = () => newVdom;

    return childItem;
  });

  return {
    remakedChildren,
    unUsedChildren: originalChildren,
  };
}

function findSameKeyOriginalItem(item, originalChildren) {
  const key = getKey(item);

  return originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === key
  );
}

function getKey(target) {
  return target?.componentProps?.key ?? target?.props?.key;
}
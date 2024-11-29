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

import { runUnmountQueueFromWDom } from '@/hook/unmount';
import { assign, keys, entries } from '@/utils';

/**
 * 원본 가상돔과 리랜더링을 위한 새로운 가상돔 diff 처리의 시작점
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
 * 가상돔 비교후 새로운 가상돔 생성
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
 * 새로운 가상돔이 원본 가상돔으로부터 물려받아야 하거나 청산할 것을 처리
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
 * 새로운 가상돔이 실제돔으로 반영하기 위한 상태 정보 표기
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
  const isKeyCheckedWDom = origParentType === 'loop' && checkExisty(key);
  const isSameText =
    newWDom.type === 'text' &&
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
    newWDom.type === 'loop' &&
    result === 'U' &&
    originalWDom &&
    chkDiffLoopOrder(newWDom, originalWDom)
  ) {
    result = 'CNSU';
  }

  return result;
};

/**
 * 재정렬하며 업데이트 해야 하는 타입일때 실제로 역순 위치 교환이 필요한지 체크
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
 * 가상돔 속성 업데이트 처리
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
 * 가상돔이 새로운 종류로 완전 교체되지 않고 단순 업데이트 될때 처리 시작
 * (새로운 상태가 반영되도록 props나 children 상태 반영)
 * (새로운 상태를 반영하면서도 props 나 children의 실제 참조가 변경되지 않도록 처리)
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
 * 비교가 끝난 가상돔을 새로운 가상돔으로 교체하거나, 그냥 업데이트 시켜줌
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
 * 새로운 가상돔 생을을 위한 재귀 처리
 */
const remakeChildrenForAdd = (newWDom: WDom) =>
  (newWDom.children || []).map((item: WDom) =>
    assign(makeNewWDomTree(item), { getParent: () => newWDom })
  );

/**
 * 추가가 아닌 업데이트트 위한 재귀처리
 */
const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) =>
  newWDom.type === 'loop' && checkExisty(getKey((newWDom.children || [])[0]))
    ? remakeChildrenForLoopUpdate(newWDom, originalWDom)
    : (newWDom.children || []).map((item: WDom, index: number) =>
        assign(makeNewWDomTree(item, (originalWDom.children || [])[index]), {
          getParent: () => newWDom,
        })
      );

/**
 * 반복문 타입의 가상돔 처리
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
 * 반복문 타입의 가상돔의 재귀처리
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
 * 반복문 타입의 가상돔의 비교처리를 할때 키를 참고하여 비교판단
 */
const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) =>
  originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === getKey(item)
  );

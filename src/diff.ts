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

export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom?: WDom
) =>
  remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );

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

const inheritPropForRender = (
  remakeWDom: WDom,
  originalWDom?: WDom,
  needRerender?: RenderType
) => {
  if (needRerender !== 'A' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (needRerender && ['D', 'R', 'SR'].includes(needRerender)) {
    if (originalWDom?.compKey) {
      runUnmountQueueFromWDom(originalWDom);
      recursiveRemoveEvent(originalWDom);
    }
    remakeWDom.oldChildren = originalWDom?.children;
  }

  remakeWDom.oldProps = originalWDom?.props;
};

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

const remakeChildrenForDiff = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
) =>
  isSameType && originalWDom
    ? remakeChildrenForUpdate(newWDom, originalWDom)
    : remakeChildrenForAdd(newWDom);

const remakeChildrenForAdd = (newWDom: WDom) =>
  (newWDom.children || []).map((item: WDom) =>
    assign(makeNewWDomTree(item), { getParent: () => newWDom })
  );

const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) =>
  newWDom.type === 'loop' && checkExisty(getKey((newWDom.children || [])[0]))
    ? remakeChildrenForLoopUpdate(newWDom, originalWDom)
    : (newWDom.children || []).map((item: WDom, index: number) =>
        assign(makeNewWDomTree(item, (originalWDom.children || [])[index]), {
          getParent: () => newWDom,
        })
      );

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

const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) =>
  originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === getKey(item)
  );

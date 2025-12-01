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
  const needRerender = addReRenderTypeProperty(
    remakeWDom,
    isSameType,
    originalWDom
  );
  const isNoting = needRerender === 'N';

  if (!isNoting) {
    remakeWDom.children = remakeChildrenForDiff(
      remakeWDom,
      isSameType,
      originalWDom
    );
  }

  // NOTE: short-key metadata (nr = needRerender) keeps bundle size down
  remakeWDom.nr = needRerender;
  inheritPropForRender(remakeWDom, originalWDom, needRerender);

  if (!isNoting && originalWDom) {
    originalWDom.il = true;
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

  if (needRerender === 'D' || needRerender === 'R' || needRerender === 'S') {
    if (originalWDom) {
      runUnmountQueueFromWDom(originalWDom);
      recursiveRemoveEvent(originalWDom);
    }
    remakeWDom.oc = originalWDom && originalWDom.children;
  }

  remakeWDom.op = originalWDom && originalWDom.props;
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
  if (checkEmptyElement(newWDom)) return 'D';

  const isSameText =
    newWDom.type === 't' &&
    isSameType &&
    newWDom.text === (originalWDom && originalWDom.text);
  if (isSameText || newWDom === originalWDom) return 'N';

  const existOriginalWDom = originalWDom && originalWDom.type;
  if (!existOriginalWDom) return 'A';

  const key = getKey(newWDom);
  const parent = getParent(originalWDom);
  const isKeyChecked =
    !newWDom.isRoot && parent && parent.type === 'l' && checkExisty(key);

  let result: RenderType = isSameType
    ? isKeyChecked
      ? 'T'
      : 'U'
    : isKeyChecked
      ? 'S'
      : 'R';

  if (newWDom.type === 'l' && originalWDom) {
    if (result === 'U') {
      result = 'L';
    } else if (
      isKeyChecked &&
      result === 'T' &&
      chkDiffLoopOrder(newWDom, originalWDom)
    ) {
      result = 'L';
    }
  }

  return result;
};

/**
 * Check if a reverse order swap is needed when updating keyed loop-type elements.
 */
const chkDiffLoopOrder = (newWDom: WDom, originalWDom: WDom) => {
  const origChildren = [...((originalWDom && originalWDom.children) || [])];
  const newChildren = [...((newWDom && newWDom.children) || [])].filter(item =>
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
const syncResolverProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    keys(props).forEach(key => delete props[key]);
    entries(infoProps || {}).forEach(([key, value]) => (props[key] = value));
  }
};

const syncResolverChildren = (children: WDom[], infoChidren: WDom[]) => {
  if (children) {
    children.splice(0, children.length);

    if (infoChidren) {
      infoChidren.forEach(childrenItem => children.push(childrenItem));
    }
  }
};

/**
 * Keep the existing component node while injecting the props/children from the freshly computed TagFunctionResolver.
 * originalWDom is the fully evaluated node from the previous render, whereas infoVdom is the intermediate resolver,
 * so updating compProps/compChild in place lets reRender() evaluate with the latest slots and props.
 * It is crucial that props and children references remain stable as nodes update—many ancestors/closures share these arrays,
 * so mutate the existing arrays instead of replacing their references.
 */
const runUpdate = (vDom: WDom, infoVdom: TagFunctionResolver) => {
  const { compProps: props, compChild: children } = vDom;
  const { props: infoProps, children: infoChidren } = infoVdom;

  if (props) {
    syncResolverProps(props, infoProps);
  }

  /**
   * In runUpdate, the original DOM (vDom) is already fully evaluated and completed, whereas infoVdom represents an intermediate state. Therefore, vdom.compChild and infoVdom.children are indeed the correct counterparts to compare.

   * Keep shared child array references intact (<= same slot array instance)
   * When the reference changes, sync the stored compChild contents so reRender sees fresh nodes
   * Only update children if they're different references
   * If it's the same Fragment reference, the diff process will handle updating its children
   */
  if (children && infoChidren && children !== infoChidren) {
    syncResolverChildren(children, infoChidren);
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
  return checkCustemComponentFunction(newWDom)
    ? isSameType && originalWDom
      ? runUpdate(originalWDom, newWDom)
      : newWDom.resolve()
    : newWDom;
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
  const origCh = [...(originalWDom.children || [])];
  const remaked = (newWDom.children || []).map(item => {
    const orig = findSameKeyOriginalItem(item, origCh);
    const child = makeNewWDomTree(item, orig);

    if (orig) origCh.splice(origCh.indexOf(orig), 1);
    child.getParent = () => newWDom;

    return child;
  });

  return [remaked, origCh];
};

/**
 * When comparing loop-type virtual DOM elements, use the key to determine the comparison
 */
const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) =>
  originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === getKey(item)
  );

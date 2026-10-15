import { WDom, TagFunctionResolver, RenderType, Props } from '@/types';
import { checkCustemComponentFunction, getKey } from '@/utils/predicator';
import { getParent, makeParentGetter } from '@/utils';
import { typeDeleteUnused } from '@/render';
import { cloneWDom, copyResolver } from '@/wDom';
import {
  checkEmptyElement,
  checkSameWDomWithOriginal,
  getWDomType,
  checkExistyKey,
  checkExisty,
  checkKeyedChildren,
} from '@/utils/predicator';

import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';
import { keys, isEnumerableProp } from '@/utils';

/**
 * The starting point of the diffing process between the original virtual DOM and the new virtual DOM for re-rendering.
 */
export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom?: WDom
) => {
  // Already drawn or taken by a diff (u) or retired (il): the node belongs
  // to another place, so this place draws a copy. So does a component drawn
  // without a diff (compKey: a hoisted <Comp />), which is then compared as
  // a component. The same node in the same place is still left alone as
  // unchanged.
  const node = newWDom as WDom;
  if (newWDom !== originalWDom && (node.u || node.il || node.compKey)) {
    newWDom = cloneWDom(node);
  }

  return remakeNewWDom(
    newWDom,
    !!originalWDom &&
      checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );
};

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
  remakeWDom.u = true;
  inheritPropForRender(remakeWDom, originalWDom, needRerender);

  // The retired node keeps its children: it may be a hoisted constant the
  // caller draws again later, which is then copied from them.
  if (!isNoting && originalWDom) {
    originalWDom.il = true;
  }
  if (originalWDom?.tag === 'portal') {
    remakeWDom.tag = 'portal';
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

  const parent = getParent(originalWDom);
  const isKeyChecked =
    !newWDom.isRoot && parent && parent.type === 'l' && checkExistyKey(newWDom);

  return isSameType ? (isKeyChecked ? 'T' : 'U') : isKeyChecked ? 'S' : 'R';
};

/**
 * Handling virtual DOM attribute updates.
 */
const syncResolverProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    // Only the keys that are gone: deleting and re-adding every key on every
    // render changes the object's shape each time.
    infoProps = infoProps || {};
    keys(props).forEach(
      key => isEnumerableProp(infoProps, key) || delete props[key]
    );
    keys(infoProps).forEach(key => (props[key] = infoProps[key]));
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
      : // Resolved before (children a component draws again somewhere else):
        // the first instance owns its props, which are also its key, so the
        // new instance is made from a copy.
        (newWDom.rd
          ? copyResolver(newWDom)
          : ((newWDom.rd = true), newWDom)
        ).resolve()
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
const remakeChildrenForAdd = (newWDom: WDom) => {
  const getParent = makeParentGetter(newWDom);

  return (newWDom.children || []).map((item: WDom) => {
    const child = makeNewWDomTree(item);
    child.getParent = getParent;
    return child;
  });
};

/**
 * Recursive handling for updates, not additions.
 * Uses key-based diffing for loops, index-based for others
 */
const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) => {
  if (newWDom.type === 'l' && checkKeyedChildren(newWDom)) {
    return remakeChildrenForLoopUpdate(newWDom, originalWDom);
  }

  const origChildren = originalWDom.children || [];
  const getParent = makeParentGetter(newWDom);

  return (newWDom.children || []).map((item: WDom, index: number) => {
    const child = makeNewWDomTree(item, origChildren[index]);
    child.getParent = getParent;
    return child;
  });
};

/**
 * Handling virtual DOM of loop-type elements.
 */
const remakeChildrenForLoopUpdate = (newWDom: WDom, originalWDom: WDom) => {
  const [remakedChildren, unUsedChildren] = diffLoopChildren(
    newWDom,
    originalWDom
  );

  typeDeleteUnused(unUsedChildren, originalWDom);

  return remakedChildren;
};

/**
 * Recursive handling of loop-type virtual DOM elements.
 * Matches children against the originals by key via a Map in O(n) and
 * records each match's original index (oi) for the render phase to
 * minimize moves via LIS.
 */
const diffLoopChildren = (newWDom: WDom, originalWDom: WDom) => {
  const origChildren = originalWDom.children || [];
  const keyMap = new Map<unknown, number>();
  origChildren.forEach((item, index) => {
    const key = getKey(item);
    if (checkExisty(key) && !keyMap.has(key)) {
      keyMap.set(key, index);
    }
  });

  const used: boolean[] = [];
  const getParent = makeParentGetter(newWDom);
  const remaked = (newWDom.children || []).map((item, index) => {
    const key = getKey(item);
    // Unkeyed items among keyed ones (a hidden row's null, a nested array)
    // pair with the unkeyed original at the same index, as in React.
    const origIndex = checkExisty(key)
      ? keyMap.get(key)
      : index < origChildren.length && !checkExistyKey(origChildren[index])
        ? index
        : undefined;
    const matched = origIndex !== undefined;

    if (matched) {
      keyMap.delete(key);
      used[origIndex] = true;
    }

    const child = makeNewWDomTree(
      item,
      matched ? origChildren[origIndex] : undefined
    );
    if (matched) {
      child.oi = origIndex;
    }
    child.getParent = getParent;

    return child;
  });

  // Originals left unmatched, including ones whose key was already taken
  // (no key, or a duplicate) and so never made it into keyMap.
  return [remaked, origChildren.filter((_item, index) => !used[index])];
};

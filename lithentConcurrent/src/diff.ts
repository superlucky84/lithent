import { WDom, TagFunctionResolver, RenderType, Props } from '@/types';
import { checkCustemComponentFunction, getKey } from '@/utils/predicator';
import { getParent } from '@/utils';
import { typeDeleteUnused, recursiveRemoveEvent } from '@/render';
import {
  checkEmptyElement,
  checkSameWDomWithOriginal,
  getWDomType,
  checkExistyKey,
} from '@/utils/predicator';

import { runUnmountQueueFromWDom } from '@/hook/internal/unmount';
import { keys, entries } from '@/utils';

/**
 * Side effects the diff pass would have performed inline, recorded to run at
 * commit instead (D4). Plain thunks in COLLECTION ORDER — see `commitEffects`.
 */
export type Effects = (() => void)[];

/**
 * The starting point of the diffing process between the original virtual DOM and the new virtual DOM for re-rendering.
 *
 * `effects` collects what the pass would otherwise do immediately. Passing it
 * as an argument rather than holding it in a module-level variable matters:
 * a render can start while another is in progress (a `renew()` raised from an
 * updater), and a shared collector would splice the two together.
 */
export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom: WDom | undefined,
  effects: Effects
) =>
  remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    effects,
    originalWDom
  );

/**
 * Runs the recorded effects, in collection order.
 *
 * Collection order is the base core's own execution order, so replaying it
 * makes the two cores equivalent by construction — no case analysis needed
 * about which reorderings happen to be safe. Order does matter: reversing the
 * list fails the equivalence suite.
 *
 * The design sketched a grouped order instead (unmount → detach → delete →
 * update → splice → retire). That was checked and it also passes, because the
 * two effects a wider walk could double-run are idempotent: `runUnmountEffects`
 * empties `umts` after running it, and `removeEventListener` on an already
 * detached handler does nothing. So grouping is not wrong — it is merely a
 * claim that has to be re-argued every time an effect is added, and this order
 * is one that never has to be. See DC-14.
 */
export const commitEffects = (effects: Effects) => {
  effects.forEach(effect => effect());
};

/**
 * Create a new virtual DOM after comparing with the previous virtual DOM
 */
const remakeNewWDom = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  effects: Effects,
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
      effects,
      originalWDom
    );
  }

  // NOTE: short-key metadata (nr = needRerender) keeps bundle size down
  remakeWDom.nr = needRerender;
  inheritPropForRender(remakeWDom, originalWDom, effects, needRerender);

  if (!isNoting && originalWDom) {
    // Deferring this is what makes the WIP tree abandonable: the original keeps
    // its children until the commit lands, so the pass can be thrown away and
    // the previous tree still rendered.
    effects.push(() => {
      originalWDom.il = true;
      delete originalWDom.children;
    });
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
  originalWDom: WDom | undefined,
  effects: Effects,
  needRerender?: RenderType
) => {
  if (needRerender !== 'A' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (needRerender === 'D' || needRerender === 'R' || needRerender === 'S') {
    if (originalWDom) {
      effects.push(() => {
        runUnmountQueueFromWDom(originalWDom);
        recursiveRemoveEvent(originalWDom);
      });
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
  effects: Effects,
  originalWDom?: WDom
) =>
  isSameType && originalWDom
    ? remakeChildrenForUpdate(newWDom, originalWDom, effects)
    : remakeChildrenForAdd(newWDom, effects);

/**
 * Recursive handling for the creation of a new virtual DOM.
 */
const remakeChildrenForAdd = (newWDom: WDom, effects: Effects) => {
  const getParent = () => newWDom;

  return (newWDom.children || []).map((item: WDom) => {
    const child = makeNewWDomTree(item, undefined, effects);
    child.getParent = getParent;
    return child;
  });
};

/**
 * Recursive handling for updates, not additions.
 * Uses key-based diffing for loops, index-based for others
 */
const remakeChildrenForUpdate = (
  newWDom: WDom,
  originalWDom: WDom,
  effects: Effects
) => {
  if (newWDom.type === 'l' && checkExistyKey((newWDom.children || [])[0])) {
    return remakeChildrenForLoopUpdate(newWDom, originalWDom, effects);
  }

  const origChildren = originalWDom.children || [];
  const getParent = () => newWDom;

  return (newWDom.children || []).map((item: WDom, index: number) => {
    const child = makeNewWDomTree(item, origChildren[index], effects);
    child.getParent = getParent;
    return child;
  });
};

/**
 * Handling virtual DOM of loop-type elements.
 */
const remakeChildrenForLoopUpdate = (
  newWDom: WDom,
  originalWDom: WDom,
  effects: Effects
) => {
  const [remakedChildren, unUsedChildren] = diffLoopChildren(
    newWDom,
    originalWDom,
    effects
  );

  effects.push(() => typeDeleteUnused(unUsedChildren));

  return remakedChildren;
};

/**
 * Recursive handling of loop-type virtual DOM elements.
 * Matches children against the originals by key via a Map in O(n) and
 * records each match's original index (oi) for the render phase to
 * minimize moves via LIS.
 */
const diffLoopChildren = (
  newWDom: WDom,
  originalWDom: WDom,
  effects: Effects
) => {
  const origChildren = originalWDom.children || [];
  const keyMap = new Map<unknown, number>();
  origChildren.forEach((item, index) => {
    const key = getKey(item);
    if (!keyMap.has(key)) {
      keyMap.set(key, index);
    }
  });

  const getParent = () => newWDom;
  const remaked = (newWDom.children || []).map(item => {
    const key = getKey(item);
    const origIndex = keyMap.get(key);
    const matched = origIndex !== undefined;

    if (matched) {
      keyMap.delete(key);
    }

    const child = makeNewWDomTree(
      item,
      matched ? origChildren[origIndex] : undefined,
      effects
    );
    if (matched) {
      child.oi = origIndex;
    }
    child.getParent = getParent;

    return child;
  });

  return [remaked, [...keyMap.values()].map(index => origChildren[index])];
};

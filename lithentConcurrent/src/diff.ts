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
) => startWork(newWDom, originalWDom, effects).advance() as WDom;

/**
 * A build that can be walked a slice at a time.
 *
 * `advance` returns the finished tree, or `null` when it stopped early because
 * `shouldPause` asked it to. Calling it again picks up from the same node — the
 * stack IS the resume point, so nothing has to be recomputed and no work is
 * repeated.
 *
 * The pause check sits between units, which after `planChildren` means BETWEEN
 * SIBLINGS as well as between depth levels. Phase 7 measured why that matters:
 * a 400-deep tree costs 0.2ms while 10,000 siblings cost 18~60ms, so a loop
 * that could only stop at component or depth boundaries would leave every
 * expensive case unbroken.
 */
export type Work = { advance: (shouldPause?: () => boolean) => WDom | null };

export const startWork = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom: WDom | undefined,
  effects: Effects
): Work => {
  const stack: Frame[] = [beginWork(newWDom, originalWDom)];

  return {
    advance: shouldPause => {
      for (;;) {
        const frame = stack[stack.length - 1];

        if (frame.cursor < frame.children.length) {
          stack.push(
            beginWork(
              frame.children[frame.cursor],
              frame.originals[frame.cursor],
              frame
            )
          );
        } else {
          completeWork(frame, effects);
          stack.pop();

          if (!stack.length) {
            return frame.wip;
          }

          attachToParent(frame);
        }

        if (shouldPause && shouldPause()) {
          return null;
        }
      }
    },
  };
};

/** Whether a node lines up with its counterpart from the previous tree. */
const sameTypeAs = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom: WDom | undefined
) => checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom);

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
 * One node's worth of in-progress work.
 *
 * The recursion this replaces held the same state on the JS call stack, where
 * it died the moment the function returned. Holding it in an explicit stack is
 * what makes a build pausable: `cursor` is the resume point, and the stack
 * itself is the traversal.
 *
 * D7 sketched `child`/`sibling`/`return`/`ci` pointers on the node instead.
 * That is not available here — `WDom` lives in the frozen base core (P1) and
 * has no index signature, so the fork cannot widen it. An explicit stack turns
 * out to be the better trade anyway: it is O(depth) rather than O(nodes), it
 * leaves the node shape untouched (so every `WDom` consumer outside the core is
 * unaffected, C3), and `getParent` keeps working without the D10 shim. See DC-19.
 */
type Frame = {
  /** The node being built — already generalized (the component has rendered). */
  wip: WDom;
  needRerender?: RenderType;
  isSameType: boolean;
  originalWDom?: WDom;
  /** New children still to walk, and the originals they pair with. */
  children: WDom[];
  originals: (WDom | undefined)[];
  /** Matched keyed position, per child. `undefined` where there is no match. */
  matchedIndexes: (number | undefined)[];
  /** Keyed leftovers, deleted at commit. `null` when this is not a keyed loop. */
  unused: WDom[] | null;
  /** Finished children, filled in as each child completes. */
  built: WDom[];
  /** How many children are done — the resume point (D7's `ci`). */
  cursor: number;
  /** Shared by every child of this node. Absent on leaves — nothing asks. */
  getParent?: () => WDom;
  parent?: Frame;
};

/**
 * The pre-children half of the old `remakeNewWDom`: render the component,
 * decide the render type, and work out which new child pairs with which
 * original. Pairing happens HERE, once, so the keyed Map is built once per node
 * exactly as before — and so a pause between children cannot re-run it.
 */
const beginWork = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom: WDom | undefined,
  parent?: Frame
): Frame => {
  const isSameType = sameTypeAs(newWDom, originalWDom);
  const wip = generalize(newWDom, isSameType, originalWDom);
  const needRerender = addReRenderTypeProperty(wip, isSameType, originalWDom);

  const frame: Frame = {
    wip,
    needRerender,
    isSameType,
    originalWDom,
    children: NO_CHILDREN,
    originals: NO_CHILDREN,
    matchedIndexes: NO_CHILDREN,
    unused: null,
    built: NO_CHILDREN,
    cursor: 0,
    getParent: undefined,
    parent,
  };

  if (needRerender !== 'N') {
    planChildren(frame);
  }

  return frame;
};

/**
 * Shared stand-in for "this node has no children".
 *
 * Most nodes in a real tree are leaves — every text node is one — and the walk
 * allocates a frame for each. Handing them all the same frozen empty array
 * instead of four fresh ones is what keeps the explicit stack from costing more
 * than the recursion it replaced, where a leaf allocated nothing at all.
 */
const NO_CHILDREN: never[] = [];

/**
 * The post-children half. Effects are pushed only from here, which is what
 * keeps the collection order identical to the recursion's: a node's own effects
 * land after every effect its subtree produced (DC-14).
 */
const completeWork = (frame: Frame, effects: Effects) => {
  const { wip, originalWDom, needRerender } = frame;
  const isNoting = needRerender === 'N';

  if (!isNoting) {
    if (frame.unused) {
      const unused = frame.unused;
      effects.push(() => typeDeleteUnused(unused));
    }
    wip.children = frame.built;
  }

  wip.nr = needRerender;
  inheritPropForRender(wip, originalWDom, effects, needRerender);

  if (!isNoting && originalWDom) {
    // Deferring this is what makes the WIP tree abandonable: the original keeps
    // its children until the commit lands, so the pass can be thrown away and
    // the previous tree still rendered.
    effects.push(() => {
      originalWDom.il = true;
      delete originalWDom.children;
    });
  }

  if (originalWDom && originalWDom.tag === 'portal') {
    wip.tag = 'portal';
  }
};

/** Hands a finished child to its parent and advances the parent's cursor. */
const attachToParent = (frame: Frame) => {
  const parent = frame.parent as Frame;
  const slot = parent.cursor;
  const matched = parent.matchedIndexes[slot];

  if (matched !== undefined) {
    frame.wip.oi = matched;
  }

  frame.wip.getParent = parent.getParent as () => WDom;
  parent.built[slot] = frame.wip;
  parent.cursor = slot + 1;
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
 * Works out, for one node, which new child pairs with which original — and for
 * a keyed loop, which originals nothing claimed.
 *
 * This is the diff algorithm carried over unchanged (8-5): first-occurrence key
 * Map in O(n), `oi` recorded for the render phase's LIS, index pairing
 * otherwise. What moved is only WHEN it runs: the recursion decided pairing and
 * descended in the same pass, whereas this decides for all children at once and
 * lets the work loop descend. Deciding up front is what makes a pause between
 * two children safe — there is no half-consumed key Map to resume into.
 */
const planChildren = (frame: Frame) => {
  const { wip, isSameType, originalWDom } = frame;
  const children = wip.children;

  if (!children || !children.length) {
    return;
  }

  // Not copied: `wip.children` is only replaced at this frame's `completeWork`,
  // which happens after the cursor has consumed every entry.
  frame.children = children;
  frame.built = new Array(children.length);
  frame.getParent = () => wip;

  if (!isSameType || !originalWDom) {
    // Nothing to pair against — `originals` and `matchedIndexes` stay the
    // shared empty array and read as `undefined`, which is what they mean.
    return;
  }

  frame.originals = new Array(children.length);
  const origChildren = originalWDom.children || [];

  if (wip.type === 'l' && checkExistyKey(children[0])) {
    frame.matchedIndexes = new Array(children.length);
    const keyMap = new Map<unknown, number>();

    origChildren.forEach((item, index) => {
      const key = getKey(item);
      if (!keyMap.has(key)) {
        keyMap.set(key, index);
      }
    });

    children.forEach((item, index) => {
      const key = getKey(item);
      const origIndex = keyMap.get(key);

      if (origIndex !== undefined) {
        keyMap.delete(key);
        frame.originals[index] = origChildren[origIndex];
        frame.matchedIndexes[index] = origIndex;
      }
    });

    frame.unused = [...keyMap.values()].map(index => origChildren[index]);
    return;
  }

  children.forEach((_item, index) => {
    frame.originals[index] = origChildren[index];
  });
};

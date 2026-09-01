import {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  Component,
  LComponent,
} from '@/types';

import { makeNewWDomTree, commitEffects } from '@/diff';
import type { Effects } from '@/diff';
import { wDomUpdate } from '@/render';
import { execMountedQueue } from '@/hook/mountCallback';
import {
  initUpdateHookState,
  initMountHookState,
  needDiffRef,
  componentMap,
  getComponentSubInfo,
  wdomSymbol,
  lmountComponentSet,
} from '@/utils/universalRef';
import { setRedrawAction, componentUpdate, storeVersion } from '@/utils/redraw';
import { runUpdateCallback } from '@/hook/updateCallback';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/utils/predicator';
import { assign } from '@/utils';

// ============================================================================
// Public API - Highest Level (User-facing API)
// ============================================================================

/**
 * It allows grouping multiple elements together.
 */
export const Fragment = (_props: Props, ...children: WDom[]) =>
  ({
    type: 'f', // fragment
    [wdomSymbol]: true,
    children,
  }) as WDom;

/**
 * Element creation
 */
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren
) => {
  const nodeParentPointer: NodePointer = { value: undefined };
  const newChildren = remakeChildren(nodeParentPointer, children);
  const node = makeNode(tag, props || {}, newChildren);

  if (!checkCustemComponentFunction(node)) {
    nodeParentPointer.value = node;
  }

  return node;
};

/**
 * Enables portals
 */
export const portal = (wDom: WDom, portal: HTMLElement) =>
  h('portal', { portal }, wDom);

/**
 * It helps with component creation.
 */
export const mount =
  <T>(component: Component<T>) =>
  (_props: T, _children?: MiddleStateWDomChildren) =>
    component;

/**
 * It helps with component creation without renew parameter.
 * Use useRenew() hook to get renew function if needed.
 */
export const lmount =
  <T>(component: LComponent<T>) =>
  (_props: T, _children?: MiddleStateWDomChildren) => {
    lmountComponentSet.add(component);
    return component;
  };

/**
 * Maintain compChild references for upward updates (render props, slots, etc.).
 * JSX always returns a fresh children array, so when a subtree re-renders
 * bottom-up we must manually swap the old child instance out of each ancestor's
 * compChild.
 *
 * Fragment-wrapping solved this by keeping a stable wrapper node,
 * but that hides the actual child tree. We prefer this explicit sync for DX.
 *
 * In practice slot consumers rarely thread children more than a layer or two—
 * usually shallow composed pieces like dropdowns or drag-and-drop shells—so the
 * directed walk keeps DX high without introducing observable overhead.
 */
const syncAncestorComponentChildren = (
  parent: WDom | undefined,
  prevChild: WDom,
  nextChild: WDom
) => {
  const walk = (node: WDom | undefined, visited: Set<WDom>): void => {
    if (!node || visited.has(node)) {
      return;
    }

    visited.add(node);

    if (node.compChild) {
      const childIndex = node.compChild.indexOf(prevChild);

      if (childIndex !== -1) {
        node.compChild.splice(childIndex, 1, nextChild);
      }
    }

    walk(node.getParent ? node.getParent() : undefined, visited);
  };

  walk(parent, new Set<WDom>());
};

// ============================================================================
// Store consistency bookkeeping (D6, DC-5)
// ============================================================================

/** Builds discarded before one is committed regardless of the store version. */
const MAX_STORE_RETRY = 2;

type HookSnapshot = {
  compKey: Props;
  upD: unknown[][];
  upCB: (() => void)[];
  upS: number;
  mts: (() => void)[];
};

type BuildTrace = { snapshots: HookSnapshot[]; mounted: boolean };

/**
 * Non-null only while a retryable build is running, so the initial `render()`
 * path and anything resolving outside `replaceWDom` pays nothing for this.
 */
let buildTrace: BuildTrace | null = null;

/** Marks the running build as one that mounts — those are never discarded. */
const markBuildMounted = () => {
  if (buildTrace) {
    buildTrace.mounted = true;
  }
};

/**
 * Records a component's hook state before its updater runs.
 *
 * `useUpdated` writes `upD`/`upCB` and advances `upS` during the build, and
 * `upS` is reset only by a commit (`runUpdatedQueueFromWDom`). A second build
 * without this restore would read shifted slots and silently lose or duplicate
 * update callbacks — REQUIREMENTS §7.4, which T2 Phase 9 addresses in general.
 * Here it is what makes the D6 retry sound rather than corrupting.
 */
const traceHookState = (compKey: Props) => {
  if (!buildTrace) {
    return;
  }

  const comp = componentMap.get(compKey);

  if (comp) {
    buildTrace.snapshots.push({
      compKey,
      // `upD` slots are replaced wholesale, never mutated in place, so copying
      // the outer array is enough.
      upD: [...comp.upD],
      upCB: [...comp.upCB],
      upS: comp.upS.value,
      mts: [...comp.mts],
    });
  }
};

/**
 * Whether the build already ran a user `updateCallback` effect.
 *
 * `useUpdated` runs the effect DURING the build, not at commit, so a discard
 * cannot take it back — running it again in the rebuild would double it. Such a
 * build is therefore committed as it is, exactly like a mounting one: **a build
 * is discarded only when it performed nothing observable.**
 *
 * The predicate mirrors `checkNeedPushQueue` in `src/hook/internal/useUpdate.ts`
 * against (deps before the build, deps after it). Duplicated rather than shared
 * because that file is in the frozen base core (P1) and cannot grow an export;
 * for the same reason it cannot drift.
 */
const buildRanUpdateEffects = (snapshots: HookSnapshot[]) =>
  snapshots.some(snapshot => {
    const comp = componentMap.get(snapshot.compKey);

    if (!comp) {
      return false;
    }

    for (let slot = 0; slot < comp.upS.value; slot++) {
      const before = snapshot.upD[slot];
      const after = comp.upD[slot] || [];

      if (
        before &&
        (!before.length || before.some((dep, i) => dep !== after[i]))
      ) {
        return true;
      }
    }

    return false;
  });

const restoreHookState = (snapshots: HookSnapshot[]) => {
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snapshot = snapshots[i];
    const comp = componentMap.get(snapshot.compKey);

    if (comp) {
      comp.upD = snapshot.upD;
      comp.upCB = snapshot.upCB;
      comp.upS.value = snapshot.upS;
      comp.mts = snapshot.mts;
    }
  }
};

/**
 * It re-renders starting from a specific component.
 *
 * The build runs under a store-version check (D6, DC-5): if a store was written
 * while the tree was being built, the tree describes two different versions of
 * the same data and is thrown away rather than committed. Phase 4 is what makes
 * that legal — the build performs nothing, it only records effects.
 */
export const replaceWDom = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
) => {
  if (originalWDom.il) {
    return;
  }

  const trace: BuildTrace = { snapshots: [], mounted: false };
  const outerTrace = buildTrace;
  buildTrace = trace;

  try {
    for (let attempt = 0; ; attempt++) {
      const startVersion = storeVersion();

      trace.snapshots = [];
      trace.mounted = false;

      const { effects, newWDomTree } = buildWDomTree(
        tag,
        props,
        children,
        originalWDom
      );

      // A build that already did something observable is committed as it is.
      // Mounting one (DC-7): its new components are registered in
      // `componentMap`, and discarding it would orphan those entries or run the
      // mounters twice. One that fired an `updateCallback`: the effect ran
      // during the build and a rebuild would run it a second time.
      const retryable =
        !trace.mounted &&
        attempt < MAX_STORE_RETRY &&
        !buildRanUpdateEffects(trace.snapshots);

      if (retryable && storeVersion() !== startVersion) {
        restoreHookState(trace.snapshots);
        continue;
      }

      commit(effects, newWDomTree);
      return;
    }
  } finally {
    buildTrace = outerTrace;
  }
};

/**
 * Build phase. Nothing outside the new tree is touched: every mutation the pass
 * would have made is recorded in `effects` instead (D4). That is what leaves the
 * previous tree whole, the work-in-progress one abandonable, and this function
 * safe to run more than once against the same original.
 */
const buildWDomTree = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
) => {
  needDiffRef.value = true;

  const effects: Effects = [];
  const newWDom = makeWDomResolver(tag, props, children);
  const newWDomTree = makeNewWDomTree(newWDom, originalWDom, effects);
  // NOTE: we/ae are short for wrapElement/afterElement
  const { isRoot, getParent, we, ae } = originalWDom;

  newWDomTree.getParent = getParent;

  if (!isRoot && getParent) {
    const parent = getParent();
    const brothers = (parent && parent.children) || [];
    const index = brothers.indexOf(originalWDom);

    effects.push(() => {
      if (index !== -1) {
        brothers.splice(index, 1, newWDomTree);
      }

      syncAncestorComponentChildren(parent, originalWDom, newWDomTree);
    });
  } else {
    // Root fields live on the new tree, which nothing else can observe yet.
    newWDomTree.isRoot = true;
    newWDomTree.we = we;
    newWDomTree.ae = ae;
  }

  needDiffRef.value = false;

  return { effects, newWDomTree };
};

/**
 * Commit phase — the single point where a render becomes observable.
 *
 * `mountCallback` flushes here, once per commit, rather than at each of the
 * four DOM-insertion sites the base core flushes from (BC-1). A mount callback
 * therefore observes the finished commit instead of a partially built DOM.
 *
 * It has to be HERE and not at the end of `wDomUpdate`: that function recurses
 * into every child (`render.ts` `updateChildren`), so flushing there would fire
 * once per node — more scattered than what this replaces, not less.
 */
const commit = (effects: Effects, newWDomTree: WDom) => {
  commitEffects(effects);
  wDomUpdate(newWDomTree);
  execMountedQueue();
};

// ============================================================================
// Mid-Level - Virtual DOM Node Creation (Intermediate abstraction level)
// ============================================================================

/**
 * The starting point where the virtual DOM is created from the h function.
 */
const makeNode = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  children: WDom[]
) => {
  if (checkFragmentFunction(tag)) {
    return Fragment(props, ...children);
  } else if (checkCustemComponentFunction(tag)) {
    const componetMakeResolver = makeWDomResolver(tag, props, children);

    return needDiffRef.value
      ? componetMakeResolver
      : componetMakeResolver.resolve();
  }

  return {
    type: 'e', // element
    [wdomSymbol]: true,
    tag,
    props,
    children,
  } as WDom;
};

/**
 * The starting point for recursively processing the child virtual DOM elements.
 */
const remakeChildren = (
  nodeParentPointer: NodePointer,
  children: MiddleStateWDomChildren
): WDom[] => {
  // Siblings share a single getParent closure (one allocation per parent)
  const getParent = () => nodeParentPointer.value;

  return children.map((item: MiddleStateWDom) => {
    const childItem = makeChildrenItem(item);
    childItem.getParent = getParent;
    return childItem;
  });
};

/**
 * Recursively process the child virtual DOM elements.
 */
const makeChildrenItem = (item: MiddleStateWDom): WDom => {
  if (item === null || item === undefined || item === false) {
    return { type: null, [wdomSymbol]: true } as WDom;
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const children = remakeChildren(nodeParentPointer, item);
    const node = {
      type: 'l', // loop (array mapping)
      [wdomSymbol]: true,
      children,
    } as WDom;
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 't', [wdomSymbol]: true, text: item } as WDom; // text node
  }

  return item;
};

// ============================================================================
// Component Lifecycle - Component Creation & Re-rendering
// ============================================================================

/**
 * Create component resolver function
 */
const createComponentResolver = (
  tag: TagFunction,
  props: Props,
  wrappedChildren: WDom[]
) => {
  return (compKey = props) => {
    // Diff mode sets needDiffRef to true so h()/makeNode return a resolver
    // placeholder. During actual resolution we must force a real WDom tree,
    // otherwise nested components leave only resolvers (no getParent/children)
    // and CSR renders a blank area. Temporarily drop needDiffRef, then restore.
    // Regression tests: src/tests/core-composedRenew.test.tsx,
    // src/tests/core-component-remount.test.tsx
    const prevNeedDiff = needDiffRef.value;
    needDiffRef.value = false;

    markBuildMounted();
    initMountHookState(compKey);

    const initialComponent = tag(props, wrappedChildren);

    let componentMaker: (nextProps: Props) => MiddleStateWDom;

    if (typeof initialComponent === 'function') {
      const component = initialComponent;
      // Check if component is created with lmount (no renew parameter)
      // TypeScript cannot infer that component is LComponent when has() returns true,
      // because WeakSet.has() is a runtime check that doesn't narrow types.
      // We use 'as any' since the runtime check guarantees type safety.
      componentMaker = lmountComponentSet.has(component)
        ? (component as any)(props, wrappedChildren)
        : component(componentUpdate(compKey), props, wrappedChildren);
    } else {
      // For components that directly return a VDom, recreate it each render.
      componentMaker = (nextProps: Props) =>
        tag(nextProps, wrappedChildren) as MiddleStateWDom;
    }

    const node = makeCustomNode(
      componentMaker,
      compKey,
      tag,
      props,
      wrappedChildren
    );
    needDiffRef.value = prevNeedDiff;
    return node;
  };
};

/**
 * Create an intermediate step for diffing between the existing virtual DOM and the new one during re-rendering
 */
const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const ctor = tag;

  const wrappedChildren = children;

  const resolve = createComponentResolver(tag, props, wrappedChildren);

  return { ctor, props, children: wrappedChildren, resolve };
};

/**
 * Create the actual virtual DOM node from the component.
 */
const makeCustomNode = (
  componentMaker: (props: Props) => MiddleStateWDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const normalizedComponentMaker = (nextProps: Props): WDom =>
    makeChildrenItem(componentMaker(nextProps));
  const { wrappedComponentMaker, customNode } = wrapComponentMakerIfNeeded(
    normalizedComponentMaker,
    props
  );
  const reRender = makeReRender(
    wrappedComponentMaker,
    compKey,
    tag,
    props,
    children
  );

  addComponentProps(customNode, compKey, tag, props, children, reRender);
  return customNode;
};

/**
 * When the virtual DOM is actually created from the component, generate a re-render method for future redraws.
 */
const makeReRender = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const reRender = () =>
    wDomMaker(componentMaker, compKey, tag, props, children, reRender);
  return reRender;
};

/**
 * The starting point for redrawing from the re-render method
 */
const wDomMaker = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  traceHookState(compKey);
  initUpdateHookState(compKey);
  runUpdateCallback();

  const customNode = componentMaker(props);
  addComponentProps(customNode, compKey, tag, props, children, reRender);

  return customNode;
};

// ============================================================================
// Low-Level Utilities - Component Node Manipulation
// ============================================================================

/**
 * Wrap component output in a stable Fragment so component metadata lives on a
 * dedicated node. This prevents parent/child sharing when a component returns
 * another component and keeps updates stable even when output becomes empty.
 */
const wrapComponentMakerIfNeeded = (
  componentMaker: (props: Props) => WDom,
  props: Props
): { wrappedComponentMaker: (props: Props) => WDom; customNode: WDom } => {
  const wrappedComponentMaker = (newProps: Props): WDom => {
    const next = componentMaker(newProps);
    const wrapper = Fragment({}, next);
    next.getParent = () => wrapper;
    return wrapper;
  };

  const customNode = wrappedComponentMaker(props);

  return { wrappedComponentMaker, customNode };
};

/**
 * When creating a custom component node, attach additional information attributes to the virtual DOM object.
 */
const addComponentProps = (
  wDom: WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  assign(wDom, {
    compProps: props,
    compChild: children,
    ctor: tag,
    compKey,
    reRender,
  });

  setRedrawAction(compKey, () =>
    replaceWDom(
      tag,
      (wDom.compProps as Props) || props,
      (wDom.compChild as WDom[]) || children,
      wDom
    )
  );

  if (getComponentSubInfo(compKey, 'vd')) {
    (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = wDom;
  }
};

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

import { startWork, commitEffects } from '@/diff';
import type { Effects, Work } from '@/diff';
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
import {
  setRedrawAction,
  componentUpdate,
  storeVersion,
  shouldYield,
  isFlushingLow,
  scheduleWork,
  cancelWork,
  drainPendingWork,
} from '@/utils/redraw';
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
 * The one build that is currently parked mid-tree, if any.
 *
 * Kept here rather than in the scheduler because deciding what happens to it is
 * a rendering question — whether the render that just arrived supersedes it.
 */
let pausedPass: Pass | null = null;

/**
 * One render pass in flight. It outlives a single task when the build pauses.
 */
type Pass = {
  tag: TagFunction;
  props: Props;
  children: WDom[];
  originalWDom: WDom;
  trace: BuildTrace;
  attempt: number;
  startVersion: number;
  effects: Effects;
  work: Work;
};

/**
 * It re-renders starting from a specific component.
 *
 * The build runs under a store-version check (D6, DC-5): if a store was written
 * while the tree was being built, the tree describes two different versions of
 * the same data and is thrown away rather than committed. Phase 4 is what makes
 * that legal — the build performs nothing, it only records effects.
 *
 * Inside a low-lane flush the build may also stop partway and continue in a
 * later task (D7). It never does so in the sync lane: that flush is a
 * microtask, and `await nextTick()` promising a finished commit is a contract
 * 72 call sites across the suites depend on.
 */
export const replaceWDom = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  original: WDom
) => {
  let originalWDom = original;

  if (originalWDom.il) {
    return;
  }

  // At most one build is ever parked, and this render decides its fate.
  if (pausedPass) {
    if (pausedPass.props === props) {
      // Same component, so the parked build is stale before it ever resumes.
      // Dropping it is only allowed while it has done nothing observable
      // (DC-18); otherwise it has to be finished, and this render then aims at
      // whatever node that commit installed.
      //
      // "Observable" covers mounting too (DC-7 (B)): a discarded mounting build
      // has already registered its components and run their mounter bodies, and
      // rebuilding would run them a second time. BC-2 permits that in principle,
      // but the scheduler avoids it where it cheaply can — which is here.
      if (
        pausedPass.trace.mounted ||
        buildRanUpdateEffects(pausedPass.trace.snapshots)
      ) {
        drainPendingWork();
        originalWDom = liveNodeOf(props) || originalWDom;

        if (originalWDom.il) {
          return;
        }
      } else {
        discardPaused();
      }
    } else {
      // A different component. Finishing it first keeps commit order equal to
      // render order, and means the parked slot never has to be a queue.
      drainPendingWork();

      if (originalWDom.il) {
        return;
      }
    }
  }

  runPass(startPass(tag, props, children, originalWDom));
};

const startPass = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
): Pass => {
  const pass: Pass = {
    tag,
    props,
    children,
    originalWDom,
    trace: { snapshots: [], mounted: false },
    attempt: 0,
    startVersion: 0,
    effects: [],
    work: { advance: () => null },
  };

  beginAttempt(pass);

  return pass;
};

/** (Re)starts the build from the root, discarding whatever the last try made. */
const beginAttempt = (pass: Pass) => {
  pass.startVersion = storeVersion();
  pass.trace.snapshots = [];
  pass.trace.mounted = false;
  pass.effects = [];

  withBuildContext(pass, () => {
    pass.work = startWork(
      makeWDomResolver(pass.tag, pass.props, pass.children),
      pass.originalWDom,
      pass.effects
    );
  });
};

/**
 * Runs the pass until it commits, is abandoned, or runs out of slice.
 *
 * `needDiffRef` and the hook-state trace are module-level, so they are put in
 * place around each slice rather than once around the whole build — between two
 * slices the build is not running and neither should be set.
 */
const runPass = (pass: Pass) => {
  for (;;) {
    const built = withBuildContext(pass, () =>
      pass.work.advance(interruptible(pass) ? wantsPause : undefined)
    );

    if (!built) {
      // Out of slice. The stack holds the resume point.
      pausedPass = pass;
      scheduleWork(() => {
        pausedPass = null;
        resumePass(pass);
      });
      return;
    }

    const newWDomTree = finishTree(pass, built);

    // A build that already did something observable is committed as it is.
    // Mounting one (DC-7): its new components are registered in `componentMap`,
    // and discarding it would orphan those entries or run the mounters twice.
    // One that fired an `updateCallback`: the effect ran during the build and a
    // rebuild would run it a second time.
    const retryable =
      !pass.trace.mounted &&
      pass.attempt < MAX_STORE_RETRY &&
      !buildRanUpdateEffects(pass.trace.snapshots);

    if (retryable && storeVersion() !== pass.startVersion) {
      restoreHookState(pass.trace.snapshots);
      pass.attempt += 1;
      beginAttempt(pass);
      continue;
    }

    commit(pass.effects, newWDomTree);
    return;
  }
};

/**
 * Continues a paused build in a later task.
 *
 * The one thing that can have happened in between is a sync render of the same
 * component: it builds from the same original, commits, and retires it. This
 * build is then stale and is dropped — the newer tree already on screen wins.
 * Dropping is safe precisely because pausing was refused once the build had
 * done anything observable (checked by the caller, DC-18).
 */
const resumePass = (pass: Pass) => {
  if (pass.originalWDom.il) {
    restoreHookState(pass.trace.snapshots);
    return;
  }

  runPass(pass);
};

/**
 * Whether this build may be interrupted.
 *
 * Only inside a low-lane flush — and `flushSync` clears that marker around
 * itself, so a sync render raised from within a low slice is correctly seen as
 * sync work and runs straight through. Without that clearing it inherited the
 * low marker, parked itself, and was then discarded by the render behind it:
 * the deferred AND the urgent update were both lost, leaving the screen showing
 * the state from before either.
 */
const interruptible = (pass: Pass) => isFlushingLow() && !pass.originalWDom.il;

/**
 * Whether this build may stop here — nothing more than "the slice is spent".
 *
 * This also used to refuse once the build had fired an `updateCallback`, which
 * confused two different questions. **Pausing is always safe**; it is
 * DISCARDING that a fired effect rules out (DC-18), and a parked build that
 * cannot be discarded is drained instead. Tying them together made every render
 * containing a live `updateCallback` — most of them — uninterruptible for its
 * whole remaining length, and made the check O(components) per unit on top.
 * Measured on the section E page: the concurrent core's longest block came out
 * WORSE than the base core's.
 */
const wantsPause = () => shouldYield();

/**
 * Drops the parked build and puts back the hook slots it wrote.
 *
 * Everything else it did is invisible: the tree it was building is its own,
 * the elements it created early (D16) are never claimed, and since Phase 9 the
 * component's redraw closure and live node are published at COMMIT, so nothing
 * outside ever pointed at the half-built tree.
 */
const liveNodeOf = (compKey: Props) => {
  const live = getComponentSubInfo(compKey, 'vd') as
    | { value: WDom }
    | undefined;

  return live && live.value;
};

const discardPaused = () => {
  const pass = pausedPass as Pass;

  pausedPass = null;
  cancelWork();
  restoreHookState(pass.trace.snapshots);
};

/**
 * Where a build records what has to happen at commit.
 *
 * Non-null only while a pass is building, so the initial `render()` path — which
 * has no commit phase to defer to — keeps publishing straight away.
 */
let buildEffects: Effects | null = null;

/** Puts the module-level build context in place for one slice. */
const withBuildContext = <T>(pass: Pass, run: () => T): T => {
  const outerTrace = buildTrace;
  const outerEffects = buildEffects;

  buildTrace = pass.trace;
  buildEffects = pass.effects;
  needDiffRef.value = true;

  try {
    return run();
  } finally {
    needDiffRef.value = false;
    buildTrace = outerTrace;
    buildEffects = outerEffects;
  }
};

/**
 * Root bookkeeping, once the tree is whole: it reads the finished node, so it
 * cannot run before the last slice.
 */
const finishTree = (pass: Pass, newWDomTree: WDom) => {
  const { originalWDom, effects } = pass;
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

  return newWDomTree;
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

  // These two point the OUTSIDE WORLD at this node — the redraw closure a
  // future `renew()` will run, and the live node `componentMap` hands out. Doing
  // them while the tree is still being built means a render that arrives mid
  // build targets a half-finished node, whose `children` still hold resolvers.
  // Until Phase 8 a build always ran to completion in one go, so it never
  // showed; now it is the same D4 rule as everything else — record it, replay it
  // at commit.
  const publish = () => {
    setRedrawAction(compKey, () =>
      replaceWDom(
        tag,
        (wDom.compProps as Props) || props,
        (wDom.compChild as WDom[]) || children,
        wDom
      )
    );

    const live = getComponentSubInfo(compKey, 'vd') as
      | { value: WDom }
      | undefined;

    if (live) {
      live.value = wDom;
    }
  };

  if (buildEffects) {
    buildEffects.push(publish);
  } else {
    publish();
  }
};

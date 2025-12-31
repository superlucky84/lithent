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

import { makeNewWDomTree } from '@/diff';
import { wDomUpdate } from '@/render';
import {
  initUpdateHookState,
  initMountHookState,
  needDiffRef,
  getComponentSubInfo,
  wdomSymbol,
  lmountComponentSet,
} from '@/utils/universalRef';
import { setRedrawAction, componentUpdate } from '@/utils/redraw';
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

/**
 * It re-renders starting from a specific component.
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
  needDiffRef.value = true;

  const newWDom = makeWDomResolver(tag, props, children);
  const newWDomTree = makeNewWDomTree(newWDom, originalWDom);
  // NOTE: we/ae are short for wrapElement/afterElement
  const { isRoot, getParent, we, ae } = originalWDom;

  newWDomTree.getParent = getParent;

  if (!isRoot && getParent) {
    const parent = getParent();
    const brothers = (parent && parent.children) || [];
    const index = brothers.indexOf(originalWDom);

    if (index !== -1) {
      brothers.splice(index, 1, newWDomTree);
    }

    syncAncestorComponentChildren(parent, originalWDom, newWDomTree);
  } else {
    newWDomTree.isRoot = true;
    newWDomTree.we = we;
    newWDomTree.ae = ae;
  }

  needDiffRef.value = false;

  wDomUpdate(newWDomTree);
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
): WDom[] =>
  children.map((item: MiddleStateWDom) =>
    assign(makeChildrenItem(item), { getParent: () => nodeParentPointer.value })
  );

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
 * Prevent parents and children from sharing the same WDom node when a component
 * simply returns another component. Without this wrapper addComponentProps would
 * overwrite the child's metadata (compProps, reRender, etc.) and break its
 * update wiring.
 */
const wrapComponentMakerIfNeeded = (
  componentMaker: (props: Props) => WDom,
  props: Props
): { wrappedComponentMaker: (props: Props) => WDom; customNode: WDom } => {
  let customNode = componentMaker(props);

  // If the component returns a plain VDom (no reRender), nothing to wrap.
  if (!customNode.reRender) {
    return { wrappedComponentMaker: componentMaker, customNode };
  }

  /**
   * Avoid parent/child sharing the same WDom when a component directly returns
   * another component. On remove→add toggles the shared instance would lose its
   * parent pointer and fail to reinsert. We always wrap the child in a Fragment
   * and attach getParent to the wrapped child so it stays anchored even after
   * unmount/mount cycles.
   * Regression tests: src/tests/core-composedRenew.test.tsx,
   * src/tests/core-component-remount.test.tsx
   */
  const wrappedComponentMaker = (newProps: Props): WDom => {
    const next = componentMaker(newProps);

    // When the child is null/primitive/element (no reRender), normalize it into
    // a WDom via makeChildrenItem and wrap once so parent links are stable.
    if (!next || !next.reRender) {
      const child = makeChildrenItem(next as MiddleStateWDom);
      const wrapper = Fragment({}, child);
      child.getParent = () => wrapper;
      return wrapper;
    }

    const wrapper = Fragment({}, next);
    (next as WDom).getParent = () => wrapper;
    return wrapper;
  };

  customNode = wrappedComponentMaker(props);

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

import {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  Component,
  LComponent,
  CompKey,
} from '@/types';

import { makeNewWDomTree } from '@/diff';
import { getParent } from '@/utils';
import { wDomUpdate } from '@/render';
import {
  compKeyRef,
  initMountHookState,
  needDiffRef,
  componentMap,
  lmountComponentSet,
} from '@/utils/universalRef';
import { bindRedraw, componentUpdate } from '@/utils/redraw';
import { createWDom, createCompWDom } from '@/utils/createWDom';
import { runUpdateCallback } from '@/hook/updateCallback';
import { checkCustemComponentFunction } from '@/utils/predicator';

// ============================================================================
// Public API - Highest Level (User-facing API)
// ============================================================================

/**
 * It allows grouping multiple elements together.
 */
export const Fragment = (_props: Props, ...children: WDom[]) =>
  createWDom('f', children);

/**
 * Element creation
 */
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren
) => {
  props = props || {};

  // No children (a row component, an empty cell): nothing to link to a
  // parent, so no pointer, getter or copied array.
  if (!children.length) {
    return makeNode(tag, props, children as WDom[]);
  }

  const nodeParentPointer: NodePointer = { value: undefined };
  const newChildren = remakeChildren(nodeParentPointer, children);
  const node = makeNode(tag, props, newChildren);

  // An element is the common case: known from its tag, without looking at
  // the node.
  if (typeof tag === 'string' || !checkCustemComponentFunction(node)) {
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
const swapIn = (list: WDom[], prev: WDom, next: WDom) => {
  const index = list.indexOf(prev);

  if (index !== -1) {
    list.splice(index, 1, next);
  }
};

const syncAncestorComponentChildren = (
  parent: WDom | undefined,
  prevChild: WDom,
  nextChild: WDom
) => {
  const visited = new Set<WDom>();

  while (parent && !visited.has(parent)) {
    visited.add(parent);

    if (parent.compChild) {
      swapIn(parent.compChild, prevChild, nextChild);
    }

    parent = getParent(parent);
  }
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

  let newWDomTree: WDom;
  try {
    const newWDom = makeWDomResolver(tag, props, children);
    newWDomTree = makeNewWDomTree(newWDom, originalWDom);
    // NOTE: we/ae are short for wrapElement/afterElement
    const { isRoot, getParent, we, ae } = originalWDom;

    newWDomTree.getParent = getParent;

    if (!isRoot && getParent) {
      const parent = getParent();
      const brothers = (parent && parent.children) || [];
      swapIn(brothers, originalWDom, newWDomTree);

      syncAncestorComponentChildren(parent, originalWDom, newWDomTree);
    } else {
      newWDomTree.isRoot = true;
      newWDomTree.we = we;
      newWDomTree.ae = ae;
    }
  } finally {
    needDiffRef.value = false;
  }

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
  // An element is the common case: a string tag skips the checks below.
  if (typeof tag !== 'string') {
    if (tag === Fragment) {
      return createWDom('f', children);
    }
    if (checkCustemComponentFunction(tag)) {
      const componetMakeResolver = makeWDomResolver(tag, props, children);

      if (needDiffRef.value) {
        return componetMakeResolver;
      }

      // Drawn right away, without a diff. Later updates sync the instance's
      // props and children in place, so it gets copies; the node keeps the
      // untouched description to be drawn again elsewhere (cloneWDom).
      const node = copyResolver(componetMakeResolver).resolve();
      node.rs = componetMakeResolver;
      return node;
    }
  }

  return createWDom('e', children, undefined, tag as string, props);
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
  if (item === null || item === undefined || typeof item === 'boolean') {
    return createWDom(null);
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const children = remakeChildren(nodeParentPointer, item);
    const node = createWDom('l', children);
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return createWDom('t', undefined, item);
  }

  return item;
};

// ============================================================================
// Component Lifecycle - Component Creation & Re-rendering
// ============================================================================

/**
 * Resolve a component description into its node: run the component and draw
 * its first output. One function shared by every description (`this`), not a
 * closure made for each: a list's redraw describes every row again.
 */
function resolveComponent(this: TagFunctionResolver, compKey?: CompKey) {
  const { props, children: wrappedChildren } = this;
  const tag = this.ctor as TagFunction;
  compKey = compKey || props;
  // Diff mode sets needDiffRef to true so h()/makeNode return a resolver
  // placeholder. During actual resolution we must force a real WDom tree,
  // otherwise nested components leave only resolvers (no getParent/children)
  // and CSR renders a blank area. Temporarily drop needDiffRef, then restore.
  // Regression tests: src/tests/core-composedRenew.test.tsx,
  // src/tests/core-component-remount.test.tsx
  const prevNeedDiff = needDiffRef.value;
  const previousKey = compKeyRef.value;
  needDiffRef.value = false;
  try {
    initMountHookState(compKey, tag);

    const initialComponent = tag(props, wrappedChildren);

    let componentMaker: (nextProps: Props) => MiddleStateWDom;

    if (typeof initialComponent === 'function') {
      // Check if component is created with lmount (no renew parameter)
      // TypeScript cannot infer that component is LComponent when has() returns true,
      // because WeakSet.has() is a runtime check that doesn't narrow types.
      // We use 'as any' since the runtime check guarantees type safety.
      componentMaker = lmountComponentSet.has(initialComponent)
        ? (initialComponent as any)(props, wrappedChildren)
        : initialComponent(componentUpdate(compKey), props, wrappedChildren);
    } else {
      // For components that directly return a VDom, recreate it each render.
      // The first call already rendered this stateless component. Repeating it
      // creates orphan child instances and can register hooks under a child's key.
      let firstRender = true;
      componentMaker = (nextProps: Props) => {
        if (firstRender) {
          firstRender = false;
          return initialComponent as MiddleStateWDom;
        }
        return tag(nextProps, wrappedChildren) as MiddleStateWDom;
      };
    }

    return makeCustomNode(componentMaker, compKey, tag, props, wrappedChildren);
  } finally {
    compKeyRef.value = previousKey;
    needDiffRef.value = prevNeedDiff;
  }
}

/**
 * A fresh copy of a node that is already drawn somewhere: a hoisted constant,
 * children a component renders again in another place, the same node twice.
 * A node holds the state of the place it is drawn in (el, children, parent,
 * component instance), so a second place gets its own copy. A component
 * becomes a resolver for a new instance with its own props and children.
 */
export const cloneWDom = (wDom: WDom): WDom | TagFunctionResolver =>
  wDom.ctor
    ? copyResolver(
        wDom.rs || {
          ctor: wDom.ctor,
          props: wDom.compProps as Props,
          children: wDom.compChild as WDom[],
        }
      )
    : createWDom(
        wDom.type,
        wDom.children && [...wDom.children],
        wDom.text,
        wDom.tag,
        wDom.props,
        wDom.getParent
      );

export const copyResolver = ({
  ctor,
  props,
  children,
}: Omit<TagFunctionResolver, 'resolve'>) =>
  makeWDomResolver(ctor as TagFunction, { ...props }, [...(children || [])]);

/**
 * Create an intermediate step for diffing between the existing virtual DOM and the new one during re-rendering
 */
const makeWDomResolver = (
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => ({
  ctor: tag,
  props,
  children,
  resolve: resolveComponent,
});

/**
 * Create the actual virtual DOM node from the component, and the re-render
 * method for its future redraws.
 */
const makeCustomNode = (
  componentMaker: (props: Props) => MiddleStateWDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const comp = componentMap.get(compKey);

  // Component output sits in a stable Fragment so component metadata lives
  // on a dedicated node. This prevents parent/child sharing when a component
  // returns another component and keeps updates stable even when output
  // becomes empty. Runs on every render of every component.
  const draw = (): WDom => {
    const next = makeChildrenItem(componentMaker(props));
    const wrapper = createCompWDom(
      next,
      props,
      children,
      tag,
      compKey,
      reRender
    );
    next.getParent = () => wrapper;

    if (comp) {
      comp.vd.value = wrapper;
    }
    return wrapper;
  };

  const reRender = (): WDom => {
    const previousKey = compKeyRef.value;
    try {
      compKeyRef.value = compKey;
      runUpdateCallback();

      return draw();
    } finally {
      compKeyRef.value = previousKey;
    }
  };

  const customNode = draw();

  bindRedraw(compKey, wDom =>
    replaceWDom(
      tag,
      (wDom.compProps as Props) || props,
      (wDom.compChild as WDom[]) || children,
      wDom
    )
  );
  return customNode;
};

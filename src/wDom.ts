import {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  Component,
} from '@/types';

import { makeNewWDomTree } from '@/diff';
import { wDomUpdate } from '@/render';
import {
  initUpdateHookState,
  initMountHookState,
  needDiffRef,
  getComponentSubInfo,
  wdomSymbol,
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
 * It re-renders starting from a specific component.
 */
export const replaceWDom = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
) => {
  if (originalWDom.isLegacy) {
    return;
  }
  needDiffRef.value = true;

  const newWDom = makeWDomResolver(tag, props, children);
  const newWDomTree = makeNewWDomTree(newWDom, originalWDom);
  const { isRoot, getParent, wrapElement, afterElement } = originalWDom;

  newWDomTree.getParent = getParent;

  if (!isRoot && getParent) {
    const brothers = getParent()?.children || [];
    const index = brothers.indexOf(originalWDom);

    brothers.splice(index, 1, newWDomTree);
  } else {
    newWDomTree.isRoot = true;
    newWDomTree.wrapElement = wrapElement;
    newWDomTree.afterElement = afterElement;
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
 * Create an intermediate step for diffing between the existing virtual DOM and the new one during re-rendering
 */
const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const tagName = tag.name;
  const ctor = tag;
  // Resolve creates a new component
  const resolve = (compKey = props) => {
    initMountHookState(compKey);

    const initialComponent = tag(props, children);
    const component =
      typeof initialComponent === 'function'
        ? initialComponent
        : () => () => initialComponent;
    const componentMaker = component(componentUpdate(compKey), props, children);

    return makeCustomNode(componentMaker, compKey, tag, props, children);
  };

  return { tagName, ctor, props, children, resolve };
};

/**
 * Create the actual virtual DOM node from the component.
 */
const makeCustomNode = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const { wrappedComponentMaker, customNode } = wrapComponentMakerIfNeeded(
    componentMaker,
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
 * Wraps a component maker to handle components that have a reRender property
 */
const wrapComponentMakerIfNeeded = (
  componentMaker: (props: Props) => WDom,
  props: Props
): { wrappedComponentMaker: (props: Props) => WDom; customNode: WDom } => {
  let customNode = componentMaker(props);

  if (!customNode.reRender) {
    return { wrappedComponentMaker: componentMaker, customNode };
  }

  const wrappedComponentMaker = (newProps: Props): WDom => {
    const customNode = componentMaker(newProps);
    const newNode = Fragment({}, customNode);
    customNode.getParent = () => newNode;
    return newNode;
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
    tagName: tag.name,
    compKey,
    reRender,
  });

  setRedrawAction(compKey, () => replaceWDom(tag, props, children, wDom));

  if (getComponentSubInfo(compKey, 'vd')) {
    (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = wDom;
  }
};

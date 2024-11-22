import {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  Component,
} from '@/engine/types';

import { makeNewWDomTree } from '@/engine/diff';
import { wDomUpdate } from '@/engine/render';
import {
  initUpdateHookState,
  initMountHookState,
  needDiffRef,
  getComponentSubInfo,
  wdomSymbol,
} from '@/engine/utils/universalRef';
import { setRedrawAction, componentUpdate } from '@/engine/utils/redraw';
import { runUpdateCallback } from '@/engine/hook/updateCallback';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/engine/utils/predicator';
import { assign } from '@/engine/utils';

export const Fragment = (_props: Props, ...children: WDom[]) =>
  ({
    type: 'fragment',
    [wdomSymbol]: true,
    children,
  } as WDom);

export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren
) => {
  const nodeParentPointer: NodePointer = { value: undefined };
  const newProps = props || {};
  const newChildren = remakeChildren(nodeParentPointer, children);
  const node = makeNode(tag, newProps, newChildren);

  if (!checkCustemComponentFunction(node)) {
    nodeParentPointer.value = node;
  }

  return node;
};

export const portal = (wDom: WDom, portal: HTMLElement) => {
  return h('portal', { portal }, wDom);
};

export const mount =
  <T>(component: Component<T>) =>
  (_props: T, _children?: MiddleStateWDomChildren) =>
    component;

const reRenderCustomComponent = (
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

const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const tagName = tag.name;
  const ctor = tag;
  // 리졸브는 컴포넌트를 새로 만든다.
  const resolve = (compKey = props) => {
    initMountHookState(compKey);

    const component = tag(props, children);
    const componentMaker = component(componentUpdate(compKey), props, children);

    const customNode = makeCustomNode(
      componentMaker,
      compKey,
      tag,
      props,
      children
    );

    return customNode;
  };

  return { tagName, ctor, props, children, resolve };
};

const makeCustomNode = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  let newCustomComponentMaker = componentMaker;
  let customNode = componentMaker(props);

  if (customNode.reRender) {
    newCustomComponentMaker = (newProps: Props): WDom => {
      const customNode = componentMaker(newProps);
      const newNode = Fragment({}, customNode);

      customNode.getParent = () => newNode;

      return newNode;
    };

    customNode = newCustomComponentMaker(props);
  }

  const reRender = makeReRender(
    newCustomComponentMaker,
    compKey,
    tag,
    props,
    children
  );

  addComponentProps(customNode, compKey, tag, props, children, reRender);

  return customNode;
};

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

  setRedrawAction(compKey, () =>
    reRenderCustomComponent(tag, props, children, wDom)
  );

  (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = wDom;
};

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
    type: 'element',
    [wdomSymbol]: true,
    tag,
    props,
    children,
  } as WDom;
};

const remakeChildren = (
  nodeParentPointer: NodePointer,
  children: MiddleStateWDomChildren
): WDom[] =>
  children.map((item: MiddleStateWDom) =>
    assign(makeChildrenItem(item), { getParent: () => nodeParentPointer.value })
  );

const makeChildrenItem = (item: MiddleStateWDom): WDom => {
  if (item === null || item === undefined || item === false) {
    return { type: null, [wdomSymbol]: true } as WDom;
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const children = remakeChildren(nodeParentPointer, item);
    const node = {
      type: 'loop',
      [wdomSymbol]: true,
      children,
    } as WDom;
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 'text', [wdomSymbol]: true, text: item } as WDom;
  }

  return item;
};

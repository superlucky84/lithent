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
  setRedrawAction,
  needDiffRef,
  componentRender,
  getComponentSubInfo,
} from '@/utils/universalRef';
import { runUpdateCallback } from '@/hook/updateCallback';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/utils/predicator';

export type Children = WDom[];

export const Fragment = (_props: Props, ...children: WDom[]) => ({
  type: 'fragment',
  children,
});

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

export const mount =
  <T>(component: Component<T>) =>
  (_props: T, _children: WDom[]) =>
    component;

const reRenderCustomComponent = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
) => {
  needDiffRef.value = true;

  const newWDom = makeWDomResolver(tag, props, children);
  const newWDomTree = makeNewWDomTree(newWDom, originalWDom);
  const { isRoot, getParent, wrapElement } = originalWDom;

  newWDomTree.getParent = getParent;

  if (!isRoot && getParent) {
    const brothers = getParent()?.children || [];
    const index = brothers.indexOf(originalWDom);

    brothers.splice(index, 1, newWDomTree);
  } else {
    newWDomTree.isRoot = true;
    newWDomTree.wrapElement = wrapElement;
  }

  needDiffRef.value = false;
  console.log(newWDomTree);
  wDomUpdate(newWDomTree);
};

const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const tagName = tag.name;
  const constructor = tag;
  // 리졸브는 컴포넌트를 새로 만든다.
  const resolve = (componentKey = props) => {
    initMountHookState(componentKey);

    const component = tag(props, children);
    const componentMaker = component(
      componentRender(componentKey),
      props,
      children
    );

    const customNode = makeCustomNode(
      componentMaker,
      componentKey,
      tag,
      props,
      children
    );

    const originalWDom = customNode;

    setRedrawAction(componentKey, () =>
      reRenderCustomComponent(tag, props, children, originalWDom)
    );

    (getComponentSubInfo(componentKey, 'vd') as { value: WDom }).value =
      customNode;

    return customNode;
  };

  return { tagName, constructor, props, children, resolve };
};

const makeCustomNode = (
  componentMaker: (props: Props) => WDom,
  componentKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const customNode = componentMaker(props);
  const reRender = makeReRender(
    componentMaker,
    componentKey,
    tag,
    props,
    children
  );

  addComponentProps(customNode, componentKey, tag, props, children, reRender);

  return customNode;
};

const makeReRender = (
  componentMaker: (props: Props) => WDom,
  componentKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const reRender = () =>
    wDomMaker(componentMaker, componentKey, tag, props, children, reRender);

  return reRender;
};

const wDomMaker = (
  componentMaker: (props: Props) => WDom,
  componentKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  initUpdateHookState(componentKey);
  runUpdateCallback();

  const originalWDom = componentMaker(props);

  setRedrawAction(componentKey, () =>
    reRenderCustomComponent(tag, props, children, originalWDom)
  );

  addComponentProps(originalWDom, componentKey, tag, props, children, reRender);

  (getComponentSubInfo(componentKey, 'vd') as { value: WDom }).value =
    originalWDom;

  return originalWDom;
};

const addComponentProps = (
  wDom: WDom,
  componentKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  Object.assign(wDom, {
    componentProps: props,
    componentChildren: children,
    constructor: tag,
    tagName: tag.name,
    componentKey,
    reRender,
  });
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
    tag,
    props,
    children,
  };
};

const remakeChildren = (
  nodeParentPointer: NodePointer,
  children: MiddleStateWDomChildren
): WDom[] =>
  children.map((item: MiddleStateWDom) => {
    const childItem = makeChildrenItem(item);

    childItem.getParent = () => nodeParentPointer.value;

    return childItem;
  });

const makeChildrenItem = (item: MiddleStateWDom): WDom => {
  if (item === null || item === undefined || item === false) {
    return { type: null };
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const children = remakeChildren(nodeParentPointer, item);
    const node = {
      type: 'loop',
      children,
    };
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 'text', text: item };
  }

  return item;
};

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
  cleanNodeChildKey,
  componentRender,
  startMakeNodeChildKey,
  getComponentSubInfo,
} from '@/utils/universalRef';
import { runUpdateCallback } from '@/hook/updateCallback';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/utils/predicator';

export type Children = WDom[];

type WDomInfoParam = {
  componentMaker: (props: Props) => WDom;
  componentKey: Props;
  tag: TagFunction;
  props: Props;
  children: WDom[];
  nodeChildKey: { value: Props };
};
type WDomInfoWithRenderParam = WDomInfoParam & {
  reRender: () => WDom;
};

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
  cleanNodeChildKey();

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
  wDomUpdate(newWDomTree);
};

const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const tagName = tag.name;
  const constructor = tag;
  // 리졸브는 컴포넌트를 새로 만든다.
  const resolve = (componentKey = props) => {
    initMountHookState(componentKey);

    const nodeChildKey = startMakeNodeChildKey(componentKey);
    const component = tag(props, children);
    const componentMaker = component(
      componentRender(componentKey),
      props,
      children
    );

    const customNode = makeCustomNode({
      componentMaker,
      componentKey,
      tag,
      props,
      children,
      nodeChildKey,
    });

    const originalWDom = customNode;

    setRedrawAction(componentKey, nodeChildKey, () =>
      reRenderCustomComponent(tag, props, children, originalWDom)
    );

    (getComponentSubInfo(componentKey, 'vd') as { value: WDom }).value =
      customNode;
    cleanNodeChildKey();

    return customNode;
  };

  return { tagName, constructor, props, children, resolve };
};

const makeCustomNode = (wDomInfo: WDomInfoParam) => {
  const { componentMaker, props } = wDomInfo;
  const customNode = componentMaker(props);
  const reRender = makeReRender(wDomInfo);

  addComponentProps(customNode, { ...wDomInfo, reRender });

  return customNode;
};

const makeReRender = (wDomInfo: WDomInfoParam) => {
  const reRender = () => wDomMaker({ ...wDomInfo, reRender });

  return reRender;
};

const wDomMaker = (wDomInfo: WDomInfoWithRenderParam) => {
  const { componentMaker, componentKey, tag, props, children } = wDomInfo;

  initUpdateHookState(componentKey);
  runUpdateCallback();

  const nodeChildKey = startMakeNodeChildKey(componentKey);
  const originalWDom = componentMaker(props);

  wDomInfo.nodeChildKey = nodeChildKey;

  setRedrawAction(componentKey, nodeChildKey, () =>
    reRenderCustomComponent(tag, props, children, originalWDom)
  );

  addComponentProps(originalWDom, wDomInfo);

  (getComponentSubInfo(componentKey, 'vd') as { value: WDom }).value =
    originalWDom;

  cleanNodeChildKey();

  return originalWDom;
};

const addComponentProps = (wDom: WDom, info: WDomInfoWithRenderParam) => {
  const { componentKey, tag, props, children, reRender, nodeChildKey } = info;

  Object.assign(wDom, {
    componentProps: props,
    componentChildren: children,
    constructor: tag,
    tagName: tag.name,
    componentKey,
    nodeChildKey,
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

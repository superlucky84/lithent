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
} from '@/utils/universalRef';
import { setRedrawAction, componentUpdate } from '@/utils/redraw';
import { runUpdateCallback } from '@/hook/updateCallback';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/utils/predicator';
import { assign } from '@/utils';

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

    const originalWDom = customNode;

    setRedrawAction(compKey, () =>
      reRenderCustomComponent(tag, props, children, originalWDom)
    );

    (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = customNode;

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

  addComponentProps(
    customNode,
    compKey,
    tag,
    props,
    children,
    makeReRender(newCustomComponentMaker, compKey, tag, props, children)
  );

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

  const originalWDom = componentMaker(props);

  setRedrawAction(compKey, () =>
    reRenderCustomComponent(tag, props, children, originalWDom)
  );

  addComponentProps(originalWDom, compKey, tag, props, children, reRender);

  (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = originalWDom;

  return originalWDom;
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
  children.map((item: MiddleStateWDom) =>
    assign(makeChildrenItem(item), { getParent: () => nodeParentPointer.value })
  );

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

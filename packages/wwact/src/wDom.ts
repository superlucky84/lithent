import {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  NodeChildKey,
} from '@/types';

import makeNewWDomTree from '@/diff';
import { wDomUpdate } from '@/render';
import {
  initUpdateHookState,
  initMountHookState,
  setRedrawAction,
  needDiffRef,
} from '@/helper/universalRef';
import { runUpdateCallback } from '@/hook/updated';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/helper/predicator';

export type Children = WDom[];

type WDomInfoParam = {
  componentMaker: () => WDom;
  componentKey: Props;
  tag: TagFunction;
  props: Props;
  children: WDom[];
};
type WDomInfoWithRenderParam = WDomInfoParam & {
  reRender: () => WDom;
};

export function Fragment(_props: Props, ...children: WDom[]) {
  return { type: 'fragment', children };
}

export function h(
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren
) {
  const nodeParentPointer: NodePointer = { value: undefined };
  const nodeChildKey: NodeChildKey = { value: [] };
  const newProps = props || {};
  const newChildren = remakeChildren(nodeParentPointer, nodeChildKey, children);
  const node = makeNode({
    tag,
    props: newProps,
    nodeChildKey,
    children: newChildren,
  });

  if (!checkCustemComponentFunction(node)) {
    nodeParentPointer.value = node;
  }

  return node;
}

function reRenderCustomComponent({
  tag,
  props,
  children,
  originalWDom,
}: {
  tag: TagFunction;
  props: Props;
  children: WDom[];
  originalWDom: WDom;
}) {
  needDiffRef.value = true;

  const newWDom = makeWDomResolver({ tag, props, children });
  const newWDomTree = makeNewWDomTree({ originalWDom, newWDom });
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

  wDomUpdate(newWDomTree);

  needDiffRef.value = false;
}

function makeWDomResolver({
  tag,
  props,
  children,
}: {
  tag: TagFunction;
  props: Props;
  children: WDom[];
}) {
  const tagName = tag.name;
  const constructor = tag;
  const resolve = (componentKey = props) => {
    initMountHookState(componentKey);

    const componentMaker = tag(props, children);
    const customNode = makeCustomNode({
      componentMaker,
      componentKey,
      tag,
      props,
      children,
    });

    const originalWDom = customNode;

    setRedrawAction({
      componentKey,
      nodeChildKey: originalWDom.nodeChildKey || ([] as Props[]),
      exec: () =>
        reRenderCustomComponent({ tag, props, children, originalWDom }),
    });

    return customNode;
  };

  return { tagName, constructor, props, children, resolve };
}

function makeCustomNode(wDomInfo: WDomInfoParam) {
  const { componentMaker } = wDomInfo;
  const customNode = componentMaker();
  const reRender = makeReRender(wDomInfo);

  addComponentProps(customNode, { ...wDomInfo, reRender });

  return customNode;
}

function makeReRender(wDomInfo: WDomInfoParam) {
  const reRender = () => wDomMaker({ ...wDomInfo, reRender });

  return reRender;
}

function wDomMaker(wDomInfo: WDomInfoWithRenderParam) {
  const { componentMaker, componentKey, tag, props, children } = wDomInfo;

  initUpdateHookState(componentKey);
  runUpdateCallback();

  const originalWDom = componentMaker();

  setRedrawAction({
    componentKey,
    nodeChildKey: originalWDom.nodeChildKey || ([] as Props[]),
    exec: () => reRenderCustomComponent({ tag, props, children, originalWDom }),
  });

  addComponentProps(originalWDom, wDomInfo);

  return originalWDom;
}

function addComponentProps(wDom: WDom, info: WDomInfoWithRenderParam) {
  const { componentKey, tag, props, children, reRender } = info;

  Object.assign(wDom, {
    componentProps: props,
    componentChildren: children,
    constructor: tag,
    tagName: tag.name,
    componentKey,
    reRender,
  });
}

function makeNode({
  tag,
  props,
  nodeChildKey,
  children,
}: {
  tag: TagFunction | FragmentFunction | string;
  props: Props;
  nodeChildKey: NodeChildKey;
  children: WDom[];
}) {
  if (checkFragmentFunction(tag)) {
    return Fragment(props, ...children);
  } else if (checkCustemComponentFunction(tag)) {
    const componetMakeResolver = makeWDomResolver({ tag, props, children });

    return needDiffRef.value
      ? componetMakeResolver
      : componetMakeResolver.resolve();
  }

  return {
    type: 'element',
    tag,
    props,
    nodeChildKey: nodeChildKey.value,
    children,
  };
}

function remakeChildren(
  nodeParentPointer: NodePointer,
  nodeChildKey: NodeChildKey,
  children: MiddleStateWDomChildren
): WDom[] {
  return children.map((item: MiddleStateWDom) => {
    const childItem = makeChildrenItem(item);

    childItem.getParent = () => nodeParentPointer.value;
    if (childItem.componentKey) {
      nodeChildKey.value.push(childItem.componentKey);
    }

    return childItem;
  });
}

function makeChildrenItem(item: MiddleStateWDom): WDom {
  if (item === null || item === undefined || item === false) {
    return { type: null };
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const nodeChildKey: NodeChildKey = { value: [] };
    const children = remakeChildren(nodeParentPointer, nodeChildKey, item);
    const node = {
      type: 'loop',
      nodeChildKey: nodeChildKey.value,
      children,
    };
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 'text', text: item };
  }

  return item;
}

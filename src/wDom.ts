import {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateVDomChildren,
  MiddleStateVDom,
  NodePointer,
} from '@/types';

import makeNewVdomTree from '@/diff';
import { vDomUpdate } from './render';
import {
  initUpdateHookState,
  initMountHookState,
  setRedrawAction,
  needDiffRef,
} from '@/helper/universalRef';
import {
  checkFragmentFunction,
  checkCustemComponentFunction,
} from '@/helper/predicator';

export type Children = WDom[];

export function Fragment(...children: WDom[]) {
  return { type: 'fragment', children };
}

export function h(
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateVDomChildren
) {
  const nodePointer: NodePointer = { value: {} };
  const newProps = props || {};
  const newChildren = remakeChildren(nodePointer, children);
  const node = makeNode({ tag, props: newProps, children: newChildren });

  nodePointer.value = node;

  return node;
}

function reRenderCustomComponent({
  tag,
  props,
  children,
  originalVdom,
}: {
  tag: TagFunction;
  props: Props;
  children: WDom[];
  originalVdom: WDom;
}) {
  needDiffRef.value = true;

  const newVdom = makeVdomResolver({ tag, props, children });
  const newVdomTree = makeNewVdomTree({ originalVdom, newVdom });
  newVdomTree.getParent = originalVdom.getParent;

  if (!originalVdom.isRoot && originalVdom.getParent) {
    const brothers = originalVdom.getParent().children || [];
    const index = brothers.indexOf(originalVdom);

    brothers.splice(index, 1, newVdomTree);
  } else {
    newVdomTree.isRoot = true;
    newVdomTree.wrapElement = originalVdom.wrapElement;
  }

  vDomUpdate(newVdomTree);

  needDiffRef.value = false;
}

function makeVdomResolver({
  tag,
  props,
  children,
}: {
  tag: TagFunction;
  props: Props;
  children: WDom[];
}) {
  const resolve = (stateKey = Symbol(tag.name)) => {
    initMountHookState(stateKey);

    const componentMaker = tag(props, children);
    const customNode = makeCustomNode({
      componentMaker,
      stateKey,
      tag,
      props,
      children,
    });

    const originalVdom = customNode;

    setRedrawAction(stateKey, () => {
      reRenderCustomComponent({ tag, props, children, originalVdom });
    });

    return customNode;
  };

  resolve.tagName = tag.name;
  resolve.props = props;

  return resolve;
}

function makeCustomNode({
  componentMaker,
  stateKey,
  tag,
  props,
  children,
}: {
  componentMaker: () => WDom;
  stateKey: symbol;
  tag: TagFunction;
  props: Props;
  children: WDom[];
}) {
  const customNode = componentMaker();
  const reRender = makeReRender({
    componentMaker,
    stateKey,
    tag,
    props,
    children,
  });

  customNode.componentProps = props;
  customNode.reRender = reRender;
  customNode.tagName = tag.name;
  customNode.stateKey = stateKey;

  return customNode;
}

function makeReRender({
  componentMaker,
  stateKey,
  tag,
  props,
  children,
}: {
  componentMaker: () => WDom;
  stateKey: symbol;
  tag: TagFunction;
  props: Props;
  children: WDom[];
}) {
  const reRender = () =>
    vdomMaker({ componentMaker, stateKey, tag, props, children, reRender });

  return reRender;
}

function vdomMaker({
  componentMaker,
  stateKey,
  tag,
  props,
  children,
  reRender,
}: {
  componentMaker: () => WDom;
  stateKey: symbol;
  tag: TagFunction;
  props: Props;
  children: WDom[];
  reRender: () => WDom;
}) {
  initUpdateHookState(stateKey);

  const vdom = componentMaker();

  setRedrawAction(stateKey, () => {
    reRenderCustomComponent({ tag, props, children, originalVdom: vdom });
  });

  vdom.componentProps = props;
  vdom.reRender = reRender;
  vdom.tagName = tag.name;
  vdom.stateKey = stateKey;

  return vdom;
}

function makeNode({
  tag,
  props,
  children,
}: {
  tag: TagFunction | FragmentFunction | string;
  props: Props;
  children: WDom[];
}) {
  if (checkFragmentFunction(tag)) {
    return Fragment(...children);
  } else if (checkCustemComponentFunction(tag)) {
    const componetMakeResolver = makeVdomResolver({ tag, props, children });

    return needDiffRef.value ? componetMakeResolver : componetMakeResolver();
  }

  return { type: 'element', tag, props, children };
}

function remakeChildren(
  nodePointer: NodePointer,
  children: MiddleStateVDomChildren
): WDom[] {
  return children.map((item: MiddleStateVDom) => {
    const childItem = makeChildrenItem(item);

    childItem.getParent = () => nodePointer.value;

    return childItem;
  });
}

function makeChildrenItem(item: MiddleStateVDom): WDom {
  if (item === null || item === undefined || item === false) {
    return { type: null };
  } else if (Array.isArray(item)) {
    const nodePointer: NodePointer = { value: {} };
    const children = remakeChildren(nodePointer, item);
    const node = { type: 'loop', children };
    nodePointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 'text', text: item };
  }

  return item;
}

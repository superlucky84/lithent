import makeNewVdomTree from './diff';
import { vDomUpdate } from './render';
import { redrawActionMap, needDiff } from '@/helper/universalRef';
import {
  initUpdateHookState,
  initMountHookState,
} from '@/helper/universalRefHelper';

import { isExisty } from '@/helper/predicator';

export function Fragment({ props, children }) {
  return { type: 'fragment', props, children };
}

export function h(tag, props, ...children) {
  const nodePointer = { value: null };
  const newProps = props || {};
  const newChildren = remakeChildren(nodePointer, children);
  const node = makeNode({ tag, props: newProps, children: newChildren });
  // console.log(newProps, node);

  nodePointer.value = node;

  return node;
}

function reRenderCustomComponent({ tag, props, children, originalVdom }) {
  needDiff.value = true;

  const newVdom = makeVdomResolver({ tag, props, children });
  const newVdomTree = makeNewVdomTree({ originalVdom, newVdom });
  newVdomTree.getParent = originalVdom.getParent;

  if (!originalVdom.isRoot) {
    const brothers = originalVdom.getParent().children;
    const index = brothers.indexOf(originalVdom);

    brothers.splice(index, 1, newVdomTree);
  } else {
    newVdomTree.isRoot = true;
  }

  vDomUpdate(newVdomTree);

  needDiff.value = false;
}

function makeVdomResolver({ tag, props, children }) {
  const resolve = (stateKey = Symbol(tag.name)) => {
    initMountHookState(stateKey);

    const componentMaker = tag({ props, children });
    const customNode = makeCustomNode({
      componentMaker,
      stateKey,
      tag,
      props,
      children,
    });

    const originalVdom = customNode;

    redrawActionMap[stateKey] = () => {
      reRenderCustomComponent({ tag, props, children, originalVdom, stateKey });
    };

    return customNode;
  };

  resolve.tagName = tag.name;
  resolve.props = props;

  return resolve;
}

function makeCustomNode({ componentMaker, stateKey, tag, props, children }) {
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

function makeReRender({ componentMaker, stateKey, tag, props, children }) {
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
}) {
  initUpdateHookState(stateKey);

  const vdom = componentMaker();

  redrawActionMap[stateKey] = () => {
    reRenderCustomComponent({
      tag,
      props,
      children,
      originalVdom: vdom,
      stateKey,
    });
  };

  vdom.componentProps = props;
  vdom.reRender = reRender;
  vdom.tagName = tag.name;
  vdom.stateKey = stateKey;

  return vdom;
}

function makeNode({ tag, props, children }) {
  const isFragment = typeof tag === 'function' && tag.name === 'Fragment';
  const isCustemComponent =
    typeof tag === 'function' && tag.name !== 'Fragment';

  if (isFragment) {
    return Fragment({ props, children });
  } else if (isCustemComponent) {
    const componetMakeResolver = makeVdomResolver({ tag, props, children });

    return needDiff.value ? componetMakeResolver : componetMakeResolver();
  }

  return { type: 'element', tag, props, children };
}

function remakeChildren(nodePointer, children) {
  return children.map(item => {
    const childItem = makeChildrenItem({ item });

    childItem.getParent = () => nodePointer.value;

    return childItem;
  });
}

function makeChildrenItem({ item }) {
  if (!isExisty(item) || item === false) {
    return { type: null };
  } else if (Array.isArray(item)) {
    const nodePointer = { value: null };
    const children = remakeChildren(nodePointer, item);
    const node = { type: 'loop', children };
    nodePointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 'text', text: item };
  }

  return item;
}

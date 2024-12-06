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

/**
 * 여러 요소를 그룹화 할수 있게 해준다.
 */
export const Fragment = (_props: Props, ...children: WDom[]) =>
  ({
    type: 'fragment',
    [wdomSymbol]: true,
    children,
  }) as WDom;

/**
 * 엘리먼트 생성 (createElement)
 */
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

/**
 * 포털을 가능하게 해준다.
 */
export const portal = (wDom: WDom, portal: HTMLElement) => {
  return h('portal', { portal }, wDom);
};

/**
 * 컴포넌트 생성을 도와준다
 */
export const mount =
  <T>(component: Component<T>) =>
  (_props: T, _children?: MiddleStateWDomChildren) =>
    component;

/**
 * 특정 컴포넌트부터 새로 그려준다.
 */
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

/**
 * 가상돔을 리랜더링 할때 기존 가상돔과 diff를 위한 중간단계 생성
 */
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

/**
 * 컴포넌트로 부터 실제 가상돔 노드를 만든다.
 */
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

/**
 * 컴포넌트로 부터 실제로 가상돔이 만들어질때, 추후 다시그리기 위한 리랜더 메서드 생성
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
 * 리렌더 메서드로 부터 다시그리기 위한 시작점
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

/**
 * 커스텀 컴포넌트 노드를만들때 가상돔 객체에 기타 정보 속성을 붙여준다
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

  setRedrawAction(compKey, () =>
    reRenderCustomComponent(tag, props, children, wDom)
  );

  if (getComponentSubInfo(compKey, 'vd')) {
    (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = wDom;
  }
};

/**
 * h 함수로 부터 가상돔이 만들어지는 시작점
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
    type: 'element',
    [wdomSymbol]: true,
    tag,
    props,
    children,
  } as WDom;
};

/**
 * 가상돔의 자식 가상돔들을 재귀 처리해주는 시작점
 */
const remakeChildren = (
  nodeParentPointer: NodePointer,
  children: MiddleStateWDomChildren
): WDom[] =>
  children.map((item: MiddleStateWDom) =>
    assign(makeChildrenItem(item), { getParent: () => nodeParentPointer.value })
  );

/**
 * 가상돔의 자식 가상돔들을 재귀 처리
 */
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

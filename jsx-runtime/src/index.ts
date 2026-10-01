import { h, Fragment } from 'lithent';
import type {
  Props,
  TagFunction,
  FragmentFunction,
  MiddleStateWDomChildren,
} from 'lithent';

function createWNode(
  type: TagFunction | FragmentFunction | string,
  orgProps: Props,
  key: unknown,
  isStaticChildren: boolean,
  _source: unknown,
  _self: unknown
) {
  const { children, ...props } = orgProps;
  if (children !== null && children !== undefined) {
    // A dynamic array is one keyed loop child of h(). Only jsxs/JSXDEV's
    // static siblings may be spread; flattening a loop loses key matching.
    const newChildren: MiddleStateWDomChildren =
      isStaticChildren && Array.isArray(children) ? children : [children];

    return h(type, { ...props, key } as Props, ...newChildren);
  }

  return h(type, { ...props, key } as Props);
}

function createStaticWNode(
  type: TagFunction | FragmentFunction | string,
  orgProps: Props,
  key: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown
) {
  return createWNode(type, orgProps, key, true, undefined, undefined);
}

export {
  createWNode as jsx,
  createStaticWNode as jsxs,
  createWNode as jsxDEV,
  Fragment,
};

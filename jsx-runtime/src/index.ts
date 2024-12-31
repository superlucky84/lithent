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
  key: any,
  _isStaticChildren: boolean,
  _source: any,
  _self: any
) {
  const { children, ...props } = orgProps;
  const newChildren: MiddleStateWDomChildren = !Array.isArray(children)
    ? [children]
    : children;

  return h(type, { ...props, key } as Props, ...newChildren);
}

export {
  createWNode as jsx,
  createWNode as jsxs,
  createWNode as jsxDEV,
  Fragment,
};

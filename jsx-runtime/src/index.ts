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
  _isStaticChildren: boolean,
  _source: unknown,
  _self: unknown
) {
  const { children, ...props } = orgProps;
  if (children !== null && children !== undefined) {
    const newChildren: MiddleStateWDomChildren = !Array.isArray(children)
      ? [children]
      : children;

    return h(type, { ...props, key } as Props, ...newChildren);
  }

  return h(type, { ...props, key } as Props);
}

export {
  createWNode as jsx,
  createWNode as jsxs,
  createWNode as jsxDEV,
  Fragment,
};

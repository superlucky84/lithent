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
  const nodeProps = { ...props, key };
  if (children !== null && children !== undefined) {
    // A dynamic array is one keyed loop child of h(). Only jsxs/JSXDEV's
    // static siblings may be spread; flattening a loop loses key matching.
    const newChildren: MiddleStateWDomChildren =
      isStaticChildren && Array.isArray(children) ? children : [children];

    return h(type, nodeProps, ...newChildren);
  }

  // Keep the slot in <div>{photo && <img />}</div> when photo is nullish.
  if (
    typeof type === 'string' &&
    Object.prototype.hasOwnProperty.call(orgProps, 'children')
  ) {
    return h(type, nodeProps, null);
  }
  return h(type, nodeProps);
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

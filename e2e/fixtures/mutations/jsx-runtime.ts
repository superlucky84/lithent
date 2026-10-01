// Deliberately reproduce the old adapter bug, only for the negative control.
import { h, Fragment } from 'lithent';
import type { Props, TagFunction, FragmentFunction } from 'lithent';

function flattened(
  type: TagFunction | FragmentFunction | string,
  original: Props,
  key: unknown
) {
  const { children, ...props } = original;
  if (children === null || children === undefined)
    return h(type, { ...props, key } as Props);
  return h(
    type,
    { ...props, key } as Props,
    ...(Array.isArray(children) ? children : [children])
  );
}

export { flattened as jsx, flattened as jsxs, flattened as jsxDEV, Fragment };

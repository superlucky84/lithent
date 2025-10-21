import type { WDom } from 'lithent';

/**
 * Unwrap children from Fragment wrapper
 *
 * @param children - Children array that may be wrapped in Fragment
 * @returns
 * - If single child: returns the child directly
 * - If multiple children: returns unwrapped array
 * - Handles Fragment wrapping transparently
 *
 * @example
 * ```tsx
 * const MyComponent = mount((renew, props, children) => {
 *   const child = unwrapChildren(children);
 *
 *   // Single child: child is WDom
 *   if (typeof child === 'function') {
 *     return child(data); // render props
 *   }
 *
 *   // Multiple children: child is WDom[]
 *   if (Array.isArray(child)) {
 *     return <div>{child}</div>;
 *   }
 *
 *   return <div>{child}</div>;
 * });
 * ```
 */
export const unwrapChildren = (children: WDom[]): WDom | WDom[] => {
  // Empty children
  if (!children || children.length === 0) {
    return [];
  }

  // Check if wrapped in Fragment
  const firstChild = children[0];
  const isWrappedInFragment = children.length === 1 && firstChild?.type === 'f';

  if (isWrappedInFragment) {
    const fragmentChildren = firstChild.children || [];

    // Single child in Fragment: return directly
    if (fragmentChildren.length === 1) {
      return fragmentChildren[0];
    }

    // Multiple children in Fragment: return array
    return fragmentChildren;
  }

  // Not wrapped in Fragment
  if (children.length === 1) {
    return children[0];
  }

  return children;
};

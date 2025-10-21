import type { PropChildren, PropSingleChild } from '@/utils/types';

/**
 * Expose prop children as the original value when only one child exists.
 * Falls back to the original array (or undefined) in every other case.
 */
export const unwrapChildren = <T = unknown>(
  children: PropChildren<T> | undefined
): PropSingleChild<T> | PropChildren<T> | undefined => {
  if (!children || children.length === 0) {
    return undefined;
  }

  return children.length === 1 ? children[0] : children;
};

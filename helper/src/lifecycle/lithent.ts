import { mountCallback } from 'lithent';
import { createOwnerScope } from './scope';
import type { CleanupErrorReporter, OwnerScope } from './scope';

/** Call once in a mounter; start external work in mountCallback or events. */
export const useOwnerScope = (
  reportCleanupError: CleanupErrorReporter = error => console.error(error)
): OwnerScope => {
  const scope = createOwnerScope();
  mountCallback(() => () => {
    try {
      scope.dispose();
    } catch (error) {
      // Keep this component's failure from interrupting other core cleanups.
      // A custom reporter must not throw.
      reportCleanupError(error);
    }
  });
  return scope;
};

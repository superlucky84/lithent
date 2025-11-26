import { Renew } from '@/types';
import { getComponentKey } from '@/utils/universalRef';
import { componentUpdate } from '@/utils/redraw';

/**
 * Hook to get the renew (component update) function.
 * Useful for lmount components that need to trigger updates.
 */
export const useRenew = (): Renew => {
  const compKey = getComponentKey();

  if (!compKey) {
    throw new Error('useRenew must be called inside a component');
  }

  return componentUpdate(compKey);
};

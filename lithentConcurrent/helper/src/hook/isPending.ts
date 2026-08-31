import { getComponentKey, hasPending } from 'lithent-concurrent';
import type { Computed } from '@/types';

/**
 * Whether this component has a low-priority render waiting (RC-3).
 *
 * Call it in the mounter: the component key is captured there, the same way
 * `useRenew` captures it, so the result stays bound to this component instance
 * rather than to whichever component happens to be rendering.
 *
 * Reading `.value` does not by itself cause a re-render — nothing here is
 * reactive. A pending indicator therefore has to live somewhere that renders at
 * sync priority: a parent or sibling driven by ordinary `state`/`lstate`, with
 * the heavy work behind `deferred`/`ldeferred`.
 */
export const isPending = (): Computed<boolean> => {
  const compKey = getComponentKey();
  const read = () => (compKey ? hasPending(compKey, 'low') : false);

  return {
    get value() {
      return read();
    },
    get v() {
      return read();
    },
  };
};

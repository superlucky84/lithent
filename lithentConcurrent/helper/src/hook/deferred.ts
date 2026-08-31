import { startTransition } from 'lithent-concurrent';
import type { State } from '@/types';

/**
 * `state` at low priority — the render it triggers waits for an idle slice.
 *
 * NOTE: this defers the RENDER, not the value. The value lives in the
 * component's closure and is written straight away, so a render that happens at
 * sync priority in the meantime shows the new value. Deferring the value too
 * would need a per-lane copy of it, which the closure model rules out.
 */
export const deferred = <T>(value: T, renew: () => boolean): State<T> => {
  let result = value;

  return {
    get value() {
      return result;
    },
    get v() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      startTransition(renew);
    },
    set v(newValue: T) {
      result = newValue;
      startTransition(renew);
    },
  };
};

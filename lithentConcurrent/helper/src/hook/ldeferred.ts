import { useRenew, startTransition } from 'lithent-concurrent';
import type { State } from '@/types';

/**
 * `lstate` at low priority. See `deferred` for what "deferred" does and does
 * not cover.
 */
export const ldeferred = <T>(value: T): State<T> => {
  let result = value;
  const renew = useRenew();

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

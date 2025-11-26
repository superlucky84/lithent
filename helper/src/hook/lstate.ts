import { useRenew } from 'lithent';

export type State<T> = {
  value: T;
  v: T;
};

export const lstate = <T>(value: T): State<T> => {
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
      renew();
    },
    set v(newValue: T) {
      result = newValue;
      renew();
    },
  };
};

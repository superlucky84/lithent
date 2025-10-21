export type State<T> = {
  value: T;
  v: T;
};

export const state = <T>(value: T, renew: () => boolean): State<T> => {
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
      renew();
    },
    set v(newValue: T) {
      result = newValue;
      renew();
    },
  };
};

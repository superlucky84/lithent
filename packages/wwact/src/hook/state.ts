import { componentKeyRef, componentRender } from '@/helper/universalRef';

export const state = <T>(
  value: T
): {
  value: T;
  val: T;
  v: T;
  set: (newValue: T) => void;
  s: (newValue: T) => void;
} => {
  const componentKey = componentKeyRef.value;
  let result = value;

  return {
    get value() {
      return result;
    },
    get val() {
      return result;
    },
    get v() {
      return result;
    },
    set(newValue: T) {
      result = newValue;
      componentRender(componentKey)();
    },
    s(newValue: T) {
      result = newValue;
      componentRender(componentKey)();
    },
  };
};

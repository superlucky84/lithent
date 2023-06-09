import { ext } from 'wwact';
const { componentKeyRef, componentRender } = ext;

export const state2 = <T>(
  value: T
): { value: T; val: T; v: T; set: (newValue: T) => void } => {
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
  };

  /*
  return [
    () => result,
    (value: T) => {
      result = value;
      componentRender(componentKey)();
    },
  ];
  */
};

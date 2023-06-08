import { componentKeyRef, componentRender } from '@/helper/universalRef';

export const state = <T>(value: T): [() => T, (setValue: T) => void] => {
  const componentKey = componentKeyRef.value;
  let result = value;

  return [
    () => result,
    (value: T) => {
      result = value;
      componentRender(componentKey)();
    },
  ];
};

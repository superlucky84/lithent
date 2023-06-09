import { UseDataStoreValue } from '@/types';
import { componentKeyRef, componentRender } from '@/helper/universalRef';

export const localStore = <T extends {}>(initValue: T) => {
  const componentKey = componentKeyRef.value;

  return updater<T>({
    initValue,
    render: () => componentRender(componentKey)(),
  });
};

export const updater = <T extends UseDataStoreValue>({
  initValue,
  render,
}: {
  initValue: T;
  render: () => void;
}) =>
  new Proxy(initValue, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      render();

      return true;
    },
  });

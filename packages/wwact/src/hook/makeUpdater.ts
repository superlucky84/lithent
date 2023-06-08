import { UseDataStoreValue } from '@/types';
import { ext } from 'wwact';

const { componentRef, componentKeyRef } = ext;

export const makeUpdater = <T extends {}>(initValue: T) => {
  const componentKey = componentKeyRef.value;

  return updater<T>({
    initValue,
    render: () => (componentRef.get(componentKey)!.up || (() => {}))(),
  });
};

function updater<T extends UseDataStoreValue>({
  initValue,
  render,
}: {
  initValue: T;
  render: () => void;
}) {
  return new Proxy(initValue, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      render();

      return true;
    },
  });
}

import { UseDataStoreValue, Renew } from '@/types';

export const store = <T extends {}>(initValue: T, renew: Renew) => {
  return updater<T>({
    initValue,
    renew,
  });
};

export const updater = <T extends UseDataStoreValue>({
  initValue,
  renew,
}: {
  initValue: T;
  renew: () => void;
}) =>
  new Proxy(initValue, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      renew();

      return true;
    },
  });

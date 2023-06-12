import { UseDataStoreValue, Renew } from '@/types';
import { ext } from 'wwact';
const { dataStoreStore, dataStoreRenderQueue, checkFunction } = ext;

export const protectedStore = <T extends {}>(
  storeKey: string,
  renew: Renew
) => {
  const dataValue = dataStoreStore[storeKey] as T;

  if (!dataValue) {
    throw new Error('Data store not exist');
  }

  const dataStoreQueue = dataStoreRenderQueue;

  dataStoreQueue[storeKey] ??= [];
  dataStoreQueue[storeKey].push(renew);

  return dataValue;
};

export const makeProtectedStore = <T extends {}>(
  storeKey: string,
  initValue: T
) => {
  if (!dataStoreStore[storeKey]) {
    dataStoreStore[storeKey] = makeProxyData<T>({ storeKey, initValue });
  }

  return dataStoreStore[storeKey];
};

const makeProxyData = <T extends UseDataStoreValue>({
  storeKey,
  initValue,
}: {
  storeKey: string;
  initValue: T;
}) => {
  const proxy = new Proxy<T>(initValue, {
    get(target, prop) {
      const value = target[prop];

      if (checkFunction(value)) {
        return (...args: unknown[]) => {
          (value as Function).call(proxy, ...args);
        };
      }
      return value;
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;

      const dataStoreQueue = dataStoreRenderQueue[storeKey];
      const trashCollections: (() => boolean)[] = [];

      dataStoreQueue.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      trashCollections.forEach(deleteTarget =>
        dataStoreQueue.splice(dataStoreQueue.indexOf(deleteTarget), 1)
      );

      return true;
    },
  });

  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        const methodValue = proxy[prop];

        if (checkFunction(methodValue)) {
          return (...args: unknown[]) => (methodValue as Function)(...args);
        }

        return proxy[prop];
      },
      set() {
        return false;
      },
    }
  );
};

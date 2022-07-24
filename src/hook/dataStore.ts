import { UseDataStoreValue } from '@/types';
import { checkFunction } from '@/types/predicator';
import {
  stateKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  componentRef,
} from '@/helper/universalRef';

export function useDataStore<T extends {}>(storeKey: string) {
  const stateKey = stateKeyRef.value;
  const dataValue = dataStoreStore[storeKey] as T;

  if (!dataValue) {
    console.warn('Data store not exist');
  }

  const dataStoreQueue = dataStoreRenderQueue;

  dataStoreQueue[storeKey] ??= [];
  dataStoreQueue[storeKey].push(() => componentRef[stateKey]?.redrawAction);

  return dataValue;
}

export function makeDataStore<T extends {}>(storeKey: string, initValue: T) {
  if (!dataStoreStore[storeKey]) {
    dataStoreStore[storeKey] = makeProxyData<T>({
      storeKey,
      initValue,
    });
  }

  return dataStoreStore[storeKey];
}

function makeProxyData<T extends UseDataStoreValue>({
  storeKey,
  initValue,
}: {
  storeKey: string;
  initValue: T;
}) {
  const proxy = new Proxy<T>(initValue, {
    get(target, prop) {
      const value = target[prop];

      if (checkFunction(value)) {
        return function (...args: unknown[]) {
          (value as Function).call(proxy, ...args);
        };
      }
      return value;
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;

      const dataStoreQueue = dataStoreRenderQueue[storeKey];
      const trashCollections: (() => undefined)[] = [];

      dataStoreQueue.forEach(makeRender => {
        const render = makeRender();
        if (render) {
          render();
        } else {
          trashCollections.push(makeRender);
        }
      });

      trashCollections.forEach(deleteTarget => {
        dataStoreQueue.splice(dataStoreQueue.indexOf(deleteTarget), 1);
      });

      return true;
    },
  });

  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        const methodValue = proxy[prop];

        if (checkFunction(methodValue)) {
          return function (...args: unknown[]) {
            (methodValue as Function)(...args);
          };
        }
        return proxy[prop];
      },
      set() {
        return false;
      },
    }
  );
}

import { checkFunction } from '@/types/predicator';
import {
  stateKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  componentRef,
} from '@/helper/universalRef';

export function useDataStore(storeKey: string) {
  const stateKey = stateKeyRef.value;
  const dataValue = dataStoreStore[storeKey];

  if (!dataValue) {
    console.warn('Data store not exist');
  }

  const dataStoreQueue = dataStoreRenderQueue;

  dataStoreQueue[storeKey] ??= [];
  dataStoreQueue[storeKey].push(() => componentRef[stateKey]?.redrawAction);

  return dataValue || {};
}

export function makeDataStore(
  storeKey: string,
  initValue: {[key: string]: unknown},
) {
  if (!dataStoreStore[storeKey]) {
    dataStoreStore[storeKey] = makeProxyData({
      storeKey,
      initValue,
    });
  }

  return dataStoreStore[storeKey];
}

function makeProxyData({
  storeKey,
  initValue,
}: {
  storeKey: string;
  initValue: {[key: string]: unknown};
}) {
  const proxy = new Proxy(initValue, {
    get(target, prop: string) {
      const value = target[prop];

      if (checkFunction(value)) {
        return function (...args: unknown[]) {
          (value as Function).call(proxy, ...args);
        };
      }
      return value;
    },
    set(target, prop: string, value) {
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

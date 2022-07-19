import {
  stateKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  componentRef,
} from '@/helper/universalRef';

export function useDataStore(storeKey) {
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

export function makeDataStore(storeKey, initValue) {
  if (!dataStoreStore[storeKey]) {
    dataStoreStore[storeKey] = makeProxyData({
      storeKey,
      initValue,
    });
  }

  return dataStoreStore[storeKey];
}

function makeProxyData({ storeKey, initValue }) {
  const proxy = new Proxy(initValue, {
    get(target, prop) {
      const value = target[prop];

      if (typeof value === 'function') {
        return function (...args) {
          value.call(proxy, ...args);
        };
      }
      return value;
    },
    set(target, prop, value) {
      target[prop] = value;

      const dataStoreQueue = dataStoreRenderQueue[storeKey];
      const trashCollections = [];

      dataStoreQueue.forEach((makeRender, index) => {
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
      get(target, prop) {
        const methodValue = proxy[prop];

        if (typeof methodValue === 'function') {
          return function (...args) {
            methodValue(...args);
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

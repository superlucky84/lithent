import {
  stateKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  redrawActionMap,
} from '@/util/universalRef';

export function useDataStore(storeKey) {
  const stateKey = stateKeyRef.value;
  const dataValue = dataStoreStore.value[storeKey];

  if (!dataValue) {
    console.warn('Data store not exist');
  }

  const dataStoreQueue = dataStoreRenderQueue.value;

  dataStoreQueue[storeKey] ??= [];
  dataStoreQueue[storeKey].push(() => redrawActionMap[stateKey]);

  return dataValue || {};
}

export function makeDataStore(storeKey, initValue) {
  if (!dataStoreStore.value[storeKey]) {
    dataStoreStore.value[storeKey] = makeProxyData({
      storeKey,
      initValue,
    });
  }

  return dataStoreStore.value[storeKey];
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

      const dataStoreQueue = dataStoreRenderQueue.value[storeKey];
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

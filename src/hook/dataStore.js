import {
  stateKeyRef,
  dataStoreCallSeq,
  dataStoreStore,
  dataStoreRenderQueue,
  redrawActionMap,
} from '@/util';

export function useDataStore(storeKey) {
  const stateKey = stateKeyRef.value;
  const dataValue = dataStoreStore.value[storeKey];

  if (!dataValue) {
    console.warn('Data store not exist');
  }

  const dataStoreQueue = dataStoreRenderQueue.value;

  dataStoreQueue[storeKey] ??= [];
  dataStoreQueue[storeKey].push(() => redrawActionMap[stateKey]());

  return dataValue || {};
}

export function makeDataStore(storeKey, initValue) {
  if (!dataStoreStore.value[storeKey]) {
    dataStoreStore.value[storeKey] = makeProxyData(storeKey, initValue);
  }

  return dataStoreStore.value[storeKey];
}

function makeProxyData(storeKey, initValue) {
  return new Proxy(initValue, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;

      const dataStoreQueue = dataStoreRenderQueue.value[storeKey];

      dataStoreQueue.reverse().forEach(render => {
        render();
      });

      return true;
    },
  });
}

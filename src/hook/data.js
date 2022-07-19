import {
  dataStore,
  stateKeyRef,
  dataCallSeq,
  redrawActionMap,
} from '@/util/universalRef';

export default function useData(initValue) {
  const sKey = stateKeyRef.value;
  const state = makeData({
    initValue,
    dataCallSeq: dataCallSeq.value,
    stateKey: sKey,
    render: () => redrawActionMap[sKey](),
  });

  dataCallSeq.value += 1;

  return state;
}

function makeData({ initValue, stateKey, dataCallSeq, render }) {
  const currentSubSeq = dataCallSeq;

  if (!dataStore.value[stateKey] || !dataStore.value[stateKey][currentSubSeq]) {
    dataStore.value[stateKey] ??= {};
    dataStore.value[stateKey][currentSubSeq] = makeProxyData(initValue, render);
  }

  return dataStore.value[stateKey][currentSubSeq];
}

function makeProxyData(initValue, render) {
  return new Proxy(initValue, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      render();

      return true;
    },
  });
}

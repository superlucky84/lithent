import { dataStore, stateKeyRef, stateCallSeq, redrawActionMap } from '@/hook';

export default function useData(initValue) {
  const sKey = stateKeyRef.value;
  const state = makeData({
    initValue,
    stateCallSeq: stateCallSeq.value,
    stateKey: sKey,
    render: () => redrawActionMap[sKey](),
  });

  stateCallSeq.value += 1;

  return state;
}

function makeData({ initValue, stateKey, stateCallSeq, render }) {
  const currentSubSeq = stateCallSeq;

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

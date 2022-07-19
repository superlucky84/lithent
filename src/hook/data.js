import {
  dataStore,
  componentRef,
  stateKeyRef,
  dataCallSeq,
  setDataStore,
} from '@/helper/universalRef';

export default function useData(initValue) {
  const stateKey = stateKeyRef.value;
  const state = makeData({
    initValue,
    dataCallSeq: dataCallSeq.value,
    stateKey,
    render: () => componentRef[stateKey].redrawAction(),
  });

  dataCallSeq.value += 1;

  return state;
}

function makeData({ initValue, stateKey, dataCallSeq, render }) {
  const currentSubSeq = dataCallSeq;

  if (
    !componentRef[stateKey]?.dataStore ||
    !componentRef[stateKey]?.dataStore[currentSubSeq]
  ) {
    setDataStore(stateKey, dataCallSeq, makeProxyData(initValue, render));
  }

  return componentRef[stateKey].dataStore[currentSubSeq];
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

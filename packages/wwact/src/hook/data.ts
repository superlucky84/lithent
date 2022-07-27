import {
  componentRef,
  stateKeyRef,
  dataCallSeq,
  setDataStore,
} from '@/helper/universalRef';

type InitValue = { [key: string]: unknown };

export default function useData<T>(initValue: InitValue) {
  const stateKey = stateKeyRef.value;
  const state = makeData({
    initValue,
    dataCallSeq: dataCallSeq.value,
    stateKey,
    render: () => (componentRef[stateKey].redrawAction || (() => {}))(),
  });

  dataCallSeq.value += 1;

  return state as T;
}

function makeData({
  initValue,
  stateKey,
  dataCallSeq,
  render,
}: {
  initValue: InitValue;
  stateKey: symbol;
  dataCallSeq: number;
  render: () => void;
}) {
  const currentSubSeq = dataCallSeq;
  const dataStore = componentRef[stateKey]?.dataStore;

  if (!dataStore || !dataStore[currentSubSeq]) {
    setDataStore(stateKey, makeProxyData(initValue, render));
  }

  const checkedDataStore = componentRef[stateKey]?.dataStore;

  return checkedDataStore && checkedDataStore[currentSubSeq];
}

function makeProxyData(initValue: InitValue, render: () => void) {
  return new Proxy(initValue, {
    get(target, prop: string) {
      return target[prop];
    },
    set(target, prop: string, value) {
      target[prop] = value;
      render();

      return true;
    },
  });
}

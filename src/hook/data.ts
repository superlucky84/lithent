import {
  componentRef,
  stateKeyRef,
  dataCallSeq,
  setDataStore,
} from '@/helper/universalRef';

type InitValue = { [key: string]: unknown };

export default function useData(initValue: InitValue) {
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

function makeData({
  initValue,
  stateKey,
  dataCallSeq,
  render,
}: {
  initValue: InitValue;
  stateKey: symbol;
  dataCallSeq: number;
  render: any;
}) {
  const currentSubSeq = dataCallSeq;

  if (
    !componentRef[stateKey]?.dataStore ||
    !componentRef[stateKey]?.dataStore[currentSubSeq]
  ) {
    setDataStore(stateKey, makeProxyData(initValue, render));
  }

  return componentRef[stateKey].dataStore[currentSubSeq];
}

function makeProxyData(initValue: InitValue, render: any) {
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

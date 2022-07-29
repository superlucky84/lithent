import {
  componentRef,
  setRefStore,
  stateKeyRef,
  refCallSeq,
} from '@/helper/universalRef';

export default function makeRef<T>(initValue: T) {
  const stateKey = stateKeyRef.value;

  const state = ref<T>({
    initValue,
    refCallSeq: refCallSeq.value,
    stateKey,
  });

  refCallSeq.value += 1;

  return state as { value: T };
}

function ref<T>({
  initValue,
  stateKey,
  refCallSeq,
}: {
  initValue: T;
  stateKey: symbol;
  refCallSeq: number;
}) {
  const currentSubSeq = refCallSeq;
  const dataStore = componentRef[stateKey]?.refStore;

  if (!dataStore || !dataStore[currentSubSeq]) {
    setRefStore(stateKey, { value: initValue });
  }

  const checkedRefStore = componentRef[stateKey]?.refStore;

  return checkedRefStore && checkedRefStore[currentSubSeq];
}

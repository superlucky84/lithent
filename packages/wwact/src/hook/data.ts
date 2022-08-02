import { UseDataStoreValue } from '@/types';
import { componentRef, stateKeyRef } from '@/helper/universalRef';

export default function useData<T extends {}>(initValue: T) {
  const stateKey = stateKeyRef.value;
  const state = makeData<T>({
    initValue,
    render: () => (componentRef[stateKey].redrawAction || (() => {}))(),
  });

  return state;
}

function makeData<T extends {}>({
  initValue,
  render,
}: {
  initValue: T;
  render: () => void;
}) {
  return makeProxyData<T>(initValue, render);
}

function makeProxyData<T extends UseDataStoreValue>(
  initValue: T,
  render: () => void
) {
  return new Proxy(initValue, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      render();

      return true;
    },
  });
}

import { UseDataStoreValue } from '@/types';
import { componentRef, componentKeyRef } from '@/helper/universalRef';

export default function useUpdater<T extends {}>(initValue: T) {
  const componentKey = componentKeyRef.value;
  const state = updater<T>({
    initValue,
    render: () =>
      (componentRef.get(componentKey)!.redrawAction || (() => {}))(),
  });

  return state;
}

function updater<T extends {}>({
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

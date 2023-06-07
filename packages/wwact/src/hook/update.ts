import {
  componentKeyRef,
  componentRef,
  makeUpdatedStore,
  redrawQueue,
  redrawQueueTimeout,
} from '@/helper/universalRef';

import useUpdated from '@/hook/useUpdate';

export default function update(
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) {
  const componentKey = componentKeyRef.value;

  let updateReservedList = componentRef.get(componentKey)
    ?.updateReservedList as (() => void)[];
  if (!updateReservedList) {
    makeUpdatedStore(componentKey);
    updateReservedList = [];
    componentRef.get(componentKey)!.updateReservedList ??= updateReservedList;
  }

  updateReservedList.push(() => {
    useUpdated(effectAction, dependencies);
  });

  useUpdated(effectAction, dependencies);
}

export function runUpdateCallback() {
  const componentKey = componentKeyRef.value;
  const updateReservedList = componentRef.get(componentKey)?.updateReservedList;

  if (updateReservedList && updateReservedList.length) {
    updateReservedList.forEach(callback => {
      callback();
    });
  }

  redrawQueue.value = [];
  redrawQueueTimeout.value = null;
}

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

  let updateReqs = componentRef.get(componentKey)?.updateReqs as (() => void)[];
  if (!updateReqs) {
    makeUpdatedStore(componentKey);
    updateReqs = [];
    componentRef.get(componentKey)!.updateReqs ??= updateReqs;
  }

  updateReqs.push(() => {
    useUpdated(effectAction, dependencies);
  });

  useUpdated(effectAction, dependencies);
}

export function runUpdateCallback() {
  const componentKey = componentKeyRef.value;
  const updateReqs = componentRef.get(componentKey)?.updateReqs;

  if (updateReqs && updateReqs.length) {
    updateReqs.forEach(callback => callback());
  }

  redrawQueue.value = [];
  redrawQueueTimeout.value = null;
}

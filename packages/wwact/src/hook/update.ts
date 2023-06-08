import {
  componentKeyRef,
  componentRef,
  redrawQueue,
  redrawQueueTimeout,
} from '@/helper/universalRef';

import { useUpdated } from '@/hook/useUpdate';

export const update = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const componentKey = componentKeyRef.value;
  const updateReqs = componentRef.get(componentKey)!.updateReqs;

  updateReqs.push(() => {
    useUpdated(effectAction, dependencies);
  });

  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const componentKey = componentKeyRef.value;
  const updateReqs = componentRef.get(componentKey)?.updateReqs;

  if (updateReqs && updateReqs.length) {
    updateReqs.forEach(callback => callback());
  }

  redrawQueue.value = [];
  redrawQueueTimeout.value = null;
};

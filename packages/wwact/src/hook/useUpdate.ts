import { WDom } from '@/types';
import {
  componentKeyRef,
  makeQueueRef,
  makeUpdatedStore,
  componentRef,
} from '@/helper/universalRef';

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);

  let updateDefs = component?.updateDefs as unknown[][];

  let updateSeq = component?.updateSeq as {
    value: number;
  };

  if (!updateDefs || !updateDefs[updateSeq.value]) {
    [updateSeq, updateDefs] = makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(updateDefs[updateSeq.value] || [], dependencies())
  ) {
    const callback = effectAction();
    if (callback) {
      makeQueueRef(componentKey, 'updateCallbacks').push(callback);
    }
  }
  updateDefs[updateSeq.value] = dependencies();
  updateSeq.value += 1;
};

export const runUpdatedQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;
  if (componentKey) {
    const component = componentRef.get(componentKey);
    const queue = component?.updateCallbacks;
    const sequence = component!.updateSeq;

    componentKeyRef.value = componentKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (newWDom.constructor && queue) {
      component.updateCallbacks = [];
      queue.forEach((effect: Function) => effect());
    }
  }
};

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) =>
  !originalDefs.length && !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

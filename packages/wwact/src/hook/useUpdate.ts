import { WDom } from '@/types';
import { componentKeyRef, componentRef } from '@/helper/universalRef';

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);

  let updateDefs = component!.updateDefs;
  let updateSeq = component!.updateSeq;

  if (checkNeedPushQueue(updateDefs[updateSeq.value] || [], dependencies())) {
    const callback = effectAction();
    if (callback) {
      component!.updateCallbacks.push(callback);
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

import { WDom } from '@/types';
import {
  componentKeyRef,
  makeQueueRef,
  makeUpdatedStore,
  componentRef,
} from '@/helper/universalRef';

const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);

  let updateDefs = component?.updateDefs as unknown[][];

  let updateSubscribeSequence = component?.updateSubscribeSequence as {
    value: number;
  };

  if (!updateDefs || !updateDefs[updateSubscribeSequence.value]) {
    [updateSubscribeSequence, updateDefs] = makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(
      updateDefs[updateSubscribeSequence.value] || [],
      dependencies()
    )
  ) {
    const callback = effectAction();
    if (callback) {
      makeQueueRef(componentKey, 'updateCallbacks').push(callback);
    }
  }
  updateDefs[updateSubscribeSequence.value] = dependencies();
  updateSubscribeSequence.value += 1;
};

export default useUpdated;

export const runUpdatedQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;
  if (componentKey) {
    const component = componentRef.get(componentKey);
    const queue = component?.updateCallbacks;
    const sequence = component!.updateSubscribeSequence;

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

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) => {
  if (!originalDefs.length && !originalDefs.length) {
    return true;
  }
  return originalDefs.some((def, index) => def !== newDefs[index]);
};

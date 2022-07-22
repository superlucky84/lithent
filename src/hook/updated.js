import {
  stateKeyRef,
  updatedCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function updated(effectAction, dependencies) {
  const currentSubSeq = updatedCallSeq.value;
  const stateKey = stateKeyRef.value;

  if (
    !componentRef[stateKey]?.updatedStore ||
    !componentRef[stateKey]?.updatedStore[currentSubSeq]
  ) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].updatedStore ??= [];
    componentRef[stateKey].updatedQueue ??= [];
  } else if (
    checkNeedPushQueue(
      componentRef[stateKey].updatedStore[currentSubSeq],
      dependencies
    ) ||
    !dependencies
  ) {
    componentRef[stateKey].updatedQueue.push(effectAction);
  }

  componentRef[stateKey].updatedStore[currentSubSeq] = dependencies;
  updatedCallSeq.value += 1;
}

export function runUpdatedQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.updatedQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].updatedQueue = [];

    queue.forEach(effect => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs, newDefs) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

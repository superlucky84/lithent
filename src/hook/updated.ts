import { WDom } from '@/types';
import {
  stateKeyRef,
  updatedCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function updated(effectAction: Function, dependencies: unknown[]) {
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

export function runUpdatedQueueFromVdom(newVdom: WDom) {
  const queue = componentRef[newVdom.stateKey]?.updatedQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].updatedQueue = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

import { WDom } from '@/types';
import {
  componentKeyRef,
  updatedCallSeq,
  makeQueueRef,
  makeUpdatedStore,
  componentRef,
} from '@/helper/universalRef';

export default function updated(
  effectAction: () => void,
  dependencies: unknown[]
) {
  const currentSubSeq = updatedCallSeq.value;
  const componentKey = componentKeyRef.value;
  let updateSubscribeDefList =
    componentRef[componentKey]?.updateSubscribeDefList;

  if (!updateSubscribeDefList || !updateSubscribeDefList[currentSubSeq]) {
    updateSubscribeDefList = makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(updateSubscribeDefList[currentSubSeq], dependencies) ||
    !dependencies
  ) {
    makeQueueRef(componentKey, 'updateSubscribeList').push(effectAction);
  }

  updateSubscribeDefList[currentSubSeq] = dependencies;
  updatedCallSeq.value += 1;
}

export function runUpdatedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.componentKey) {
    return;
  }

  const queue = componentRef[newVdom.componentKey]?.updateSubscribeList;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.componentKey].updateSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

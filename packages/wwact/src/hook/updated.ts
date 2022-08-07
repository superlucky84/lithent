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

export function runUpdatedQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;
  if (!componentKey) {
    return;
  }

  const queue = componentRef[componentKey]?.updateSubscribeList;
  if (newWDom.tagName && queue) {
    componentRef[componentKey].updateSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

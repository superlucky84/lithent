import { WDom } from '@/types';
import {
  stateKeyRef,
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
  const stateKey = stateKeyRef.value;
  let updateSubscribeDefList = componentRef[stateKey]?.updateSubscribeDefList;

  if (!updateSubscribeDefList || !updateSubscribeDefList[currentSubSeq]) {
    updateSubscribeDefList = makeUpdatedStore(stateKey);
  } else if (
    checkNeedPushQueue(updateSubscribeDefList[currentSubSeq], dependencies) ||
    !dependencies
  ) {
    makeQueueRef(stateKey, 'updateSubscribeList').push(effectAction);
  }

  // Toto typescript의 영향으로 엉뚱한 코드가 생겼음 type guard를 이용해 개선 예정
  updateSubscribeDefList[currentSubSeq] = dependencies;
  updatedCallSeq.value += 1;
}

export function runUpdatedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }

  const queue = componentRef[newVdom.stateKey]?.updateSubscribeList;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].updateSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}
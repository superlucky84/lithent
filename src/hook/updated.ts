import { WDom } from '@/types';
import {
  stateKeyRef,
  updatedCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function updated(
  effectAction: () => void,
  dependencies: unknown[]
) {
  const currentSubSeq = updatedCallSeq.value;
  const stateKey = stateKeyRef.value;
  const updatedStore = componentRef[stateKey]?.updatedStore;

  if (!updatedStore || !updatedStore[currentSubSeq]) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].updatedStore ??= [];
    componentRef[stateKey].updatedQueue ??= [];
  } else if (
    checkNeedPushQueue(updatedStore[currentSubSeq], dependencies) ||
    !dependencies
  ) {
    const updateQueue = componentRef[stateKey].updatedQueue;
    // Toto typescript의 영향으로 엉뚱한 코드가 생겼음 type guard를 이용해 개선 예정
    (updateQueue || []).push(effectAction);
  }

  // Toto typescript의 영향으로 엉뚱한 코드가 생겼음 type guard를 이용해 개선 예정
  (updatedStore || [])[currentSubSeq] = dependencies;
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

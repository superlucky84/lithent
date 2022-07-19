import {
  stateKeyRef,
  updatedCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function updated(effectAction, dependencies) {
  const currentSubSeq = updatedCallSeq.value;
  const stateKey = stateKeyRef.value;

  // 업데이티드 훅이 실행되면 스토어에 저장해놓음
  // 스토어에 처음 등록되는 훅이라면 마운트라고 판단
  if (
    !componentRef[stateKey]?.updatedStore ||
    !componentRef[stateKey]?.updatedStore[currentSubSeq]
  ) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].updatedStore ??= {};
    componentRef[stateKey].updatedQueue ??= {};
  }
  // 이미 등록된 훅이 있다면 업데이트로 판단되므로 실행 queue에 추가 해야함
  else if (
    checkNeedPushQueue(
      componentRef[stateKey].updatedStore[currentSubSeq],
      dependencies
    ) ||
    !dependencies
  ) {
    componentRef[stateKey].updatedQueue[currentSubSeq] = effectAction;
  }

  componentRef[stateKey].updatedStore[currentSubSeq] = dependencies;
  updatedCallSeq.value += 1;
}

export function runUpdatedQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.updatedQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].updatedQueue = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs, newDefs) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

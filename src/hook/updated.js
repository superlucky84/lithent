import {
  stateKeyRef,
  updatedCallSeq,
  updatedQueue,
  updatedStore,
} from '@/util';

export default function updated(effectAction, dependencies) {
  const currentSubSeq = updatedCallSeq.value;
  const stateKey = stateKeyRef.value;

  // 업데이티드 훅이 실행되면 스토어에 저장해놓음
  // 스토어에 처음 등록되는 훅이라면 마운트라고 판단
  if (
    !updatedStore.value[stateKey] ||
    !updatedStore.value[stateKey][currentSubSeq]
  ) {
    updatedStore.value[stateKey] ??= {};
    updatedQueue.value[stateKey] ??= {};
  }
  // 이미 등록된 훅이 있다면 업데이트로 판단되므로 실행 queue에 추가 해야함
  else if (
    checkNeedPushQueue(
      updatedStore.value[stateKey][currentSubSeq],
      dependencies
    )
  ) {
    updatedQueue.value[stateKey][currentSubSeq] = effectAction;
  }

  updatedStore.value[stateKey][currentSubSeq] = dependencies;
  updatedCallSeq.value += 1;
}

export function runUpdatedQueueFromVdom(newVdom) {
  const queue = updatedQueue.value[newVdom.stateKey];
  if (newVdom.tagName && queue) {
    updatedQueue.value[newVdom.stateKey] = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs, newDefs) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}


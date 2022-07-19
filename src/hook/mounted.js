import {
  stateKeyRef,
  mountedCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function mounted(effectAction) {
  const currentSubSeq = mountedCallSeq.value;
  const stateKey = stateKeyRef.value;

  if (!componentRef[stateKey]?.mountedQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].mountedQueue ??= {};
  }

  componentRef[stateKey].mountedQueue[currentSubSeq] = effectAction;
  mountedCallSeq.value += 1;
}

export function runMountedQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.mountedQueue;

  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].mountedQueue = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

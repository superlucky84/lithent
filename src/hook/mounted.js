import { stateKeyRef, componentRef } from '@/helper/universalRef';

export default function mounted(effectAction) {
  const stateKey = stateKeyRef.value;

  if (!componentRef[stateKey]?.mountedQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].mountedQueue ??= [];
  }

  componentRef[stateKey].mountedQueue.push(effectAction);
}

export function runMountedQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.mountedQueue;

  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].mountedQueue = [];

    queue.forEach(effect => {
      effect();
    });
  }
}

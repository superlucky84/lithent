import { WDom } from '@/types';
import { stateKeyRef, componentRef, makeQueueRef } from '@/helper/universalRef';

export default function mounted(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  let mountedQueue = componentRef[stateKey]?.mountedQueue;

  if (!mountedQueue) {
    mountedQueue = makeQueueRef(stateKey, 'mountedQueue');
  }

  mountedQueue.push(effectAction);
}

export function runMountedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }
  const queue = componentRef[newVdom.stateKey].mountedQueue;

  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].mountedQueue = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

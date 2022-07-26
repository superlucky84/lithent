import { WDom } from '@/types';
import { stateKeyRef, componentRef } from '@/helper/universalRef';

export default function mounted(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  const mountedQueue = componentRef[stateKey]?.mountedQueue;

  if (!mountedQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].mountedQueue ??= [];
  }

  console.log('MOUNTED STATEDKEY', stateKey, componentRef[stateKey]);

  const makedMountedQueue = componentRef[stateKey].mountedQueue;

  (makedMountedQueue || []).push(effectAction);
}

export function runMountedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }
  const queue = componentRef[newVdom.stateKey].mountedQueue;

  // mountedQueue
  console.log(
    'QUEUE',
    newVdom.tagName,
    componentRef[newVdom.stateKey],
    newVdom.stateKey,
    queue
  );

  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].mountedQueue = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

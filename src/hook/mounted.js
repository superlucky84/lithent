import { stateKeyRef, mountedCallSeq, mountedQueue } from '@/hook';

export default function mounted(effectAction) {
  const currentSubSeq = mountedCallSeq.value;
  const stateKey = stateKeyRef.value;

  if (!mountedQueue.value[stateKey]) {
    mountedQueue.value[stateKey] = {};
  }

  mountedQueue.value[stateKey][currentSubSeq] = effectAction;
  mountedCallSeq.value += 1;
}

export function runMountedQueueFromVdom(newVdom) {
  const queue = mountedQueue.value[newVdom.stateKey];
  if (newVdom.tagName && queue) {
    mountedQueue.value[newVdom.stateKey] = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

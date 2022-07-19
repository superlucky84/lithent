import { stateKeyRef, unmountCallSeq, unmountQueue } from '@/util/universalRef';

export default function unmount(effectAction) {
  const currentSubSeq = unmountCallSeq.value;
  const stateKey = stateKeyRef.value;

  if (!unmountQueue.value[stateKey]) {
    unmountQueue.value[stateKey] = {};
    unmountQueue.value[stateKey][currentSubSeq] = effectAction;
  }

  unmountCallSeq.value += 1;
}

export function runUnmountQueueFromVdom(newVdom) {
  const queue = unmountQueue.value[newVdom.stateKey];
  if (newVdom.tagName && queue) {
    unmountQueue.value[newVdom.stateKey] = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

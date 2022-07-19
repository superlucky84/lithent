import {
  stateKeyRef,
  unmountCallSeq,
  componentRef,
} from '@/helper/universalRef';

export default function unmount(effectAction) {
  const currentSubSeq = unmountCallSeq.value;
  const stateKey = stateKeyRef.value;

  if (!componentRef[stateKey]?.unmountQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].unmountQueue ??= {};
    componentRef[stateKey].unmountQueue[currentSubSeq] = effectAction;
  }

  unmountCallSeq.value += 1;
}

export function runUnmountQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.unmountQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].unmountQueue = {};

    Object.values(queue).forEach(effect => {
      effect();
    });
  }
}

import { stateKeyRef, componentRef } from '@/helper/universalRef';

export default function unmount(effectAction) {
  const stateKey = stateKeyRef.value;

  if (!componentRef[stateKey]?.unmountQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].unmountQueue ??= [];
    componentRef[stateKey].unmountQueue.push(effectAction);
  }
}

export function runUnmountQueueFromVdom(newVdom) {
  const queue = componentRef[newVdom.stateKey]?.unmountQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].unmountQueue = [];

    queue.forEach(effect => {
      effect();
    });
  }
}
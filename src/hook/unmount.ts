import { WDom } from '@/types';
import { stateKeyRef, componentRef } from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  const unmountQueue = componentRef[stateKey].unmountQueue;

  if (!unmountQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].unmountQueue ??= [];
    (componentRef[stateKey].unmountQueue || []).push(effectAction);
  }
}

export function runUnmountQueueFromVdom(newVdom: WDom) {
  const queue = componentRef[newVdom.stateKey]?.unmountQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].unmountQueue = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

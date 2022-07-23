import { WDom } from '@/types';
import { stateKeyRef, componentRef } from '@/helper/universalRef';

export default function unmount(effectAction: Function) {
  const stateKey = stateKeyRef.value;

  if (!componentRef[stateKey]?.unmountQueue) {
    componentRef[stateKey] ??= {};
    componentRef[stateKey].unmountQueue ??= [];
    componentRef[stateKey].unmountQueue.push(effectAction);
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

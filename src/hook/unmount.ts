import { WDom } from '@/types';
import {
  stateKeyRef,
  componentRef,
  makeUnmountQueueRef,
} from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  const unmountQueue = componentRef[stateKey].unmountQueue;

  if (!unmountQueue) {
    makeUnmountQueueRef(stateKey).push(effectAction);
  }
}

export function runUnmountQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }
  const queue = componentRef[newVdom.stateKey]?.unmountQueue;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].unmountQueue = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

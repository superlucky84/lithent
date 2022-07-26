import { WDom } from '@/types';
import { stateKeyRef, componentRef, makeQueueRef } from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  const unmountSubscribeList = componentRef[stateKey].unmountSubscribeList;

  if (!unmountSubscribeList) {
    makeQueueRef(stateKey, 'unmountSubscribeList').push(effectAction);
  }
}

export function runUnmountQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }
  const queue = componentRef[newVdom.stateKey]?.unmountSubscribeList;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].unmountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

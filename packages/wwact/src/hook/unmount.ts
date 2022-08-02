import { WDom } from '@/types';
import { componentKeyRef, componentRef, makeQueueRef } from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  const unmountSubscribeList = componentRef[componentKey].unmountSubscribeList;

  if (!unmountSubscribeList) {
    makeQueueRef(componentKey, 'unmountSubscribeList').push(effectAction);
  }
}

export function runUnmountQueueFromVdom(newVdom: WDom) {
  if (!newVdom.componentKey) {
    return;
  }
  const queue = componentRef[newVdom.componentKey]?.unmountSubscribeList;
  if (newVdom.tagName && queue) {
    componentRef[newVdom.componentKey].unmountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

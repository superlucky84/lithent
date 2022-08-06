import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  const unmountSubscribeList = componentRef[componentKey].unmountSubscribeList;

  if (!unmountSubscribeList) {
    makeQueueRef(componentKey, 'unmountSubscribeList').push(effectAction);
  }
}

export function runUnmountQueueFromWDom(newWDom: WDom) {
  if (!newWDom.componentKey) {
    return;
  }
  const queue = componentRef[newWDom.componentKey]?.unmountSubscribeList;
  if (newWDom.tagName && queue) {
    componentRef[newWDom.componentKey].unmountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

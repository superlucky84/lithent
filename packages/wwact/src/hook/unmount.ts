import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

export default function unmount(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  const unmountSubscribeList =
    componentRef.get(componentKey)!.unmountSubscribeList;

  if (!unmountSubscribeList) {
    makeQueueRef(componentKey, 'unmountSubscribeList').push(effectAction);
  }
}

export function runUnmountQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;

  if (!componentKey) {
    return;
  }

  const queue = componentRef.get(componentKey)?.unmountSubscribeList;

  if (queue) {
    componentRef.get(componentKey)!.unmountSubscribeList = [];

    queue.forEach((effect: Function) => effect());
  }
}

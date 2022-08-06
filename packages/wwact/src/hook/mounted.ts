import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

export default function mounted(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  let mountSubscribeList = componentRef[componentKey]?.mountSubscribeList;

  if (!mountSubscribeList) {
    mountSubscribeList = makeQueueRef(componentKey, 'mountSubscribeList');
  }

  mountSubscribeList.push(effectAction);
}

export function runMountedQueueFromWDom(newWDom: WDom) {
  if (!newWDom.componentKey) {
    return;
  }
  const queue = componentRef[newWDom.componentKey].mountSubscribeList;

  if (newWDom.tagName && queue) {
    componentRef[newWDom.componentKey].mountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

import { WDom } from '@/types';
import { componentKeyRef, componentRef, makeQueueRef } from '@/helper/universalRef';

export default function mounted(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  let mountSubscribeList = componentRef[componentKey]?.mountSubscribeList;

  if (!mountSubscribeList) {
    mountSubscribeList = makeQueueRef(componentKey, 'mountSubscribeList');
  }

  mountSubscribeList.push(effectAction);
}

export function runMountedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.componentKey) {
    return;
  }
  const queue = componentRef[newVdom.componentKey].mountSubscribeList;

  if (newVdom.tagName && queue) {
    componentRef[newVdom.componentKey].mountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

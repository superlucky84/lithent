import { WDom } from '@/types';
import { stateKeyRef, componentRef, makeQueueRef } from '@/helper/universalRef';

export default function mounted(effectAction: () => void) {
  const stateKey = stateKeyRef.value;
  let mountSubscribeList = componentRef[stateKey]?.mountSubscribeList;

  if (!mountSubscribeList) {
    mountSubscribeList = makeQueueRef(stateKey, 'mountSubscribeList');
  }

  mountSubscribeList.push(effectAction);
}

export function runMountedQueueFromVdom(newVdom: WDom) {
  if (!newVdom.stateKey) {
    return;
  }
  const queue = componentRef[newVdom.stateKey].mountSubscribeList;

  if (newVdom.tagName && queue) {
    componentRef[newVdom.stateKey].mountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

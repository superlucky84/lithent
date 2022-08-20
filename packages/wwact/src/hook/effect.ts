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
  const { componentKey, tagName } = newWDom;
  if (!componentKey) {
    return;
  }
  console.log('COMPONENTREF - ', componentRef, newWDom);
  const queue = componentRef[componentKey].mountSubscribeList;
  componentKeyRef.value = componentKey;

  if (tagName && queue) {
    componentRef[componentKey].mountSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

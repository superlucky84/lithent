import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

import unmount from '@/hook/unmount';

export default function mounted(effectAction: () => void) {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);
  let mountSubscribeList = component?.mountSubscribeList;

  if (!mountSubscribeList) {
    mountSubscribeList = makeQueueRef(componentKey, 'mountSubscribeList');
  }

  mountSubscribeList.push(effectAction);
}

export function runMountedQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;

  if (componentKey) {
    const component = componentRef.get(componentKey) || {};
    const queue = component.mountSubscribeList;
    const sequence = component.updateSubscribeSequence;

    componentKeyRef.value = componentKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (queue) {
      component.mountSubscribeList = [];

      queue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
}

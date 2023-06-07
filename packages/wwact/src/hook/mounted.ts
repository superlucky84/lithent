import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

import unmount from '@/hook/unmount';

const mounted = (effectAction: () => void) => {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);
  let mounts = component?.mounts;

  if (!mounts) {
    mounts = makeQueueRef(componentKey, 'mounts');
  }

  mounts.push(effectAction);
};
export default mounted;

export const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const component = componentRef.get(componentKey) || {};
    const queue = component.mounts;
    const sequence = component.updateSubscribeSequence;

    componentKeyRef.value = componentKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (queue) {
      component.mounts = [];

      queue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};

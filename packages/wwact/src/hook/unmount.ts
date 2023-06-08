import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

export const unmount = (effectAction: () => void) => {
  const componentKey = componentKeyRef.value;

  if (!componentRef.get(componentKey)!.unmounts) {
    makeQueueRef(componentKey, 'unmounts').push(effectAction);
  }
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const queue = componentRef.get(componentKey)?.unmounts;

    if (queue) {
      componentRef.get(componentKey)!.unmounts = [];

      queue.forEach((effect: Function) => effect());
    }
  }
};

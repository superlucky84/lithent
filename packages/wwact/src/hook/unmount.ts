import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  makeQueueRef,
} from '@/helper/universalRef';

const unmount = (effectAction: () => void) => {
  const componentKey = componentKeyRef.value;
  const unmounts = componentRef.get(componentKey)!.unmounts;

  if (!unmounts) {
    makeQueueRef(componentKey, 'unmounts').push(effectAction);
  }
};

export default unmount;

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (!componentKey) {
    return;
  }

  const queue = componentRef.get(componentKey)?.unmounts;

  if (queue) {
    componentRef.get(componentKey)!.unmounts = [];

    queue.forEach((effect: Function) => effect());
  }
};

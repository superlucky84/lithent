import { WDom } from '@/types';
import { componentRef, getComponentKey } from '@/helper/universalRef';

export const unmount = (effectAction: () => void) => {
  componentRef.get(getComponentKey())!.unmounts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const queue = componentRef.get(componentKey)!.unmounts;

    componentRef.get(componentKey)!.unmounts = [];
    queue.forEach(effect => effect());
  }
};

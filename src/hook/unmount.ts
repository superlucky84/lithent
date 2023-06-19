import { WDom, Props } from '@/types';
import { componentRef, getComponentKey } from '@/utils/universalRef';

export const unmount = (effectAction: () => void) => {
  componentRef.get(getComponentKey())!.umts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    removeItem(componentKey);
  }
  recursiveRunUnmount(newWDom);
};

const recursiveRunUnmount = (wDom: WDom) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.componentKey;
    if (childComKey) {
      runUnmountQueueFromWDom(item);
    } else {
      recursiveRunUnmount(item);
    }
  });
};

const removeItem = (componentKey: Props) => {
  const subInfo = componentRef.get(componentKey);
  if (subInfo) {
    subInfo!.umts.forEach(effect => effect());
    subInfo!.umts = [];
    componentRef.delete(componentKey);
  }
};

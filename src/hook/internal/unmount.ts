import { WDom, Props } from '@/types';
import { componentMap, getComponentKey } from '@/utils/universalRef';

export const unmount = (effectAction: () => void) => {
  componentMap.get(getComponentKey())!.umts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    removeItem(compKey);
  }
  recursiveRunUnmount(newWDom);
};

const recursiveRunUnmount = (wDom: WDom) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.compKey;
    if (childComKey) {
      runUnmountQueueFromWDom(item);
    } else {
      recursiveRunUnmount(item);
    }
  });
};

const removeItem = (compKey: Props) => {
  const subInfo = componentMap.get(compKey);
  if (subInfo) {
    subInfo!.umts.forEach(effect => effect());
    subInfo!.umts = [];
    componentMap.delete(compKey);
  }
};

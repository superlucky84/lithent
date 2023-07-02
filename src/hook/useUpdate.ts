import { WDom } from '@/types';
import {
  compKeyRef,
  componentRef,
  getComponentKey,
} from '@/utils/universalRef';

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const component = componentRef.get(getComponentKey());
  const { upD, upS } = component!;
  const def = upD[upS.value];

  if (def && checkNeedPushQueue(def, dependencies())) {
    const callback = effectAction();
    if (callback) {
      component!.upCB.push(callback);
    }
  }

  upD[upS.value] = dependencies();
  upS.value += 1;
};

export const runUpdatedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentRef.get(compKey);
    const queue = component?.upCB;
    const sequence = component?.upS;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (newWDom.ctor && queue) {
      component.upCB = [];
      queue.forEach((effect: Function) => effect());
    }
  }
};

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) =>
  !originalDefs.length && !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

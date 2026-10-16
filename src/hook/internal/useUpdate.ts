import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getCurrentComponent,
} from '@/utils/universalRef';

type DependencyFactory = () => unknown[];

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: DependencyFactory = () => []
) => {
  const component = getCurrentComponent();
  if (!component) return;

  const { upD, upS } = component;
  const def = upD[upS.value];

  const nextDependencies = dependencies();

  if (def && checkNeedPushQueue(def, nextDependencies)) {
    const callback = effectAction();
    if (callback) {
      component.upCB.push(callback);
    }
  }

  upD[upS.value] = nextDependencies;
  upS.value += 1;
};

export const runUpdatedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;
  // Every entry has all its queues (setComponetRef).
  const component = compKey && componentMap.get(compKey);

  if (component) {
    const queue = component.upCB;

    compKeyRef.value = compKey;
    component.upS.value = 0;

    if (newWDom.ctor) {
      component.upCB = [];
      queue.forEach((effect: Function) => effect());
    }
  }
};

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) =>
  !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

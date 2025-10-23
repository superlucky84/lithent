import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getComponentKey,
} from '@/utils/universalRef';

type DependencyFactory = () => unknown[];

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: DependencyFactory = () => []
) => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const component = componentMap.get(compKey);
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

  if (compKey) {
    const component = componentMap.get(compKey);
    const queue = component && component.upCB;
    const sequence = component && component.upS;

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
  !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

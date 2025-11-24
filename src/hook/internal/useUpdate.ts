import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getActiveSession,
  getComponentKey,
  setComponentKey,
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
  const activeSession = getActiveSession();
  const sessionId =
    activeSession && activeSession.isConcurrentMode ? activeSession.id : null;

  if (def && checkNeedPushQueue(def, nextDependencies)) {
    const callback = effectAction();
    if (callback) {
      component.upCB.push({ effect: callback, sessionId });
    }
  }

  upD[upS.value] = nextDependencies;
  upS.value += 1;
};

export const runUpdatedQueueFromWDom = (
  newWDom: WDom,
  sessionId?: symbol | null
) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    if (!component) return;
    const queue = component && component.upCB;
    const sequence = component && component.upS;

    compKeyRef.value = compKey;
    setComponentKey(compKey);

    if (sequence) {
      sequence.value = 0;
    }

    if (newWDom.ctor && queue?.length) {
      const toRun: Array<() => void> = [];
      const remaining: typeof queue = [];

      queue.forEach(item => {
        const shouldRun = sessionId
          ? item.sessionId === sessionId
          : item.sessionId == null;

        if (shouldRun) {
          toRun.push(item.effect);
        } else {
          remaining.push(item);
        }
      });

      component.upCB = remaining;
      toRun.forEach(effect => effect());
    }
  }
};

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) =>
  !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

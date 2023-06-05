import { WDom } from '@/types';
import {
  componentKeyRef,
  makeQueueRef,
  makeUpdatedStore,
  componentRef,
} from '@/helper/universalRef';

export default function useUpdated(
  effectAction: () => void,
  dependencies: () => any[] = () => []
) {
  const componentKey = componentKeyRef.value;
  const component = componentRef.get(componentKey);

  let updateSubscribeDefList = component?.updateSubscribeDefList as unknown[][];

  let updateSubscribeSequence = component?.updateSubscribeSequence as {
    value: number;
  };

  if (
    !updateSubscribeDefList ||
    !updateSubscribeDefList[updateSubscribeSequence.value]
  ) {
    [updateSubscribeSequence, updateSubscribeDefList] =
      makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(
      updateSubscribeDefList[updateSubscribeSequence.value] || [],
      dependencies()
    )
  ) {
    makeQueueRef(componentKey, 'updateSubscribeList').push(effectAction);
  }
  updateSubscribeDefList[updateSubscribeSequence.value] = dependencies();
  updateSubscribeSequence.value += 1;
}

export function runUpdatedQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;
  if (componentKey) {
    const component = componentRef.get(componentKey);
    const queue = component?.updateSubscribeList;

    componentKeyRef.value = componentKey;

    if (component!.updateSubscribeSequence) {
      component!.updateSubscribeSequence!.value = 0;
    }
    if (newWDom.constructor && queue) {
      component.updateSubscribeList = [];

      queue.forEach((effect: Function) => {
        effect();
      });
    }
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

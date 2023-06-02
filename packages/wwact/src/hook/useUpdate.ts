import { WDom } from '@/types';
import {
  componentKeyRef,
  makeQueueRef,
  makeUpdatedStore,
  componentRef,
} from '@/helper/universalRef';

export default function updated(
  effectAction: () => void,
  dependencies: unknown[] = []
) {
  const componentKey = componentKeyRef.value;

  let updateSubscribeDefList = componentRef.get(componentKey)
    ?.updateSubscribeDefList as unknown[][];

  let updateSubscribeSequence = componentRef.get(componentKey)
    ?.updateSubscribeSequence as { value: number };

  if (
    !updateSubscribeDefList ||
    !updateSubscribeDefList[updateSubscribeSequence.value]
  ) {
    [updateSubscribeSequence, updateSubscribeDefList] =
      makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(
      updateSubscribeDefList[updateSubscribeSequence.value] || [],
      dependencies
    )
  ) {
    makeQueueRef(componentKey, 'updateSubscribeList').push(effectAction);
  }

  updateSubscribeDefList[updateSubscribeSequence.value] = dependencies;
  updateSubscribeSequence.value += 1;
}

export function runUpdatedQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;
  if (!componentKey) {
    return;
  }
  componentKeyRef.value = componentKey;

  const queue = componentRef.get(componentKey)?.updateSubscribeList;
  if (componentRef.get(componentKey)!.updateSubscribeSequence) {
    componentRef.get(componentKey)!.updateSubscribeSequence!.value = 0;
  }
  if (newWDom.constructor && queue) {
    componentRef.get(componentKey)!.updateSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

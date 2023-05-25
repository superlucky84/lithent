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
    ?.updateSubscribeDefList as WeakMap<() => void, unknown[]>;

  if (!updateSubscribeDefList || !updateSubscribeDefList.get(effectAction)) {
    updateSubscribeDefList = makeUpdatedStore(componentKey);
  } else if (
    checkNeedPushQueue(
      updateSubscribeDefList.get(effectAction) || [],
      dependencies
    )
  ) {
    makeQueueRef(componentKey, 'updateSubscribeList').push(effectAction);
  }

  updateSubscribeDefList.set(effectAction, dependencies);
}

export function runUpdatedQueueFromWDom(newWDom: WDom) {
  const { componentKey } = newWDom;
  if (!componentKey) {
    return;
  }
  componentKeyRef.value = componentKey;

  const queue = componentRef.get(componentKey)?.updateSubscribeList;
  if (newWDom.tagName && queue) {
    componentRef.get(componentKey)!.updateSubscribeList = [];

    queue.forEach((effect: Function) => {
      effect();
    });
  }
}

function checkNeedPushQueue(originalDefs: unknown[], newDefs: unknown[]) {
  return originalDefs.some((def, index) => def !== newDefs[index]);
}

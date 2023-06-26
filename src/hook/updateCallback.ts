import { componentRef, getComponentKey } from '@/utils/universalRef';

import { useUpdated } from '@/hook/useUpdate';

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const updateReqs = componentRef.get(getComponentKey())!.upR;

  updateReqs.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const updateReqs = componentRef.get(getComponentKey())?.upR;

  if (updateReqs?.length) {
    updateReqs.forEach(callback => callback());
  }
};

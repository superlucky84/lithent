import { componentMap, getComponentKey } from '@/utils/universalRef';

import { useUpdated } from '@/hook/internal/useUpdate';

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const updateReqs = componentMap.get(getComponentKey())!.upR;

  updateReqs.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const updateReqs = componentMap.get(getComponentKey())?.upR;

  if (updateReqs?.length) {
    updateReqs.forEach(callback => callback());
  }
};

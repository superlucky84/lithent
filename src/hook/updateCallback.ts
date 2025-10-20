import { componentMap, getComponentKey } from '@/utils/universalRef';

import { useUpdated } from '@/hook/internal/useUpdate';

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const component = componentMap.get(compKey);
  if (!component) return;

  component.upR.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const updateReqs = componentMap.get(compKey)?.upR;

  if (updateReqs?.length) {
    updateReqs.forEach(callback => callback());
  }
};

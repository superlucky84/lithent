import { componentMap, getComponentKey } from '@/utils/universalRef';

import { useUpdated } from '@/hook/internal/useUpdate';

type DependencyFactory = () => unknown[];

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: DependencyFactory = () => []
) => {
  const compKey = getComponentKey();
  if (!compKey) {
    return;
  }

  const component = componentMap.get(compKey);
  if (!component) {
    return;
  }

  component.upR.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const comp = componentMap.get(compKey);
  const updateReqs = comp && comp.upR;

  if (updateReqs && updateReqs.length) {
    updateReqs.forEach(callback => callback());
  }
};

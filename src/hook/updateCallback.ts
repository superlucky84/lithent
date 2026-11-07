import { getCurrentComponent } from '@/utils/universalRef';

import { useUpdated } from '@/hook/internal/useUpdate';

type DependencyFactory = () => unknown[];

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: DependencyFactory = () => []
) => {
  const component = getCurrentComponent();
  if (!component) return;

  component.upR.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const comp = getCurrentComponent();
  const updateReqs = comp && comp.upR;

  if (updateReqs && updateReqs.length) {
    updateReqs.forEach(callback => callback());
  }
};

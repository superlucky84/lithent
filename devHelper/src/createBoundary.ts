import type { CompKey, TagFunction, WDom } from 'lithent';
import { componentMap, replaceWDom } from 'lithent';
import {
  disableComponentMapManualMode,
  enableComponentMapManualMode,
  removeComponentEntry,
} from './componentMapControl';

const MAX_RETRY = 3;

type InstanceRegistry = {
  instances: Set<CompKey>;
  domMap: Map<CompKey, WDom>;
  scheduled: boolean;
  pendingCtor?: TagFunction;
  retryCount: number;
};

const boundaryRegistry = new Map<string, InstanceRegistry>();

const getRegistry = (moduleId: string): InstanceRegistry => {
  let registry = boundaryRegistry.get(moduleId);

  if (!registry) {
    registry = {
      instances: new Set(),
      domMap: new Map(),
      scheduled: false,
      pendingCtor: undefined,
      retryCount: 0,
    };
    boundaryRegistry.set(moduleId, registry);
  }

  return registry;
};

export type BoundaryController = {
  register: (compKey: CompKey) => () => void;
  update: (nextCtor: TagFunction) => boolean;
  dispose: () => void;
};

export const registerBoundaryInstance = (
  moduleId: string,
  compKey: CompKey
) => {
  const registry = getRegistry(moduleId);

  registry.instances.add(compKey);

  queueMicrotask(() => {
    const entry = componentMap.get(compKey);
    const currentWDom = entry?.vd?.value ?? null;

    if (currentWDom) {
      registry.domMap.set(compKey, currentWDom);
    }
  });

  return () => {
    const currentRegistry = boundaryRegistry.get(moduleId);
    if (!currentRegistry) return;

    currentRegistry.instances.delete(compKey);
    currentRegistry.domMap.delete(compKey);

    if (!currentRegistry.instances.size) {
      boundaryRegistry.delete(moduleId);
    }
  };
};

export const disposeBoundary = (moduleId: string) => {
  const registry = boundaryRegistry.get(moduleId);

  if (registry) {
    Array.from(registry.instances).forEach(compKey =>
      removeComponentEntry(compKey)
    );
  }

  boundaryRegistry.delete(moduleId);
  disableComponentMapManualMode();
};

export const applyBoundaryUpdate = (
  moduleId: string,
  nextCtor: TagFunction
) => {
  const registry = boundaryRegistry.get(moduleId);

  if (!registry) return false;

  registry.pendingCtor = nextCtor;
  registry.retryCount = 0;

  if (!registry.scheduled) {
    registry.scheduled = true;
    queueMicrotask(() => flushBoundary(moduleId));
  }

  return true;
};

const flushBoundary = (moduleId: string) => {
  const registry = boundaryRegistry.get(moduleId);
  if (!registry) return;

  registry.scheduled = false;

  const ctor = registry.pendingCtor;
  if (!ctor) {
    return;
  }

  registry.pendingCtor = undefined;

  let updated = false;
  let hasMissing = false;

  registry.instances.forEach(compKey => {
    const entry = componentMap.get(compKey);
    const cached = registry.domMap.get(compKey);
    const currentWDom = entry?.vd?.value || cached;

    if (!currentWDom || !currentWDom.el) {
      hasMissing = true;
      return;
    }

    const { compProps, compChild } = currentWDom;

    if (!compProps || !compChild) {
      hasMissing = true;
      return;
    }

    try {
      replaceWDom(ctor, compProps, compChild, currentWDom as any);
      const refreshed = componentMap.get(compKey)?.vd?.value || currentWDom;
      registry.domMap.set(compKey, refreshed as WDom);
      updated = true;
    } catch (error) {
      console.warn(`[Lithent HMR] boundary update 실패: ${moduleId}`, error);
    }
  });

  let nextPendingCtor: TagFunction | undefined = registry.pendingCtor;
  const shouldRetryMissing = hasMissing && !updated;
  const hasQueuedUpdate = Boolean(nextPendingCtor);
  const shouldRetry = shouldRetryMissing || hasQueuedUpdate;

  if (!shouldRetry) {
    registry.retryCount = 0;
    return;
  }

  if (shouldRetryMissing) {
    registry.retryCount += 1;

    if (registry.retryCount > MAX_RETRY) {
      console.warn(
        `[Lithent HMR] boundary update failed after ${registry.retryCount} attempts; aborting: ${moduleId}`
      );

      const hot = (
        import.meta as unknown as {
          hot?: { invalidate?: () => void };
        }
      ).hot;
      hot?.invalidate?.();

      registry.pendingCtor = undefined;
      registry.scheduled = false;
      return;
    }

    if (!nextPendingCtor) {
      nextPendingCtor = ctor;
    }
  }

  registry.pendingCtor = nextPendingCtor;

  if (!registry.scheduled) {
    registry.scheduled = true;
    setTimeout(() => flushBoundary(moduleId), 0);
  }
};

export const createBoundary = (moduleId: string): BoundaryController => {
  enableComponentMapManualMode();

  return {
    register: (compKey: CompKey) => registerBoundaryInstance(moduleId, compKey),
    update: (nextCtor: TagFunction) => applyBoundaryUpdate(moduleId, nextCtor),
    dispose: () => disposeBoundary(moduleId),
  };
};

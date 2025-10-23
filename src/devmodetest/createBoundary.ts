import type { CompKey, TagFunction } from '@/types';
import { replaceWDom } from '@/wDom';
import { componentMap } from '@/utils/universalRef';

type InstanceRegistry = {
  instances: Set<CompKey>;
  domMap: Map<CompKey, unknown>;
  scheduled: boolean;
  pendingCtor?: TagFunction;
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
    };
    boundaryRegistry.set(moduleId, registry);
  }

  return registry;
};

export const registerBoundaryInstance = (
  moduleId: string,
  compKey: CompKey
) => {
  const registry = getRegistry(moduleId);

  registry.instances.add(compKey);

  queueMicrotask(() => {
    const entry = componentMap.get(compKey);
    const currentWDom = entry?.vd?.value;

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
  boundaryRegistry.delete(moduleId);
};

export const applyBoundaryUpdate = (
  moduleId: string,
  nextCtor: TagFunction
) => {
  const registry = boundaryRegistry.get(moduleId);

  if (!registry) return false;

  registry.pendingCtor = nextCtor;

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
    const currentWDom = (entry?.vd?.value || registry.domMap.get(compKey)) as
      | {
          el?: unknown;
          compProps?: CompKey;
          compChild?: unknown[];
        }
      | undefined;

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
      console.log('[hmr-boundary] replace call', moduleId, ctor.name, compKey.id);
      replaceWDom(ctor, compProps, compChild, currentWDom as any);
      registry.domMap.set(
        compKey,
        componentMap.get(compKey)?.vd?.value || currentWDom
      );
      updated = true;
    } catch (error) {
      console.warn(`[Lithent HMR] boundary update 실패: ${moduleId}`, error);
    }
  });

  if ((hasMissing && !updated) || registry.pendingCtor) {
    if (!registry.scheduled) {
      registry.scheduled = true;
      setTimeout(() => flushBoundary(moduleId), 0);
    }
  }
};

export const createBoundary = (moduleId: string) => ({
  register: (compKey: CompKey) => registerBoundaryInstance(moduleId, compKey),
  update: (nextCtor: TagFunction) => applyBoundaryUpdate(moduleId, nextCtor),
  dispose: () => disposeBoundary(moduleId),
});

import type { CompKey, TagFunction, WDom } from 'lithent';
import { componentMap, replaceWDom } from 'lithent';
import {
  disableComponentMapManualMode,
  enableComponentMapManualMode,
  removeComponentEntry,
} from './componentMapControl';

const MAX_RETRY = 3;

type Registration = { callerCtor?: TagFunction };

type PendingUpdate = {
  ctor: TagFunction;
  instances: Map<CompKey, Registration>;
  retryCount: number;
  updated: boolean;
};

type InstanceRegistry = {
  instances: Set<CompKey>;
  domMap: Map<CompKey, WDom>;
  scheduled: boolean;
  pendingUpdate?: PendingUpdate;
  owners: number;
  registrations: Map<CompKey, Registration>;
  onFailure?: (reason: string) => void;
  onApplied?: () => void;
};

const boundaryRegistry = new Map<string, InstanceRegistry>();

const getRegistry = (moduleId: string): InstanceRegistry => {
  let registry = boundaryRegistry.get(moduleId);

  if (!registry) {
    registry = {
      instances: new Set(),
      domMap: new Map(),
      scheduled: false,
      owners: 0,
      registrations: new Map(),
    };
    boundaryRegistry.set(moduleId, registry);
    enableComponentMapManualMode();
  }

  return registry;
};

export type BoundaryController = {
  register: (compKey: CompKey, callerCtor?: TagFunction) => () => void;
  update: (nextCtor: TagFunction) => boolean;
  dispose: () => void;
};

export const registerBoundaryInstance = (
  moduleId: string,
  compKey: CompKey,
  callerCtor?: TagFunction
) => {
  const registry = getRegistry(moduleId);

  const registration = { callerCtor };
  registry.registrations.set(compKey, registration);
  registry.instances.add(compKey);

  queueMicrotask(() => {
    const entry = componentMap.get(compKey);
    const currentWDom = entry?.vd?.value ?? null;

    if (
      currentWDom &&
      boundaryRegistry.get(moduleId) === registry &&
      registry.registrations.get(compKey) === registration
    ) {
      registry.domMap.set(compKey, currentWDom);
    }
  });

  return () => {
    const currentRegistry = boundaryRegistry.get(moduleId);
    if (
      currentRegistry !== registry ||
      currentRegistry.registrations.get(compKey) !== registration
    )
      return;

    currentRegistry.registrations.delete(compKey);
    currentRegistry.instances.delete(compKey);
    currentRegistry.domMap.delete(compKey);
  };
};

export const disposeBoundary = (moduleId: string) => {
  const registry = boundaryRegistry.get(moduleId);

  if (!registry) return;
  boundaryRegistry.delete(moduleId);
  for (const [compKey, registration] of Array.from(registry.registrations)) {
    // A direct call observes its caller; it does not own that caller's lifetime.
    if (!registration.callerCtor) removeComponentEntry(compKey);
  }
  registry.instances.clear();
  registry.registrations.clear();
  registry.domMap.clear();
  disableComponentMapManualMode();
};

export const applyBoundaryUpdate = (
  moduleId: string,
  nextCtor: TagFunction
) => {
  const registry = boundaryRegistry.get(moduleId);

  if (!registry?.instances.size) return false;

  registry.pendingUpdate = {
    ctor: nextCtor,
    instances: new Map(registry.registrations),
    retryCount: 0,
    updated: false,
  };

  if (!registry.scheduled) {
    registry.scheduled = true;
    queueMicrotask(() => flushBoundary(moduleId, registry));
  }

  return true;
};

const flushBoundary = (moduleId: string, registry: InstanceRegistry) => {
  if (boundaryRegistry.get(moduleId) !== registry) return;

  registry.scheduled = false;

  const update = registry.pendingUpdate;
  if (!update) return;

  registry.pendingUpdate = undefined;

  let failed = false;

  // Replacement can unregister old instances and register new descendants.
  // Never consume additions made during this flush, or revisit retired nodes.
  const instances = Array.from(update.instances, ([compKey, registration]) => ({
    compKey,
    wDom: componentMap.get(compKey)?.vd?.value || registry.domMap.get(compKey),
    registration,
  }));
  update.instances.clear();
  instances.forEach(({ compKey, wDom: currentWDom, registration }) => {
    if (
      boundaryRegistry.get(moduleId) !== registry ||
      registry.registrations.get(compKey) !== registration ||
      currentWDom?.il
    )
      return;

    if (!currentWDom || !currentWDom.el) {
      update.instances.set(compKey, registration);
      return;
    }

    const { compProps, compChild } = currentWDom;

    if (!compProps || !compChild) {
      update.instances.set(compKey, registration);
      return;
    }

    const ctor = registration.callerCtor || update.ctor;
    const previousCtor = currentWDom.ctor;
    // A stable HMR proxy has the same identity across versions. Force only this
    // replacement to remount; the new WDom retains the proxy for later redraws.
    if (!registration.callerCtor && previousCtor === ctor)
      currentWDom.ctor = undefined;
    try {
      // A remount reuses the props/key. Release the old hooks before the core
      // initializes its new hook state under that key.
      if (!registration.callerCtor) removeComponentEntry(compKey);
      replaceWDom(ctor, compProps, compChild, currentWDom);
      update.updated = true;
    } catch (error) {
      failed = true;
      console.warn(`[Lithent HMR] boundary update 실패: ${moduleId}`, error);
    } finally {
      currentWDom.ctor = previousCtor;
    }
  });

  if (boundaryRegistry.get(moduleId) !== registry) return;
  if (failed) registry.onFailure?.(`replacement failed: ${moduleId}`);
  else if (update.updated && !update.instances.size) registry.onApplied?.();

  // A newer update supersedes retries for the older implementation.
  if (!registry.pendingUpdate && !failed && update.instances.size) {
    update.retryCount += 1;

    if (update.retryCount > MAX_RETRY) {
      console.warn(
        `[Lithent HMR] boundary update failed after ${update.retryCount} attempts; aborting: ${moduleId}`
      );

      registry.onFailure?.(
        `missing DOM after ${update.retryCount} attempts: ${moduleId}`
      );

      return;
    }
    registry.pendingUpdate = update;
  }

  if (registry.pendingUpdate && !registry.scheduled) {
    registry.scheduled = true;
    setTimeout(() => flushBoundary(moduleId, registry), 0);
  }
};

export const createBoundary = (
  moduleId: string,
  onFailure?: (reason: string) => void,
  onApplied?: () => void
): BoundaryController => {
  const registry = getRegistry(moduleId);
  registry.owners += 1;
  registry.onFailure = onFailure;
  registry.onApplied = onApplied;

  let disposed = false;
  const active = () => !disposed && boundaryRegistry.get(moduleId) === registry;
  return {
    register: (compKey: CompKey, callerCtor?: TagFunction) =>
      active()
        ? registerBoundaryInstance(moduleId, compKey, callerCtor)
        : () => {},
    update: (nextCtor: TagFunction) =>
      active() && applyBoundaryUpdate(moduleId, nextCtor),
    dispose: () => {
      if (!active()) return;
      disposed = true;
      registry.owners -= 1;
      if (!registry.owners) disposeBoundary(moduleId);
    },
  };
};

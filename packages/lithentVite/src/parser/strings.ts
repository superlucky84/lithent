export const createHmrBootstrapBlock = (
  targetExports: string[],
  componentNames: string[]
) => {
  const normalizedTargets = new Set(
    componentNames.length ? componentNames : targetExports
  );

  const serializedTargets = JSON.stringify(Array.from(normalizedTargets));

  return `
const __lithentModuleId = new URL(import.meta.url).pathname;
const __lithentBoundaryStoreKey = \`__lithent_hmr_boundary__\${__lithentModuleId}\`;
const __lithentDisposeStoreKey = \`__lithent_hmr_dispose__\${__lithentModuleId}\`;
const __lithentGlobalStore =
  typeof globalThis === 'object'
    ? (globalThis as Record<string, unknown>)
    : undefined;

const __lithentEnsureHotData = (): Record<string, unknown> | undefined => {
  const hot =
    (import.meta.hot as
      | {
          data?: Record<string, unknown>;
          __lithentData?: Record<string, unknown>;
        }
      | undefined) ?? undefined;
  if (!hot) return undefined;

  const existing = hot.data;
  if (existing && typeof existing === 'object') {
    return existing;
  }

  try {
    const target: Record<string, unknown> = {};
    hot.data = target;
    return target;
  } catch {
    hot.__lithentData = hot.__lithentData || {};
    return hot.__lithentData;
  }
};

const __lithentHotData = __lithentEnsureHotData();
type __LithentBoundaryController = ReturnType<typeof createBoundary>;

const counterBoundary: __LithentBoundaryController =
  (__lithentHotData?.counterBoundary as __LithentBoundaryController | undefined) ||
  (__lithentGlobalStore?.[__lithentBoundaryStoreKey] as __LithentBoundaryController | undefined) ||
  createBoundary(__lithentModuleId);

if (__lithentHotData) {
  __lithentHotData.counterBoundary = counterBoundary;
}

if (__lithentGlobalStore) {
  __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;
}

let disposeApp =
  (__lithentHotData?.disposeApp as (() => void) | undefined) ||
  (__lithentGlobalStore?.[__lithentDisposeStoreKey] as (() => void) | undefined);

const __lithentRenderOnce = <T,>(factory: () => T) => {
  if (disposeApp) {
    return disposeApp as unknown as T;
  }

  const result = factory();

  if (typeof result === 'function') {
    disposeApp = result as unknown as () => void;

    if (__lithentHotData) {
      __lithentHotData.disposeApp = disposeApp;
    }

    if (__lithentGlobalStore && disposeApp) {
      __lithentGlobalStore[__lithentDisposeStoreKey] = disposeApp;
    }
  }

  return result;
};

const __lithentModuleHotStore =
  __lithentHotData
    ? ((__lithentHotData.components =
        (__lithentHotData.components as Record<
          string,
          TagFunction | undefined
        > | undefined) ?? {}) as Record<string, TagFunction | undefined>)
    : undefined;

const __lithentHmrTargets = ${serializedTargets};

const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) {
    return;
  }

  import.meta.hot.accept(mod => {
    let applied = false;
    const nextModule = (mod ?? {}) as Record<string, unknown>;
    const missing: string[] = [];
    const knownNames = new Set([
      ...${JSON.stringify(Array.from(new Set(componentNames)))},
      ...__lithentHmrTargets,
    ]);

    for (const name of knownNames) {
      const nextCtor =
        name === 'default'
          ? (nextModule.default as TagFunction | undefined)
          : (nextModule[name] as TagFunction | undefined) ||
            (__lithentModuleHotStore?.[name] as TagFunction | undefined);

      if (!nextCtor) {
        missing.push(name);
        continue;
      }

      if (counterBoundary.update(nextCtor)) {
        applied = true;
      }
    }

    if (!applied) {
      if (missing.length && __lithentModuleHotStore) {
        queueMicrotask(() => {
          let retried = false;
          for (const name of missing) {
            const retryCtor = __lithentModuleHotStore?.[name] as
              | TagFunction
              | undefined;
            if (retryCtor && counterBoundary.update(retryCtor)) {
              retried = true;
            }
          }
          if (!retried) {
            console.warn(
              '[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다.'
            );
            import.meta.hot?.invalidate?.();
          }
        });
        return;
      }
      console.warn(
        '[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다.'
      );
      import.meta.hot?.invalidate?.();
    }
  });

  import.meta.hot.dispose(data => {
    data.counterBoundary = counterBoundary;

    if (disposeApp) {
      data.disposeApp = disposeApp;
    }

    if (__lithentGlobalStore) {
      __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;

      if (disposeApp) {
        __lithentGlobalStore[__lithentDisposeStoreKey] = disposeApp;
      }
    }
  });
};

__lithentSetupHmrHooks();
`;
};

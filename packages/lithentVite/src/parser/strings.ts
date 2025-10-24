export const createHmrBootstrapBlock = (targetExports: string[]) => `
const __lithentModuleId = new URL(import.meta.url).pathname;
const __lithentBoundaryStoreKey = \`__lithent_hmr_boundary__\${__lithentModuleId}\`;
const __lithentDisposeStoreKey = \`__lithent_hmr_dispose__\${__lithentModuleId}\`;
const __lithentGlobalStore =
  typeof globalThis === 'object'
    ? (globalThis as Record<string, unknown>)
    : undefined;

const __lithentEnsureHotData = (): Record<string, unknown> | undefined => {
  if (!import.meta.hot) return undefined;
  try {
    import.meta.hot.data = import.meta.hot.data || {};
    return import.meta.hot.data;
  } catch {
    return undefined;
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

const __lithentHmrTargets = ${JSON.stringify(targetExports)};

const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) {
    return;
  }

  import.meta.hot.accept(mod => {
    let applied = false;

    for (const name of __lithentHmrTargets) {
      const nextCtor =
        name === 'default'
          ? (mod?.default as TagFunction | undefined)
          : (mod?.[name] as TagFunction | undefined);

      if (!nextCtor) {
        import.meta.hot?.invalidate?.();
        return;
      }

      if (counterBoundary.update(nextCtor)) {
        applied = true;
      }
    }

    if (!applied) {
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

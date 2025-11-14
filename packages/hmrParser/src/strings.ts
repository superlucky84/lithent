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
const __lithentInvalidateCountKey = \`__lithent_hmr_invalidate_count__\${__lithentModuleId}\`;
const __lithentGlobalStore =
  typeof globalThis === 'object'
    ? globalThis
    : undefined;

const __lithentEnsureHotData = () => {
  const hot = import.meta.hot ?? undefined;
  if (!hot) return undefined;

  const existing = hot.data;
  if (existing && typeof existing === 'object') {
    return existing;
  }

  try {
    const target = {};
    hot.data = target;
    return target;
  } catch {
    hot.__lithentData = hot.__lithentData || {};
    return hot.__lithentData;
  }
};

const __lithentHotData = __lithentEnsureHotData();

const counterBoundary =
  __lithentHotData?.counterBoundary ||
  __lithentGlobalStore?.[__lithentBoundaryStoreKey] ||
  createBoundary(__lithentModuleId);

if (__lithentHotData) {
  __lithentHotData.counterBoundary = counterBoundary;
}

if (__lithentGlobalStore) {
  __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;
}

let disposeApp =
  __lithentHotData?.disposeApp ||
  __lithentGlobalStore?.[__lithentDisposeStoreKey];

const __lithentRenderOnce = (factory) => {
  if (disposeApp) {
    return disposeApp;
  }

  const result = factory();

  if (typeof result === 'function') {
    disposeApp = result;

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
        __lithentHotData.components ?? {}))
    : undefined;

const __lithentHmrTargets = ${serializedTargets};

const __lithentGetInvalidateCount = () => {
  return (__lithentGlobalStore && __lithentGlobalStore[__lithentInvalidateCountKey]) || 0;
};

const __lithentIncrementInvalidateCount = () => {
  if (__lithentGlobalStore) {
    const current = __lithentGetInvalidateCount();
    __lithentGlobalStore[__lithentInvalidateCountKey] = current + 1;
    return current + 1;
  }
  return 0;
};

const __lithentResetInvalidateCount = () => {
  if (__lithentGlobalStore) {
    __lithentGlobalStore[__lithentInvalidateCountKey] = 0;
  }
};

const __lithentSafeInvalidate = (reason) => {
  const MAX_INVALIDATE_ATTEMPTS = 3;
  const count = __lithentIncrementInvalidateCount();

  if (count >= MAX_INVALIDATE_ATTEMPTS) {
    console.warn(
      \`[Lithent HMR] 전체 리프레시를 \${count}번 시도했지만 계속 실패합니다. 컴포넌트가 마운트되지 않았거나 다른 문제가 있을 수 있습니다. 페이지를 수동으로 새로고침해주세요.\`,
      reason
    );
    return;
  }

  console.warn(
    \`[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다. (시도 \${count}/\${MAX_INVALIDATE_ATTEMPTS})\`,
    reason
  );
  import.meta.hot?.invalidate?.();
};

const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) {
    return;
  }

  import.meta.hot.accept(mod => {
    let applied = false;
    const nextModule = mod ?? {};
    const missing = [];
    const knownNames = new Set([
      ...${JSON.stringify(Array.from(new Set(componentNames)))},
      ...__lithentHmrTargets,
    ]);

    for (const name of knownNames) {
      const nextCtor =
        name === 'default'
          ? nextModule.default
          : nextModule[name] ||
            __lithentModuleHotStore?.[name];

      if (!nextCtor) {
        missing.push(name);
        continue;
      }

      if (counterBoundary.update(nextCtor)) {
        applied = true;
      }
    }

    if (applied) {
      __lithentResetInvalidateCount();
    } else {
      if (missing.length && __lithentModuleHotStore) {
        queueMicrotask(() => {
          let retried = false;
          for (const name of missing) {
            const retryCtor = __lithentModuleHotStore?.[name];
            if (retryCtor && counterBoundary.update(retryCtor)) {
              retried = true;
            }
          }
          if (retried) {
            __lithentResetInvalidateCount();
          } else {
            __lithentSafeInvalidate(\`missing components: \${missing.join(', ')}\`);
          }
        });
        return;
      }
      __lithentSafeInvalidate('no components applied');
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

      // Reset invalidate count on dispose to allow fresh attempts on next load
      __lithentResetInvalidateCount();
    }
  });
};

__lithentSetupHmrHooks();
`;
};

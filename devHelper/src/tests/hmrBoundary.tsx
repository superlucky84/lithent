import {
  h,
  render,
  mount,
  mountCallback,
  nextTick,
  getComponentKey,
} from 'lithent';
import type { TagFunction } from 'lithent';
import { createBoundary } from '@/index';

const __lithentModuleId = new URL(import.meta.url).pathname;
const __lithentBoundaryStoreKey = `__lithent_hmr_boundary__${__lithentModuleId}`;
const __lithentDisposeStoreKey = `__lithent_hmr_dispose__${__lithentModuleId}`;
const __lithentGlobalStore =
  typeof globalThis === 'object'
    ? (globalThis as Record<string, unknown>)
    : undefined;

type BoundaryController = ReturnType<typeof createBoundary>;

type HotRuntime = {
  data?: Record<string, unknown>;
  accept: (cb: (mod: Record<string, unknown>) => void) => void;
  dispose: (cb: (data: Record<string, unknown>) => void) => void;
  invalidate?: () => void;
  __lithentData?: Record<string, unknown>;
};

declare global {
  interface ImportMeta {
    hot?: HotRuntime;
  }
}

const __lithentEnsureHotData = (): Record<string, unknown> | undefined => {
  const hot = import.meta.hot as HotRuntime | undefined;
  if (!hot) return undefined;

  if (hot.data && typeof hot.data === 'object') {
    return hot.data;
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

const counterBoundary: BoundaryController =
  (__lithentHotData?.counterBoundary as BoundaryController | undefined) ||
  (__lithentGlobalStore?.[__lithentBoundaryStoreKey] as
    | BoundaryController
    | undefined) ||
  createBoundary(__lithentModuleId);

if (__lithentHotData) {
  __lithentHotData.counterBoundary = counterBoundary;
}

if (__lithentGlobalStore) {
  __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;
}

let disposeApp =
  (__lithentHotData?.disposeApp as (() => void) | undefined) ||
  (__lithentGlobalStore?.[__lithentDisposeStoreKey] as
    | (() => void)
    | undefined);

const __lithentModuleHotStore = __lithentHotData
  ? ((__lithentHotData.components =
      (__lithentHotData.components as
        | Record<string, TagFunction | undefined>
        | undefined) ?? {}) as Record<string, TagFunction | undefined>)
  : undefined;

const __lithentHmrTargets: string[] = ['Counter'];

const moduleId = new URL(import.meta.url).pathname;

const Counter = mount<{ label: string }>(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const compKey = getComponentKey();
  const unregister = compKey ? counterBoundary.register(compKey) : null;
  if (unregister) {
    mountCallback(() => () => unregister());
  }

  return ({ label }) => (
    <div data-module-id={moduleId}>
      <h2>{label}</h2>
      <button id="hmr-counter-button" onClick={increment}>
        increment - jinwoosl@
      </button>
      <p id="hmr-counter-value">count: {count}</p>
    </div>
  );
});

const __lithentCounterTag = Counter as unknown as TagFunction;

if (__lithentModuleHotStore) {
  __lithentModuleHotStore['Counter'] = __lithentCounterTag;
}

const App = () => (
  <div>
    <h1>Lithent HMR playground</h1>
    <Counter label="Hot counter" />
  </div>
);

const root = document.getElementById('app');

if (!import.meta.vitest && root && !disposeApp) {
  disposeApp = render(<App />, root);

  if (__lithentHotData) {
    __lithentHotData.disposeApp = disposeApp;
  }

  if (__lithentGlobalStore && disposeApp) {
    __lithentGlobalStore[__lithentDisposeStoreKey] = disposeApp;
  }
}

export default App;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const waitForUpdate = async () => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));
  };

  const createCounterVersion = (displayLabel: string) =>
    mount<{ label: string }>(renew => {
      let count = 0;

      const increment = () => {
        count += 1;
        renew();
      };

      const compKey = getComponentKey();
      const unregister = compKey ? counterBoundary.register(compKey) : null;
      if (unregister) {
        mountCallback(() => () => unregister());
      }

      return () => (
        <div data-module-id={moduleId}>
          <h2>{displayLabel}</h2>
          <button id="hmr-counter-button" onClick={increment}>
            increment!!!
          </button>
          <p id="hmr-counter-value">count: {count}</p>
        </div>
      );
    });

  describe('hmrBoundary parity with lithentVite hmr.example', () => {
    it('updates through boundary when a new counter implementation is provided', async () => {
      const wrap = document.createElement('div');
      render(<App />, wrap);

      const button = () =>
        wrap.querySelector<HTMLButtonElement>('#hmr-counter-button');
      const value = () =>
        wrap.querySelector<HTMLParagraphElement>('#hmr-counter-value')
          ?.textContent ?? '';
      const label = () =>
        wrap.querySelector<HTMLHeadingElement>('h2')?.textContent ?? '';

      await waitForUpdate();
      expect(label()).toBe('Hot counter');
      expect(value()).toBe('count: 0');

      button()?.dispatchEvent(new Event('click', { bubbles: true }));
      button()?.dispatchEvent(new Event('click', { bubbles: true }));
      await waitForUpdate();
      expect(value()).toBe('count: 2');

      const CounterNext = createCounterVersion('Updated hot counter');
      const updated = counterBoundary.update(
        CounterNext as unknown as TagFunction
      );

      expect(updated).toBe(true);
      await waitForUpdate();
      expect(label()).toBe('Updated hot counter');
      expect(value()).toBe('count: 0');

      button()?.dispatchEvent(new Event('click', { bubbles: true }));
      await waitForUpdate();
      expect(value()).toBe('count: 1');
    });
  });
}
const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) return;

  import.meta.hot.accept(mod => {
    let applied = false;
    const missing: string[] = [];
    const knownNames = new Set(['Counter', ...__lithentHmrTargets]);

    const nextModule = (mod ?? {}) as Record<string, unknown>;

    for (const name of knownNames) {
      const nextCtor =
        name === 'default'
          ? (nextModule.default as TagFunction | undefined)
          : (nextModule[name] as TagFunction | undefined) ||
            (__lithentModuleHotStore?.[name] as TagFunction | undefined);

      console.log('___', __lithentModuleHotStore);
      console.log('Name', name);
      console.log('v', __lithentModuleHotStore?.[name]);
      console.log('NEXTCTOR', nextCtor);

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
      // import.meta.hot?.invalidate?.();
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

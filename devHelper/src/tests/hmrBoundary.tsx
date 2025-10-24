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
  data: Record<string, unknown>;
  accept: (cb: (mod: Record<string, unknown>) => void) => void;
  dispose: (cb: (data: Record<string, unknown>) => void) => void;
  invalidate?: () => void;
};

declare global {
  interface ImportMeta {
    hot?: HotRuntime;
  }
}

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

const __lithentHmrTargets = ['Counter'];

const Counter = mount<{ id: string }>(renew => {
  void renew;
  const compKey = getComponentKey();
  const unregister = compKey ? counterBoundary.register(compKey) : null;
  if (unregister) {
    mountCallback(() => () => unregister());
  }

  return ({ id }) => {
    return <div id={`counter-${id}`}>original1999sadlgkjasldkg1-{id}</div>;
  };
});

const App = () => (
  <div>
    <Counter id="first" />
    <Counter id="second" />
  </div>
);

export { Counter };
export default App;

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const waitForUpdate = async () => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));
  };

  const createCounterVersion = (label: string) =>
    mount<{ id: string }>(renew => {
      void renew;
      const compKey = getComponentKey();
      const unregister = compKey ? counterBoundary.register(compKey) : null;
      if (unregister) {
        mountCallback(() => () => unregister());
      }

      return ({ id }) => {
        return <div id={`counter-${id}`}>{label}-{id}</div>;
      };
    });

  it('updates all registered instances when boundary update runs', async () => {
    const wrap = document.createElement('div');
    render(<App />, wrap);

    const readText = (id: string) =>
      wrap.querySelector<HTMLDivElement>(`#counter-${id}`)?.textContent || '';

    await waitForUpdate();

    expect(readText('first').startsWith('original')).toBe(true);
    expect(readText('second').startsWith('original')).toBe(true);

    const CounterNext = createCounterVersion('updated');

    const updated = counterBoundary.update(
      CounterNext as unknown as TagFunction
    );

    expect(updated).toBe(true);
    await waitForUpdate();
    expect(readText('first')).toContain('updated');
    expect(readText('second')).toContain('updated');

    const CounterNext2 = createCounterVersion('latest');

    const updatedAgain = counterBoundary.update(
      CounterNext2 as unknown as TagFunction
    );

    expect(updatedAgain).toBe(true);
    await waitForUpdate();
    expect(readText('first')).toContain('latest');
    expect(readText('second')).toContain('latest');
  });
}

if (!import.meta.vitest) {
  const rootElement =
    typeof document !== 'undefined'
      ? document.getElementById('root')
      : undefined;

  if (!disposeApp && rootElement) {
    disposeApp = render(<App />, rootElement);

    if (__lithentHotData) {
      __lithentHotData.disposeApp = disposeApp;
    }

    if (__lithentGlobalStore && disposeApp) {
      __lithentGlobalStore[__lithentDisposeStoreKey] = disposeApp;
    }
  }
}

const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) return;

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

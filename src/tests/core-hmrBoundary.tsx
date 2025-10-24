import {
  h,
  render,
  mount,
  mountCallback,
  nextTick,
  getComponentKey,
} from '@/index';
import { createBoundary } from '@/devmodetest/createBoundary';
import type { TagFunction } from '@/types';

const moduleId = new URL(import.meta.url).pathname;
const BOUNDARY_STORE_KEY = `__lithent_hmr_boundary__${moduleId}`;
const DISPOSE_STORE_KEY = `__lithent_hmr_dispose__${moduleId}`;
const globalStore =
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

const ensureHotData = (): Record<string, unknown> | undefined => {
  if (!import.meta.hot) return undefined;
  try {
    import.meta.hot.data = import.meta.hot.data || {};
    return import.meta.hot.data;
  } catch {
    return undefined;
  }
};

const hotData = ensureHotData();

const counterBoundary: BoundaryController =
  (hotData?.counterBoundary as BoundaryController | undefined) ||
  (globalStore?.[BOUNDARY_STORE_KEY] as BoundaryController | undefined) ||
  createBoundary(moduleId);

if (hotData) {
  hotData.counterBoundary = counterBoundary;
}

if (globalStore) {
  globalStore[BOUNDARY_STORE_KEY] = counterBoundary;
}

const Counter = mount<{ id: string }>(renew => {
  void renew;
  const compKey = getComponentKey();
  const unregister = compKey ? counterBoundary.register(compKey) : null;
  if (unregister) {
    mountCallback(() => () => unregister());
  }

  return ({ id }) => {
    return <div id={`counter-${id}`}>original-{id}</div>;
  };
});

const App = () => (
  <div>
    <Counter id="first" />
    <Counter id="second" />
  </div>
);

export { Counter };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('updates all registered instances when boundary update runs', async () => {
    const wrap = document.createElement('div');
    render(<App />, wrap);

    const readText = (id: string) =>
      wrap.querySelector<HTMLDivElement>(`#counter-${id}`)?.textContent || '';

    const waitForUpdate = async () => {
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    };

    await waitForUpdate();

    expect(readText('first').startsWith('original')).toBe(true);
    expect(readText('second').startsWith('original')).toBe(true);

    const CounterNext = mount<{ id: string }>((renew, props) => {
      void renew;
      const unregister = counterBoundary.register(props);
      if (unregister) {
        mountCallback(() => () => unregister());
      }

      return ({ id }) => {
        return <div id={`counter-${id}`}>updated-{id}</div>;
      };
    });

    const updated = counterBoundary.update(
      CounterNext as unknown as TagFunction
    );

    expect(updated).toBe(true);
    await waitForUpdate();
    expect(readText('first')).toContain('updated');
    expect(readText('second')).toContain('updated');

    const CounterNext2 = mount<{ id: string }>((renew, props) => {
      void renew;
      const unregister = counterBoundary.register(props);
      if (unregister) {
        mountCallback(() => () => unregister());
      }

      return ({ id }) => {
        return <div id={`counter-${id}`}>latest-{id}</div>;
      };
    });

    const updatedAgain = counterBoundary.update(
      CounterNext2 as unknown as TagFunction
    );

    expect(updatedAgain).toBe(true);
    await waitForUpdate();
    expect(readText('first')).toContain('latest');
    expect(readText('second')).toContain('latest');
  });
}

let disposeApp =
  (hotData?.disposeApp as (() => void) | undefined) ||
  (globalStore?.[DISPOSE_STORE_KEY] as (() => void) | undefined);

if (!import.meta.vitest) {
  const rootElement =
    typeof document !== 'undefined'
      ? document.getElementById('root')
      : undefined;

  if (!disposeApp && rootElement) {
    disposeApp = render(<App />, rootElement);

    if (hotData) {
      hotData.disposeApp = disposeApp;
    }

    if (globalStore && disposeApp) {
      globalStore[DISPOSE_STORE_KEY] = disposeApp;
    }
  }
}

const setupHmrHooks = () => {
  if (!import.meta.hot) return;

  import.meta.hot.accept(mod => {
    const nextCounter = mod?.Counter as TagFunction | undefined;

    if (!nextCounter) {
      import.meta.hot?.invalidate?.();
      return;
    }

    const applied = counterBoundary.update(nextCounter);

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

    if (globalStore) {
      globalStore[BOUNDARY_STORE_KEY] = counterBoundary;

      if (disposeApp) {
        globalStore[DISPOSE_STORE_KEY] = disposeApp;
      }
    }
  });
};

setupHmrHooks();

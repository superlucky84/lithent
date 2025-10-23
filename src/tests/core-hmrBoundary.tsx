import { h, render, mount, mountCallback } from '@/index';
import { createBoundary } from '@/devmodetest/createBoundary';

const moduleId = new URL(import.meta.url).pathname;
const BOUNDARY_STORE_KEY = `__lithent_hmr_boundary__${moduleId}`;
const DISPOSE_STORE_KEY = `__lithent_hmr_dispose__${moduleId}`;
const globalStore =
  typeof globalThis === 'object'
    ? (globalThis as Record<string, unknown>)
    : undefined;

if (import.meta.vitest && globalStore) {
  delete globalStore[BOUNDARY_STORE_KEY];
  delete globalStore[DISPOSE_STORE_KEY];
}

type BoundaryController = ReturnType<typeof createBoundary>;

type HotRuntime = {
  data: Record<string, unknown>;
  accept: (cb: (mod: Record<string, unknown>) => void) => void;
  dispose: (cb: (data: Record<string, unknown>) => void) => void;
  invalidate?: () => void;
};

const metaWithHot = import.meta as ImportMeta & { hot?: HotRuntime };

let hotData: Record<string, unknown> | undefined;

if (metaWithHot.hot) {
  try {
    metaWithHot.hot.data = metaWithHot.hot.data || {};
    hotData = metaWithHot.hot.data;
  } catch {
    hotData = undefined;
  }
}

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

const Counter = mount<{ id: string }>((renew, props) => {
  void renew;
  const unregister = counterBoundary.register(props);
  if (unregister) {
    mountCallback(() => () => unregister());
  }

  return ({ id }) => {
    return <div id={`counter-${id}`}>009990-{id}</div>;
  };
});

const App = () => (
  <div>
    <Counter id="first" />
    <Counter id="second" />
  </div>
);

export { Counter };

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

// @ts-ignore
if (import.meta.hot) {
  console.log('v');
  // @ts-ignore
  import.meta.hot.accept(mod => {
    const nextCounter = mod?.Counter as unknown;

    console.log('111vv', nextCounter);

    /*
    if (typeof nextCounter !== 'function') {
      metaWithHot.hot?.invalidate?.();
      return;
    }
      */

    // @ts-ignore
    const applied = counterBoundary.update(nextCounter as TagFunction);

    if (!applied) {
      console.warn(
        '[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다.'
      );
      metaWithHot.hot?.invalidate?.();
    }
  });

  // @ts-ignore
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
}

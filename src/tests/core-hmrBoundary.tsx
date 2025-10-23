import { h, render, mount, mountCallback, nextTick } from '@/index';
import { createBoundary } from '@/devmodetest/createBoundary';

const moduleId = new URL(import.meta.url).pathname;
type BoundaryController = ReturnType<typeof createBoundary>;

type HotRuntime = {
  data: Record<string, unknown>;
  accept: (cb: (mod: Record<string, unknown>) => void) => void;
  dispose: (cb: (data: Record<string, unknown>) => void) => void;
};

const hot = (import.meta as ImportMeta & { hot?: HotRuntime }).hot;

const counterBoundary: BoundaryController =
  (hot?.data?.counterBoundary as BoundaryController | undefined) ||
  createBoundary(moduleId);

if (hot) {
  hot.data = hot.data || {};
  hot.data.counterBoundary = counterBoundary;
}

const Counter = mount<{ id: string }>((renew, props) => {
  void renew;
  const unregister = counterBoundary.register(props);
  if (unregister) {
    mountCallback(() => () => unregister());
  }

  return ({ id }) => {
    console.log('[hmr-test] render original', id);
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
        console.log('[hmr-test] render updated', id);
        return <div id={`counter-${id}`}>updated-{id}</div>;
      };
    });

    const updated = counterBoundary.update(CounterNext);

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
        console.log('[hmr-test] render latest', id);
        return <div id={`counter-${id}`}>latest-{id}</div>;
      };
    });

    const updatedAgain = counterBoundary.update(CounterNext2);

    expect(updatedAgain).toBe(true);
    await waitForUpdate();
    expect(readText('first')).toContain('latest');
    expect(readText('second')).toContain('latest');
  });
} else {
  const rootElement = document.getElementById('root');
  let disposeApp: (() => void) | undefined = hot?.data?.disposeApp;

  if (!disposeApp && rootElement) {
    disposeApp = render(<App />, rootElement);

    if (hot) {
      hot.data.disposeApp = disposeApp;
    }
  }

  if (hot) {
    hot.accept(mod => {
      const nextCounter = mod?.Counter;

      if (nextCounter) {
        const changed = counterBoundary.update(nextCounter);
        if (!changed) {
          console.warn(
            '[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다.'
          );
          window.location.reload();
        }
      }
    });

    hot.dispose(data => {
      if (disposeApp) {
        data.disposeApp = disposeApp;
      }
    });
  }
}

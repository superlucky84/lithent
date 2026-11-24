import * as core from 'lithent';
import { render as renderRoot } from 'lithent';
import type { WDom } from 'lithent';

/**
 * Render, wait for and clean up lithent components in tests
 * (docs/test-utils/DESIGN.md). Queries and events come from
 * `@testing-library/dom`, which works on the real DOM lithent renders; this
 * module only adds what is specific to lithent: knowing when an update has
 * reached the DOM, and taking rendered trees down again.
 */

export type RenderOptions = {
  /**
   * Render into this element instead of a new `<div>` appended to
   * `baseElement`. It is emptied, not removed, on unmount.
   */
  container?: HTMLElement;
  /** Where the new container is appended. Defaults to `document.body`. */
  baseElement?: HTMLElement;
};

export type RenderResult = {
  /** The element the component was rendered into. */
  container: HTMLElement;
  /** The element the container is attached to. */
  baseElement: HTMLElement;
  /** Takes this tree down: unmount callbacks run and its DOM is removed. */
  unmount: () => void;
};

type Mounted = {
  destroy: () => void;
  container: HTMLElement;
  owned: boolean;
};

const mounted = new Set<Mounted>();

const release = (entry: Mounted) => {
  if (!mounted.delete(entry)) return;
  try {
    entry.destroy();
  } finally {
    if (entry.owned) entry.container.remove();
  }
};

/**
 * Renders `ui` into a container attached to the document and returns it.
 * The first render, and the `mountCallback`s it runs, finish before this
 * returns; updates they schedule need `await act()`.
 */
export const render = (ui: WDom, options: RenderOptions = {}): RenderResult => {
  if (typeof document === 'undefined')
    throw new Error(
      "lithent/test: render needs a DOM. Run the test in a jsdom or happy-dom environment (Vitest: environment: 'jsdom')."
    );

  const owned = !options.container;
  const baseElement = options.baseElement || options.container || document.body;
  const container =
    options.container || baseElement.appendChild(document.createElement('div'));
  const entry: Mounted = {
    destroy: renderRoot(ui, container),
    container,
    owned,
  };
  mounted.add(entry);

  return { container, baseElement, unmount: () => release(entry) };
};

/**
 * Takes down every tree `render` created and removes the containers it made.
 * Registered with `afterEach` automatically when the test runner provides it
 * as a global (Vitest with `globals: true`, Jest). If taking one tree down
 * throws, the others are still taken down and the first error is thrown at
 * the end. (An unmount callback that throws does not stop the teardown:
 * lithent reports its error through `reportError`.)
 */
export const cleanup = () => {
  let failure: { error: unknown } | undefined;
  for (const entry of [...mounted]) {
    try {
      release(entry);
    } catch (error) {
      failure ||= { error };
    }
  }
  if (failure) throw failure.error;
};

/**
 * A task after everything already queued, including microtasks. A
 * MessageChannel rather than setTimeout, so fake timers do not stop it
 * (RQ-3); the concurrent core's low lane uses one too.
 */
const nextTask = () =>
  new Promise<void>(resolve => {
    if (typeof MessageChannel !== 'function') {
      setTimeout(resolve, 0);
      return;
    }
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });

type WhenIdle = () => Promise<void>;

/**
 * Whether `whenIdle()` is already settled. It returns a resolved promise when
 * nothing is pending, so a callback attached to it runs before a microtask
 * queued after it.
 */
const idleNow = async (whenIdle: WhenIdle) => {
  let idle = false;
  void whenIdle().then(() => {
    idle = true;
  });
  await Promise.resolve();
  return idle;
};

const MAX_ROUNDS = 100;

/**
 * Runs `fn`, then waits until lithent has drawn everything it caused, and
 * resolves with `fn`'s result. Without `fn` it only waits.
 *
 * - Base core: `renew()` draws in a microtask, so one task later the DOM is
 *   up to date, including renders that `mountCallback`s set off.
 * - Concurrent core (`lithent` aliased to `lithent-concurrent`): also waits
 *   for `deferRender` work, which the scheduler splits across tasks.
 *
 * It does not wait for your own timers or requests; use `findBy*` /
 * `waitFor` from `@testing-library/dom`, or fake timers, for those.
 */
export const act = async <T = void>(fn?: () => T | Promise<T>): Promise<T> => {
  const result = fn ? await fn() : (undefined as T);
  // Present only on the concurrent core: the same namespace lookup
  // lithent/helper uses for `notifyStoreWrite`.
  const whenIdle = (core as { whenIdle?: WhenIdle }).whenIdle;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    await nextTask();
    if (!whenIdle || (await idleNow(whenIdle))) return result;
    await whenIdle();
  }
  throw new Error(
    `lithent/test: rendering did not settle after ${MAX_ROUNDS} rounds. Does every update schedule another one?`
  );
};

// Same rule as @testing-library/react: clean up after each test when the
// runner exposes `afterEach` globally, unless the environment opts out.
const runner = globalThis as {
  afterEach?: (fn: () => void) => void;
  process?: { env?: Record<string, string | undefined> };
};
if (
  typeof runner.afterEach === 'function' &&
  !runner.process?.env?.LITHENT_TEST_SKIP_AUTO_CLEANUP
) {
  runner.afterEach(() => cleanup());
}

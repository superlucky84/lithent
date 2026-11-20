import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@/index';

// The waiting rule against a scheduler under the test's control. The real
// concurrent core (test-act, run with LITHENT_CORE=concurrent) finishes its
// slices before a test task in Node, so it cannot show that act waits for
// `whenIdle`; this stand-in can. `whenIdle` resolves at once when idle and
// otherwise after the remaining tasks of work, like the core's.
const scheduler = vi.hoisted(() => {
  const task = () => new Promise<void>(resolve => setTimeout(resolve, 0));
  const state = {
    busyTasks: 0,
    running: false,
    waiters: [] as (() => void)[],
    // Work that appears right after the scheduler goes idle.
    afterIdle: undefined as (() => void) | undefined,
    // whenIdle keeps reporting pending work: a loop that never ends.
    endless: false,
    task,
    // Runs `tasks` tasks of work in the background, like the low lane.
    start(tasks: number) {
      state.busyTasks = tasks;
      if (state.running) return;
      state.running = true;
      void (async () => {
        while (state.busyTasks > 0) {
          await task();
          state.busyTasks -= 1;
        }
        state.running = false;
        const waiters = state.waiters;
        state.waiters = [];
        waiters.forEach(resolve => resolve());
        const next = state.afterIdle;
        state.afterIdle = undefined;
        next?.();
      })();
    },
    // Side-effect free, like the core's: resolved now when idle.
    whenIdle(): Promise<void> {
      if (state.endless) return task();
      return state.running
        ? new Promise<void>(resolve => state.waiters.push(resolve))
        : Promise.resolve();
    },
  };
  return state;
});

vi.mock('lithent', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  whenIdle: () => scheduler.whenIdle(),
}));

beforeEach(() => {
  scheduler.afterIdle = undefined;
  scheduler.endless = false;
});

describe('act with a scheduler', () => {
  it('waits until whenIdle settles', async () => {
    await act(() => scheduler.start(5));
    expect(scheduler.busyTasks).toBe(0);
    expect(scheduler.running).toBe(false);
  });

  it('waits again for work that appears once the scheduler is idle', async () => {
    await act(() => {
      scheduler.afterIdle = () => scheduler.start(3);
      scheduler.start(2);
    });
    expect(scheduler.busyTasks).toBe(0);
    expect(scheduler.running).toBe(false);
    expect(scheduler.afterIdle).toBeUndefined();
  });

  it('gives up with a reason when the work never ends', async () => {
    scheduler.endless = true;
    await expect(act()).rejects.toThrow(/did not settle after 100 rounds/);
  });
});

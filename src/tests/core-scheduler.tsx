import type { Component, MiddleStateWDomChildren, CompKey } from '@/types';
import type { WorkScheduler } from '@/types/session';
import {
  Fragment,
  createScheduler,
  h,
  mount,
  ref,
  render,
  updateCallback,
} from '@/index';

const renderLog: string[] = [];
const pendingLog: boolean[] = [];
const updateTrigger = ref<null | (() => void)>(null);
const immediateUpdateTrigger = ref<null | (() => void)>(null);

type LevelProps = { updates: number };
type LevelComponent = (
  _props: LevelProps,
  _children?: MiddleStateWDomChildren
) => Component<LevelProps>;

const createLevel = (label: string, Child?: LevelComponent) =>
  mount<LevelProps>(() => {
    updateCallback(() => {
      console.log('claenup', label);
      return () => {
        console.log('UPDATED', label);
      };
    });

    return ({ updates }) => {
      renderLog.push(label);
      return (
        <Fragment>
          <span>
            {label} (updates: {updates})
          </span>
          {Child ? <Child updates={updates} /> : null}
        </Fragment>
      );
    };
  });

const Level5 = createLevel('Level5');
const Level4 = createLevel('Level4', Level5);
const Level3 = createLevel('Level3', Level4);
const Level2 = createLevel('Level2', Level3);
const Level1 = createLevel('Level1', Level2);

const createDelayedScheduler = (): WorkScheduler => {
  const queue: Array<{ key: CompKey; work: () => void }> = [];
  let draining = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const scheduleTimer = () => {
    if (timerId || !queue.length) {
      return;
    }

    timerId = setTimeout(() => {
      const job = queue.shift();
      if (job) {
        job.work();
      }
      timerId = null;
      if (queue.length) {
        scheduleTimer();
      } else {
        draining = false;
      }
    }, 1000);
  };

  const runNext = () => {
    if (!queue.length) {
      draining = false;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      return;
    }

    scheduleTimer();
  };

  return {
    scheduleWork(key, work) {
      queue.push({ key, work });
      if (!draining) {
        draining = true;
        runNext();
      }
    },
    cancelWork(key) {
      for (let i = queue.length - 1; i >= 0; i -= 1) {
        if (queue[i].key === key) {
          queue.splice(i, 1);
        }
      }

      if (!queue.length) {
        draining = false;
      }
    },
  };
};

const { bindRenewScheduler, cancelPendingWork } = createScheduler(
  createDelayedScheduler()
);

const App = mount((renew, _props) => {
  let pendingState = false;
  const renewWithScheduler = bindRenewScheduler(renew, {
    onPendingChange(newState) {
      pendingState = newState;
      pendingLog.push(newState);
    },
  });
  let updates = 0;

  const trigger = () => {
    updates += 1;
    renewWithScheduler();
  };

  const runManualUpdate = () => {
    renderLog.length = 0;
    trigger();
  };
  const runUpdate = () => {
    cancelPendingWork();
    updates += 1;
    renew();
  };

  updateTrigger.value = trigger;
  immediateUpdateTrigger.value = runUpdate;

  return () => {
    renderLog.push('App');
    return (
      <Fragment>
        <button type="button" onClick={runManualUpdate}>
          Schedule deferred render
        </button>
        <button type="button" onClick={runUpdate}>
          sync run
        </button>
        <p>Each level below mounts 2 seconds apart.</p>
        <div data-pending>{pendingState ? 'pending' : 'idle'}</div>
        <div>updates: {updates}</div>
        <Level1 updates={updates} />
      </Fragment>
    );
  };
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

if (!import.meta.vitest) {
  render(<App />, testWrap);
}

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;

  render(<App />, testWrap);

  describe('core scheduler', () => {
    it('runs deferred children through the provided scheduler every 2 seconds', () => {
      vi.useFakeTimers();

      expect(updateTrigger.value).toBeTypeOf('function');

      const levelSpanTexts = () =>
        Array.from(testWrap.querySelectorAll('span')).map(
          span => span.textContent
        );
      const latestPending = () =>
        pendingLog.length ? pendingLog[pendingLog.length - 1] : undefined;

      renderLog.length = 0;
      pendingLog.length = 0;
      updateTrigger.value?.();

      expect(latestPending()).toBe(true);

      const expectedOrder = [
        'App',
        'Level1',
        'Level2',
        'Level3',
        'Level4',
        'Level5',
      ];

      expectedOrder.forEach((label, index) => {
        expect(renderLog).toHaveLength(index);
        vi.advanceTimersByTime(999);
        expect(renderLog).toHaveLength(index);
        vi.advanceTimersByTime(1);
        expect(renderLog).toHaveLength(index + 1);
        expect(renderLog[index]).toBe(label);

        if (label !== 'App') {
          const text = levelSpanTexts()[index - 1] || '';
          expect(text).toBe(`${label} (updates: 1)`);
        }
      });

      expect(latestPending()).toBe(false);

      vi.useRealTimers();
    });

    it('cancels pending deferred work when a synchronous renew runs first', () => {
      vi.useFakeTimers();

      renderLog.length = 0;
      const latestPending = () =>
        pendingLog.length ? pendingLog[pendingLog.length - 1] : undefined;

      pendingLog.length = 0;
      updateTrigger.value?.(); // schedule deferred run

      expect(latestPending()).toBe(true);

      // run synchronous update which should cancel queued work
      immediateUpdateTrigger.value?.();
      expect(latestPending()).toBe(false);
      const lengthAfterSync = renderLog.length;

      vi.advanceTimersByTime(4000);
      expect(renderLog).toHaveLength(lengthAfterSync);

      vi.useRealTimers();
    });
  });
}

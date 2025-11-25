import type { Component, MiddleStateWDomChildren, CompKey } from '@/types';
import type { WorkScheduler } from '@/types/session';
import { Fragment, h, mount, ref, render, updateCallback } from '@/index';

const renderLog: string[] = [];
const updateTrigger = ref<null | (() => void)>(null);

type LevelProps = { updates: number };
type LevelComponent = (
  _props: LevelProps,
  _children?: MiddleStateWDomChildren
) => Component<LevelProps>;

const createLevel = (label: string, Child?: LevelComponent) =>
  mount<LevelProps>(() => {
    updateCallback(() => {
      return () => {};
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

  return {
    scheduleWork(key, work) {
      queue.push({ key, work });
      if (!draining) {
        draining = true;
        scheduleTimer();
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
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      }
    },
  };
};

const scheduler = createDelayedScheduler();

const App = mount((renew, _props) => {
  let updates = 0;

  const trigger = () => {
    updates += 1;
    renew();
  };

  updateTrigger.value = trigger;

  return () => {
    renderLog.push('App');
    return (
      <Fragment>
        <button type="button" onClick={trigger}>
          Schedule deferred render
        </button>
        <p>Each level below mounts 1 second apart.</p>
        <div>updates: {updates}</div>
        <Level1 updates={updates} />
      </Fragment>
    );
  };
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

const mountAppWithScheduler = () =>
  render(<App />, testWrap, undefined, undefined, { scheduler });

if (!import.meta.vitest) {
  mountAppWithScheduler();
}

if (import.meta.vitest) {
  const { describe, expect, it, vi, beforeEach, afterEach } = import.meta
    .vitest;
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    renderLog.length = 0;
    destroy = mountAppWithScheduler();
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    renderLog.length = 0;
  });

  describe('core scheduler', () => {
    it('runs deferred children through the provided scheduler every second', () => {
      vi.useFakeTimers();

      expect(updateTrigger.value).toBeTypeOf('function');

      renderLog.length = 0;
      updateTrigger.value?.();

      const levelSpanTexts = () =>
        Array.from(testWrap.querySelectorAll('span')).map(
          span => span.textContent
        );

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

      vi.useRealTimers();
    });

    it('defers renew calls when scheduler is provided via render options', () => {
      vi.useFakeTimers();

      const delayedScheduler = createDelayedScheduler();
      const localRenderLog: number[] = [];
      const localTrigger = ref<null | (() => void)>(null);

      const LocalApp = mount((renew, _props) => {
        let updates = 0;

        const trigger = () => {
          updates += 1;
          renew();
        };

        return () => {
          localRenderLog.push(updates);
          localTrigger.value = trigger;
          return <div>updates: {updates}</div>;
        };
      });

      const destroyLocal = render(
        <LocalApp />,
        testWrap,
        undefined,
        undefined,
        { scheduler: delayedScheduler }
      );

      localRenderLog.length = 0;
      localTrigger.value?.();

      expect(localRenderLog).toHaveLength(0);

      vi.advanceTimersByTime(1000);
      expect(localRenderLog).toHaveLength(1);
      expect(localRenderLog[0]).toBe(1);

      destroyLocal?.();
      vi.useRealTimers();
    });
  });
}

import type { Component, MiddleStateWDomChildren } from '@/types';
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
const updateTrigger = ref<null | (() => void)>(null);

type LevelProps = { updates: number };
type LevelComponent = (
  _props: LevelProps,
  _children?: MiddleStateWDomChildren
) => Component<LevelProps>;

const createLevel = (label: string, Child?: LevelComponent) =>
  mount<LevelProps>(() => {
    updateCallback(() => {
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
  const queue: Array<() => void> = [];
  let draining = false;

  const runNext = () => {
    if (!queue.length) {
      draining = false;
      return;
    }

    setTimeout(() => {
      const job = queue.shift();
      job && job();
      runNext();
    }, 1000);
  };

  return {
    scheduleWork(_key, work) {
      queue.push(work);
      if (!draining) {
        draining = true;
        runNext();
      }
    },
  };
};

const { bindRenewScheduler } = createScheduler(createDelayedScheduler());

const App = mount((renew, _props) => {
  const renewWithScheduler = bindRenewScheduler(renew);
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
    updates += 1;
    renew();
  };

  updateTrigger.value = trigger;

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
  });
}

import { describe, expect, it, vi } from 'vitest';
import type { WorkScheduler } from '@/types/session';
import { Fragment, createScheduler, h, mount, ref, render } from '@/index';

const renderLog: string[] = [];
const updateTrigger = ref<null | (() => void)>(null);

const createLevel = (label: string, Child?: ReturnType<typeof mount>) =>
  mount((_renew, _props) => {
    return () => {
      renderLog.push(label);
      return (
        <Fragment>
          <span>{label}</span>
          {Child ? <Child /> : null}
        </Fragment>
      );
    };
  });

const Level5 = createLevel('Level5');
const Level4 = createLevel('Level4', Level5);
const Level3 = createLevel('Level3', Level4);
const Level2 = createLevel('Level2', Level3);
const Level1 = createLevel('Level1', Level2);

const App = mount((renew, _props) => {
  const { bindRenewScheduler } = createScheduler(createDelayedScheduler());
  const renewWithScheduler = bindRenewScheduler(renew);
  let updates = 0;

  const trigger = () => {
    updates += 1;
    renewWithScheduler();
  };

  updateTrigger.value = trigger;

  return () => {
    renderLog.push('App');
    return (
      <Fragment>
        <div>updates: {updates}</div>
        <Level1 />
      </Fragment>
    );
  };
});

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
    }, 2000);
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

if (import.meta.vitest) {
  describe('core scheduler', () => {
    it('runs deferred children through the provided scheduler every 2 seconds', () => {
      vi.useFakeTimers();

      const container = document.createElement('div');
      render(<App />, container);

      expect(updateTrigger.value).toBeTypeOf('function');

      renderLog.length = 0;
      updateTrigger.value?.();

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
        vi.advanceTimersByTime(1999);
        expect(renderLog).toHaveLength(index);
        vi.advanceTimersByTime(1);
        expect(renderLog).toHaveLength(index + 1);
        expect(renderLog[index]).toBe(label);
      });

      vi.useRealTimers();
    });
  });
}

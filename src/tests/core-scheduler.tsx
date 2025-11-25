import type { Component, MiddleStateWDomChildren, CompKey } from '@/types';
import type { WorkScheduler } from '@/types/session';
import { Fragment, h, mount, render, updateCallback } from '@/index';

const renderLog: string[] = [];

type LevelProps = { updates: number };
type LevelComponent = (
  _props: LevelProps,
  _children?: MiddleStateWDomChildren
) => Component<LevelProps>;

const createLevel = (label: string, Child?: LevelComponent) =>
  mount<LevelProps>(() => {
    updateCallback(() => {
      console.log('cleanup', label);
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

const updatePendingLabel = (pending: boolean) => {
  const indicator = document.querySelector<HTMLElement>('[data-pending-state]');
  if (indicator) {
    indicator.textContent = pending ? 'pending' : 'idle';
  }
};

const createDelayedScheduler = (
  onPendingChange?: (pending: boolean) => void
): WorkScheduler => {
  const queue: Array<{ key: CompKey; work: () => void }> = [];
  let draining = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const notifyPending = () => {
    onPendingChange?.(draining || queue.length > 0);
  };

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
        notifyPending();
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
      notifyPending();
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
      notifyPending();
    },
  };
};

const scheduler = createDelayedScheduler(updatePendingLabel);

const App = mount((renew, _props) => {
  let updates = 0;

  const scheduleDeferredRender = () => {
    renderLog.length = 0;
    updates += 1;
    console.log('Queued render wave', updates);
    renew();
  };

  const reset = () => {
    renderLog.length = 0;
    updates = 0;
    renew();
  };

  (globalThis as Record<string, unknown>).__lithentSchedulerDemo = {
    scheduleDeferredRender,
    reset,
    renderLog,
  };

  return () => {
    renderLog.push('App');
    return (
      <Fragment>
        <h1>Concurrent Scheduler Demo</h1>
        <p>
          이 데모는 <code>render</code> 호출 시 스케줄러 옵션을 전달하면 모든{' '}
          <code>renew</code> 업데이트가 지연 실행되는 모습을 보여줍니다.
        </p>

        <div class="controls">
          <button type="button" onClick={scheduleDeferredRender}>
            Schedule deferred render
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </div>

        <div class="status">
          pending 상태: <span data-pending-state>idle</span>
        </div>
        <div>updates: {updates}</div>

        <section class="render-log">
          <h2>Render order</h2>
          <ol>
            {renderLog.map((label, index) => (
              <li key={`${label}-${index}`}>{label}</li>
            ))}
          </ol>
        </section>

        <Level1 updates={updates} />
      </Fragment>
    );
  };
});

const root =
  document.getElementById('root') ||
  document.body.appendChild(document.createElement('div'));

render(<App />, root, undefined, undefined, { scheduler });

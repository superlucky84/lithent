import { createLatestTask } from './latest';
import type { LatestTask, TaskHandlers, TaskOutcome, TaskWork } from './latest';
import type { ActivityScope } from './activity';

export type TaskLifetime = 'activity' | 'instance';

/** Activity work gets a fresh group each activation; instance work survives hiding. */
export const createScopedTask = (
  scope: ActivityScope,
  lifetime: TaskLifetime = 'activity'
): LatestTask => {
  if (lifetime === 'instance') return createLatestTask(scope);
  let current: LatestTask | undefined;
  scope.onActive(activity => {
    const task = createLatestTask(activity);
    current = task;
    return () => {
      if (current === task) current = undefined;
    };
  });
  return {
    cancel() {
      current?.cancel();
    },
    run<T>(
      work: TaskWork<T>,
      handlers: TaskHandlers<T> = {}
    ): Promise<TaskOutcome<T>> {
      // The session is cleared before abort listeners run, even though the
      // onActive cleanup clearing this group runs a little later.
      if (!scope.active || !current)
        return Promise.resolve({ status: 'stale' });
      return current.run(work, handlers);
    },
  };
};

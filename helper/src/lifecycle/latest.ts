import type { OwnerScope } from './scope';

export interface TaskHandlers<T> {
  success?: (value: T) => void;
  error?: (error: unknown) => void;
  pending?: (pending: boolean) => void;
}

export type TaskOutcome<T> =
  | { status: 'success'; value: T }
  | { status: 'error'; error: unknown }
  | { status: 'stale' };

export type TaskWork<T> = (signal: AbortSignal) => T | PromiseLike<T>;

export interface LatestTask {
  cancel(): void;
  run<T>(
    work: TaskWork<T>,
    handlers?: TaskHandlers<T>
  ): Promise<TaskOutcome<T>>;
}

/** One latest-only group. Create separate groups for independent operations. */
export const createLatestTask = (
  scope: Pick<OwnerScope, 'disposed' | 'own'>
): LatestTask => {
  let current: AbortController | undefined;

  const cancel = () => {
    const previous = current;
    current = undefined;
    previous?.abort();
  };
  scope.own(cancel);

  return {
    cancel,
    async run<T>(
      work: TaskWork<T>,
      handlers: TaskHandlers<T> = {}
    ): Promise<TaskOutcome<T>> {
      if (scope.disposed) return { status: 'stale' };
      const previous = current;
      const controller = new AbortController();
      current = controller;
      // Publish the new identity before abort: abort listeners can re-enter run.
      previous?.abort();
      const valid = () => !scope.disposed && current === controller;
      if (!valid()) return { status: 'stale' };

      try {
        handlers.pending?.(true);
        if (!valid()) return { status: 'stale' };
        let value: T;
        try {
          value = await work(controller.signal);
        } catch (error) {
          if (!valid()) return { status: 'stale' };
          handlers.error?.(error);
          return { status: 'error', error };
        }
        if (!valid()) return { status: 'stale' };
        handlers.success?.(value);
        return { status: 'success', value };
      } finally {
        if (valid()) {
          try {
            handlers.pending?.(false);
          } finally {
            // A pending observer may itself have started the next request.
            if (current === controller) current = undefined;
          }
        }
      }
    },
  };
};

import { createOwnerScope } from './scope';
import type { Cleanup, OwnerScope } from './scope';

export interface Activity extends Pick<OwnerScope, 'disposed' | 'own'> {
  readonly signal: AbortSignal;
}

export interface ActivityScope extends OwnerScope {
  readonly active: boolean;
  readonly activity: Activity | undefined;
  activate(): void;
  deactivate(): void;
  onActive(start: (activity: Activity) => void | Cleanup): Cleanup;
}

type Registration = {
  start: (activity: Activity) => void | Cleanup;
  session?: Activity;
  release?: Cleanup;
};
type Session = Activity & Pick<OwnerScope, 'dispose'>;

/** Initially inactive. Instance resources and activity resources are separate. */
export const createActivityScope = (): ActivityScope => {
  const owner = createOwnerScope();
  const registrations = new Set<Registration>();
  let current: Session | undefined;
  let requested = false;
  let changing = false;

  const stop = () => {
    const previous = current;
    current = undefined;
    for (const entry of registrations) {
      if (entry.session === previous) {
        entry.session = undefined;
        entry.release = undefined;
      }
    }
    previous?.dispose();
  };

  const reconcile = () => {
    if (changing) return;
    changing = true;
    const errors: unknown[] = [];
    try {
      while (requested && !owner.disposed) {
        if (!current) {
          const session = createOwnerScope();
          const controller = new AbortController();
          session.own(() => controller.abort());
          current = {
            get disposed() {
              return session.disposed;
            },
            signal: controller.signal,
            own: session.own,
            dispose: session.dispose,
          };
        }
        const session = current;
        for (const entry of registrations) {
          if (current !== session || !requested || owner.disposed) break;
          if (entry.session === session) continue;
          entry.session = session;
          try {
            const cleanup = entry.start(session);
            if (cleanup) {
              const release = session.own(cleanup);
              if (
                registrations.has(entry) &&
                current === session &&
                !session.disposed
              )
                entry.release = release;
              else release();
            }
          } catch (error) {
            errors.push(error);
            requested = false;
            try {
              stop();
            } catch (failure) {
              errors.push(failure);
            }
            requested = false;
            break;
          }
        }
        if (current === session) break;
      }
    } finally {
      changing = false;
    }
    if (errors.length)
      throw new AggregateError(errors, 'Activity start failed');
  };

  const deactivate = () => {
    requested = false;
    const wasChanging = changing;
    changing = true;
    const errors: unknown[] = [];
    try {
      stop();
    } catch (error) {
      errors.push(error);
    } finally {
      changing = wasChanging;
    }
    // Re-entrant activation waits until every old cleanup has finished.
    try {
      reconcile();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length) throw new AggregateError(errors, 'Activity stop failed');
  };

  owner.own(() => {
    try {
      deactivate();
    } finally {
      registrations.clear();
    }
  });

  return {
    get disposed() {
      return owner.disposed;
    },
    get active() {
      return current !== undefined;
    },
    get activity() {
      return current;
    },
    own: owner.own,
    dispose: owner.dispose,
    activate() {
      if (owner.disposed) return;
      requested = true;
      reconcile();
    },
    deactivate,
    onActive(start) {
      if (owner.disposed) return () => {};
      const entry: Registration = { start };
      registrations.add(entry);
      const unregister = owner.own(() => {
        registrations.delete(entry);
        entry.release?.();
      });
      try {
        reconcile();
      } catch (error) {
        unregister();
        throw error;
      }
      return unregister;
    },
  };
};

import { h, mount, render } from 'lithent';
import type { MiddleStateWDom, Renew, WDom } from 'lithent';
import { createActivityScope } from './activity';
import type { ActivityScope } from './activity';

/** Explicit retained root, initially hidden. It does not intercept child renew. */
export const createRetainedView = (
  host: HTMLElement,
  initialize: (renew: Renew, scope: ActivityScope) => () => MiddleStateWDom
) => {
  const scope = createActivityScope();
  const container = document.createElement('div');
  container.hidden = true;
  let dirty = false;
  let queued = false;
  let disposed = false;
  let update!: Renew;

  const renew: Renew = () => {
    if (scope.disposed) return false;
    dirty = true;
    if (scope.active && !queued) {
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (scope.active && !scope.disposed && dirty) update();
      });
    }
    return true;
  };

  const Root = mount(nativeRenew => {
    update = nativeRenew;
    const draw = initialize(renew, scope);
    let previous: WDom | undefined;
    return () => {
      if (!previous || scope.active) {
        dirty = false;
        // Always keep a concrete root: diff mutates its children to the
        // resolved tree, so the cached object is the actual retained subtree.
        previous = h('div', {}, draw()) as WDom;
      } else {
        // A core redraw might already be queued when hide() is called.
        dirty = true;
      }
      return previous;
    };
  });

  host.appendChild(container);
  let destroy: () => void;
  try {
    destroy = render(h(Root, {}), container);
  } catch (error) {
    const errors = [error];
    try {
      scope.dispose();
    } catch (failure) {
      errors.push(failure);
    } finally {
      container.remove();
    }
    if (errors.length > 1)
      throw new AggregateError(errors, 'Retained view initialization failed');
    throw error;
  }

  return {
    scope,
    show() {
      if (scope.disposed) return;
      try {
        scope.activate();
      } finally {
        container.hidden = !scope.active;
      }
      if (dirty) renew();
    },
    hide() {
      try {
        scope.deactivate();
      } finally {
        container.hidden = !scope.active;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const errors: unknown[] = [];
      try {
        scope.dispose();
      } catch (error) {
        errors.push(error);
      }
      try {
        destroy();
      } catch (error) {
        errors.push(error);
      }
      container.remove();
      if (errors.length)
        throw new AggregateError(errors, 'Retained view cleanup failed');
    },
  };
};

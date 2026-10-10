import { h, mount, mountCallback, updateCallback } from 'lithent';
import { createRetainedView } from './retainedView';
import { useOwnerScope } from './lithent';

export interface RetainedHostProps {
  active?: boolean;
}

/** A committed host owns a separate retained root; removal still disposes it. */
export const createRetainedHost = (
  initialize: Parameters<typeof createRetainedView>[1],
  reportCleanupError: (error: unknown) => void = console.error
) =>
  mount<RetainedHostProps>((_renew, initial) => {
    const owner = useOwnerScope(reportCleanupError);
    const slot: { value?: HTMLElement } = {};
    let active = initial.active === true;
    let view: ReturnType<typeof createRetainedView> | undefined;
    const sync = () => {
      if (owner.disposed) return;
      if (active) view?.show();
      else view?.hide();
    };

    mountCallback(() => {
      // Defer the nested render until the outer mount queue has finished.
      // This also guards a host removed before its deferred creation.
      queueMicrotask(() => {
        if (owner.disposed) return;
        const created = createRetainedView(slot.value!, initialize);
        owner.own(created.dispose);
        view = created;
        sync();
      });
    });
    // updateCallback queues its returned function for the DOM commit.
    updateCallback(() => sync);
    return props => {
      active = props.active === true;
      return h('div', { ref: slot });
    };
  });

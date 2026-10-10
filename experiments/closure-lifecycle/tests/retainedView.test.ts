import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount, mountCallback, nextTick } from 'lithent';
import type { Renew } from 'lithent';
import { createRetainedView, createScopedTask } from '../src';
import { deferred } from './deferred';

const views: Array<ReturnType<typeof createRetainedView>> = [];
const flush = async () => {
  await Promise.resolve();
  await nextTick();
};
const host = () => {
  const element = document.createElement('section');
  document.body.appendChild(element);
  return element;
};
afterEach(() => {
  for (const view of views.splice(0)) view.dispose();
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe('explicit retained root', () => {
  it('preserves closure, draft history and DOM identity without rerunning initialization', async () => {
    const element = host();
    let initializations = 0;
    const view = createRetainedView(element, renew => {
      initializations++;
      let draft = '';
      const history: string[] = [];
      return () =>
        h(
          'div',
          {},
          h('input', {
            value: draft,
            onInput: (event: Event) => {
              history.push(draft);
              draft = (event.target as HTMLInputElement).value;
              renew();
            },
          }),
          h(
            'button',
            {
              onClick: () => {
                draft = history.pop() ?? '';
                renew();
              },
            },
            'Undo'
          )
        );
    });
    views.push(view);
    view.show();
    const input = element.querySelector('input')!;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    await flush();
    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    await flush();
    view.hide();
    expect((element.firstElementChild as HTMLElement).hidden).toBe(true);
    view.show();
    await flush();
    expect(element.querySelector('input')).toBe(input);
    expect(input.value).toBe('ab');
    element.querySelector('button')!.click();
    await flush();
    expect(input.value).toBe('a');
    expect(initializations).toBe(1);
  });

  it('stops subscriptions and polling while hidden, then catches up only once', async () => {
    vi.useFakeTimers();
    const element = host();
    let renew!: Renew;
    let value = 0;
    let renders = 0;
    let subscribers = 0;
    const view = createRetainedView(element, (update, scope) => {
      renew = update;
      scope.onActive(activity => {
        subscribers++;
        const timer = setInterval(() => {}, 20);
        activity.own(() => {
          clearInterval(timer);
          subscribers--;
        });
      });
      return () => {
        renders++;
        return h('span', {}, String(value));
      };
    });
    views.push(view);
    expect(subscribers).toBe(0);
    view.show();
    view.show();
    expect(subscribers).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    const before = renders;
    view.hide();
    expect(subscribers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    for (let i = 1; i <= 5; i++) {
      value = i;
      renew();
    }
    await flush();
    expect(renders).toBe(before);
    expect(element.textContent).toBe('0');
    view.show();
    await flush();
    expect(renders).toBe(before + 1);
    expect(element.textContent).toBe('5');
    expect(subscribers).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    view.dispose();
    expect(subscribers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains child component instances across queued hiding and a dirty catch-up', async () => {
    const element = host();
    const initialize = vi.fn();
    const cleanup = vi.fn();
    let renew!: Renew;
    let label = 'first';
    const Child = mount<{ label?: string }>(() => {
      initialize();
      mountCallback(() => cleanup);
      return props => h('input', { value: props.label });
    });
    const view = createRetainedView(element, update => {
      renew = update;
      return () => h(Child, { label });
    });
    views.push(view);
    view.show();
    const input = element.querySelector('input');
    label = 'second';
    renew();
    await Promise.resolve();
    view.hide();
    await flush();
    expect(element.querySelector('input')).toBe(input);
    expect(input!.value).toBe('first');
    view.show();
    await flush();
    expect(input!.value).toBe('second');
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
    view.dispose();
    view.dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    'blocks a queued renew when hiding (already queued in core=%s)',
    async queuedInCore => {
      const element = host();
      let renew!: Renew;
      let value = 0;
      let renders = 0;
      const view = createRetainedView(element, update => {
        renew = update;
        return () => {
          renders++;
          return h('span', {}, String(value));
        };
      });
      views.push(view);
      view.show();
      value = 1;
      renew();
      if (queuedInCore) await Promise.resolve();
      view.hide();
      await flush();
      expect(element.textContent).toBe('0');
      expect(renders).toBe(1);
      view.show();
      await flush();
      expect(element.textContent).toBe('1');
      expect(renders).toBe(2);
    }
  );

  it('lets instance work update the hidden model without drawing or retrying it', async () => {
    const element = host();
    const result = deferred<string>();
    let save!: ReturnType<typeof createScopedTask>;
    let renders = 0;
    let start!: () => ReturnType<typeof save.run<string>>;
    const view = createRetainedView(element, (renew, scope) => {
      save = createScopedTask(scope, 'instance');
      let state = 'editing';
      start = () =>
        save.run(() => result.promise, {
          success: value => {
            state = value;
            renew();
          },
        });
      return () => {
        renders++;
        return h('span', {}, state);
      };
    });
    views.push(view);
    view.show();
    const saving = start();
    view.hide();
    result.resolve('saved');
    expect(await saving).toEqual({ status: 'success', value: 'saved' });
    await flush();
    expect(renders).toBe(1);
    expect(element.textContent).toBe('editing');
    view.show();
    await flush();
    expect(renders).toBe(2);
    expect(element.textContent).toBe('saved');
  });

  it('does not revive disposed DOM from a queued update or a late result', async () => {
    const element = host();
    let renew!: Renew;
    const view = createRetainedView(element, update => {
      renew = update;
      return () => h('span', {}, 'content');
    });
    views.push(view);
    view.show();
    renew();
    await Promise.resolve();
    view.dispose();
    view.dispose();
    view.show();
    expect(renew()).toBe(false);
    await flush();
    expect(element.childNodes).toHaveLength(0);
  });

  it('removes the retained root even when activity cleanup fails', () => {
    const element = host();
    const instance = vi.fn();
    const view = createRetainedView(element, (_renew, scope) => {
      scope.own(instance);
      scope.onActive(() => () => {
        throw new Error('cleanup');
      });
      return () => h('span', {}, 'content');
    });
    views.push(view);
    view.show();
    expect(() => view.dispose()).toThrow(AggregateError);
    expect(instance).toHaveBeenCalledTimes(1);
    expect(element.childNodes).toHaveLength(0);
  });

  it('preserves initialization and cleanup failures while removing the failed root', () => {
    const element = host();
    const setupError = new Error('setup');
    const cleanupError = new Error('cleanup');
    const cleanup = vi.fn(() => {
      throw cleanupError;
    });
    let failure: AggregateError | undefined;
    try {
      createRetainedView(element, (_renew, scope) => {
        scope.own(cleanup);
        throw setupError;
      });
    } catch (error) {
      failure = error as AggregateError;
    }
    expect(failure).toBeInstanceOf(AggregateError);
    expect(failure!.errors[0]).toBe(setupError);
    expect((failure!.errors[1] as AggregateError).errors).toContain(
      cleanupError
    );
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(element.childNodes).toHaveLength(0);
  });

  it('documents the boundary: unmanaged child renew still runs while its root is hidden', async () => {
    const element = host();
    let increment!: () => void;
    const Child = mount(renew => {
      let value = 0;
      increment = () => {
        value++;
        renew();
      };
      return () => h('span', {}, String(value));
    });
    const view = createRetainedView(element, () => () => h(Child, {}));
    views.push(view);
    view.show();
    view.hide();
    increment();
    await flush();
    expect(view.scope.active).toBe(false);
    expect(element.textContent).toBe('1');
    expect((element.firstElementChild as HTMLElement).hidden).toBe(true);
  });
});

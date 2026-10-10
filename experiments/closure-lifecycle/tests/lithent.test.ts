import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount, mountCallback, nextTick, render } from 'lithent';
import { defineElement } from '../../../element/src/index';
import { createLatestTask, useOwnerScope } from '../src';
import type { OwnerScope } from '../src';
import { deferred } from './deferred';

const destroys: Array<() => void> = [];
afterEach(async () => {
  destroys.splice(0).forEach(destroy => destroy());
  document.body.replaceChildren();
  await nextTick();
  vi.useRealTimers();
});

describe('Lithent ownership adapter (same cases for base and concurrent)', () => {
  it('starts at mount, keeps the same closure on renew, and cleans timers on destroy', async () => {
    vi.useFakeTimers();
    let scope!: OwnerScope;
    let renew!: () => boolean;
    let initializations = 0;
    let ticks = 0;
    const Probe = mount(update => {
      initializations++;
      renew = update;
      scope = useOwnerScope();
      mountCallback(() => {
        const timer = setInterval(() => ticks++, 10);
        scope.own(() => clearInterval(timer));
      });
      return () => h('span', {}, String(ticks));
    });
    const node = h(Probe, {});
    expect(vi.getTimerCount()).toBe(0);
    const root = document.createElement('div');
    const destroy = render(node, root);
    destroys.push(destroy);
    const firstScope = scope;
    vi.advanceTimersByTime(20);
    renew();
    await nextTick();
    expect(root.textContent).toBe('2');
    expect(scope).toBe(firstScope);
    expect(initializations).toBe(1);
    destroy();
    destroy();
    expect(scope.disposed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(root.textContent).toBe('');
  });

  it('blocks late UI observers and releases a resource acquired after unmount', async () => {
    let scope!: OwnerScope;
    const response = deferred<string>();
    const lateCleanup = vi.fn();
    const success = vi.fn();
    const pending = vi.fn();
    let signal!: AbortSignal;
    let run!: ReturnType<ReturnType<typeof createLatestTask>['run']>;
    const Probe = mount(renew => {
      scope = useOwnerScope();
      const search = createLatestTask(scope);
      let result = '';
      mountCallback(() => {
        run = search.run(
          async s => {
            signal = s;
            const value = await response.promise;
            scope.own(lateCleanup);
            return value;
          },
          {
            pending,
            success: value => {
              success(value);
              result = value;
              renew();
            },
          }
        );
      });
      return () => h('span', {}, result);
    });
    const root = document.createElement('div');
    const destroy = render(h(Probe, {}), root);
    destroys.push(destroy);
    destroy();
    expect(signal.aborted).toBe(true);
    response.resolve('late');
    expect(await run).toEqual({ status: 'stale' });
    await nextTick();
    expect(success).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true]]);
    expect(lateCleanup).toHaveBeenCalledTimes(1);
    expect(root.textContent).toBe('');
  });

  it('reports a parent cleanup error while still cleaning children and removing DOM', () => {
    const report = vi.fn();
    const childCleanup = vi.fn();
    const remainingCleanup = vi.fn();
    const Child = mount(() => {
      const scope = useOwnerScope();
      mountCallback(() => {
        scope.own(childCleanup);
      });
      return () => h('i', {}, 'child');
    });
    const Parent = mount(() => {
      const scope = useOwnerScope(report);
      mountCallback(() => {
        scope.own(() => {
          throw new Error('parent resource');
        });
        scope.own(remainingCleanup);
      });
      return () => h('div', {}, h(Child, {}));
    });
    const root = document.createElement('div');
    const destroy = render(h(Parent, {}), root);
    destroys.push(destroy);
    expect(() => destroy()).not.toThrow();
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toBeInstanceOf(AggregateError);
    expect(remainingCleanup).toHaveBeenCalledTimes(1);
    expect(childCleanup).toHaveBeenCalledTimes(1);
    expect(root.textContent).toBe('');
  });

  it('does not resurrect an instance when a guarded observer queued renew just before destroy', async () => {
    const response = deferred<string>();
    let run!: ReturnType<ReturnType<typeof createLatestTask>['run']>;
    const Probe = mount(renew => {
      const scope = useOwnerScope();
      const task = createLatestTask(scope);
      let result = '';
      mountCallback(() => {
        run = task.run(() => response.promise, {
          success: value => {
            result = value;
            renew();
          },
        });
      });
      return () => h('span', {}, result);
    });
    const root = document.createElement('div');
    const destroy = render(h(Probe, {}), root);
    destroys.push(destroy);
    response.resolve('ready');
    // Run the task observer; its render microtask has not flushed yet.
    await Promise.resolve();
    destroy();
    await run;
    await nextTick();
    expect(root.textContent).toBe('');
  });

  it('preserves the scope on a Custom Element move and disposes it on actual removal', async () => {
    let scope!: OwnerScope;
    let initializations = 0;
    const cleanup = vi.fn();
    const Probe = mount(() => {
      initializations++;
      scope = useOwnerScope();
      mountCallback(() => {
        scope.own(cleanup);
      });
      return () => h('span', {}, 'widget');
    });
    defineElement('closure-lifecycle-probe', Probe);
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);
    const element = document.createElement('closure-lifecycle-probe');
    a.appendChild(element);
    const firstScope = scope;
    b.appendChild(element);
    await nextTick();
    expect(scope).toBe(firstScope);
    expect(scope.disposed).toBe(false);
    expect(initializations).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
    element.remove();
    await nextTick();
    expect(firstScope.disposed).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    a.appendChild(element);
    expect(scope).not.toBe(firstScope);
    expect(initializations).toBe(2);
    element.remove();
    await nextTick();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});

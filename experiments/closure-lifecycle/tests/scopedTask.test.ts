import { describe, expect, it, vi } from 'vitest';
import { createActivityScope } from '../src/activity';
import { createScopedTask } from '../src/scopedTask';
import { deferred } from './deferred';

describe('task lifetimes', () => {
  it('does not start activity work while inactive', async () => {
    const scope = createActivityScope();
    const work = vi.fn();
    expect(await createScopedTask(scope).run(work)).toEqual({
      status: 'stale',
    });
    expect(work).not.toHaveBeenCalled();
    scope.dispose();
  });

  it('cancels search while preserving a model save across hide and reactivation', async () => {
    const scope = createActivityScope();
    const search = createScopedTask(scope);
    const save = createScopedTask(scope, 'instance');
    const a = deferred<string>();
    const b = deferred<string>();
    const applySearch = vi.fn();
    const applySave = vi.fn();
    let searchSignal!: AbortSignal;
    let saveSignal!: AbortSignal;
    scope.activate();
    const searching = search.run(
      s => {
        searchSignal = s;
        return a.promise;
      },
      { success: applySearch }
    );
    const saving = save.run(
      s => {
        saveSignal = s;
        return b.promise;
      },
      { success: applySave }
    );
    scope.deactivate();
    expect(searchSignal.aborted).toBe(true);
    expect(saveSignal.aborted).toBe(false);
    b.resolve('saved');
    expect(await saving).toEqual({ status: 'success', value: 'saved' });
    expect(applySave).toHaveBeenCalledWith('saved');
    scope.activate();
    a.resolve('old search');
    expect(await searching).toEqual({ status: 'stale' });
    expect(applySearch).not.toHaveBeenCalled();
    expect(
      await search.run(signal => {
        expect(signal).not.toBe(searchSignal);
        return 'new search';
      })
    ).toEqual({ status: 'success', value: 'new search' });
    scope.dispose();
  });

  it('does not publish an expired activity error or its finally to a new activity', async () => {
    const scope = createActivityScope();
    const task = createScopedTask(scope);
    const a = deferred<number>();
    const b = deferred<number>();
    const error = vi.fn();
    const pending = vi.fn();
    scope.activate();
    const first = task.run(() => a.promise, { error, pending });
    scope.deactivate();
    scope.activate();
    const second = task.run(() => b.promise, { error, pending });
    a.reject(new Error('expired'));
    expect(await first).toEqual({ status: 'stale' });
    expect(error).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true], [true]]);
    b.resolve(2);
    await second;
    expect(pending.mock.calls).toEqual([[true], [true], [false]]);
    scope.dispose();
  });

  it('aborts both lifetimes and refuses work after final disposal', async () => {
    const scope = createActivityScope();
    const save = createScopedTask(scope, 'instance');
    const result = deferred<number>();
    let signal!: AbortSignal;
    const running = save.run(s => {
      signal = s;
      return result.promise;
    });
    scope.dispose();
    expect(signal.aborted).toBe(true);
    result.resolve(1);
    expect(await running).toEqual({ status: 'stale' });
    const work = vi.fn();
    expect(await save.run(work)).toEqual({ status: 'stale' });
    expect(work).not.toHaveBeenCalled();
  });

  it('refuses activity work from an old abort listener before teardown finishes', async () => {
    const scope = createActivityScope();
    const task = createScopedTask(scope);
    const result = deferred<number>();
    const forbidden = vi.fn();
    scope.activate();
    const first = task.run(signal => {
      signal.addEventListener('abort', () => {
        void task.run(forbidden);
      });
      return result.promise;
    });
    scope.deactivate();
    expect(forbidden).not.toHaveBeenCalled();
    result.resolve(1);
    expect(await first).toEqual({ status: 'stale' });
    scope.dispose();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createLatestTask } from 'lithent/helper';
import { createOwnerScope } from 'lithent/helper';
import { deferred } from './deferred';

describe('latest-only work', () => {
  it('blocks an already-completed work result superseded before its continuation', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const success = vi.fn();
    const first = task.run(() => 1, { success });
    const second = task.run(() => 2, { success });
    expect(await first).toEqual({ status: 'stale' });
    expect(await second).toEqual({ status: 'success', value: 2 });
    expect(success.mock.calls).toEqual([[2]]);
    scope.dispose();
  });

  it('blocks stale success and stale finally even when work ignores abort', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const a = deferred<string>();
    const b = deferred<string>();
    const success = vi.fn();
    const pending = vi.fn();
    let aSignal!: AbortSignal;
    const first = task.run(
      signal => {
        aSignal = signal;
        return a.promise;
      },
      { success, pending }
    );
    const second = task.run(() => b.promise, { success, pending });
    expect(aSignal.aborted).toBe(true);
    a.resolve('old');
    expect(await first).toEqual({ status: 'stale' });
    expect(success).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true], [true]]);
    b.resolve('new');
    expect(await second).toEqual({ status: 'success', value: 'new' });
    expect(success.mock.calls).toEqual([['new']]);
    expect(pending.mock.calls).toEqual([[true], [true], [false]]);
    scope.dispose();
  });

  it('consumes stale rejection without publishing an error or pending=false', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const a = deferred<string>();
    const b = deferred<string>();
    const error = vi.fn();
    const pending = vi.fn();
    const first = task.run(() => a.promise, { error, pending });
    const second = task.run(() => b.promise, { error, pending });
    a.reject(new Error('old error'));
    expect(await first).toEqual({ status: 'stale' });
    expect(error).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true], [true]]);
    const latestError = new Error('new error');
    b.reject(latestError);
    expect(await second).toEqual({ status: 'error', error: latestError });
    expect(error.mock.calls).toEqual([[latestError]]);
    expect(pending.mock.calls.at(-1)).toEqual([false]);
    scope.dispose();
  });

  it('settles pending after a synchronous work failure', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const failure = new Error('synchronous');
    const error = vi.fn();
    const pending = vi.fn();
    expect(
      await task.run(
        () => {
          throw failure;
        },
        { error, pending }
      )
    ).toEqual({ status: 'error', error: failure });
    expect(error).toHaveBeenCalledWith(failure);
    expect(pending.mock.calls).toEqual([[true], [false]]);
    scope.dispose();
  });

  it('aborts on disposal, suppresses every late observer and refuses new work', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const result = deferred<string>();
    const success = vi.fn();
    const error = vi.fn();
    const pending = vi.fn();
    let signal!: AbortSignal;
    const run = task.run(
      s => {
        signal = s;
        return result.promise;
      },
      { success, error, pending }
    );
    scope.dispose();
    expect(signal.aborted).toBe(true);
    result.resolve('late');
    expect(await run).toEqual({ status: 'stale' });
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true]]);
    const work = vi.fn();
    expect(await task.run(work, { pending })).toEqual({ status: 'stale' });
    expect(work).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true]]);
  });

  it('allows explicit cancellation followed by a fresh signal', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const a = deferred<number>();
    let old!: AbortSignal;
    const first = task.run(s => {
      old = s;
      return a.promise;
    });
    task.cancel();
    task.cancel();
    expect(old.aborted).toBe(true);
    expect(
      await task.run(s => {
        expect(s).not.toBe(old);
        expect(s.aborted).toBe(false);
        return 2;
      })
    ).toEqual({ status: 'success', value: 2 });
    a.resolve(1);
    expect(await first).toEqual({ status: 'stale' });
    scope.dispose();
  });

  it('keeps independent groups from cancelling each other', async () => {
    const scope = createOwnerScope();
    const a = deferred<number>();
    const b = deferred<number>();
    const first = createLatestTask(scope).run(() => a.promise);
    const second = createLatestTask(scope).run(() => b.promise);
    b.resolve(2);
    a.resolve(1);
    expect(await first).toEqual({ status: 'success', value: 1 });
    expect(await second).toEqual({ status: 'success', value: 2 });
    scope.dispose();
  });

  it('does not start work superseded by a pending observer', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const work = vi.fn();
    const first = task.run(work, {
      pending: value => {
        if (value) void task.run(() => 'new');
      },
    });
    expect(await first).toEqual({ status: 'stale' });
    expect(work).not.toHaveBeenCalled();
    scope.dispose();
  });

  it('handles a replacement request starting inside an abort listener', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const a = deferred<number>();
    const replacement = vi.fn();
    const success = vi.fn();
    const first = task.run(signal => {
      signal.addEventListener('abort', () => {
        void task.run(() => 3, { success });
      });
      return a.promise;
    });
    expect(await task.run(replacement)).toEqual({ status: 'stale' });
    expect(replacement).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(3);
    a.resolve(1);
    expect(await first).toEqual({ status: 'stale' });
    scope.dispose();
  });

  it('does not clear a newer pending state after success starts another request', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const next = deferred<string>();
    const pending = vi.fn();
    let second!: ReturnType<typeof task.run<string>>;
    await task.run(() => 'first', {
      pending,
      success: () => {
        second = task.run(() => next.promise, { pending });
      },
    });
    expect(pending.mock.calls).toEqual([[true], [true]]);
    next.resolve('second');
    await second;
    expect(pending.mock.calls).toEqual([[true], [true], [false]]);
    scope.dispose();
  });

  it('retains a newer request started by pending=false so disposal still aborts it', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const next = deferred<string>();
    let nextSignal!: AbortSignal;
    let second!: ReturnType<typeof task.run<string>>;
    await task.run(() => 'first', {
      pending: value => {
        if (!value)
          second = task.run(signal => {
            nextSignal = signal;
            return next.promise;
          });
      },
    });
    scope.dispose();
    expect(nextSignal.aborted).toBe(true);
    next.resolve('second');
    expect(await second).toEqual({ status: 'stale' });
  });

  it('propagates observer failures without mistaking them for work errors', async () => {
    const scope = createOwnerScope();
    const task = createLatestTask(scope);
    const error = vi.fn();
    const pending = vi.fn();
    await expect(
      task.run(() => 1, {
        error,
        pending,
        success: () => {
          throw new Error('observer');
        },
      })
    ).rejects.toThrow('observer');
    expect(error).not.toHaveBeenCalled();
    expect(pending.mock.calls).toEqual([[true], [false]]);
    expect(await task.run(() => 2)).toEqual({ status: 'success', value: 2 });
    scope.dispose();
  });
});

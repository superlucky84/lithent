import { describe, expect, it, vi } from 'vitest';
import { createOwnerScope } from '../src/scope';

describe('instance ownership', () => {
  it('releases resources once, including manual release and repeated dispose', () => {
    const scope = createOwnerScope();
    const early = vi.fn();
    const remaining = vi.fn();
    const release = scope.own(early);
    scope.own(remaining);
    release();
    release();
    scope.dispose();
    scope.dispose();
    expect(scope.disposed).toBe(true);
    expect(early).toHaveBeenCalledTimes(1);
    expect(remaining).toHaveBeenCalledTimes(1);
  });

  it('closes before callbacks run and handles re-entrant disposal and registration', () => {
    const scope = createOwnerScope();
    const log: string[] = [];
    scope.own(() => {
      expect(scope.disposed).toBe(true);
      scope.dispose();
      scope.own(() => log.push('late'));
      log.push('first');
    });
    scope.own(() => log.push('second'));
    scope.dispose();
    expect(log).toEqual(['late', 'first', 'second']);
  });

  it('drains all cleanups before reporting errors and never retries failures', () => {
    const scope = createOwnerScope();
    const first = new Error('first');
    const second = new Error('second');
    const final = vi.fn();
    scope.own(() => {
      throw first;
    });
    scope.own(() => {
      throw second;
    });
    scope.own(final);
    let failure: unknown;
    try {
      scope.dispose();
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(AggregateError);
    expect((failure as AggregateError).errors).toEqual([first, second]);
    expect(final).toHaveBeenCalledTimes(1);
    expect(() => scope.dispose()).not.toThrow();
  });

  it('immediately cleans resources registered after an await following disposal', async () => {
    const scope = createOwnerScope();
    const cleanup = vi.fn();
    const register = async () => {
      await Promise.resolve();
      return scope.own(cleanup);
    };
    const registration = register();
    scope.dispose();
    const release = await registration;
    release();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reports a late cleanup failure to its registering caller', () => {
    const scope = createOwnerScope();
    scope.dispose();
    expect(() =>
      scope.own(() => {
        throw new Error('late resource');
      })
    ).toThrow('late resource');
  });
});

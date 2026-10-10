import { describe, expect, it, vi } from 'vitest';
import { createActivityScope } from 'lithent/helper';
import type { Activity } from 'lithent/helper';

describe('activity ownership', () => {
  it('starts inactive and keeps instance resources while recreating activity resources', () => {
    const scope = createActivityScope();
    const start = vi.fn();
    const stop = vi.fn();
    const instance = vi.fn();
    const sessions: Activity[] = [];
    scope.own(instance);
    scope.onActive(activity => {
      sessions.push(activity);
      start();
      return stop;
    });
    expect(scope.active).toBe(false);
    expect(start).not.toHaveBeenCalled();
    scope.activate();
    scope.activate();
    expect(start).toHaveBeenCalledTimes(1);
    const first = scope.activity!;
    scope.deactivate();
    scope.deactivate();
    expect(first.disposed).toBe(true);
    expect(first.signal.aborted).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(instance).not.toHaveBeenCalled();
    scope.activate();
    expect(scope.activity).not.toBe(first);
    expect(scope.activity!.signal.aborted).toBe(false);
    scope.dispose();
    scope.dispose();
    scope.activate();
    expect(sessions).toHaveLength(2);
    expect(stop).toHaveBeenCalledTimes(2);
    expect(instance).toHaveBeenCalledTimes(1);
    expect(scope.active).toBe(false);
  });

  it('keeps timer count at one across repeated activation and zero when inactive', () => {
    vi.useFakeTimers();
    const scope = createActivityScope();
    scope.onActive(activity => {
      const id = setInterval(() => {}, 10);
      activity.own(() => clearInterval(id));
    });
    for (let i = 0; i < 5; i++) {
      scope.activate();
      expect(vi.getTimerCount()).toBe(1);
      scope.deactivate();
      expect(vi.getTimerCount()).toBe(0);
    }
    scope.dispose();
    vi.useRealTimers();
  });

  it('cleans late registrations against their original expired activity', async () => {
    const scope = createActivityScope();
    scope.activate();
    const first = scope.activity!;
    const late = vi.fn();
    const register = Promise.resolve().then(() => first.own(late));
    scope.deactivate();
    scope.activate();
    const current = scope.activity!;
    await register;
    expect(late).toHaveBeenCalledTimes(1);
    expect(current.disposed).toBe(false);
    scope.dispose();
  });

  it('unregisters an active resource immediately and never restarts its factory', () => {
    const scope = createActivityScope();
    const stop = vi.fn();
    const start = vi.fn(() => stop);
    scope.activate();
    const unregister = scope.onActive(start);
    unregister();
    unregister();
    scope.deactivate();
    scope.activate();
    scope.dispose();
    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('finishes old cleanup before honoring re-entrant activation', () => {
    const scope = createActivityScope();
    const log: string[] = [];
    scope.onActive(() => {
      log.push('start a');
      return () => {
        log.push('stop a');
        scope.activate();
      };
    });
    scope.onActive(() => {
      log.push('start b');
      return () => log.push('stop b');
    });
    scope.activate();
    const first = scope.activity!;
    scope.deactivate();
    expect(log).toEqual([
      'start a',
      'start b',
      'stop a',
      'stop b',
      'start a',
      'start b',
    ]);
    expect(scope.activity).not.toBe(first);
    scope.dispose();
    expect(scope.active).toBe(false);
  });

  it('closes synchronously during startup and cleans the returned resource once', () => {
    const scope = createActivityScope();
    const stop = vi.fn();
    scope.onActive(activity => {
      scope.deactivate();
      expect(activity.disposed).toBe(true);
      return stop;
    });
    scope.activate();
    expect(scope.active).toBe(false);
    expect(stop).toHaveBeenCalledTimes(1);
    scope.dispose();
  });

  it('cannot reactivate or register more work while final disposal is in progress', () => {
    const scope = createActivityScope();
    const forbidden = vi.fn();
    scope.onActive(() => () => {
      scope.activate();
      scope.onActive(forbidden);
    });
    scope.activate();
    scope.dispose();
    expect(forbidden).not.toHaveBeenCalled();
    expect(scope.active).toBe(false);
  });

  it('drains all activity and instance resources even if activity cleanup throws', () => {
    const scope = createActivityScope();
    const stop = vi.fn();
    const instance = vi.fn();
    scope.onActive(() => () => {
      throw new Error('activity');
    });
    scope.onActive(() => stop);
    scope.own(instance);
    scope.activate();
    expect(() => scope.dispose()).toThrow(AggregateError);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(instance).toHaveBeenCalledTimes(1);
    expect(scope.active).toBe(false);
    expect(() => scope.dispose()).not.toThrow();
  });

  it('rolls back every started resource on a failed activation and permits an explicit retry', () => {
    const scope = createActivityScope();
    const stop = vi.fn();
    let fail = true;
    scope.onActive(() => stop);
    scope.onActive(activity => {
      activity.own(() => {
        scope.activate();
      });
      if (fail) throw new Error('setup');
    });
    expect(() => scope.activate()).toThrow(AggregateError);
    expect(scope.active).toBe(false);
    expect(stop).toHaveBeenCalledTimes(1);
    fail = false;
    scope.activate();
    expect(scope.active).toBe(true);
    scope.dispose();
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('releases a factory unregistered during its own setup', () => {
    const scope = createActivityScope();
    const stop = vi.fn();
    let unregister!: () => void;
    unregister = scope.onActive(() => {
      unregister();
      return stop;
    });
    scope.activate();
    expect(stop).toHaveBeenCalledTimes(1);
    scope.deactivate();
    scope.activate();
    scope.dispose();
    expect(stop).toHaveBeenCalledTimes(1);
  });
});

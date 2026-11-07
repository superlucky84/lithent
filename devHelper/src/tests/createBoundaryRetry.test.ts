import { describe, expect, it, vi } from 'vitest';
import { createBoundary } from '../index';

describe('createBoundary retry limit', () => {
  it('stops missing-DOM retries and notifies the owning module once', async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onFailure = vi.fn();
    const boundary = createBoundary('module-retry', onFailure);
    try {
      boundary.register({});
      boundary.update((() => null) as any);
      await Promise.resolve();
      for (let i = 0; i < 5 && vi.getTimerCount(); i++) {
        vi.runOnlyPendingTimers();
      }
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(onFailure).toHaveBeenCalledWith(
        'missing DOM after 4 attempts: module-retry'
      );
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      boundary.dispose();
      vi.useRealTimers();
      warn.mockRestore();
    }
  });
});

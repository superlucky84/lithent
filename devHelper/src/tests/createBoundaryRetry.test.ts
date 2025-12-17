import { describe, expect, it, vi } from 'vitest';
import { createBoundary } from '../index';

describe('createBoundary retry limit', () => {
  it('prevents infinite retry loops on failed boundary updates', async () => {
    vi.useFakeTimers();

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalHot = (import.meta as unknown as { hot?: unknown }).hot;
    const hot = { invalidate: vi.fn() };
    Object.defineProperty(import.meta, 'hot', {
      configurable: true,
      value: hot,
    });

    const boundary = createBoundary('module-retry');
    const compKey = {} as Record<string, unknown>;

    boundary.register(compKey);
    boundary.update((() => null) as any);

    // queueMicrotask로 스케줄된 첫 flush가 실행되도록 처리
    await Promise.resolve();

    // MAX_RETRY(3)를 초과하면 더 이상 setTimeout을 예약하지 않는다
    let safety = 0;
    while (vi.getTimerCount() > 0 && safety < 5) {
      vi.runOnlyPendingTimers();
      safety += 1;
    }

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'boundary update failed after 4 attempts; aborting'
      )
    );
    expect(vi.getTimerCount()).toBe(0);

    boundary.dispose();
    if (originalHot === undefined) {
      Reflect.deleteProperty(import.meta, 'hot');
    } else {
      Object.defineProperty(import.meta, 'hot', {
        configurable: true,
        value: originalHot,
      });
    }

    vi.useRealTimers();
    warnSpy.mockRestore();
  });
});

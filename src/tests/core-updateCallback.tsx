import { h, render, mount, ref, nextTick, updateCallback } from '@/index';

const testRenewRef = ref<null | (() => void)>(null);

if (import.meta.vitest) {
  const { it, expect, beforeEach } = import.meta.vitest;

  let testWrap: HTMLElement;
  let effectCallCount: number;
  let cleanupCallCount: number;
  let effectExecutionOrder: string[];

  beforeEach(() => {
    testWrap = document.createElement('div');
    effectCallCount = 0;
    cleanupCallCount = 0;
    effectExecutionOrder = [];
  });

  it('updateCallback should NOT execute on initial mount', () => {
    const Component = mount(() => {
      updateCallback(() => {
        effectCallCount++;
      });

      return () => <div>test</div>;
    });

    render(<Component />, testWrap);

    expect(effectCallCount).toBe(0);
    expect(testWrap.innerHTML).toBe('<div>test</div>');
  });

  it('updateCallback should execute on first update', async () => {
    const Component = mount(renew => {
      let count = 0;

      const change = () => {
        count++;
        renew();
      };
      testRenewRef.value = change;

      updateCallback(() => {
        effectCallCount++;
      });

      return () => <div>count: {count}</div>;
    });

    render(<Component />, testWrap);

    expect(effectCallCount).toBe(0);
    expect(testWrap.innerHTML).toBe('<div>count: 0</div>');

    testRenewRef.value?.();

    await nextTick();

    expect(effectCallCount).toBe(1);
    expect(testWrap.innerHTML).toBe('<div>count: 1</div>');
  });

  it('updateCallback cleanup should execute after update completes', async () => {
    const Component = mount(renew => {
      let count = 0;

      const change = () => {
        count++;
        renew();
      };
      testRenewRef.value = change;

      updateCallback(() => {
        effectExecutionOrder.push('effect');
        return () => {
          effectExecutionOrder.push('cleanup');
        };
      });

      return () => <div>count: {count}</div>;
    });

    render(<Component />, testWrap);

    expect(effectExecutionOrder).toEqual([]);

    // First update
    testRenewRef.value?.();
    await nextTick();

    // First update: effect runs, cleanup is stored but not executed yet
    expect(effectExecutionOrder).toEqual(['effect', 'cleanup']);

    // Second update
    testRenewRef.value?.();
    await nextTick();

    // Second update: cleanup from first, effect from second, cleanup from second
    expect(effectExecutionOrder).toEqual([
      'effect',
      'cleanup',
      'effect',
      'cleanup',
    ]);
  });

  it('updateCallback should NOT execute when dependencies do not change', async () => {
    const Component = mount(renew => {
      let count = 0;
      let trigger = 0;

      const change = () => {
        trigger++;
        renew();
      };
      testRenewRef.value = change;

      updateCallback(
        () => {
          effectCallCount++;
        },
        () => [count]
      ); // count never changes

      return () => <div>trigger: {trigger}</div>;
    });

    render(<Component />, testWrap);

    expect(effectCallCount).toBe(0);

    // First update: even though count doesn't change, it's first update after mount
    // dependencies: [0] → [0], but first update always runs due to checkNeedPushQueue
    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(0); // Should NOT run (dependencies [0] → [0])

    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(0); // Should not increase (dependencies still unchanged)
  });

  it('updateCallback should execute when dependencies change', async () => {
    const Component = mount(renew => {
      let count = 0;

      const change = () => {
        count++;
        renew();
      };
      testRenewRef.value = change;

      updateCallback(
        () => {
          effectCallCount++;
        },
        () => [count]
      ); // count changes

      return () => <div>count: {count}</div>;
    });

    render(<Component />, testWrap);

    expect(effectCallCount).toBe(0);

    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(1);

    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(2); // Should increase (dependencies changed)
  });

  it('updateCallback cleanup should be called with correct timing', async () => {
    const Component = mount(renew => {
      let count = 0;

      const change = () => {
        count++;
        renew();
      };
      testRenewRef.value = change;

      updateCallback(
        () => {
          effectCallCount++;
          return () => {
            cleanupCallCount++;
          };
        },
        () => [count]
      );

      return () => <div>count: {count}</div>;
    });

    render(<Component />, testWrap);

    expect(effectCallCount).toBe(0);
    expect(cleanupCallCount).toBe(0);

    // First update
    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(1);
    expect(cleanupCallCount).toBe(1); // Cleanup runs immediately after effect

    // Second update
    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(2);
    expect(cleanupCallCount).toBe(2); // Cleanup from second update

    // Third update
    testRenewRef.value?.();
    await nextTick();

    expect(effectCallCount).toBe(3);
    expect(cleanupCallCount).toBe(3); // Cleanup from third update
  });
}

/**
 * Phase 0-6 — alias trap guard (2): scheduler wiring.
 *
 * `src/hook/useRenew.ts` is SHARED with the base core and imports
 * `componentUpdate` from `@/utils/redraw`. In the concurrent build that
 * specifier must resolve to the FORK scheduler
 * (`lithentConcurrent/src/scheduler.ts`), otherwise every `useRenew()` update
 * is queued on the base core's redraw queue and silently bypasses priority
 * lanes once T1 lands — with no error anywhere.
 *
 * Keep this file permanently as a regression guard.
 */
import { h, render, lmount, useRenew } from '../index';
import { componentUpdate as viaRedrawSpecifier } from '@/utils/redraw';
import { componentUpdate as viaSchedulerSpecifier } from '@/scheduler';
import { componentUpdate as baseComponentUpdate } from '../../../src/utils/redraw';
import { componentUpdate as entryComponentUpdate } from '../index';
import { nextTick } from '@/hook/ref';

const testWrap = document.createElement('div');

let renewCounter: (() => void) | null = null;

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  renewCounter = () => {
    count += 1;
    renew();
  };

  return () => <span id="count">{count}</span>;
});

render(<Counter />, testWrap);

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('alias trap: scheduler wiring', () => {
    it('routes the specifier useRenew uses to the fork scheduler', () => {
      // `@/utils/redraw` is the exact specifier in src/hook/useRenew.ts.
      expect(viaRedrawSpecifier).toBe(viaSchedulerSpecifier);
      expect(viaRedrawSpecifier).toBe(entryComponentUpdate);
    });

    it('resolves to the fork, not the frozen base core redraw queue', () => {
      expect(viaRedrawSpecifier).not.toBe(baseComponentUpdate);
    });

    it('drives a re-render through the concurrent scheduler', async () => {
      expect(testWrap.innerHTML).toBe('<span id="count">0</span>');
      renewCounter?.();
      await nextTick();
      expect(testWrap.innerHTML).toBe('<span id="count">1</span>');
    });
  });
}

import * as lithentCore from 'lithent';
import { store } from '@/hook/store';
import { lstore } from '@/hook/lstore';

/**
 * Phase 6 (D6, DC-5) — the helper end of the store-version wire.
 *
 * A store write has to reach a concurrent-capable core so it can tell that data
 * moved while a tree was being built. The core cannot import the helper, and
 * this file has to keep working against the frozen base core, so the call is a
 * namespace lookup that is simply absent on the base core.
 *
 * That makes this suite core-dependent in one direction only: under
 * `pnpm test:dual` (`LITHENT_CORE=concurrent`) it asserts the counter moves;
 * on the base core there is no counter and it asserts what matters there —
 * that writing still works and nothing throws. RC-9 stays intact because the
 * file is unchanged between the two runs.
 */

type VersionAwareCore = { storeVersion?: () => number };

/**
 * Which core is loaded comes from the env, not from feature detection.
 * Detection would let a missing export turn the concurrent run into the base
 * assertions and pass for the wrong reason — which is exactly what happened the
 * first time this was written.
 */
const versionAware = process.env.LITHENT_CORE === 'concurrent';

const readVersion = () => (lithentCore as VersionAwareCore).storeVersion?.();

const counted = store<{ n: number }>({ n: 0 });
const lcounted = lstore<{ n: number }>({ n: 0 });

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('store write -> core store version', () => {
    it('reaches a version-aware core, and is harmless without one', () => {
      const data = counted();
      const before = readVersion();

      data.n = 1;
      data.n = 2;

      const after = readVersion();

      if (versionAware) {
        expect(typeof before, 'concurrent core must expose the counter').toBe(
          'number'
        );
        expect(after! - before!).toBe(2);
      } else {
        // Base core: no counter to move. What has to hold is that the write
        // path is unaffected.
        expect(before).toBe(undefined);
        expect(data.n).toBe(2);
      }
    });

    it('lstore is wired the same way', () => {
      const data = lcounted.watch();
      const before = readVersion();

      data.n = 1;

      const after = readVersion();

      if (versionAware) {
        expect(after! - before!).toBe(1);
      } else {
        expect(before).toBe(undefined);
        expect(data.n).toBe(1);
      }
    });

    it('a write that changes nothing does not count', () => {
      const data = counted();
      data.n = 7;

      const before = readVersion();
      data.n = 7;
      const after = readVersion();

      expect(after).toBe(before);
    });
  });
}

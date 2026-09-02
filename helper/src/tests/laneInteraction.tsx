import * as lithentCore from 'lithent';
import { h, render, mount, nextTick } from 'lithent';
import { state, computed, effect, cacheUpdate } from '@/index';

/**
 * Phase 10-5 — helper features across the concurrent core's two lanes.
 *
 * `pnpm test:dual` runs this file against BOTH cores unchanged (RC-9). On the
 * base core there are no lanes, so the same scenarios run synchronously and the
 * assertions are about the end state only. On the concurrent core the update is
 * pushed through `deferRender` and the extra assertion is that it has NOT
 * landed before `whenIdle()` — which is the part that exercises the new paths.
 *
 * Which core is loaded comes from the env rather than from feature detection.
 * Detection let an earlier version of `storeVersion.tsx` run the base branch
 * during the concurrent pass and pass for the wrong reason.
 */

type LaneCore = {
  deferRender?: (scope: () => void) => void;
  whenIdle?: () => Promise<void>;
};

const lanes = process.env.LITHENT_CORE === 'concurrent';
const core = lithentCore as LaneCore;

/** Runs `scope` at low priority where that exists, plainly where it does not. */
const push = (scope: () => void) => {
  if (lanes && core.deferRender) {
    core.deferRender(scope);
  } else {
    scope();
  }
};

const settle = async () => {
  await nextTick();

  if (lanes && core.whenIdle) {
    await core.whenIdle();
  }
};

const host = () => document.createElement('div');

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('10-5. computed / effect / cacheUpdate across lanes', () => {
    it('a low-lane update still drives computed and effect exactly once', async () => {
      let bump = () => {};
      let effectRuns = 0;
      let seen: number[] = [];

      const App = mount(renew => {
        const count = state(0, renew);
        const doubled = computed(() => count.value * 2);

        effect(
          () => {
            effectRuns += 1;
            seen.push(doubled.value);
          },
          undefined,
          () => [count.value]
        );

        bump = () => {
          count.value += 1;
        };

        return () => <b>{String(doubled.value)}</b>;
      });

      const el = host();
      render(<App />, el);

      effectRuns = 0;
      seen = [];

      push(() => bump());

      if (lanes) {
        await nextTick();
        expect(el.textContent, 'the deferred render has not landed yet').toBe(
          '0'
        );
      }

      await settle();

      expect(el.textContent).toBe('2');
      expect(effectRuns, 'one commit, one effect').toBe(1);
      expect(seen).toEqual([2]);
    });

    it('cacheUpdate still reuses its tree when a low-lane render changes nothing', async () => {
      let bumpTracked = () => {};
      let bumpUntracked = () => {};
      let bodyRuns = 0;

      const App = mount(renew => {
        const tracked = state(0, renew);
        const untracked = state(0, renew);

        bumpTracked = () => {
          tracked.value += 1;
        };
        bumpUntracked = () => {
          untracked.value += 1;
        };

        return cacheUpdate(
          () => [tracked.value],
          () => {
            bodyRuns += 1;
            return <b>{`${tracked.value}-${untracked.value}`}</b>;
          }
        );
      });

      const el = host();
      render(<App />, el);

      bodyRuns = 0;

      // Untracked: the renderer body must be skipped and the old tree reused.
      push(() => bumpUntracked());
      await settle();

      expect(bodyRuns, 'deps unchanged, body skipped').toBe(0);
      expect(el.textContent, 'the cached tree is still on screen').toBe('0-0');

      // Tracked: the body runs and the tree is rebuilt.
      push(() => bumpTracked());
      await settle();

      expect(bodyRuns).toBe(1);
      expect(el.textContent).toBe('1-1');
    });
  });
}

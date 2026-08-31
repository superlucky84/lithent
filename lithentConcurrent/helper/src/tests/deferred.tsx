import {
  h,
  Fragment,
  render,
  mount,
  lmount,
  nextTick,
  whenIdle,
  useRenew,
} from 'lithent-concurrent';
import { deferred, ldeferred, isPending } from '@/index';

/**
 * Phase 2 — value-level deferred API (D3, D11).
 *
 * These helpers only exist for the concurrent core, so unlike the base
 * `helper/` suite this one never has to branch on which core is loaded.
 *
 * Timing: the sync lane is a microtask and the low lane is a task, so
 * `await nextTick()` lands after every sync commit and before any low commit —
 * that gap is what makes "still showing the old value" checkable without
 * sleeping on a wall clock. `whenIdle()` covers the low lane.
 */

const mountApp = (App: unknown) => {
  const host = document.createElement('div');
  const Root = App as () => never;
  render(<Root />, host);
  return host;
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('ldeferred / deferred', () => {
    it('RC-2: holds the previous DOM until the low render runs', async () => {
      let bump = () => {};

      const Component = lmount(() => {
        const label = ldeferred('a');
        bump = () => {
          label.value = 'b';
        };
        return () => <span>{label.v}</span>;
      });

      const host = mountApp(Component);
      expect(host.textContent).toBe('a');

      bump();
      await nextTick();
      expect(host.textContent, 'low lane must not have run yet').toBe('a');

      await whenIdle();
      await nextTick();
      expect(host.textContent).toBe('b');
    });

    it('deferred: same behaviour in mount mode', async () => {
      let bump = () => {};

      const Component = mount(renew => {
        const label = deferred('a', renew);
        bump = () => {
          label.value = 'b';
        };
        return () => <span>{label.v}</span>;
      });

      const host = mountApp(Component);
      bump();

      await nextTick();
      expect(host.textContent).toBe('a');

      await whenIdle();
      await nextTick();
      expect(host.textContent).toBe('b');
    });

    it('reads back the new value immediately — the render is deferred, not the value', () => {
      let bump = () => {};
      let read = () => '';

      const Component = lmount(() => {
        const label = ldeferred('a');
        bump = () => {
          label.value = 'b';
        };
        read = () => label.value;
        return () => <span>{label.v}</span>;
      });

      const host = mountApp(Component);
      bump();

      expect(read(), 'the value is written eagerly').toBe('b');
      expect(host.textContent, 'only the render waits').toBe('a');
    });

    it('an urgent update commits ahead of a pending deferred one', async () => {
      const log: string[] = [];
      let bumpSlow = () => {};
      let bumpFast = () => {};

      const Fast = lmount(() => {
        let n = 0;
        const renew = useRenew();
        bumpFast = () => {
          n += 1;
          renew();
        };
        return () => {
          if (n > 0) {
            log.push('fast');
          }
          return <span>{n}</span>;
        };
      });

      const Slow = lmount(() => {
        const n = ldeferred(0);
        bumpSlow = () => {
          n.value += 1;
        };
        return () => {
          if (n.v > 0) {
            log.push('slow');
          }
          return <span>{n.v}</span>;
        };
      });

      mountApp(
        lmount(() => () => (
          <>
            <Slow />
            <Fast />
          </>
        ))
      );

      bumpSlow();
      bumpFast();

      await whenIdle();
      await nextTick();

      expect(log).toEqual(['fast', 'slow']);
    });
  });

  describe('isPending', () => {
    it('RC-3: true while a deferred render waits, false once it commits', async () => {
      let bump = () => {};
      let pendingNow = () => false;

      const Component = lmount(() => {
        const label = ldeferred('a');
        const pending = isPending();

        bump = () => {
          label.value = 'b';
        };
        pendingNow = () => pending.value;

        return () => <span>{label.v}</span>;
      });

      mountApp(Component);
      expect(pendingNow()).toBe(false);

      bump();
      expect(pendingNow()).toBe(true);

      await whenIdle();
      await nextTick();
      expect(pendingNow()).toBe(false);
    });

    it('stays bound to its own component', async () => {
      let bumpA = () => {};
      let pendingA = () => false;
      let pendingB = () => false;

      const B = lmount(() => {
        const pending = isPending();
        pendingB = () => pending.value;
        return () => <span>b</span>;
      });

      const A = lmount(() => {
        const label = ldeferred('a');
        const pending = isPending();
        bumpA = () => {
          label.value = 'z';
        };
        pendingA = () => pending.value;
        return () => (
          <>
            <span>{label.v}</span>
            <B />
          </>
        );
      });

      mountApp(A);

      bumpA();
      expect(pendingA()).toBe(true);
      expect(pendingB(), 'B has nothing queued').toBe(false);

      await whenIdle();
      await nextTick();
      expect(pendingA()).toBe(false);
    });

    it('is not reactive on its own — it is a query', async () => {
      let renders = 0;
      let bump = () => {};

      const Component = lmount(() => {
        const label = ldeferred('a');
        const pending = isPending();
        bump = () => {
          label.value = 'b';
        };
        return () => {
          renders += 1;
          return <span>{pending.value ? 'busy' : label.v}</span>;
        };
      });

      const host = mountApp(Component);
      expect(renders).toBe(1);

      bump();
      await nextTick();

      // Nothing re-rendered to show the pending state; the only render that
      // happens is the deferred one, by which time pending is already false.
      expect(renders, 'no sync render was triggered').toBe(1);
      expect(host.textContent).toBe('a');

      await whenIdle();
      await nextTick();
      expect(renders).toBe(2);
      expect(host.textContent).toBe('b');
    });
  });
}

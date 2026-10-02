import * as lithentCore from 'lithent';
import { h, render, mount, nextTick, portal, type WDom } from 'lithent';
import { state, computed, effect, cacheUpdate, createContext } from '@/index';

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

const laneContext = createContext<{ label: string }>();
const {
  Provider: LaneProvider,
  contextState: laneContextState,
  useContext: useLaneContext,
} = laneContext;

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

  describe('10-6. context across lanes (getParent path)', () => {
    it('a low-lane provider update reaches its consumer', async () => {
      let setLabel = (_next: string) => {};

      // Shape copied from the suite's working context test: a wrapper owns the
      // state and hands it to the Provider, the consumer subscribes by key, and
      // the first assertion waits a tick. Skipping that tick is what made an
      // earlier version of this fail on BOTH cores.
      const Wrapper = mount((_renew, _props, kids: WDom[]) => {
        const label = laneContextState('first');
        setLabel = next => {
          label.value = next;
        };

        return () => <LaneProvider label={label}>{kids}</LaneProvider>;
      });

      const Leaf = mount<{ id: number }>(renew => {
        // Reaching the provider walks `getParent` all the way up — the accessor
        // D10 called out as C3-critical.
        const ctx = useLaneContext(laneContext, renew, ['label']);
        return () => <i>{ctx.label?.value ?? 'none'}</i>;
      });

      const App = mount(() => () => (
        <Wrapper>
          <Leaf id={1} />
        </Wrapper>
      ));

      const el = host();
      render(<App />, el);
      await nextTick();

      expect(el.textContent).toBe('first');

      push(() => setLabel('second'));

      if (lanes) {
        await nextTick();
        expect(el.textContent, 'not yet — it is queued at low priority').toBe(
          'first'
        );
      }

      await settle();

      expect(el.textContent, 'the consumer got it').toBe('second');
    });
  });

  describe('10-14. urgent renders landing between slices of a parked build', () => {
    // An urgent render beside a parked low build may leave that build parked
    // only when the two components are unrelated. Context walks `getParent` and a
    // portal puts DOM somewhere the tree does not, so those are the shapes where
    // "related" could be misjudged. Every row burns more than a slice, which
    // parks the build without the private budget seam, and the urgent work is
    // raised from inside a row so it lands mid-build.
    const busy = (ms: number) => {
      const end = performance.now() + ms;
      while (performance.now() < end);
    };

    it('context consumers and portals end up exactly where a straight render puts them', async () => {
      const dockHost = document.createElement('div');
      const rowHost = document.createElement('div');
      const el = host();

      let fire: (() => void) | null = null;
      let setLabelNow = (_next: string) => {};
      let bumpList = () => {};
      let bumpDock = () => {};
      let dockText = 'dock-0';
      let committedWhenFired = -1;
      let rows: number[] = [1, 2, 3];

      const Wrapper = mount((_renew, _props, kids: WDom[]) => {
        const label = laneContextState('first');
        setLabelNow = next => {
          label.value = next;
        };

        return () => <LaneProvider label={label}>{kids}</LaneProvider>;
      });

      const Leaf = mount<{ n: number; key?: number }>((renew, props) => {
        const ctx = useLaneContext(laneContext, renew, ['label']);

        return () => {
          busy(6);

          if (fire && props.n === 4) {
            const go = fire;
            fire = null;
            committedWhenFired = el.querySelectorAll('i').length;
            go();
          }

          return (
            <i>
              {props.n}:{ctx.label?.value ?? 'none'}
              {props.n % 3 === 0 ? portal(<u>{props.n}</u>, rowHost) : null}
            </i>
          );
        };
      });

      const List = mount(renew => {
        bumpList = renew;
        return () => (
          <div class="list">
            {rows.map(n => (
              <Leaf key={n} n={n} />
            ))}
          </div>
        );
      });

      // Unrelated to the list: a sibling that reads the context and owns a
      // portal of its own.
      const Side = mount(renew => {
        bumpDock = renew;
        const ctx = useLaneContext(laneContext, renew, ['label']);

        return () => (
          <section>
            {ctx.label?.value ?? 'none'}
            {portal(<b>{dockText}</b>, dockHost)}
          </section>
        );
      });

      const App = mount(() => () => (
        <Wrapper>
          <List />
          <Side />
        </Wrapper>
      ));

      render(<App />, el);
      await nextTick();

      // The urgent work: the context value changes, so every consumer — in the
      // list and beside it — renders at sync priority, and the side portal's
      // text changes with it.
      fire = () => {
        dockText = 'dock-1';
        setLabelNow('second');
        bumpDock();
      };

      // Rows are only ever added: a consumer removed in the same pass is told about
      // the context change afterwards and re-renders itself on BOTH cores, which is
      // a base-core behaviour this test is not about.
      rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      push(() => bumpList());
      await settle();

      expect(fire, 'the urgent work ran').toBe(null);
      expect(
        committedWhenFired,
        'it fired while the list was still the old one'
      ).toBe(3);
      expect(
        Array.from(el.querySelectorAll('i')).map(n => n.textContent),
        'every row, new and old alike, reads the new context value'
      ).toEqual(rows.map(n => `${n}:second`));
      expect(el.querySelector('section')?.textContent).toBe('second');
      expect(dockHost.innerHTML, 'the side portal').toBe('<b>dock-1</b>');
      expect(rowHost.innerHTML, 'row portals follow the rows').toBe(
        '<u>3</u><u>6</u><u>9</u><u>12</u>'
      );
    });
  });
}

import { describe, it, expect, afterEach } from 'vitest';
import {
  h,
  render,
  mount,
  updateCallback,
  mountCallback,
  deferRender,
  whenIdle,
  nextTick,
} from '@/index';
import { startWork, commitEffects } from '@/diff';
import type { Effects } from '@/diff';
import { hasPendingWork, setLowLaneBudget, workResumeCount } from '@/scheduler';
import type { WDom } from '@/types';

/**
 * Phase 8 (D7) — the build walks on an explicit stack and can stop between
 * units.
 *
 * The pause check is driven directly here rather than through the 5 ms slice.
 * A timing-driven test would only pause when the machine is slow enough, which
 * is exactly the property a test must not have: it would pass on a fast machine
 * without ever exercising the thing it claims to cover.
 *
 * What has to hold is that stopping changes NOTHING — same tree, and effects
 * that commit to the same state. Effect ORDER against the base core is pinned
 * elsewhere, by `concurrent-commitEquivalence.test.ts`; thunks from two
 * separate runs cannot be compared by identity.
 */

/** Renders `count` keyed rows under one component. */
const rowsApp = (count: number) => {
  let bump = () => {};
  let rows = Array.from({ length: count }, (_, i) => i);

  const App = mount((renew: () => void) => {
    bump = renew;
    return () => (
      <ul>
        {rows.map(id => (
          <li key={id}>{String(id)}</li>
        ))}
      </ul>
    );
  });

  const host = document.createElement('div');
  render(<App />, host);

  return {
    host,
    bump: () => bump(),
    setRows: (next: number[]) => {
      rows = next;
    },
  };
};

/**
 * Runs one build twice against equivalent inputs — once straight through, once
 * pausing every `every` units — and returns both results for comparison.
 */
const buildBothWays = (
  makeInput: () => { newWDom: WDom; originalWDom: WDom | undefined },
  every: number
) => {
  const straightEffects: Effects = [];
  const straight = makeInput();
  const straightTree = startWork(
    straight.newWDom,
    straight.originalWDom,
    straightEffects
  ).advance() as WDom;

  const pausedEffects: Effects = [];
  const paused = makeInput();
  const work = startWork(paused.newWDom, paused.originalWDom, pausedEffects);

  let units = 0;
  let pauses = 0;
  let pausedTree: WDom | null = null;

  while (!pausedTree) {
    pausedTree = work.advance(() => {
      units += 1;
      return units % every === 0;
    });

    if (!pausedTree) {
      pauses += 1;
    }
  }

  return { straightTree, straightEffects, pausedTree, pausedEffects, pauses };
};

/** A shape with nesting, keys and text so the walk covers more than one path. */
const makeTree = (labels: string[]): WDom =>
  (
    <section>
      <h1>title</h1>
      <ul>
        {labels.map(label => (
          <li key={label}>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  ) as unknown as WDom;

describe('work loop', () => {
  it('produces the same tree whether or not it pauses', () => {
    const { straightTree, pausedTree, pauses } = buildBothWays(
      () => ({
        newWDom: makeTree(['a', 'b', 'c', 'd', 'e']),
        originalWDom: undefined,
      }),
      3
    );

    expect(pauses, 'the pausing run really did stop').toBeGreaterThan(0);
    expect(JSON.stringify(pausedTree)).toBe(JSON.stringify(straightTree));
  });

  it('records the same effects and leaves the original in the same state', () => {
    // Each run gets its OWN previous tree, so committing one cannot colour the
    // other. Effect thunks cannot be compared across runs by identity, so what
    // is compared is the count and then the state committing them produces.
    // Effect ORDER against the base core is pinned separately, by
    // `concurrent-commitEquivalence.test.ts`.
    const previous = [
      startWork(makeTree(['a', 'b', 'c']), undefined, []).advance() as WDom,
      startWork(makeTree(['a', 'b', 'c']), undefined, []).advance() as WDom,
    ];
    let taken = 0;

    // An update against a previous tree — the path that records unmount,
    // detach, delete and retire effects.
    const { straightEffects, pausedEffects, pauses } = buildBothWays(
      () => ({
        newWDom: makeTree(['a', 'x', 'c', 'y']),
        originalWDom: previous[taken++],
      }),
      2
    );

    expect(pauses).toBeGreaterThan(0);
    expect(pausedEffects.length).toBe(straightEffects.length);

    commitEffects(straightEffects);
    commitEffects(pausedEffects);

    expect(JSON.stringify(previous[1])).toBe(JSON.stringify(previous[0]));
  });

  it('pauses inside a sibling run, not only between depth levels', () => {
    // 60 siblings under one parent, one level deep. If the loop could only stop
    // at depth boundaries there would be nowhere to stop here — which is the
    // case Phase 7 measured as the expensive one.
    const flat = () =>
      ({
        newWDom: (
          <ul>
            {Array.from({ length: 60 }, (_, i) => (
              <li key={i}>{String(i)}</li>
            ))}
          </ul>
        ) as unknown as WDom,
        originalWDom: undefined,
      }) as { newWDom: WDom; originalWDom: WDom | undefined };

    const { pauses, straightTree, pausedTree } = buildBothWays(flat, 5);

    expect(pauses, 'siblings are pausable').toBeGreaterThan(5);
    expect(JSON.stringify(pausedTree)).toBe(JSON.stringify(straightTree));
  });
});

describe('elements are built during the build phase', () => {
  it('a fresh subtree already has its DOM when the build finishes', () => {
    // Phase 8 measured that on a creation-heavy render 71% of the commit was
    // `wDomToDom` — pure allocation of detached nodes. Doing it here moves that
    // share into the part that can be interrupted. Nothing is committed in this
    // test: `advance()` is called and the effects are dropped on the floor.
    const built = startWork(
      (
        <ul>
          <li key="a">a</li>
          <li key="b">b</li>
        </ul>
      ) as unknown as WDom,
      undefined,
      []
    ).advance() as WDom;

    const rows = built.children || [];

    expect(rows.length).toBe(2);
    expect(rows[0].el, 'the row element exists before any commit').toBeTruthy();
    expect((rows[0].el as HTMLElement).tagName).toBe('LI');
    expect((rows[0].el as HTMLElement).textContent).toBe('a');

    // Attached to its own parent element, which is itself detached — building
    // creates the subtree, committing is what puts it in the document.
    expect(document.body.contains(rows[0].el as HTMLElement)).toBe(false);
  });
});

describe('sync lane is never interrupted', () => {
  it('commits within the microtask nextTick promises', async () => {
    const app = rowsApp(200);

    app.setRows(Array.from({ length: 400 }, (_, i) => i));
    app.bump();
    await nextTick();

    expect(app.host.querySelectorAll('li').length).toBe(400);
    expect(hasPendingWork(), 'a sync build never parks work').toBe(false);
  });
});

describe('a low-lane build that really pauses', () => {
  afterEach(() => setLowLaneBudget());

  it('is parked and picked up again until it commits', async () => {
    const app = rowsApp(4);

    // Zero slice: every unit is over budget, so the build is forced to stop
    // after each one and can only finish by being resumed.
    setLowLaneBudget(0);

    const resumesBefore = workResumeCount();

    app.setRows([10, 11, 12, 13, 14, 15]);
    deferRender(() => app.bump());

    expect(
      app.host.querySelectorAll('li').length,
      'nothing is committed before the flush even starts'
    ).toBe(4);

    await whenIdle();

    expect(
      workResumeCount() - resumesBefore,
      'it really stopped and was picked up again'
    ).toBeGreaterThan(0);
    expect(hasPendingWork()).toBe(false);
    expect(app.host.querySelectorAll('li').length).toBe(6);
    expect(app.host.textContent).toBe('101112131415');
  });

  it('does not swallow a sync render raised from inside it', async () => {
    let bump = () => {};
    let rows = [1, 2, 3, 4];
    let armed = false;

    // Rendered as part of the deferred build. A sync renew raised HERE lands its
    // flush in the microtask queue, which drains between two slices of that same
    // build — the only interleave point that is deterministic in node, where a
    // macrotask probe drains the whole resume chain before it gets a turn.
    const Trigger = mount(() => () => {
      if (armed) {
        armed = false;
        rows = [99];
        bump();
      }
      return <i>t</i>;
    });

    const App = mount((renew: () => void) => {
      bump = renew;
      return () => (
        <ul>
          {rows.map(id => (
            <li key={id}>{String(id)}</li>
          ))}
          <Trigger />
        </ul>
      );
    });

    const host = document.createElement('div');
    render(<App />, host);

    setLowLaneBudget(0);
    rows = [10, 11, 12, 13, 14, 15];
    armed = true;
    deferRender(() => bump());

    await whenIdle();

    // The urgent state wins and nothing is lost.
    //
    // NOT covered here: the same race when the deferred build is still PARKED
    // when the sync render arrives. That interleave could not be produced
    // deterministically in jsdom — every probe drains the whole resume chain
    // first — so `replaceWDom`'s re-raise path (`componentUpdate` after the
    // drained build retires the node) is defensive and unverified. Covering it
    // needs the alternate/rollback machinery of Phase 9 (D8/D9, RC-8).
    expect(host.querySelectorAll('li').length).toBe(1);
    expect(host.textContent).toBe('99t');
    expect(hasPendingWork()).toBe(false);
  });

  it('leaves the hook slots where they were when it is dropped (RC-8)', async () => {
    let bump = () => {};
    let updates = 0;
    let dep = 0;
    let armed = false;

    // Renders inside the deferred build and, from there, moves the dependency
    // and raises a sync renew. That sync render supersedes the parked build,
    // which is therefore dropped after having already walked `useUpdated` once.
    const Trigger = mount(() => () => {
      if (armed) {
        armed = false;
        dep = 1;
        bump();
      }
      return <i>t</i>;
    });

    const App = mount((renew: () => void) => {
      bump = renew;

      updateCallback(
        () => {
          updates++;
        },
        () => [dep]
      );

      return () => (
        <div>
          <b>{String(dep)}</b>
          <Trigger />
        </div>
      );
    });

    const host = document.createElement('div');
    render(<App />, host);

    updates = 0;
    setLowLaneBudget(0);
    armed = true;
    deferRender(() => bump());

    await whenIdle();

    // The dropped build read `dep` as 0 and fired nothing, but it still advanced
    // the hook cursor. Without putting that back, the render that replaces it
    // reads a shifted slot and the effect is lost.
    expect(updates, 'exactly one effect for the one commit').toBe(1);
    expect(host.textContent).toBe('1t');
  });

  it('never discards a build that has mounted (9-10, DC-7)', async () => {
    let bump = () => {};
    let rows = [1, 2, 3];
    let armed = false;
    let mounterRuns = 0;
    let cleanups = 0;

    const Row = mount<{ key: number; id: number }>(() => {
      mounterRuns++;
      mountCallback(() => () => {
        cleanups++;
      });
      return (p: { id: number }) => <li>{String(p.id)}</li>;
    });

    // Fires a sync renew from inside the deferred build, i.e. while that build
    // is parked mid-mount. If the parked build were dropped, its mounters would
    // have run for components that never commit and never unmount.
    const Trigger = mount(() => () => {
      if (armed) {
        armed = false;
        rows = [7, 8];
        bump();
      }
      return <i>t</i>;
    });

    const App = mount((renew: () => void) => {
      bump = renew;
      return () => (
        <ul>
          {rows.map(id => (
            <Row key={id} id={id} />
          ))}
          <Trigger />
        </ul>
      );
    });

    const host = document.createElement('div');
    render(<App />, host);

    setLowLaneBudget(0);
    rows = [10, 11, 12, 13, 14, 15];
    armed = true;
    deferRender(() => bump());

    await whenIdle();

    const live = mounterRuns - cleanups;

    expect(live, 'every mounter that ran belongs to a row on screen').toBe(
      host.querySelectorAll('li').length
    );
    expect(host.textContent).toBe('78t');
  });

  it('matches what the same render produces without pausing', async () => {
    const paused = rowsApp(4);
    setLowLaneBudget(0);
    paused.setRows([10, 11, 12, 13, 14, 15]);
    deferRender(() => paused.bump());
    await whenIdle();

    setLowLaneBudget();
    const straight = rowsApp(4);
    straight.setRows([10, 11, 12, 13, 14, 15]);
    deferRender(() => straight.bump());
    await whenIdle();

    expect(paused.host.innerHTML).toBe(straight.host.innerHTML);
  });
});

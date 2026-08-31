/**
 * Manual scheduler checks — MANUAL_TEST_CHECKLIST section B.
 *
 * Nothing else in the repo uses `startTransition`, so B-1..B-5 and B-9 could not
 * be performed at all without a page like this.
 *
 *   pnpm dev:concurrent
 *
 * Two things this page learned the hard way:
 *
 * 1. The work has to be REAL. An earlier version built a 500-element array but
 *    rendered 60 of them; the deferred render finished inside one frame and was
 *    indistinguishable from sync. The row count is now a control, so the work
 *    can be cranked until the difference is obvious on the machine at hand.
 *
 * 2. Deferral is only visible against a CONTROL. The sync and deferred panes are
 *    identical apart from how they commit, and each counts its own renders —
 *    which is the objective form of the check, not a matter of how it feels.
 *    At T1 the win is that intermediate keystrokes never render at all: sync
 *    renders once per keystroke, deferred renders once per pause.
 */
import {
  h,
  Fragment,
  render,
  mount,
  lmount,
  useRenew,
  nextTick,
  whenIdle,
} from 'lithent-concurrent';
import { ldeferred, isPending } from 'lithent-concurrent-helper';

const ROW_CHOICES = [1000, 3000, 6000, 12000];
let rowCount = 3000;

const buildRows = (query: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${query || '(empty)'} — row ${i}`);

// ---------------------------------------------------------------------------
// B-1 / B-2 / B-3 / B-5 — the same list committed two ways
// ---------------------------------------------------------------------------

type Pane = {
  Root: unknown;
  retype: () => void;
  reset: () => void;
};

const createPane = (label: string, deferredMode: boolean): Pane => {
  const stats = { renders: 0, lastMs: 0 };
  let query = '';
  let commitRows: (rows: string[]) => void = () => {};
  let pendingNow = () => false;
  let refreshStats = () => {};

  // The heavy part. Only this component's renders are counted.
  const List = lmount(() => {
    const renew = useRenew();
    const deferredRows = ldeferred(buildRows('', rowCount));
    const pending = isPending();
    let plainRows = buildRows('', rowCount);

    pendingNow = () => pending.value;
    commitRows = rows => {
      if (deferredMode) {
        deferredRows.value = rows;
      } else {
        plainRows = rows;
        renew();
      }
    };

    return () => {
      stats.renders += 1;
      const rows = deferredMode ? deferredRows.v : plainRows;

      return (
        <div class="rows">
          {rows.map(row => (
            <div>{row}</div>
          ))}
        </div>
      );
    };
  });

  // Separate component so repainting the numbers does not inflate the count
  // it is reporting.
  const Stats = lmount(() => {
    refreshStats = useRenew();

    return () => (
      <p class="stats">
        <b>{stats.renders}</b> renders · last keystroke → painted:{' '}
        <b>{stats.lastMs}</b> ms
        <span class={pendingNow() ? 'pending' : 'idle'}>
          {pendingNow() ? ' ● pending' : ' ○ idle'}
        </span>
      </p>
    );
  });

  const commit = () => {
    const started = performance.now();

    commitRows(buildRows(query, rowCount));
    refreshStats();

    (deferredMode ? whenIdle() : nextTick()).then(() => {
      stats.lastMs = Math.round(performance.now() - started);
      refreshStats();
    });
  };

  const onInput = (event: Event) => {
    query = (event.target as HTMLInputElement).value;
    commit();
  };

  const Root = mount(() => () => (
    <div class="pane">
      <h3>{label}</h3>
      <input placeholder="type here" onInput={onInput} />
      <Stats />
      <List />
    </div>
  ));

  return {
    Root,
    retype: commit,
    reset: () => {
      stats.renders = 0;
      stats.lastMs = 0;
      refreshStats();
    },
  };
};

const syncPane = createPane('sync — plain renew()', false);
const deferredPane = createPane('deferred — ldeferred', true);

const Search = mount(renew => {
  const setRows = (next: number) => {
    rowCount = next;
    syncPane.reset();
    deferredPane.reset();
    syncPane.retype();
    deferredPane.retype();
    renew();
  };

  const resetBoth = () => {
    syncPane.reset();
    deferredPane.reset();
    renew();
  };

  return () => {
    const SyncRoot = syncPane.Root as () => never;
    const DeferredRoot = deferredPane.Root as () => never;

    return (
      <section>
        <h2>B-1 / B-2 / B-3 / B-5 — sync vs deferred</h2>
        <p class="hint">
          Type the same thing into both boxes, at speed. Then compare the render
          counts.
        </p>
        <ul class="hint">
          <li>
            <b>B-5 / B-1</b>: sync renders once per keystroke; deferred renders
            once per pause, because a newer update replaces the queued one. That
            gap is the whole point of the lane — and it is why the left box
            stutters while the right one does not.
          </li>
          <li>
            <b>B-2</b>: while the right pane is pending, the list still shows
            the PREVIOUS query. It must never blank out.
          </li>
          <li>
            <b>B-3</b>: the right pane's indicator turns on, then off by itself.
          </li>
        </ul>
        <p class="hint">
          rows per list:{' '}
          {ROW_CHOICES.map(n => (
            <button
              class={n === rowCount ? 'on' : ''}
              onClick={() => setRows(n)}
            >
              {n}
            </button>
          ))}
          <button onClick={resetBoth}>reset counters</button>
        </p>
        <p class="hint">
          If the two panes look the same, raise the row count until the sync
          side visibly stutters.
        </p>
        <div class="panes">
          <SyncRoot />
          <DeferredRoot />
        </div>
      </section>
    );
  };
});

// ---------------------------------------------------------------------------
// B-4 — an urgent update commits ahead of a queued deferred one
// ---------------------------------------------------------------------------

const commitLog: string[] = [];
const priority = { bumpUrgent: () => {}, bumpDeferred: () => {} };

const UrgentCell = lmount(() => {
  const renew = useRenew();
  let n = 0;

  priority.bumpUrgent = () => {
    n += 1;
    renew();
  };

  return () => {
    if (n > 0) {
      commitLog.push(`urgent → ${n}`);
    }
    return <td>{n}</td>;
  };
});

const DeferredCell = lmount(() => {
  const n = ldeferred(0);

  priority.bumpDeferred = () => {
    n.value += 1;
  };

  return () => {
    if (n.v > 0) {
      commitLog.push(`deferred → ${n.v}`);
    }
    return <td>{n.v}</td>;
  };
});

const Priority = lmount(() => {
  const renew = useRenew();

  const run = () => {
    commitLog.length = 0;
    priority.bumpDeferred();
    priority.bumpUrgent();
    renew();
    whenIdle().then(renew);
  };

  return () => (
    <section>
      <h2>B-4 — urgent beats deferred</h2>
      <p class="hint">
        Press once. Both are updated in the same turn, but the commit log must
        show the urgent one FIRST.
      </p>
      <button onClick={run}>fire both</button>
      <table>
        <tr>
          <td>urgent</td>
          <UrgentCell />
        </tr>
        <tr>
          <td>deferred</td>
          <DeferredCell />
        </tr>
      </table>
      <p class="hint">commit order: {commitLog.join('  ·  ') || '—'}</p>
    </section>
  );
});

// ---------------------------------------------------------------------------
// B-9 — nextTick vs whenIdle (BC-4)
// ---------------------------------------------------------------------------

const AwaitCompare = lmount(() => {
  const value = ldeferred('initial');
  const renew = useRenew();
  let afterNextTick = '—';
  let afterWhenIdle = '—';
  let runs = 0;

  const readDom = () =>
    document.getElementById('bc4-value')?.textContent ?? '?';

  const run = async () => {
    runs += 1;
    value.value = `updated #${runs}`;

    await nextTick();
    afterNextTick = readDom();

    await whenIdle();
    await nextTick();
    afterWhenIdle = readDom();

    renew();
  };

  return () => (
    <section>
      <h2>B-9 — nextTick vs whenIdle (BC-4)</h2>
      <p class="hint">
        Press once. "after nextTick" must read the OLD value and "after
        whenIdle" the new one. That difference is the whole reason `whenIdle`
        exists — `nextTick` is a microtask and the low lane is a task.
      </p>
      <button onClick={run}>run</button>
      <table>
        <tr>
          <td>current</td>
          <td id="bc4-value">{value.v}</td>
        </tr>
        <tr>
          <td>after nextTick</td>
          <td>{afterNextTick}</td>
        </tr>
        <tr>
          <td>after whenIdle</td>
          <td>{afterWhenIdle}</td>
        </tr>
      </table>
    </section>
  );
});

const App = mount(() => () => (
  <>
    <Search />
    <Priority />
    <AwaitCompare />
  </>
));

render(<App />, document.getElementById('root'));

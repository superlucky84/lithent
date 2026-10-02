import * as baseCore from 'bench-core-base';
import * as concurrentCore from 'bench-core-concurrent';

/**
 * MANUAL_TEST_CHECKLIST section E — does interrupting actually buy anything?
 *
 * E-4 is the one that decides whether "concurrent rendering" is a true
 * description (REQUIREMENTS §2.1), and it cannot be judged by feel. What a
 * blocked main thread looks like from the outside is a GAP between animation
 * frames, so that is what this measures: while a heavy update runs, how long is
 * the longest stretch where the browser could not paint?
 *
 *   base + renew()            -> expect ONE long block
 *   concurrent + deferRender  -> expect MANY short ones, same total
 *
 * The totals should be similar — interruption does not make rendering faster,
 * it makes it stoppable. If the longest block does not shrink, T2 bought
 * nothing and E-4 fails.
 *
 * The other E items ride along on the concurrent panel as counters: mounts
 * (E-2), update callbacks (E-3), and a per-row instance number that must never
 * change for a surviving row (E-6, closure preservation).
 */

type Core = {
  h: (...args: unknown[]) => unknown;
  mount: (mounter: unknown) => unknown;
  render: (wDom: unknown, host: HTMLElement) => () => void;
  mountCallback: (cb: () => void | (() => void)) => void;
  updateCallback: (cb: () => void, deps?: () => unknown[]) => void;
  deferRender?: (scope: () => void) => void;
  whenIdle?: () => Promise<void>;
  nextTick: () => Promise<unknown>;
};

const base = baseCore as unknown as Core;
const concurrent = concurrentCore as unknown as Core;

// ---------------------------------------------------------------------------
// Frame monitor — the whole verdict comes from this
// ---------------------------------------------------------------------------

/**
 * Gaps between animation frames. A gap is the main thread being unavailable,
 * which is exactly what "input is blocked" means to a user.
 */
const frames = {
  last: 0,
  gaps: [] as number[],
  recording: false,
};

const tick = (now: number) => {
  if (frames.recording && frames.last) {
    frames.gaps.push(now - frames.last);
  }

  frames.last = now;
  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

const startRecording = () => {
  frames.gaps = [];
  frames.recording = true;
};

const stopRecording = () => {
  frames.recording = false;
  return frames.gaps.slice();
};

// ---------------------------------------------------------------------------
// Workload
// ---------------------------------------------------------------------------

type Row = { id: number; label: string };

let nextId = 1;

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, () => ({
    id: nextId++,
    label: `row ${nextId}`,
  }));

type Counters = { mounts: number; updates: number; instances: string };

/** One heavy list. Rows are components so the build carries real render work. */
const heavyList = (core: Core, host: HTMLElement, counters: Counters) => {
  let rows: Row[] = [];
  let renew = () => {};
  let instance = 0;

  const RowComp = core.mount((_renew: unknown, props: { row: Row }) => {
    // E-2: a mounter that runs twice for one committed row is a duplicate.
    counters.mounts += 1;
    // E-6: fixed for the life of this component instance. If a discard were to
    // lose the closure, a surviving row's number would change.
    const mine = ++instance;

    core.mountCallback(() => () => {
      counters.mounts -= 1;
    });

    core.updateCallback(
      () => {
        // E-3: fires once per committed change of this row's label.
        counters.updates += 1;
      },
      () => [props.row.label]
    );

    return (p: { row: Row }) =>
      core.h(
        'li',
        {},
        core.h('span', { class: 'n' }, `#${mine}`),
        ' ',
        p.row.label
      );
  });

  const App = core.mount((r: () => void) => {
    renew = r;
    return () =>
      core.h(
        'ul',
        {},
        rows.map(row => core.h(RowComp, { key: row.id, row }))
      );
  });

  const destroy = core.render(core.h(App, {}), host);

  return {
    setRows: (next: Row[]) => {
      rows = next;
    },
    get rows() {
      return rows;
    },
    renew: () => renew(),
    destroy,
  };
};

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

type Panel = {
  name: string;
  core: Core;
  deferred: boolean;
  root: HTMLElement;
};

const rowCount = () =>
  Number((document.getElementById('rows') as HTMLSelectElement).value);

const percentile = (sorted: number[], p: number) =>
  sorted.length
    ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
    : 0;

const buildPanel = (panel: Panel) => {
  const host = panel.root.querySelector('.host') as HTMLElement;
  const stats = panel.root.querySelector('.stats') as HTMLElement;
  const input = panel.root.querySelector('input') as HTMLInputElement;
  const counters: Counters = { mounts: 0, updates: 0, instances: '' };

  const list = heavyList(panel.core, host, counters);

  // Input latency: how long from the keystroke until the browser could paint.
  const latencies: number[] = [];
  let pending = 0;

  input.addEventListener('input', () => {
    pending = performance.now();
    requestAnimationFrame(() => {
      if (pending) {
        latencies.push(performance.now() - pending);
        pending = 0;
      }
    });
  });

  const report = (gaps: number[], total: number) => {
    const sorted = gaps.slice().sort((a, b) => a - b);
    const longest = sorted.length ? sorted[sorted.length - 1] : 0;
    const overFrame = gaps.filter(gap => gap > 32).length;
    // Work that ran in one shot shows up as a single long gap. Several medium
    // ones mean the build stopped and came back — which is what E-1 needs to
    // know before comparing the result against an uninterrupted render.
    const blocks = gaps.filter(gap => gap > 8).length;
    const lat = latencies.slice().sort((a, b) => a - b);

    stats.innerHTML =
      `<b class="${longest > 50 ? 'bad' : 'good'}">최장 블록 ${longest.toFixed(0)}ms</b>` +
      ` · 8ms 초과 블록 ${blocks}개 · 32ms 초과 ${overFrame}개 · 총 ${total.toFixed(0)}ms` +
      `<br>살아있는 마운트 ${counters.mounts} / 행 ${list.rows.length}` +
      ` (E-2: 같아야 함) · updateCallback ${counters.updates} (E-3)` +
      (lat.length
        ? `<br>입력→페인트 p50 ${percentile(lat, 0.5).toFixed(0)}ms / 최대 ${lat[lat.length - 1].toFixed(0)}ms (${lat.length}회)`
        : '<br>입력→페인트: 타이핑하면 측정됩니다');
  };

  const run = async (next: Row[]) => {
    startRecording();
    const started = performance.now();

    if (panel.deferred && panel.core.deferRender) {
      panel.core.deferRender(() => {
        list.setRows(next);
        list.renew();
      });
      await (panel.core.whenIdle as () => Promise<void>)();
    } else {
      list.setRows(next);
      list.renew();
      await panel.core.nextTick();
    }

    // A short tail so the frame after the commit is included.
    await new Promise(resolve => setTimeout(resolve, 120));

    report(stopRecording(), performance.now() - started);
  };

  /**
   * E-2 — start a mount-heavy deferred update, then cut in with an urgent one
   * while it is still building.
   *
   * The invariant is the live mount count: every mounter that ran must belong to
   * a row that is on screen. If the interrupted build's mounters ran and its
   * commit was then thrown away, those components were registered and never
   * unmounted, and the count comes out higher than the row count.
   */
  const race = async () => {
    startRecording();
    const started = performance.now();

    const heavy = makeRows(rowCount());

    if (panel.deferred && panel.core.deferRender) {
      panel.core.deferRender(() => {
        list.setRows(heavy);
        list.renew();
      });
    } else {
      list.setRows(heavy);
      list.renew();
    }

    // One macrotask in: the deferred build has started and parked at least once.
    await new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve(null);
      channel.port2.postMessage(null);
    });

    // The urgent one. Sync lane, three rows.
    list.setRows(makeRows(3));
    list.renew();
    await panel.core.nextTick();

    if (panel.core.whenIdle) {
      await panel.core.whenIdle();
    }

    await new Promise(resolve => setTimeout(resolve, 120));
    report(stopRecording(), performance.now() - started);

    return { mounts: counters.mounts, rows: list.rows.length };
  };

  /**
   * E-3 + E-6 — a build that is genuinely DISCARDED, then replaced.
   *
   * The deferred pass re-renders without moving any dependency, so it fires no
   * `updateCallback` and is therefore droppable (DC-18). The urgent one that
   * cuts in does move them. Afterwards exactly one effect must have fired per
   * changed row: fewer means the dropped build left the hook cursor shifted and
   * the effect was lost, more means it ran twice.
   *
   * The rows keep their keys throughout, so their instance numbers must not
   * change either — that is E-6, closure preservation across a discard.
   */
  const discardAndReplace = async () => {
    // Seed it here. Reading whatever happens to be on screen let this run
    // against an empty list, where "0 effects for 0 changed rows" and
    // "undefined === undefined" both report as a pass — the exact vacuous pass
    // the rest of this project keeps warning about.
    if (!list.rows.length) {
      list.setRows(makeRows(rowCount()));
      list.renew();
      await panel.core.nextTick();

      if (panel.core.whenIdle) {
        await panel.core.whenIdle();
      }
    }
    const before = (host.querySelector('.n') as HTMLElement | null)
      ?.textContent;

    counters.updates = 0;
    startRecording();
    const started = performance.now();

    // Same labels: nothing to fire, so this build can be dropped.
    if (panel.deferred && panel.core.deferRender) {
      panel.core.deferRender(() => {
        list.setRows(list.rows.map(row => ({ ...row })));
        list.renew();
      });
    }

    await new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve(null);
      channel.port2.postMessage(null);
    });

    // Urgent, and it does move the dependency.
    const changed = list.rows.map((row, i) =>
      i % 10 === 0 ? { ...row, label: `${row.label} !` } : row
    );
    const expected = changed.filter((_row, i) => i % 10 === 0).length;

    list.setRows(changed);
    list.renew();
    await panel.core.nextTick();

    if (panel.core.whenIdle) {
      await panel.core.whenIdle();
    }

    await new Promise(resolve => setTimeout(resolve, 120));
    report(stopRecording(), performance.now() - started);

    return {
      updates: counters.updates,
      expected,
      before,
      after: (host.querySelector('.n') as HTMLElement | null)?.textContent,
    };
  };

  /** E-5 — tear down while a build is still parked. */
  const destroyMidFlight = () => {
    if (panel.deferred && panel.core.deferRender) {
      panel.core.deferRender(() => {
        list.setRows(makeRows(rowCount()));
        list.renew();
      });
    }

    list.destroy();
  };

  return {
    run,
    race,
    discardAndReplace,
    destroyMidFlight,
    rows: () => list.rows,
    html: () => host.innerHTML,
    resetLatency: () => {
      latencies.length = 0;
    },
    destroy: () => list.destroy(),
  };
};

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

const panels = {
  base: buildPanel({
    name: 'base',
    core: base,
    deferred: false,
    root: document.getElementById('panel-base') as HTMLElement,
  }),
  concurrent: buildPanel({
    name: 'concurrent',
    core: concurrent,
    deferred: true,
    root: document.getElementById('panel-concurrent') as HTMLElement,
  }),
};

const verdict = document.getElementById('verdict') as HTMLElement;

/**
 * Both panels must render the SAME rows, or comparing their DOM (E-1) compares
 * nothing. Generating per panel was the first version of this and it made E-1
 * fail every single time — the ids and labels simply differed.
 */
const both = async (fresh: boolean) => {
  verdict.textContent = '측정 중 …';

  const rows = fresh
    ? makeRows(rowCount())
    : panels.base
        .rows()
        .map((row, i) =>
          i % 10 === 0 ? { ...row, label: `${row.label} !` } : row
        );

  await panels.base.run(rows.map(row => ({ ...row })));
  await panels.concurrent.run(rows.map(row => ({ ...row })));

  verdict.textContent =
    'E-4 판정: concurrent 쪽 "최장 블록"이 base보다 뚜렷하게 짧아야 통과입니다. ' +
    '총 시간은 비슷한 것이 정상입니다 — 중단은 빨라지는 게 아니라 쪼개지는 것입니다.';
};

(document.getElementById('replace') as HTMLButtonElement).addEventListener(
  'click',
  () => {
    both(true);
  }
);

(document.getElementById('update') as HTMLButtonElement).addEventListener(
  'click',
  () => {
    both(false);
  }
);

(document.getElementById('race') as HTMLButtonElement).addEventListener(
  'click',
  async () => {
    verdict.textContent = '마운트 중 급한 갱신 …';

    const result = await panels.concurrent.race();

    if (!result.rows) {
      verdict.innerHTML =
        '<b class="bad">측정 불가</b> — 행이 하나도 없습니다.';
      return;
    }

    const ok = result.mounts === result.rows;

    verdict.innerHTML = ok
      ? `<b class="good">E-2 통과</b> — 살아있는 마운트 ${result.mounts}개 = 행 ${result.rows}개. ` +
        '중단된 마운트 빌드가 버려지지 않고 완주했다는 뜻입니다 (DC-7).'
      : `<b class="bad">E-2 실패</b> — 살아있는 마운트 ${result.mounts}개인데 행은 ${result.rows}개입니다. ` +
        '커밋되지 않은 mounter가 실행됐고 언마운트되지 않았습니다.';
  }
);

(document.getElementById('effects') as HTMLButtonElement).addEventListener(
  'click',
  async () => {
    verdict.textContent = '갱신 중 급한 갱신 …';

    const r = await panels.concurrent.discardAndReplace();

    if (!r.expected || !r.before) {
      verdict.innerHTML =
        '<b class="bad">측정 불가</b> — 바뀐 행이 없거나 행이 렌더되지 않았습니다. ' +
        '이 상태의 "통과"는 아무것도 검증하지 않습니다.';
      return;
    }

    const effectsOk = r.updates === r.expected;
    const closureOk = r.before === r.after;

    verdict.innerHTML =
      (effectsOk
        ? `<b class="good">E-3 통과</b> — updateCallback ${r.updates}회 = 바뀐 행 ${r.expected}개.`
        : `<b class="bad">E-3 실패</b> — updateCallback ${r.updates}회인데 바뀐 행은 ${r.expected}개입니다.`) +
      '<br>' +
      (closureOk
        ? `<b class="good">E-6 통과</b> — 첫 행의 인스턴스 번호가 ${r.after}로 그대로입니다.`
        : `<b class="bad">E-6 실패</b> — 인스턴스 번호가 ${r.before} → ${r.after}로 바뀌었습니다.`);
  }
);

(document.getElementById('compare') as HTMLButtonElement).addEventListener(
  'click',
  () => {
    const baseHtml = panels.base.html();
    const concurrentHtml = panels.concurrent.html();

    if (!baseHtml || !concurrentHtml) {
      verdict.innerHTML =
        '<b class="bad">측정 불가</b> — 한쪽이 비어 있습니다. ' +
        '먼저 위 버튼으로 한 번 측정한 뒤 눌러주세요.';
      return;
    }

    const same = baseHtml === concurrentHtml;
    verdict.innerHTML = same
      ? '<b class="good">E-1 통과</b> — 중단된 렌더(오른쪽)와 무중단 렌더(왼쪽)의 ' +
        'DOM이 완전히 같습니다. 오른쪽 "8ms 초과 블록"이 2개 이상이면 실제로 중단된 것입니다.'
      : '<b class="bad">E-1 실패</b> — 두 코어의 DOM이 다릅니다. ' +
        '(먼저 위 버튼으로 한 번 측정한 뒤 눌러주세요)';
  }
);

(document.getElementById('unmount') as HTMLButtonElement).addEventListener(
  'click',
  () => {
    // E-5: the deferred build is started and then torn down in the same turn,
    // so the teardown lands while work is still parked.
    panels.concurrent.destroyMidFlight();
    panels.base.destroy();
    verdict.innerHTML =
      '<b class="good">E-5</b> — <b>빌드가 멈춰 있는 상태에서</b> 언마운트했습니다. ' +
      '콘솔에 에러가 없으면 통과. 다시 측정하려면 새로고침하세요.';
  }
);

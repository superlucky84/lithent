import * as baseCore from 'bench-core-base';
import * as concurrentCore from 'bench-core-concurrent';

/**
 * Phase 7 (RC-7) — how long is ONE unit of work, in a real browser?
 *
 * 7-3 asks a yes/no question: does the target workload (large lists, deep
 * trees) actually produce units that exceed a frame? T2 exists to break such a
 * unit apart, so if none exist, T2 buys nothing and the honest move is 7-4.
 *
 * A "unit" here is one `replaceWDom` — one component re-rendering its subtree.
 * Every scenario therefore drives a SINGLE component, so `renew()` is exactly
 * one unit, and it is timed without touching the core:
 *
 *     t0 -> renew() -> await nextTick() -> t1
 *
 * `renew` queues `flushSync` as a microtask and `nextTick()` is
 * `Promise.resolve()`, so the continuation runs after the commit. What lands
 * between the two marks is script time — build plus commit — which is the thing
 * a frame budget is spent on. Paint happens after and is not counted; the
 * long-task observer below is the cross-check that the two agree.
 *
 * Both cores are measured because T1.5 claims no regression (C2). At this stage
 * they should be indistinguishable; a gap is a finding either way.
 */

type Core = {
  h: (...args: unknown[]) => unknown;
  mount: (mounter: unknown) => unknown;
  render: (wDom: unknown, host: HTMLElement) => () => void;
  nextTick: () => Promise<unknown>;
};

const CORES: { name: string; core: Core }[] = [
  { name: 'base', core: baseCore as unknown as Core },
  { name: 'concurrent', core: concurrentCore as unknown as Core },
];

const FRAME_MS = 16;
const ITERATIONS = 5;

// ---------------------------------------------------------------------------
// Workloads
// ---------------------------------------------------------------------------

type Row = { id: number; label: string; selected: boolean };

let nextId = 1;

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, () => ({
    id: nextId++,
    label: `row ${nextId}`,
    selected: false,
  }));

/** One component owning a keyed table — the js-framework-benchmark shape. */
const listApp = (core: Core, host: HTMLElement) => {
  let rows: Row[] = [];
  let renew = () => {};

  const App = core.mount((r: () => void) => {
    renew = r;
    return () =>
      core.h(
        'table',
        {},
        core.h(
          'tbody',
          {},
          rows.map(row =>
            core.h(
              'tr',
              { key: row.id, class: row.selected ? 'danger' : '' },
              core.h('td', {}, String(row.id)),
              core.h('td', {}, core.h('a', {}, row.label)),
              core.h('td', {}, core.h('a', {}, '×'))
            )
          )
        )
      );
  });

  const destroy = core.render(core.h(App, {}), host);

  return {
    get rows() {
      return rows;
    },
    set rows(next: Row[]) {
      rows = next;
    },
    renew: () => renew(),
    destroy,
  };
};

/** One component owning a deeply nested tree — the other shape T2 cares about. */
const deepApp = (core: Core, host: HTMLElement) => {
  let depth = 0;
  let label = 'a';
  let renew = () => {};

  const nest = (level: number): unknown =>
    level === 0
      ? core.h('span', {}, label)
      : core.h('div', { class: `d${level}` }, nest(level - 1));

  const App = core.mount((r: () => void) => {
    renew = r;
    return () => core.h('section', {}, nest(depth));
  });

  const destroy = core.render(core.h(App, {}), host);

  return {
    setDepth: (value: number) => {
      depth = value;
    },
    setLabel: (value: string) => {
      label = value;
    },
    renew: () => renew(),
    destroy,
  };
};

/** Same list, but every row is a component — the shape a real app has. */
const componentListApp = (core: Core, host: HTMLElement) => {
  let rows: Row[] = [];
  let renew = () => {};

  const RowComp = core.mount(
    (_r: unknown, props: { row: Row }) => () =>
      core.h(
        'tr',
        { class: props.row.selected ? 'danger' : '' },
        core.h('td', {}, String(props.row.id)),
        core.h('td', {}, core.h('a', {}, props.row.label))
      )
  );

  const App = core.mount((r: () => void) => {
    renew = r;
    return () =>
      core.h(
        'table',
        {},
        core.h(
          'tbody',
          {},
          rows.map(row => core.h(RowComp, { key: row.id, row }))
        )
      );
  });

  const destroy = core.render(core.h(App, {}), host);

  return {
    get rows() {
      return rows;
    },
    set rows(next: Row[]) {
      rows = next;
    },
    renew: () => renew(),
    destroy,
  };
};

type Scenario = {
  name: string;
  note: string;
  /** Puts the app in the pre-measurement state. Not timed. */
  make: (
    core: Core,
    host: HTMLElement
  ) => {
    reset: () => Promise<void>;
    act: () => void;
    destroy: () => void;
  };
};

const listScenario = (
  name: string,
  note: string,
  before: (app: ReturnType<typeof listApp>) => void,
  act: (app: ReturnType<typeof listApp>) => void
): Scenario => ({
  name,
  note,
  make: (core, host) => {
    const app = listApp(core, host);
    return {
      reset: async () => {
        before(app);
        app.renew();
        await core.nextTick();
      },
      act: () => {
        act(app);
        app.renew();
      },
      destroy: app.destroy,
    };
  },
});

const SCENARIOS: Scenario[] = [
  listScenario(
    'create 1,000',
    'empty -> 1,000 fresh keyed rows',
    app => {
      app.rows = [];
    },
    app => {
      app.rows = makeRows(1000);
    }
  ),
  listScenario(
    'create 10,000',
    'empty -> 10,000 fresh keyed rows',
    app => {
      app.rows = [];
    },
    app => {
      app.rows = makeRows(10000);
    }
  ),
  listScenario(
    'replace all 1,000',
    '1,000 rows -> 1,000 different keys',
    app => {
      app.rows = makeRows(1000);
    },
    app => {
      app.rows = makeRows(1000);
    }
  ),
  listScenario(
    'replace all 10,000',
    '10,000 rows -> 10,000 different keys',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      app.rows = makeRows(10000);
    }
  ),
  listScenario(
    'update every 10th (10,000)',
    'same keys, 1,000 labels change',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      app.rows.forEach((row, i) => {
        if (i % 10 === 0) {
          row.label = `${row.label} !`;
        }
      });
    }
  ),
  listScenario(
    'select row (10,000)',
    'one class flips',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      app.rows.forEach(row => {
        row.selected = false;
      });
      app.rows[5000].selected = true;
    }
  ),
  listScenario(
    'swap rows (10,000)',
    'row 1 <-> row 9,998 — the LIS path',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      const rows = app.rows;
      const a = rows[1];
      rows[1] = rows[9998];
      rows[9998] = a;
    }
  ),
  listScenario(
    'append 1,000 to 10,000',
    'keys kept, 1,000 added at the tail',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      app.rows = app.rows.concat(makeRows(1000));
    }
  ),
  listScenario(
    'clear 10,000',
    '10,000 rows -> empty',
    app => {
      app.rows = makeRows(10000);
    },
    app => {
      app.rows = [];
    }
  ),
  {
    name: 'component rows: create 10,000',
    note: 'every row is a component — build phase carries the render cost',
    make: (core, host) => {
      const app = componentListApp(core, host);
      return {
        reset: async () => {
          app.rows = [];
          app.renew();
          await core.nextTick();
        },
        act: () => {
          app.rows = makeRows(10000);
          app.renew();
        },
        destroy: app.destroy,
      };
    },
  },
  {
    name: 'component rows: update every 10th',
    note: 'same keys, 1,000 labels change',
    make: (core, host) => {
      const app = componentListApp(core, host);
      return {
        reset: async () => {
          app.rows = makeRows(10000);
          app.renew();
          await core.nextTick();
        },
        act: () => {
          app.rows = app.rows.map((row, i) =>
            i % 10 === 0 ? { ...row, label: `${row.label} !` } : row
          );
          app.renew();
        },
        destroy: app.destroy,
      };
    },
  },
  {
    name: 'deep tree x400',
    note: '400 nested elements, leaf text changes',
    make: (core, host) => {
      const app = deepApp(core, host);
      let n = 0;
      return {
        reset: async () => {
          app.setDepth(400);
          app.renew();
          await core.nextTick();
        },
        act: () => {
          app.setLabel(`a${n++}`);
          app.renew();
        },
        destroy: app.destroy,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------

type Result = {
  scenario: string;
  note: string;
  core: string;
  samples: number[];
};

const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

const breathe = () => new Promise(resolve => setTimeout(resolve, 0));

const runScenario = async (
  scenario: Scenario,
  coreName: string,
  core: Core,
  stage: HTMLElement
): Promise<Result> => {
  const host = document.createElement('div');
  stage.appendChild(host);

  const run = scenario.make(core, host);
  const samples: number[] = [];

  // One unmeasured pass so the first sample is not paying for cold code paths.
  await run.reset();
  run.act();
  await core.nextTick();

  for (let i = 0; i < ITERATIONS; i++) {
    await run.reset();
    await breathe();

    const started = performance.now();
    run.act();
    await core.nextTick();
    samples.push(performance.now() - started);
  }

  run.destroy();
  host.remove();
  await breathe();

  return {
    scenario: scenario.name,
    note: scenario.note,
    core: coreName,
    samples,
  };
};

// ---------------------------------------------------------------------------
// Long-task cross-check
// ---------------------------------------------------------------------------

const longTasks: number[] = [];

const observeLongTasks = () => {
  if (typeof PerformanceObserver !== 'function') {
    return null;
  }

  try {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => longTasks.push(entry.duration));
    });
    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  } catch {
    // Firefox/Safari have no longtask entry type. The primary measurement does
    // not depend on it.
    return null;
  }
};

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const fmt = (ms: number) => ms.toFixed(1);

const toMarkdown = (results: Result[]) => {
  const head =
    '| 시나리오 | 코어 | n | p50 | p95 | max | >16ms |\n|---|---|---:|---:|---:|---:|---:|';
  const rows = results.map(result => {
    const sorted = [...result.samples].sort((a, b) => a - b);
    const over = sorted.filter(ms => ms > FRAME_MS).length;
    return `| ${result.scenario} | ${result.core} | ${sorted.length} | ${fmt(
      percentile(sorted, 0.5)
    )} | ${fmt(percentile(sorted, 0.95))} | ${fmt(
      sorted[sorted.length - 1]
    )} | ${over}/${sorted.length} |`;
  });

  const overall = results.flatMap(r => r.samples).filter(ms => ms > FRAME_MS);
  const verdict = overall.length
    ? `\n\n**7-3 판정 근거**: 16ms 초과 단위가 실재한다 (${overall.length}개, 최대 ${fmt(
        Math.max(...overall)
      )}ms).`
    : '\n\n**7-3 판정 근거**: 이 워크로드에서 16ms 초과 단위가 관측되지 않았다.';

  const tasks = longTasks.length
    ? `\n\n롱태스크(교차 확인): ${longTasks.length}건, 최대 ${fmt(
        Math.max(...longTasks)
      )}ms.`
    : '\n\n롱태스크(교차 확인): 관측 없음 또는 브라우저 미지원.';

  return `${head}\n${rows.join('\n')}${verdict}${tasks}`;
};

const render = (results: Result[], target: HTMLElement) => {
  const rows = results
    .map(result => {
      const sorted = [...result.samples].sort((a, b) => a - b);
      const over = sorted.filter(ms => ms > FRAME_MS).length;
      const cls = over ? ' class="over"' : '';
      return `<tr${cls}>
        <td>${result.scenario}<div class="note">${result.note}</div></td>
        <td>${result.core}</td>
        <td class="n">${sorted.length}</td>
        <td class="n">${fmt(percentile(sorted, 0.5))}</td>
        <td class="n">${fmt(percentile(sorted, 0.95))}</td>
        <td class="n">${fmt(sorted[sorted.length - 1])}</td>
        <td class="n">${over}/${sorted.length}</td>
      </tr>`;
    })
    .join('');

  target.innerHTML = `<table>
    <thead><tr>
      <th>scenario</th><th>core</th><th>n</th>
      <th>p50</th><th>p95</th><th>max</th><th>&gt;16ms</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
};

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

const stage = document.getElementById('stage') as HTMLElement;
const output = document.getElementById('output') as HTMLElement;
const status = document.getElementById('status') as HTMLElement;
const runButton = document.getElementById('run') as HTMLButtonElement;
const copyButton = document.getElementById('copy') as HTMLButtonElement;

let markdown = '';

const start = async () => {
  runButton.disabled = true;
  copyButton.disabled = true;
  longTasks.length = 0;
  output.innerHTML = '';

  const observer = observeLongTasks();
  const results: Result[] = [];

  for (const scenario of SCENARIOS) {
    for (const { name, core } of CORES) {
      status.textContent = `${scenario.name} — ${name} …`;
      await breathe();
      results.push(await runScenario(scenario, name, core, stage));
      render(results, output);
    }
  }

  if (observer) {
    observer.disconnect();
  }

  markdown = toMarkdown(results);
  status.textContent = `done — ${SCENARIOS.length} scenarios x ${CORES.length} cores x ${ITERATIONS} runs`;
  runButton.disabled = false;
  copyButton.disabled = false;
};

runButton.addEventListener('click', () => {
  start();
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(markdown);
  copyButton.textContent = 'copied';
  setTimeout(() => {
    copyButton.textContent = 'copy as markdown';
  }, 1200);
});

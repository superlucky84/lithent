// Summaries are derived from audited raw results; no historical score pooling.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, read, git } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const dest = path.join(root, 'docs/benchmark');
const core = read(path.join(out, 'core-results.json'));
const event = read(path.join(out, 'event-results.json'));
const ui = read(path.join(out, 'ui-results.json'));
const disposal = read(path.join(out, 'dispose-results.json'));
const retention = read(path.join(out, 'retention.json'));
const finalFile = path.join(out, 'final-event-results.json');
const final = fs.existsSync(finalFile) ? read(finalFile) : null;
for (const name of ['core', 'event', 'ui', ...(final ? ['final-event'] : [])])
  assert(read(path.join(out, `${name}-audit.json`)).pass);
assert(disposal.complete && retention.complete);
const adopted = fs.existsSync(path.join(out, 'adoption.json'));
const validationFile = path.join(out, 'validation.json');
const validation = fs.existsSync(validationFile) ? read(validationFile) : null;
const evidenceFile = path.join(dest, 'comprehensive-evidence-manifest.json');
const evidence = fs.existsSync(evidenceFile) ? read(evidenceFile) : null;
const head = git(['rev-parse', 'HEAD']).toString().trim();
const labels = {
  baseline: 'B',
  event: 'E',
  c2: 'K',
  combined: 'EK',
  'react-hooks': 'React H',
  'react-classes': 'React C',
  'preact-hooks': 'Preact H',
  'preact-classes': 'Preact C',
};
const names = ['baseline', 'event', 'c2', 'combined'];
const builds = Object.fromEntries(
  names.map(name => [name, read(path.join(out, name, 'build.json'))])
);
const number = value => value.toFixed(3);
const percent = ratio =>
  `${ratio < 1 ? '' : '+'}${((ratio - 1) * 100).toFixed(2)}%`;
const table = (headers, rows) =>
  [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |'),
  ].join('\n');
const cpuTable = (data, metric) =>
  table(
    ['Item', ...data.names.map(name => labels[name])],
    data.rows.pooled.map(item => [
      item.id,
      ...data.names.map(name => number(item.conditions[name][metric].median)),
    ])
  );
const memoryTable = data =>
  table(
    ['Item (MB)', ...data.names.map(name => labels[name])],
    data.memory.pooled.map(item => [
      item.id,
      ...data.names.map(name => number(item.conditions[name].median)),
    ])
  );
const copies = {
  'core-results.json': 'comprehensive-core-results.json',
  'event-results.json': 'comprehensive-event-results.json',
  'ui-results.json': 'comprehensive-ui-results.json',
  'retention.json': 'comprehensive-retention.json',
  'dispose-results.json': 'comprehensive-root-dispose.json',
  'counts.json': 'comprehensive-counts.json',
  'selection.json': 'comprehensive-selection.json',
  ...(final
    ? { 'final-event-results.json': 'comprehensive-final-results.json' }
    : {}),
  ...(adopted ? { 'adoption.json': 'comprehensive-adoption.json' } : {}),
  ...(validation
    ? {
        'validation.json': 'comprehensive-validation.json',
        'package-dispatch.json': 'comprehensive-package-dispatch.json',
      }
    : {}),
};
for (const [source, target] of Object.entries(copies))
  fs.copyFileSync(path.join(out, source), path.join(dest, target));
fs.writeFileSync(
  path.join(dest, 'comprehensive-audits.json'),
  JSON.stringify(
    Object.fromEntries(
      ['core', 'event', 'ui', ...(final ? ['final-event'] : [])].map(name => [
        name,
        read(path.join(out, `${name}-audit.json`)),
      ])
    ),
    null,
    2
  ) + '\n'
);
const failures = [];
for (const scope of ['core', ...(final ? ['final-event'] : [])])
  for (const order of ['main', 'reverse'])
    for (const kind of ['cpu', 'mem']) {
      const run = read(
        path.join(out, `${scope}-${order}/production-${kind}.json`)
      );
      for (const failure of run.failedBatches || [])
        failures.push({ scope, order, kind, ...failure });
    }
fs.writeFileSync(
  path.join(dest, 'comprehensive-failed-batches.json'),
  JSON.stringify(failures, null, 2) + '\n'
);
const lines = [
  '# DC-22 comprehensive integration',
  '',
  `2026-10-26. ${adopted ? 'The measured E event implementation is adopted in the working tree.' : 'E is selected; default runtime adoption and integration remain open.'} ${final ? `The fresh six-app comparison is complete: ${final.goal.pooled.filter(item => item.pass).length}/9 pooled CPU goals pass.` : 'The fresh six-app comparison is collecting serially.'} HEAD is \`${head}\`; these changes are uncommitted.`,
  '',
  'Canonical scope: [requirements](../performance-improvement/REQUIREMENTS.md#7-별도-브랜치를-포함한-종합-반영--dc-22), [design](../performance-improvement/DESIGN.md#dc-22--별도-브랜치를-포함한-종합-반영), [implementation](../performance-improvement/IMPLEMENT.md#dc-22--종합-반영-실행-phase4a4e), [manual checks](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-16-종합-조합최종-목표코어-반영--r53r57r59-dc-22-356-phase4c6).',
  '',
  '## Selection and candidate review',
  '',
  'Choose **E alone**: default event proxies for base and concurrent, with direct native registration through existing ref/mountCallback for exact native identity, order or options. The inline UI benefit is real; the original cached benchmark has no listener rebinds on select/partial, so these benefits are evaluated separately. No new public event API or global mode is introduced.',
  '',
  table(
    ['Candidate', 'Decision and evidence'],
    [
      [
        'compact13 / full22',
        'Keep compact13 as the underlying layout. Full22’s historical 10k memory cost was +14.95%; no new layout hypothesis justifies repeating it.',
      ],
      [
        'Flat event E',
        'Adopt the repaired flat table. Inline updates −15.22% to −17.95%; uncached UI click-to-final-paint partial −5.22%, select −9.44%. Disclose dispatch, heap and size costs below.',
      ],
      [
        'Slot event',
        'Preserved trusted-click control and prior allocation comparison. Retain flat storage without per-event slot objects; do not pool the older slot/noevent +21% run.',
      ],
      [
        'C2 K / EK',
        'Rebased and measured, including lifetime checks. K removes four render arrays and 1,000 index-analysis visits on unchanged 1k updates, but keeps Map/key/diff work. Original cached weighted total K/B +1.40%, EK/B +0.47%, E/B +0.47%. EK/E uncached partial −1.94%, select +1.04%; no consistent extra app benefit sufficient to adopt proof management now. Preserve all K/EK inputs and results.',
      ],
      [
        'Fragment range',
        'Reviewed active f997302 and DC-19: getter/snapshot observation difference and uncertain timing. Defer; this run adds no new function-level anchor attribution or compatible improvement hypothesis.',
      ],
      [
        'Fragment snapshot',
        'Reviewed active 3afd8de and DC-19B: observations preserved but no convincing elapsed-time gain. Defer under the same evidence requirement, not because of the historical +21B alone.',
      ],
      [
        'C1',
        'Historical own-renew lookup gain does not target the original Table-only cached benchmark. Reopen with a demonstrated own-renew lookup hotspot.',
      ],
      [
        'C3',
        'Historical actual cached-app comparison regressed total +21.08% and JS +70.27%, with higher memory. No new explicit consumer case justifies integration here.',
      ],
      [
        'C4',
        'Requires a contract for ownership and invalidation of change information; this event optimization introduces none. Conditional research, not an implemented optimization.',
      ],
    ]
  ),
  '',
  'Preserved branch snapshot: 6993a93; active flat: 7e838bc; slot: 189ddef. The preserved branch tip had restored compact13 runtime. [Frozen selection and detailed ratios](./comprehensive-selection.json) records the choice before final peer collection.',
  '',
  '## Inputs, protocol and interpretation',
  '',
  '[Frozen inputs](./comprehensive-initial-inputs.json) cover 17 baseline runtime sources, 30 default guards, sibling inputs, browser executable and engine hashes. [Environment](./comprehensive-environment.json): macOS26.5.2 ARM, 10 CPUs, Chrome156.0.8078.47; build Node20.3.0, official runner Node25.6.1. The run directory is `/private/tmp/lithent-final-20261025`.',
  '',
  'The original cached app/helper remain unchanged. Runner/assets: 185 frozen files; 343 installed package metadata files verified. The four peers use preserved production bytes plus source/lock/dependency records: React hooks19.2.0, classes19.0.0; Preact hooks/classes11.0.0. Peer bundles were not rebuilt. All timings are freshly executed here; no Linux151/Mac155/older156 scores are pooled.',
  '',
  'Eight apps passed common DOM identity, official keyed/nine-action/font gates before timing. Alternate/reverse orders are balanced. CPU uses the frozen official runner’s click-to-final-paint calculation, 25 select and 15 other samples per app/order. The original four-condition comparison has 1,160 CPU/120 official memory samples. The final six-app comparison has 1,740 CPU/180 memory samples. Builds, tests, profiling and other benchmarks did not run alongside timing.',
  '',
  table(
    [
      'CPU item',
      'Rows / action',
      'CPU throttle',
      'Initialization before retained click',
    ],
    [
      ['01', 'create 1,000', '1×', '5 create/clear cycles'],
      ['02', 'replace 1,000', '1×', '5 replacements'],
      ['03', 'update every tenth of 1,000', '4×', 'create, then 3 updates'],
      [
        '04',
        'select row 2 of 1,000',
        '4×',
        'create, one preparatory select at row 5 (declared warmupCount is 5; source loop is commented)',
      ],
      [
        '05',
        'swap two of 1,000',
        '4×',
        'create, 6 swaps (source uses ≤ warmupCount=5)',
      ],
      ['06', 'remove from initially 1,000', '2×', 'create, 5 removals'],
      ['07', 'create 10,000', '1×', '5 create-1k/clear cycles'],
      [
        '08',
        'append 1,000 to 1,000',
        '1×',
        '5 create/clear cycles, then create 1,000',
      ],
      ['09', 'clear 1,000', '4×', '5 create/clear cycles, then create 1,000'],
    ]
  ),
  '',
  'Each retained CPU sample uses a fresh page. Initialization is unthrottled; the runner then applies the item’s throttle, starts tracing, waits 50ms, forces a synchronous major last-resort GC, performs the trusted click, waits 100ms and stops tracing. Legacy ID suffixes such as x16/x8 do not specify the current throttle. The separate directory UI partial/select measurements also use **4× CPU throttling**, consistently across all four conditions. These are controlled local latency observations, not an unthrottled-device guarantee. Runner source, actual arguments, browser flags, warnings and load checkpoints are retained.',
  '',
  'Ratios are candidate/reference; lower is faster. CPU total, JS and paint are separate medians, so their medians need not add up. Weighted ratios use the pinned upstream geometric weights. Full distributions (N, quartiles, min/max), both orders, timestamps and ratios are in the linked JSON. Small/order-dependent differences remain uncertain; a pooled median alone is not a confidence claim. Official memory is reported in the runner’s MB unit, separate from JSHeapUsedSize GC diagnostics. Startup/transfer latency remains outside IC-1.',
  '',
  '## Trusted alias repair and native integration',
  '',
  '[Production UMD/helper trusted-click observations](./comprehensive-event-dispatch.json) reproduce the preserved flat failure. A previously registered native custom-element listener renews during the first trusted click and adds onclick=B while onClick=A remains unchanged.',
  '',
  table(
    ['Condition', 'First trusted click', 'Following click', 'Nested A count'],
    [
      ['Compact13', 'A', 'A, B', 2],
      ['Slot', 'A', 'A, B', 2],
      ['Original flat', 'none', 'A, B', 1],
      ['Repaired E', 'A', 'A, B', 2],
    ]
  ),
  '',
  'E retains the original proxy/A registration and adds only B. A private lazy Set records names that entered native alias handling; a proxy is removed only when its own handler changes. The normal path remains a flat table/shared dispatch. No callback/Event stamping or delayed registration is added. Synthetic dispatch keeps its JavaScript stack and did not reproduce this microtask-between-native-listeners defect; trusted input is a required regression.',
  '',
  table(
    ['Native interop observation', 'B/K', 'E/EK'],
    [
      [
        'Replace prop after external listener registered',
        'external, new',
        'new, external',
      ],
      [
        'External removeEventListener(original callback)',
        'removes it',
        'managed proxy remains',
      ],
      [
        'External native add of same prop callback',
        'one callback',
        'two callbacks',
      ],
      [
        'Direct native ref/mountCallback path',
        'native order/identity/options/cleanup',
        'native order/identity/options/cleanup',
      ],
    ]
  ),
  '',
  'These differences are the chosen public contract, separate from alias loss. Function this/currentTarget, object receivers, frozen handlers and reusing a frozen Event pass. Existing proxies read the latest callback when invoked; newly registered listeners follow native propagation timing. See [DOM events and native example](../../skills/lithent/reference/events.md). Ordinary detached DOM retains callable listeners if the application retains it; portal owner teardown removes only that owner’s target listeners.',
  '',
  '## Event update, mount, dispatch and GC comparison',
  '',
  'Each event workload has 2,000 buttons. 128 fresh timing pages = 2 orders × 4 rotations × 4 workloads × 4 conditions. Each page has 10 warmup batches and 30 retained batches of 5 updates. Reported update medians divide a batch by 5; nested batches are not 3,840 independent fresh pages. Dispatch has 3 warmup batches/page and 1,280 retained batches of 20,000 events. Separate GC: 48 contexts, 100 updates and 10 mount/dispose cycles, then two frames plus 100ms settling. Raw event observations, native-rebind counters and gates are preserved with the run.',
  '',
  table(
    [
      'Workload / condition',
      'Update ms',
      'Mount ms',
      '20k dispatch ms',
      'Update vs B',
      'Updated heap Δ KiB',
    ],
    Object.entries(event.timing.pooled).flatMap(([kind, items]) =>
      names.map(name => [
        `${kind} / ${labels[name]}`,
        number(items[name].updateMs.median),
        number(items[name].mountMs.median),
        number(items[name].dispatch20kMs.median),
        percent(items[name].updateMs.median / items.baseline.updateMs.median),
        number(event.memory[kind][name].updatedDeltaBytes.median / 1024),
      ])
    )
  ),
  '',
  'E inline-only/inline-text synthetic dispatch is +7.95%/+4.49%; stable-handler dispatch is +10.59%. Noevent dispatch is a control without a managed callback. Stable/noevent update effects are small and page-median/order-sensitive. Inline rebind diagnostics count 24,000 native add and remove calls for B/K versus zero for E/EK. All 48 settled GC contexts return DOM/listener counts to the empty-page counts, while nonzero settled heap deltas remain. [All event distributions and ratios](./comprehensive-event-results.json).',
  '',
  '## Uncached directory UI: actual click to final paint',
  '',
  'A separate deterministic 1,000-row directory screen uses an input, stable toolbar callbacks and inline row select/delete closures. The original cached benchmark is unchanged. Four frozen production apps pass keyed/nine-action/font gates. Two opposite orders collect 320 retained samples for partial/select with the same trace-based runner. This is a general UI comparison, not a nine-item peer score.',
  '',
  table(
    ['Action / condition', 'Total ms', 'JS ms', 'Paint ms', 'Total vs B'],
    ui.rows.pooled.flatMap(item =>
      names.map(name => [
        `${item.id} / ${labels[name]}`,
        ...['total', 'script', 'paint'].map(metric =>
          number(item.conditions[name][metric].median)
        ),
        percent(
          item.conditions[name].total.median /
            item.conditions.baseline.total.median
        ),
      ])
    )
  ),
  '',
  'E improves both actions in both orders. C2’s extra effect is smaller and differs by action/order; [UI distributions, all five comparisons and per-order ratios](./comprehensive-ui-results.json) retain that uncertainty.',
  '',
  '## Original cached app: four isolated cores',
  '',
  'Pooled CPU total medians (ms):',
  '',
  cpuTable(core, 'total'),
  '',
  'Pooled JS medians (ms):',
  '',
  cpuTable(core, 'script'),
  '',
  'Pooled paint medians (ms):',
  '',
  cpuTable(core, 'paint'),
  '',
  'Official memory medians:',
  '',
  memoryTable(core),
  '',
  table(
    ['Order / comparison', 'Weighted total', 'Weighted JS', 'Weighted paint'],
    Object.entries(core.ratios).flatMap(([order, items]) =>
      Object.entries(items).map(([comparison, item]) => [
        `${order} / ${comparison}`,
        ...['total', 'script', 'paint'].map(metric =>
          percent(item.weighted[metric])
        ),
      ])
    )
  ),
  '',
  'E 10k official memory is +0.912901MB (+3.24%) in this four-condition collection; select/partial do not rebind original cached callbacks. [Four-core full distributions and comparisons](./comprehensive-core-results.json). K’s reverse remove-one paint/total increase is retained and is not removed or remeasured to improve a score. It contributes to order variation.',
  '',
  '## Final fresh comparison with all four fixed peers',
  '',
  ...(final
    ? [
        'H = hooks; C = classes. All six apps use the original benchmark contract. Pooled total medians (ms):',
        '',
        cpuTable(final, 'total'),
        '',
        'Pooled JS medians (ms):',
        '',
        cpuTable(final, 'script'),
        '',
        'Pooled paint medians (ms):',
        '',
        cpuTable(final, 'paint'),
        '',
        'Official memory medians:',
        '',
        memoryTable(final),
        '',
        table(
          ['Item', 'E / fastest peer', 'Main', 'Reverse', 'Pooled ≤1.10'],
          final.goal.pooled.map((item, i) => [
            item.id,
            number(item.ratio),
            number(final.goal.main[i].ratio),
            number(final.goal.reverse[i].ratio),
            item.pass ? 'PASS' : 'MISS',
          ])
        ),
        '',
        `CPU goal: ${final.goal.pooled.filter(item => item.pass).length}/9 pooled, ${final.goal.main.filter(item => item.pass).length}/9 main, ${final.goal.reverse.filter(item => item.pass).length}/9 reverse. The requirement is all nine; ${final.goal.pooled.every(item => item.pass) ? 'the pooled goal passes.' : 'the all-nine goal is **not met**. Event adoption is justified by the measured general UI gain and explicit costs, not by claiming this goal was reached.'}`,
        '',
        table(
          [
            'Order / comparison',
            'Weighted total',
            'Weighted JS',
            'Weighted paint',
          ],
          Object.entries(final.ratios).flatMap(([order, items]) =>
            Object.entries(items).map(([comparison, item]) => [
              `${order} / ${comparison}`,
              ...['total', 'script', 'paint'].map(metric =>
                percent(item.weighted[metric])
              ),
            ])
          )
        ),
        '',
        '[Interactive six-app table](./comprehensive-table.html) · [Full distributions and goal ratios](./comprehensive-final-results.json) · [Color factors](./comprehensive-colors.json). Colors normalize to all six displayed apps, using the pinned upstream function; the goal uses the fastest of the four peers for each total median. No memory 1.10 goal is implied.',
      ]
    : [
        'Collection is in progress. Do not reuse the earlier core run as the promised fresh six-app comparison.',
      ]),
  '',
  '## Bundle cost, retention and root disposal',
  '',
  table(
    ['Condition / format', 'Raw B', 'gzip B', 'Brotli B'],
    names.flatMap(name =>
      Object.entries(builds[name].bundles).map(([file, sizes]) => [
        `${labels[name]} / ${file}`,
        sizes.raw,
        sizes.gzip,
        sizes.br,
      ])
    )
  ),
  '',
  'The selected E UMD costs +182B Brotli (+3.77%) versus compact13, with no arbitrary extra guard headroom. Exact measured hashes: ESM `e6dd2eab51497aa6cac6bbefa8deaa2430cb11f55a4abb6ae092983e5e886d45`; UMD `8c270bf2f91f678c47a087edf51be928af2425a8b6fbd54ee3687841956eb4f2`; CJS `6632c90c646f5695824dfb2caaf7bd59b9f85c18a36b6de5c56087246854d776`.',
  '',
  'The isolated size tables/compression use Node20.3.0. The final workspace pnpm commands use Node24.11.1/V8 13.6.233.10-node.28/zlib 1.3.1-470d3a2; despite that toolchain difference, all three actual base JS artifacts exactly match the isolated measured bytes. The final size command reports gzip5,395B for the same E UMD (the Node20 compressor reports5,412B); Brotli is5,006B in both. Concurrent UMD is7,076/9,000B and element998/1,000B. The recorded budgets and comparison tables use their stated compressor, not mixed gzip results.',
  '',
  'Twelve fresh original-app contexts run 100 create/clear cycles and 100 partial updates. DOM/listener counts show no growth; heap checkpoints remain nonzero and include changing application strings/JIT state. [Retention checkpoints](./comprehensive-retention.json) are separate from official memory and are not proof of absence of every possible leak.',
  '',
  'The first root diagnostic wrongly assumed disposing the root would clear module-global application state; baseline retained 8,022 observed elements. Its failure/bundles/inputs are preserved. The corrected diagnostic records populated root disposal **before** releasing store.rows/cached views and renewTable, then explicitly releases those application globals. All 12 contexts retain 8,022 observed elements before app release and zero afterward; host children are removed, external siblings preserved, and post-release DOM/listener counters return to empty-page values. Heap does not return to the pre-import value. [Both-stage root disposal results](./comprehensive-root-dispose.json). This does not change runtime or timing apps.',
  '',
  '## Validation, failures and reproducible evidence',
  '',
  'Preselection gates: B/E each 242 core tests; K/EK each 246 (including four proof lifetime tests); isolated E concurrent 329. A later persistent frozen-Event regression is part of final hardening, so these earlier counts are kept separate. Declaration/strict compilation and production ESM/UMD/CJS builds pass. [C2 diagnostic counters](./comprehensive-counts.json) report structural work, not elapsed-time results.',
  '',
  '[Independent Python audits](./comprehensive-audits.json) recalculate distributions, weighted geometric ratios, per-item ratios and goals from raw samples at 1e-12 tolerance. Event audit checks 128 pages/48 GC/256 distributions; UI audit checks 320 samples/72 distributions/90 ratios. CPU failed batches and retries are retained in [the failed-batch list](./comprehensive-failed-batches.json); failed partial samples are not mixed into successful batches.',
  '',
  'The final reverse memory run was interrupted after one completed group: Preact hooks ready-memory hit Target closed and two protocol timeouts. The macOS power log records Idle Sleep at 01:17:40 KST and DarkWake at 01:34:42/01:50:54, matching the timeout timestamps; the initial Target closed preceded sleep by five seconds. The failed aggregate, attempts and power log are retained. The exact wrapper resumed completed groups without repetition, with a process-bounded caffeinate idle-sleep assertion; Chrome/scenarios/options and all input hashes stayed unchanged. This external interruption is recorded separately and is not attributed to a library defect.',
  '',
  'Preparation failures are retained separately: initial /tmp versus /private/tmp declaration paths; an isolated concurrent resolver mixing live/frozen modules; an initial gate incorrectly imposing Lithent same-task batching on React classes. The corrected runner resolves one frozen core and separates core batching from shared peer DOM contracts. Sandbox browser launch needed browser execution permission. These are not counted as successful runtime/performance samples.',
  '',
  'Final verification also caught two fixture/document issues: ref<HTMLButtonElement> needed an explicit nullable type for a null initial value, and the SVG probe needed the existing renderer’s explicit xmlns prop. Only those fixtures/guides changed; the failed type/probe logs and original probe controller are preserved. The corrected checks pass without changing the measured runtime.',
  '',
  adopted
    ? '[Adopted source/bundle manifest](./comprehensive-adoption.json) verifies the actual package build matches the measured three base artifacts exactly. Both cores use the frozen E sources; concurrent artifact sizes/hashes are separately recorded, without claiming the base CPU gain for concurrent.'
    : 'Final adoption, package build/hash comparison, full dual/browser integration and permanent evidence packing remain open.',
  '',
  ...(validation
    ? [
        `[Final validation](./comprehensive-validation.json): full build sequence/parallel, concurrent artifact verification, strict size guard, strict base/concurrent/e2e types and changed-code ESLint pass. Repository test command executions: ${Object.entries(
          validation.unitCounts
        )
          .map(
            ([name, value]) =>
              `${name} ${value.passed} passed/${value.skipped} existing skipped`
          )
          .join(
            '; '
          )}. These are execution counts with the scripts’ existing suite overlap. Playwright: ${validation.e2e.expected} passed, ${validation.e2e.unexpected} unexpected, ${validation.e2e.flaky} flaky, ${validation.e2e.skipped} skipped; retries disabled.`,
        '',
        '[Actual package observations](./comprehensive-package-dispatch.json) verify trusted alias repair in ESM/UMD/CJS for base and concurrent, Node import/require exports, frozen/native controls, and the interactive table controls. Failed ordinary DOM setter creation and failed component construction release observed DOM/callback/key weak references after GC in both production ESM cores. This checks unreachable failure objects; it does not promise transactional rollback of arbitrary partially mounted trees. Existing full integration covers scheduler commit/abandon, retained boundaries, SSR/hydration, helper/context, HMR, element, examples and documentation interactions.',
      ]
    : []),
  '',
  'Reproduction and guarded resume: [experiments/comprehensive](../../experiments/comprehensive/README.md). Evidence packing includes immutable sources/builds, source/lock/dependency metadata, failed attempts, raw results/logs and every trace in bounded archives. Versions, the upstream app and release/publication state are unchanged.',
  '',
  ...(evidence
    ? [
        `[Evidence manifest](./comprehensive-evidence-manifest.json): ${evidence.totalEntries} entries, ${evidence.traceFiles} trace files, ${evidence.archives.length} bounded archives. [Independent archive audit](./comprehensive-archive-audit.json) checks every archive/member SHA-256.`,
        '',
        table(
          ['Archive', 'Bytes', 'SHA-256'],
          evidence.archives.map(item => [
            `[${item.file}](./${item.file})`,
            item.bytes,
            '`' + item.sha256 + '`',
          ])
        ),
        '',
      ]
    : [
        'The evidence manifest will be written after collection/integration and will list every entry and archive hash.',
        '',
      ]),
];
fs.writeFileSync(path.join(dest, 'COMPREHENSIVE_RESULTS.md'), lines.join('\n'));
console.log(
  JSON.stringify({
    report: 'docs/benchmark/COMPREHENSIVE_RESULTS.md',
    final: !!final,
    adopted,
    sidecars: Object.keys(copies).length,
    failedBatches: failures.length,
  })
);

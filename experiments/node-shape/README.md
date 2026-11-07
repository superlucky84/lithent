# DC-18 WDom object layout

The [results](../../docs/benchmark/NODE_SHAPE_RESULTS.md) compare the original
core with two shared-factory variants: full22 initializes every WDom field;
compact13 initializes common fields and leaves component/root metadata sparse.
Each variant has its own fresh baseline comparison. No samples are pooled across
the two experiments, historical Chrome versions, or diagnostic/timing lanes.

`collect.mjs` and `analyze.mjs` diagnose maps, IC transitions and deoptimizations.
`measure.mjs` invokes the unchanged production wrappers and archived official
runner for actual CPU and memory. Logging flags and probe instrumentation are
absent from these measurements. `retention.mjs` separately checks post-GC heap,
DOM nodes and listener counts through 100 create/clear and 100 update cycles.

The durable raw evidence, source snapshots, patches, exact commands, lock,
browser fingerprints, errors/retries and trace inventory are linked from the
results. The archive keeps all app-renderer V8 logs as nested gzip and eight
selection traces. Other normal timing traces and non-app V8 logs have SHA-256 and
size inventories. Failed attempts retain their original files.

Reproduction requires the frozen browser executable/framework, dependencies and
archived app/helper, not merely a matching browser version. Commands assume a
fresh experiment directory, source baseline and local paths matching its
manifest. After adoption, the original `guard` intentionally rejects the changed
default runtime; use an isolated baseline checkout to start another experiment.

```sh
node experiments/keyed-placement/init.mjs /tmp/lithent-layout-new
node experiments/keyed-placement/build.mjs /tmp/lithent-layout-new baseline
# Apply one preserved candidate patch to the isolated candidate/src tree.
node experiments/keyed-placement/build.mjs /tmp/lithent-layout-new candidate
LITHENT_SHAPE_SOURCE=/tmp/lithent-layout-new/candidate/src pnpm exec vitest run --config experiments/node-shape/vitest.config.ts
node experiments/node-shape/prepare.mjs /tmp/lithent-layout-new
node experiments/node-shape/prepare.mjs /tmp/lithent-layout-new candidate
node experiments/node-shape/prepare-layout.mjs /tmp/lithent-layout-new
node experiments/node-shape/collect.mjs /tmp/lithent-layout-new production
node experiments/node-shape/collect.mjs /tmp/lithent-layout-new probe
node experiments/node-shape/collect.mjs /tmp/lithent-layout-new layout-baseline
node experiments/node-shape/collect.mjs /tmp/lithent-layout-new layout-candidate
node experiments/node-shape/collect.mjs /tmp/lithent-layout-new probe-candidate
node experiments/node-shape/analyze.mjs /tmp/lithent-layout-new
node experiments/node-shape/analyze.mjs /tmp/lithent-layout-new layout-baseline
node experiments/node-shape/analyze.mjs /tmp/lithent-layout-new layout-candidate
node experiments/node-shape/prepare-measure.mjs /tmp/lithent-layout-new
# Install the frozen runner lock in official-benchmark/webdriver-ts.
node experiments/node-shape/measure.mjs /tmp/lithent-layout-new gate
node experiments/node-shape/measure.mjs /tmp/lithent-layout-new cpu-main
node experiments/node-shape/measure.mjs /tmp/lithent-layout-new cpu-reverse
node experiments/node-shape/measure.mjs /tmp/lithent-layout-new mem-main
node experiments/node-shape/measure.mjs /tmp/lithent-layout-new mem-reverse
node experiments/node-shape/retention.mjs /tmp/lithent-layout-new
node experiments/node-shape/evaluate.mjs /tmp/lithent-layout-new
python3 experiments/node-shape/audit.py
```

The original isolated builder still reports a nonzero exit for a candidate above
the historical 4,800B Brotli reference. Check that build and declaration emission
completed, preserve that failure, and record the user's later size policy before
continuing evaluation. Do not silently turn a failed reference gate into a pass.
`audit.py` audits the published archive, including both actual experiments; it is
not a single-experiment runner. Preserve/evaluate are sequential stages, and no
tests, builds or other benchmarks run during CPU, memory or retention collection.

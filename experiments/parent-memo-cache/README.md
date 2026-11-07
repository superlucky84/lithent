# C3 comparison with the existing cached app

This implements DESIGN DC-15 and the
[predeclared five-condition plan](../../docs/benchmark/PARENT_MEMO_CACHE_PLAN.md).
No renderer or helper implementation is changed. A/B use the exact original
monolithic cacheUpdate source with default/isolated cores. C/D/E use identical
row app JS with the startup mode off/helper/memo. E/A includes architecture;
E/D compares memo/helper within the same row structure. Both are reported.

```sh
node experiments/parent-memo-cache/init.mjs /tmp/c3-cache
pnpm exec node experiments/parent-memo-cache/prepare.mjs /tmp/c3-cache
node experiments/parent-memo-cache/verify.mjs /tmp/c3-cache
node experiments/parent-memo-cache/retention.mjs dispose /tmp/c3-cache
node experiments/parent-memo-cache/run.mjs gate /tmp/c3-cache
node docs/benchmark/official-memory.mjs ../js-framework-benchmark-upstream > /tmp/c3-cache/memory-preflight.json
node experiments/parent-memo-cache/run.mjs cpu-main /tmp/c3-cache
node experiments/parent-memo-cache/run.mjs cpu-reverse /tmp/c3-cache
node experiments/parent-memo-cache/run.mjs mem-main /tmp/c3-cache
node experiments/parent-memo-cache/run.mjs mem-reverse /tmp/c3-cache
node experiments/parent-memo-cache/retention.mjs churn /tmp/c3-cache
node experiments/parent-memo-cache/analyze.mjs /tmp/c3-cache
python3 experiments/parent-memo-cache/audit.py /tmp/c3-cache
node experiments/parent-memo-cache/report.mjs /tmp/c3-cache
node experiments/parent-memo-cache/preserve.mjs /tmp/c3-cache
```

Use a fresh output. `LITHENT_C3_ISOLATED_OUT` selects the prior verified
runtime/official-main.tsx staging; `LITHENT_BENCHMARK_ROOT` and
`LITHENT_CHROME_BINARY` select upstream/browser inputs. Restore the prior
archive if temporary inputs expired. Browser hashes are pinned in config.mjs.
Vite configuration loading writes a temporary module beside the sibling
config and can require permission; no sibling source is replaced. The recorded
output is `/tmp/lithent-c3-cache-20261022`.

Preparation builds A/B and the shared row bundle, plus separate diagnostic
bundles. All six exact staged sources are type-checked. The gate runs contracts
and the existing official keyed/nine-action/font verifier. Row diagnostics
use three fresh contexts/mode: updater entries and JSX views, mutable labels,
selection/partial/swap/batching/key identity, removal, lifecycle and disposal
with 1,000 retained keys. Original-app disposal uses another three contexts/core
and observes 1,000 row DOM objects plus the host through WeakRefs.

Run every official benchmark sequentially, without concurrent builds/tests.
CPU is all nine items, 25 selection/15 others per condition/round, 1,450 total;
memory is all five items, 3 per condition/round, 150 total. The memory preflight
restores the existing disabled metadata/registry entries process-locally only.
Commands, exact executable/env and logs are saved. Failed batches remain in
the upstream harness's failed-attempts directory; to resume complete prefixes,
set `LITHENT_PRODUCTION_RESUME=1` for the relevant run mode. Do not change input
builds/browser/harness between rounds or resumption.

Churn uses production, three contexts/condition, 300 create-clear cycles plus
100 partial updates, with two GCs at each heap/DOM/listener checkpoint. It keeps
the root mounted and is separate from full disposal and official memory.
No repeated heap snapshot instrumentation is included in these measurements.

The analyzer guards default28 files/package/sibling and all staged source/core/
bundle hashes. It validates sample counts, opposite orders, gates and per-item
distributions. Python recomputes medians/quartiles and weighted ratios from raw
samples. Existing same-hash core/dual/package evidence is reused, not rerun.

The [report](../../docs/benchmark/PARENT_MEMO_CACHE_RESULTS.md),
[raw results](../../docs/benchmark/parent-memo-cache-results.json) and
[gzip evidence](../../docs/benchmark/parent-memo-cache-evidence.json.gz) preserve
sources/builds, commands/logs, upstream runner/locks/fonts and nested prior
validation. All 1,450 normal CPU trace hashes/sizes and selection index0 content
per condition/round (10 traces) are preserved; other normal trace contents stay
temporary. All failed attempts, if any, are included in full. Each archive JSON
entry has SHA-256 and UTF-8/base64 content.

This is a bounded experiment. Full React/Preact comparison, public budget/API,
concurrent support, final hardening/integration and adoption remain separate.

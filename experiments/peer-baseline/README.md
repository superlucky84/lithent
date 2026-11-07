# Fixed peer baseline — DC-16

Measure the original Lithent/default cached app against all four pinned upstream
React/Preact hooks/classes implementations. The user CPU goal is **all nine pooled
total medians ≤1.10× the fastest of the four peers**, with both orders disclosed.
Memory has a separate cost assessment and no approved 1.10 threshold.

The canonical [requirements](../../docs/performance-improvement/REQUIREMENTS.md),
[design](../../docs/performance-improvement/DESIGN.md),
[implementation plan](../../docs/performance-improvement/IMPLEMENT.md) and
[manual checklist](../../docs/performance-improvement/MANUAL_TEST_CHECKLIST.md)
own the contracts. [Results](../../docs/benchmark/PEER_BASELINE_RESULTS.md),
[interactive table](../../docs/benchmark/PEER_BASELINE_TABLE.html) and
[raw evidence](../../docs/benchmark/peer-baseline-results.json) record this run.

Use a fresh output directory. The default here is the historical run directory;
choose another path to reproduce. Installed dependencies must match every upstream
source/lock/package version. `prepare.mjs` reuses verified local installs from
`LITHENT_PEER_INSTALLS` (default `/tmp/lithent-targeted-update-20261019/peers`),
builds into new staging directories and records npm dependency trees. It never
installs, upgrades or edits the sibling benchmark.

The original app input comes from `LITHENT_CACHE_OUT` (default historical DC-15
directory). If that temporary directory is gone, extract the `run/` entries of
`docs/benchmark/parent-memo-cache-evidence.json.gz` into a directory and point
`LITHENT_CACHE_OUT` there. Each archive entry stores `encoding`, `content` and
`sha256`; decode and verify it before use. The expected original source hash is
asserted by `prepare.mjs`. The sibling checkout, matching build dependencies and
pinned Chrome app are prerequisites; set `LITHENT_BENCHMARK_ROOT`,
`LITHENT_PEER_INSTALLS` and `LITHENT_CHROME_BINARY` as appropriate. Runtime library
contents and dependency locks/inventories are archived; build dependency code is
resolved from those locks rather than bundled wholesale in the evidence.

```sh
node experiments/peer-baseline/init.mjs /tmp/lithent-peer-new
pnpm exec node experiments/peer-baseline/prepare.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/freeze.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/run.mjs gate /tmp/lithent-peer-new
node experiments/peer-baseline/run.mjs cpu-main /tmp/lithent-peer-new
node experiments/peer-baseline/run.mjs cpu-reverse /tmp/lithent-peer-new
node experiments/peer-baseline/run.mjs mem-main /tmp/lithent-peer-new
node experiments/peer-baseline/run.mjs mem-reverse /tmp/lithent-peer-new
node experiments/peer-baseline/analyze.mjs /tmp/lithent-peer-new
python3 experiments/peer-baseline/audit.py /tmp/lithent-peer-new
pnpm exec node experiments/peer-baseline/source-map.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/profile.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/profile.mjs /tmp/lithent-peer-new trace
node experiments/peer-baseline/analyze-profile.mjs /tmp/lithent-peer-new
python3 experiments/peer-baseline/audit-profile.py /tmp/lithent-peer-new
```

Run official measurements serially, without builds/tests/profilers in parallel.
Both rounds use the same production bytes, driver and Chrome/engine. The second
round reverses the per-item alternating order. The unchanged official harness
collects 1,450 CPU and150 memory samples; failed batches retain attempted data.
Use `LITHENT_PRODUCTION_RESUME=1` only to resume a stopped run with the same frozen
inputs; never launch a duplicate live run. Five separate DOM contracts allow
different valid bulk-removal mutation strategies.

The independent Python audit recomputes distributions, upstream weighted scores,
five-app color normalization and the four-peer CPU goal. The continuous color
function is extracted from the frozen upstream `Common.ts`. The HTML table uses
that function and offers each metric/order; only CPU total carries the goal.

After **all** official runs, diagnostic profiles cover at most the two largest
failed goal ratios and their fastest peer. Each has three fresh contexts and ten
actions. CPU1x/sampling250µs/two animation frames are diagnostic conditions, not
official timing. Trace mode uses four separate fresh contexts, ten actions each,
without CPU Profiler. Profile mode never enables concurrent tracing. Trace setup is outside marked action windows. Inclusive trace
durations are nested and cannot be summed. Leaf sample time is not an exact CPU
accounting or a predicted speedup. Entire profiles with negative time deltas are
excluded from duration rankings, with raw data and counts retained; do not clamp,
reorder or silently overwrite a failed diagnostic. This run preserved a first
series with41 invalid profiles, then included119/120 profiles in the separate
series (one−1µs profile excluded). The cause remains unresolved. A separate hidden source map is used only if
its JS hash exactly matches the measured baseline bundle.

Review the raw profiles/source locations before writing `decision.json` in the
output directory (`complete`, `findings[]`, `next`, `limits[]`). State supported
findings, a bounded next candidate, and unresolved attribution. Then run:

```sh
node experiments/peer-baseline/preserve.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/report.mjs /tmp/lithent-peer-new
node experiments/peer-baseline/table.mjs /tmp/lithent-peer-new
```

Preservation writes the repository result artifacts. It keeps all raw samples,
commands/build logs/dependency inventories/source inputs, diagnostic profiles/traces/maps, normal
trace hashes and ten selection trace contents. All failed attempts are kept in
full. Other normal CPU trace contents remain temporary. Symlinked node_modules
are not recursively archived; the audited runtime libraries are included directly.
The prior DC-15 archive contains reused same-hash type/B3/core/dual evidence.
Every archive entry is decoded and hash-verified before the public result is
written. No new core candidate, package/export change or C3 adoption is implied.

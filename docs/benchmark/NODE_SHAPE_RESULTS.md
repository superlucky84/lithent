# DC-18: shared WDom factory

2026-10-24. The compact13 candidate is applied to the default base core. It routes
ordinary element, Fragment, array, empty, text and clone construction through one
factory with 13 common own fields, including the WDom symbol. Nine rare
component/root fields remain sparse. Matching, LIS, parent lookup, component
wrappers, event registration, helper caching and the benchmark app are unchanged.

The comparison found a useful implementation improvement; it does not establish
an inherent advantage of closures over hooks or completion of the fixed-peer
performance target.

## Decision and cost

The selected compact13 experiment has a weighted total-time ratio of
**0.941083 (−5.89%)** and JS-time ratio of **0.855768 (−14.42%)** against its
own fresh baseline. Main/reverse total ratios are **0.933772 / 0.948567**.
All nine pooled total-time medians decrease. These are descriptive results from
a nonisolated machine, without a significance or universal speed guarantee.

Official 10,000-row memory increases **27.4836→28.1637MB**, **+0.6801MB / +2.47%**.
UMD Brotli increases **4,798→4,824B**, +26B over the baseline and +24B over the
4,800B reference. Under the user's instruction to consider modest size excess
for measured rendering gains, the size guard keeps that reference and adds only
this **24B evaluated allowance**, leaving **0B extra headroom**. This does not set
a broad budget for future changes.

Full22, which initializes all fields, remains an unadopted alternative. Its
separate baseline comparison shows total **−4.87%**, JS **−12.19%**, but 10,000-row
memory **27.4849→31.5936MB (+14.95%, +4.1087MB)** and UMD Brotli **4,854B**.
The full and compact runs are separate trials, not a randomized direct comparison
between candidates; their raw timings are never pooled together. Compact retains
a clear improvement against its own baseline with much less measured memory and
size overhead, which supports selecting it.

## Controlled inputs and collection

Each experiment uses the exact archived original `main.tsx` and `cacheUpdate.ts`,
original HTML/CSS/fonts, a fresh same-configuration app build for each core, and
unchanged production wrappers and official workload definitions. Each has CPU
**580 retained samples** and official memory **60 samples**, across two opposite
framework orders with alternating order per action. CPU has 15 samples per
variant/order/action, except selection has 25; memory has 3. Standard runner
warmup, throttling, trace processing and font/keyed/action checks are preserved.
No tests, builds or other benchmarks ran during actual collection.

Chrome is a frozen copy of **156.0.8078.47**, V8 **15.6.75.19**, on Apple M4/24GB.
Both executable and framework SHA-256 are checked. The runner uses Node25.6.1 and
a frozen matching package lock; the original archive did not preserve that
separate runner lock. Its package manifest matches the archived package. The
sibling checkout is read only. Current load varies and is recorded per batch.
Historical Chrome155 results and flagged diagnostic runs are not pooled here.

Full22 collection had zero failed batches/warnings. Compact13 had **two failed
batches**, then successful automatic retries: reverse CPU partial update lost a
browser frame; main memory ready lost a browser target. Failed output/trace files
remain separate in the evidence. CPU warnings are zero. The errors and resulting
time gap are not silently removed from the provenance.

Both experiments pass DOM contracts and the official keyed/all-nine-action/font
gate. Python independently recomputes **384 distributions and 18 weighted
values** from the retained raw samples within 1e-12. The weighted statistic is the
geometric mean of action median ratios using archived official weights. Quartiles,
min/max, JS/paint components and both individual orders remain in the raw results.

## Selected CPU results

Milliseconds; negative changes mean less time. Pooled medians combine only the two
orders of this same compact experiment. Per-order columns show sensitivity to
measurement order; selection in particular has visible variation.

| Action                | Baseline | Compact | Pooled change | Main change | Reverse change |
| --------------------- | -------: | ------: | ------------: | ----------: | -------------: |
| Create 1,000          |   26.838 |  25.986 |        -3.17% |      -3.77% |         -2.81% |
| Replace 1,000         |   30.318 |  27.532 |        -9.19% |      -9.21% |         -9.39% |
| Update every 10th row |   16.799 |  15.094 |       -10.15% |     -13.63% |         -7.42% |
| Select row            |    7.811 |   5.832 |       -25.34% |     -28.50% |        -24.68% |
| Swap rows             |   16.525 |  15.495 |        -6.23% |      -9.28% |         -4.13% |
| Remove one            |   11.563 |  11.503 |        -0.52% |      -0.29% |         +1.51% |
| Create 10,000         |  272.801 | 264.384 |        -3.09% |      -2.45% |         -3.40% |
| Append 1,000          |   30.544 |  29.518 |        -3.36% |      -3.29% |         -2.44% |
| Clear 1,000           |   11.371 |  11.020 |        -3.09% |      -2.78% |         -3.97% |

Total time includes browser rendering. The JS gain is not the same as the total
rendering gain. The weighted paint ratio is 0.996298; this change primarily
benefits JS work in this workload.

## Selected official memory

MB as reported by the unchanged official `measureUserAgentSpecificMemory` path.
These six-sample pooled medians per variant are a small descriptive sample, not
a memory target of 1.10×. That threshold applies only to the fixed-peer CPU goal.

| Scenario            | Baseline MB | Compact MB | Difference MB | Change |
| ------------------- | ----------: | ---------: | ------------: | -----: |
| 21_ready-memory     |      0.6292 |     0.6307 |       +0.0015 | +0.24% |
| 22_run-memory       |      3.5080 |     3.5699 |       +0.0619 | +1.77% |
| 23_update5-memory   |      3.5885 |     3.6286 |       +0.0401 | +1.12% |
| 25_run-clear-memory |      0.9126 |     0.9067 |       -0.0059 | -0.65% |
| 26_run-10k-memory   |     27.4836 |    28.1637 |       +0.6801 | +2.47% |

Separate post-GC checks use six fresh contexts per experiment, 100 create/clear
cycles and 100 updates. Final DOM/listener counts equal initial counts in every
context. Post-GC JS heap checkpoints are preserved and can grow from warmup and
the app's expanding label text; stable DOM/listener counts do not prove absence
of all heap retention or leaks. No new retained ownership structure is added by
the factory.

## What the V8 diagnostics establish

These are separate, flagged runs and source probes, never speed scores. The
unmodified archived production JS is first diagnosed in three fresh contexts.
A separate fresh same-config baseline/full/compact build comparison attributes
IC events to source via code-creation/source-info/move/delete PC ownership and
verified app/core source maps. Deoptimization attribution is function-level;
textual log record counts do not measure time shares.

| Diagnostic                                                 | Baseline | Full22 | Compact13 |
| ---------------------------------------------------------- | -------: | -----: | --------: |
| Live map groups after partial update in source probe       |       13 |      1 |         3 |
| Dictionary objects in sampled live tree                    |        0 |      0 |         0 |
| App access sites ever reaching raw `N`, each of 3 contexts |       39 |      9 |         9 |
| App access sites ending in raw `N`, each context           |       36 |      9 |         9 |
| Raw wrong-map deopt records, aggregate 3 contexts          |       66 |     12 |        27 |

Source probes also cover ordinary nested components, Fragments, input and empty
output. All observed live nodes retain fast properties, including 100,034 nodes
at 10,000 rows. The original layouts are not dictionary-mode objects. Live map
group counts are not IC states, and `H` is not `N`. Raw state codes are retained;
the state legend was consulted in V8 main source because an exact engine-tagged
source was unavailable. IC logs record transitions, not all property accesses or
cost. Reduced raw `N`/wrong-map records and independent real CPU gains support
layout stabilization as useful here, without proving it is the entire Preact gap
or assigning an exact gain to each IC transition.

In the source probe, selection and partial updates add/remove **zero click
listeners** with the original cached app. Initial 1,000/10,000-row creation adds
2,000/20,000 listeners. A proxy may help regenerated handlers in other apps, but
repeated listener attachment is not established as this app's update bottleneck.

## Compatibility and integration

The source change preserves node values, child/clone getter evaluation order,
component identity, DOM identity, lifecycle, batching and recovery in the tested
contracts. It intentionally changes reflection of optional metadata: an unused
common field can now exist as an own property with value `undefined`. Consumers
that enumerate WDom metadata or depend on field absence can observe this. No
mandatory absence contract was found; this is recorded instead of claiming
identical `Object.keys` output. Props enumeration is unchanged.

Both isolated candidates passed **229 shared core regressions** and **17
ESM/CommonJS declaration pairs**. The selected default build's three JS bundle
hashes exactly match the measured compact core; app and helper are unchanged.
Both full-build phases, `pnpm run build:sequence` and `pnpm run build:parallel`,
plus `pnpm verify:concurrent`, strict core/concurrent/browser-fixture TypeScript
checks and changed-source ESLint pass. `pnpm test:dual` reports
**1,092 passed / 3 existing skipped**. All **64 browser integration tests pass**
with retries disabled, including SSR/hydration, HMR, helper/context, DOM identity,
examples and docs. Strict size passes with the explicit evaluated allowance.
The adoption manifest records the exact checks, 79 final file hashes and the
29-file pre-adoption guard. Concurrent source is unchanged; rebuilding refreshes
two initially stale concurrent JS artifacts as well as the selected base JS.
The independent archive audit verifies all decoded entry hashes, 4,380 raw IC
access-site summaries, 724 raw deoptimization records, both experiments' complete
statistics/retention checks and all 79 final file hashes. The evidence retains
18 target-renderer raw logs and inventories 1,160 normal CPU traces, with eight
selection traces and all failed-attempt files stored in full.

## Bundle sizes

Fixed comparison compressor: Node20.3.0/zlib1.2.13.1-motley, gzip level9; Brotli
default parameters. Raw bytes and runtime hashes are independent of compressor
version. `pnpm size` runs under Node24.11.1/zlib1.3.1-470d3a2 in this environment,
so its absolute gzip count can differ (selected UMD 5,187B); Brotli is 4,824B in
both. Compare only the same format and compressor. A reported Preact gzip size
cannot be compared directly with this repository's Brotli reference.

| Bundle | Baseline raw / gzip / br | Full22 raw / gzip / br | Compact13 raw / gzip / br |
| ------ | -----------------------: | ---------------------: | ------------------------: |
| ESM    |   19,110 / 6,454 / 5,896 | 19,025 / 6,371 / 5,832 |    18,868 / 6,341 / 5,802 |
| UMD    |   12,741 / 5,178 / 4,798 | 12,880 / 5,225 / 4,854 |    12,759 / 5,196 / 4,824 |
| CJS    |   12,592 / 5,210 / 4,828 | 12,727 / 5,258 / 4,897 |    12,606 / 5,225 / 4,857 |

## Evidence and remaining scope

- [Raw summaries and provenance](./node-shape-results.json)
- [Durable evidence](./node-shape-evidence.json.gz), including source/build
  snapshots, commands, raw samples, all target app V8 logs, selected normal traces,
  all failed attempts and SHA-256/size inventories for omitted normal trace/log content
- [Selected patch](./node-shape-candidate.patch) and [full22 alternative](./node-shape-full-candidate.patch), each replayed against baseline and verified over all 17 source files
- [Reproduction and independent audit](../../experiments/node-shape/README.md)
- [Initial five-cause source review](./PREACT_CAUSE_REVIEW.md)

Default29 files matched their initial snapshots through collection and immediately
before adoption. Initial generated build differences from historical evidence are
recorded separately. Deliberate adoption changes and final hashes are recorded in
the adoption manifest; do not reuse an unchanged-default claim after adoption.
The original sibling app is unchanged; its externally restored checkout is not
the historical modified benchmark app.

This experiment does not remeasure all four fixed peers or prove all nine
Lithent CPU items are within 1.10× the fastest peer. C2 placement-proof CPU/memory
remain unmeasured, and event proxies, wrapper removal, all-loop rewrites and full
Fragment-anchor redesign remain separate work. Their previous deferrals do not
become performance failures merely because they exceeded a historical size gate.

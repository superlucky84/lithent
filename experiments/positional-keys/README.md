# Positional keys — reproduction tools

Tools behind [POSITIONAL_KEYS_RESULTS.md](../../docs/benchmark/POSITIONAL_KEYS_RESULTS.md).
They time the js-framework-benchmark app ([`docs/benchmark/edge-fix/app.tsx`](../../docs/benchmark/edge-fix/app.tsx),
mode `flat` is the production app) in Playwright's Chromium. They measure
script time up to the next microtask, not paint, so they compare cores with
each other; they are not the official runner.

Bundles go to `$POSITIONAL_KEYS_OUT` (default `/tmp/lithent-positional-keys`).

```sh
# A core root per variant: this checkout, and another revision
mkdir -p /tmp/core-main && git archive 7796eb1 src helper/src | tar -x -C /tmp/core-main
node build.mjs main /tmp/core-main
node build.mjs head ../..

# Same DOM after every operation (both lines must match)
node verify.mjs main:flat head:flat

# Warm: both in one page, random order per round of 10 operations
node pair.mjs select 150 8 main:flat,head:flat     # also swap remove updr create replace add clear

# Close to the official runner: new page, 5 warm-ups, 4x CPU (create: 1x)
node cold.mjs select 20 main:flat,head:flat        # also swap remove update create

# Self time per function for one cold operation (bundle built with `debug`)
node build.mjs head-debug ../.. debug
node coldprof.mjs head-debug:flat create 12
```

`updr` is the partial update with the rows rebuilt every 8 operations, so the
labels do not keep growing.

## Official runner on macOS

The following freezes `main` and `HEAD`, builds the same production adapter
from the supplied benchmark checkout against both ESM cores, and copies that
checkout's compiled official runner and CSS into a fresh staging directory.
The helper source must be identical in both revisions. The benchmark checkout
and installed dependencies are kept in place; Vite may create a temporary
configuration module beside its config when preparing the builds.

```sh
node experiments/positional-keys/official-prepare.mjs \
  /private/tmp/lithent-positional-official-FRESH \
  /path/to/js-framework-benchmark-upstream
node experiments/positional-keys/official-run.mjs \
  /private/tmp/lithent-positional-official-FRESH suite
python3 experiments/positional-keys/official-analyze.py \
  /private/tmp/lithent-positional-official-FRESH
```

Preparation accepts optional baseline/candidate revision arguments after the
benchmark path. `suite` runs official keyed checks and nine DOM/font scenarios,
then CPU collection in both application orders, alternating the order between
items: 15 samples per item, 25 for select, 580 samples total. Chrome runs
headless with the official runner's throttling, warm-ups and forced GC.
Browser/local server operations require permission outside a restricted sandbox.
Do not run builds, tests, profiles or other benchmarks during collection.

Each phase refuses to replace an existing result, including incomplete runs.
`gate`, `main` and `reverse` can be invoked individually for a missing phase.
The runner, builds, tools and browser binary/engine hashes are checked before
and after each phase. Analysis independently recomputes all 580 official trace
durations, reports total/script/paint and diagnostic active/wait times, and
writes `official-results.json` with every sample and bootstrap intervals.
Intervals describe within-session sample uncertainty; they do not account for
systematic machine or session effects. Source and raw traces remain in staging.

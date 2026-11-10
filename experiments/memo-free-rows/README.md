# Rows without manual VDOM caching (DC-29)

Tools behind
[MEMO_FREE_ROWS_RESULTS.md](../../docs/benchmark/MEMO_FREE_ROWS_RESULTS.md):
how close a js-framework-benchmark app without upstream note #1261 (a row
component the library skips by comparing props) gets to the listed app, which
caches each row's virtual nodes on its data.

These run in Playwright's Chromium and time inside the page (script, plus a
forced layout). Paint is not included. They are **not the official runner**
and their numbers are not official results.

## Row variants (`apps/`)

All share `shared.tsx` (data, actions, page shell of the listed app).

| app          | row                                                        |
| ------------ | ---------------------------------------------------------- |
| `a-cache`    | listed app: no row component, `cacheUpdate` view on data   |
| `n-plain`    | no cache, no component                                     |
| `r-row`      | row component, no cache                                    |
| `c-rowcache` | row component with `cacheUpdate` inside its updater        |
| `m-memo`     | row component wrapped in `memo` (needs a core with `memo`) |

`upstream/main.tsx` is the `m-memo` row in the listed app's own single-file
form, ready to stand in for `frameworks/keyed/lithent/src/main.tsx` in an
official-runner comparison (it needs a lithent build that exports `memo`).

## Use

```sh
OUT=/tmp/lithent-memo-free-rows

# A core per variant: built dist files, copied so later builds do not replace them
pnpm build:core && pnpm build:helper
mkdir -p $OUT/cores/head && cp dist/lithent.mjs helper/dist/lithentHelper.mjs $OUT/cores/head/
node experiments/memo-free-rows/build.mjs $OUT head $OUT/cores/head/lithent.mjs $OUT/cores/head/lithentHelper.mjs
# (repeat with another checkout's dist under another label, e.g. `base`)

# Official scenarios: new page per sample, warm-ups, forced GC, CPU throttling
node experiments/memo-free-rows/measure.mjs $OUT --apps base-a-cache,head-a-cache,head-m-memo \
  --samples 12 --mem --css <js-framework-benchmark>/css/currentStyle.css --json $OUT/run.json

# Steady state: one scenario repeated in a page (warm JIT, no throttling)
node experiments/memo-free-rows/loop.mjs $OUT base-a-cache,head-m-memo create,clear,select 40 3

# Self time by function, from source for readable names
LITHENT_READABLE=1 node experiments/memo-free-rows/build.mjs $OUT src src/index.ts helper/src/index.ts a-cache,m-memo
node experiments/memo-free-rows/profile.mjs $OUT src-m-memo create 60 40
```

`measure.mjs` checks the DOM after every step (row count, ids, labels,
selection class) and fails on a mismatch. `--css` is optional: without the
benchmark's stylesheet the page is unstyled and layout times differ. The
weights of the weighted geometric mean are the official result table's, as
recorded in `docs/benchmark/dc25-keyed-fast-path-final-results.json`.

Run nothing else on the machine while measuring. Samples alternate the app
order every round.

## Official runner on macOS

Since 2026-11-10 the working tree's core has no `memo` (user decision, see
`docs/performance-improvement/DESIGN.md` DC-29-13): the `m` app only builds
against a revision that has it (`ae54a3e`), and `build.mjs`'s `m-memo` app does
not build against the current `dist`.

`official-prepare.mjs` freezes any number of app/core pairs: app `a` is the
benchmark checkout's listed `main.tsx`, `m` is `upstream/main.tsx`; each core
is built from a git revision with the package build's ESM settings (`WORKTREE`
is the tracked files as they are now, taken with `git stash create`, which
changes no branch, index or file; its patch against HEAD is kept in the
staging directory). The first pair is the baseline. The benchmark checkout's
compiled official runner and CSS are copied into the staging directory; the
checkout itself is not changed.

```sh
OUT=/path/to/fresh-staging
node experiments/memo-free-rows/official-prepare.mjs $OUT /path/to/js-framework-benchmark-upstream \
  a-main=a:main m-head=m:HEAD m-j4b=m:WORKTREE a-j4b=a:WORKTREE
node experiments/memo-free-rows/official-run.mjs $OUT gate
node experiments/memo-free-rows/official-run.mjs $OUT cpu-1 cpu-2 cpu-3 cpu-4 mem-1 mem-2
python3 experiments/memo-free-rows/official-analyze.py $OUT m-j4b:m-head a-j4b:a-main
```

`gate` runs the official keyed check and nine DOM/font scenarios
(`docs/benchmark/production-run.mjs verify`). Each `cpu-N` round takes 15
samples per item and app (25 for select) with the runner's own throttling,
warm-ups and forced GC; each `mem-N` round takes 3 samples of the five memory
items. Odd rounds run the apps in the prepared order, even rounds reversed,
and the order also alternates between items. A phase refuses to replace an
existing result. Tools, runner, bundles and the browser binary are hashed
before and after each phase, so do not edit the tools, build, test or run
other benchmarks during a collection.

`official-analyze.py` recomputes every official trace duration, adds
main-thread active/wait time, and writes `official-results.json` (all
samples, medians, bootstrap intervals within rounds) into the staging
directory. Every app is compared with the first; extra `candidate:baseline`
pairs can be named. It needs an even number of CPU and of memory rounds.

`official-weighted-ci.py OUT candidate:baseline [...] [--limit 0.03]` reads
that file and bootstraps the weighted change of a pair (resampling within
rounds), printing the 95% interval and the share of resamples at or below
the limit.

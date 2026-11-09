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

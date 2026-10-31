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

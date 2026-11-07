# DC-28 — bulk removal of component/Fragment roots (v2)

Re-port of the 2026-10-19 [bulk removal](../../docs/benchmark/BULK_REMOVAL_RESULTS.md)
candidate onto the current core. That candidate was rejected for a select
slowdown that the [select vsync analysis](../../docs/benchmark/SELECT_VSYNC_PHASE.md)
attributes to BeginFrame wait, not to the changed code (select never reaches
the removal path). Result: [보고서](../../docs/benchmark/BULK_REMOVAL_V2_RESULTS.md).

`findChildWithRemoveElement` (base and concurrent `render.ts`) clears the
parent with one `textContent = ''` when the removed roots — walked through
Fragment/component wrappers — are exactly the parent's children in order.
It stops at the first mismatch, so removing part of a long list never walks
the remaining siblings. Portals and `<html>` fall back to the per-node path.
Unmount callbacks still run before DOM removal (`inheritPropForRender` 'D').
Shared tests: `src/tests/core-bulkRemoval.test.tsx` (base and concurrent).

Compared apps, all built with Vite 5.4.8 against a source core:

| name             | app                                        | core         |
| ---------------- | ------------------------------------------ | ------------ |
| `baseline`       | official A app (plain rows, `cacheUpdate`) | HEAD         |
| `candidate`      | same                                       | working tree |
| `rows-baseline`  | app C: one `mount` row component + cache   | HEAD         |
| `rows-candidate` | same                                       | working tree |

A is the official app (its plain-element rows already took the old fast
path); C is the ordinary row-component app from the
[component cost](../../docs/benchmark/COMPONENT_COST_RESULTS.md) evidence.

```sh
node experiments/bulk-removal-v2/prepare.mjs /private/tmp/lithent-bulk-removal-v2-FRESH
node experiments/bulk-removal-v2/browser-check.mjs /private/tmp/lithent-bulk-removal-v2-FRESH
node experiments/bulk-removal-v2/measure.mjs /private/tmp/lithent-bulk-removal-v2-FRESH gate
node experiments/bulk-removal-v2/measure.mjs /private/tmp/lithent-bulk-removal-v2-FRESH collection
node experiments/bulk-removal-v2/clear-ab.mjs /private/tmp/lithent-bulk-removal-v2-FRESH 40
python3 experiments/bulk-removal-v2/analyze.py /private/tmp/lithent-bulk-removal-v2-FRESH
python3 experiments/bulk-removal-v2/preserve.py /private/tmp/lithent-bulk-removal-v2-FRESH
```

- `browser-check` counts the `#tbody` removal records of Clear in real Chrome.
- `clear-ab` is a diagnostic run after the collection, not a score: Clear
  only, CPU 8x, one Chrome, shuffled app order per round, a fresh page per
  app and round (2 warm-up, median of 3). Page-reuse runs disagreed with each
  other (`clear-ab-60/150.json` in the run) and are not reported.
- `analyze` writes the staging `results.json` (all samples, with active/wait)
  and `docs/benchmark/bulk-removal-v2-results.json` (summary, bootstrap
  intervals, runs, browser check, clear-ab). Both refuse to overwrite.
- `preserve` checks the source/test/tool hashes recorded by `prepare` and
  writes the evidence archive and manifest; it refuses to overwrite.

`prepare` needs the DC-25 runner staging (`/private/tmp/lithent-dc25-20261027`)
and the C4 P2 app staging (`/private/tmp/lithent-c4-owner-20261029-v2`) for the
frozen runner, A app source and `cacheUpdate`; restore them from their
evidence archives if they have expired. Run it with the candidate
`render.ts` in the working tree. `measure` guards the source, tools, browser
and bundles; do not build, test or run other benchmarks during collection.
The actual run is `/private/tmp/lithent-bulk-removal-v2-20261030`.

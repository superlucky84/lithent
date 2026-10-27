# DC-22 comprehensive integration

Canonical requirements, decisions, phases and checks live in
[docs/performance-improvement](../../docs/performance-improvement/REQUIREMENTS.md#7-별도-브랜치를-포함한-종합-반영--dc-22).
Read [the result report](../../docs/benchmark/COMPREHENSIVE_RESULTS.md) first.
The existing run is `/private/tmp/lithent-final-20261025`; never rerun completed
batches or overwrite their outputs.

## Inputs and reproduction

Start from compact13 at `fb481f3aa6d315c3d55fb1b2cb97d86f4e53c2e4`, with these
tools/tests available and frozen lockfile dependencies installed. After adoption
the current runtime is E; calling it the baseline would be incorrect. Use a
separate checkout/output to reproduce. `init.mjs` freezes runtime, existing
outputs, sibling inputs and fixed Chrome156.0.8078.47 binary/engine. It extracts
active slot/flat commits, not the restored preserved branch tip. Browser and
runner dependency paths are explicit in the tools; provision the same versions
and record new hashes if those inputs change.

```sh
node experiments/comprehensive/init.mjs /tmp/lithent-final-new
node experiments/comprehensive/build.mjs /tmp/lithent-final-new baseline
```

Variants: B `baseline`, E `event`, K `c2`, EK `combined`, plus preserved `slot`
and `flat-original`. Copy `event.ts` to E's `src/utils/event.ts` before building.
`prepare-c2.mjs` rebases the preserved C2 patch and combines the E overlay;
`stage-concurrent.mjs` ports the shared event utility. Build each condition once
with `build.mjs`, then `check.mjs OUT VARIANT core` and `types`; use
`concurrent-core` for E. Proof lifetime tests apply to K/EK only.

Builds/analyses record hashes and refuse overwriting results. Preparation
failures are preserved separately from benchmark failures. The corrected
frozen-source runner resolves all concurrent relative imports to the same fork.

## Protocols and guarded execution

Run builds/tests before timing. Never run builds, tests, profiling, another
benchmark or a duplicate suite during CPU collection. The sibling upstream is
read-only. Browser/local-server execution may need environment permission.

1. `prepare-apps.mjs OUT` freezes the original cached app/helper, runner/assets,
   dependencies and four pinned peer production bundles. Peer binaries are
   preserved bytes; scores are fresh. `measure.mjs OUT gate main all` separates
   Lithent batching contracts from common peer DOM contracts, then runs official
   keyed/nine-action/font verification.
2. `observe-dispatch.mjs OUT baseline slot flat-original event` reproduces the
   trusted alias loss and verifies repair. Broken flat is a negative control.
   Synthetic tests alone cannot detect the microtask checkpoint defect.
3. `measure.mjs OUT suite main core` serially collects four-core CPU and memory,
   main/reverse: 1,160 CPU/120 memory samples. Run `analyze.mjs OUT core`, then
   `python3 experiments/comprehensive/audit.py OUT core`.
4. `count.mjs OUT` produces structural counters only. `event-run.mjs OUT` uses
   four conditions/workloads, two orders, four rotations: 128 fresh timing pages
   and 48 separate GC contexts. Run `event-analyze.mjs OUT` and
   `python3 experiments/comprehensive/event-audit.py OUT`. Nested batches are
   not independent fresh pages.
5. `retention.mjs OUT` checks 12 contexts with 100 create/clear and 100 partial
   updates. `dispose-build.mjs OUT`/`dispose.mjs OUT` are separate diagnostics:
   record populated disposal, then release the original app's global store/cache/
   renew references and check DOM weak references. The first failed diagnostic
   remains in `preserved-disposal-v1`.
6. `ui-build.mjs OUT` builds the same uncached directory UI for B/E/K/EK.
   `ui-measure.mjs OUT` uses the frozen official click-to-final-paint calculation
   for partial/select only, 320 samples. Run `ui-analyze.mjs OUT` and
   `python3 experiments/comprehensive/ui-audit.py OUT`. These are not original-app
   or nine-item peer scores.
7. Freeze selection before the final run. Actual choice: E. `measure.mjs OUT
suite main final-event` freshly collects all nine CPU and five memory items
   for B/E plus four peers: 1,740/180 samples, two orders. Run `analyze.mjs OUT
final-event` and `python3 experiments/comprehensive/audit.py OUT final-event`,
   then `table.mjs OUT` and `python3 experiments/comprehensive/color-audit.py OUT`.
   Goal: fastest four-peer total median. Colors: minimum of all six displayed apps.

All MJS commands above use `node experiments/comprehensive/NAME.mjs`.
`extras.mjs` was a one-shot sequence; it stopped at the first disposal diagnostic
and must not be restarted against completed outputs. Corrected disposal and UI
steps ran individually. Command logs and task-state record actual execution.

## Resume, hardening and adoption

Read `task-state.json`, command exit records and completion flags before resuming.
`measure.mjs` refuses a completed destination. For genuinely interrupted batches,
the frozen wrapper's explicit `LITHENT_PRODUCTION_RESUME=1` skips complete groups
and retains failed attempts/traces; inspect its source and logged environment
first. Do not remove raw files to rerun successful groups.

`adopt.mjs OUT apply` requires completed audits/retention and writes a before
manifest before copying four exact source files. Set the size guard to the
measured 182B DC-22 allowance with no extra headroom. Run `integrate.mjs OUT build`,
`checks`, `tests`; the latter covers normal monorepo tests, base SSR and concurrent
satellites without unnecessarily repeating cores. Run full Playwright against
built packages. `adopt.mjs OUT verify` requires actual ESM/UMD/CJS to match measured
E and checks both source trees plus unchanged sibling inputs.
`package-dispatch.mjs OUT` then checks six production formats, Node package
exports, preserved native controls and the interactive table.

Persistent unit regressions cover aliases, frozen handlers/Event reuse, receivers,
retained DOM and portal owners. `e2e/events.spec.ts` covers trusted alias/nested/
replace/ancestor, exception continuation and direct native cleanup on both cores.
Existing scheduler/commit/abandon and application integration remain gates.
A source-level or synthetic pass never replaces the trusted-browser regression.

`report.mjs OUT` derives tables/sidecars from audited results. Finalize validation
status and canonical docs, then `python3 experiments/comprehensive/preserve.py OUT`
streams inputs/logs/results and every trace into bounded deterministic archives.
Run `python3 experiments/comprehensive/archive-audit.py docs/benchmark` to verify
every archive/member hash. Do not edit archived files and silently replace a pack.
No command commits, publishes, changes versions or modifies upstream apps.

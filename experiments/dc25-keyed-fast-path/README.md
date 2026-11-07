# DC-25 same-order keyed fast path

The [canonical plan](../../docs/performance-improvement/IMPLEMENT.md#dc-25--실행-계획)
owns the scope and gates. Read the [result/status report](../../docs/benchmark/DC25_KEYED_FAST_PATH_RESULTS.md)
before resuming. The active run is `/private/tmp/lithent-dc25-20261027`.
Never repeat completed batches, replace frozen builds, or overwrite old archives.

The source baseline is main `14d47e83770958eb78a91c564bf39e47c4a25dba` (after
1.25.3), Node 24.22.1 and pnpm 12.15.0. `initial.json` guards the default runtime,
lock/config and sibling inputs. `active-browser.json` supersedes the initial
unlaunchable historical Chrome155 with the complete Chrome156.0.8078.48/V8
15.6.75.19 installation and its binary/engine hashes.

## Preparation

Use a fresh output directory and matching installed root dependencies. All
commands are `node experiments/dc25-keyed-fast-path/NAME.mjs` unless specified.

1. Set `LITHENT_CHROME_BINARY` to a complete installed app (for this run,
   `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) when invoking
   `common.mjs OUT`, which snapshots baseline/candidate sources. The default
   historical `/tmp` browser is not a portable installation. `run.mjs OUT LABEL
COMMAND ...ARGS` records command metadata, full logs and status without changing
   the caller environment. Build root packages and run baseline `test:dual`, types,
   size and new contracts before prototyping.
2. `browser.mjs OUT` verifies the installed complete browser and freezes its
   version/engine. Browser/local server operations may require environment permission.
3. `build.mjs OUT baseline`, then `apps.mjs OUT baseline` freeze the isolated
   build and original cached app. `apps.mjs` extracts hash-verified benchmark
   assets/runner/source from the preserved DC-16 archive; installed runner dependencies
   are version-checked against its lock. It leaves the sibling checkout untouched.
4. `candidate.mjs OUT` applies the documented combined candidate only to its source
   copy. Build it once with `build.mjs OUT candidate`; run frozen-source tests with
   `LITHENT_FINAL_SOURCE=OUT/candidate pnpm exec vitest run --config
experiments/dc25-keyed-fast-path/vitest.config.mjs`. The config adds candidate-only
   proof lifetime tests. The comprehensive config without the extra lifetime suite
   also supports `LITHENT_CORE=concurrent` against frozen concurrent modules.
5. `negative-control.mjs OUT` verifies that naive identity early return fails the
   getter contract; it is not the production candidate. `count.mjs OUT VERSION`
   checks 11 original-app actions with independent instrumented JSDOM builds. Counter
   outputs are not timing, paint or official memory samples.
6. `apps.mjs OUT candidate` freezes the candidate original-app bundle.
   `LITHENT_INSTALL_PEERS=1 node experiments/dc25-keyed-fast-path/peers.mjs OUT VERSION`
   installs the four archived locks into fresh staging and rebuilds their pinned
   sources on current Node. Network access is required for fresh installs; omit the
   environment variable only when the historical local cache is complete and verifies.
7. `inputs.mjs OUT` freezes all six app manifests and original wrappers.
   `measure.mjs OUT gate main baseline,candidate,react-hooks,react-classes,preact-hooks,preact-classes`
   runs Lithent-specific batching/identity contracts followed by official keyed,
   nine-action and font checks. `reuse.mjs OUT contracts VERSION` runs common DOM
   identity contracts on all six apps. Failed preparation attempts remain preserved.

On macOS, tsconfig baseUrl stays relative so `/tmp` and `/private/tmp` do not
become separate TypeScript roots. Never disable type/declaration checks to hide
path errors. Browser packages require their complete app resources, not just a
saved executable and engine binary.

## Collection and audit

Run `suite.mjs OUT` only after all gates. It writes `measurement-plan.json` before
timing, freezes the driver/tool hashes, then serially runs CPU main/reverse and
memory main/reverse. The six-app 1,740 CPU/180 memory samples contain the declared
baseline/candidate 580/60 subset; these are not two separate collections. The
second order reverses the alternating per-item app order. Never run builds,
tests, profiles or another benchmark during collection.

`measure.mjs OUT cpu|mem main|reverse CSV` is the individual phase driver.
The explicit `LITHENT_PRODUCTION_RESUME=1` mechanism requires the same frozen
inputs and skips complete phases; inspect logs, raw output and live processes
before using it. Preserve failed groups/traces and do not launch duplicate runs.

After collection, `reuse.mjs OUT analyze VERSION` and `reuse.mjs OUT audit VERSION`
adapt the established JS statistics and independent Python audit to the new
names/output paths and selected browser metadata. The exact generated source,
original/generated hashes, command and log are archived under `OUT/reused`.
Protocols and historical source files are never edited. `reuse.mjs OUT retention
VERSION` separately checks two conditions × three fresh contexts with GC after
100 create/clear cycles and 100 partial updates. This is JS heap/DOM/listener
retention, distinct from official UASM memory and not proof against every leak.

The default runtime and size guards stay unchanged until actual results justify
adoption and any allowance is decided. A 5,087B candidate is a 263B guard excess,
not a passing size check. Candidate-only metadata must pass lifetime/clone/reentry
regressions and the final adopted hashes must match the measured production code.

## Result and final checks

This first candidate was **not adopted**: pooled weighted total −0.171%, with
main +0.402% and reverse −1.260%; baseline and candidate both passed 8/9 CPU
goals. Size increased 268B and the overall benefit remained uncertain. The
default runtime and 4,824B guard were preserved.

`package-checks.mjs OUT` runs the five satellite suites against the actual
candidate ESM. `browser-checks.mjs OUT` generates an ESM/UMD overlay for the
existing Playwright apps without editing their original server/config; the
unchanged concurrent artifact is still exercised. `formats.mjs OUT` checks all
nine baseline/candidate/concurrent package formats. `dispose-checks.mjs OUT`
performs two actual partial updates before populated root disposal, then
separately releases app globals and checks DOM weak references in six contexts.
These diagnostics never replace official timing or memory samples.
`default-browser.mjs OUT` also runs all 78 browser checks on the final unchanged
default base/concurrent with their original server. Run it before the final report.

`table.mjs OUT` generates the new interactive result table and independently
audits its color factors. `table-check.mjs OUT` checks all 12 controls/modes,
576 numeric/color cells and 81 goal cells with JSDOM. `report.mjs OUT` verifies
source/artifact preservation and derives the Markdown report/validation sidecar.
It can refresh the Markdown after archive auditing without changing frozen raw
validation data.

`python3 experiments/dc25-keyed-fast-path/preserve.py OUT` streams 64MiB-bounded
deterministic gzip/tar parts and a per-member manifest. Python 3.11+ is required
for the separate `audit-archive.py` decoded-member/hash audit. Existing canonical
archives are never overwritten; a later independent experiment needs distinct
archive names. node_modules/cache directories are excluded while locks,
inventories, sources, generated adapters, raw samples/traces and failed
preparation attempts are preserved. Final Markdown is kept separate from frozen
execution inputs. Regenerate the exact measured patch from baseline/candidate
source copies and verify it with `git apply --check` before any future use.
The final default-browser closeout uses `python3
experiments/dc25-keyed-fast-path/closeout.py OUT`: a separate small archive and
decoded audit, preserving the original thirteen measured-evidence archives.

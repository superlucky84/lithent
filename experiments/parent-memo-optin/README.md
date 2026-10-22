# C3 memo on/off in the same row app

This is the DESIGN DC-13 experiment. Both conditions use the same isolated
renderer, row app source and production JS bytes. Only a startup flag in HTML
changes: `lithent-before` is memo off; `lithent` is memo on. Off does not mean the
default original app. Previous CPU samples cannot be pooled with this run.

Every action renews the parent Table. Each RowView receives incoming row and
selected props. The on condition registers dependencies on row identity, id,
label and selected. There is no row-specific renew, VDOM cache or helper cache.
Both conditions still visit the complete parent list. Creating and destroying
rows includes the cost of allocating and cleaning memo state.

`prepare.mjs <fresh-output>` verifies the previous isolation provenance and
copies its exact runtime. It builds production once and copies those bytes
into both conditions and both timing rounds, adding the HTML flag. It builds
a separate diagnostic bundle with lifecycle/updater/retention instrumentation.
Production must contain none of that diagnostic interface. No default runtime,
package exports, budgets or sibling app source are changed.

The recorded output is `/tmp/lithent-c3-optin-20261022`. `init.mjs` records the
checkout state and sibling source hash before preparation. Set
`LITHENT_C3_ISOLATED_OUT` to the verified isolation staging tree, or restore its
runtime/build manifest from the prior archive. The builder uses the sibling's
official Vite configuration and may need permission for its temporary config
file. Preparation also type-checks and records the runner source before timing:

```sh
node experiments/parent-memo-optin/init.mjs /tmp/c3-optin
pnpm exec node experiments/parent-memo-optin/prepare.mjs /tmp/c3-optin
node experiments/parent-memo-optin/verify.mjs /tmp/c3-optin
node experiments/parent-memo-optin/run.mjs gate /tmp/c3-optin
```

The diagnostic verifier checks three fresh contexts per condition: exact
updater counts, keyed DOM identity, mutable labels, selection, both batched
orders, removal, lifecycle and full disposal/GC with 1,000 retained keys.
The gate runs existing production contracts, official isKeyed, nine actions
and glyph font. Same-hash core regression/dual/package evidence is reused from
the previous isolation archive rather than rerunning unchanged tests.

Run the following sequentially, with a pinned `LITHENT_CHROME_BINARY` and no
concurrent build/test/benchmark. `LITHENT_BENCHMARK_ROOT` selects the upstream
checkout. Every launch records the actual Node executable, args and relevant
environment in `commands/`; raw runner data and logs remain in the output.

```sh
node experiments/parent-memo-optin/run.mjs cpu-main /tmp/c3-optin
node experiments/parent-memo-optin/run.mjs cpu-reverse /tmp/c3-optin
node experiments/parent-memo-optin/run.mjs mem-main /tmp/c3-optin
node experiments/parent-memo-optin/run.mjs mem-reverse /tmp/c3-optin
node experiments/parent-memo-optin/run.mjs retention /tmp/c3-optin
node experiments/parent-memo-optin/analyze.mjs /tmp/c3-optin
node experiments/parent-memo-optin/preserve.mjs /tmp/c3-optin
```

CPU comprises all nine official items and 580 samples in opposite orders.
Memory comprises all five official items, 3 samples/app/item/round, 60 total.
The local upstream revision disables 23/26 in both metadata and the runner
registry. `official-memory.mjs` restores their existing metadata and exported
scenario instances in memory only, then verifies all five unique dispatches.
It changes no scenario, GC or measurement method and writes no sibling file.
The recorded first memory attempt failed at missing 23 registration; the
registry-only repair also found disabled metadata. Both logs are preserved.
`run.mjs mem-resume-main <output>` retains the 12 completed 21/22 samples and
resumes with the complete registry. CPU ran before this memory-only addition;
the analyzer verifies the rest of its harness is byte-identical.
Retention uses the existing production harness: three contexts per condition,
100 create/clear cycles and 100 partial updates with GC/DOM/listener/heap
checkpoints. It keeps the root mounted and is separate from full diagnostic
disposal and from official memory. No claim of statistical significance or
final peer goal follows from these bounded comparisons.

The durable [report](../../docs/benchmark/PARENT_MEMO_OPTIN_RESULTS.md),
[raw results](../../docs/benchmark/parent-memo-optin-results.json) and
[gzip evidence](../../docs/benchmark/parent-memo-optin-evidence.json.gz) preserve
all samples, source, builds, runner/lock/command provenance and logs. Normal
trace contents are limited to selection trace index 0 per app/CPU round;
hash/size inventory covers all normal traces. Failed attempts are retained in
full. The reused isolation evidence is nested in the archive. Each JSON file
entry records SHA-256, encoding (`utf8` or `base64`) and content.

The renderer remains experimental. Its size, public entrypoint/budget,
concurrent support, complete peer comparison and final hardening/integration
are separate decisions and gates.

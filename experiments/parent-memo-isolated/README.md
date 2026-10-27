# Isolated C3 renderer experiment

This experiment rebuilds the previously tested C3 source in a temporary tree.
It preserves the default runtime and package exports. The candidate owns its
own component registry, Fragment and update queue. Apps, JSX runtime and helpers
must resolve the core to the same renderer; mixing renderer instances is
unsupported and a default setup calling the isolated hook throws.

The local skill's canonical requirements and decisions remain in
[the performance document set](../../docs/performance-improvement/REQUIREMENTS.md),
especially DESIGN DC-12. No public subpath, release or optional size budget is
introduced here. This is a standalone renderer, so its 5,691 B brotli cost is
the full renderer size. The default UMD remains 4,798 B. Isolating the default
package does not remove overhead within the optional renderer.

Use a fresh absolute output directory. `build.mjs` verifies the committed C3
archive, extracts its 17 runtime source files, builds all three formats plus
ESM/CommonJS declarations, and requires byte-identical runtime bundles. It also
copies and verifies the 28 default runtime files. macOS `/tmp` realpaths are
normalized so the declaration emitter sees the same source identities.

```sh
pnpm exec node experiments/parent-memo-isolated/build.mjs /tmp/c3-isolated
pnpm exec node experiments/parent-memo-isolated/check-package.mjs /tmp/c3-isolated
LITHENT_C3_SOURCE=/tmp/c3-isolated/runtime/src pnpm exec vitest run --config experiments/parent-memo-isolated/vitest.config.ts
pnpm test:dual
pnpm size
```

`check-package.mjs` checks actual ESM/CommonJS rendering, distinct registries,
mixed setup rejection and package self-reference/type resolution. The existing
input editor verifier accepts an explicit candidate package as its second
positional argument. Copy the preserved baseline ESM into its fresh output
directory first:

```sh
mkdir -p /tmp/c3-isolated/contracts/baseline/dist
cp /tmp/c3-isolated/baseline/dist/lithent.mjs /tmp/c3-isolated/contracts/baseline/dist/lithent.mjs
LITHENT_CHROME_BINARY=/path/to/pinned/chrome pnpm exec node experiments/parent-memo/verify.mjs /tmp/c3-isolated/contracts /tmp/c3-isolated/runtime
```

The editor performs real consumer type checks and nine browser contexts. The
concurrent named import must still fail. It verifies behavior and retention,
not official timing. `verify.mjs` keeps its existing one-argument behavior.

For the official comparison, extract the original app from the committed C3
archive (`official-main.tsx` in the recorded run), then prepare the same app and
helper with only `LITHENT_CANDIDATE_CORE` changed to the staged ESM. Use
`targeted-update.mjs prepare`, `contracts` and `verify`. The archived commands
in `commands.json` document the exact source and environment overrides.
Copy those immutable builds to a second output tree; do not rebuild between
rounds. Run all CPU items sequentially with
`LITHENT_PRODUCTION_ALTERNATE_ORDER=1`, first `lithent-before,lithent`, then
`lithent,lithent-before`, using a fixed `LITHENT_CHROME_BINARY`. Do not run
builds, tests or another benchmark during timing.

After both rounds finish, run `analyze.mjs <output>` and `preserve.mjs <output>`.
The analysis audits all 580 samples, bundle/browser identity, reversed order,
default file hashes and contract results. It reports per-round and pooled
median/IQR plus official weighted geometric ratios. This comparison measures
the optional renderer's cost in an app that never calls `useParentMemo`; it
cannot establish a memo-enabled performance benefit or the final peer goal.

The durable report is
[PARENT_MEMO_ISOLATION_RESULTS](../../docs/benchmark/PARENT_MEMO_ISOLATION_RESULTS.md).
The gzip evidence uses JSON `files` entries containing SHA-256, encoding and
content. Raw CPU samples, normal-trace inventory, a deterministic trace subset,
any failed attempts, builds, declarations, source and runner provenance are
preserved. See the report for the trace retention boundary and outstanding work.

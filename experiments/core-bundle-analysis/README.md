2026-11 base core bundle analysis. See the [Korean report](../../docs/benchmark/CORE_BUNDLE_ANALYSIS_2026_11.md).

`analyze.mjs` copies the current source, builds library/consumer variants, and measures raw/gzip9/default Brotli. Product source, dist, root dependencies, and the workspace lockfile are untouched. Type checking and declaration generation are excluded from this JavaScript comparison. Vite 8 uses native Rolldown options and omits the unsupported `tryCatchDeoptimization` flag.

Prepare an isolated toolchain outside the repository; the included npm lockfile pins its transitive dependencies. The project itself must already have its normal development dependencies installed. These commands are run from the repository root. `npm --prefix` points to the isolated package, avoiding the root package's Node devEngine check before the pinned Node is installed.

```sh
mkdir -p /tmp/lithent-core-analysis/toolchain
cp experiments/core-bundle-analysis/toolchain/package*.json /tmp/lithent-core-analysis/toolchain/
npm --prefix /tmp/lithent-core-analysis/toolchain ci --no-audit --no-fund
/tmp/lithent-core-analysis/toolchain/node_modules/node/bin/node \
  experiments/core-bundle-analysis/analyze.mjs /tmp/lithent-core-analysis/toolchain
/tmp/lithent-core-analysis/toolchain/node_modules/node/bin/node \
  experiments/core-bundle-analysis/verify.mjs
```

Verification requires a local Chromium, default `/usr/bin/chromium`; override with `LITHENT_CHROME`. It reuses the existing jsdom differential fixture and nine browser compatibility cases, checks exports, and exercises three final counter bundles. It does not run release, HMR, heap, or timing gates.

Defaults write to `/tmp/lithent-core-analysis/results`. An optional second argument to analyze and first argument to verify selects a different output directory. Vite 8 ESM source-path comments and source maps can vary with that location. UMD and consumer fixture names are fixed. Run in a fresh output directory when changing source snapshots.

The saved `results.json` retains baseline module attribution, sizes/hashes of every measured candidate, tool versions, the actual config-output comparison, and the existing-source test totals. Repeated attribution from other variants is omitted. The generated results in `/tmp` contain every variant's attribution. `verification.json` preserves browser results, differential logs, export names and function AST counts. Postprocessing diagnostics retain the same sourceMappingURL and regenerate source maps. Small differences are not additive.

The original measurements used HEAD `d594983`, Node 24.22.1, gzip level 9 and Node default Brotli. The existing test run used:

```sh
/tmp/lithent-core-analysis/toolchain/node_modules/node/bin/node \
  node_modules/vitest/vitest.mjs run --reporter=dot
```

That run passed 73 files / 462 tests using the unchanged root toolchain. It is separate from the upgraded-output smoke checks and is not a Vite 8 release certification.

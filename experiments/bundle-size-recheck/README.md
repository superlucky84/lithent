# DC-24 bundle size recheck

A second, independent pass over the base UMD size after DC-24. It covers what DC-24 left open: every Terser compress flag on its own, the Rollup Module tag, and source-level edits. Nothing here changes the workspace build, `dist/` or runtime source.

From the repository root, with output directories outside the repository:

```sh
# Copy the source tree to build from (or any edited copy).
mkdir -p /tmp/size-recheck/v/base && cp -r src /tmp/size-recheck/v/base/

# Control: must print the current UMD sha256 ec4c46d2… (12,759 / 5,187 / 4,824B).
node experiments/bundle-size-recheck/build-variant.mjs /tmp/size-recheck/v/base /tmp/size-recheck/out/base

# Terser flags one by one and named combinations, with function counts.
node experiments/bundle-size-recheck/build-variant.mjs /tmp/size-recheck/v/base /tmp/size-recheck/out/pre '{"compress":false,"mangle":false}'
node experiments/bundle-size-recheck/terser-flags.mjs /tmp/size-recheck/out/pre/lithent.umd.js

# Candidate: syntax4 + no Module tag (add SOURCEMAP=hidden for the hidden-map variant).
ROLLUP_OUT='{"generatedCode":{"symbols":false}}' node experiments/bundle-size-recheck/build-variant.mjs \
  /tmp/size-recheck/v/base /tmp/size-recheck/out/cand \
  '{"compress":{"defaults":false,"booleans":true,"lhs_constants":true,"if_return":true,"join_vars":true},"mangle":true}'

# Output equivalence against the control in jsdom.
node experiments/bundle-size-recheck/umd-diff.cjs /tmp/size-recheck/out/base/lithent.umd.js /tmp/size-recheck/out/cand/lithent.umd.js

# Source-level edits (all measured larger; kept for the record).
python3 experiments/bundle-size-recheck/source-edits.py /tmp/size-recheck/v/base /tmp/size-recheck/v/src-all E1,E2,E3
node experiments/bundle-size-recheck/build-variant.mjs /tmp/size-recheck/v/src-all /tmp/size-recheck/out/src-all

# BUG-1 reproduction in Chromium (exits 1 while the bug exists).
node experiments/bundle-size-recheck/portal-anchor-repro.cjs dist/lithent.umd.js
```

`terser-flags.mjs` reports two function counts: all function nodes, and functions bound to their own variable. A candidate that keeps both counts equal to the control did not inline or move functions, so the closure scopes `vite.config.js` protects are unchanged. Terser's default compress lowers the bound count from 118 to 85.

`umd-diff.cjs` compares DOM snapshots, lifecycle logs, uncaught errors and export names. It is an output-equivalence smoke check, not a replacement for `pnpm test`, Playwright or the package probes an adoption would need.

Results: [report section](../../docs/benchmark/BUNDLE_SIZE_RESULTS.md#재확인--2026-10-26) and [raw numbers](../../docs/benchmark/bundle-size-recheck.json).

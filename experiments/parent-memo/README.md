# C3 parent memo prototype

This directory preserves the base-only `useParentMemo` prototype and its
contract tests. The default runtime has been restored. Apply the
[candidate patch](../../docs/benchmark/parent-memo-candidate.patch) in a disposable
checkout before running these tests; the baseline deliberately has no such API.
The canonical contract is [DESIGN](../../docs/performance-improvement/DESIGN.md).

The prototype uses incoming props, copied dependency arrays and `Object.is`.
Nonempty slots and unsupported props fall back to ordinary updates. Self renew
always runs. A parent hit skips the updater and both update callback stages.
Memo publication follows successful DOM/callback processing; it does not make
the base renderer transactional after an exception.

```sh
git apply --check docs/benchmark/parent-memo-candidate.patch
git apply docs/benchmark/parent-memo-candidate.patch
pnpm build:core
pnpm exec vitest run --config experiments/parent-memo/vitest.config.ts
pnpm exec tsc --noEmit -p experiments/parent-memo/tsconfig.json
```

`verify.mjs <fresh-output-directory>` checks actual ESM/CommonJS exports and
consumer declarations, rejects the concurrent named import, builds the same
input editor against baseline/candidate cores and runs nine fresh Chrome
contexts. Before applying the patch, preserve the baseline ESM at
`<fresh-output-directory>/baseline/dist/lithent.mjs`. Use `LITHENT_CHROME_BINARY`
to override the browser path. The script verifies DOM/state/focus, component
work counts and disposal with externally retained keys. It does not measure
official CPU time.

`preserve.mjs capture` snapshots the candidate and writes the reversible patch.
`preserve.mjs` audits and archives the finished run after baseline restoration.
Set `LITHENT_C3_OUT` to its output directory. The original run is
`/tmp/lithent-c3-parent-memo-20261022/final`; the durable
[report](../../docs/benchmark/PARENT_MEMO_RESULTS.md),
[results](../../docs/benchmark/parent-memo-results.json) and
[evidence](../../docs/benchmark/parent-memo-evidence.json.gz) survive its removal.

The archive is gzip-compressed JSON. Each `files` entry records SHA-256,
`encoding` (`utf8` or `base64`) and `content`; preserve paths when extracting.
`candidate/` contains the tested runtime and bundles, `baseline/` the pre-run
snapshot and `restored-runtime/` the restored source. Ordinary application and
official-app build manifests bind every result to the tested core hash.

Current result: 33 candidate regressions pass, as do the 1,070 shared dual
checks (3 existing skips). Parent refresh evaluates zero of 1,000 unchanged
input components. Brotli is 5,691 B against the unchanged 4,800 B budget, so the
prototype is not adopted. Full CPU/peer/memory comparisons remain unexecuted.

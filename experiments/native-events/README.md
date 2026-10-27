# DC-23 native event verification

This directory verifies restoration of native event registration while keeping compact13. The comprehensive experiment scripts and immutable archives remain the historical DC-22 E comparison; their current-source guards deliberately describe E and should not be run as native adoption scripts.

From the repository root, use a new output directory outside the repository:

```sh
pnpm exec node experiments/native-events/verify.mjs /private/tmp/lithent-native-restore-NEW build
pnpm exec node experiments/native-events/verify.mjs /private/tmp/lithent-native-restore-NEW tests
pnpm exec node experiments/native-events/verify.mjs /private/tmp/lithent-native-restore-NEW checks
pnpm exec node experiments/native-events/verify.mjs /private/tmp/lithent-native-restore-NEW browser
pnpm exec node experiments/native-events/compare-proxy.mjs /private/tmp/lithent-native-restore-NEW
python3 experiments/native-events/finalize.py /private/tmp/lithent-native-restore-NEW
```

The browser step requires permission to run Chromium and local servers. It checks the fixed Chrome binary/engine hashes from the comprehensive initial manifest for package probes. The full Playwright suite uses its installed Chromium. No performance benchmark runs here.

Each command writes its log, exit code, times, HEAD and runtime source hashes. The build requires every tracked runtime source to match `fb481f3` (excluding tests and the removed utility), verifies the experimental proxy source still equals `95d6faf`, and compares all three base JS hashes with measured B. The finalizer preserves actual current package JS, comparison bytes, logs and results in a small archive, and verifies the 56 historical archives without repacking them. Use the compressor from `artifacts.json` for the comparison step.

Do not overwrite historical raw data, re-label B timings as newly collected, or run the old E adoption/finalization scripts against this native runtime. The finalizer audits the current restoration only; it does not update canonical decisions or public documentation.

Results: [DC-23 report](../../docs/benchmark/NATIVE_EVENTS_RESULTS.md), [validation](../../docs/benchmark/native-events-validation.json). Current contract: [DOM events](../../skills/lithent/reference/events.md).

## DC-24 bundle size investigation

These commands produce isolated candidates without modifying workspace dist or runtime:

```sh
pnpm exec node experiments/native-events/size-scan.mjs /private/tmp/lithent-bundle-size-NEW
pnpm exec node experiments/native-events/size-build.mjs /private/tmp/lithent-bundle-size-NEW
pnpm exec node experiments/native-events/size-proof.mjs /private/tmp/lithent-bundle-size-NEW
```

The actual builds omit declaration/checker plugins after loading each core's real Vite config. Control JS must match the existing, previously validated packages exactly. Hidden-map builds must preserve the complete executable AST and the actual map bytes. Syntax candidates receive static function/getter checks only; no runtime/heap/performance pass is implied. Program.body is compared rather than Program.end, which includes the changed EOF comment length.

The [DC-24 report](../../docs/benchmark/BUNDLE_SIZE_RESULTS.md) distinguishes recommendations from unadopted output experiments. Do not rerun the DC-23 finalizer to overwrite its completed evidence with this investigation.

# DC-21 flat event handler table

Canonical plan: [R49–R51](../../docs/performance-improvement/REQUIREMENTS.md#dc-21-flat-이벤트-테이블--메모리-후속), DESIGN DC-21, IMPLEMENT DC-21, M-15. [Result](../../docs/benchmark/EVENT_PROXY_FLAT_RESULTS.md).

When source189ddef is present in git, LITHENT_FLAT_SLOT_SOURCE is optional; archived slot/source can replace it, with all3changed hashes checked against that exact commit.

Three frozen variants: compact13 `8056e02` native direct registration; slot proxy source `189ddef82e20959ea1267ab2eb8b2f5007c4ba9a`; flat table source preserved in the eventual candidate commit. Slot/flat render and shared teardown are byte-identical: only `src/utils/event.ts` differs. Flat uses a private Symbol → plain record → handler and one shared native function proxy; no per-event arrays/slot objects/closures on the common path. Distinct aliases switch that event name to native registration for the rest of the node's life, with boolean true in the table. Functions retain native this/currentTarget and EventListenerObjects retain their object receiver, including frozen callbacks. Portal cleanup falls back to native removal for concurrent. Ordinary discarded DOM retains handlers.

This borrows Preact's flat storage/shared function idea; it does not port Preact's logical event clock, capture API, or callback stamping. Known native order/identity/active-dispatch differences remain experimental, as in DC-20. They block default adoption. Concurrent branched source/public exports/C2/default size guard remain unchanged; shared teardown is included in candidate testing and byte-identical concurrent candidate artifacts are not claimed.

```sh
# At the preserved candidate commit; alternatively select archived flat/source.
LITHENT_FLAT_SLOT_SOURCE=/path/to/slot/source LITHENT_FLAT_CANDIDATE_SOURCE=/path/to/flat/source node experiments/event-proxy-flat/build.mjs /tmp/event-flat-fresh
node experiments/event-proxy-flat/integration.mjs /tmp/event-flat-fresh
LITHENT_EVENT_SOURCE=/tmp/event-flat-fresh/baseline/source node node_modules/vitest/vitest.mjs run --config experiments/event-proxy-flat/vitest.config.mjs src/tests/core-eventContract.test.ts
LITHENT_EVENT_SOURCE=/tmp/event-flat-fresh/slot/source node node_modules/vitest/vitest.mjs run --config experiments/event-proxy-flat/vitest.config.mjs src/tests/core-eventContract.test.ts
node node_modules/vitest/vitest.mjs run --config experiments/event-proxy-flat/vitest.config.mjs
LITHENT_CORE=concurrent node node_modules/vitest/vitest.mjs run --config experiments/event-proxy-flat/vitest.config.mjs
LITHENT_CORE=concurrent node node_modules/vitest/vitest.mjs run --config experiments/event-proxy-flat/concurrent.config.mjs
node node_modules/typescript/bin/tsc --noEmit
# Run without any parallel test/build/profiler; the cloud executor requires loopback network permission.
XDG_CONFIG_HOME=/tmp/flat-config XDG_CACHE_HOME=/tmp/flat-cache node experiments/event-proxy-flat/run.mjs /tmp/event-flat-fresh
python3 experiments/event-proxy-flat/audit.py /tmp/event-flat-fresh
```

Fixture bytes are unchanged from DC-20; previous timing/memory samples are never pooled. Four workloads with 2,000buttons: inline handlers only; inline+text changes; stable handler+text; noevent+text. Each of3 rounds rotates baseline/slot/flat; the second order reverses each triplet. Thus each variant occupies each sequence position once per order/workload.72 fresh timing pages,10 warmup+30 retained batches×5updates,3 warmup+10 retained dispatch batches×20,000events, one initial mount/page. Native event construction is excluded from dispatch timing, identical iteration/checksum overhead included. update→nextTick elapsed JS wall time is not final paint/official CPU. Nested samples are correlated: report page medians/opposite orders, not independent-sample significance. Mount has only6fresh values/variant/workload.

36 separate memory contexts,3/variant/workload, rotated order. Twice forced CDP GC at empty/mount/100update/10mount-dispose churn/dispose-immediate; also 2rAF+100ms+2GC after disposal. Preserve immediate residuals and settled results separately. JSHeapUsedSize and DOM/listener counters are not measureUserAgentSpecificMemory or general leak proof. Compare absolute heaps and per-context empty-relative live heap deltas. Distinguish total live-growth reduction vs slot from reduction of extra overhead relative to baseline.

Build freezes17/18/18runtime sources and all9production bundle hashes, using the same Vite/UMD identifier settings; declaration/watch plugins excluded, strict types separate. CJS/UMD construction/export smoke and actual ESM public event gates precede timing. Standalone source-extracted helper observations and native registration counters use separate pages. No build/test runs concurrently with timing or memory collection. Installed dependencies/browser bytes are referenced by version/hash, not archived.

`audit.py` uses Python stdlib to check every input, triplet order/context/sample, 9bundles, source scope (only one module differs between slot/flat), observation differences, callback checksums/counts and distributions/memory arithmetic. `archive.py` preserves raw snapshots/tools/lock/validation with per-entry length/SHA256/base64. Final source and patch remain available after the runtime is restored to compact13. Broad monorepo dual/e2e, all browsers, and the fixed four-peer/nine-action goal are outside this experiment.

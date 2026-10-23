# DC-20 fixed event proxy cloud experiment

Canonical requirements/design/phase gates: [performance-improvement](../../docs/performance-improvement/REQUIREMENTS.md#dc-20-클라우드-고정-이벤트-프록시--독립-실험).
Final conclusions and scope: [EVENT_PROXY_RESULTS](../../docs/benchmark/EVENT_PROXY_RESULTS.md).

This isolated experiment compares compact13 (`8056e02`) with a module-private Symbol on DOM nodes, containing per-event arrays of native EventListenerObject slots. A single slot updates its callback reference without native remove/add. Multiple alias callbacks use remove/add to preserve their mutual registration order. Functions receive native currentTarget as `this`; handleEvent objects retain their own receiver. Ordinary discarded nodes keep handlers; persistent portal hosts remove slots. Shared teardown falls back to removing the original callback for concurrent's direct registrations. Concurrent rendering does not use proxies; its shared cleanup code is affected during the prototype, so byte-identical concurrent artifacts are not claimed.

The candidate changes external native listener order, external original-callback remove/dedup, and replacement during an active dispatch. Those observations are separate from passing common contracts and prohibit default adoption of this prototype. They are not silently treated as native-equivalent behavior.

Reproduction (installed repository dependencies and `/usr/bin/chromium` required):

```sh
# At the preserved source commit, or set this to candidate/source in unpacked evidence.
LITHENT_EVENT_CANDIDATE_SOURCE=/path/to/candidate/source \
  node experiments/event-proxy/build.mjs /tmp/event-proxy-fresh
node experiments/event-proxy/integration.mjs /tmp/event-proxy-fresh
LITHENT_EVENT_SOURCE=/tmp/event-proxy-fresh/baseline/source \
  node node_modules/vitest/vitest.mjs run --config experiments/event-proxy/vitest.config.mjs
# At the source commit, candidate tests use the worktree itself.
node node_modules/vitest/vitest.mjs run --config experiments/event-proxy/vitest.config.mjs
LITHENT_CORE=concurrent node node_modules/vitest/vitest.mjs run --config experiments/event-proxy/vitest.config.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src/render.ts src/hook/internal/unmount.ts src/utils/event.ts src/tests/core-eventContract.test.ts
# No build/test/profiler may run concurrently with the following collection.
XDG_CONFIG_HOME=/tmp/lithent-event-config XDG_CACHE_HOME=/tmp/lithent-event-cache \
  node experiments/event-proxy/run.mjs /tmp/event-proxy-fresh
python3 experiments/event-proxy/audit.py /tmp/event-proxy-fresh
```

The build freezes 17 baseline/18 candidate runtime sources and permits only render/unmount plus the new event utility to differ. Vite production settings and UMD identifier renaming match the core build; watcher/declaration plugins are excluded and strict type validation runs separately. CJS/UMD smoke checks exports/WDom construction. Browser gates use actual production ESM for event lifecycle; standalone helpers extracted from those same source snapshots probe native dispatch/identity behavior. These helpers never participate in timed pages. Listener call counts monkey-patch native APIs only in separate diagnostic contexts.

Four identical-app workloads: inline handler with unchanged text, inline handler plus text update, stable handler plus text update, and text update with no event prop. All allocate the same precomputed stable-handler array so the candidate is not credited for app changes. 2,000 buttons; two explicitly reversed variant orders; three fresh pages per order/variant/workload. Each page retains 30 batches after 10 warmups; each batch is five updates through nextTick. Updates are measured as elapsed JS wall time, not click-to-final-paint or official benchmark CPU. Samples within a page are correlated; page medians and both orders are retained, and no statistical significance claim is made. Mount has only six fresh observations per variant/workload and is descriptive. Dispatch retains ten 20,000-event batches after three warmups per page; event construction is excluded and shared loop/checksum overhead is included. Checksums verify current closures. The noevent dispatch is a native dispatch control, not a handler performance result.

Memory is separate: three fresh contexts per variant/workload, twice-forced CDP GC at empty/mounted/100-updated/10-mount-dispose-churn/final-disposed checkpoints. Record JSHeapUsedSize, documents/nodes/jsEventListeners; report differences from each page's empty checkpoint and absolute heaps. This is not measureUserAgentSpecificMemory or proof of general leak freedom. All execution is serial in a Linux cloud container; no Mac/C2/anchor/peer sample pooling.

Immediate post-dispose DOM/listener residuals occurred in the first memory collection, including baseline contexts. `retention.mjs OUT` is a separate follow-up: 24 fresh contexts repeat 100 updates/10 churn, compare two-GC immediate disposal against two rAF + 100ms + two-GC disposal. Its raw checkpoints are preserved separately, never pooled into timing. Run it with the same XDG/browser settings before the final audit.

`audit.py` independently checks frozen files and six bundle hashes, source scope, every context/sample key, callback counts and known compatibility observations, then computes distributions/order ratios/page medians and memory differences with Python stdlib. `archive.py` preserves raw/build/source/bundles/probes/tools/locks and validation logs with per-entry bytes/SHA-256/base64. `report.py` writes the derived human-readable report from the independent audit. Archives exclude installed dependencies and browser bytes; browser hashes/version are retained.

After evidence is saved the two modified runtime files and experimental utility are restored/removed. The final branch keeps regression tests, scripts, reports and a source commit/patch rather than enabling an incompatible default optimization. Existing 4,824B guard remains unchanged; the full four-peer/nine-action goal and broad monorepo integration are outside this experiment.

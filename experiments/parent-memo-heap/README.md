# C3 production heap attribution

DC-14 reuses the exact DC-13 production app/core/JS and HTML. It changes no
renderer code. Official CPU/memory samples are not collected or pooled here.

```sh
node experiments/parent-memo-heap/collect.mjs /tmp/c3-heap /tmp/lithent-c3-optin-20261022
node experiments/parent-memo-heap/analyze.mjs /tmp/c3-heap
python3 experiments/parent-memo-heap/audit.py /tmp/c3-heap
node experiments/parent-memo-heap/preserve.mjs /tmp/c3-heap /tmp/lithent-c3-optin-20261022
```

Use a fresh output directory. `LITHENT_BENCHMARK_ROOT` and
`LITHENT_CHROME_BINARY` can override local paths; the recorded analyzer pins
the measured browser executable/framework. The collector guards the default
28 runtime files, package and sibling source, checks production bundle/HTML
against DC-13 evidence, and saves partial output on failure. Browser/local
server execution may require permission. Restore the prior production builds
and upstream CSS/fonts from the evidence archive if temporary inputs expired.

Three fresh contexts per condition collect GC/heap/DOM/listener metrics at
0/5/25/100/300 create-clear cycles. Separate contexts, one per condition,
collect all seven full heap snapshots including 1k live and final clear.
The root App/Table remain mounted. Snapshot GC/optimization effects are
separate from the unsnapshotted contexts. All runs execute sequentially.

The parser reads V8 field schemas, sums self size, counts exact-build object
shapes, separates AllocationSite boilerplates, compares instance IDs and
records ordinary strong WeakMap paths. It excludes weak/conditional ephemeron
edges and DevTools console handles. It does not compute dominators or retained
size. Python independently checks all 14 raw snapshots, shapes, sums and paths.

The [report](../../docs/benchmark/PARENT_MEMO_HEAP_RESULTS.md),
[results](../../docs/benchmark/parent-memo-heap-results.json) and
[archive](../../docs/benchmark/parent-memo-heap-evidence.json.gz) preserve raw
metrics, full compressed snapshots, complete analysis/audit, exact tools,
production JS/HTML and nested prior validation. JSON entries carry SHA-256 and
UTF-8/base64 content. The public results omit repetitive per-node-name groups;
the complete analysis remains in the archive. This does not establish long
term leak freedom or attribution of every byte of the official memory API.

# DC-19: Fragment anchor range experiment

The first range candidate is preserved at `f997302` and in the original report.
The snapshot-preserving follow-up is a separate trial; see the DC-19B section
below. Neither was adopted. The branch's final runtime is restored to compact13;
use a preserved candidate snapshot or its source commit when reproducing.

Base commit: `8056e0243c49a29ec9f4efcf5b00f90f6c1bbca7` (adopted compact13).
Branch: `experiment/fragment-anchor-cloud`. Canonical scope is R40–R43,
DESIGN/IMPLEMENT DC-19 and manual M-12 in `docs/performance-improvement/`.

Only the base renderer's anchor search changes. C2 proof transfer, keyed matching,
LIS, factory fields, event handling and component wrappers are held fixed.
The original checkout and its ignored build artifacts remain separate.

Compare a frozen baseline source snapshot with one range-search candidate.
Snapshot source/tool versions, build both under identical production settings,
then gate both against DOM order, identity, focus, lifecycle and portal checks.
Run instrumented allocation/visit diagnostics separately from production timings.

Planned timing: three workloads (long sibling Fragment reveal, keyed multi-node
reorder, stable same-order control), 10 warmups then 30 retained updates per fresh
page, three fresh pages per variant/order/workload, opposite variant orders.
Report each order and pooled distributions, update/JS and two-rAF elapsed time.
This is a synthetic Linux experiment, not the official upstream workload or a
fixed-peer comparison. Do not pool with any historical Mac samples.

Memory: three separate fresh pages per variant/workload, baseline and after 100
updates with explicit GC, DOM/listener counts and final dispose. Report CDP heap
bytes as diagnostics, not `measureUserAgentSpecificMemory` results or proof that
every heap object is collectible.

Important boundary: `slice` eagerly snapshots source array elements; a range
search reads them lazily. Probe accessors that mutate later elements explicitly.
Do not claim full observational equivalence or adopt the experiment silently.

Preserve raw data, source snapshots, runtime/tool/browser hashes, failures,
patch, test/build logs and an independently checked result summary.

## Commands

Use existing repository dependencies. `node` invokes local tools directly; the
session's global pnpm may try to manage/install another pnpm version.

```sh
node experiments/fragment-anchor/build.mjs /path/to/fresh-output
node experiments/fragment-anchor/snapshot.mjs /path/to/fresh-output
node node_modules/vitest/vitest.mjs run --config experiments/fragment-anchor/vitest.config.mjs
LITHENT_CORE=concurrent node node_modules/vitest/vitest.mjs run --config experiments/fragment-anchor/vitest.config.mjs
node node_modules/typescript/bin/tsc --noEmit
LITHENT_CHROME_BINARY=/usr/bin/chromium node experiments/fragment-anchor/run.mjs /path/to/fresh-output
python3 experiments/fragment-anchor/audit.py /path/to/fresh-output
python3 experiments/fragment-anchor/report.py /path/to/fresh-output
```

Run the browser command with local network/socket access. It serves only frozen
inputs on a temporary loopback port. Source aliases select the frozen source
snapshot; TypeScript/ESLint run separately. Production settings match the root
Vite library build, including the UMD identifier pass, without watcher/declaration
plugins. `vitest.config.mjs` excludes five existing manual/demo fixtures that
contain no tests; it does not exclude failing test cases.

The completed experiment has 232 shared tests per core, six browser gates,
1,080 retained timing samples and 18 separate GC/DOM/listener contexts. Update
measurements fall on a 0.1ms grid: the reveal median 0.2→0.1ms should not be
presented as a robust 50% rendering gain. The two-rAF medians are unchanged.
The accessor/snapshot probe establishes an observation difference, so this
prototype remains unadopted. See the durable report in `docs/benchmark/`.

The evidence JSON gzip stores base64 entries with decoded byte sizes and SHA-256.
Decode and verify every entry before extraction. Restoring `run/` provides raw,
summary and frozen source/build files; `tools/` holds the experiment scripts and
`inputs/` the lock/package/test inputs. The recorded Chromium executable hash
must be reproduced or a new browser treated as a new experiment. The binary is
not bundled. Runtime-input checks in `audit.py` refer to the original paths;
portable raw-statistics/archive verification is separate from claiming the
original executable is currently installed.

## DC-19B: snapshot-preserving follow-up

Keep suffix snapshots and the original index getter/throw/length observations.
Replace the anchor reducer with a for loop that continues indexed reads after
finding an anchor; split out a single-node helper to remove `[item]` arrays.
Callbacks and singleton construction decrease, while suffix copies remain.
Do not call this an elimination of all list visits or V8 physical allocations.

This fresh baseline/candidate trial retains the same 1,080/18 protocol. The six
browser gates, 232 base tests, strict types and covered helper observations pass.
Pooled update/two-rAF medians show no benefit; reverse reorder is 3.2→3.4ms.
UMD br is 4,845B versus 4,824B (+21B). The prototype is not adopted.

After extracting and verifying the second archive, use its candidate source:

```sh
LITHENT_ANCHOR_CANDIDATE_SOURCE=/extracted/run/candidate/source \
  node experiments/fragment-anchor/build.mjs /path/to/new-snapshot-output
node experiments/fragment-anchor/snapshot.mjs /path/to/new-snapshot-output
LITHENT_CHROME_BINARY=/usr/bin/chromium \
  node experiments/fragment-anchor/run.mjs /path/to/new-snapshot-output
python3 experiments/fragment-anchor/audit.py /path/to/new-snapshot-output
node experiments/fragment-anchor/integration.mjs /path/to/new-snapshot-output
python3 experiments/fragment-anchor/report-snapshot.py /path/to/new-snapshot-output
```

Use `report-snapshot.py` for this variant. It writes separate
`fragment-anchor-snapshot-*` artifacts and preserves the original range results.
The helper probe covers the actual source functions using stub DOM nodeType;
its matching covered observations do not prove universal JS equivalence.

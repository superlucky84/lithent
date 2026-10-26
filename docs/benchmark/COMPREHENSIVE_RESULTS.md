# DC-22 comprehensive integration

2026-10-26. The measured E event implementation is adopted in the working tree. The fresh six-app comparison is complete: 6/9 pooled CPU goals pass. Validation ran at `fb481f3aa6d315c3d55fb1b2cb97d86f4e53c2e4`. Implementation and evidence are committed as `95d6faf42c860bfb87e180f594287a9e3d717334`; this follow-up handoff records that implementation SHA.

Canonical scope: [requirements](../performance-improvement/REQUIREMENTS.md#7-별도-브랜치를-포함한-종합-반영--dc-22), [design](../performance-improvement/DESIGN.md#dc-22--별도-브랜치를-포함한-종합-반영), [implementation](../performance-improvement/IMPLEMENT.md#dc-22--종합-반영-실행-phase4a4e), [manual checks](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-16-종합-조합최종-목표코어-반영--r53r57r59-dc-22-356-phase4c6).

## Selection and candidate review

Choose **E alone**: default event proxies for base and concurrent, with direct native registration through existing ref/mountCallback for exact native identity, order or options. The inline UI benefit is real; the original cached benchmark has no listener rebinds on select/partial, so these benefits are evaluated separately. No new public event API or global mode is introduced.

| Candidate          | Decision and evidence                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| compact13 / full22 | Keep compact13 as the underlying layout. Full22’s historical 10k memory cost was +14.95%; no new layout hypothesis justifies repeating it.                                                                                                                                                                                                                                                           |
| Flat event E       | Adopt the repaired flat table. Inline updates −15.22% to −17.95%; uncached UI click-to-final-paint partial −5.22%, select −9.44%. Disclose dispatch, heap and size costs below.                                                                                                                                                                                                                      |
| Slot event         | Preserved trusted-click control and prior allocation comparison. Retain flat storage without per-event slot objects; do not pool the older slot/noevent +21% run.                                                                                                                                                                                                                                    |
| C2 K / EK          | Rebased and measured, including lifetime checks. K removes four render arrays and 1,000 index-analysis visits on unchanged 1k updates, but keeps Map/key/diff work. Original cached weighted total K/B +1.40%, EK/B +0.47%, E/B +0.47%. EK/E uncached partial −1.94%, select +1.04%; no consistent extra app benefit sufficient to adopt proof management now. Preserve all K/EK inputs and results. |
| Fragment range     | Reviewed active f997302 and DC-19: getter/snapshot observation difference and uncertain timing. Defer; this run adds no new function-level anchor attribution or compatible improvement hypothesis.                                                                                                                                                                                                  |
| Fragment snapshot  | Reviewed active 3afd8de and DC-19B: observations preserved but no convincing elapsed-time gain. Defer under the same evidence requirement, not because of the historical +21B alone.                                                                                                                                                                                                                 |
| C1                 | Historical own-renew lookup gain does not target the original Table-only cached benchmark. Reopen with a demonstrated own-renew lookup hotspot.                                                                                                                                                                                                                                                      |
| C3                 | Historical actual cached-app comparison regressed total +21.08% and JS +70.27%, with higher memory. No new explicit consumer case justifies integration here.                                                                                                                                                                                                                                        |
| C4                 | Requires a contract for ownership and invalidation of change information; this event optimization introduces none. Conditional research, not an implemented optimization.                                                                                                                                                                                                                            |

Preserved branch snapshot: 6993a93; active flat: 7e838bc; slot: 189ddef. The preserved branch tip had restored compact13 runtime. [Frozen selection and detailed ratios](./comprehensive-selection.json) records the choice before final peer collection.

## Inputs, protocol and interpretation

[Frozen inputs](./comprehensive-initial-inputs.json) cover 17 baseline runtime sources, 30 default guards, sibling inputs, browser executable and engine hashes. [Environment](./comprehensive-environment.json): macOS26.5.2 ARM, 10 CPUs, Chrome156.0.8078.47; build Node20.3.0, official runner Node25.6.1. The run directory is `/private/tmp/lithent-final-20261025`.

The original cached app/helper remain unchanged. Runner/assets: 185 frozen files; 343 installed package metadata files verified. The four peers use preserved production bytes plus source/lock/dependency records: React hooks19.2.0, classes19.0.0; Preact hooks/classes11.0.0. Peer bundles were not rebuilt. All timings are freshly executed here; no Linux151/Mac155/older156 scores are pooled.

Eight apps passed common DOM identity, official keyed/nine-action/font gates before timing. Alternate/reverse orders are balanced. CPU uses the frozen official runner’s click-to-final-paint calculation, 25 select and 15 other samples per app/order. The original four-condition comparison has 1,160 CPU/120 official memory samples. The final six-app comparison has 1,740 CPU/180 memory samples. Builds, tests, profiling and other benchmarks did not run alongside timing.

| CPU item | Rows / action               | CPU throttle | Initialization before retained click                                                          |
| -------- | --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| 01       | create 1,000                | 1×           | 5 create/clear cycles                                                                         |
| 02       | replace 1,000               | 1×           | 5 replacements                                                                                |
| 03       | update every tenth of 1,000 | 4×           | create, then 3 updates                                                                        |
| 04       | select row 2 of 1,000       | 4×           | create, one preparatory select at row 5 (declared warmupCount is 5; source loop is commented) |
| 05       | swap two of 1,000           | 4×           | create, 6 swaps (source uses ≤ warmupCount=5)                                                 |
| 06       | remove from initially 1,000 | 2×           | create, 5 removals                                                                            |
| 07       | create 10,000               | 1×           | 5 create-1k/clear cycles                                                                      |
| 08       | append 1,000 to 1,000       | 1×           | 5 create/clear cycles, then create 1,000                                                      |
| 09       | clear 1,000                 | 4×           | 5 create/clear cycles, then create 1,000                                                      |

Each retained CPU sample uses a fresh page. Initialization is unthrottled; the runner then applies the item’s throttle, starts tracing, waits 50ms, forces a synchronous major last-resort GC, performs the trusted click, waits 100ms and stops tracing. Legacy ID suffixes such as x16/x8 do not specify the current throttle. The separate directory UI partial/select measurements also use **4× CPU throttling**, consistently across all four conditions. These are controlled local latency observations, not an unthrottled-device guarantee. Runner source, actual arguments, browser flags, warnings and load checkpoints are retained.

Ratios are candidate/reference; lower is faster. CPU total, JS and paint are separate medians, so their medians need not add up. Weighted ratios use the pinned upstream geometric weights. Full distributions (N, quartiles, min/max), both orders, timestamps and ratios are in the linked JSON. Small/order-dependent differences remain uncertain; a pooled median alone is not a confidence claim. Official memory is reported in the runner’s MB unit, separate from JSHeapUsedSize GC diagnostics. Startup/transfer latency remains outside IC-1.

## Trusted alias repair and native integration

[Production UMD/helper trusted-click observations](./comprehensive-event-dispatch.json) reproduce the preserved flat failure. A previously registered native custom-element listener renews during the first trusted click and adds onclick=B while onClick=A remains unchanged.

| Condition     | First trusted click | Following click | Nested A count |
| ------------- | ------------------- | --------------- | -------------- |
| Compact13     | A                   | A, B            | 2              |
| Slot          | A                   | A, B            | 2              |
| Original flat | none                | A, B            | 1              |
| Repaired E    | A                   | A, B            | 2              |

E retains the original proxy/A registration and adds only B. A private lazy Set records names that entered native alias handling; a proxy is removed only when its own handler changes. The normal path remains a flat table/shared dispatch. No callback/Event stamping or delayed registration is added. Synthetic dispatch keeps its JavaScript stack and did not reproduce this microtask-between-native-listeners defect; trusted input is a required regression.

| Native interop observation                      | B/K                                   | E/EK                                  |
| ----------------------------------------------- | ------------------------------------- | ------------------------------------- |
| Replace prop after external listener registered | external, new                         | new, external                         |
| External removeEventListener(original callback) | removes it                            | managed proxy remains                 |
| External native add of same prop callback       | one callback                          | two callbacks                         |
| Direct native ref/mountCallback path            | native order/identity/options/cleanup | native order/identity/options/cleanup |

These differences are the chosen public contract, separate from alias loss. Function this/currentTarget, object receivers, frozen handlers and reusing a frozen Event pass. Existing proxies read the latest callback when invoked; newly registered listeners follow native propagation timing. See [DOM events and native example](../../skills/lithent/reference/events.md). Ordinary detached DOM retains callable listeners if the application retains it; portal owner teardown removes only that owner’s target listeners.

## Event update, mount, dispatch and GC comparison

Each event workload has 2,000 buttons. 128 fresh timing pages = 2 orders × 4 rotations × 4 workloads × 4 conditions. Each page has 10 warmup batches and 30 retained batches of 5 updates. Reported update medians divide a batch by 5; nested batches are not 3,840 independent fresh pages. Dispatch has 3 warmup batches/page and 1,280 retained batches of 20,000 events. Separate GC: 48 contexts, 100 updates and 10 mount/dispose cycles, then two frames plus 100ms settling. Raw event observations, native-rebind counters and gates are preserved with the run.

| Workload / condition | Update ms | Mount ms | 20k dispatch ms | Update vs B | Updated heap Δ KiB |
| -------------------- | --------- | -------- | --------------- | ----------- | ------------------ |
| inline-only / B      | 0.780     | 3.150    | 8.800           | +0.00%      | 1156.207           |
| inline-only / E      | 0.640     | 3.200    | 9.500           | -17.95%     | 1262.566           |
| inline-only / K      | 0.760     | 3.050    | 8.850           | -2.56%      | 1150.219           |
| inline-only / EK     | 0.600     | 3.250    | 9.400           | -23.08%     | 1253.758           |
| inline-text / B      | 0.920     | 3.150    | 8.900           | +0.00%      | 1213.414           |
| inline-text / E      | 0.780     | 3.200    | 9.300           | -15.22%     | 1313.258           |
| inline-text / K      | 0.920     | 3.200    | 8.700           | +0.00%      | 1207.844           |
| inline-text / EK     | 0.740     | 3.250    | 9.550           | -19.57%     | 1280.387           |
| stable-text / B      | 0.660     | 3.200    | 8.500           | +0.00%      | 1095.211           |
| stable-text / E      | 0.640     | 3.200    | 9.400           | -3.03%      | 1206.676           |
| stable-text / K      | 0.640     | 3.000    | 8.500           | -3.03%      | 1098.891           |
| stable-text / EK     | 0.620     | 3.200    | 9.500           | -6.06%      | 1198.031           |
| noevent-text / B     | 0.620     | 2.800    | 4.800           | +0.00%      | 1052.793           |
| noevent-text / E     | 0.640     | 2.800    | 4.800           | +3.23%      | 1057.594           |
| noevent-text / K     | 0.600     | 2.850    | 4.700           | -3.23%      | 1045.641           |
| noevent-text / EK    | 0.600     | 2.850    | 4.800           | -3.23%      | 1049.449           |

E inline-only/inline-text synthetic dispatch is +7.95%/+4.49%; stable-handler dispatch is +10.59%. Noevent dispatch is a control without a managed callback. Stable/noevent update effects are small and page-median/order-sensitive. Inline rebind diagnostics count 24,000 native add and remove calls for B/K versus zero for E/EK. All 48 settled GC contexts return DOM/listener counts to the empty-page counts, while nonzero settled heap deltas remain. [All event distributions and ratios](./comprehensive-event-results.json).

## Uncached directory UI: actual click to final paint

A separate deterministic 1,000-row directory screen uses an input, stable toolbar callbacks and inline row select/delete closures. The original cached benchmark is unchanged. Four frozen production apps pass keyed/nine-action/font gates. Two opposite orders collect 320 retained samples for partial/select with the same trace-based runner. This is a general UI comparison, not a nine-item peer score.

| Action / condition       | Total ms | JS ms  | Paint ms | Total vs B |
| ------------------------ | -------- | ------ | -------- | ---------- |
| 03_update10th1k_x16 / B  | 31.884   | 18.446 | 11.114   | +0.00%     |
| 03_update10th1k_x16 / E  | 30.221   | 16.614 | 11.242   | -5.22%     |
| 03_update10th1k_x16 / K  | 31.612   | 18.194 | 10.960   | -0.85%     |
| 03_update10th1k_x16 / EK | 29.635   | 16.232 | 11.105   | -7.05%     |
| 04_select1k / B          | 21.981   | 17.221 | 3.098    | +0.00%     |
| 04_select1k / E          | 19.906   | 15.268 | 3.068    | -9.44%     |
| 04_select1k / K          | 21.723   | 17.090 | 2.813    | -1.17%     |
| 04_select1k / EK         | 20.114   | 15.212 | 3.205    | -8.50%     |

E improves both actions in both orders. C2’s extra effect is smaller and differs by action/order; [UI distributions, all five comparisons and per-order ratios](./comprehensive-ui-results.json) retain that uncertainty.

## Original cached app: four isolated cores

Pooled CPU total medians (ms):

| Item                   | B       | E       | K       | EK      |
| ---------------------- | ------- | ------- | ------- | ------- |
| 01_run1k               | 26.011  | 26.393  | 26.114  | 26.333  |
| 02_replace1k           | 27.587  | 27.586  | 27.453  | 27.197  |
| 03_update10th1k_x16    | 15.708  | 15.617  | 15.313  | 15.413  |
| 04_select1k            | 5.878   | 6.007   | 5.917   | 5.904   |
| 05_swap1k              | 16.438  | 16.498  | 16.596  | 16.604  |
| 06_remove-one-1k       | 11.505  | 11.479  | 13.292  | 11.602  |
| 07_create10k           | 267.065 | 271.658 | 264.929 | 271.159 |
| 08_create1k-after1k_x2 | 29.197  | 29.305  | 29.184  | 29.614  |
| 09_clear1k_x8          | 11.277  | 11.228  | 11.232  | 11.468  |

Pooled JS medians (ms):

| Item                   | B      | E      | K      | EK     |
| ---------------------- | ------ | ------ | ------ | ------ |
| 01_run1k               | 7.265  | 7.449  | 7.107  | 7.465  |
| 02_replace1k           | 8.570  | 8.640  | 8.476  | 8.730  |
| 03_update10th1k_x16    | 3.963  | 3.971  | 3.710  | 3.851  |
| 04_select1k            | 3.018  | 2.963  | 2.614  | 2.801  |
| 05_swap1k              | 3.099  | 2.996  | 3.040  | 3.080  |
| 06_remove-one-1k       | 1.146  | 1.010  | 1.231  | 1.084  |
| 07_create10k           | 53.712 | 58.932 | 53.291 | 58.956 |
| 08_create1k-after1k_x2 | 7.131  | 7.516  | 7.115  | 7.577  |
| 09_clear1k_x8          | 8.925  | 9.088  | 8.921  | 9.139  |

Pooled paint medians (ms):

| Item                   | B       | E       | K       | EK      |
| ---------------------- | ------- | ------- | ------- | ------- |
| 01_run1k               | 18.331  | 18.351  | 18.407  | 18.314  |
| 02_replace1k           | 18.502  | 18.360  | 18.181  | 17.829  |
| 03_update10th1k_x16    | 10.438  | 10.370  | 10.190  | 10.319  |
| 04_select1k            | 2.271   | 2.380   | 2.437   | 2.420   |
| 05_swap1k              | 12.342  | 12.131  | 12.103  | 12.114  |
| 06_remove-one-1k       | 9.689   | 9.701   | 10.454  | 9.745   |
| 07_create10k           | 205.502 | 204.827 | 204.337 | 204.736 |
| 08_create1k-after1k_x2 | 21.001  | 20.770  | 21.035  | 20.909  |
| 09_clear1k_x8          | 1.268   | 1.237   | 1.248   | 1.241   |

Official memory medians:

| Item (MB)           | B      | E      | K      | EK     |
| ------------------- | ------ | ------ | ------ | ------ |
| 21_ready-memory     | 0.624  | 0.630  | 0.626  | 0.631  |
| 22_run-memory       | 3.575  | 3.671  | 3.580  | 3.670  |
| 23_update5-memory   | 3.629  | 3.734  | 3.636  | 3.732  |
| 25_run-clear-memory | 0.912  | 0.910  | 0.913  | 0.910  |
| 26_run-10k-memory   | 28.167 | 29.080 | 28.142 | 29.089 |

| Order / comparison          | Weighted total | Weighted JS | Weighted paint |
| --------------------------- | -------------- | ----------- | -------------- |
| main / event/baseline       | -0.31%         | +1.14%      | -0.61%         |
| main / c2/baseline          | -0.17%         | -0.44%      | -0.36%         |
| main / combined/baseline    | -0.23%         | +3.03%      | -1.98%         |
| main / combined/event       | +0.08%         | +1.87%      | -1.38%         |
| main / combined/c2          | -0.05%         | +3.49%      | -1.62%         |
| reverse / event/baseline    | +1.12%         | +1.82%      | -1.94%         |
| reverse / c2/baseline       | +4.27%         | +1.80%      | +1.14%         |
| reverse / combined/baseline | +1.04%         | +1.29%      | +0.43%         |
| reverse / combined/event    | -0.08%         | -0.52%      | +2.42%         |
| reverse / combined/c2       | -3.10%         | -0.50%      | -0.70%         |
| pooled / event/baseline     | +0.47%         | +0.87%      | -0.43%         |
| pooled / c2/baseline        | +1.40%         | -1.34%      | +0.52%         |
| pooled / combined/baseline  | +0.47%         | +1.53%      | -0.68%         |
| pooled / combined/event     | -0.00%         | +0.65%      | -0.25%         |
| pooled / combined/c2        | -0.92%         | +2.91%      | -1.20%         |

E 10k official memory is +0.912901MB (+3.24%) in this four-condition collection; select/partial do not rebind original cached callbacks. [Four-core full distributions and comparisons](./comprehensive-core-results.json). K’s reverse remove-one paint/total increase is retained and is not removed or remeasured to improve a score. It contributes to order variation.

## Final fresh comparison with all four fixed peers

H = hooks; C = classes. All six apps use the original benchmark contract. Pooled total medians (ms):

| Item                   | B       | E       | React H | React C | Preact H | Preact C |
| ---------------------- | ------- | ------- | ------- | ------- | -------- | -------- |
| 01_run1k               | 26.261  | 26.555  | 24.980  | 25.712  | 25.270   | 25.088   |
| 02_replace1k           | 27.853  | 27.976  | 29.807  | 29.823  | 29.907   | 29.663   |
| 03_update10th1k_x16    | 15.438  | 15.290  | 16.011  | 15.409  | 23.059   | 13.765   |
| 04_select1k            | 5.912   | 5.814   | 6.073   | 6.043   | 14.395   | 4.236    |
| 05_swap1k              | 16.698  | 16.481  | 94.749  | 93.989  | 23.971   | 14.956   |
| 06_remove-one-1k       | 11.738  | 11.587  | 14.661  | 14.944  | 15.656   | 12.126   |
| 07_create10k           | 265.400 | 269.408 | 357.811 | 360.869 | 273.632  | 264.905  |
| 08_create1k-after1k_x2 | 29.811  | 30.259  | 29.348  | 29.734  | 31.007   | 29.123   |
| 09_clear1k_x8          | 11.290  | 11.542  | 17.783  | 17.389  | 12.567   | 12.341   |

Pooled JS medians (ms):

| Item                   | B      | E      | React H | React C | Preact H | Preact C |
| ---------------------- | ------ | ------ | ------- | ------- | -------- | -------- |
| 01_run1k               | 7.263  | 7.483  | 5.902   | 6.487   | 6.063    | 5.902    |
| 02_replace1k           | 8.579  | 8.756  | 10.494  | 10.465  | 10.474   | 10.195   |
| 03_update10th1k_x16    | 3.924  | 3.899  | 4.451   | 3.624   | 10.335   | 2.481    |
| 04_select1k            | 3.050  | 3.026  | 2.984   | 2.841   | 10.377   | 1.306    |
| 05_swap1k              | 3.041  | 3.046  | 18.501  | 18.227  | 9.075    | 1.477    |
| 06_remove-one-1k       | 1.079  | 1.071  | 1.379   | 1.507   | 4.524    | 0.720    |
| 07_create10k           | 53.538 | 59.005 | 148.396 | 150.370 | 58.923   | 50.285   |
| 08_create1k-after1k_x2 | 7.153  | 7.604  | 6.595   | 7.020   | 8.053    | 6.422    |
| 09_clear1k_x8          | 9.027  | 9.271  | 15.363  | 15.229  | 10.213   | 10.254   |

Pooled paint medians (ms):

| Item                   | B       | E       | React H | React C | Preact H | Preact C |
| ---------------------- | ------- | ------- | ------- | ------- | -------- | -------- |
| 01_run1k               | 18.444  | 18.596  | 18.544  | 18.646  | 18.636   | 18.611   |
| 02_replace1k           | 18.632  | 18.660  | 18.758  | 18.822  | 18.858   | 18.936   |
| 03_update10th1k_x16    | 10.005  | 9.907   | 10.188  | 10.537  | 10.742   | 10.213   |
| 04_select1k            | 2.147   | 2.325   | 2.304   | 2.447   | 2.684    | 2.474    |
| 05_swap1k              | 12.280  | 12.064  | 74.260  | 73.575  | 12.688   | 12.431   |
| 06_remove-one-1k       | 9.976   | 10.046  | 10.069  | 10.373  | 10.417   | 9.922    |
| 07_create10k           | 204.516 | 203.638 | 202.642 | 203.063 | 207.523  | 207.669  |
| 08_create1k-after1k_x2 | 21.577  | 21.569  | 21.695  | 21.700  | 21.926   | 21.715   |
| 09_clear1k_x8          | 1.196   | 1.240   | 1.514   | 1.324   | 1.147    | 1.087    |

Official memory medians:

| Item (MB)           | B      | E      | React H | React C | Preact H | Preact C |
| ------------------- | ------ | ------ | ------- | ------- | -------- | -------- |
| 21_ready-memory     | 0.632  | 0.631  | 1.179   | 1.186   | 0.638    | 0.659    |
| 22_run-memory       | 3.564  | 3.670  | 4.424   | 4.547   | 3.291    | 3.488    |
| 23_update5-memory   | 3.634  | 3.728  | 4.890   | 5.017   | 3.349    | 3.520    |
| 25_run-clear-memory | 0.915  | 0.908  | 1.954   | 1.973   | 0.804    | 0.782    |
| 26_run-10k-memory   | 28.161 | 29.073 | 30.743  | 31.565  | 26.227   | 27.639   |

| Item                   | E / fastest peer | Main  | Reverse | Pooled ≤1.10 |
| ---------------------- | ---------------- | ----- | ------- | ------------ |
| 01_run1k               | 1.063            | 1.067 | 1.063   | PASS         |
| 02_replace1k           | 0.943            | 0.943 | 0.940   | PASS         |
| 03_update10th1k_x16    | 1.111            | 1.130 | 1.065   | MISS         |
| 04_select1k            | 1.373            | 1.409 | 1.364   | MISS         |
| 05_swap1k              | 1.102            | 1.116 | 1.088   | MISS         |
| 06_remove-one-1k       | 0.956            | 0.986 | 0.924   | PASS         |
| 07_create10k           | 1.017            | 1.016 | 1.017   | PASS         |
| 08_create1k-after1k_x2 | 1.039            | 1.041 | 1.041   | PASS         |
| 09_clear1k_x8          | 0.935            | 0.954 | 0.915   | PASS         |

CPU goal: 6/9 pooled, 6/9 main, 8/9 reverse. The requirement is all nine; the all-nine goal is **not met**. Event adoption is justified by the measured general UI gain and explicit costs, not by claiming this goal was reached.

| Order / comparison             | Weighted total | Weighted JS | Weighted paint |
| ------------------------------ | -------------- | ----------- | -------------- |
| main / event/react-hooks       | -15.44%        | -22.10%     | -8.02%         |
| main / event/react-classes     | -16.23%        | -22.91%     | -6.79%         |
| main / event/preact-hooks      | -14.34%        | -33.70%     | -1.25%         |
| main / event/preact-classes    | +3.80%         | +25.26%     | -0.88%         |
| main / event/baseline          | +0.96%         | +2.70%      | +0.61%         |
| reverse / event/react-hooks    | -16.26%        | -22.74%     | -7.72%         |
| reverse / event/react-classes  | -16.52%        | -22.45%     | -7.16%         |
| reverse / event/preact-hooks   | -16.03%        | -34.48%     | -3.09%         |
| reverse / event/preact-classes | +1.36%         | +25.44%     | -0.01%         |
| reverse / event/baseline       | +0.11%         | +2.87%      | +1.04%         |
| pooled / event/react-hooks     | -15.73%        | -22.29%     | -7.88%         |
| pooled / event/react-classes   | -15.89%        | -22.60%     | -7.77%         |
| pooled / event/preact-hooks    | -15.05%        | -34.02%     | -2.22%         |
| pooled / event/preact-classes  | +2.81%         | +25.05%     | +0.14%         |
| pooled / event/baseline        | +0.44%         | +2.97%      | +0.72%         |

[Interactive six-app table](./comprehensive-table.html) · [Full distributions and goal ratios](./comprehensive-final-results.json) · [Color factors](./comprehensive-colors.json). Colors normalize to all six displayed apps, using the pinned upstream function; the goal uses the fastest of the four peers for each total median. No memory 1.10 goal is implied.

## Bundle cost, retention and root disposal

| Condition / format  | Raw B | gzip B | Brotli B |
| ------------------- | ----- | ------ | -------- |
| B / lithent.mjs     | 18868 | 6341   | 5802     |
| B / lithent.umd.js  | 12759 | 5196   | 4824     |
| B / lithent.cjs     | 12606 | 5225   | 4857     |
| E / lithent.mjs     | 19531 | 6566   | 6002     |
| E / lithent.umd.js  | 13252 | 5412   | 5006     |
| E / lithent.cjs     | 13098 | 5434   | 5035     |
| K / lithent.mjs     | 19567 | 6538   | 5997     |
| K / lithent.umd.js  | 13228 | 5367   | 4973     |
| K / lithent.cjs     | 13073 | 5390   | 5033     |
| EK / lithent.mjs    | 20235 | 6774   | 6188     |
| EK / lithent.umd.js | 13722 | 5580   | 5159     |
| EK / lithent.cjs    | 13568 | 5599   | 5188     |

The selected E UMD costs +182B Brotli (+3.77%) versus compact13, with no arbitrary extra guard headroom. Exact measured hashes: ESM `e6dd2eab51497aa6cac6bbefa8deaa2430cb11f55a4abb6ae092983e5e886d45`; UMD `8c270bf2f91f678c47a087edf51be928af2425a8b6fbd54ee3687841956eb4f2`; CJS `6632c90c646f5695824dfb2caaf7bd59b9f85c18a36b6de5c56087246854d776`.

The isolated size tables/compression use Node20.3.0. The final workspace pnpm commands use Node24.11.1/V8 13.6.233.10-node.28/zlib 1.3.1-470d3a2; despite that toolchain difference, all three actual base JS artifacts exactly match the isolated measured bytes. The final size command reports gzip5,395B for the same E UMD (the Node20 compressor reports5,412B); Brotli is5,006B in both. Concurrent UMD is7,076/9,000B and element998/1,000B. The recorded budgets and comparison tables use their stated compressor, not mixed gzip results.

Twelve fresh original-app contexts run 100 create/clear cycles and 100 partial updates. DOM/listener counts show no growth; heap checkpoints remain nonzero and include changing application strings/JIT state. [Retention checkpoints](./comprehensive-retention.json) are separate from official memory and are not proof of absence of every possible leak.

The first root diagnostic wrongly assumed disposing the root would clear module-global application state; baseline retained 8,022 observed elements. Its failure/bundles/inputs are preserved. The corrected diagnostic records populated root disposal **before** releasing store.rows/cached views and renewTable, then explicitly releases those application globals. All 12 contexts retain 8,022 observed elements before app release and zero afterward; host children are removed, external siblings preserved, and post-release DOM/listener counters return to empty-page values. Heap does not return to the pre-import value. [Both-stage root disposal results](./comprehensive-root-dispose.json). This does not change runtime or timing apps.

## Validation, failures and reproducible evidence

Preselection gates: B/E each 242 core tests; K/EK each 246 (including four proof lifetime tests); isolated E concurrent 329. A later persistent frozen-Event regression is part of final hardening, so these earlier counts are kept separate. Declaration/strict compilation and production ESM/UMD/CJS builds pass. [C2 diagnostic counters](./comprehensive-counts.json) report structural work, not elapsed-time results.

[Independent Python audits](./comprehensive-audits.json) recalculate distributions, weighted geometric ratios, per-item ratios and goals from raw samples at 1e-12 tolerance. Event audit checks 128 pages/48 GC/256 distributions; UI audit checks 320 samples/72 distributions/90 ratios. CPU failed batches and retries are retained in [the failed-batch list](./comprehensive-failed-batches.json); failed partial samples are not mixed into successful batches.

The final reverse memory run was interrupted after one completed group: Preact hooks ready-memory hit Target closed and two protocol timeouts. The macOS power log records Idle Sleep at 01:17:40 KST and DarkWake at 01:34:42/01:50:54, matching the timeout timestamps; the initial Target closed preceded sleep by five seconds. The failed aggregate, attempts and power log are retained. The exact wrapper resumed completed groups without repetition, with a process-bounded caffeinate idle-sleep assertion; Chrome/scenarios/options and all input hashes stayed unchanged. This external interruption is recorded separately and is not attributed to a library defect.

Preparation failures are retained separately: initial /tmp versus /private/tmp declaration paths; an isolated concurrent resolver mixing live/frozen modules; an initial gate incorrectly imposing Lithent same-task batching on React classes. The corrected runner resolves one frozen core and separates core batching from shared peer DOM contracts. Sandbox browser launch needed browser execution permission. These are not counted as successful runtime/performance samples.

Final verification also caught two fixture/document issues: ref<HTMLButtonElement> needed an explicit nullable type for a null initial value, and the SVG probe needed the existing renderer’s explicit xmlns prop. Only those fixtures/guides changed; the failed type/probe logs and original probe controller are preserved. The corrected checks pass without changing the measured runtime.

[Adopted source/bundle manifest](./comprehensive-adoption.json) verifies the actual package build matches the measured three base artifacts exactly. Both cores use the frozen E sources; concurrent artifact sizes/hashes are separately recorded, without claiming the base CPU gain for concurrent.

[Final validation](./comprehensive-validation.json): full build sequence/parallel, concurrent artifact verification, strict size guard, strict base/concurrent/e2e types and changed-code ESLint pass. Repository test command executions: full-tests 974 passed/3 existing skipped; ssr-base 15 passed/0 existing skipped; satellites-concurrent 172 passed/0 existing skipped. These are execution counts with the scripts’ existing suite overlap. Playwright: 76 passed, 0 unexpected, 0 flaky, 0 skipped; retries disabled.

[Actual package observations](./comprehensive-package-dispatch.json) verify trusted alias repair in ESM/UMD/CJS for base and concurrent, Node import/require exports, frozen/native controls, and the interactive table controls. Failed ordinary DOM setter creation and failed component construction release observed DOM/callback/key weak references after GC in both production ESM cores. This checks unreachable failure objects; it does not promise transactional rollback of arbitrary partially mounted trees. Existing full integration covers scheduler commit/abandon, retained boundaries, SSR/hydration, helper/context, HMR, element, examples and documentation interactions.

Reproduction and guarded resume: [experiments/comprehensive](../../experiments/comprehensive/README.md). Evidence packing includes immutable sources/builds, source/lock/dependency metadata, failed attempts, raw results/logs and every trace in bounded archives. Versions, the upstream app and release/publication state are unchanged.

[Evidence manifest](./comprehensive-evidence-manifest.json): 9245 entries, 7844 trace files, 56 bounded archives, totaling 352,098,151 compressed bytes (335.79MiB). [Independent archive audit](./comprehensive-archive-audit.json) checks every archive/member SHA-256.

| Archive                                                              | Bytes   | SHA-256                                                            |
| -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| [comprehensive-evidence.tar.gz](./comprehensive-evidence.tar.gz)     | 4039857 | `fad30b5a6f92d76d385351420ad74992f8dd1b646337f534a4057a6fdaa10ad1` |
| [comprehensive-traces-001.tar.gz](./comprehensive-traces-001.tar.gz) | 6667653 | `f3439e77cf8d8ff123adfebd55b3fab3714b4369cf9de5aaf747c5048716627e` |
| [comprehensive-traces-002.tar.gz](./comprehensive-traces-002.tar.gz) | 7162862 | `f7dd3f6d7476aaeb57c38db7a4034a39f55fa736fbd00c18917d8bccc3f53808` |
| [comprehensive-traces-003.tar.gz](./comprehensive-traces-003.tar.gz) | 6514085 | `30cc6cac3ce0955fe25f2776c7dd6d08fa909f5d83cd01c75a9ce67be3ef6541` |
| [comprehensive-traces-004.tar.gz](./comprehensive-traces-004.tar.gz) | 6114947 | `ae8e5d929183c5df0dab9d0e07fd9982f54a5c619bdefc862a7c5f7477eead79` |
| [comprehensive-traces-005.tar.gz](./comprehensive-traces-005.tar.gz) | 6040191 | `9961d7e8aab6dade2d3928c348ec30c94d4eec73aa991b8d7d6fe9685fd46ff0` |
| [comprehensive-traces-006.tar.gz](./comprehensive-traces-006.tar.gz) | 6171265 | `1b9efe8341caed8c5a4ddc448e6c3765c2c11d16292f517c944bbcdebe6fe306` |
| [comprehensive-traces-007.tar.gz](./comprehensive-traces-007.tar.gz) | 7032427 | `5fb381d5d66a3dbc520e8a01fc06e7b759110c17bdabd7fd70927693ca65f56d` |
| [comprehensive-traces-008.tar.gz](./comprehensive-traces-008.tar.gz) | 7684214 | `9be6c980263909d9e91749f60900610a781a76796171dd507ac2f669d7fd1320` |
| [comprehensive-traces-009.tar.gz](./comprehensive-traces-009.tar.gz) | 6810046 | `1673e83f73b7d49e22cfdd7e08c382fefb80aeb3d76da79d8e5ef102447a6760` |
| [comprehensive-traces-010.tar.gz](./comprehensive-traces-010.tar.gz) | 6114878 | `490eaaee96712967b57291133155b22e13e765ec7c41df4ef7751d9235e93372` |
| [comprehensive-traces-011.tar.gz](./comprehensive-traces-011.tar.gz) | 6145446 | `b3950e6b708c3678eab8912264603863e61d25124876830805fd02b37617434c` |
| [comprehensive-traces-012.tar.gz](./comprehensive-traces-012.tar.gz) | 6320120 | `a6d761ec09e45a80716e3228076d8d89dfdc5d623bc6811273d90fa46fc81d16` |
| [comprehensive-traces-013.tar.gz](./comprehensive-traces-013.tar.gz) | 6302687 | `f131eb347c19eea7d8b39cbd6523bd598d6060963fc3dc07fd689c4deafbce17` |
| [comprehensive-traces-014.tar.gz](./comprehensive-traces-014.tar.gz) | 6335073 | `7dfd3ec60171dbceca8a0ee730fc7fa70823ed72502bf4a3a93bd99dac167350` |
| [comprehensive-traces-015.tar.gz](./comprehensive-traces-015.tar.gz) | 6352622 | `60262a410e8a39b8d496a461176ebda02a979427ff3d5def8777c1869171d472` |
| [comprehensive-traces-016.tar.gz](./comprehensive-traces-016.tar.gz) | 6231096 | `ea86b7a20d07b1f142b65f8bc07d3284786fee14f5cc35037a77085587870a77` |
| [comprehensive-traces-017.tar.gz](./comprehensive-traces-017.tar.gz) | 6276294 | `d7e8b34d3b954530f5b9df41bdbbc6145ccf22154aabdf57931385250d5f7482` |
| [comprehensive-traces-018.tar.gz](./comprehensive-traces-018.tar.gz) | 6130587 | `de62cb53952d1ae4ac3f0e1d9425aac2fc04d87a303967bb61f5878329cb9fcd` |
| [comprehensive-traces-019.tar.gz](./comprehensive-traces-019.tar.gz) | 6162888 | `2bea3b92ff0e6416971755561924676da3e5b6f0518ebd5f0eac642a6fea0d62` |
| [comprehensive-traces-020.tar.gz](./comprehensive-traces-020.tar.gz) | 6310314 | `588335c7736a6d932c872bb93deecbe3793ca1224debdca214902739745bf530` |
| [comprehensive-traces-021.tar.gz](./comprehensive-traces-021.tar.gz) | 6287579 | `f2c42da69720cc71ad18bd248afab194eac7ac94167843f94c1eebddbc61d9f9` |
| [comprehensive-traces-022.tar.gz](./comprehensive-traces-022.tar.gz) | 6300674 | `0f1deeeb8f14290db8c3ba30383d0211ec4d203c2f055910c41de5427bc44d19` |
| [comprehensive-traces-023.tar.gz](./comprehensive-traces-023.tar.gz) | 6318973 | `95e6d865dc6523cb71edac3bcb934e84189ffc1d21d2aa57e25a18235a130302` |
| [comprehensive-traces-024.tar.gz](./comprehensive-traces-024.tar.gz) | 6205569 | `75b9f8666f0bd99932ca10de8b546ca7bf3053516638163aef068dc51ebb65d8` |
| [comprehensive-traces-025.tar.gz](./comprehensive-traces-025.tar.gz) | 6170440 | `cd03553f740a96d74be9f3d383bae50c998f32ade3f720a00ec2e80f58dedc66` |
| [comprehensive-traces-026.tar.gz](./comprehensive-traces-026.tar.gz) | 6808263 | `47585918a250cc482e1bccdbcfdeb2e7610ae3c6d52d63d17a915f1f31907b67` |
| [comprehensive-traces-027.tar.gz](./comprehensive-traces-027.tar.gz) | 7618239 | `ab5fbc0ad2512584acfccb453b1db8a214e7320cef261f102ea885f1c742a4fb` |
| [comprehensive-traces-028.tar.gz](./comprehensive-traces-028.tar.gz) | 6778065 | `db46b7636dcac083dd4df9178aeeaf4cd0962fd55ca0dbf47724384815ec793c` |
| [comprehensive-traces-029.tar.gz](./comprehensive-traces-029.tar.gz) | 6152109 | `ce6a9176c369212255060c56dd7d429b7742775edc823ca63fff18d6359703da` |
| [comprehensive-traces-030.tar.gz](./comprehensive-traces-030.tar.gz) | 6269938 | `20844d0e70d125bbc67020ee29f3906caaaa2b79b3f1efb836ce92d23cd6f99a` |
| [comprehensive-traces-031.tar.gz](./comprehensive-traces-031.tar.gz) | 6250661 | `7648ab70e7751941c7811be610e41506aa618958b38c2d569021165ff3790c1b` |
| [comprehensive-traces-032.tar.gz](./comprehensive-traces-032.tar.gz) | 6150392 | `fa51fa3d1804a2451f804c2cfd4ac834b5ea8358fbc039cb8c32c75ba3e4bbad` |
| [comprehensive-traces-033.tar.gz](./comprehensive-traces-033.tar.gz) | 6042609 | `e292e791a5543c2d971eaa9f5399ce23c887578f9fdb90a28523fe24a4e4c4ad` |
| [comprehensive-traces-034.tar.gz](./comprehensive-traces-034.tar.gz) | 6162273 | `b80fb2ebf9139091c84dab85fe999aedf6f9e273305b9a57e53e541f2399d33d` |
| [comprehensive-traces-035.tar.gz](./comprehensive-traces-035.tar.gz) | 6285553 | `78b20d219450a261e9c513bb8cbbb15fb2e4cc45e1c2eb7292258ca8a2ca764d` |
| [comprehensive-traces-036.tar.gz](./comprehensive-traces-036.tar.gz) | 6333626 | `55eab2908007ea234f2ebe2884599d88fa9b4c9de1f9b882845c1e35d7d26333` |
| [comprehensive-traces-037.tar.gz](./comprehensive-traces-037.tar.gz) | 6274752 | `59eac5f44f1b44e88a63f0c6819f3b9cc85e1a151b6c7ad87fd7ba808a5d46df` |
| [comprehensive-traces-038.tar.gz](./comprehensive-traces-038.tar.gz) | 6357328 | `808ae372a1ea95211070d3177bb5b0fb6562b217b25537df8c9ef8bdedff85b0` |
| [comprehensive-traces-039.tar.gz](./comprehensive-traces-039.tar.gz) | 6367005 | `a4cbd287c0b61310aa90a1e6697e033225c23bdf6df2a3f817722927a279509e` |
| [comprehensive-traces-040.tar.gz](./comprehensive-traces-040.tar.gz) | 6234979 | `20e60a30b2eafcaa193beee72c92a29cb0cd4180a66314d4f3477efd405d9017` |
| [comprehensive-traces-041.tar.gz](./comprehensive-traces-041.tar.gz) | 6231368 | `5eceff53821070f0082ad340c169bf5c02c8718bd1885312ad31ed61e1ce90bd` |
| [comprehensive-traces-042.tar.gz](./comprehensive-traces-042.tar.gz) | 6144410 | `9672037fe36e4828e4ab7476fdb48d206b83db29b2e5fdfab55e2574e96ffa74` |
| [comprehensive-traces-043.tar.gz](./comprehensive-traces-043.tar.gz) | 6285462 | `2fbbfc07ccb27c8e4d5e4f9266571ab7a22105ba530a45d6333247e454954f16` |
| [comprehensive-traces-044.tar.gz](./comprehensive-traces-044.tar.gz) | 6384591 | `7ac291aabfc1e2c274d4bc12709fc4b3a615e4659dc2bc459804e73093f522af` |
| [comprehensive-traces-045.tar.gz](./comprehensive-traces-045.tar.gz) | 6357924 | `1696bf77f8c40913e377371058f89df1d5aaa54a8a32c9b4066e24a629605217` |
| [comprehensive-traces-046.tar.gz](./comprehensive-traces-046.tar.gz) | 6293226 | `53c196165d589e78a0e76b39de590e4110a798f3a2a4bbaab0d3823eeeda959e` |
| [comprehensive-traces-047.tar.gz](./comprehensive-traces-047.tar.gz) | 6217044 | `ebe70f11f9a618a3161f7e496cc8bb49303ccad7ad4bdd8e5fe79f18a1ad8828` |
| [comprehensive-traces-048.tar.gz](./comprehensive-traces-048.tar.gz) | 6196580 | `8ce7377664ae3789d73de15cb4eb916e3c06b8ab8c50784fa3a6af0afa8915cf` |
| [comprehensive-traces-049.tar.gz](./comprehensive-traces-049.tar.gz) | 6288962 | `c72cf313e703b1a3f0c1f1547b46b41fb5dba3ff86600131d3babd8ffe444c5b` |
| [comprehensive-traces-050.tar.gz](./comprehensive-traces-050.tar.gz) | 6299893 | `9571b0c250374ba7fc140e4ffba05d676f3cecc49b373345cfb9f26a30e26f0e` |
| [comprehensive-traces-051.tar.gz](./comprehensive-traces-051.tar.gz) | 6130256 | `f14ab5cf79649cd0d4f8e162807cd6aaec953875249606b50617b0aff74d7aa2` |
| [comprehensive-traces-052.tar.gz](./comprehensive-traces-052.tar.gz) | 6064526 | `cd80e5227f6316ab67868c169faa724b12b0184228d0e6b14cde301c2524a748` |
| [comprehensive-traces-053.tar.gz](./comprehensive-traces-053.tar.gz) | 7136119 | `14493b506de369c9eb3a403ad6ba13b778e31a315f7bec2d7be4017d7a3b7968` |
| [comprehensive-traces-054.tar.gz](./comprehensive-traces-054.tar.gz) | 7936813 | `f20144e24e541b78336762855979a556dd9f8bb4a608d809bda8f4bf9c6ee441` |
| [comprehensive-traces-055.tar.gz](./comprehensive-traces-055.tar.gz) | 1842398 | `5bacff4f793f1660a830f96fc8b44c803cba48ee88a768eda2d8ba9e4b1c2868` |

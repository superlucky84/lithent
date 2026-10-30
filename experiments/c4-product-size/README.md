# C4 product size probe (DC-29)

Measures what each placement option for the C4 list boundary adds to the base
UMD build, and how large the list module is on its own. Results and the
decision table are in
[DESIGN DC-29](../../docs/performance-improvement/DESIGN.md#dc-29--c4-제품-api와-크기-한도-선택지).
Nothing here is a product export.

- `listBoundary.core.ts`: `experiments/c4-owner/boundary.ts` (P2) with only the
  diagnostic counters removed. Same API and behavior.
- `listBoundary.helper.ts`: the same code importing from `lithent`, as a module
  outside the core would. It reads the component key through the public
  `getComponentKey` and inlines the one-line `getKey`; the three internals it
  still needs (`makeNewWDomTree`, `wDomUpdate`, `needDiffRef`) are what the
  core bridge would provide.
- `probe.config.mjs`: builds that module alone with `lithent` external (UMD
  and ES, Vite default minification as in `helper/`).
- `measure.sh`: builds each variant in a scratch worktree with the root
  `vite.config.js` (same Terser post-process) and prints Brotli bytes measured
  like `scripts/size-report.js` (`brotliCompressSync` defaults).

## Run

```sh
git worktree add --detach /tmp/lithent-c4size HEAD
ln -s "$PWD/node_modules" /tmp/lithent-c4size/node_modules
bash experiments/c4-product-size/measure.sh /tmp/lithent-c4size
git worktree remove --force /tmp/lithent-c4size
```

The script edits only the worktree (`src/index.ts` and two temporary files)
and restores it. Never pass the main checkout.

## Result (2026-10-31, main `7796eb1`, lithent 1.25.4)

| Variant                                       | Base UMD Brotli | vs 4,817B |
| --------------------------------------------- | --------------: | --------: |
| baseline                                      |           4,817 |         — |
| S1: P2 inside the core                        |           5,779 |      +962 |
| S1: same, short error codes                   |           5,693 |      +876 |
| S1': P1 (set/invalidate only) inside the core |           5,421 |      +604 |
| Bridge: three internals exported              |           4,851 |       +34 |
| Bridge: one `patchWDom` function              |           4,858 |       +41 |

The list module outside the core is 1,388B Brotli as UMD and 1,516B as ES
(unminified whitespace kept by Vite for ES libraries). The current helper UMD
is 3,790B. Concurrent was not measured; it needs the same bridge.

## Official gap

`official-gap.mjs` recomputes the official CPU score (mean total time divided
by the fastest framework's mean, weighted geometric mean with the site's CPU
weights) from a js-framework-benchmark checkout. Used for R111 with
`ca8715d9` (Chrome 156 results, lithent 1.25.2):

```sh
node experiments/c4-product-size/official-gap.mjs \
  ../js-framework-benchmark-upstream/webdriver-ts-results/src/results.ts
```

Its projections multiply local improvement rates (node shape 1.25.3, C4 P2)
onto the official means. They are estimates, not measurements.

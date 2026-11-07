# DC-17 C2: current keyed-diff result passed to render

2026-10-23. **This base-only prototype is not adopted because its Brotli bundle
exceeds the existing budget.** It demonstrates removed render work and passes the
scoped correctness checks, but has no measured CPU or memory benefit. The default
runtime, helper, exports and package configuration were not changed.

## Scope and lifetime

The existing keyed Map remains responsible for key reads, first duplicate
consumption, unkeyed positional matches and unused deletion. During that same
pass, C2 accumulates whether lengths and every original index match, each direct
result is N/U/T, and no direct child is a portal. It adds no key preflight, Set or
public immutable contract.

Successful loop results are staged as `WeakMap<WDom, WDom[]>` entries in a frame
owned by one synchronous `replaceWDom`. They become usable only after the entire
root diff and wrapper publication succeed. `typeUpdate` consumes a loop's entry
before props, DOM setters or callbacks and checks the exact current children
array. Nested replacements invalidate the outer frame. An outer `finally` restores
the previous scope and discards unvisited entries on success or any exception.

The fast path keeps left-to-right `wDomUpdate`, the keyed path's final full
`clearDiffMeta` pass and `execMountedQueue`. Ordinary fallback receives the same
already-diffed tree. No general diff is repeated. The optional WDom flag/shape
approach and array-only WeakSet association were considered but not implemented
or measured; the first prototype favors explicit node/children association and
bounded lifetime. It does allocate a frame and WeakMap per replacement, including
replacements with no successful proof.

## Build and adoption gate

All sizes are the same build configuration and compression settings, using the
isolated baseline and production candidate. UMD Brotli is the existing core gate;
ESM and CJS are reported separately.

| Artifact | Baseline raw / gzip / br (B) | Candidate raw / gzip / br (B) |
| -------- | ---------------------------: | ----------------------------: |
| UMD      |       12,741 / 5,178 / 4,798 |        13,210 / 5,348 / 4,952 |
| ESM      |       19,110 / 6,454 / 5,896 |        19,809 / 6,643 / 6,067 |
| CJS      |       12,592 / 5,210 / 4,828 |        13,059 / 5,376 / 4,993 |

UMD increases by **154B br** and exceeds **4,800B by 152B**. The candidate build
emits all 17 ESM/CommonJS declaration pairs successfully, then exits 2 for the
failed size gate. The first attempt had a TypeScript handler-argument error;
that failed build log is retained separately. Final source and bundle hashes are
in [raw results](./keyed-placement-results.json).

This outcome defers this prototype; it does not establish that every possible C2
implementation fails. CPU580, memory60, browser B3/font/keyed checks, real-browser
retention and final candidate/peer target evaluation were not run. No performance
claim substitutes for those gates. Final Test Hardening and Integration remain open.

## Structural counts, separate from timing

The permanent DC-16 evidence is verified before extracting the exact original
cached monolithic app (`4fcb17e3…`) and its unchanged `cacheUpdate` source. Both
instrumented cores execute that app in JSDOM. Production candidate bytes are not
instrumented. Eleven actions per variant check DOM identity and content alongside
operation counts; no paint, font, browser CPU or official memory data is produced.

| Action             | Index analysis visits before → after | Four temporary arrays before → after | Proof write / read / delete |
| ------------------ | -----------------------------------: | -----------------------------------: | --------------------------: |
| Select             |                            1,000 → 0 |                                4 → 0 |                   1 / 1 / 1 |
| Select another row |                            1,000 → 0 |                                4 → 0 |                   1 / 1 / 1 |
| Partial update     |                            1,000 → 0 |                                4 → 0 |                   1 / 1 / 1 |
| Swap               |                        1,000 → 1,000 |                                4 → 4 |                   0 / 1 / 1 |
| Remove one         |                            999 → 999 |                                4 → 4 |                   0 / 1 / 1 |
| Replace 1k         |                        1,000 → 1,000 |                                4 → 4 |                   0 / 1 / 1 |
| Append 1k          |                        2,000 → 2,000 |                                4 → 4 |                   0 / 1 / 1 |

Create1k/create10k/clear/clear10k have zero matched-index analysis in either core.
Each of all 11 actions allocates/releases one candidate frame; fallback loops pay
proof lookup/delete without removing their original arrays. Across all actions,
diff key reads, Map has/get/set/delete, build/filter visits, `wDomUpdate` and
`clearDiffMeta` counts match. Select and partial still read 2,000 diff keys and do
1,000 Map get/delete operations. They retain the VDOM/helper/content work. Neither
these counts nor allocation counts establish time shares, retained bytes or speedup.

## Correctness and validation

- New shared baseline: **11/11 base and 11/11 concurrent** on the unchanged cores.
  Tests cover same-order unusual and duplicate keys, mixed/empty/key/tag changes,
  later key mutation by a pre callback, children-getter versus key-Map read order,
  component Fragment arity, portal/external
  siblings, focus, self renew, callback order, failure recovery and wrapper reentry.
- The key-mutation regression preserves an existing difference: base matches the
  later key after the earlier callback (remount), while concurrent precomputes
  matches (retain). Failed parent trees are not assumed to roll back; the failure
  regression verifies queued/live sibling recovery.
- Isolated candidate: **229 shared core + 4 frame lifetime = 233 passed**. Lifetime
  checks cover staged versus consumed proof, later diff throw, DOM throw and
  invalidation/restoration on synchronous nested replacement.
- Default `pnpm test:dual`: **1,090 passed, 3 skipped**. An initial run hit three
  existing lithentVite transform failures from a stale generated HMR parser.
  `pnpm build:hmrParser` regenerated that prerequisite without source changes,
  and the complete dual run passed. The failure and successful logs are retained.
  This complete dual run contains the initial ten shared regressions; the final
  children-read-order regression was additionally checked on base/concurrent and
  the final full isolated candidate after review.
- Root strict TypeScript, isolated source/declaration build, strict candidate plus
  regression-test types, changed TypeScript ESLint and Prettier passed. Final new
  tests were rechecked on base, concurrent and candidate after their type cleanup.
- Permanent patch replay reproduces every candidate source hash. Independent
  Python checks decoded archive hashes, source/build/gzip values, 154 counter
  comparisons, size arithmetic and all 29 default-file guards.

Final review kept the `newWDom.children` read after the original Map construction,
matching the baseline even when a children getter is observable. This reordered
local declarations and changed the compressed candidate by 1B. The earlier 4,951B
prototype archive/results/patch/report are retained under `superseded/source-order-v1/`
inside the final evidence; all tables and final hashes above refer to 4,952B.

These checks do not imply full final-candidate hardening, browser integration,
unmeasured in-place VDOM mutation guarantees, or absence of all memory leaks.

## Preservation and environment

Starting HEAD is `452dc2eeae29d1e555f7f7b467f01de2baa55c0d`. All 16 runtime source
files match the historical baseline. Five preexisting generated default files
differ from historical hashes; they are preserved as found. The isolated baseline
rebuild reproduces the three historical base JS hashes exactly, including UMD
4,798B. The actual initial 28 source/build files plus `package.json` remain byte
identical. The candidate was built under `/private/tmp`; no runtime restoration
was needed. HMR parser generated prerequisite outputs are outside that snapshot.

Initially the handoff's upstream checkout, old staging and fixed Chrome155 were
absent. During this run a clean upstream checkout appeared externally at HEAD
`ecbff5f54b75244b89b0b14d34f11e32bca59345` with the original app, not the historical
modified targeted app (`314efbb4…`). This experiment only read it. Chrome155 and
historical staging remain absent. The independent size failure already stops the
prototype before browser/measurement gates.

- [Reproduction tools](../../experiments/keyed-placement/README.md)
- [Candidate patch](./keyed-placement-candidate.patch)
- [Raw results and archive hash](./keyed-placement-results.json)
- [Permanent evidence](./keyed-placement-evidence.json.gz)

Done: internal lifetime contract, baseline regressions, base prototype, scoped
correctness/types/build/size, structural counts, patch/evidence and default guards.
Next: decide whether a substantially smaller internal proof transfer warrants a
new C2 experiment; any new candidate needs fresh gates. No alternative is selected
or authorized as an adopted design here. Blockers: current prototype fails size;
fixed browser/staging would need restoration for a later measuring candidate.
Latest committed HEAD remains `452dc2e`; this follow-up is uncommitted. No push,
release or upstream submission was performed.

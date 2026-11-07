# DC-17 C2 keyed placement proof

This base-only prototype stages the existing general keyed diff's same-order
result in a root-scoped WeakMap. It avoids four render arrays and the repeated
index analysis when every original index is unchanged and no direct child is
added, deleted, replaced or a portal. The existing Map, key observations, helper,
left-to-right content updates, cleanup and mount queue order remain in place.

The evaluated prototype is **not adopted**: UMD Brotli is **4,952 / 4,800B**,
152B over budget. Baseline is 4,798B. Official B3, CPU, memory and real-browser
retention were not run. The archived original app runs under JSDOM only for
structural counters; those checks are not timing or official browser evidence.

Permanent artifacts:

- [Report](../../docs/benchmark/KEYED_PLACEMENT_RESULTS.md)
- [Results](../../docs/benchmark/keyed-placement-results.json)
- [Source patch](../../docs/benchmark/keyed-placement-candidate.patch)
- [Evidence](../../docs/benchmark/keyed-placement-evidence.json.gz)
- [Shared baseline regressions](../../src/tests/core-placementProof.test.tsx)
- [Candidate frame lifetime checks](./lifetime.test.tsx)

The recorded run is `/private/tmp/lithent-c2-20261023-run2`. Its initial snapshot
contains the actual 28 runtime/build files plus `package.json`. Five preexisting
generated files differ from the historical report; the isolated baseline rebuild
reproduces all three historical base JS hashes. None of those 29 default files
was changed by this experiment. Building the HMR parser prerequisite updates only
its generated package outputs, outside that runtime snapshot.

Use the installed workspace dependencies and a fresh directory. Commands below
use one explicit path so no completed evidence is overwritten:

```sh
node experiments/keyed-placement/init.mjs /tmp/lithent-c2-replay
git -C /tmp/lithent-c2-replay/candidate apply /Users/superlucky84/project/lithent/docs/benchmark/keyed-placement-candidate.patch
node experiments/keyed-placement/build.mjs /tmp/lithent-c2-replay baseline
# Expected exit 2: type/build succeed, then the 4,800B size gate fails.
node experiments/keyed-placement/build.mjs /tmp/lithent-c2-replay candidate
LITHENT_C2_SOURCE=/private/tmp/lithent-c2-replay/candidate/src pnpm exec vitest run --config experiments/keyed-placement/vitest.config.ts --reporter verbose
node experiments/keyed-placement/count.mjs /tmp/lithent-c2-replay
pnpm exec vitest run src/tests/core-placementProof.test.tsx
pnpm exec vitest run --config lithentConcurrent/vitest.config.js src/tests/core-placementProof.test.tsx
pnpm exec tsc --noEmit
```

`build.mjs` emits declarations from the isolated source, preserves core build
settings and compact UMD identifiers, and guards default files before/after.
`count.mjs` verifies the permanent DC-16 archive and exact original-app/helper
hashes before extracting them. It compares all Map operations, diff key reads,
content visits and cleanup calls across 11 actions, including fallback actions.
Instrumentation is separate from the production candidate and produces no score.

The original upstream checkout, completed `/tmp` staging and fixed Chrome155
were initially absent. A clean upstream checkout appeared externally during this
run; its original app differs from the modified targeted app recorded in the
handoff. This experiment only read it. Chrome155 and the historical staging remain
absent. The size failure independently stops this prototype before those gates.

`preserve.mjs` is the recorded run's finalization recipe: it verifies named logs,
replays the patch and writes the permanent archive/results. It expects those logs
and a fresh patch-replay directory, and must not be used to overwrite completed
evidence for a different source/toolchain. Independently check the saved evidence:

```sh
python3 experiments/keyed-placement/audit.py
```

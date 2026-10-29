# C4 first list-boundary proof

This is a base-only experiment for DESIGN DC-26-C4-P1. It is not exported by
Lithent and does not modify the default runtime, concurrent, or size guard.

`createListBoundary(keyOf, view)` owns a copied item array and key/index Map.
Mount its `node` exactly once inside a stable owner, then call `set(items)` for
structural changes and `invalidate(keys)` after editing known items. Call
`dispose()` when the owner is removed. Same-turn work coalesces in a microtask;
structural work supersedes pending item work. Structure uses the existing
full keyed diff/render. Stable-item edits use the same diff/render on known
child slots, without a component instance per item or direct DOM writes.

The caller guarantees unique immutable string/non-NaN number keys, explicit
notifications for every external edit, and plain item VDOM with one keyed
element root and no nested components/portals. Invalid roots, duplicate keys,
unknown invalidations and detected key changes are rejected. Arbitrary
unreported writes are not detected. `view` is pure, and owner cloning/parent
rerenders, nested component lifecycle, SSR/HMR and concurrent are outside this
first contract. Writes during a flush are rejected. Throwing views are
evaluated before DOM commits and can be explicitly retried; a diff/DOM failure
can partially commit and requires rebuilding the owner. There is no general
transactional rollback guarantee.

The benchmark app uses the exact original A row cache/view. It reports the
previous/next selection key and collects update keys in the existing mutation
loop. The cost of collecting keys, map maintenance, array copies and scheduling
is included. Both apps bundle the same unchanged source core with Vite 5.4.8.
This differs from replacing the published prebuilt core in an unchanged app.
Production bundles exclude the diagnostic counters/API exposure.

```sh
node experiments/c4-list-boundary/check.mjs /tmp/c4-check.json
node experiments/c4-list-boundary/prepare.mjs /tmp/c4-proof
node experiments/c4-list-boundary/measure.mjs /tmp/c4-proof gate
node experiments/c4-list-boundary/browser.mjs /tmp/c4-proof
node experiments/c4-list-boundary/measure.mjs /tmp/c4-proof cpu main
node experiments/c4-list-boundary/measure.mjs /tmp/c4-proof cpu reverse
node experiments/c4-list-boundary/measure.mjs /tmp/c4-proof mem main
node experiments/c4-list-boundary/measure.mjs /tmp/c4-proof mem reverse
node experiments/c4-list-boundary/analyze.mjs /tmp/c4-proof
python3 experiments/c4-list-boundary/audit.py /tmp/c4-proof
```

Preparation currently reuses the frozen runner/locks/font/original app from
`/private/tmp/lithent-dc25-20261027`; restore the corresponding archived evidence
and runner dependencies if that directory has expired. Each proof requires a
fresh output. The browser binary/engine and source hashes are frozen before
timing. CPU is 580 and official memory is 60 samples, including opposite app
orders. Do not run builds, tests or diagnostic browsers during collection.
Peer scores and old results are not pooled into this B/C proof.

The initial output `/private/tmp/lithent-c4-20261029` preserves the sandbox
port failure and the source preceding a strict TypeScript fix. The final
`-v2` source adds a type-only Fragment cast and removes an unused import.
All three JS bundles and HTML hashes are identical, so keyed/browser/retention
validation from the first output is reused explicitly. Strict types and the
22-case JSDOM check pass on the final source. No timing was collected before
the type fix.

After collection, the tools/source were formatted and all three apps rebuilt.
JS/HTML hashes stayed identical. The measured and formatted source snapshots
and `format-equivalence.json` are preserved separately; no scores were
recollected for a formatting-only change. See
[results](../../docs/benchmark/C4_LIST_BOUNDARY_RESULTS.md) and the
[evidence manifest](../../docs/benchmark/c4-list-boundary-evidence-manifest.json).

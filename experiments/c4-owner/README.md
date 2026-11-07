# C4 P2 owner integration

This preserves the first C4 proof and implements DESIGN DC-26-C4-P2 separately.
It adds one `View` component per list, nested/component-root VDOM handling,
automatic notification through `edit`, lifecycle batch separation, mounted
owner cleanup and explicit fault/retry rules. No default core, public export,
concurrent source or size guard is changed.

```tsx
type Item = { id: number; label: string };
const list = createListBoundary<Item>(
  item => item.id,
  item => <li key={item.id}>{item.label}</li>
);
const List = list.View;
// Inside a stable parent component:
// return () => <ul><List /></ul>;
list.set([{ id: 1, label: 'initial' }]);
list.edit(1, item => {
  item.label = 'edited';
});
```

Keys are unique immutable strings or non-NaN numbers; keyOf and view are pure.
edit callbacks are synchronous (perform async work before calling edit).
External mutations still
require `invalidate(keys)`. The controller copies structural arrays but shares
item objects; `edit` is not a transaction and does not roll back a throwing
callback or key mutation. Structure changes use the full normal keyed path.
Stable-item flushes look up k slots, evaluate k views and sort them by index
in O(k log k) to preserve left-to-right content callbacks.

Only one owner may be active per controller. Ordinary parent renew with the
same owner identity/position keeps the content and does not revisit items.
Unmount releases the session/content and preserves desired items for a later
mount. `dispose()` is idempotent and permanently releases controller data;
it does not itself remove the mounted DOM. Caller-held caches are outside
the controller's ownership. A subtree replacement that initializes a new
owner before cleaning up the previous owner is rejected: use separate
unmount/remount commits. Concurrent, SSR/HMR and general owner cloning are not
supported by this experiment.

Pure views may not write back into the controller. Lifecycle notifications
are retained for the next batch. View failures can be retried explicitly;
initial view failure releases its incomplete owner. Diff/DOM failures enter
a fault state that skips already queued work until unmount/remount. General
transactional DOM rollback is not promised.

**Known baseline limitation BUG-3:** a portal nested inside an ordinary
element can retain its target content after that element is removed. This
was reproduced both with C4 and an unchanged normal base component; the
diagnostic records the existing observation, not a portal-teardown pass.

```sh
node experiments/c4-owner/check.mjs /tmp/c4-owner-check.json
node experiments/c4-owner/prepare.mjs /tmp/c4-owner-proof
# Strict types: use the recorded staging tsconfig (see archived actual run).
node experiments/c4-owner/measure.mjs /tmp/c4-owner-proof gate
node experiments/c4-owner/browser.mjs /tmp/c4-owner-proof
node experiments/c4-owner/measure.mjs /tmp/c4-owner-proof collection
node experiments/c4-owner/analyze.mjs /tmp/c4-owner-proof
python3 experiments/c4-owner/audit.py /tmp/c4-owner-proof
node experiments/c4-owner/report.mjs /tmp/c4-owner-proof
python3 experiments/c4-owner/preserve.py /tmp/c4-owner-proof
```

Preparation reuses frozen runner/app inputs and verified Preact11 dependencies
from `/private/tmp/lithent-dc25-20261027` and rebuilds the peer in new staging.
Restore the earlier evidence/dependencies if that directory has expired.
Each proof requires a fresh output. The actual final run is
`/private/tmp/lithent-c4-owner-20261029-v2`; the suffix-free directory preserves
the source before the final diagnostic type/initial-failure fixes. No timing
was collected before those fixes.

The same original A cache/view is used by baseline and C4. The benchmark
delivers explicit selection/update keys through `set/invalidate` to keep
that comparison aligned with P1; `edit` is covered by general-contract tests
and the Chrome fixture, not separately timed by this app. Both Lithent apps
bundle the same source core with Vite5.4.8. Preact class11 is rebuilt from
the preserved source and lock, with all installed package versions checked.
CPU collection is three apps x two orders x145 =870 samples, official memory
is three apps x two orders x five x3 =90 samples. No historical samples are
pooled. Do not run build/test/diagnostic browsers during collection.

After the primary collection, `trace-gaps.mjs` analyzes its 150 selection
traces offline. `fault-probe.mjs` checks a multi-root replacement failure.
`class-pilot.mjs` prepares a separate undefined/empty-class app comparison,
checks real DOM/keyed/nine actions, then collects only selection (100 samples).
`diagnostics.mjs` summarizes those results separately. The class pilot was
not adopted: its total-time direction reversed between rounds. It is not
pooled into the main CPU/memory/peer results.

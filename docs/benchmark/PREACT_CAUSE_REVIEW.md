# Preact comparison: rendering-cost hypotheses

Initial review, 2026-10-23. Scope: check the user's five proposed causes against baseline Lithent,
prior experiments and the pinned Preact 11.0.0 primary source. This is a source and
evidence review. The later DC-18 experiment is reported separately in
[WDom layout results](./NODE_SHAPE_RESULTS.md).

There is no evidence that closure-based components inherently prevent Lithent
from reaching Preact's performance. There is also no general proof that avoiding
hook bookkeeping makes Lithent inherently faster: total work includes VDOM
creation, matching, wrappers, DOM updates, lifecycle, GC, layout and paint.
Current results vary by benchmark and peer; see the fixed-peer
[baseline](./PEER_BASELINE_RESULTS.md). Neither universal architectural superiority
nor an unavoidable limit follows from those observations.

## 1. Object shapes and inline caches

Preact's [11.0.0 createVNode factory](https://github.com/preactjs/preact/blob/11.0.0/src/create-element.js#L76-L98)
uses a shared allocation site and predeclared fields. Its source explicitly
mentions V8 shape detection. Baseline Lithent's node kinds have different
layouts. It already declares `nr` at ordinary construction sites and resets diff
metadata by assignment instead of deletion in [render](../../src/render.ts), but
does not use one full-layout factory for every WDom kind.

Shape stability is a valid hypothesis, but shape differences do not establish
megamorphic inline caches, deoptimizations or a particular slowdown. Adding
properties can follow stable transition chains; see [V8 fast properties](https://v8.dev/blog/fast-properties).
Initializing every unused field also increases per-node storage/initialization.
At the initial review, no dedicated hidden-class/IC/deopt attribution or uniform-factory A/B had
been completed. Heap object classification from previous C3 diagnostics is not
an IC/deoptimization measurement.

## 2. Component wrappers, normalization and arrays

These are already explicit concerns. Lithent creates a stable Fragment wrapper
for component output in [wDom](../../src/wDom.ts); child normalization and diff
produce arrays. Existing reports include [allocation deferral](./ORDERED_CORE_RESULTS.md),
[parent-position searches](./PARENT_POSITION_RESULTS.md),
[C3 memo retention/cost](./PARENT_MEMO_HEAP_RESULTS.md) and the current
[C2 proof transfer](./KEYED_PLACEMENT_RESULTS.md). These candidates have different
scopes and tradeoffs; they were not all adopted.

The claim that Preact 11 completely removed internal component instances is
incorrect: [diff/index.js](https://github.com/preactjs/preact/blob/11.0.0/src/diff/index.js#L125-L151)
reuses `oldVNode._component` or constructs a class/BaseComponent instance.
Preact also normalizes into a new children array in
[children.js](https://github.com/preactjs/preact/blob/11.0.0/src/diff/children.js#L152-L218).
Pointer copying alone is not its complete rendering process.

Replacing all array methods with `for` is not a validated plan. `forEach` itself
does not allocate a result array, while some `map` output is the required new
children tree. Preact's [hook implementation](https://github.com/preactjs/preact/blob/11.0.0/hooks/src/index.js)
also uses array methods. A targeted loop can remove callback/context costs, but
work and allocations must be counted and total CPU/GC measured separately.

## 3. Event proxies

Preact's [event implementation](https://github.com/preactjs/preact/blob/11.0.0/src/diff/props.js#L66-L91)
stores handlers on the element and uses stable per-element proxy listeners.
Initial attachment still calls `addEventListener` on each relevant element/event;
this is not one root listener through delegation. Replacing an existing handler
can update the stored reference without removing/readding the proxy.

Lithent currently removes/readds when a handler identity changes, but skips equal
references in `updateProps`/`updateEvent`. The exact archived original benchmark
creates row handlers once in `makeRow`. Therefore proxying could benefit apps
that regenerate handlers, but the current selection/partial-update gap cannot be
attributed to repeated handler registration without measurements; those row
handlers are stable. No dedicated stable-proxy candidate is implemented or timed.
Initial mount, update and changed-handler workloads need separate comparisons.

## 4. Keyed fast paths and LIS

Lithent already calls `getLisPositions` only when `ordered` is false. Same-order
selection/partial updates pay Map and preparation-array/visit costs, not a full
LIS computation. Allocation deferral and Map-delete removal have already been
measured separately; see [ordered](./ORDERED_CORE_RESULTS.md) and
[key matching](./KEYMATCH_CORE_RESULTS.md). Stable total benefits were not found.

The current C2 experiment removes four preparation arrays and 1,000 index-analysis
visits for select/partial in the archived app, while Map/key reads, actual content
visits and cleanup remain. Its final candidate is **4,952 / 4,800B br** and
was deferred under the size policy at that time; official CPU/memory are unmeasured. This result establishes
neither a speedup nor a slowdown. The 4,800B gate is a size policy, not a speed limit.

Preact 11.0.0 itself uses a `moved` guard and LIS for actual reorderings in
[children.js](https://github.com/preactjs/preact/blob/11.0.0/src/diff/children.js#L270-L335).
Its matching first checks an expected position and searches around it on a miss.
It is not adequately described as universally using two head/tail loops instead
of LIS. Blanket fast skips must preserve duplicate/falsy/mixed keys, observable
key-read/callback order, component identity and Fragment/portal behavior.

## 5. Fragment anchors and parent/slot lookup

These searches exist and are identified in the canonical design. The C1 candidate
measured parent-position lookup, not a complete Fragment-anchor rewrite. Its
large repeated self-update scenarios improved, but the original Table-only app
had little weighted total change and the candidate exceeded size. Slot and
Fragment-anchor costs remain separately scoped. The measured original app has a
small component count, so per-row component-wrapper/search costs cannot explain
its entire gap. See [C1 applicability](./PARENT_POSITION_RESULTS.md) and
[structural counts](./STRUCTURAL_BASELINE_RESULTS.md).

## Interpretation and follow-up scope

The most directly observed work at the initial review was whole-list cache/matching/render
processing during small changes. The separate fixed-peer diagnostic also found
VDOM creation, key matching, index preparation and text update sites; source
samples do not establish exact cost shares. Object-shape deoptimization and event
registration were hypotheses for dedicated attribution, not established
primary causes.

Further comparisons should isolate one proposed change, preserve the same app
and build, record actual removed and added work, and then compare total CPU,
memory, size and all actions if the candidate reaches those gates. No event-proxy,
all-loops conversion or API redesign was selected by this source review. The C2
prototype remains preserved and unadopted. The user's later instruction permits
evaluating a modest size excess together with actual CPU and memory; 4,800B is a
reference and does not automatically stop those measurements.

## DC-18 measured follow-up, 2026-10-24

The [layout experiment](./NODE_SHAPE_RESULTS.md) now diagnoses the archived app
and compares shared-factory candidates against fresh baselines. The selected
13-common-field factory is applied: weighted total time −5.89%, JS −14.42%,
10,000-row memory +2.47%, UMD Brotli +26B (4,824B). The all-fields candidate has
a much larger memory cost (+14.95%) and remains an unadopted alternative. These
separate trials do not prove a universal architectural ranking.

The unchanged cached app has zero click-listener adds/removes during the probed
selection/partial updates. Layout stabilization reduces observed raw `N` IC and
wrong-map deoptimization records, while original live nodes already have fast
properties. Those diagnostics are separate from actual timing and do not assign
a cost share to the whole Lithent/Preact difference. Full peer target validation,
event-proxy workloads and the other scoped candidates remain separate work.

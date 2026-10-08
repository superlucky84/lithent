# lithent-concurrent

An **interface-compatible alternative build** of `lithent`. On screens that deal with large lists,
it shortens the time **a heavy render blocks input as a whole**.

The base runtime `src/` changes by **exactly one bug fix** in this release (a late redraw of a removed component used to bring it back into the DOM, `lithent 1.22.1`). No new features go into it. Both builds come from the same repo with the same core interface, and consumers pick one with a bundler alias. The store write notification in the shared helper and the JSX keyed-list fix ship in `lithent 1.22.1`, so install it alongside.

> **About the name.** This package makes the **build phase** of a render interruptible.
> We do not call it `concurrent mode` — that term is React's proper noun for a specific bundle
> of features (transitions + Suspense + `useDeferredValue` + selective hydration), and that
> bundle is not here. What is here is only the renderer property underneath it.

## When it pays off — and when it doesn't

Two things were measured separately: real browser (headless Chromium), the **built bundles** of
both cores, medians. Results vary by device and workload.

**① Input latency** — 2026-10-02. On a screen where the whole list changes on every keystroke,
12 characters were typed 90 ms apart, and the time from the input event to the next paint (p50)
was measured (median of 5 runs). Base used `renew()`; concurrent put the input and the list in
**different components** and wrapped only the list in `deferRender`.

| Rows   | base sync | concurrent sync | concurrent `deferRender` |
| ------ | --------: | --------------: | -----------------------: |
| 1,000  |     39 ms |           38 ms |                    21 ms |
| 5,000  |    143 ms |          146 ms |                **25 ms** |
| 10,000 |    275 ms |          284 ms |                **35 ms** |
| 20,000 |    515 ms |          560 ms |                **46 ms** |

Input is no longer blocked by the list build. However, **the commit cannot be split** (RC-10).
When a deferred build finishes and commits, it blocks for as long as that list size takes
(20,000 rows: p95 444 ms, longest block 325 ms), and for a single update the longest block is
the same as base. The gain comes from the build being sliced between inputs, and from
consecutive keystrokes replacing the previous build.

**② Throughput** — same day, median of 11 synchronous updates, concurrent / base. Create
(0.96–1.10) and clear (0.91–1.05) are effectively equal; **update is 1.02–1.36x** (depending on
row count and update range). Measurements with `bench10k` in jsdom show the same trend (create
0.98, update every 10th row 1.01, swap two rows 1.17, append 1,000 rows 1.19, clear 0.99).

**Bottom line.** Use this build for **screens where input gets blocked by rendering a large
list** (thousands of rows or more). At 1,000 rows or fewer both fit in a frame and the
difference is small. The input and the heavy list must live in **different components**; in the
same component it has no effect. Interruption **splits work, it does not speed it up**, so total
time does not go down, and the synchronous update path is slightly slower than base (②). If you
are sprinkling a few interactive components onto an SSR page, use the base `lithent`.

The input-latency gain above (515 → 46 ms at 20,000 rows) comes from the 2026-10-02
measurement. The earlier 2026-09-02 work-unit measurement (74% of a fresh 10,000-row mount and
about 50% of an update are interruptible) only shows how much of the build _can_ be paused; that
ratio alone does not predict input latency.

## Usage

```bash
npm install lithent@^1.22.1 lithent-concurrent@^0.1.0
```

Swap only the core in your bundler. **Match exactly `lithent` with a regex** — a prefix match
also breaks subpaths such as `lithent/jsx-dev-runtime`.

```js
// vite.config.js
export default {
  resolve: {
    alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
  },
};
```

```js
// webpack
resolve: {
  alias: {
    lithent$: 'lithent-concurrent',
  }
}
```

**Leave subpaths** such as `lithent/helper` and `lithent/jsx-runtime` **as they are.** Only the
core is replaced.

Import the new APIs directly from `lithent-concurrent` so TypeScript finds their type
declarations. The alias above decides the runtime for existing `lithent` imports; for SSR, apply
the same setting on both server and client.

> **If your build keeps `lithent` external, alias to the package name, not a file path.**
> In setups that do not bundle the core — library builds, or the SSR boilerplate — the alias
> replacement **ends up verbatim in the final import statement.** A file path works on the
> server (node) but the browser cannot fetch it. Use a **package name** such as
> `replacement: 'lithent-concurrent'`, and make sure that package is actually installed.

## Added APIs

Every export of the base core is still there; the following are added.

### `deferRender(scope)`

Sends updates triggered inside `scope` to the **low-priority lane**.

```js
import { deferRender } from 'lithent-concurrent';

input.oninput = e => {
  query = e.target.value; // urgent: the input updates immediately
  renewInput();
  deferRender(() => {
    // heavy: defer it
    rows = filter(query);
    renewList();
  });
};
```

**`scope` runs synchronously, right now.** Only the **renders** it triggers are deferred.

> **This is not React's `startTransition`.** That name implies both (1) transition semantics,
> where the previous state stays visible until the new UI is ready, and (2) a reactive
> `isPending`. **Neither exists here.** State lives in component closures and setters change it
> in place, so if the same component also renders at urgent priority in the meantime, the new
> value shows up immediately. That is why it is named `deferRender`.

### ⚠ Urgent and deferred work must live in **different components**

This is the most common pitfall with this API. If both are in the same component,
**deferring has no effect.**

```jsx
// ✗ No effect — query and rows are in the same component
const App = mount(renew => {
  const query = state('', renew);
  const rows = state([], renew);

  const type = e => {
    query.value = e.target.value;                    // an urgent render is queued
    deferRender(() => { rows.value = heavy(); });    // the deferred update is absorbed into that queue
  };                                                 // → the urgent render draws the new rows as-is
  ...
});
```

```jsx
// ✓ Split out the heavy part
const HeavyList = mount(renew => {
  /* owns rows */
});
const Filter = mount(renew => {
  /* owns query, updates only HeavyList via deferRender */
});
```

`deferRender` defers only the **render**. Values are written in place, so the moment the same
component renders at urgent priority, the deferred value appears on screen too.
The app in `lithentConcurrent/consumer/` shows exactly this shape — it originally put everything
in one component and was caught by its own self-check.

### `whenIdle(): Promise<void>`

Resolves when the low-priority lane is empty. `await nextTick()` only guarantees the
**synchronous commit** (BC-4) — use this to wait for deferred renders as well.

### `hasPending(compKey, lane?)`

Whether the component is waiting in a lane. A low-level query.

### `lithent-concurrent/helper`

Helpers that only make sense with lanes. Keep using existing public helpers from `lithent/helper`.
In `lithent 1.22.1`, `store` and `lstore` notify the concurrent core of writes and are no-ops on
the base core.

```js
import {
  deferred,
  ldeferred,
  hasPendingRender,
} from 'lithent-concurrent/helper';
```

- `deferred(value, renew)` / `ldeferred(value)` — a `state` / `lstate` that renders at low priority
- `hasPendingRender()` — whether this component has a deferred render waiting

> **`hasPendingRender` is a query, not reactive.** Reading `.value` alone does not trigger a
> re-render. Put the pending indicator in a **parent or sibling that renders synchronously**,
> and defer only the heavy part with `deferred`.

## What it does not do

- **Transition semantics** — there is no guarantee that "the previous value stays visible until
  the new UI is ready". State lives in closures, so per-lane copies are impossible; this is a
  permanent property.
- **Suspense / `use()`** — throwing a Promise during render and unwinding is a **non-goal**.
  It fundamentally conflicts with the closure state model (JS cannot resume a function that
  exited via throw).
- **Interrupting the commit** — the commit is atomic. Stopping midway would show a half-updated
  screen. React's commit is synchronous too.

## Compatibility

These are the observable differences when switching from the base core to this build.
All are **minor** and listed below (DC-8).

### BC-1 — `mountCallback` flushes at a single commit boundary

It runs **once after the commit finishes**, not at each DOM insertion point.

- **Changed**: when several siblings mount in one update, the DOM seen by an earlier sibling's
  `mountCallback` goes from _half-built_ → **the completed commit state**. The interleaving
  order between `mountCallback` and `updateCallback`.
- **Unchanged**: relative order among `mountCallback`s, relative order among `updateCallback`s,
  everything on the unmount side, `mountReadyCallback`, and the **resulting DOM**.

The reference order is as follows (three levels of nesting, **identical on both cores** — measured):

| Phase                                  | Direction                          |
| -------------------------------------- | ---------------------------------- |
| Mount                                  | child → parent                     |
| Update — `updateCallback` body         | parent → child                     |
| Update — `updateCallback` return value | child → parent                     |
| Unmount — `mountCallback` return value | **parent → child** (same as React) |

> **The return value of `updateCallback` is not a cleanup.** It is registered anew on every
> update and runs **at the end of that update's commit** — a different thing from React's
> `useEffect` return value, which "cleans up before the next run". If you need cleanup, use the
> return value of `mountCallback`, or call it yourself at the top of the body as `effect()` in
> `lithent/helper` does.
>
> Unmounting **parent → child** also bites in practice — a parent's cleanup must assume its
> children have not been cleaned up yet. If a parent closes a shared resource first, the child
> cleanups that run afterwards will touch it.

### BC-2 — The mounter contract (reserved, not triggered today)

The contract widens from "the mounter runs exactly once" to **"only committed mounters count;
there may be several attempts"**.

**This relaxation does not trigger today.** The scheduler never discards a build that mounts,
so the mounter body runs exactly once per committed component. The contract is widened because
that guarantee now rests on scheduler policy rather than on structure.

Only **side effects run directly in the mounter body** are affected. `mountCallback` runs only
at commit, so it is safe now and in the future — side effects belong in `mountCallback` anyway.

### BC-3 — Low-priority renders flush in idle tasks

The default priority is still a microtask. If you do not use `deferRender`, nothing changes.

### BC-4 — The `nextTick()` guarantee is limited to the sync lane

`await nextTick()` guarantees only the **synchronous commit**. To wait for deferred renders to
finish, use `whenIdle()`. The meaning of `nextTick` itself is unchanged (DC-9).

## Size

| Build                |  brotli |
| -------------------- | ------: |
| `lithent` (base)     | 4,758 B |
| `lithent-concurrent` | 6,385 B |

## Further reading

Design rationale, measurements, and decision records live in the repo under
`docs/concurrent-rendering/` —
`REQUIREMENTS.md` → `DESIGN.md` → `IMPLEMENT.md` → `MANUAL_TEST_CHECKLIST.md`.

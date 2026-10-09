# Release notes

## Unreleased

- Fix CommonJS entry points in `lithent`, its subpaths, and
  `lithent-concurrent` by emitting dedicated `.cjs` bundles and using them for
  `main` and `exports.require`. Existing ESM and browser UMD paths are kept.
- Verify all 11 public import and require paths against installed release
  tarballs, including export parity and CommonJS JSX/helper/SSR integration.
- Emit separate CommonJS declarations and select types by import/require mode.
  Verify native Node16/NodeNext ESM and CommonJS TypeScript consumers, including
  declaration dependencies and CommonJS JSX, without skipping library checks.

## 2026-10-08

### lithent 1.24.0

A minor release because one documented behavior changes: removed DOM no longer
has its handlers detached one by one. No API is added or removed.

- **Changed:** handlers passed as props are left on DOM that is being removed
  and go away with it, both for nodes removed by a render and for `render()`'s
  destroy function. Unmount cleanups and DOM removal are unchanged. If you keep
  a reference to a removed node, its handlers can still be called, and an event
  that is already bubbling when the tree is destroyed reaches the handlers of
  removed ancestors. Handlers set on a portal target are still detached, since
  that element outlives the render.
- Cut the fixed cost of updates and removals. Removing a list of components no
  longer counts the parent's children once per component, internal diff fields
  are assigned instead of deleted, component props are synced in place, the
  redraw action is bound once per component, and newly added nodes skip the
  type comparison. Measurements are in `docs/benchmark/`.
- Component props are updated in place: only keys that are gone are deleted.
  A key that stays keeps its position, so `Object.keys(props)` no longer
  follows the parent's key order when the parent reorders the same keys.
- Fix the previous render's VDOM being kept alive through parent links. Keeping
  1,000 rows and updating part of them 100 times left 17.8 MB of JS heap after
  GC; it is now 4.0 MB.
- Fix a handler prop that is dropped from a node that stays: its listener was
  left attached.
- Fix a props object reused across renders being emptied. lithent no longer
  edits the previous props object.
- Fix `cacheUpdate` ignoring a change in the number of dependencies. A shorter
  or longer dependency array now invalidates the cache.
- Fix `renderToString` writing attribute values unescaped. `&`, `<`, `>` and
  `"` are escaped, including in `style`, and a prop whose name is not a valid
  attribute name is not written. A value that was escaped by hand before being
  passed is now escaped twice; pass the raw value.
- The UMD build mangles local names to stay inside the size budget; the ESM
  build is unchanged. Brotli 4,758 B (-34 B vs 1.23.0).

`lithent/helper` and `lithent/ssr` ship inside this package; the `cacheUpdate`
and `renderToString` fixes are not separate npm releases.

### lithent-concurrent 0.1.3

- **Changed:** the same handler policy as the base core. Removed DOM keeps its
  handlers until it is discarded; handlers on a portal target are detached.
- The same update and removal work as the base core, except the redraw binding,
  which stays per render to fit the scheduler.
- Fix the same VDOM retention through parent links, the same handler left on a
  node that stays, and the same emptied props object.
- Fix a low-priority build writing to a portal target before its commit. A new
  subtree that contains a portal now creates its DOM at commit, so an
  interrupted or retried build no longer adds content or handlers to the
  target.
- Brotli 6,385 B (+97 B vs 0.1.2). Still works with `lithent ^1.22.1`.

## 2026-10-06

### lithent 1.23.0

- Add the `lithent/element` subpath: `defineElement(name, component, options)`
  registers a `mount` or `lmount` component as a standard Custom Element, so it
  can be embedded in any page with a script and a tag. UMD global
  `lithentElement`; 998 B brotli on top of the core.
- Declared props (`String`, `Number`, `Boolean`, `Object`) are observed as
  kebab-case attributes with conversion and exposed as properties without it.
  Changes in one task render once; values assigned before the element is
  defined are kept.
- Renders into an open shadow root by default (`'closed'` or `false` for light
  DOM). `styles` are shared by every instance through one adopted style sheet,
  with a `<style>` fallback. Slots project the element's children.
- The component receives the element as `props.host`; `emit(host, name,
  detail, init?)` dispatches a `CustomEvent` that bubbles, is composed and is
  cancelable unless `init` says otherwise.
- Moving an element keeps its state; removing it unmounts after a microtask.
  `defineElement` returns `undefined` without `customElements` (SSR).
- TypeScript infers the component's props from the declaration and rejects
  components that require or mistype them.
- Fix `render()`'s destroy function skipping unmount callbacks. It ran them
  only when the root component had re-rendered at least once, so a fresh
  component root, or components rendered under an element root, never saw the
  cleanup returned from `mountCallback`. It now runs unmount for the whole
  removed tree, once per component. Found while building `lithent/element`.
- Fix props on a custom element that was rendered before its definition. The
  property-or-attribute decision was cached per tag name, so after the upgrade
  lithent kept setting attributes: objects arrived as `"[object Object]"` and
  `false` as a present (true) attribute. The decision is now cached per
  prototype, so renders after the upgrade assign properties. Built-in elements
  and elements defined before rendering behave as before.
- Keep the real value of every prop on a custom element that is not upgraded
  yet, as an own property next to the attribute, for keys `HTMLElement` does
  not have (so `textContent` or `offsetWidth` never run a DOM setter). The
  element takes it over
  when it is defined, so a parent that renders the same values again after the
  upgrade no longer leaves an object as `"[object Object]"` or `false` as
  true.
- Unset a custom element property when the parent stops passing the prop.
  Removing a prop only removed the attribute, so a value passed as a property
  stayed on the element. lithent now assigns `undefined` through the upgraded
  element's own accessor, or deletes the kept value before the upgrade. Built-in elements behave as before.

These four fixes are the only changes to the base core; `lithent` grows by
53 B net (brotli 4,792 B).

`lithent/element` ships inside this package; its private workspace version is
0.1.0. It works with both cores and is covered by unit tests on both and by
browser tests in a plain page, next to a host app on another lithent copy, and
inside React 18.

### lithent-concurrent 0.1.2

- Fix the same `render()` destroy bug in the concurrent core: unmount callbacks
  now run for the whole removed tree.
- Fix the same stale property-or-attribute decision for custom elements
  rendered before their definition, and the same two boundaries: values are
  kept as own properties until the upgrade, and removed props unset the
  property.
- Brotli 6,288 B (+55 B vs 0.1.1). Still works with `lithent ^1.22.1`; use
  `lithent ^1.23.0` for `lithent/element`.

## 2026-10-02

### lithent-concurrent 0.1.1

- Rewrite the package README in English. No code changes.

### lithent 1.22.1

- Preserve dynamic JSX arrays as keyed lists in `jsx`, `jsxs` and `jsxDEV`.
  Adding, removing or reordering rows now preserves the state and DOM of
  existing keys, including after hydration.
- Fix a removed component being drawn back into the DOM. A redraw queued for a
  component earlier in the same tick (for example a `useContext` consumer or a
  `renew` call) ran after the component's removal and re-inserted its old row.
  Removed components are now marked retired so such redraws are skipped. This is
  the only change to the base core; `lithent` grows by 5 B (brotli 4,739 B).
- Notify a concurrent core when `store` or `lstore` writes occur. The base
  core keeps its existing store behavior and public API.
- Add browser regression coverage for both built cores, hydration, HMR,
  examples and docs, with five negative controls.

`lithent/helper` and `lithent/jsx-runtime` ship inside this package. Their private
workspace versions are 0.21.1; they are not separate npm releases.

### lithent-concurrent 0.1.0 — initial package

- Add `deferRender`, `whenIdle` and the low-level `hasPending` query.
- Ship `deferred`, `ldeferred` and `hasPendingRender` through
  `lithent-concurrent/helper`; its private workspace version is also 0.1.0.
- Interrupt and resume low-priority build work. DOM commits remain synchronous.
- Flush mount callbacks after the complete commit. Relative callback order,
  unmount cleanup order and final DOM remain compatible with the base core.
- Finish a parked low-priority build before an urgent render of a component
  inside it, and aim that render at the node the commit installed instead of
  dropping it (a consumer could keep the old context value).
- Fix a `deferRender` raised while an earlier low-priority build of the same
  component was in flight being dropped, which left the older value on screen
  with nothing pending. Found by the real-browser input measurement.
- Do not finish a parked low-priority build when an unrelated component (not an
  ancestor or descendant) renders urgently. Typing in an input next to a heavy
  list no longer runs the rest of that list's build inside each keystroke.
- Keep state writes immediate. Pending queries do not schedule renders;
  `nextTick` waits for synchronous work and `whenIdle` waits for deferred work.
- Do not provide Suspense, Promise-based render suspension or state snapshots
  per lane. Builds that mount components or run update callbacks are completed
  rather than discarded.

Requires `lithent ^1.22.1` for the shared JSX runtime and helpers. Alias only the
exact `lithent` core import; keep `lithent/*` subpaths unchanged. See
[`lithentConcurrent/README.md`](./lithentConcurrent/README.md).

### create-lithent 0.3.4

- Update the SPA and SSR templates to require `lithent ^1.22.1`.
  The generator downloads templates from the repository's default branch, so
  this version expects the updated templates to be merged there.
- Remove an unused interval cleanup and obsolete type-error suppressions so
  the generator passes the current TypeScript build.

### Documentation

- Add concurrent-rendering guidance to the AI agent skill (`skills/lithent`:
  new `reference/concurrent.md`, SKILL.md section, constraints) and the agent
  addon, and a section to `MANUAL.md`. Correct the `mountReadyCallback` note:
  it runs right after the WDom is created, before DOM insertion.

- Update the private `lithent-docs` site to 0.6.0, with English/Korean concurrent
  rendering and helper guides, a live demo and related API notes.
- Keep unchanged HMR, MDX, template and other private runtime package versions.

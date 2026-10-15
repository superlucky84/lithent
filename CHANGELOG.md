# Release notes

## 2026-10-15

### lithent 1.25.1

- Unmount a component that is replaced by a fragment with the same number of
  children. The DOM was already correct, but unmount callbacks never ran (#98).
- Insert a fragment or component replaced inside an unkeyed array at its own
  position instead of after the array's last item (#98).
- Remove old items when an unkeyed array becomes keyed, or when a key had
  appeared twice (#98).
- Add structural render matrix and seeded fuzz suites that check every update
  against independently built HTML and the expected mounted instances.

### lithent-concurrent 0.2.1

- Include the three structural render fixes above (#98).
- Insert next to a newly added sibling at the right position. A sibling built
  ahead of the commit was used as the anchor, so the insert fell back to
  appending at the end (#98).

## 2026-10-12

### lithent 1.25.0

- Add nine lifecycle APIs and their types to `lithent/helper`: owner scopes,
  latest tasks, activity scopes, scoped tasks, retained views/hosts, and render
  boundary helpers. Activity work stops on hide; instance work can continue;
  stale task results cannot reach observers (#96).
- Preserve a hidden view's state and DOM. Freezing native child updates with
  `freezeChildren: true` requires `lithent-concurrent ^0.2.0`.
- Fix stateless components rendering twice on first mount and restore the
  parent component's hook context after nested component construction (#95).
- Fix HMR replacement loops, instance cleanup, and parent state preservation
  in `lithent/devHelper`. Use `@lithent/lithent-vite ^0.3.4` for the matching
  transform and bootstrap fixes.
- Add English/Korean lifecycle guides and the retained-editor example.
- Build Custom Element declarations before the documentation site, avoiding
  a parallel-build race that failed fresh CI runs with TS7016.
- Build SSR and the remaining shared runtime declarations before toolchain
  checks, including the template plugin's SSR regression test. Check root
  build manifest changes through the docs deployment workflow as well.

`lithent/helper` and `lithent/devHelper` ship inside this package. Their private
workspace versions are 0.22.0 and 0.21.1; publish only `lithent` for these entries.

### lithent-concurrent 0.2.0

- Add render boundaries that pause native child renews and parent diffs for
  retained views, while keeping the default core's behavior (#96).
- Include the stateless component and hook-context fixes from the base core
  (#95).
- Require `lithent ^1.25.0` for the matching shared helper and development
  helper. Continue to alias only the bare `lithent` import.

### @lithent/hmr-parser 0.2.3 / @lithent/lithent-vite 0.3.4

- Fix stable component proxies, stateless/default/nested component detection,
  direct calls, mixed exports, render disposal, and repeated HMR updates (#95).
- Require `lithent ^1.25.0` in the Vite plugin so generated HMR code uses the
  matching `lithent/devHelper` contract.
- Publish the Vite plugin with the updated HMR and template plugin dependencies.
- Fix the Vite plugin's declaration output path and keep its template option
  type import on the public package entry, so packed TypeScript consumers can
  resolve both declarations.
- Emit explicit relative declaration paths for the HMR/template toolchain,
  so ESM TypeScript consumers can use Node16/NodeNext resolution without
  `skipLibCheck`.

### @lithent/lithent-template-parser 0.1.1 / @lithent/lithent-template-vite 0.1.1

- Preserve JavaScript expressions, directive behavior, generated element
  semantics, and source text while compiling templates (#97).
- Publish the template Vite plugin with the fixed parser dependency.

See [RELEASING.md](./RELEASING.md) for the build, validation, publication order,
and documentation deployment commands.

## 2026-10-09

### lithent 1.24.1

A packaging fix. No runtime code changes; the ESM and UMD bundles are the same
as in 1.24.0.

- Fix `require('lithent')` and `require` of every subpath. The `require` entry
  was a `.js` UMD file inside a `"type": "module"` package, so Node.js read it
  as an ES module. On Node.js 24 the call returned an empty object and
  `mount`, `useRenew` and the rest were `undefined` (#92). Each entry now ships
  a `.cjs` bundle, and `main` and `exports.require` point to it.
- Fix the types a CommonJS TypeScript project gets under `node16`/`nodenext`
  resolution. It resolved the ESM declarations and failed with TS1479 and
  TS1471. Each entry now also ships `.d.cts` declarations, and `exports` picks
  the declarations by `import` or `require`.
- The ESM (`.mjs`) and browser UMD (`.umd.js`) paths are unchanged, including
  the CDN URLs.
- The ESM and CommonJS bundles keep separate module state. Load the core and
  its subpaths (`lithent/helper`, `lithent/ssr`, ...) in the same format; do
  not mix `import` and `require` of lithent in one program.

This applies to `lithent`, `lithent/jsx-runtime`, `lithent/jsx-dev-runtime`,
`lithent/helper`, `lithent/devHelper`, `lithent/ssr`, `lithent/tag`,
`lithent/ftags` and `lithent/element`.

### lithent-concurrent 0.1.4

- Fix `require('lithent-concurrent')` and `require('lithent-concurrent/helper')`
  the same way: `.cjs` bundles for `main` and `exports.require`, and `.d.cts`
  declarations for CommonJS TypeScript projects.
- No runtime code changes. The ESM and UMD bundles are the same as in 0.1.3.
  Still works with `lithent ^1.22.1`.

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

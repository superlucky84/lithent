# Release notes

## Unreleased

### lithent and lithent-concurrent

- Fix `render()`'s destroy function skipping unmount callbacks. It ran them
  only when the root component had re-rendered at least once, so a fresh
  component root, or components rendered under an element root, never saw the
  cleanup returned from `mountCallback`. Both cores now run unmount for the
  whole removed tree, once per component. `lithent` shrinks by 1 B (brotli
  4,738 B), `lithent-concurrent` by 5 B (6,228 B). Found while building
  `lithent/element`.

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

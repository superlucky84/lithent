# Release notes

## Unreleased — release preparation

### lithent 1.22.1

- Preserve dynamic JSX arrays as keyed lists in `jsx`, `jsxs` and `jsxDEV`.
  Adding, removing or reordering rows now preserves the state and DOM of
  existing keys, including after hydration.
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
- Fix a `deferRender` raised while an earlier low-priority build of the same
  component was in flight being dropped, which left the older value on screen
  with nothing pending. Found by the real-browser input measurement.
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
  The generator downloads templates from the repository, so merge the updated
  templates before publishing this version.
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

These are prepared versions. Publishing and site deployment require completing
the remaining release checks in
[`MANUAL_TEST_CHECKLIST.md`](./docs/concurrent-rendering/MANUAL_TEST_CHECKLIST.md).

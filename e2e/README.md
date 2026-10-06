# Browser contract tests

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test:e2e:build
```

After building once, use `pnpm test:e2e`. To run a subset:

```sh
pnpm test:e2e --project=concurrent --grep 'B-4/B-9'
pnpm exec tsc -p e2e/tsconfig.json
pnpm test:e2e:mutations
```

The two projects use the actual built base and concurrent cores. The 22 tests
cover the consumer checks, lifecycle/tearing checks, scheduler contracts,
context/lcontext, portal placement, real server rendering and hydration, keyed
row state and DOM identity, and real Vite boundary replacement. They also
exercise all five examples pages and all 42 English/Korean docs example routes,
including computed, shared store, keyed list, context and portal interactions.
The release documentation checks both languages of the concurrent guides,
their live concurrent demo, language switching, navigation and cleanup.

`element.spec.ts` (lithent/element, not included in the count above) has two
parts. The R-1 check loads two lithent bundles on one page — two base copies in
the base project, a base host with a concurrent widget in the concurrent
project — and checks that they render and update independently; `?second=same`
on its fixture is the single-copy control used when diagnosing a failure. The
UMD suite loads the built `lithentElement.umd.js` into a plain page with no
build step, next to a host app on its own lithent copy, and checks upgrade,
CSS isolation in both directions, the shared adopted style sheet, attributes,
properties, cancelable events, slots and moves. It needs `pnpm build` (or
`pnpm build:element`) first.

Each project starts fixture, examples and docs Vite servers on fixed loopback
ports 43130–43135. Existing servers are never reused. HMR edits an isolated copy
under `.e2e-work`; application sources and built cores are not edited by tests.
The fixture server disables dependency prebundling so core imports share the
same component registry. Examples/docs keep their original JSX/MDX settings.

Unexpected browser exceptions, console errors, failed requests and HTTP errors
fail the test. Retries are disabled. Failures retain screenshots and traces in
`test-results`; view the report with `pnpm exec playwright show-report` or open
a trace with `pnpm exec playwright show-trace <trace.zip>`.

The mutation command injects five isolated faults: wrong core, synchronous
low-priority updates, DOM rebuild instead of hydration, full reload instead of
boundary HMR, and flattened dynamic JSX arrays. It succeeds only if the exact
targeted tests fail with the expected assertions, without skipped tests or
startup errors. JSON reports are saved under `test-results/mutations`.
Mutation flags are confined to these fixtures and the E2E server.

Performance judgments (A-3/B-1) and equivalence to a previous release (A-7)
remain separate from these functional tests. The canonical requirements,
design, implementation status and checklist are in
[`docs/concurrent-rendering`](../docs/concurrent-rendering/MANUAL_TEST_CHECKLIST.md).

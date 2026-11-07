Vite 8 migration checks using the actual production base and concurrent ESM artifacts. The source baseline is `d594983`, built with the original frozen Vite 5 toolchain. Use Node 24.22.1 and pnpm 12.15.0.

`verify-runtime.mjs` compares four isolated browser contexts per artifact, alternating before/after order. It renders 1,000 keyed components, warms up 100 updates, measures 30 updates, verifies a keyed swap and clear, and checks old node/component-key weak references after forced GC. It records live/disposed CDP heap and DOM counters. The timing is a local diagnostic, not the official performance benchmark or a guarantee about startup performance.

Prepare a baseline checkout before installing the new toolchain, build its two cores, then copy its `dist` directories to a scratch directory containing `base/` and `concurrent/`. The original checks used `/tmp/lithent-vite8/baseline`. The checks never modify that baseline.

After building this branch:

```sh
pnpm install --frozen-lockfile
pnpm build
node experiments/vite8-migration/verify-runtime.mjs /tmp/lithent-vite8/baseline /tmp/lithent-vite8/runtime.json
LITHENT_RUNTIME_WARMUP=5 node experiments/vite8-migration/verify-runtime.mjs /tmp/lithent-vite8/baseline /tmp/lithent-vite8/runtime-cold.json
node experiments/vite8-migration/verify-template.mjs
```

Use an idle machine for timing. The short warmup is deliberately recorded separately: JIT and scheduler startup changed the result substantially in the original checks. Do not combine those measurements with the warmed measurements. An optional fourth positional argument to the runtime script selects a JSON object mapping variant names to ESM artifact paths.

Both scripts use `/usr/bin/chromium` by default; set `LITHENT_CHROME` to select another installed browser. The regular Playwright and mutation suites accept the same environment variable, and otherwise retain Playwright's normal browser selection.

The template check creates isolated fixtures under `.e2e-work/vite8-template`, using the built Lithent Vite plugin with templates enabled. It combines automatic JSX in a normal TSX entry with a typed, extensionless `.ltsx` import, executes `l-if`/`l-for` in both development and production, requires successful dependency prebundling, and checks production source-map sources. A dependency scan warning is a failure even when Vite can recover by serving unoptimized modules. It recreates its own optimizer cache for each run.

These tools supplement `pnpm test:dual`, the dedicated template plugin tests, the complete E2E suite, artifact/package verification and size gates. They do not replace those checks. Build output and raw logs stay outside tracked source; the migration report retains summarized measurements and hashes.

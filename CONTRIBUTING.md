# Contributing

How branches, releases and benchmark evidence are handled in this repository.

## Branches

- `main` is the only long-lived branch. Every other branch is short-lived.
- One experiment or change is one branch from the latest `main`: `perf/<topic>`,
  `fix/<topic>`, `feat/<topic>`, `docs/<topic>`. Start the next experiment from
  `main` again instead of stacking it on the previous branch.
- When the work is finished, adopted or not, open a PR to `main` and merge it.
  Code that was not adopted stays under `experiments/`; only adopted changes go
  into `src/` and `lithentConcurrent/src/`, so merging an experiment never ships
  it.
- Merge with a merge commit, not squash or rebase: result documents cite commit
  SHAs, which must stay valid on `main`.
- Delete the branch, locally and on `origin`, once it is merged.

## Pull request checks

[Validate](./.github/workflows/ci.yml) runs on pull requests and pushes to `main`.
It builds the workspace, runs both cores and satellites plus all five toolchain
suites, checks CI failure fixtures, verifies eight packed packages with isolated
runtime/type consumers, checks size budgets, and runs Chromium, Firefox and WebKit
E2E in separate jobs against the same validated build. Logs, reports and failure
traces are retained for seven days.
Validated release bundles and publication receipts/records are retained for 30 days.
It also previews selective npm candidates and installs each candidate with its
selected archives and published dependencies. PR jobs have read-only permissions.
Quality also runs isolated mutation controls: normal baselines must pass, then
deliberately removed cleanup and release safeguards must fail their intended
assertions. Setup errors, killed workers, changed collection and skipped tests
do not count as detection. Reports and logs are retained for seven days.
Repository administrators must require the stable **CI** check in branch protection
or a ruleset; committing the workflow alone does not enable that setting.

Use the Node/pnpm versions in `.nvmrc` and `package.json`, then run:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test:dual
pnpm test:toolchain
pnpm test:ci
node scripts/check-reliability-mutations.mjs
pnpm verify:concurrent
pnpm verify:release
pnpm size
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:e2e
LITHENT_E2E_BROWSER=firefox pnpm test:e2e
LITHENT_E2E_BROWSER=webkit pnpm test:e2e
```

`verify:release --output-dir artifacts/release` retains validated archives and
their SHA/integrity/source manifest for CI. The output directory must be empty.
Its isolated consumer installs external dependencies from the public registry;
all eight internal packages resolve to the local archives. Nothing is published.
To inspect the selective release plan from a clean checkout, retain the archives
and run:

```sh
pnpm verify:release --output-dir artifacts/release
pnpm release:plan
node scripts/verify-plan-consumers.mjs
```

The output directory must be empty before packing. During local development,
`pnpm release:plan --allow-dirty` and
`node scripts/verify-plan-consumers.mjs --allow-dirty` permit explicitly marked
dirty previews; these results cannot authorize publication. The plan, consumer
proof and tarball manifest are saved under `artifacts/` and bound to the build
bundle. Candidates use local archives only for selected internal dependencies;
unselected dependencies resolve to published registry versions. Source ownership
warnings prompt a version review without automatically bumping any package.

The mutation runner copies participating sources to a temporary directory and
links the existing dependencies. It does not edit the working tree or publish
packages. JSON results and worker logs are written to `artifacts/hardening/`;
the temporary source sandbox is not included in the uploaded evidence.

The default browser is Chromium. Only `chromium`, `firefox` and `webkit` are
accepted; an empty or unknown selection fails. Each engine keeps the `base` and
`concurrent` projects, with its engine/version recorded in the reports.
WebKit automation and actual Safari/OS IME checks are recorded separately in
[docs/reliability](./docs/reliability/IMPLEMENT.md).

## Releases

Selective npm publishing is maintained in
[docs/reliability](./docs/reliability/REQUIREMENTS.md). A maintainer starts a
release by running the Validate workflow manually on main. After Quality, all
three browsers and the final CI gate succeed in that run, the workflow publishes
only versioned candidates using the exact validated archives and npm OIDC. It
records confirmed successes even when another package fails, then tags the
publication SHA and explicitly dispatches root release documentation. GitHub
Releases are not created automatically. Merging to main runs the same validation
without publishing.

Repository administrators and package owners must complete the main/environment
protection and npm Trusted Publisher settings in [RELEASING.md](./RELEASING.md),
then set the repository variable `NPM_PUBLISH_ENABLED=true`. These external
settings have not been applied by this work. Until enabled, PR/main validation
continues without publishing. No npm packages have been published by this work.

Merging and releasing are separate steps. `main` holds only adopted runtime
changes, so a release can be cut from `main` at any time.

Follow [RELEASING.md](./RELEASING.md): bump each affected independent package's
`package.json`, add a `CHANGELOG.md` entry, build and verify, then merge to main.
After initial activation, merge the version bump, then run Validate manually on
main to publish and record tags. A failed job can be rerun against its original
Quality artifact even when the run attempt changes. Use the original run to
recover release tags and docs; never tag an older publication at a newer main
SHA.

An upload whose registry confirmation fails is retained as `unconfirmed`.
The recording job rechecks the original run/SHA, validated archive identity and
registry integrity before recovering its tag/docs. This also works when the
publisher retry skips the existing version or a new plan has zero candidates.
An unresolved confirmation fails recording; an ordinary skipped version alone
does not authorize a release tag. See [RELEASING.md](./RELEASING.md) for recovery.

## Benchmark evidence

Raw evidence archives (`*.tar.gz`: inputs, bundles, raw samples, traces, tools)
are not committed. They are attached to the
[`benchmark-evidence`](https://github.com/superlucky84/lithent/releases/tag/benchmark-evidence)
GitHub release, which is not a package release.

- Commit the results document, the summary JSON and the manifest, with the
  archive's SHA-256, under `docs/benchmark/`.
- Upload the archive, under a name not used in the release yet. Never replace an
  uploaded archive.

  ```sh
  gh release upload benchmark-evidence docs/benchmark/<name>-evidence.tar.gz
  ```

- Link it by its release URL:
  `https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/<name>-evidence.tar.gz`.
- To re-verify, download it and compare its hash with the manifest:

  ```sh
  gh release download benchmark-evidence -p '<name>-evidence.tar.gz' -D docs/benchmark
  shasum -a 256 docs/benchmark/<name>-evidence.tar.gz
  ```

`docs/benchmark/*.tar.gz` is in `.gitignore`. Archives committed before
2026-10-30 stay tracked in git; leave them as they are.

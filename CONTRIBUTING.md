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

## Releases

Merging and releasing are separate steps. `main` holds only adopted runtime
changes, so a release can be cut from `main` at any time.

1. Check: `pnpm test:dual`, `pnpm test:e2e`, `pnpm verify:concurrent`,
   `pnpm verify:release` and `pnpm size`.
2. Bump the version in `package.json` (and `lithentConcurrent/package.json` when
   the concurrent core changed), and add an entry to `CHANGELOG.md`. Commit it as
   `chore: version up x.y.z`.
3. Publish, then tag `lithent@x.y.z` (and `lithent-concurrent@x.y.z`) and create
   the GitHub releases. Pushing a `lithent@*` tag redeploys the docs site.

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

# Base core size reduction (2026-11)

Tools behind [docs/bundle-size](../../docs/bundle-size/REQUIREMENTS.md): the
measurements of the base core's size, stage by stage.

Run from the repository root with the project's own dependencies (Node
24.22.1, Vite 8.3.6, Terser 5.18.1). Nothing here writes to `dist`.

## `measure.mjs`

Builds a source directory with the options of `vite.config.js` (without type
checking and declarations) into a directory of its own and prints raw, gzip
level 9 and default Brotli sizes of the three formats.

```sh
OUT=/tmp/lithent-core-size

node experiments/core-size/measure.mjs $OUT/now                       # the working tree
node experiments/core-size/measure.mjs $OUT/wrapped src --wrap-func-args  # Terser's default output
node experiments/core-size/measure.mjs $OUT/plain src --no-terser     # without the UMD Terser step
node experiments/core-size/measure.mjs $OUT/hidden src --hidden-map   # no sourceMappingURL comment

# A candidate: a copy of src with changes, the working tree untouched
cp -R src $OUT/candidate-src   # edit the copy
node experiments/core-size/measure.mjs $OUT/candidate $OUT/candidate-src
```

The UMD and CJS files are byte-identical to `pnpm build:core`'s. The ESM file
carries source path comments, so its size depends on where the source
directory is.

Small source changes move Brotli by about ±10B either way and UMD and CJS
often disagree: judge a set of changes by raw, gzip and Brotli together, not
one change by its Brotli number.

## `ast-equal.mjs`

Whether files have the same syntax tree as the first, ignoring positions and
parentheses, and how many functions each has.

```sh
node experiments/core-size/ast-equal.mjs old/lithent.umd.js dist/lithent.umd.js
```

## `h-candidates.patch`

The function merges H-1 to H-6 (DESIGN, DC-3) alone, on top of the small
cleanups S-1 to S-15: `src/diff.ts` and the placement pass in `src/render.ts`.
They are candidates until their speed is checked.

```sh
git apply -R experiments/core-size/h-candidates.patch   # take them out
git apply experiments/core-size/h-candidates.patch      # put them back
```

Taking them out gives the Phase 2 bundle byte for byte (4,812B).

## Measured (base UMD, from `6639195`)

| stage                             |    raw |  gzip | Brotli |
| --------------------------------- | -----: | ----: | -----: |
| `6639195` (1.25.8)                | 12,827 | 5,289 |  4,901 |
| Terser `wrap_func_args: false`    | 12,755 | 5,272 |  4,878 |
| + cleanups S-1 to S-15            | 12,532 | 5,194 |  4,812 |
| + function merges H-1 to H-6      | 12,402 | 5,134 |  4,763 |
| no Terser step, source of 6639195 | 12,756 | 5,273 |  4,880 |

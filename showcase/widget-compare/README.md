# Same widget, four frameworks

The feedback widget from `npx create-lithent my-widget --template widget`,
built with lithent, React, Preact and Lit under the same build settings, plus a
page that compares their size and load time. The page is published at
<https://superlucky84.github.io/lithent/widget-compare/>; the design notes are
in [docs/widget-compare](../../docs/widget-compare/).

| Path                                 | What it is                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/react`, `src/preact`, `src/lit` | The three other versions. The lithent version is the template itself (`createLithent/widget/src`). |
| `src/shared/define-element.ts`       | The Custom Element wrapper the React and Preact versions use.                                      |
| `src/shared/template.ts`             | The props declaration, event types and stylesheet taken from the template.                         |
| `scripts/build.mjs`                  | Builds the four bundles, their host pages, `dist/sizes.json` and the page.                         |
| `scripts/measure.mjs`                | Times each version in Chromium and writes `results.json`.                                          |
| `scripts/page.mjs`                   | Writes `dist/index.html` and `dist/index.ko.html`.                                                 |
| `results.json`                       | The committed measurement.                                                                         |

```sh
pnpm install
pnpm build                                     # the whole workspace, this package included
pnpm --filter lithent-widget-compare measure   # about two minutes; rewrites results.json
pnpm --filter lithent-widget-compare page      # rewrites the page from it
```

`e2e/widget-compare.spec.ts` runs the same browser steps on all four builds, so
a version that stops behaving like the template fails CI. Sizes are measured on
every build; load times only when someone runs `measure`, and the page says so
when the bundles have changed since.

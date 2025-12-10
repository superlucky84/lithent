# @lithent/lithent-mdx

Official Vite plugin that tailors the MDX toolchain for Lithent.

## Features
- **Lithent-focused JSX config**: Sets `jsxImportSource` so MDX JSX renders through the Lithent runtime.
- **Automatic `mount()` wrapping**: Wraps the MDX default export with Lithent `mount()` to preserve state during HMR.
- **Configurable pipeline**: Pass any `@mdx-js/rollup` options via `mdxOptions`.
- **TypeScript ready**: Includes type definitions across the package.

## Installation

```bash
pnpm add -D @lithent/lithent-mdx @mdx-js/rollup
```

Required peer dependencies:
- `lithent` `^1.21.0`
- `vite` `^5.0.0`
- `@lithent/lithent-vite` `^0.2.3` for end-to-end HMR support

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import lithentMdx from '@lithent/lithent-mdx';
import lithentVite from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentMdx({
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    }),
    lithentVite(),
  ],
});
```

With the plugin enabled, `.mdx` files are transformed into Lithent components and wrapped with `mount()`. Adjust `jsxImportSource` if you need a different Lithent entry point (for example `lithent/helper`).

## Development & Testing

```bash
pnpm --filter @lithent/lithent-mdx dev   # Launch MDX playground
pnpm --filter @lithent/lithent-mdx test  # Run Vitest on the transform helpers
```

Open `http://localhost:5173/html/index.html` after starting the dev server to inspect the live MDX example.

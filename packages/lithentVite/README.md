# @lithent/lithent-vite

Official Vite plugin for Lithent with HMR support.

## Overview

`@lithent/lithent-vite` is a Vite plugin that enables Hot Module Replacement (HMR) for Lithent components during development. It automatically injects HMR boundaries around your components, allowing you to see changes instantly without losing component state.

## Features

- **Hot Module Replacement**: Instant updates during development
- **Automatic HMR boundaries**: Auto-wraps mount components
- **Marker support**: Explicit HMR boundary control with comments
- **Type-safe**: Full TypeScript support
- **Zero config**: Works out of the box with sensible defaults
- **MDX support**: Toggle `wrapMdx` to apply Lithent HMR boundaries to MDX routes

## Installation

```bash
npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite
```

**Peer Dependencies:**
- `lithent: ^1.20.1`
- `vite: ^5.0.0`

## Usage

### Basic Setup

Add the plugin to your `vite.config.js` or `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin(),
  ],
});
```

### With Options

```typescript
import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // Include specific file patterns (default: [/\\.([cm]?[tj]sx?)$/])
      include: /\\.tsx?$/,

      // Custom HMR boundary marker (default: '/* lithent:hmr-boundary */')
      boundaryMarker: '/* lithent:hmr-boundary */',

      // Custom import specifiers
      createBoundaryImport: 'lithent/devHelper',
      tagFunctionImport: 'lithent',

      // Enable devtools in production (default: false)
      devtoolsInProd: false,

      // JSX import source (default: 'lithent')
      jsxImportSource: 'lithent',

      // Wrap MDX default exports with mount for Lithent HMR (default: false)
      wrapMdx: true,
    }),
  ],
});
```

### MDX HMR playground

Run the package-local dev server to try live MDX updates:

```bash
pnpm --filter @lithent/lithent-vite dev:plugin
```

Open `http://localhost:5173/html/parsor.html?target=mdx` and edit `src/hmr-mdx.example.mdx` to confirm that changes apply without a full refresh.

### SSR Setup (Express/Node.js)

For server-side rendering with Vite middleware:

```javascript
import express from 'express';
import { createServer as createViteServer } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

const app = express();

const vite = await createViteServer({
  plugins: [
    lithentVitePlugin(),
  ],
  server: { middlewareMode: 'ssr', hmr: true },
});

app.use(vite.middlewares);
```

## How It Works

### Automatic HMR Boundaries

The plugin automatically wraps components using `mount`:

**Before:**
```tsx
import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;
```

**After (transformed):**
```tsx
import { mount } from 'lithent';
import { createHmrBoundary } from 'lithent/devHelper';

const App = createHmrBoundary(
  mount((renew, props) => {
    return () => <div>Hello World</div>;
  }),
  import.meta.hot,
  'App'
);

export default App;
```

### Explicit HMR Boundaries

Use marker comments for fine-grained control:

```tsx
import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;
```

## API

### `lithentVitePlugin(options?)`

Create a Vite plugin instance.

**Options:**

```typescript
interface LithentVitePluginOptions {
  /**
   * File patterns to include for transformation
   * Can be a single RegExp or an array of RegExp
   * @default [/\.([cm]?[tj]sx?)$/]
   */
  include?: RegExp | RegExp[];

  /**
   * Custom HMR boundary marker string
   * @default '/* lithent:hmr-boundary */'
   */
  boundaryMarker?: string;

  /**
   * Import specifier for createHmrBoundary
   * @default 'lithent/devHelper'
   */
  createBoundaryImport?: string;

  /**
   * Import specifier for tag functions (mount, etc)
   * @default 'lithent'
   */
  tagFunctionImport?: string;

  /**
   * Enable HMR devtools in production builds
   * @default false
   */
  devtoolsInProd?: boolean;

  /**
   * JSX import source for automatic JSX transform
   * @default 'lithent'
   */
  jsxImportSource?: string;
}
```

### `DEFAULT_BOUNDARY_MARKER`

The default marker string:

```typescript
export const DEFAULT_BOUNDARY_MARKER = '/* lithent:hmr-boundary */';
```

## State Preservation

During HMR updates:
- **Props are preserved**: Component props are maintained
- **Closure state is reset**: Variables inside mount closures are re-initialized
- **External state persists**: State from `lithent/helper` (state, store) persists

This is intentional behavior to ensure clean state during development.

## Troubleshooting

### HMR not working

1. Ensure the plugin is loaded before other transform plugins
2. Check that files match the `include` pattern
3. Verify `import.meta.hot` is available (dev mode only)

### TypeScript errors

Add Vite client types to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## Related Packages

- `@lithent/hmr-parser` - Core HMR transformation logic
- `lithent` - Core Lithent library
- `lithent/devHelper` - Browser-side HMR runtime

## License

MIT

## Repository

https://github.com/superlucky84/lithent

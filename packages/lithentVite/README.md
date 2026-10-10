# @lithent/lithent-vite

Official Vite plugin for Lithent with HMR support.

## Overview

`@lithent/lithent-vite` is a Vite plugin that enables Hot Module Replacement (HMR) for Lithent components during development. It automatically injects HMR boundaries around your components, allowing you to see changes instantly while keeping unaffected parent components mounted. Changed `mount`/`lmount` components remount and reset their closure state.

## Features

- **Hot Module Replacement**: Instant updates during development
- **Automatic HMR boundaries**: Supports `mount`, `lmount`, and stateless JSX components
- **Marker support**: Explicit HMR boundary control with comments
- **Type-safe**: Full TypeScript support
- **Zero config**: Works out of the box with sensible defaults

## Installation

```bash
npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite
```

**Peer Dependencies:**
- `lithent: ^1.21.0`
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

      // Use lithent-template-vite ahead of HMR transforms
      template: {
        extensions: ['.ltsx'],
      },
    }),
  ],
});
```

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

The plugin gives each top-level component its own development boundary. It
supports `mount`, `lmount`, and stateless functions that return JSX (including
arrow functions, function declarations, and default exports):

```tsx
export const Badge = ({ label }: { label: string }) => <span>{label}</span>;

export function Card({ title }: { title: string }, children: JSX.Element[]) {
  return <article><Badge label="Info" />{title}{children}</article>;
}
```

Lithent still passes children as the second argument. No `mount` wrapper or
marker is required for stateless JSX components. Development proxies keep
existing imports pointed at the latest implementation, including after parent
redraws or an unmount/remount. Several components can share a file without
being replaced with each other's implementations.

Stateless components can also return a JSX list, a locally computed JSX value,
their children, or an empty value (`null`, `undefined`, `false`, `[]`). Namespace
imports and named default functions are supported. Function declarations keep
their hoisting behavior. Async functions and generators are not component
boundaries.

Calling a stateless function directly (for example, `{Badge(props)}`) updates
its caller's existing render closure instead of replacing that caller with the
stateless function. The caller keeps its state.

HMR remounts the changed module's components; unaffected parents keep their
state. Files without component boundaries propagate updates to their importers.
Removing a component can also invalidate its importers. Production builds do
not inject HMR code by default; application function signatures stay unchanged.

When a file also exports ordinary values, unchanged exports allow component
updates to stay within that file. Changed values or export names propagate to
importers so they see the new values; affected importer components can remount.
Re-exported values also propagate updates. HMR runs cleanup for the previous
mount before registering its replacement.

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

  /**
   * Enable lithent-template-vite preprocessing before HMR transforms.
   * Pass `true` to use defaults or provide the underlying template plugin options.
   */
  template?: boolean | LithentTemplateViteOptions;
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

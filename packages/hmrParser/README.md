# @lithent/hmr-parser

HMR (Hot Module Replacement) parser utilities for Lithent build tools.

## Overview

`@lithent/hmr-parser` provides AST-based code transformation to inject HMR boundaries into Lithent components. This package is designed to be used by build tool plugins (like `@lithent/lithent-vite`) to enable hot reloading during development.

## Features

- **Marker-based transformation**: Use `/* lithent:hmr-boundary */` comments to explicitly mark HMR boundaries
- **Automatic transformation**: Automatically detect and wrap mount components with HMR boundaries
- **AST-based parsing**: Uses Babel parser for accurate code transformation
- **Source map support**: Generates source maps for debugging

## Installation

```bash
npm install @lithent/hmr-parser
# or
pnpm add @lithent/hmr-parser
# or
yarn add @lithent/hmr-parser
```

## Usage

### In Build Tool Plugins

```typescript
import { transformWithHmr, shouldSkipTransform } from '@lithent/hmr-parser';

// In your Vite/Webpack/etc plugin's transform hook
export function myBuildPlugin() {
  return {
    name: 'my-lithent-plugin',
    transform(code, id) {
      // Skip non-transformable files
      if (shouldSkipTransform(code)) {
        return null;
      }

      const result = transformWithHmr({
        code,
        markerRegex: /\/\*\s*lithent:hmr-boundary\s*([^*]*)\*\//g,
        boundaryImportSpecifier: 'lithent/devHelper',
        tagFunctionImportSpecifier: 'lithent',
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}
```

### Marker-based Transformation

Use comments to explicitly mark HMR boundaries:

```tsx
import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;
```

### Automatic Transformation

Components using `mount` are automatically wrapped with HMR boundaries:

```tsx
import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

// Automatically transformed to:
// const App = createHmrBoundary(
//   mount((renew, props) => {
//     return () => <div>Hello World</div>;
//   }),
//   import.meta.hot,
//   'App'
// );
```

## API

### `transformWithHmr(options)`

Transform code with HMR boundaries.

**Options:**
- `code: string` - Source code to transform
- `markerRegex: RegExp` - Regular expression to match HMR boundary markers
- `boundaryImportSpecifier: string` - Import specifier for `createHmrBoundary` (default: `'lithent/devHelper'`)
- `tagFunctionImportSpecifier: string` - Import specifier for tag functions like `mount` (default: `'lithent'`)

**Returns:** `HmrTransformResult`
- `code: string` - Transformed code
- `map: object | null` - Source map
- `transformed: boolean` - Whether transformation occurred

### `shouldSkipTransform(code)`

Check if code should skip HMR transformation.

**Parameters:**
- `code: string` - Source code to check

**Returns:** `boolean` - `true` if transformation should be skipped

### `analyzeMarker(code, markerRegex)`

Analyze marker comments in code.

### `analyzeNoMarker(code)`

Analyze code without markers for automatic transformation.

## Browser Runtime

For the browser-side HMR runtime (`createHmrBoundary`, `registerUpdateHandler`), use `lithent/devHelper`:

```typescript
import { createHmrBoundary } from 'lithent/devHelper';
```

**Note:** This package (`@lithent/hmr-parser`) is server-side only and includes Babel dependencies. It should only be used in build tool plugins, not bundled for browsers.

## License

MIT

## Repository

https://github.com/superlucky84/lithent

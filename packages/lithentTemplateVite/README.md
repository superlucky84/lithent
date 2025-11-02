# Lithent Template Vite Plugin

Vite plugin that compiles Lithent templates embedded inside JSX/TSX-like files.
It is built on top of `@lithent/lithent-template-parser` and understands both
inline template literals and full-document `.ljsx` / `.ltsx` modules.

Lithent templates intentionally mimic JSX ergonomics, yet remain independent of
the JSX transform. They give Lithent projects a declarative syntax for complex
conditional and iterative markup while compiling straight to `h()` calls.

> **Status:** Experimental. Behaviour and options may change as the tooling
> evolves.

## Features

- **Document pipeline** – scans entire source files, replaces Lithent markup
  with generated `h()` calls, and forwards source maps downstream.
- **Custom extensions** – default support for `.ljsx` and `.ltsx`, with full
  control over additional extensions and associated esbuild loaders.
- **HTML entry transform** – `<script type="module" src="*.ltsx">` tags are
  automatically rewritten to inline imports so the browser receives valid JS.
- **Tooling-friendly** – exposes warnings, preserves source maps in production,
  and keeps untouched code intact.

## Installation

```bash
pnpm add -D @lithent/lithent-template-vite
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [lithentTemplateVite()],
});
```

With the default settings the plugin looks for `.ljsx` and `.ltsx` files,
rewrites HTML entry points, and delegates template compilation to the parser.

If you prefer a static HTML entry in development, the safest option is to inline
the import yourself so the browser receives JavaScript immediately:

```html
<script type="module">import "/src/dev/main.ltsx";</script>
```

This pattern works in both dev and build modes and avoids relying on HTML entry
rewrites.

## Options

```ts
lithentTemplateVite({
  include: [/\.ltsx$/, /\.foo$/],
  extensions: ['.ltsx', '.foo'],
  extensionLoaders: {
    '.foo': 'ts',
  },
});
```

- `include` (RegExp | RegExp[]) – extra guard for files to transform. By
  default a pattern is generated for every configured extension.
- `extensions` (string[]) – list of file extensions to treat as Lithent
  templates. Values are normalised (leading `.` is optional). Defaults to
  `['.ljsx', '.ltsx']`.
- `extensionLoaders` (Record<string, LoaderValue>) – override the esbuild loader
  used for a given extension (`'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css'`).
  When omitted, the loader is inferred from the extension suffix (e.g. `.ltsx`
  → `'ts'`).

## Example Workflow

```ts
// src/dev/init.js
import './main.ltsx';

// src/dev/main.ltsx
import { render } from 'lithent';

export const App = () => (
  <div class="app">
    <h1>Hello Lithent</h1>
    <TodoList l-for={todo in todos} todo={todo} />
  </div>
);

if ('document' in globalThis) {
  render(<App />, document.getElementById('app'));
}
```

The plugin turns the template section inside `App` into pure `h()` calls. All
other code (hooks, logic, imports) stays untouched.

## Development & Tests

```bash
# Launch the playground (packages/lithentTemplateVite/html)
pnpm --filter @lithent/lithent-template-vite dev

# Run Vitest
pnpm --filter @lithent/lithent-template-vite test
```

## License

MIT © Lithent contributors

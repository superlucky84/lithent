<img src="./lithentDocs/public/lithent.png" alt="Lithent" height="60" align="left" style="margin-right: 10px;" />

# Lithent &nbsp; [![npm version](https://img.shields.io/npm/v/lithent.svg)](https://www.npmjs.com/package/lithent) [![Bundle Size](https://img.shields.io/bundlephobia/minzip/lithent)](https://bundlephobia.com/package/lithent) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

<br clear="left"/>



**Lithent is a JavaScript library for building lightweight, predictable UIs with familiar closure-based patterns.**

It trims away unnecessary magic and complex APIs so your UI code stays simple, explicit, and easy to reason about.

<br />

## Why Lithent? &nbsp; [→ Learn more](https://superlucky84.github.io/lithent/guide/introduction)

In many size‑sensitive environments you still need **lightweight DOM manipulation** without pulling in a full framework. Most existing solutions are powerful but heavy, especially when you just want to embed a small widget or ship a tiny library.

Lithent was designed for that gap. **The Core package alone can drive a complete UI.** When you need state management or a reactive system, you can **opt‑in to helper modules like expansion packs** instead of adopting a full stack up front.

You bring in only what you need, letting the stack scale with your project and team instead of the other way around.

### Design philosophy

- **Small Bundle** — 4KB core with optional extensions
- **Closure-based State** — No magic, just JavaScript
- **Manual or Reactive** — Choose your update strategy
- **Progressive Enhancement** — From static HTML to full SPA

<br />

## Quick start &nbsp; [→ Full guide](https://superlucky84.github.io/lithent/guide/quick-start)

### Create a new project

```bash
npx create-lithent@latest
```

Pick a project name and template (SSR/SPA) and you’re ready to go.

### Install via npm

```bash
npm install lithent
```

### Use directly from a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>
```

No build step required — you can progressively enhance a static HTML page.

<br />

## Two ways to build components &nbsp; [→ Learn more](https://superlucky84.github.io/lithent/guide/mounter)

Lithent offers two complementary styles that you can freely mix in the same project.

### Manual control (Manual Mode)

You explicitly call `renew()` to control when updates happen. State lives in closures, giving you an extremely predictable flow.

```tsx
import { mount } from 'lithent';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // Explicitly trigger an update
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});
```

### Declarative (Light API Mode)

In this style state changes automatically reflect in the UI.
Helper packages provide `lstate`, `computed`, `effect`, and more — all opt‑in.

```tsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // Updates the UI automatically
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});
```

<br />

## Key features

### Core
- **[mount / lmount](https://superlucky84.github.io/lithent/guide/mounter)** — define and initialize components
- **[Portal](https://superlucky84.github.io/lithent/guide/portal)** — render outside the parent DOM tree
- **[Hooks](https://superlucky84.github.io/lithent/guide/mount-hooks)** — `mountCallback`, `updateCallback`, `mountReadyCallback`
- **[Ref](https://superlucky84.github.io/lithent/guide/state-ref)** — directly reference DOM elements

### Helpers (optional)
- **[state / lstate](https://superlucky84.github.io/lithent/guide/state)** — reactive state management
- **[computed](https://superlucky84.github.io/lithent/guide/computed)** — derived state
- **[effect](https://superlucky84.github.io/lithent/guide/effect)** — side‑effect handling
- **[store / lstore](https://superlucky84.github.io/lithent/guide/store)** — shared/global state
- **[context / lcontext](https://superlucky84.github.io/lithent/guide/context)** — data sharing across components

### Template options
- **[JSX](https://superlucky84.github.io/lithent/guide/vite-plugin)** — via a Vite plugin
- **[FTags](https://superlucky84.github.io/lithent/guide/ftags)** — function‑style tags (no build step)
- **[HTM](https://superlucky84.github.io/lithent/guide/htm-tags)** — tagged template literals
- **[Template Strings](https://superlucky84.github.io/lithent/guide/template-strings)** — custom templates

<br />

## Documentation

Find the full guide and API reference at:

**[https://superlucky84.github.io/lithent](https://superlucky84.github.io/lithent)**

### Quick links
- [Introduction](https://superlucky84.github.io/lithent/guide/introduction)
- [Quick start](https://superlucky84.github.io/lithent/guide/quick-start)
- [Examples](https://superlucky84.github.io/lithent/examples/1)
- [API reference](https://superlucky84.github.io/lithent/guide/mounter)

<br />

## Ecosystem

| Package | Description |
|--------|-------------|
| [lithent](https://www.npmjs.com/package/lithent) | Core library (~4KB) |
| [lithent/helper](https://www.npmjs.com/package/lithent) | Reactive state helpers |
| [lithent/ssr](https://www.npmjs.com/package/lithent) | Server‑side rendering |
| [lithent/ftags](https://www.npmjs.com/package/lithent) | Function‑style tag API |
| [lithent/tag](https://www.npmjs.com/package/lithent) | HTM template support |
| [create-lithent](https://www.npmjs.com/package/create-lithent) | Project scaffolding tool |

<br />

## License

[MIT](LICENSE) © [superlucky84](https://github.com/superlucky84)

<br />

<div align="center">
  <sub>Built with ❤️ by the Lithent community</sub>
</div>

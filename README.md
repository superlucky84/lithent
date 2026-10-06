<img src="./lithentDocs/public/lithent.png" alt="Lithent" height="60" align="left" style="margin-right: 10px;" />

# Lithent &nbsp; [![npm version](https://img.shields.io/npm/v/lithent.svg)](https://www.npmjs.com/package/lithent) [![Bundle Size](https://img.shields.io/bundlephobia/minzip/lithent)](https://bundlephobia.com/package/lithent) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

<br clear="left"/>

**Lithent is a JavaScript library for building lightweight, predictable UIs with familiar closure-based patterns.**

It trims away unnecessary magic and complex APIs so your UI code stays simple, explicit, and easy to reason about.

<br />

<div align="left">

### 🚀 [Get Started](https://superlucky84.github.io/lithent/#/guide/quick-start) · 📖 [Documentation](https://superlucky84.github.io/lithent/#/) · 💡 [Examples](https://superlucky84.github.io/lithent/#/examples/1)

</div>

<br />

## Why Lithent?

**Lightweight DOM manipulation without the framework weight.** The 4KB core drives complete UIs. Need state management? Opt into helpers like expansion packs instead of adopting a full stack.

Bring in only what you need — let the stack scale with your project.

**Design philosophy:**
- **Small Bundle** — 4KB core with optional extensions
- **Closure-based State** — No magic, just JavaScript
- **Manual or Reactive** — Choose your update strategy
- **Progressive Enhancement** — From static HTML to full SPA

<br />

## Quick start

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
<!-- Custom Elements (optional) -->
<script src="https://cdn.jsdelivr.net/npm/lithent/element/dist/lithentElement.umd.js"></script>
```

> **[📦 View all available CDN URLs](https://superlucky84.github.io/lithent/#/guide/quick-start)**

<br />

## Two ways to build components

Lithent offers two complementary styles you can freely mix in the same project.

**Manual Mode** — Explicit control with `renew()`
```tsx
import { mount } from 'lithent';

const Counter = mount(renew => {
  let count = 0;
  return () => <button onClick={() => { count++; renew(); }}>{count}</button>;
});
```

**Light API Mode** — Automatic reactivity
```tsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);
  return () => <button onClick={() => count.value++}>{count.value}</button>;
});
```

> **[📚 Explore component patterns in detail](https://superlucky84.github.io/lithent/#/guide/mounter)**

<br />

## Key features

### Core
- **mount / lmount** — Component initialization
- **Portal** — Render outside parent DOM
- **Hooks** — Lifecycle callbacks (`mountCallback`, `updateCallback`, `mountReadyCallback`)
- **Ref** — Direct DOM access

### Helpers (optional)
- **state / lstate** — Reactive state management
- **computed** — Derived values
- **effect** — Side effects
- **store / lstore** — Global state
- **context / lcontext** — Cross-component data sharing

### Custom Elements (optional)
- **lithent/element** — Register a component as a standard Custom Element and embed it in any page (plain HTML, server templates, React, Vue) with a script and a tag. Shadow DOM style isolation, attribute/property props, DOM events. Under 1KB on top of the core.

```js
import { defineElement, emit } from 'lithent/element';

defineElement('pay-button', PayButton, { props: { amount: Number } });
// <pay-button amount="1000"></pay-button>
```

> **[🧩 Custom Elements guide](https://superlucky84.github.io/lithent/#/guide/element)**

### Template options
- **JSX** — Via Vite plugin
- **FTags** — Function-style tags (no build step)
- **HTM** — Tagged template literals
- **Template Strings** — Custom templates

> **[📖 View full API reference](https://superlucky84.github.io/lithent/#/)**

<br />

## Ecosystem

| Package | Description |
|--------|-------------|
| [lithent](https://www.npmjs.com/package/lithent) | Core library (~4KB) |
| [lithent/helper](https://www.npmjs.com/package/lithent) | Reactive state helpers |
| [lithent/ssr](https://www.npmjs.com/package/lithent) | Server‑side rendering |
| [lithent/ftags](https://www.npmjs.com/package/lithent) | Function‑style tag API |
| [lithent/tag](https://www.npmjs.com/package/lithent) | HTM template support |
| [lithent/element](./element/README.md) | Register components as Custom Elements, embeddable in any page ([guide](https://superlucky84.github.io/lithent/#/guide/element)) |
| [lithent-concurrent](./lithentConcurrent/README.md) | Separate core with priority scheduling and interruptible low-priority builds |
| [lithent-concurrent/helper](./lithentConcurrent/README.md#lithent-concurrenthelper) | Deferred state and component-local pending queries |
| [create-lithent](https://www.npmjs.com/package/create-lithent) | Project scaffolding tool |

For expensive component trees, select the concurrent core with an exact
`/^lithent$/` bundler alias. `deferRender` defers rendering while state writes
remain immediate; `whenIdle` waits for deferred work. Keep urgent input and
heavy rendering in separate components. See the [concurrent rendering
guide](https://superlucky84.github.io/lithent/#/guide/concurrent-rendering) and
[release notes](./CHANGELOG.md).

<br />

## License

[MIT](LICENSE) © [superlucky84](https://github.com/superlucky84)

<br />

<div align="center">
  <sub>Built with ❤️ by the Lithent community</sub>
</div>

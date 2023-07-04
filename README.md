# lithent

> An extensible virtual DOM library for lightweight use in a variety of environments.

Lithent were developed to make it easy to insert Virtual DOM component
fragments into pages already drawn with SSR, and are intended to be
used lightly in a variety of situations.

- https://superlucky84.github.io/lithent
  - (This guide page is written in lithent.)

`(9.64 KiB / gzip: 3.76 KiB)`

## 🚩 Table of Contents

- [Why Use Lithent](#why-use-lithent)
- [Basic Guide](#basic-guide)
- [How To Install](#how-to-install)
  - [Use NPM](#use-npm)
  - [Use CDN](#or-use-cdn)
  - [With HTM](#with-htm)
  - [With JSX](#with-jsx)
- [Examples](#examples)
  - [With ESM](#with-esm)
  - [With UMD](#with-umd)
- [Develop Guide](#develop-guide)
- [Test](#test)

## Why use Lithent?

### Lithent have the bare minimum of necessary functionality, with no unnecessary features.

In a real-world development environment, you may want to use Virtual DOM lightly, with only the bare minimum of core functionality.

"Lithent" makes it easy to add, remove, and update virtual domes to specific parts of a pre-drawn SSR page.

"Lithent" has implemented the bare minimum functionality needed to create and update virtual DOM in general (we only need to know 'render', 'mounter', 'updater', 'renewer', 'mountCallback', and 'updateCallback').

We provide code in the form of 'helpers' that extend the basic functionality, but using the helpers is only optional and users can extend and develop custom helpers for their own projects.

### Approach with the developer-friendly concept of closures between "component mounter" and "renderer"

Many existing UI libraries have their advantages, but they also create rules that are too strong and rigid for fear of users making mistakes.

JavaScript users are used to using closures and love to develop with them.

"Lithent" provides a familiar approach to my JavaScript development, as it leverages the properties of higher-order functions and closures to define and recycle the state of a component.

## Basic Guide

- https://superlucky84.github.io/lithent/

## How To Install

#### Use NPM

```bash
pnpm add lithent
```

#### Or Use CDN

* UMD : https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.umd.js
* UMD-HELPER: https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.umd.js
* ESM : https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.mjs
* ESM-HELPER: https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.mjs


It's easier to use lithent with JSX or HTM.

#### With HTM

- [Htm Github](https://github.com/developit/htm)

```bash
pnpm add -D htm
```

```js
import { h, render, mount } from 'lithent';
import htm from 'htm';
const html = htm.bind(h);
```

#### With JSX

- [Setting Guide](https://superlucky84.github.io/lithent/#install)

## Examples

- [More Examples](https://superlucky84.github.io/lithent/#examples)

#### With ESM
```js
import { h, render, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';
import htm from 'htm';
const html = htm.bind(h);

const Component = mount((renew, _props) => {
  const count = state(0, renew);

  const change = () => {
    count.value += 1;
  };

  // Updater
  return () => html`
    <${Fragment}>
      <li>count: ${count.value}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

// insertBefore
// render(`<${Component} />`, document.getElementById('root'), document.getElementById('nextElement'));

// appendChild
const destroy = render(html`<${Component} />`, document.getElementById('root'));
```

#### With UMD

```html
<script src="https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.umd.js"></script-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js"></script>

<div id="root"></div>

<script>
const { h, Fragment, render, mount } = lithent;
// const { state } = lithentHelper;
const html = htm.bind(h);

const Component = mount(renew => {
  count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  // Updater
  return () => html`
    <${Fragment}>
      <li>count: ${count}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

const destroy = render(html`<${Component} />`, document.getElementById('root'));
</script>
```

## Develop Guide

It's open source, so you can develop and contribute together.

### pnpm install (this project was created using pnpm.)

```bash
npm install -g pnpm
```

### project install

```bash
git clone https://github.com/superlucky84/lithent.git

cd lithent

pnpm install
```

### project build

```bash
pnpm build
```

### Running the development environment

```bash
pnpm dev // or pnpm dev:core
```

## Test

```bash
// pnpm install
pnpm test
```


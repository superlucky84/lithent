# lithent

> A lightweight Virtual DOM UI library

Lithent were developed to make it easy to insert Virtual DOM component
fragments into pages already drawn with SSR, and are intended to be
used lightly with other libraries.

`(9.54 KiB / gzip: 3.54 KiB)`

## 🚩 Table of Contents
* [Basic Guide](#basic-guide)
* [How To Install](#how-to-install)
  * [Width HTM](#with-htm)
  * [Width JSX](#with-jsx)
* [Examples](#examples)
* [Develop Guide](#develop-guide)

## Basic Guide

* https://superlucky84.github.io/lithent/

## How To Install

```bash
pnpm add lithent 
```

#### With HTM

* [Htm Github](https://github.com/developit/htm)

```bash
pnpm add -D htm
```

```js
import { h, render, mount } from 'lithent';
import htm from 'htm';
const html = htm.bind(h);
);
```

#### With JSX

* [Setting Guide](https://superlucky84.github.io/lithent/#install)

## Examples

* [More Examples](https://superlucky84.github.io/lithent/#examples)

```js
import { h, render, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';
import htm from 'htm';
const html = htm.bind(h);

const Component = mount((r, _props) => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return () => html`
    <${Fragment}>
      <li>count: ${count.v}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

render(html`<${Component} />`, document.getElementById('root'));

// insertBefore
// render(<Root />, document.getElementById('root'), document.getElementById('nextElement'));

// appendChild
render(<Root />, document.getElementById('root'));
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

# lithent

> A lightweight Virtual DOM UI library

Lithent were developed to make it easy to insert Virtual DOM component
fragments into pages already drawn with SSR, and are intended to be
used lightly with other libraries.

* https://superlucky84.github.io/lithent
  * (This guide page is written in lithent.)

`(9.54 KiB / gzip: 3.54 KiB)`

## 🚩 Table of Contents
* [Why Use Lithent](#why-use-lithent)
* [Basic Guide](#basic-guide)
* [How To Install](#how-to-install)
  * [Width HTM](#with-htm)
  * [Width JSX](#with-jsx)
* [Examples](#examples)
* [Develop Guide](#develop-guide)

## Why use Lithent?

### Lithent have the bare minimum of necessary functionality, with no unnecessary features.

Since 'react' and 'vue', there have been a lot of UI libraries coming out that boast full-stack functionality.

However, in the real world of development, there are times when you need to build something using only the bare minimum of key features, rather than a full-stack, full-featured library.

Lithent has implemented the bare minimum functionality needed to create and update virtual DOM in general (we only need to know 'render', 'mounter', 'updater', 'renewer', 'mountCallback', and 'updateCallback').

We provide code to extend the basic functionality in the form of 'helpers', but using them is only optional and we want to encourage talented users to extend and develop custom helpers for their own projects.


### Approach with the developer-friendly concept of closures between "component mounter" and "renderer"

Many existing UI libraries have their advantages, but they also create rules that are too strong and rigid for fear of users making mistakes.

JavaScript users are used to using closures and love to develop with them. 

"Lithent" provide a familiar approach to real-world JavaScript development because they leverage the properties of higher-order functions and closures in the component mounter to define the properties of the component and get the mounted information from the renderer.


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

// insertBefore
// render(`<${Component} />`, document.getElementById('root'), document.getElementById('nextElement'));

// appendChild
render(html`<${Component} />`, document.getElementById('root'));
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

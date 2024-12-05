
## ➿ lithent
> An extensible JSX-based virtual DOM library for lightweight use in a variety of environments.


![lithent-text](https://github.com/user-attachments/assets/a8848484-d315-4f81-be3b-61490d2be2b9)

![npm](https://img.shields.io/npm/v/lithent)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/lithent)
![npm](https://img.shields.io/npm/dt/lithent)
![NPM](https://img.shields.io/npm/l/lithent)




- [Manual](https://medium.com/p/13d6fe6d3330)
- [Korean Manual](https://medium.com/@superlucky84/lithent-전체-기능-설명서-3cfab04c0722)
- [Home Page](https://superlucky84.github.io/lithent) - (This page is written in lithent.)

Lithent were developed to make it easy to insert Virtual DOM component
fragments into pages already drawn with SSR, and are intended to be
used lightly in a variety of situations.

`(lithent.mjs  14.25 kB │ gzip: 4.49 kB │ map: 59.74 kB)`
`(lithent.umd.js  10.39 kB │ gzip: 4.03 kB │ map: 58.16 kB)`

## 🚩 Table of Contents
- [Thanks for the introduction](#thanks-for-the-introduction)
- [Why Use Lithent](#why-use-lithent)
- [Basic Guide](#basic-guide)
- [How To Install](#how-to-install)
  - [Use NPM](#use-npm)
  - [Use CDN](#or-use-cdn)
  - [With JSX](#with-jsx)
  - [With FTAGS](#with-ftags)
  - [With HTM](#with-htm)
- [Examples](#examples)
  - [With ESM](#with-esm)
  - [With UMD](#with-umd)
- [Related Projects](#related-projects)
- [Develop Guide](#develop-guide)
- [Test](#test)

## Thanks for the introduction
- [unsuckjs](https://unsuckjs.com/)
- [jster](https://jster.net/blog/jster-198/)
- [webtoolsweekly](https://webtoolsweekly.com/archives/issue-531/)

## Why use Lithent?

### Lithent have the bare minimum of necessary functionality, with no unnecessary features.

In a real-world development environment, you may want to use Virtual DOM lightly, with only the bare minimum of core functionality.

"Lithent" makes it easy to add, remove, and update virtual DOM to specific parts of a pre-drawn SSR page.

"Lithent" has implemented the bare minimum functionality needed to create and update virtual DOM in general (we only need to know 'render', 'mounter', 'updater', 'renewer', 'mountCallback', and 'updateCallback').

We provide code in the form of 'helpers' that extend the basic functionality, but using the helpers is only optional and users can extend and develop custom helpers for their own projects.

### Approach with the developer-friendly concept of closures between "component mounter" and "renderer"

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

* UMD : https://cdn.jsdelivr.net/npm/lithent@1.16.0/dist/lithent.umd.js
* UMD-HELPER: https://cdn.jsdelivr.net/npm/lithent@1.16.0/helper/dist/lithentHelper.umd.js
* UMD-FTAGS: https://cdn.jsdelivr.net/npm/lithent@1.16.0/ftags/dist/lithentFTags.umd.js
* UMD-TAG: https://cdn.jsdelivr.net/npm/lithent@1.16.0/tag/dist/lithentTag.umd.js
* ESM : https://cdn.jsdelivr.net/npm/lithent@1.16.0/dist/lithent.mjs
* ESM-HELPER: https://cdn.jsdelivr.net/npm/lithent@1.16.0/helper/dist/lithentHelper.mjs
* ESM-FTAGS: https://cdn.jsdelivr.net/npm/lithent@1.16.0/ftags/dist/lithentFTags.mjs
* ESM-TAG: https://cdn.jsdelivr.net/npm/lithent@1.16.0/tag/dist/lithentTag.mjs


It's easier to use lithent with JSX or HTM.

#### With JSX

* Lithent is built on top of JSX.
  * [Setting Guide](https://superlucky84.github.io/lithent/#install)


#### With FTAGS

You don't need to use h functions or JSX, you can call functions to mark them up.
When creating a component, use `fMount` instead of `mount`.
When creating a fragment, use `fFragment` instead of `Fragment`.

```ts
/* ESM */
import { render, h } from 'lithent';
import { fTags, fFragment, fMount } from 'lithent/ftags';

const { section, div, p, br, strong } = fTags;

/* UMD
<script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/helper/dist/lithentHelper.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/ftags/dist/lithentFTags.umd.js"></script>

const { render } = lithent;
const { fTags, fMount, fFragment } = lithentFTags;
const { section, div, p, br, strong } = fTags;
*/

const fTagComponent = fMount<{ firstProp: number }>((_r, props, children) => {
  return () =>
    fFragment(
      'first inner',
      div({ style: { border: '1px solid red' } }, 'second inner'),
      div('The props argument can be omitted.'),
      props.firstProp,
      ...children
    );
});

render(
  fTagComponent(
    { firstProp: 3 }, // The props argument can be omitted.
    div({ style: { border: '1px solid green' } }, `Fchildren1`),
    'Fchildren2',
    br()
  ),
  document.getElementById('root')
);
```

#### With HTM

- [Htm Github](https://github.com/developit/htm)

```js
import { lTag } from 'lithent/tag';
const destroy = render(lTag`<${Component} />`, document.getElementById('root'), document.getElementById('#insert-before-this-element'));
```


## Examples

- [More Examples](https://superlucky84.github.io/lithent/#examples)

#### With ESM
```js
import { h, render, mount, Fragment } from 'lithent';
import { lTag } from 'lithent/tag';
import { state } from 'lithent/helper';

const Component = mount((renew, _props) => {
  const count = state(0, renew);

  const change = () => {
    count.value += 1;
  };

  // Updater
  return () => lTag`
    <${Fragment}>
      <li>count: ${count.value}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

// appendChild or insertBefore
// The third argument is an optional value for insertBefore.
const destroy = render(lTag`<${Component} />`, document.getElementById('root'), document.getElementById('#insert-before-this-element'));
```

#### With UMD

```html
<script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/dist/lithent.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/helper/dist/lithentHelper.umd.js"></script-->
<script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/tag/dist/lithentTag.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.16.0/ftags/dist/lithentFTags.umd.js"></script-->

<div id="root"></div>

<script>
const { h, Fragment, render, mount } = lithent;
const { lTag } = lithentTag;
// const { state } = lithentHelper;

const Component = mount(renew => {
  count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  // Updater
  return () => lTag`
    <${Fragment}>
      <li>count: ${count}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

// appendChild or insertBefore
// The third argument is an optional value for insertBefore.
const destroy = render(lTag`<${Component} />`, document.getElementById('root'), document.getElementById('#insert-before-this-element'));
</script>
```

## Related Projects
- [htm](https://www.npmjs.com/package/htm) - making **H**yperscript **T**agged **M**arkup possible

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

> To fully test everything, including plugins like helper and ftags, a build is required.

```bash
pnpm install
pnpm build
pnpm test
```


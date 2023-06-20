# litheNT Basic Usage

litheNT is a virtualDOM implementation library that behaves similarly to React.

[production motive](https://medium.com/p/d14ba89373d3)

Lithent were developed to make it easy to insert VirtualDOM component
fragments into pages already drawn with SSR, and are intended to be
used lightly with other libraries.

## Basic Guide with Examples

* https://superlucky84.github.io/lithent/

## Install

```bash
pnpm add lithent 
```

## With JSX

Please include the JSX option in the build tool you use.

```js
// vite.config.js

export default defineConfig({
  ...
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  ...
});
```

## Example

```jsx
import { h, Fragment, render, mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Children = mount((renew, props) => {
  const count = state<number>(0, renew);
  const change = () => {
    count.value += 1;
  };

  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN UP'),
    () => [count.value]
  );

  return () => (
    <>
      <button onClick={change} type="button">
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});

// insertBefore
// render(<Root />, document.getElementById('wrapElement'), document.getElementById('nextElement'));

// appendChild
render(<Root />, document.getElementById('wrapElement'));
```

# Develop

## pnpm install (this project was created using pnpm.)

```bash
npm install -g pnpm
```

## project install
```bash
git clone https://github.com/superlucky84/lithent.git

cd lithent

pnpm install
```

## project build
```bash
pnpm build
```

## Running the development environment
```bash
pnpm dev // or pnpm dev:core
```

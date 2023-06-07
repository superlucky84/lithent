# Basic Usage

Wwact is a virtualDOM implementation library that behaves similarly to React.

[production motive](https://medium.com/p/d14ba89373d3)

A simpler style of library inspired by Reactjs.

The idea of wwact is to keep the value associated with a `component` as a closure.

There aren't as many rules as in React, you just need to know how closures work in JSX and JavaScript.

## Install

```bash
git clone https://github.com/superlucky84/wwact.git

cd wwact

pnpm add wwact
```

## Using JSX

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
// example.jsx
import {
  h,
  Fragment,
  render,
  makeUpdater,
  makeRef,
  mounted,
  update,
  effect,
  WDom,
} from 'wwact';

// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// (Note that the references in props change every time the component is updated.)
// childen is passed as the second argument.
const ChildComponent = (props: { parentValue: number }, children: WDom[]) => {
  // Create a responsive object. If this value changes, retry the render.
  const state = makeUpdater<{ count: number; text: string }>({
    count: 1,
    text: 'text',
  });

  // Even if you don't use a ref, the private value is always maintained as a regular variable.
  let privateValue = props.parentValue;

  // Ref is only used to reference the DOM.
  const domRef = makeRef(null);

  const increase = () => {
    state.count += 1;
    privateValue += 1;
  };
  const handleInputChane = (event: InputEvent) => {
    state.text = (event.target as HTMLInputElement).value;
  };
  const handleMounted = () => {
    console.log('MOUNTED', domRef);

    return () => console.log('UNMOUNT');
  };
  const handleUpdated = () => {
    console.log('UPDATE');

    return () => console.log('UPDATED');
  };

  mounted(handleMounted); // Only Mounted
  update(handleUpdated, () => [privateValue]); // Only Defs Updated (using a closure to update a value)

  // Behaves like `react`'s `useEffect`
  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN_UP'),
    () => [state.count]
  );

  // Wrap in a function and return (using a closure to hold the value)
  return () => (
    <Fragment>
      {/* Note that the event is onInput (we use the native event name to avoid confusion). */}
      <input type="text" value={state.text} onInput={handleInputChane} />
      <div ref={domRef}>count: {state.count}</div>
      <div>privateValue: {privateValue}</div>
      {/* When the value is updated from the parent component, the function declared inside is executed, so you need to use the `props.` call by reference to output the latest value of the updated property. */}
      <div>parentalue: {props.parentValue}</div>
      <div>sum: {state.count + privateValue + props.parentValue}</div>
      {children}
      <button onClick={increase}>Increase</button>
    </Fragment>
  );
};

function Root() {
  const parentState = makeUpdater<{ count: number }>({ count: 7 });

  const increaseParent = () => {
    parentState.count += 1;
  };

  const decreaseParent = () => {
    parentState.count -= 1;
  };

  return () => (
    <Fragment>
      <button onClick={decreaseParent}>Decrease - Parent</button>
      <div>
        <ChildComponent parentValue={parentState.count}>
          <button onClick={increaseParent}>Increase - Parent</button>
        </ChildComponent>
      </div>
    </Fragment>
  );
}

render(<Root />, document.getElementById('root'));
```

# Develop

## pnpm install (this project was created using pnpm.)
```bash
npm install -g pnpm
```

## project install
```bash
pnpm install
```

## project build
```bash
pnpm build:all
```

## Running the development environment
```bash
pnpm dev:wwact
```

---

# Packages

## wwact

Main module

## router

Hash routing extension

## compiler

Converter for using template syntax(.wwx)

Can be used using `jsx` without using `wwx`

## vitePlugin

A plugin to connect the template syntax (wwx) and the transpiler to the vite build tool

## wwveal

Presentation tool made with wwact


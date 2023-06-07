# Basic Usage

Wwact is a virtualDOM implementation library that behaves similarly to React.

[production motive](https://medium.com/p/d14ba89373d3)

A simpler style of library inspired by Reactjs.

The idea of wwact is to keep the value associated with a `component` as a closure.

There aren't as many rules as in React, you just need to know how closures work in JSX and JavaScript.

## Install

```bash
```bash
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
  state,
  makeRef,
  mounted,
  update,
  effect,
  WDom,
} from 'wwact';

// This is the "mount" function.
// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// childen is passed as the second argument.
const ChildComponent = (props: { parentValue: number }, children: WDom[]) => {
  // The value is used as a "getter" to make it easy to get and write to in the higher-order functions it returns
  const [getCount, setCount] = state<number>(1);
  const [getText, setText] = state<string>('text');
  const getParentValue = () => props.parentValue;
  const parentValue = props.parentValue;

  // Even if you don't use a ref, the private value is always maintained as a regular variable.
  let notRefValue = props.parentValue;

  // Ref is only used to reference the DOM.
  const domRef = makeRef(null);

  const increase = () => {
    setCount(getCount() + 1);
    notRefValue += 1;
  };

  const handleInputChane = (event: InputEvent) => {
    setText((event.target as HTMLInputElement).value);
  };

  const handleMounted = () => {
    console.log('MOUNTED', domRef);

    return () => console.log('UNMOUNT');
  };
  const handleUpdated = () => {
    console.log('UPDATE - privateValue');

    return () => console.log('UPDATED');
  };

  mounted(handleMounted); // Only Mounted
  update(handleUpdated, () => [props.parentValue]); // Only Defs Updated (using a closure to update a value)

  // Behaves like `react`'s `useEffect`
  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN_UP'),
    () => [getCount()]
  );

  // Wrap in a function and return (using a closure to hold the value)
  // This is the "update" function.
  return () => (
    <Fragment>
      {/* Note that the event is onInput (we use the native event name to avoid confusion). */}
      <input type="text" value={getText()} onInput={handleInputChane} />
      <div ref={domRef}>count: {getCount()}</div>
      {/* When the value is updated from the parent component, the function declared inside is executed, so you need to use the `props.` call by reference to output the latest value of the updated property. */}
      <div>parentValue: {props.parentValue} (working)</div>
      <div>parentValue: {getParentValue()} (working)</div>
      <div>parentValue: {parentValue} (not working)</div>
      <div>sum: {getCount() + notRefValue + props.parentValue}</div>
      {/* It doesn't pull it out from under the reference, it uses the value directly, so you can just use it. */}
      <div>notRefValue: {notRefValue}</div>
      {children}
      <button onClick={increase}>Increase</button>
    </Fragment>
  );
};

function Root() {
  const [getParentNumber, setParentNumber] = state<number>(7);

  const increaseParent = () => {
    setParentNumber(getParentNumber() + 1);
  };

  const decreaseParent = () => {
    setParentNumber(getParentNumber() - 1);
  };

  return () => (
    <Fragment>
      <button onClick={decreaseParent}>Decrease - Parent</button>
      <div>
        <ChildComponent parentValue={getParentNumber()}>
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
git clone https://github.com/superlucky84/wwact.git

cd wwact

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


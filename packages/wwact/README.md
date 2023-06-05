# Basic Usage

Wwact is a virtualDOM implementation library that behaves similarly to React.

[production motive](https://medium.com/p/d14ba89373d3)

A simpler style of library inspired by Reactjs.

The idea of wwact is to keep the value associated with a `component` as a closure.

There aren't as many rules as in React, you just need to know how closures work in JSX and JavaScript.

## Install

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

## Example (Using the make function)
```jsx
// factory.tsx
import {
  h,
  Fragment,
  make,
  makeRef,
  render,
  updater,
  mounted,
  updated,
  unmount,
} from 'wwact';

type Updater = { count: number; text: string };
type Member = {
  privateValue: number;
  mixinData: { value: number };
  domRef: { value: HTMLElement | null };
  increase: () => void;
  increaseMixin: () => void;
  decrease: () => void;
  handleInputChange: (event: InputEvent) => void;
};
type Props = { parentValue: number };

const Component = make<Updater, Member, Props>({
  updater: {
    count: 1,
    text: 'text',
  },
  member({ updater, member }) {
    return {
      privateValue: 7,
      mixinData: { value: 0 },
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        updater.count += 1;
        member.privateValue += 1;
      },
      increaseMixin() {
        member.mixinData.value += 1;
      },
      decrease() {
        updater.count -= 1;
      },
      handleInputChange(event: InputEvent) {
        updater.text = (event.target as HTMLInputElement).value;
      },
    };
  },
  mounter(info) {
    const { member } = info;
    const { privateValue } = member;

    info.member.mixinData = updater({ value: 3 });

    mounted(() => console.log('MOUNTED'));
    unmount(() => console.log('UNMOUNT'));

    // Working
    updated(
      () => console.log('UPDATED'),
      () => [info.member.privateValue] // (using a closure to update a value)
    );
    updated(
      () => console.log('UPDATED2'),
      () => [member.privateValue]
    );

    // Not working
    // The `callback` doesn't work because the `privateValue` is closed with a non-reference value.
    updated(
      () => console.log('UPDATED3'),
      () => [privateValue]
    );
    console.log('MOUNT', info.member.mixinData);
  },
  template({
    updater: { text, count },
    props: { parentValue },
    member: {
      mixinData,
      privateValue,
      handleInputChange,
      domRef,
      increase,
      increaseMixin,
      decrease,
    },
    children,
  }) {
    return (
      <Fragment>
        <input type="text" value={text} onInput={handleInputChange} />
        <div ref={domRef}>count: {count}</div>
        <div>privateValue: {privateValue}</div>
        <div>parentalue: {parentValue}</div>
        <div>{mixinData?.value}</div>
        <div>sum: {count + privateValue + parentValue}</div>
        {children}
        <div>
          <button onClick={increaseMixin}>increaseMixin</button>
          <button onClick={increase}>Increase</button>
          <button onClick={decrease}>Decrease</button>
        </div>
      </Fragment>
    );
  },
});

render(<Component parentValue={9} />, document.getElementById('root'));
```

## Example (Use the primitive)

```jsx
// example.jsx
import {
  h,
  Fragment,
  render,
  updater,
  makeRef,
  mounted,
  updated,
  unmount,
  WDom,
} from 'wwact';

// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// childen is passed as the second argument.
const ChildComponent = (props: { parentValue: number }, children: WDom[]) => {
  // Create a responsive object. If this value changes, retry the render.
  const state = updater<{ count: number; text: string }>({
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
  };
  const handleUnmount = () => {
    console.log('UNMOUNT');
  };
  const handleUpdated = () => {
    console.log('UPDATED');
  };

  mounted(handleMounted); // Only Mounted
  unmount(handleUnmount); // Only Unmounted
  updated(handleUpdated, () => [privateValue]); // Only Defs Updated (using a closure to update a value)

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
  const parentState = updater<{ count: number }>({ count: 7 });

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


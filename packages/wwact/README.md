
# Basic Usage

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

## Example

```jsx
// example.tsx
import {
  h,
  Fragment,
  render,
  makeData,
  makeRef,
  effect,
  unmount,
} from '@/index';

function CustomComponent({ parentValue }: { parentValue: number }) {
  // Create a responsive object. If this value changes, retry the render.
  // Like React, you can also create and use custom hooks
  const state = makeData<{ count: number; text: string }>({
    count: 1,
    text: 'text',
  });

  // Even if you don't use a ref, the private value is always maintained as a regular variable.
  let privateValue = parentValue;

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

  // To take advantage of closures, we've wrapped the function in two layers.
  return () => {
    // This is where you'll need to specify an action to run the effect or unmount the hook.
    effect(handleMounted); // Only Mounted
    effect(handleUpdated, [privateValue]); // Only Defs Updated
    unmount(handleUnmount); // Only Unmounted

    // The second return contains only JSX tags.
    return (
      <Fragment>
        {/* Note that the event is onInput (we use the native event name to avoid confusion). */}
        <input type="text" value={state.text} onInput={handleInputChane} />
        <div ref={domRef}>count: {state.count}</div>
        <div>privateValue: {privateValue}</div>
        <div>sum: {state.count + privateValue}</div>
        <button onClick={increase}>Increase</button>
      </Fragment>
    );
  };
}

const Root = (
  <div>
    <CustomComponent parentValue={7} />
  </div>
);

render(Root, document.getElementById('root'));
```

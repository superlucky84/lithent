// example.jsx
import {
  h,
  Fragment,
  render,
  updater,
  makeRef,
  mounted,
  update,
  WDom,
} from '@/index';

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

    return () => console.log('UNMOUNT');
  };
  const handleUpdated = () => {
    console.log('UPDATE');

    return () => console.log('UPDATED');
  };

  mounted(handleMounted); // Only Mounted
  update(handleUpdated, () => [privateValue]); // Only Defs Updated (using a closure to update a value)

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

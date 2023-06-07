// example.jsx
import {
  h,
  Fragment,
  render,
  state,
  makeUpdater,
  makeRef,
  mounted,
  update,
  effect,
  WDom,
} from '@/index';

// This is the "mount" function.
// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// childen is passed as the second argument.
const ChildComponent = (props: { parentValue: number }, children: WDom[]) => {
  // The value is used as a "getter" to make it easy to get and write to in the higher-order functions it returns
  const [getCount, setCount] = state<number>(1);
  const [getText, setText] = state<string>('text');
  const getParentValue = () => props.parentValue;
  const parentValue = props.parentValue;
  const updater = makeUpdater({ value: 3 });

  // Even if you don't use a ref, the private value is always maintained as a regular variable.
  let notRefValue = props.parentValue;

  // Ref is only used to reference the DOM.
  const domRef = makeRef(null);

  const increase = () => {
    setCount(getCount() + 1);
    notRefValue += 1;
    updater.value += 1;
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
      <div>updater: {updater.value} (use makeUpdater)</div>
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

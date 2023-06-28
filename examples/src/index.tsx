// example.jsx
import {
  h,
  Fragment,
  render,
  ref,
  mountCallback,
  updateCallback,
  mount,
} from 'lithent';
import { state, computed, effect, store } from 'lithent/helper';

// This is the "mount" function.
// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// childen is passed as the second argument.
const ChildComponent = mount<{ parentValue: number }>(
  (renew, props, children) => {
    // The value is used as a "getter" to make it easy to get and write to in the higher-order functions it returns
    const count = state<number>(1, renew);
    const text = state<string>(
      '"destructuring" the "props" value directly from the mount function will cause referencing issues, so if you want to use it, you need to "destructuring" it from the internal function (updater).',
      renew
    );
    const getParentValue = () => props.parentValue;
    const parentValueFromMount = props.parentValue;
    const summ = computed<number>(
      () => count.v + notRefValue + props.parentValue
    );

    const localStore = store<{ text: string; count: number }>({
      text: 's',
      count: 0,
    })(renew);
    /*
    // To share a store, make it externally and use `asign`.
    const asignStore = store<{ text: string; count: number }>({ text: 's', count: 0 });

    const sharedStore = asignStore(nenew);
    */

    // Even if you don't use a ref, the private value is always maintained as a regular variable.
    let notRefValue = props.parentValue;

    // Ref is only used to reference the DOM.
    const domRef = ref(null);

    const increase = () => {
      count.v = count.v + 1;
      notRefValue += 1;
    };

    const handleInputChane = (event: InputEvent) => {
      text.v = (event.target as HTMLInputElement).value;
    };

    const localStoreUpdate = () => {
      localStore.count += 1;
      localStore.text += '1';
    };

    const handleMounted = () => {
      console.log('MOUNTED', domRef);

      return () => console.log('UNMOUNT');
    };
    const handleUpdated = () => {
      console.log('UPDATE - parentValue');

      return () => console.log('UPDATED');
    };

    mountCallback(handleMounted);
    updateCallback(handleUpdated, () => [props.parentValue]); // Only Defs Updated (using a closure to update a value)

    // Behaves like `react`'s `useEffect`
    effect(
      () => console.log('INJECT'),
      () => console.log('CLEAN_UP'),
      () => [count.v]
    );

    // Wrap in a function and return (using a closure to hold the value)
    // This is the "update" function.
    return ({ parentValue }) => (
      <Fragment>
        {/* Note that the event is onInput (we use the native event name to avoid confusion). */}
        <div>
          <textarea
            value={text.v}
            onInput={handleInputChane}
            style={{ width: '300px', height: '100px' }}
          />
        </div>
        <div>{text.v}</div>
        <div>
          <div style={{ color: 'blue' }}>
            parentValueFromRef: {props.parentValue} (working)
          </div>
          <div style={{ color: 'blue' }}>
            parentValueFromFunction: {getParentValue()} (working)
          </div>
          <div style={{ color: 'blue' }}>
            parentValueFromUpdaterDestructuring: {parentValue} (working)
          </div>
          <div style={{ color: 'red' }}>
            parentValueFromMounterDestructuring: {parentValueFromMount} (not
            working)
          </div>
        </div>
        <div>
          <div ref={domRef}>count: {count.v}</div>
          <div>sum: {count.v + notRefValue + props.parentValue}</div>
          <div>sum(computed): {summ.v}</div>
          {/* It doesn't pull it out from under the reference, it uses the value directly, so you can just use it. */}
          <div>notRefValue: {notRefValue}</div>
          <div>localStore(text): {localStore.text}</div>
          <div>localStore(count): {localStore.count}</div>
        </div>
        <button onClick={increase}>Increase</button>
        <button onClick={localStoreUpdate}>localStoreUpdate</button>
        {children}
      </Fragment>
    );
  }
);

const Root = mount(renew => {
  const parentNumber = state<number>(7, renew);

  const increaseParent = () => {
    parentNumber.v = parentNumber.v + 1;
  };

  const decreaseParent = () => {
    parentNumber.v = parentNumber.v - 1;
  };

  return () => (
    <Fragment>
      <ChildComponent parentValue={parentNumber.v}>
        <button onClick={increaseParent}>Increase - Parent</button>
      </ChildComponent>
      <button onClick={decreaseParent}>Decrease - Parent</button>
    </Fragment>
  );
});
const root = <Root />;

render(root, document.getElementById('root'));

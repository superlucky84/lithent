import { h, Fragment, makeRef, wwact, makeData, render } from '@/index';

type State = { count: number; text: string };
type Private = {
  privateValue: number;
  domRef: { value: HTMLElement | null };
  increase: () => void;
  handleInputChange: (event: InputEvent) => void;
};
type Props = { parentValue: number };

const ChildComponent = wwact<State, Private, Props>({
  signal: {
    count: 1,
    text: 'text',
  },
  makePrivates({ state }) {
    const value = {
      privateValue: 1,
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        state.count += 1;
        value.privateValue += 1;
      },
      handleInputChange(event: InputEvent) {
        state.text = (event.target as HTMLInputElement).value;
      },
    };
    return value;
  },
  callbacks: {
    mountedCallback(info) {
      return () => console.log('MOUNTED', info);
    },
    updatedCallback(info) {
      return () => console.log('MOUNTED', info);
    },
    unmountCallback(info) {
      return () => console.log('UNMOUNT', info);
    },
  },
  makeComponent({
    state: { text, count },
    props: { parentValue },
    values: { privateValue, handleInputChange, domRef, increase },
    children,
  }) {
    return (
      <Fragment>
        <input type="text" value={text} onInput={handleInputChange} />
        <div ref={domRef}>count: {count}</div>
        <div>privateValue: {privateValue}</div>
        <div>parentalue: {parentValue}</div>
        <div>sum: {count + privateValue + parentValue}</div>
        {children}
        <button onClick={increase}>Increase</button>
      </Fragment>
    );
  },
});

function Root() {
  const parentState = makeData<{ count: number }>({ count: 7 });

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

import { h, Fragment, make, makeRef, render } from '@/index';

type State = { count: number; text: string };
type Private = {
  privateValue: number;
  domRef: { value: HTMLElement | null };
  increase: () => void;
  decrease: () => void;
  handleInputChange: (event: InputEvent) => void;
};
type Props = { parentValue: number };

const Component = make<State, Private, Props>({
  signal: {
    count: 1,
    text: 'text',
  },
  makePrivates({ state, values }) {
    return {
      privateValue: 7,
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        state.count += 1;
        values.privateValue += 1;
      },
      decrease() {
        state.count -= 1;
      },
      handleInputChange(event: InputEvent) {
        state.text = (event.target as HTMLInputElement).value;
      },
    };
  },
  makeCallbacks(info) {
    return {
      mountedCallback() {
        console.log('MOUNTED', info);
      },
      updatedCallback() {
        return [() => console.log('UPDATED'), [info.values.privateValue]];
      },
      unmountCallback() {
        console.log('UNMOUNT', info);
      },
      updateCallback() {
        console.log('UPDATE');
      },
      mountCallback() {
        console.log('MOUNT');
      },
    };
  },
  makeComponent({
    state: { text, count },
    props: { parentValue },
    values: { privateValue, handleInputChange, domRef, increase, decrease },
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
        <div>
          <button onClick={increase}>Increase</button>
          <button onClick={decrease}>Decrease</button>
        </div>
      </Fragment>
    );
  },
});

render(
  <Component parentValue={7}>childText</Component>,
  document.getElementById('root')
);

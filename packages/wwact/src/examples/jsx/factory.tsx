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
  member({ signal, member }) {
    return {
      privateValue: 7,
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        signal.count += 1;
        member.privateValue += 1;
      },
      decrease() {
        signal.count -= 1;
      },
      handleInputChange(event: InputEvent) {
        signal.text = (event.target as HTMLInputElement).value;
      },
    };
  },
  callback(info) {
    return {
      mount() {
        console.log('MOUNT');
      },
      update() {
        console.log('UPDATE');
      },
      mounted() {
        console.log('MOUNTED', info);
      },
      updated() {
        return [() => console.log('UPDATED'), [info.member.privateValue]];
      },
      unmount() {
        console.log('UNMOUNT', info);
      },
    };
  },
  template({
    signal: { text, count },
    props: { parentValue },
    member: { privateValue, handleInputChange, domRef, increase, decrease },
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

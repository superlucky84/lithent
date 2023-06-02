import { h, Fragment, make, makeRef, render, makeData } from '@/index';

type Signal = { count: number; text: string };
type Member = {
  privateValue: number;
  mixinData: { value: number };
  domRef: { value: HTMLElement | null };
  increase: () => void;
  decrease: () => void;
  handleInputChange: (event: InputEvent) => void;
};
type Props = { parentValue: number };

const Component = make<Signal, Member, Props>({
  signal: {
    count: 1,
    text: 'text',
  },
  member({ signal, member }) {
    return {
      privateValue: 7,
      mixinData: { value: 0 },
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        member.mixinData.value += 1;
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
        info.member.mixinData = makeData({ value: 3 });
        console.log('MOUNT', info.member.mixinData);
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
    member: {
      mixinData,
      privateValue,
      handleInputChange,
      domRef,
      increase,
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
          <button onClick={increase}>Increase</button>
          <button onClick={decrease}>Decrease</button>
        </div>
      </Fragment>
    );
  },
});

render(<Component parentValue={9} />, document.getElementById('root'));

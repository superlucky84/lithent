import {
  h,
  Fragment,
  make,
  makeRef,
  render,
  makeSignal,
  mounted,
  updated,
  unmount,
} from '@/index';

type Signal = { count: number; text: string };
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
        signal.count += 1;
        member.privateValue += 1;
      },
      increaseMixin() {
        member.mixinData.value += 1;
      },
      decrease() {
        signal.count -= 1;
      },
      handleInputChange(event: InputEvent) {
        signal.text = (event.target as HTMLInputElement).value;
      },
    };
  },
  mount(info) {
    const { member } = info;
    const { privateValue } = member;

    info.member.mixinData = makeSignal({ value: 3 });

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
    signal: { text, count },
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

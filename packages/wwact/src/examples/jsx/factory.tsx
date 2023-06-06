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
} from '@/index';

type Member = {
  doer: { count: number; text: string };
  decrease: () => void;
  increase: () => void;
  changeText: (event: InputEvent) => void;
  privateValue: number;
  domRef: { value: HTMLElement | null };
};
type Props = { parentValue: number };

const Component = make<Props, Member>(
  ({ props, member }) => {
    let privateValue = props.parentValue;
    const domRef = makeRef(null);
    const doer = updater({
      count: 1,
      text: 'text',
    });

    const increase = () => {
      doer.count += 1;
      member.privateValue += 1;
    };

    const decrease = () => {
      doer.count -= 1;
    };

    const changeText = (event: InputEvent) => {
      doer.text = (event.target as HTMLInputElement).value;
    };

    mounted(() => console.log('MOUNTED'));
    unmount(() => console.log('UNMOUNT'));

    // Working
    updated(
      () => console.log('UPDATED'),
      () => [member.privateValue] // (using a closure to update a value)
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

    return { doer, increase, decrease, changeText, privateValue, domRef };
  },
  ({
    props: { parentValue },
    member: {
      doer: { text, count },
      privateValue,
      domRef,
      increase,
      decrease,
      changeText,
    },
    children,
  }) => {
    const sum = count + privateValue + parentValue;

    return (
      <Fragment>
        <input type="text" value={text} onInput={changeText} />
        <div ref={domRef}>count: {count}</div>
        <div>privateValue: {privateValue}</div>
        <div>parentalue: {parentValue}</div>
        <div>sum: {sum}</div>
        {children}
        <div>
          <button onClick={increase}>Increase</button>
          <button onClick={decrease}>Decrease</button>
        </div>
      </Fragment>
    );
  }
);

render(<Component parentValue={9} />, document.getElementById('root'));

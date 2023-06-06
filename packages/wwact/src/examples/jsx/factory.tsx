import {
  h,
  Fragment,
  make,
  makeRef,
  render,
  mounted,
  update,
  unmount,
} from '@/index';

type Updater = { count: number; text: string };
type Member = {
  privateValue: number;
  domRef: { value: HTMLElement | null };
  increase: () => void;
  decrease: () => void;
  handleInputChange: (event: InputEvent) => void;
};
type Props = { parentValue: number };

const Component = make<Updater, Member, Props>({
  updater({ props }) {
    return {
      count: props.parentValue,
      text: 'text',
    };
  },
  member({ updater, member }) {
    return {
      privateValue: 7,
      mixinData: { value: 0 },
      domRef: makeRef<HTMLElement | null>(null),
      increase() {
        updater.count += 1;
        member.privateValue += 1;
      },
      decrease() {
        updater.count -= 1;
      },
      handleInputChange(event: InputEvent) {
        updater.text = (event.target as HTMLInputElement).value;
      },
    };
  },
  mounter(info) {
    const { member } = info;
    const { privateValue } = member;

    mounted(() => console.log('MOUNTED'));
    unmount(() => console.log('UNMOUNT'));

    // Working
    update(
      () => {
        return () => console.log('UPDATED');
      },
      () => [info.member.privateValue] // (using a closure to update a value)
    );
    update(
      () => () => console.log('UPDATED2'),
      () => [member.privateValue]
    );

    // Not working
    // The `callback` doesn't work because the `privateValue` is closed with a non-reference value.
    update(
      () => console.log('UPDATED3'),
      () => [privateValue]
    );
  },
  template({
    updater: { text, count },
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

render(<Component parentValue={9} />, document.getElementById('root'));

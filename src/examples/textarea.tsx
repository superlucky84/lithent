// example.jsx
import { h, render, mount } from '@/index';

const TextArea = mount(renew => {
  let text = '123';

  const changeInput = (event: InputEvent) => {
    text = (event?.target as HTMLInputElement).value;
    renew();
  };

  return () => (
    <div>
      <textarea onInput={changeInput}>{text}</textarea>
      <div>{text}</div>
    </div>
  );
});
const Root = <TextArea />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));

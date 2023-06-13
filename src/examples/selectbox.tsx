// example.jsx
import { h, render, Fragment, mount } from '@/index';

const Selectbox = mount(renew => {
  let value = '3';

  const changeChange = (event: InputEvent) => {
    value = (event.target as HTMLInputElement).value;
    renew();
  };

  return () => (
    <Fragment>
      <div>{value}</div>
      <div>
        <select onChange={changeChange}>
          <option value="1" selected={value === '1'}>
            1
          </option>
          <option value="2" selected={value === '2'}>
            2
          </option>
          <option value="3" selected={value === '3'}>
            3
          </option>
          <option value="4" selected={value === '4'}>
            4
          </option>
          <option value="5" selected={value === '5'}>
            5
          </option>
        </select>
      </div>
    </Fragment>
  );
});
const Root = <Selectbox />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));

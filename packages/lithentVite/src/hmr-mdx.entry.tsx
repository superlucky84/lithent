import { mount, render } from 'lithent';
import MdxExample from './hmr-mdx.example.mdx';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <button onClick={increment}>increase</button>
      <p>count: {count}</p>
    </div>
  );
});

const RootMdx = mount(() => {
  return () => <MdxExample components={{ Counter }} />;
});

const container = document.getElementById('app');

if (container) {
  render(<RootMdx />, container);
}

export default RootMdx;

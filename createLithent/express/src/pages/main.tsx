import { state } from 'lithent/helper';
import { h, mount } from 'lithent';
import Layout from '@/layout';

const Main = mount(r => {
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };
  return () => (
    <Layout>
      <div>9!0</div>
      <div>99999</div>
      <div>
        <span>{num.value}</span>
        main <button onClick={handleClick}>increase =-{num.value} </button>
        ava
      </div>
      <div>77790</div>
    </Layout>
  );
});

export default Main;

import { state } from 'lithent/helper';
import { h, mount } from 'lithent';
import Layout from '@/layout';

const Index = mount(r => {
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };
  return () => (
    <Layout>
      <div>12333444777</div>
      <div>999</div>
      <div>
        <span>{num.value}</span>
        INDEX <button onClick={handleClick}>increase =-{num.value} </button>
        ava
      </div>
      <div>77790</div>
    </Layout>
  );
});

export default Index;

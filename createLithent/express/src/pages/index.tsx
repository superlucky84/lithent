import { state } from 'lithent/helper';
import { h, mount } from 'lithent';
import Layout from '@/layout';
import { navigate } from '@/route';

console.log('NVAI', navigate);

const Index = mount(r => {
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };
  return () => (
    <Layout>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>12334</div>
      <div>999990277</div>
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

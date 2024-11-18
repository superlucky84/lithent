import { h, mount } from 'lithent';
import Layout from '@/layout';
import { render } from '@/route';

const Sub = mount(_r => {
  const handleClick = () => {
    console.log('a');
  };
  return () => (
    <Layout>
      <div>
        sub <button onClick={handleClick}>increase</button>
      </div>
    </Layout>
  );
});

export default render(Sub);

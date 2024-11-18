import { renderWithHydration } from 'lithent/ssr';
import { h, mount } from 'lithent';
import Layout from '@/layout';

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

export default renderWithHydration(Sub);

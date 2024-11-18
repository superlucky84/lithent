import { renderWithHydration } from 'lithent/ssr';
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
      <div>09990</div>
      <div>999</div>
      <div>
        <span>{num.value}</span>
        main <button onClick={handleClick}>increase =-{num.value} </button>
        ava
      </div>
      <div>7770</div>
    </Layout>
  );
});

export default renderWithHydration(Main);

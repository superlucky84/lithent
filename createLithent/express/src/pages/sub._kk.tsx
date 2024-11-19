import { h, mount } from 'lithent';
import Layout from '@/layout';
import { PageProps } from '@/types';

const Sub = mount<PageProps>((_r, props) => {
  const params = props.params;
  const handleClick = () => {
    console.log('a');
  };

  console.log('PARAMS', params);

  return () => (
    <Layout>
      <div>
        sub <button onClick={handleClick}>increase</button>
      </div>
    </Layout>
  );
});

export default Sub;

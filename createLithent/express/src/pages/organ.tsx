import { state } from '@/engine/helper';
import { h, mount } from '@/engine';
import Layout from '@/layout';
import type { Organ, PageProps } from '@/types';

export const makeInitProp = async () => {
  const result = await fetch(
    'http://localhost:3000/assets/choonsik_company_org.json'
  );
  return result.json();
};

const Organ = mount<PageProps<Organ>>((r, props) => {
  const query = props.query;
  const initProp = props.initProp;
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };

  console.log('QUERY', query);
  console.log('INITPROP', initProp);

  return () => (
    <Layout>
      <div>!9!000</div>
      <div>99999</div>
      <div>
        <span>{num.value}</span>
        index{' '}
        <button class="btn" onClick={handleClick}>
          increase =-{num.value}{' '}
        </button>
        ava
      </div>
      <div>77790</div>
    </Layout>
  );
});

export default Organ;

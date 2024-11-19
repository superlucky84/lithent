import { state } from 'lithent/helper';
import { h, mount } from 'lithent';
import Layout from '@/layout';
import { PageProps } from '@/types';

export const makeInitProp = async () => {
  const result = await fetch(
    'https://pokeapi.co/api/v2/pokemon?limit=10&offset=0'
  );

  return result.json();
};

const Main = mount<
  PageProps<{
    count: number;
    next: string;
    results: { name: string; url: string }[];
  }>
>((r, props) => {
  const params = props.params;
  const initProp = props.initProp;
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };

  console.log('PARAMS', params);
  console.log('INITPROP', initProp);

  return () => (
    <Layout>
      <div>9!0</div>
      <div>{initProp.count}</div>
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

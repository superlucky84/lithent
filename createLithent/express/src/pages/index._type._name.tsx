import { state } from 'lithent/helper';
import { h, mount, Fragment } from 'lithent';
import { PageProps } from '@/types';
import { getPreloadData } from '@/helper';

export const preload = async ({ params }: any) => {
  const result = await fetch(`https://pokeapi.co/api/v2/type/${params.type}`)
    .then(response => response.json())
    .then(data => {
      return data.pokemon
        .map(
          (pokemon: { pokemon: { name: string; url: string }[] }) =>
            pokemon.pokemon
        )
        .filter(
          (_item: { name: string; url: string }[], index: number) => index < 32
        );
    });

  const data = result;

  return {
    layout: {
      title: 'INDEX',
    },
    data,
  };
};

const Main = mount<
  PageProps<{
    count: number;
    next: string;
    results: { name: string; url: string }[];
  }>
>((r, props) => {
  const preload = getPreloadData<{ data: { name: string; url: string }[] }>();
  const params = props.params;
  const initProp = props.initProp;
  const num = state(1, r);
  const handleClick = () => {
    num.value += 1;
  };

  console.log('PARAMS', params);
  console.log('INITPROP', initProp);
  console.log(preload);

  return () => (
    <Fragment>
      <div>!9!000</div>
      <div>{preload.data[0].name}</div>
      <div>
        <span>{num.value}</span>
        index{' '}
        <button class="btn" onClick={handleClick}>
          increase =-{num.value}{' '}
        </button>
        ava
      </div>
      <div>77790</div>
    </Fragment>
  );
});

export default Main;

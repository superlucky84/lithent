import { h, Fragment } from '@/wDom';
import useData from '@/hook/useData';
import updated from '@/hook/updated';
import makeRef from '@/hook/ref';
import Custom2 from './Custom2';

const useJw = () => {
  const data = useData({ k: 7, j: 1 });
  const data2 = useData({ k: 1 });

  const handle = () => {
    data.k += 1;
    data.j += 1;
  };
  const handle2 = () => {
    data2.k += 1;
  };

  return { data, data2, handle, handle2 };
};

export default function CustomElement({ props, children }) {
  const { data, data2, handle, handle2 } = useJw();
  const data3 = useData({ k: 1 });
  const handle3 = () => {
    data3.k += 1;
  };
  const hadleRef = makeRef({ handle3 });
  const domRef = makeRef(null);

  const handleUpdatedDataK = () => {
    console.log('domRef', domRef);
    console.log('updated k', data);
    data3.k += 10;
  };
  const handleUpdatedData2K = () => {
    console.log('updated 2k', data2);
  };

  const componentMaker = () => {
    updated(handleUpdatedDataK, [data.k]);
    updated(handleUpdatedData2K, [data2.k]);

    return (
      <div class={`aa${data.k}`}>
        <button onClick={handle}>vava{data.k}aa</button>
        <button onClick={handle2}>{data2.k}-vava</button>
        <button onClick={handle3}>{data3.k}-vava</button>
        {data.k % 2 === 0 ? <Custom2 k={data.k} hadleRef={hadleRef} /> : null}
        <div ref={domRef}>
          <div>data.k: {data.k}</div>
          <div>data.j: {data.j}</div>
          <div>data2.k: {data2.k}</div>
          <div>data3.k: {data3.k}</div>
        </div>
        <br />
        <br />
      </div>
    );
  };

  return componentMaker;
}

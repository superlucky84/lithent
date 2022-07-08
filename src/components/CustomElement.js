import { h, Fragment } from '../jsx';
import useData from '@/hook/useData';
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

  const componentMaker = () => {
    return (
      <div class={`aa${data.k}`}>
        <button onClick={handle}>vava{data.k}aa</button>
        <button onClick={handle2}>{data2.k}-vava</button>
        <button onClick={handle3}>{data3.k}-vava</button>
        {data.k % 2 === 0 ? <span>j</span> : null}
        <Custom2 k={data.k} />
        <Custom2 k={data.k + 1} />
        <div>
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

/*
h("div", {}, 
  h("span", {}, j, "-vava"), 
  h("span", {}, w, "-vava"), 
  j % 2 === 0 ? h("div", null, "1111") : null, 
  h(Custom2, {}),
  h(Custom2, {}),
  h("div", null, 
    h("div", null, j),
    h("div", null, w)));


function k(n) {
  console.log('k', n);
}

k(7, k(1), k(2, k(4), k(5), k(6)), k(3));
*/

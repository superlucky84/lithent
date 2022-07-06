import { h, Fragment } from '../jsx';
import useData from '@/hook/useData';
import Custom2 from './Custom2';

export default function CustomElement({ props, children }) {
  console.log('re');

  const [data, setData] = useData({ k: 7 });
  const [data2, setData2] = useData({ k: 7 });

  const handle = () => {
    setData({ k: data.k + 1 });
  };
  const handle2 = () => {
    setData2({ k: data2.k + 1 });
  };

  const componentMaker = () => {
    return (
      <div class={`aa`}>
        <span onClick={handle}>vava{data.k}aa</span>
        <span onClick={handle2}>{data2.k}-vava</span>
        {data.k % 2 === 0 ? <span>j</span> : null}
        <Custom2 k={data.k} />
        <Custom2 k={data.k + 1} />
        <div>
          <div>{data.k}</div>
        </div>
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

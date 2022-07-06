import { h, Fragment } from '../jsx';
import useState from '@/hook/useState';
import Custom2 from './Custom2';

export default function CustomElement({ props, children }) {
  const [j, setJ] = useState(3);
  const [w, setW] = useState(3);
  const handle = () => {
    setJ(j + 1);
  };
  const handle2 = () => {
    setW(w + 1);
  };

  return (
    <div class={`aa${j}`} kk={j}>
      <span onClick={handle}>{j}-vava</span>
      <span onClick={handle2}>{w}-vava</span>
      {j % 2 === 0 ? <div>1111</div> : null}
      <Custom2 k={j} />
      <Custom2 k={j + 1} />
      <div>
        <div>{j}</div>
        <div>{w}</div>
      </div>
    </div>
  );
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

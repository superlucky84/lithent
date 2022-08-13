import { makeCursor } from '@/util';

import step1 from '@/step1';
import step2 from '@/step2';
import step3 from '@/step3';

export function parse(code) {
  const stepIns = new step1(makeCursor(code, ['"', '{', '}']));
  const step1Result = stepIns.run();
  const addedProps = step2(step1Result);
  const result = step3(addedProps).replace(/,\s*/, 'return ') + ';';

  return result;
}

/*
const code = `
<div
  class   =   {\`aaaaaaaaa$\{data.k\}\`} jj  =  "2" kk={3}>
  <span w-if={a}>a</span>
  <span w-else-if={b}>b</span>
  <span w-else-if={c}>c</span>
  <span w-else>s</span>

  <Custom w-for={list} w-if={true} jj="kk" />
  <button onClick={handle}>{ssv} !vava{data.k}a {data.j}a  asdlg  asdg</button>
  <button onClick={handle2}>{data2.k}-vava</button>
  <button onClick={handle3}>{data3.k}-vava</button>
  <div ref={domRef}>
    <div>data.k: {data.k}</div>
    <div>data.j: {data.j}</div>
    <div>data2.k: {data2.k}</div>
    <div>data3.k: {data3.k}</div>
  </div>
  <br />
  <br />
</div>
`.trim();

console.log(code);
console.log(parse(code));
*/

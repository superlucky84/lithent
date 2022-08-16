import { makeCursor } from '@/util';

import step1 from '@/step1';
import step2 from '@/step2';
import step3 from '@/step3';

export function parse(code) {
  const stepIns = new step1(makeCursor(code, ['"', '{', '}']));
  const step1Result = stepIns.run();
  console.log(step1Result);
  const addedProps = step2(step1Result);
  const result = step3(addedProps).replace(/,\s*/, 'return ') + ';';

  return result;
}

const code = `
<div class="root">
  <button w-if={a > 1} onClick={handle}>one{two}three</button>
  <button w-else-if={ a < 1} onClick={handle2}>onetwothree</button>
  <button w-else onClick={handle3}>cc</button>
</div>
`.trim();

console.log(code);
console.log(parse(code));

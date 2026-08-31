// DOM 순서 정합성 검증: keyed 리스트의 다양한 변형 후 실제 DOM 순서가 데이터와 일치하는지 확인
// 실행: node docs/performance-improvement/bench/verify-order.mjs (저장소 루트에서)
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(root + '/package.json');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="root"></div></body></html>'
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DocumentFragment = dom.window.DocumentFragment;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Text = dom.window.Text;
globalThis.Node = dom.window.Node;

// Core under test: the base build by default; set LITHENT_CORE=concurrent to
// point the same benchmark at lithent-concurrent (C2 — the concurrent build is
// judged on the same scenarios, not on a separate harness).
const coreBundle =
  process.env.LITHENT_CORE === 'concurrent'
    ? root + '/lithentConcurrent/dist/lithentConcurrent.mjs'
    : root + '/dist/lithent.mjs';
const { h, mount, render } = await import(coreBundle);

let data = [];
let renewFn;
let failures = 0;

const App = mount(renew => {
  renewFn = renew;
  return () =>
    h(
      'div',
      {},
      h(
        'ul',
        {},
        data.map(item => h('li', { key: item.id }, String(item.id)))
      ),
      h('footer', {}, 'FOOTER')
    );
});

render(h(App, {}), document.getElementById('root'));

const flush = () => Promise.resolve();

const assertOrder = async name => {
  renewFn();
  await flush();
  const actual = [...document.querySelectorAll('li')].map(li => li.textContent);
  const expected = data.map(d => String(d.id));
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  // footer가 ul 밖에서 li 뒤에 오는지 (리스트 경계 침범 검증)
  const ul = document.querySelector('ul');
  const boundary =
    ul.querySelector('footer') === null &&
    ul.nextElementSibling?.tagName === 'FOOTER' &&
    [...ul.children].every(c => c.tagName === 'LI');
  if (!ok || !boundary) {
    failures++;
    console.log(`FAIL ${name}`);
    if (!ok)
      console.log(
        '  expected',
        expected.join(','),
        '\n  actual  ',
        actual.join(',')
      );
    if (!boundary) console.log('  boundary violated: footer/ul mixing');
  } else {
    console.log(`ok   ${name}`);
  }
};

const set = ids => {
  data = ids.map(id => ({ id }));
};

set([1, 2, 3, 4, 5]);
await assertOrder('initial 1-5');

set([1, 4, 3, 2, 5]);
await assertOrder('swap 2<->4');

set([5, 4, 3, 2, 1]);
await assertOrder('reverse');

set([3, 1, 4, 1.5, 5, 9, 2, 6]);
await assertOrder('shuffle + add + remove');

set([3, 1, 4, 1.5, 5, 9, 2, 6, 10, 11]);
await assertOrder('append 2 at end');

set([0, 3, 1, 4, 1.5, 5, 9, 2, 6, 10, 11]);
await assertOrder('prepend 1');

set([0, 3, 1, 99, 4, 1.5, 5, 9, 2, 6, 10, 11]);
await assertOrder('insert middle');

set([0, 3, 99, 4, 5, 9, 6, 10, 11]);
await assertOrder('remove scattered');

set([]);
await assertOrder('clear');

set([7, 8, 9]);
await assertOrder('refill after clear');

set([9, 7, 8]);
await assertOrder('rotate');

set([20, 9, 21, 7, 22, 8, 23]);
await assertOrder('interleave new');

const N = 500;
set(Array.from({ length: N }, (_, i) => i));
await assertOrder('bulk init 500');
for (let round = 0; round < 5; round++) {
  const arr = data.map(d => d.id);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const kept = arr.slice(0, 450);
  kept.splice(100, 0, 1000 + round * 10, 1001 + round * 10);
  set(kept);
  await assertOrder(`random shuffle round ${round}`);
}

set([]);
await assertOrder('clear after shuffles');
set([1, 2, 3]);
await assertOrder('refill again');

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
process.exit(failures ? 1 : 0);

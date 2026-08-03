// Micro-benchmark: js-framework-benchmark 스타일 시나리오로 lithent diff/render 스케일링 측정
import { createRequire } from 'module';
const require = createRequire('/Users/n250109005/project/lithent/package.json');
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

const { h, mount, render } = await import(
  '/Users/n250109005/project/lithent/dist/lithent.mjs'
);

let idCounter = 1;
const buildData = n =>
  Array.from({ length: n }, () => ({
    id: idCounter++,
    label: 'row label ' + Math.random().toString(36).slice(2, 8),
  }));

let data = [];
let renewFn;

const App = mount(renew => {
  renewFn = renew;
  return () =>
    h(
      'table',
      {},
      data.map(item =>
        h(
          'tr',
          { key: item.id, class: 'row' },
          h('td', { class: 'col-md-1' }, String(item.id)),
          h('td', { class: 'col-md-4' }, h('a', {}, item.label)),
          h('td', { class: 'col-md-6' }, 'x')
        )
      )
    );
});

render(h(App, {}), document.getElementById('root'));

// renew()는 queueMicrotask로 배칭되므로 microtask flush 후 측정 종료
const ms = async fn => {
  const t0 = performance.now();
  fn();
  await Promise.resolve();
  return performance.now() - t0;
};

const rowCount = () => document.querySelectorAll('tr').length;

const run = async n => {
  const r = {};
  data = [];
  renewFn();
  await Promise.resolve();

  r.create = await ms(() => { data = buildData(n); renewFn(); });
  if (rowCount() !== n) throw Error(`create failed: ${rowCount()} !== ${n}`);

  r.updateEvery10th = await ms(() => {
    data.forEach((item, i) => { if (i % 10 === 0) item.label += ' !!!'; });
    renewFn();
  });

  r.swap = await ms(() => {
    const tmp = data[1]; data[1] = data[data.length - 2]; data[data.length - 2] = tmp;
    renewFn();
  });

  r.replaceAll = await ms(() => { data = buildData(n); renewFn(); });
  if (rowCount() !== n) throw Error(`replace failed: ${rowCount()} !== ${n}`);

  r.append = await ms(() => { data = data.concat(buildData(Math.floor(n / 10))); renewFn(); });
  r.clear = await ms(() => { data = []; renewFn(); });
  if (rowCount() !== 0) throw Error(`clear failed: ${rowCount()} !== 0`);
  return r;
};

await run(200); // warmup

const sizes = [500, 1000, 2000, 4000];
const results = [];
for (const n of sizes) results.push({ n, ...(await run(n)) });

console.log('N\tcreate\tupd10th\tswap\treplace\tappend10%\tclear');
for (const r of results) {
  console.log(
    [r.n, r.create, r.updateEvery10th, r.swap, r.replaceAll, r.append, r.clear]
      .map(v => (typeof v === 'number' ? v.toFixed(1) : v))
      .join('\t')
  );
}

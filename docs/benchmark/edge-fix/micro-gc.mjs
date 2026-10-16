// One scenario on one core: W warm-up cycles, then K more between two markers
// that gc.py reads the --trace-gc-nvp lines of.
//   node --trace-gc-nvp micro-gc.mjs <name> <flat|cached|plain> <scenario> <W> <K>
import './stubdom.mjs';
import { out } from './paths.mjs';
const [name, app, scenario, W, K] = process.argv.slice(2);
const core = await import(`${out}/${name}/app.mjs`);
const flush = () => new Promise(queueMicrotask);
const scenarios = {
  create: { pre: b => b.clear(), act: b => b.run() },
  replace: { setup: b => b.run(), act: b => b.run() },
  update: { setup: b => b.run(), act: b => b.update() },
  select: { setup: b => b.run(), act: (b, i) => b.select(i) },
  swap: { setup: b => b.run(), act: b => b.swap() },
  remove: { pre: b => b.rows() < 900 && b.run(), act: b => b.remove() },
  create10k: { pre: b => b.clear(), act: b => b.runLots() },
  append: { pre: b => b.run(), act: b => b.add() },
  clear: { pre: b => b.run(), act: b => b.clear() },
};
const sc = scenarios[scenario];
const b = core.makeBench(document.createElement('tbody'), app);
if (sc.setup) {
  sc.setup(b);
  await flush();
}
const total = Number(W);
for (let i = 0; i < total; i++) {
  if (sc.pre) {
    sc.pre(b);
    await flush();
  }
  sc.act(b, i);
  await flush();
}
console.log('MEASURE_START');
for (let i = 0; i < Number(K); i++) {
  if (sc.pre) {
    sc.pre(b);
    await flush();
  }
  sc.act(b, i);
  await flush();
}
console.log('MEASURE_END');

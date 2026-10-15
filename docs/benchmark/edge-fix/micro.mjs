// One scenario on one core, no timing: W warm-up cycles then K more, so that
// callgrind's instruction count with K minus the one with 0 is the cost of K
// cycles (ir.sh).
//   node micro.mjs <name> <flat|cached|plain> <scenario> <W> <K>
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
const total = Number(W) + Number(K);
for (let i = 0; i < total; i++) {
  if (sc.pre) {
    sc.pre(b);
    await flush();
  }
  sc.act(b, i);
  await flush();
}

// DOM writes per scenario and app, counted on the stub DOM, compared across
// variants:  node domwrites.mjs <name...>
import './stubdom.mjs';
import { out } from './paths.mjs';
const counts = {};
const wrap = (proto, name) => {
  const orig = proto[name];
  proto[name] = function (...args) {
    counts[name] = (counts[name] || 0) + 1;
    return orig.apply(this, args);
  };
};
const el = document.createElement('div');
const E = Object.getPrototypeOf(el); // HTMLElement.prototype
const N = Object.getPrototypeOf(E); // Node.prototype
['insertBefore', 'removeChild', 'replaceChild'].forEach(m => wrap(N, m));
[
  'setAttribute',
  'removeAttribute',
  'addEventListener',
  'removeEventListener',
].forEach(m => wrap(E, m));
const tv = Object.getOwnPropertyDescriptor(N, 'textContent');
Object.defineProperty(N, 'textContent', {
  get: tv.get,
  set(v) {
    counts.textContent = (counts.textContent || 0) + 1;
    tv.set.call(this, v);
  },
});
const flush = () => new Promise(queueMicrotask);
const scen = {
  create: [b => b.clear(), b => b.run()],
  replace: [null, b => b.run()],
  update: [null, b => b.update()],
  select: [null, (b, i) => b.select(i)],
  swap: [null, b => b.swap()],
  remove: [null, b => b.remove()],
  append: [null, b => b.add()],
  clear: [null, b => b.clear()],
};
const result = {};
for (const v of process.argv.slice(2)) {
  const core = await import(`${out}/${v}/app.mjs`);
  for (const app of ['flat', 'cached', 'plain'])
    for (const [s, [pre, act]] of Object.entries(scen)) {
      const b = core.makeBench(document.createElement('tbody'), app);
      b.run();
      await flush();
      for (let i = 0; i < 3; i++) {
        if (pre) {
          pre(b);
          await flush();
        }
        for (const k in counts) delete counts[k];
        act(b, i);
        await flush();
      }
      (result[`${app} ${s}`] ||= {})[v] = JSON.stringify(
        Object.keys(counts)
          .sort()
          .map(k => [k, counts[k]])
      );
    }
}
let same = 0;
for (const [k, r] of Object.entries(result)) {
  const vals = Object.values(r);
  if (vals.every(x => x === vals[0])) same++;
  else console.log('DIFF', k, r);
}
console.log(`${same}/${Object.keys(result).length} scenario writes identical`);

// Count metadata queries on cached identical rows. No timing measurement.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const out = fs.realpathSync(process.argv[2]),
  prior = fs.realpathSync(process.argv[3]);
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const records = [];
for (const [variant, stage] of [
  ['v1', prior],
  ['v2', out],
]) {
  const core = path.join(stage, 'source/overlay');
  const compiled = await build({
    stdin: {
      resolveDir: core,
      loader: 'ts',
      contents: `import {h,mount,render} from './index.ts';import {defineBlock} from './block.ts';Object.assign(globalThis,{h,mount,render,defineBlock});`,
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    alias: { '@': core },
    define: { __STATIC_DIAGNOSTIC__: 'false' },
  });
  for (const n of [1000, 10000]) {
    const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' });
    try {
      const w = dom.window;
      w.eval(compiled.outputFiles[0].text);
      const block = w.defineBlock({ tag: 'p', children: [{ slot: 0 }] }),
        nodes = Array.from({ length: n }, (_, i) => block(['row' + i], i));
      let renew;
      const App = w.mount(r => {
        renew = r;
        return () => w.h('div', {}, nodes);
      });
      const host = w.document.querySelector('main');
      w.render(w.h(App, {}), host);
      const first = host.querySelector('p'),
        last = host.querySelectorAll('p')[n - 1];
      const original = w.WeakMap.prototype.get;
      let queries = 0;
      w.WeakMap.prototype.get = function (key) {
        queries++;
        return original.call(this, key);
      };
      renew();
      for (let i = 0; i < 8; i++) await Promise.resolve();
      w.WeakMap.prototype.get = original;
      assert.equal(host.querySelector('p'), first);
      assert.equal(host.querySelectorAll('p')[n - 1], last);
      records.push({ variant, n, weakMapGets: queries });
    } finally {
      dom.window.close();
    }
  }
}
const a = records.filter(r => r.variant === 'v1'),
  b = records.filter(r => r.variant === 'v2');
assert(a[1].weakMapGets > a[0].weakMapGets);
assert.equal(b[0].weakMapGets, b[1].weakMapGets);
assert(b[0].weakMapGets < 50);
assert(a[0].weakMapGets > b[0].weakMapGets + 1000);
const result = {
  at: new Date().toISOString(),
  passed: true,
  scope:
    'untimed WeakMap.get counts in isolated unchanged-row fixture; normal core diff still runs',
  records,
};
fs.writeFileSync(
  path.join(out, 'identity-check.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(JSON.stringify(result));

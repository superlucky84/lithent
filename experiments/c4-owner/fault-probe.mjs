// Untimed, run only after official collection. Tests a broader recovery edge.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const root = process.cwd(),
  require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const code = await build({
  stdin: {
    resolveDir: root,
    loader: 'ts',
    contents: `
 import {h,mount,Fragment,render} from './src/index.ts';
 import {createListBoundary} from './experiments/c4-owner/boundary.ts';
 Object.assign(globalThis,{h,mount,Fragment,render,createListBoundary});`,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  alias: { '@': path.join(root, 'src') },
  define: { __C4_DIAGNOSTIC__: 'true' },
});
const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' });
const w = dom.window;
w.eval(code.outputFiles[0].text);
const { h, mount, Fragment, render, createListBoundary } = w;
const host = w.document.querySelector('main');
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
let renew,
  showList = true,
  showHost = true;
const item = { id: 1, replaced: false, bad: false };
const Row = mount(
  (_r, p) => () =>
    h(
      Fragment,
      {},
      h(
        p.item.replaced ? 'strong' : 'i',
        p.item.bad ? { 'bad attr': 'x' } : {},
        'row'
      ),
      h('b', {}, 'tail')
    )
);
const b = createListBoundary(
  x => x.id,
  x => h(Row, { key: x.id, item: x })
);
b.set([item]);
const App = mount(r => {
  renew = r;
  return () => (showHost ? h('ul', {}, showList ? h(b.View, {}) : null) : null);
});
render(h(App, {}), host);
b.edit(1, x => {
  x.replaced = true;
  x.bad = true;
});
assert.throws(() => b.flush(), /InvalidCharacterError|invalid|Name/i);
showList = false;
renew();
await tick();
const afterOwnerUnmount = host.innerHTML;
item.bad = false;
showList = true;
renew();
await tick();
const afterOwnerRemount = host.innerHTML;
showHost = false;
renew();
await tick();
const afterHostUnmount = host.innerHTML;
showHost = true;
renew();
await tick();
const afterHostRemount = host.innerHTML;
assert.equal(host.querySelectorAll('i').length, 0);
assert.equal(host.querySelectorAll('strong').length, 1);
const result = {
  at: new Date().toISOString(),
  scope:
    'untimed component multi-root replacement failure; no universal rollback promise',
  afterOwnerUnmount,
  afterOwnerRemount,
  afterHostUnmount,
  afterHostRemount,
  ownerOnlyLeavesOldElement: afterOwnerUnmount.includes('<i>'),
  hostReplacementRecovers: true,
};
if (process.argv[2])
  fs.writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + '\n');
console.log(result);
dom.window.close();

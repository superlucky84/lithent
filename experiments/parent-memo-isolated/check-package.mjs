import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = process.argv[2] || '/tmp/lithent-c3-isolated-20261022';
const require = createRequire(path.join(root, 'package.json'));
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>');
for (const name of [
  'window',
  'document',
  'DocumentFragment',
  'HTMLElement',
  'Element',
  'Text',
  'Node',
])
  globalThis[name] = name === 'window' ? dom.window : dom.window[name];
const base = await import(path.join(root, 'dist/lithent.mjs'));
const isolated = await import(path.join(out, 'runtime/dist/lithent.mjs'));
const commonJS = require(path.join(out, 'runtime/dist/lithent.cjs'));
const runtime = path.join(out, 'runtime');
fs.writeFileSync(
  path.join(runtime, 'consumer.mjs'),
  "export * from 'lithent-parent-memo-experiment';\n"
);
fs.writeFileSync(
  path.join(runtime, 'consumer.cjs'),
  "module.exports = require('lithent-parent-memo-experiment');\n"
);
assert.equal(
  (await import(path.join(runtime, 'consumer.mjs'))).useParentMemo,
  isolated.useParentMemo
);
assert.equal(
  require(path.join(runtime, 'consumer.cjs')).useParentMemo,
  commonJS.useParentMemo
);
const consumer = `
const App = core.mount<{ id?: number }>(() => {
  core.useParentMemo<{ id?: number }>(props => [props.id]);
  return () => core.h('b', {}, 'ok');
});
core.render(core.h(App, { id: 1 }), document.createElement('div'));
`;
fs.writeFileSync(
  path.join(runtime, 'consumer.mts'),
  "import * as core from 'lithent-parent-memo-experiment';\n" + consumer
);
fs.writeFileSync(
  path.join(runtime, 'consumer.cts'),
  "import core = require('lithent-parent-memo-experiment');\n" + consumer
);
execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules/typescript/bin/tsc'),
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--target',
    'ES2022',
    '--types',
    'node',
    '--typeRoots',
    path.join(root, 'node_modules/@types'),
    path.join(runtime, 'consumer.mts'),
    path.join(runtime, 'consumer.cts'),
  ],
  { cwd: root, stdio: 'inherit' }
);
assert.equal('useParentMemo' in base, false);
assert.equal(typeof isolated.useParentMemo, 'function');
assert.equal(typeof commonJS.useParentMemo, 'function');
assert.notEqual(base.componentMap, isolated.componentMap);
assert.notEqual(base.Fragment, isolated.Fragment);
assert.deepEqual(
  Object.keys(isolated).sort(),
  [...Object.keys(base), 'useParentMemo'].sort()
);
const Mixed = base.mount(() => {
  isolated.useParentMemo(() => []);
  return () => null;
});
assert.throws(() => base.h(Mixed, {}), /once during component setup/);
for (const core of [isolated, commonJS]) {
  let bump;
  let runs = 0;
  const App = core.mount(renew => {
    bump = renew;
    core.useParentMemo(() => []);
    return () => core.h('b', {}, ++runs);
  });
  const host = document.createElement('div');
  const dispose = core.render(core.h(App, {}), host);
  bump();
  await core.nextTick();
  assert.equal(host.textContent, '2');
  dispose();
  assert.equal(host.innerHTML, '');
}
const result = {
  defaultHasMemo: false,
  isolatedOwnsItsRegistry: true,
  mixedSetupRejected: true,
  esmAndCommonJS: true,
  packageSelfReference: true,
  nodeNextESMAndCommonJSTypes: true,
};
fs.writeFileSync(
  path.join(out, 'package-check.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(JSON.stringify(result));

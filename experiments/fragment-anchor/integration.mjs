import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const out = path.resolve(process.argv[2]);
const result = {};
for (const variant of ['baseline', 'candidate']) {
  result[variant] = {};
  const umd = {};
  vm.runInNewContext(
    fs.readFileSync(
      path.join(out, variant, 'production/lithent.umd.js'),
      'utf8'
    ),
    umd
  );
  for (const [format, core] of [
    ['cjs', require(path.join(out, variant, 'production/lithent.cjs'))],
    ['umd', umd.lithent],
  ]) {
    const node = core.h('span', { title: 'test' }, 'text');
    result[variant][format] = {
      exports: Object.keys(core).sort(),
      type: node.type,
      tag: node.tag,
      text: node.children[0].text,
      nodeKeys: Object.keys(node),
      childKeys: Object.keys(node.children[0]),
    };
  }
}
assert.deepEqual(result.baseline, result.candidate);
fs.writeFileSync(
  path.join(out, 'bundle-integration.json'),
  JSON.stringify(result, null, 2)
);
console.log('PASS: built CJS/UMD exports and WDom construction match');

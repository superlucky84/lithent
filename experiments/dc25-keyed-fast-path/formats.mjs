import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { root, hash, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const require = createRequire(import.meta.url);
const result = {};
for (const variant of ['baseline', 'candidate', 'concurrent']) {
  const directory =
    variant === 'concurrent'
      ? path.join(root, 'lithentConcurrent/dist')
      : path.join(out, variant, 'dist');
  const stem = variant === 'concurrent' ? 'lithentConcurrent' : 'lithent';
  result[variant] = {};
  for (const format of ['mjs', 'cjs', 'umd.js']) {
    const file = path.join(directory, stem + '.' + format);
    const bytes = fs.readFileSync(file);
    let api;
    if (format === 'mjs') api = await import(pathToFileURL(file));
    else if (format === 'cjs') api = require(file);
    else {
      const context = { queueMicrotask };
      vm.runInNewContext(bytes.toString(), context, { filename: file });
      api = context[stem];
    }
    const keys = Object.keys(api).sort();
    assert.equal('deferRender' in api, variant === 'concurrent');
    const node = api.h('b', { title: 'format probe' }, 'value');
    assert.equal(node.tag, 'b');
    assert.equal(node.children[0].text, 'value');
    const expected = result[variant].mjs?.exports;
    if (expected) assert.deepEqual(keys, expected);
    result[variant][format] = {
      sha256: hash(bytes),
      exports: keys,
      exportTypes: Object.fromEntries(keys.map(key => [key, typeof api[key]])),
      vnode: true,
    };
    if (variant === 'candidate') {
      assert.deepEqual(keys, result.baseline[format].exports);
      assert.deepEqual(
        result[variant][format].exportTypes,
        result.baseline[format].exportTypes
      );
    }
  }
}
write(path.join(out, 'formats.json'), result);
guard(out);
console.log(
  'Nine package-format export/VNode probes passed; baseline/candidate exports match.'
);

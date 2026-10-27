import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { root, hash, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
for (const name of ['dispose-build', 'dispose']) {
  const original = path.join(root, 'experiments/comprehensive', name + '.mjs');
  let code = fs
    .readFileSync(original, 'utf8')
    .replaceAll(
      "'./init.mjs'",
      JSON.stringify(
        pathToFileURL(
          path.join(root, 'experiments/dc25-keyed-fast-path/common.mjs')
        ).href
      )
    );
  if (name === 'dispose-build')
    code = code.replace(
      "['baseline', 'event', 'c2', 'combined']",
      "['baseline', 'candidate']"
    );
  else {
    const anchor =
      "          const elements = [...document.querySelectorAll('#main *')];";
    assert(code.includes(anchor));
    code = code.replace(
      anchor,
      `          for (let i = 0; i < 2; i++) {
            document.getElementById('update').click();
            await new Promise(queueMicrotask);
          }
${anchor}`
    );
  }
  const generated = path.join(out, 'reused', name + '.mjs');
  fs.writeFileSync(generated, code, { flag: 'wx' });
  const result = spawnSync(process.execPath, [generated, out], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 ** 2,
  });
  const log = String(result.stdout || '') + String(result.stderr || '');
  fs.writeFileSync(path.join(out, 'reused', name + '.log'), log, {
    flag: 'wx',
  });
  write(path.join(out, 'reused', name + '-command.json'), {
    at: new Date().toISOString(),
    status: result.status,
    originalSHA256: hash(fs.readFileSync(original)),
    generatedSHA256: hash(code),
    note: 'Two real partial updates before observing populated root disposal; diagnostic app exports only, not timing samples.',
  });
  console.log(log);
  assert.equal(result.status, 0, name);
}
guard(out);

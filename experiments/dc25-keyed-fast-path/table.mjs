import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
assert(read(path.join(out, 'final-candidate-audit.json')).pass);
const original = path.join(root, 'experiments/comprehensive/table.mjs');
let code = fs
  .readFileSync(original, 'utf8')
  .replaceAll(
    "'./init.mjs'",
    JSON.stringify(
      pathToFileURL(
        path.join(root, 'experiments/dc25-keyed-fast-path/common.mjs')
      ).href
    )
  )
  .replaceAll('final-event', 'final-candidate')
  .replaceAll('comprehensive-', 'dc25-keyed-fast-path-')
  .replaceAll('COMPREHENSIVE_RESULTS.md', 'DC25_KEYED_FAST_PATH_RESULTS.md')
  .replaceAll('DC-22', 'DC-25')
  .replaceAll('event proxy and fixed peers', 'keyed prototype and fixed peers')
  .replace(
    'B = compact13; E = repaired event proxy.',
    'B = released main; K = keyed prototype (not adopted).'
  )
  .replace("event:'E'", "candidate:'K'")
  .replaceAll('E / fastest peer total', 'K / fastest peer total');
assert(!code.includes('docs/benchmark/comprehensive-'));
const generated = path.join(out, 'reused/table.mjs');
fs.writeFileSync(generated, code, { flag: 'wx' });
const result = spawnSync(process.execPath, [generated, out], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 8 * 1024 ** 2,
});
fs.writeFileSync(
  path.join(out, 'reused/table.log'),
  String(result.stdout || '') + String(result.stderr || ''),
  { flag: 'wx' }
);
assert.equal(result.status, 0, result.stdout + result.stderr);
fs.copyFileSync(
  path.join(out, 'final-candidate-results.json'),
  path.join(root, 'docs/benchmark/dc25-keyed-fast-path-final-results.json')
);
let audit = fs
  .readFileSync(
    path.join(root, 'experiments/comprehensive/color-audit.py'),
    'utf8'
  )
  .replaceAll('final-event', 'final-candidate');
const auditor = path.join(out, 'reused/color-audit.py');
fs.writeFileSync(auditor, audit, { flag: 'wx' });
const checked = spawnSync('python3', [auditor, out], {
  encoding: 'utf8',
  maxBuffer: 8 * 1024 ** 2,
});
assert.equal(checked.status, 0, checked.stdout + checked.stderr);
write(path.join(out, 'reused/table-command.json'), {
  at: new Date().toISOString(),
  originalSHA256: hash(fs.readFileSync(original)),
  generatedSHA256: hash(code),
  status: result.status,
  colorAudit: read(path.join(out, 'color-audit.json')),
});
guard(out);
console.log(result.stdout, checked.stdout);

// Keep the historical protocols intact; archive each small, explicit adapter.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { root, hash, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const mode = process.argv[3];
const attempt = process.argv[4] || 'v1';
assert(/^[a-z0-9-]+$/.test(attempt));
assert(['contracts', 'retention', 'analyze', 'audit'].includes(mode));
guard(out);
const name = mode === 'audit' ? 'audit.py' : mode + '.mjs';
const original = path.join(root, 'experiments/comprehensive', name);
let code = fs.readFileSync(original, 'utf8');
const common = pathToFileURL(
  path.join(root, 'experiments/dc25-keyed-fast-path/common.mjs')
).href;
code = code
  .replaceAll("'./init.mjs'", JSON.stringify(common))
  .replaceAll(
    "'./server.mjs'",
    JSON.stringify(
      pathToFileURL(path.join(root, 'experiments/comprehensive/server.mjs'))
        .href
    )
  )
  .replaceAll(
    "'../peer-baseline/statistics.mjs'",
    JSON.stringify(
      pathToFileURL(path.join(root, 'experiments/peer-baseline/statistics.mjs'))
        .href
    )
  );
if (mode === 'retention')
  code = code.replace(
    "const names = ['baseline', 'event', 'c2', 'combined'];",
    "const names = ['baseline', 'candidate'];"
  );
if (mode === 'analyze') {
  code = code.replaceAll(
    '${scope}-${order}/production-',
    'official-${order}/production-'
  );
  code = code.replace(
    'const file = path.join(out, `${scope}-results.json`);',
    'result.inputs.activeBrowser = hash(fs.readFileSync(path.join(out, "active-browser.json")));\nconst file = path.join(out, `${scope}-results.json`);'
  );
}
if (mode === 'audit') {
  code = code.replaceAll(
    '{scope}-{order}/production-',
    'official-{order}/production-'
  );
  const anchor = "initial = json.loads((out / 'initial.json').read_text())";
  assert(code.includes(anchor));
  code = code.replace(
    anchor,
    anchor +
      "\nactive = json.loads((out / 'active-browser.json').read_text())\ninitial['browser'] = {'sha256': active['files'][active['binary']], 'engineSHA256': active['files'][active['engine']]}\nassert hashlib.sha256((out / 'active-browser.json').read_bytes()).hexdigest() == result['inputs']['activeBrowser']"
  );
}
const modules = path.join(out, 'node_modules');
if (!fs.existsSync(modules))
  fs.symlinkSync(path.join(root, 'node_modules'), modules);
const generated = path.join(
  out,
  'reused',
  mode + '-' + attempt + path.extname(name)
);
fs.mkdirSync(path.dirname(generated), { recursive: true });
fs.writeFileSync(generated, code, { flag: 'wx' });
const names = [
  'baseline',
  'candidate',
  'react-hooks',
  'react-classes',
  'preact-hooks',
  'preact-classes',
];
const args = [
  generated,
  out,
  ...(mode === 'contracts'
    ? names
    : mode === 'analyze' || mode === 'audit'
      ? ['final-candidate']
      : []),
];
const executable = mode === 'audit' ? 'python3' : process.execPath;
const at = new Date().toISOString();
const result = spawnSync(executable, args, {
  cwd: root,
  env: process.env,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 ** 2,
});
const log = String(result.stdout || '') + String(result.stderr || '');
fs.writeFileSync(path.join(out, 'reused', mode + '-' + attempt + '.log'), log, {
  flag: 'wx',
});
write(path.join(out, 'reused', mode + '-' + attempt + '-command.json'), {
  at,
  finishedAt: new Date().toISOString(),
  mode,
  executable,
  args,
  status: result.status,
  original,
  originalSHA256: hash(fs.readFileSync(original)),
  generatedSHA256: hash(code),
});
console.log(log);
assert.equal(result.status, 0, mode);
guard(out);

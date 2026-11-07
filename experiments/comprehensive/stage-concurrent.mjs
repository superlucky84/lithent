import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, hash, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const inputs = Object.keys(initial.defaultFiles).filter(file =>
  file.startsWith('lithentConcurrent/src/')
);
const manifest = {};
for (const variant of ['baseline', 'event', 'c2', 'combined']) {
  const runtime = path.join(out, variant);
  assert(!fs.existsSync(path.join(runtime, 'lithentConcurrent')));
  for (const file of inputs) {
    const dest = path.join(runtime, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(root, file), dest);
  }
  if (['event', 'combined'].includes(variant)) {
    const file = path.join(runtime, 'lithentConcurrent/src/render.ts');
    const source = fs.readFileSync(file, 'utf8');
    const start = source.indexOf('const updateEvent =');
    const end = source.indexOf('const updateStyle =');
    assert(start > 0 && end > start);
    fs.writeFileSync(
      file,
      "import { updateEvent } from '@/utils/event';\n" +
        source.slice(0, start) +
        source.slice(end)
    );
  }
  manifest[variant] = Object.fromEntries(
    inputs.map(file => [file, hash(fs.readFileSync(path.join(runtime, file)))])
  );
}
fs.writeFileSync(
  path.join(out, 'concurrent-inputs.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      note: 'Isolated concurrent proxy port for E/EK; K proof remains base-only',
      files: manifest,
    },
    null,
    2
  ) + '\n',
  { flag: 'wx' }
);
guard(out);
console.log(
  JSON.stringify({ variants: Object.keys(manifest), modules: inputs.length })
);

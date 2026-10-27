import fs from 'node:fs';
import path from 'node:path';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
write(path.join(out, 'app-inputs.json'), {
  ...read(path.join(out, 'runner-inputs.json')),
  apps: read(path.join(out, 'round-main/build-manifest.json')),
  browser: initial.browser,
  wrappers: Object.fromEntries(
    ['production-run.mjs', 'official-memory.mjs', 'targeted-update.mjs'].map(
      file => [
        file,
        hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
      ]
    )
  ),
});
console.log(
  'Frozen all six freshly built production apps and unchanged official wrappers.'
);

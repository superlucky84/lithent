// Bundle the row variants against one core build.
//   node experiments/memo-free-rows/build.mjs <out> <label> <core.mjs> <helper.mjs> [apps]
// Writes <out>/<label>-<app>/{index.html,main.js}. `apps` is a comma list
// (default: every variant the core can build; m-memo needs `memo`).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { brotliCompressSync, constants } from 'node:zlib';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const require = createRequire(path.join(root, 'package.json'));
const esbuild = require(
  path.join(root, 'node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild')
);

const [out, label, core, helper, appsArg] = process.argv.slice(2);
if (!out || !label || !core || !helper) {
  console.error(
    'usage: build.mjs <out> <label> <core.mjs> <helper.mjs> [apps]'
  );
  process.exit(1);
}
const corePath = path.resolve(core);
const helperPath = path.resolve(helper);
const hasMemo = /\bmemo\b/.test(
  fs.readFileSync(corePath, 'utf8').split('export').pop()
);
const all = ['a-cache', 'n-plain', 'r-row', 'c-rowcache', 'm-memo'];
const apps = appsArg
  ? appsArg.split(',')
  : all.filter(app => app !== 'm-memo' || hasMemo);

const html = name => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${name}</title>
    <link href="/css/currentStyle.css" rel="stylesheet" />
  </head>
  <body>
    <div id="main"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
`;

const manifest = {};
for (const app of apps) {
  const name = `${label}-${app}`;
  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  await esbuild.build({
    entryPoints: [path.join(here, 'apps', `${app}.tsx`)],
    outfile: path.join(dir, 'main.js'),
    bundle: true,
    minify: !process.env.LITHENT_READABLE,
    format: 'esm',
    target: 'esnext',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    // The helper imports the core by name: both must resolve to this build.
    alias: { 'lithent/helper': helperPath, lithent: corePath },
    logLevel: 'warning',
  });
  fs.writeFileSync(path.join(dir, 'index.html'), html(name));
  const js = fs.readFileSync(path.join(dir, 'main.js'));
  manifest[name] = {
    app,
    core: label,
    raw: js.length,
    brotli: brotliCompressSync(js, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
    sha256: createHash('sha256').update(js).digest('hex'),
  };
}
const file = path.join(out, 'manifest.json');
const previous = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : {};
fs.writeFileSync(
  file,
  JSON.stringify({ ...previous, ...manifest }, null, 2) + '\n'
);
console.log(JSON.stringify(manifest, null, 2));

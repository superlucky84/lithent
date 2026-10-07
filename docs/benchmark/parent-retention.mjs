// A/B only: isolate parent getters from the diff scope retaining old children.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const app = root + '/../js-framework-benchmark/frameworks/keyed/lithent';
const out = process.env.LITHENT_PARENT_OUT || '/tmp/lithent-parent-review';
const { build, loadConfigFromFile } = await import(
  app + '/node_modules/vite/dist/node/index.js'
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  app + '/vite.config.js'
);
const hash = text => createHash('sha256').update(text).digest('hex');
const candidate = readFileSync(root + '/src/diff.ts', 'utf8');
if (
  candidate.split('const getParent = makeParentGetter(newWDom);').length !== 4
)
  throw Error('Expected three isolated parent getter sites');
const original = candidate
  .replace(
    "import { getParent, makeParentGetter } from '@/utils';",
    "import { getParent } from '@/utils';"
  )
  .replaceAll(
    'const getParent = makeParentGetter(newWDom);',
    'const getParent = () => newWDom;'
  );
mkdirSync(out, { recursive: true });
writeFileSync(out + '/candidate-diff.ts', candidate);
for (const [name, source] of [
  ['lithent-before', original],
  ['lithent', candidate],
]) {
  await build({
    ...loaded.config,
    configFile: false,
    root: app,
    plugins: [
      {
        name: 'isolate-parent-context',
        enforce: 'pre',
        transform(code, id) {
          if (id === root + '/src/diff.ts') return { code: source, map: null };
        },
      },
    ],
    resolve: {
      alias: {
        'lithent/helper': root + '/helper/src/hook/cacheUpdate.ts',
        lithent: root + '/src/index.ts',
        '@': root + '/src',
      },
    },
    build: { ...loaded.config.build, outDir: out + '/' + name },
  });
}
writeFileSync(
  out + '/versions.json',
  readFileSync('/tmp/lithent-production-review/versions.json')
);
writeFileSync(
  out + '/build-manifest.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      experiment:
        'same improved adapter with source core, parent getter closure scope only',
      app: hash(readFileSync(app + '/src/main.tsx')),
      coreDiffBefore: hash(original),
      coreDiffCandidate: hash(candidate),
      helper: hash(readFileSync(root + '/helper/src/hook/cacheUpdate.ts')),
      candidateTransform:
        'factory closure captures parent only; three call sites',
    },
    null,
    2
  )
);

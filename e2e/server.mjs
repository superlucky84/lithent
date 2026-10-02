import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createServer, loadConfigFromFile, mergeConfig } from 'vite';
import lithentVite from '../packages/lithentVite/dist/index.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const core = process.argv[2];
if (!['base', 'concurrent'].includes(core)) throw new Error('Specify a core');
const offset = core === 'concurrent' ? 1 : 0;
const work = resolve(repo, '.e2e-work', core);
await mkdir(work, { recursive: true });
await cp(resolve(repo, 'e2e/fixtures/hmr'), work, { recursive: true });

const bundle =
  core === 'concurrent'
    ? 'lithentConcurrent/dist/lithentConcurrent.mjs'
    : 'dist/lithent.mjs';
const mutation = process.env.LITHENT_E2E_MUTATION || '';
const aliases = [
  ...(mutation === 'jsx-flatten'
    ? [
        {
          find: /^lithent\/(jsx-runtime|jsx-dev-runtime)$/,
          replacement: resolve(repo, 'e2e/fixtures/mutations/jsx-runtime.ts'),
        },
      ]
    : []),
  {
    find: /^lithent$/,
    replacement: resolve(
      repo,
      mutation === 'wrong-core' ? 'dist/lithent.mjs' : bundle
    ),
  },
  {
    find: /^lithent-concurrent$/,
    replacement: resolve(repo, 'lithentConcurrent/dist/lithentConcurrent.mjs'),
  },
  {
    find: /^lithent-concurrent\/helper$/,
    replacement: resolve(
      repo,
      'lithentConcurrent/helper/dist/lithentConcurrentHelper.mjs'
    ),
  },
  { find: /^bench-core-base$/, replacement: resolve(repo, 'dist/lithent.mjs') },
  {
    find: /^bench-core-concurrent$/,
    replacement: resolve(repo, 'lithentConcurrent/dist/lithentConcurrent.mjs'),
  },
];

// Every app checks the actual loaded export surface against the chosen project.
// This is an assertion, never feature detection that skips a concurrent check.
const identity = () => ({
  name: 'e2e-core-identity',
  resolveId(id) {
    if (id === 'virtual:e2e-core') return '\0e2e-core';
  },
  load(id) {
    if (id !== '\0e2e-core') return;
    return `import * as core from 'lithent';
      if (('deferRender' in core) !== ${core === 'concurrent'})
        throw new Error('Wrong core: expected ${core}');
      document.documentElement.dataset.core = '${core}';`;
  },
  transformIndexHtml: {
    order: 'pre',
    handler(html, context) {
      if (context.path === '/lithentConcurrent/consumer/index.html')
        html = html.replace(
          'src="/app.tsx"',
          'src="/lithentConcurrent/consumer/app.tsx"'
        );
      if (context.path === '/lithentConcurrent/html/lifecycle.html')
        html = html.replace(
          'src="/demo/lifecycle.ts"',
          'src="/lithentConcurrent/demo/lifecycle.ts"'
        );
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'module', src: '/@id/__x00__e2e-core' },
            injectTo: 'head',
          },
        ],
      };
    },
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/favicon.ico') {
        res.statusCode = 204;
        res.end();
      } else next();
    });
  },
});

const servers = [];
const common = port => ({
  configFile: false,
  resolve: { alias: aliases },
  define: { __E2E_MUTATION__: JSON.stringify(mutation) },
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    open: false,
    fs: { allow: [repo] },
  },
});

try {
  for (const [folder, port] of [
    ['examples', 43132 + offset],
    ['lithentDocs', 43134 + offset],
  ]) {
    const loaded = await loadConfigFromFile(
      { command: 'serve', mode: 'development' },
      resolve(repo, folder, 'vite.config.js')
    );
    if (!loaded) throw new Error(`Missing ${folder} config`);
    const original = loaded.config;
    // Build/type/lint gates run separately. Retain each app's real MDX/JSX config.
    original.plugins = (original.plugins || []).filter(
      p => p?.name !== 'vite-plugin-checker' && p?.name !== 'vite:dts'
    );
    const config = mergeConfig(original, common(port));
    config.root = resolve(repo, folder);
    config.cacheDir = resolve(work, `${folder}-cache`);
    config.plugins = [...(config.plugins || []), identity()];
    if (folder === 'lithentDocs') {
      const requireDocs = createRequire(resolve(repo, folder, 'package.json'));
      const { default: theme } = await import(
        '../lithentDocs/tailwind.config.js'
      );
      config.css = {
        postcss: {
          plugins: [
            requireDocs('tailwindcss')({
              ...theme,
              content: [
                resolve(repo, folder, 'index.html'),
                resolve(repo, folder, 'src/**/*.{js,ts,jsx,tsx}'),
              ],
            }),
            requireDocs('autoprefixer')(),
          ],
        },
      };
    }
    const server = await createServer(config);
    servers.push(server);
    await server.listen();
  }

  const ssrPage = {
    name: 'e2e-ssr-response',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/e2e/hydration.html') return next();
        try {
          const app = await server.ssrLoadModule(
            '/e2e/fixtures/hydration-app.tsx'
          );
          const markup = app.serverMarkup();
          const html = `<!DOCTYPE html><html data-core="${core}"><head><title>SSR hydration</title></head><body>
            <div id="app">${markup}</div>
            <script>window.__serverNodes = [...document.querySelectorAll('#app button, #app li')];</script>
            <script type="module" src="/e2e/fixtures/hydration.tsx"></script></body></html>`;
          res.setHeader('Content-Type', 'text/html');
          res.end(await server.transformIndexHtml(req.url, html));
        } catch (error) {
          next(error);
        }
      });
    },
  };
  const config = common(43130 + offset);
  config.root = repo;
  config.cacheDir = resolve(work, 'fixture-cache');
  config.plugins = [identity(), ssrPage];
  if (mutation !== 'hmr-reload')
    config.plugins.push(
      lithentVite({ include: /\.e2e-work\/.*Counter\.tsx$/ })
    );
  config.esbuild = { jsx: 'automatic', jsxImportSource: 'lithent' };
  config.ssr = { noExternal: ['lithent', 'lithent/ssr'] };
  config.optimizeDeps = {
    entries: [
      'e2e/fixtures/integration.html',
      'e2e/fixtures/scheduler.html',
      `.e2e-work/${core}/index.html`,
      'lithentConcurrent/consumer/index.html',
      'lithentConcurrent/html/lifecycle.html',
    ],
  };
  // Compare two independently built cores on one page without prebundling
  // either into a second runtime (component maps must have one identity).
  config.plugins.push({
    name: 'e2e-single-runtime',
    configResolved(resolved) {
      resolved.optimizeDeps.noDiscovery = true;
      resolved.optimizeDeps.include = [];
    },
  });
  const server = await createServer(config);
  servers.push(server);
  await server.listen();
  console.log(`E2E ${core}: http://127.0.0.1:${43130 + offset}`);
} catch (error) {
  await Promise.all(servers.map(server => server.close()));
  throw error;
}

let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await Promise.all(servers.map(server => server.close()));
  await rm(work, { recursive: true, force: true });
  process.exit(0);
}
process.on('SIGTERM', close);
process.on('SIGINT', close);

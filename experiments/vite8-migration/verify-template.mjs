import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createLogger, createServer } from 'vite';
import { chromium } from '@playwright/test';
import lithentVite from '../../packages/lithentVite/dist/index.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const work = resolve(root, '.e2e-work/vite8-template');
const serverWarnings = [];
const logger = createLogger();
for (const method of ['warn', 'warnOnce', 'error']) {
  const original = logger[method].bind(logger);
  logger[method] = (message, options) => {
    serverWarnings.push(message);
    original(message, options);
  };
}
await mkdir(work, { recursive: true });
await rm(resolve(work, 'cache'), { recursive: true, force: true });
await writeFile(
  resolve(work, 'index.html'),
  '<!doctype html><html><head><link rel="icon" href="data:,"></head><body><script type="module" src="/main.tsx"></script></body></html>'
);
await writeFile(
  resolve(work, 'main.tsx'),
  `
import { mount, render } from 'lithent';
import { View } from './View';
const App = mount(renew => {
  let value = 0;
  return () => <><button onClick={() => { value++; renew(); }}>{value}</button><View value={value}/></>;
});
render(<App/>, document.body);
`
);
await writeFile(
  resolve(work, 'View.ltsx'),
  `
import { h } from 'lithent';
export const View = ({value}: {value: number}) => <section>
  <p l-if={value > 0}>count {value}</p>
  <ul><li l-for={item in [value, value + 1]}>{item}</li></ul>
</section>;
`
);
const config = () => ({
  configFile: false,
  root: work,
  cacheDir: resolve(work, 'cache'),
  customLogger: logger,
  plugins: [lithentVite({ template: true })],
  resolve: {
    alias: [
      { find: /^lithent$/, replacement: resolve(root, 'dist/lithent.mjs') },
    ],
  },
});
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LITHENT_CHROME || '/usr/bin/chromium',
});
async function check(url) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(url);
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: '1', exact: true }).waitFor();
  assert.equal(await page.locator('p').innerText(), 'count 1');
  assert.deepEqual(await page.locator('li').allTextContents(), ['1', '2']);
  assert.deepEqual(errors, []);
  await page.close();
}
let dev, production;
try {
  dev = await createServer({
    ...config(),
    server: { host: '127.0.0.1', port: 0, open: false },
  });
  await dev.listen();
  await check(`http://127.0.0.1:${dev.httpServer.address().port}`);
  await dev.close();
  dev = null;
  assert(
    !serverWarnings.some(message =>
      message.includes('Failed to run dependency scan')
    )
  );
  const optimized = JSON.parse(
    await readFile(resolve(work, 'cache/deps/_metadata.json'), 'utf8')
  );
  assert(optimized.optimized.lithent, 'Lithent was not prebundled');
  const built = await build({
    ...config(),
    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      sourcemap: true,
    },
  });
  const chunks = []
    .concat(built)
    .flatMap(item => item.output)
    .filter(item => item.type === 'chunk');
  assert(
    chunks.some(chunk =>
      chunk.map?.sources.some(source => source.includes('View.ltsx'))
    )
  );
  production = createHttpServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const file = resolve(
        work,
        'dist',
        '.' + (pathname === '/' ? '/index.html' : pathname)
      );
      if (!file.startsWith(resolve(work, 'dist') + '/'))
        throw Error('Invalid path');
      res.setHeader(
        'Content-Type',
        extname(file) === '.js' ? 'text/javascript' : 'text/html'
      );
      res.end(await readFile(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(done => production.listen(0, '127.0.0.1', done));
  await check(`http://127.0.0.1:${production.address().port}`);
  console.log(
    'PASS: mixed automatic TSX and typed .ltsx, extensionless resolution, l-if/l-for, dependency optimization, dev/production interaction and production sourcemaps.'
  );
} finally {
  if (dev) await dev.close();
  if (production) await new Promise(done => production.close(done));
  await browser.close();
}

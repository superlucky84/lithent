import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const source = path.join(root, 'e2e/server.mjs');
let server = fs.readFileSync(source, 'utf8');
server = server
  .replace(
    "const repo = fileURLToPath(new URL('../', import.meta.url));",
    `const repo = ${JSON.stringify(root)};`
  )
  .replace(
    "'../packages/lithentVite/dist/index.mjs'",
    JSON.stringify(
      pathToFileURL(path.join(root, 'packages/lithentVite/dist/index.mjs')).href
    )
  )
  .replace(
    "'../lithentDocs/tailwind.config.js'",
    JSON.stringify(
      pathToFileURL(path.join(root, 'lithentDocs/tailwind.config.js')).href
    )
  )
  .replaceAll(
    "'dist/lithent.mjs'",
    JSON.stringify(path.join(out, 'candidate/dist/lithent.mjs'))
  )
  .replace(
    'fs: { allow: [repo] }',
    `fs: { allow: [repo, ${JSON.stringify(out)}] }`
  );
// CSP/element fixtures load the real UMD by URL rather than the ESM alias.
server =
  "import { readFileSync } from 'node:fs';\n" +
  server.replace(
    "if (req.url === '/favicon.ico') {",
    `if (core === 'base' && req.url?.split('?')[0] === '/dist/lithent.umd.js') {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(readFileSync(${JSON.stringify(path.join(out, 'candidate/dist/lithent.umd.js'))}));
    } else if (req.url === '/favicon.ico') {`
  );
const directory = path.join(out, 'browser-checks');
fs.mkdirSync(directory, { recursive: true });
const generated = path.join(directory, 'server.mjs');
fs.writeFileSync(generated, server, { flag: 'wx' });
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
const config = path.join(directory, 'playwright.config.mjs');
fs.writeFileSync(
  config,
  `import original from ${JSON.stringify(path.join(root, 'playwright.config.ts'))};
export default {
 ...original, testDir: ${JSON.stringify(path.join(root, 'e2e'))},
 outputDir: ${JSON.stringify(path.join(directory, 'test-results'))},
 use: { ...original.use, launchOptions: { executablePath: ${JSON.stringify(initial.browser.binary)} } },
 webServer: original.webServer.map((entry, index) => ({ ...entry, cwd: ${JSON.stringify(root)},
   command: ${JSON.stringify(quote(process.execPath) + ' ' + quote(generated) + ' ')} + (index ? 'concurrent' : 'base') }))
};\n`,
  { flag: 'wx' }
);
const at = new Date().toISOString();
const report = path.join(directory, 'report.json');
const args = [
  path.join(root, 'node_modules/@playwright/test/cli.js'),
  'test',
  '--config',
  config,
  '--reporter=list,json',
];
const log = fs.createWriteStream(path.join(directory, 'run.log'), {
  flags: 'wx',
});
const child = spawn(process.execPath, args, {
  cwd: root,
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: report },
  stdio: ['ignore', 'pipe', 'pipe'],
});
for (const stream of [child.stdout, child.stderr])
  stream.on('data', bytes => {
    log.write(bytes);
    process.stdout.write(bytes);
  });
const status = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
await new Promise(resolve => log.end(resolve));
write(path.join(directory, 'command.json'), {
  at,
  finishedAt: new Date().toISOString(),
  args,
  status,
  originalServerSHA256: hash(fs.readFileSync(source)),
  generatedServerSHA256: hash(server),
  base: read(path.join(out, 'candidate/build.json')).bundles,
  note: 'Candidate ESM/UMD overlay; unchanged built concurrent. Original server/config source is preserved.',
});
guard(out);
assert.equal(status, 0, 'See ' + directory);

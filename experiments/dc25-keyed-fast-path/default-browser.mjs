import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, hash, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const directory = path.join(out, 'default-browser');
fs.mkdirSync(directory);
const config = path.join(directory, 'playwright.config.mjs');
fs.writeFileSync(
  config,
  `import original from ${JSON.stringify(path.join(root, 'playwright.config.ts'))};
export default { ...original, testDir: ${JSON.stringify(path.join(root, 'e2e'))},
 outputDir: ${JSON.stringify(path.join(directory, 'test-results'))},
 use: { ...original.use, launchOptions: { executablePath: ${JSON.stringify(initial.browser.binary)} } },
 webServer: original.webServer.map(entry => ({ ...entry, cwd: ${JSON.stringify(root)} }))
};\n`,
  { flag: 'wx' }
);
const args = [
  path.join(root, 'node_modules/@playwright/test/cli.js'),
  'test',
  '--config',
  config,
  '--reporter=list,json',
];
const at = new Date().toISOString();
const log = fs.createWriteStream(path.join(directory, 'run.log'), {
  flags: 'wx',
});
const env = {
  ...process.env,
  PLAYWRIGHT_JSON_OUTPUT_NAME: path.join(directory, 'report.json'),
};
delete env.LITHENT_CORE;
const child = spawn(process.execPath, args, {
  cwd: root,
  env,
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
guard(out);
write(path.join(directory, 'command.json'), {
  at,
  finishedAt: new Date().toISOString(),
  args,
  status,
  serverSHA256: hash(fs.readFileSync(path.join(root, 'e2e/server.mjs'))),
  note: 'Final unchanged default base/concurrent on the same fixed browser. The original server/config source and artifacts are unchanged.',
});
assert.equal(status, 0, directory);

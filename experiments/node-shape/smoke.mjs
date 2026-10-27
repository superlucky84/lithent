import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const out = fs.realpathSync(process.argv[2]);
const executablePath =
  '/tmp/lithent-shape-chrome-156.0.8078.47.app/Contents/MacOS/Google Chrome';
const flags = [
  '--allow-natives-syntax',
  '--log-ic',
  '--log-maps',
  '--log-maps-details',
  '--trace-deopt',
  '--logfile=' + path.join(out, 'v8-smoke.log'),
];
const browserServer = await chromium.launchServer({
  executablePath,
  headless: true,
  args: ['--js-flags=' + flags.join(' ')],
});
const stdout = [],
  stderr = [];
browserServer.process().stdout?.on('data', chunk => stdout.push(chunk));
browserServer.process().stderr?.on('data', chunk => stderr.push(chunk));
const browser = await chromium.connect(browserServer.wsEndpoint());
try {
  const page = await browser.newPage();
  const result = await page.evaluate(`(() => {
    const a = { x: 1, y: 2 }, b = { x: 3, y: 4 };
    const initial = %HaveSameMap(a, b);
    a.z = 5;
    const expanded = %HaveSameMap(a, b);
    const fast = %HasFastProperties(a);
    %DebugPrint(a);
    return { initial, expanded, fast, userAgent: navigator.userAgent };
  })()`);
  assert.equal(result.initial, true);
  assert.equal(result.expanded, false);
  assert.equal(result.fast, true);
  fs.writeFileSync(
    path.join(out, 'smoke.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        flags,
        result,
      },
      null,
      2
    ) + '\n'
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
  await browserServer.close();
  fs.writeFileSync(path.join(out, 'smoke-stdout.log'), Buffer.concat(stdout));
  fs.writeFileSync(path.join(out, 'smoke-stderr.log'), Buffer.concat(stderr));
}

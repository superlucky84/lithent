import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { hash, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const binary = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const engine = fs.realpathSync(
  path.resolve(
    binary,
    '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
  )
);
const browser = await chromium.launch({
  executablePath: binary,
  headless: true,
});
try {
  const page = await browser.newPage();
  const session = await page.context().newCDPSession(page);
  const version = await session.send('Browser.getVersion');
  write(path.join(out, 'active-browser.json'), {
    at: new Date().toISOString(),
    binary,
    engine,
    version,
    reason:
      'The historical /tmp Chrome155 bundle lacks its complete app resources and was killed at launch. Freeze the installed complete Chrome156; collect all scores afresh.',
    files: Object.fromEntries(
      [binary, engine].map(file => [file, hash(fs.readFileSync(file))])
    ),
  });
  console.log(JSON.stringify(version));
} finally {
  await browser.close();
}
guard(out);

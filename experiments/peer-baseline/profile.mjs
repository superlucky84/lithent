import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from '@playwright/test';
import { chrome, fileHash, read } from './config.mjs';
import { verify } from './guard.mjs';
import { serve } from './server.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
const mode = process.argv[3] || 'profile';
assert.ok(['profile', 'trace'].includes(mode));
const tracing = mode === 'trace',
  rounds = tracing ? 1 : 3,
  directory = tracing ? 'trace-diagnosis' : 'diagnosis';
verify(out);
const analysis = read(path.join(out, 'analysis.json'));
const dir = path.join(out, directory);
assert.equal(
  fs.existsSync(dir),
  false,
  'Preserve the previous diagnostic before collecting again'
);
fs.mkdirSync(dir, { recursive: true });
const { server, url } = await serve(out),
  browser = await chromium.launch({ headless: true, executablePath: chrome });
const result = {
  startedAt: new Date().toISOString(),
  complete: false,
  command: {
    executable: process.execPath,
    args: process.argv.slice(1),
    node: process.version,
  },
  chrome: browser.version(),
  chromeSHA256: fileHash(chrome),
  targets: analysis.targets,
  protocol: {
    mode,
    rounds,
    actionsPerContext: 10,
    samplingIntervalUs: tracing ? null : 250,
    cpuThrottle: 1,
    independentTraceContext: true,
    note: 'Separate diagnostic, not official timing. CPU profile mode has no concurrent tracing; trace mode uses separate fresh contexts without CPU Profiler. Resets happen outside each CPU profile. Two animation frames after each action; trace contains marked action windows and separate setup. Native clicks inside page.evaluate, no official warmup/throttle; instrumentation overhead and async waits included.',
  },
  runs: [],
};
const save = () =>
  fs.writeFileSync(
    path.join(out, directory + '.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
try {
  for (const target of analysis.targets)
    for (let round = 0; round < rounds; round++)
      for (const name of round % 2
        ? [target.peer, 'lithent']
        : ['lithent', target.peer]) {
        const context = await browser.newContext(),
          record = {
            id: target.id,
            peer: target.peer,
            name,
            round,
            profiles: [],
            errors: [],
          };
        result.runs.push(record);
        try {
          const page = await context.newPage();
          page.on('pageerror', error => record.errors.push(String(error)));
          await page.goto(url + '/' + name + '/index.html');
          await page.evaluate(() => document.fonts.ready);
          const cdp = await context.newCDPSession(page);
          if (!tracing) {
            await cdp.send('Profiler.enable');
            await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
          }
          if (tracing)
            await cdp.send('Tracing.start', {
              categories:
                '-*,devtools.timeline,v8,v8.execute,blink.user_timing',
              transferMode: 'ReturnAsStream',
            });
          const profiles = [];
          for (let iteration = 0; iteration < 10; iteration++) {
            const preparation = await page.evaluate(
              async ({ id, iteration }) => {
                const click = async selector => {
                  document.querySelector(selector).click();
                  await new Promise(resolve =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                  );
                };
                if (/^(01|07)_/.test(id)) await click('#clear');
                else if (iteration === 0 || /^(06|08|09)_/.test(id))
                  await click('#run');
                return {
                  rows: document.querySelectorAll('tbody>tr').length,
                  firstLabel: document.querySelector(
                    'tbody>tr>td:nth-child(2)>a'
                  )?.textContent,
                };
              },
              { id: target.id, iteration }
            );
            assert.equal(
              preparation.rows,
              /^(01|07)_/.test(target.id) ? 0 : 1000
            );
            if (!tracing) await cdp.send('Profiler.start');
            const action = await page.evaluate(
              async ({ id, iteration }) => {
                const before = document.querySelectorAll('tbody>tr').length;
                const selector = id.startsWith('04_')
                  ? `tbody>tr:nth-child(${iteration % 2 ? 3 : 2})>td:nth-child(2)>a`
                  : id.startsWith('06_')
                    ? 'tbody>tr:last-child>td:nth-child(3)>a'
                    : {
                        '01': '#run',
                        '02': '#run',
                        '03': '#update',
                        '05': '#swaprows',
                        '07': '#runlots',
                        '08': '#add',
                        '09': '#clear',
                      }[id.slice(0, 2)];
                if (!selector) throw Error('Unknown diagnostic action ' + id);
                performance.mark('peer-diag-' + iteration + '-start');
                document.querySelector(selector).click();
                await new Promise(resolve =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve))
                );
                performance.mark('peer-diag-' + iteration + '-end');
                return {
                  selector,
                  before,
                  after: document.querySelectorAll('tbody>tr').length,
                };
              },
              { id: target.id, iteration }
            );
            const profile = tracing
              ? null
              : (await cdp.send('Profiler.stop')).profile;
            if (profile) profiles.push(profile);
            record.profiles.push({
              iteration,
              action,
              samples: profile?.samples?.length || 0,
              durationUs: profile ? profile.endTime - profile.startTime : null,
            });
            const expectedRows = {
              '01': 1000,
              '02': 1000,
              '03': 1000,
              '04': 1000,
              '05': 1000,
              '06': 999,
              '07': 10000,
              '08': 2000,
              '09': 0,
            }[target.id.slice(0, 2)];
            assert.equal(action.after, expectedRows);
            const validation = await page.evaluate(() => ({
              firstLabel: document.querySelector('tbody>tr>td:nth-child(2)>a')
                ?.textContent,
              selected: [...document.querySelectorAll('tbody>tr')].flatMap(
                (row, i) => (row.classList.contains('danger') ? [i + 1] : [])
              ),
            }));
            if (target.id.startsWith('03_'))
              assert.equal(
                validation.firstLabel,
                preparation.firstLabel + ' !!!'
              );
            if (target.id.startsWith('04_'))
              assert.deepEqual(validation.selected, [iteration % 2 ? 3 : 2]);
            record.profiles.at(-1).validation = validation;
          }
          const prefix = `${target.id}-${name}-${round}`;
          if (!tracing) {
            fs.writeFileSync(
              path.join(dir, prefix + '.cpuprofiles.json.gz'),
              zlib.gzipSync(Buffer.from(JSON.stringify({ profiles })), {
                level: 9,
              })
            );
            record.profileFile =
              directory + '/' + prefix + '.cpuprofiles.json.gz';
            record.profileSHA256 = fileHash(path.join(out, record.profileFile));
          }
          if (tracing) {
            const completion = new Promise(resolve =>
              cdp.once('Tracing.tracingComplete', resolve)
            );
            await cdp.send('Tracing.end');
            const { stream } = await completion;
            const chunks = [];
            for (;;) {
              const part = await cdp.send('IO.read', { handle: stream });
              chunks.push(
                Buffer.from(part.data, part.base64Encoded ? 'base64' : 'utf8')
              );
              if (part.eof) break;
            }
            await cdp.send('IO.close', { handle: stream });
            const bytes = Buffer.concat(chunks);
            fs.writeFileSync(
              path.join(dir, prefix + '.trace.json.gz'),
              zlib.gzipSync(bytes, { level: 9 })
            );
            record.traceFile = directory + '/' + prefix + '.trace.json.gz';
            record.traceSHA256 = fileHash(path.join(out, record.traceFile));
          }
          assert.deepEqual(record.errors, []);
          record.complete = true;
          save();
          console.log(mode, target.id, name, round, 'complete');
        } finally {
          await context.close();
          save();
        }
      }
  verify(out);
  result.complete = true;
  result.finishedAt = new Date().toISOString();
} finally {
  save();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

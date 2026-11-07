import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
for (const round of ['round-main', 'round-reverse'])
  for (const mode of ['cpu', 'mem']) {
    const file = path.join(out, round, 'production-' + mode + '.json');
    if (!fs.existsSync(file)) continue;
    const run = JSON.parse(fs.readFileSync(file));
    console.log(
      JSON.stringify({
        round,
        mode,
        complete: !!run.complete,
        batches: run.samples.length,
        samples: run.samples.reduce((sum, s) => sum + s.result.length, 0),
        failedBatches: run.failedBatches?.length || 0,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
      })
    );
  }
const logs = fs
  .readdirSync(out)
  .filter(name => /^(cpu|mem)-.*\.log$/.test(name))
  .map(name => ({ name, mtime: fs.statSync(path.join(out, name)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);
if (logs.length) {
  const log = logs[0].name;
  console.log(log);
  console.log(
    fs
      .readFileSync(path.join(out, log), 'utf8')
      .trimEnd()
      .split('\n')
      .slice(-3)
      .join('\n')
  );
}

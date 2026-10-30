import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = fs.realpathSync(process.argv[2]);
// Reuse the committed distribution/weight implementation, then describe this
// experiment's actual baseline. No historical timing samples are imported.
execFileSync(process.execPath, ['experiments/c4-owner/analyze.mjs', out]);
const file = path.join(out, 'results.json');
const result = JSON.parse(fs.readFileSync(file));
result.scope =
  'P2 owner at 7f4df5c vs P3 scalar key snapshot, same app/source core, rebuilt Preact class11; no original A/four-peer/Vue validation';
result.baselineCommit = '7f4df5c';
result.validation.snapshot = JSON.parse(
  fs.readFileSync(path.join(out, 'snapshot-check.json'))
);
result.validation.snapshot.workNotes = {
  keyOf: 'observed callback count',
  mapGet: 'observed global Map.get count in isolated untimed fixture',
  snapshotKeyWrites:
    'derived from set input length and source assignment; not an instrumented array write or allocated-byte measurement',
};
fs.writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
console.log(
  JSON.stringify({ counts: result.counts, weighted: result.weighted })
);

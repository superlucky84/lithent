// Diagnose selection trace gaps without changing any official timing result.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-bulk-core-20261019';
const read = file => JSON.parse(readFileSync(file));
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const records = [];
for (const [phase, dir] of [
  ['main', out],
  ['reverse', out + '/reverse'],
  ['selection-control', out + '/selection-control'],
]) {
  const run = read(dir + '/production-cpu.json');
  for (const sample of run.samples) {
    if (!sample.id.startsWith('04_') || sample.name === 'retained') continue;
    for (const [index, value] of sample.result.entries()) {
      const file = `${dir}/traces/${sample.name}-production-keyed_${sample.id}_${index}.json`;
      const bytes = readFileSync(file);
      const events = JSON.parse(bytes).traceEvents;
      const click = events.find(
        e => e.name === 'EventDispatch' && e.args?.data?.type === 'click'
      );
      const start = click.ts;
      const end = start + Math.round(value.total * 1000);
      const within = events.filter(
        e =>
          e.pid === click.pid &&
          e.tid === click.tid &&
          e.ph === 'X' &&
          e.ts >= start &&
          e.ts <= end
      );
      const micro = within.filter(e => e.name === 'RunMicrotasks');
      const jsEnd = Math.max(
        click.ts + click.dur,
        ...micro.map(e => e.ts + e.dur)
      );
      const styles = within.filter(e => e.name === 'UpdateLayoutTree');
      const styleEnd = Math.max(...styles.map(e => e.ts + e.dur));
      const paint = within
        .filter(e => e.name === 'Paint' && e.ts >= styleEnd)
        .sort((a, b) => a.ts - b.ts)[0];
      records.push({
        phase,
        name: sample.name,
        index,
        ...value,
        residual: value.total - value.script - value.paint,
        clickAndMicrotaskEnd: (jsEnd - start) / 1000,
        styleToPaint:
          styles.length && paint ? (paint.ts - styleEnd) / 1000 : null,
        gcEvents: within.filter(e => /GC/.test(e.name)).map(e => e.name),
        trace: file,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
    }
  }
}
const groups = [...new Set(records.map(r => r.phase + '/' + r.name))];
const summary = groups.map(group => {
  const rows = records.filter(r => r.phase + '/' + r.name === group);
  return {
    phase: rows[0].phase,
    name: rows[0].name,
    count: rows.length,
    ...Object.fromEntries(
      [
        'total',
        'script',
        'paint',
        'residual',
        'clickAndMicrotaskEnd',
        'styleToPaint',
      ].map(key => [key, median(rows.map(r => r[key]).filter(v => v !== null))])
    ),
    gcSamples: rows.filter(r => r.gcEvents.length).length,
  };
});
writeFileSync(
  out + '/selection-trace-analysis.json',
  JSON.stringify({ summary, records }, null, 2)
);
console.log(JSON.stringify(summary, null, 2));

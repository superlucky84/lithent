import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = fs.realpathSync(process.argv[2]);
const read = f => JSON.parse(fs.readFileSync(f));
const median = a => {
  const v = [...a].sort((a, b) => a - b);
  return v.length % 2
    ? v[(v.length - 1) / 2]
    : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};
const distribution = a => {
  const v = [...a].sort((a, b) => a - b),
    n = v.length;
  return {
    n,
    median: median(v),
    p25: median(v.slice(0, Math.floor(n / 2))),
    p75: median(v.slice(Math.ceil(n / 2))),
    min: v[0],
    max: v[n - 1],
  };
};
const pilot = path.join(out, 'class-pilot');
const runs = Object.fromEntries(
  ['main', 'reverse'].map(order => [
    order,
    read(path.join(pilot, order, 'production-cpu.json')),
  ])
);
let count = 0;
for (const run of Object.values(runs)) {
  assert(run.complete);
  for (const s of run.samples) {
    assert.equal(s.id, '04_select1k');
    assert.equal(s.result.length, 25);
    count += s.result.length;
  }
}
assert.equal(count, 100);
const rows = {};
for (const order of ['main', 'reverse', 'pooled']) {
  const selected = order === 'pooled' ? Object.values(runs) : [runs[order]];
  const conditions = Object.fromEntries(
    ['current', 'empty'].map(name => [
      name,
      Object.fromEntries(
        ['total', 'script', 'paint'].map(metric => [
          metric,
          distribution(
            selected.flatMap(run =>
              run.samples
                .filter(s => s.name === name)
                .flatMap(s => s.result.map(v => v[metric]))
            )
          ),
        ])
      ),
    ])
  );
  rows[order] = {
    conditions,
    change: Object.fromEntries(
      ['total', 'script', 'paint'].map(m => [
        m,
        conditions.empty[m].median / conditions.current[m].median - 1,
      ])
    ),
  };
}
const traces = read(path.join(out, 'trace-gaps.json'));
const gaps = Object.fromEntries(
  ['baseline', 'candidate', 'preact-classes'].map(name => {
    const samples = traces.records.filter(r => r.name === name);
    const locations = {};
    for (const r of samples) {
      const k = r.largestGap.from + ' -> ' + r.largestGap.to;
      locations[k] = (locations[k] || 0) + 1;
    }
    return [
      name,
      {
        largestGapMedian: median(samples.map(r => r.largestGap.ms)),
        locations,
      },
    ];
  })
);
const result = {
  at: new Date().toISOString(),
  scope:
    'separate offline trace diagnostic and single-axis selection-only app pilot; not pooled with primary 870 CPU/90 memory',
  trace: {
    count: traces.records.length,
    groups: traces.groups,
    gaps,
    limitation:
      'Coverage of selected events is not proof of idle, scheduling cause, or exact cost attribution.',
  },
  classPilot: {
    count,
    inputs: read(path.join(pilot, 'inputs.json')),
    dom: read(path.join(pilot, 'dom.json')),
    rows,
    stableTotalReduction:
      rows.main.change.total < 0 && rows.reverse.change.total < 0,
    gateComplete: read(path.join(pilot, 'gate/production-verify.json'))
      .complete,
    failedBatches: Object.values(runs).flatMap(r => r.failedBatches || []),
    decision:
      'No consistent total-time benefit; no adoption and no full-CPU/memory claim.',
  },
  faultProbe: read(path.join(out, 'fault-probe.json')),
};
fs.writeFileSync(
  path.join(out, 'selection-diagnostics.json'),
  JSON.stringify(result, null, 2) + '\n'
);
fs.writeFileSync(
  'docs/benchmark/c4-owner-selection-diagnostics.json',
  JSON.stringify(result, null, 2) + '\n'
);
console.log(rows);

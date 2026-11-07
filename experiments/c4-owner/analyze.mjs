import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const out = fs.realpathSync(process.argv[2]);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const initial = read(path.join(out, 'initial.json'));
const previous = read('docs/benchmark/dc25-keyed-fast-path-final-results.json');
const weightById = Object.fromEntries(
  previous.rows.pooled.map((r, i) => [r.id, previous.weights[i]])
);
const rounds = Object.fromEntries(
  ['main', 'reverse'].map(order => {
    const dir = path.join(out, 'official-' + order);
    return [
      order,
      {
        cpu: read(path.join(dir, 'production-cpu.json')),
        mem: read(path.join(dir, 'production-mem.json')),
      },
    ];
  })
);
function median(values) {
  const a = [...values].sort((a, b) => a - b),
    n = a.length;
  assert(n);
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
}
function distribution(values) {
  const a = [...values].sort((a, b) => a - b),
    n = a.length;
  return {
    n,
    median: median(a),
    p25: median(a.slice(0, Math.floor(n / 2))),
    p75: median(a.slice(Math.ceil(n / 2))),
    min: a[0],
    max: a[n - 1],
  };
}
for (const { cpu, mem } of Object.values(rounds))
  for (const run of [cpu, mem]) {
    assert.equal(run.complete, true);
    assert.equal(
      run.chromeBinarySha256,
      initial.browser.files[initial.browser.binary]
    );
    for (const sample of run.samples) {
      const n = run.mode === 'mem' ? 3 : sample.id.startsWith('04') ? 25 : 15;
      assert.equal(sample.result.length, n);
      assert(!sample.error);
    }
  }
const cpu = {},
  memory = {},
  weighted = {};
for (const order of ['main', 'reverse', 'pooled']) {
  const runs = order === 'pooled' ? Object.values(rounds) : [rounds[order]];
  cpu[order] = Object.keys(weightById).map(id => {
    const conditions = Object.fromEntries(
      ['baseline', 'candidate', 'preact-classes'].map(name => {
        const results = runs.flatMap(r =>
          r.cpu.samples
            .filter(s => s.name === name && s.id === id)
            .flatMap(s => s.result)
        );
        return [
          name,
          Object.fromEntries(
            ['total', 'script', 'paint'].map(metric => [
              metric,
              distribution(results.map(r => r[metric])),
            ])
          ),
        ];
      })
    );
    return {
      id,
      weight: weightById[id],
      conditions,
      change: Object.fromEntries(
        ['total', 'script', 'paint'].map(m => [
          m,
          conditions.candidate[m].median / conditions.baseline[m].median - 1,
        ])
      ),
    };
  });
  weighted[order] = Object.fromEntries(
    ['total', 'script', 'paint'].map(m => [
      m,
      Math.exp(
        cpu[order].reduce(
          (sum, r) => sum + r.weight * Math.log(1 + r.change[m]),
          0
        ) / cpu[order].reduce((sum, r) => sum + r.weight, 0)
      ) - 1,
    ])
  );
  memory[order] = rounds.main.mem.samples
    .filter(s => s.name === 'baseline')
    .map(s => {
      const conditions = Object.fromEntries(
        ['baseline', 'candidate', 'preact-classes'].map(name => [
          name,
          distribution(
            runs.flatMap(r =>
              r.mem.samples
                .filter(v => v.id === s.id && v.name === name)
                .flatMap(v => v.result)
            )
          ),
        ])
      );
      return {
        id: s.id,
        conditions,
        change: conditions.candidate.median / conditions.baseline.median - 1,
      };
    });
}
const counts = {
  cpu: Object.values(rounds).reduce(
    (sum, r) => sum + r.cpu.samples.reduce((n, s) => n + s.result.length, 0),
    0
  ),
  memory: Object.values(rounds).reduce(
    (sum, r) => sum + r.mem.samples.reduce((n, s) => n + s.result.length, 0),
    0
  ),
};
assert.equal(counts.cpu, 870);
assert.equal(counts.memory, 90);
const peerRatios = {};
for (const order of ['main', 'reverse', 'pooled']) {
  const rows = cpu[order];
  peerRatios[order] = Object.fromEntries(
    ['baseline', 'candidate'].map(name => [
      name,
      {
        items: rows.map(row => ({
          id: row.id,
          ...Object.fromEntries(
            ['total', 'script', 'paint'].map(m => [
              m,
              row.conditions[name][m].median /
                row.conditions['preact-classes'][m].median,
            ])
          ),
          within110:
            row.conditions[name].total.median <=
            1.1 * row.conditions['preact-classes'].total.median,
        })),
        weighted: Object.fromEntries(
          ['total', 'script', 'paint'].map(m => [
            m,
            Math.exp(
              rows.reduce(
                (sum, row) =>
                  sum +
                  row.weight *
                    Math.log(
                      row.conditions[name][m].median /
                        row.conditions['preact-classes'][m].median
                    ),
                0
              ) / rows.reduce((sum, row) => sum + row.weight, 0)
            ),
          ])
        ),
      },
    ])
  );
}
const results = {
  at: new Date().toISOString(),
  scope:
    'base C4 owner vs original cached A app and rebuilt Preact class11; not four-peer/Vue validation',
  counts,
  peerRatios,
  cpu,
  weighted,
  memory,
  builds: read(path.join(out, 'build-manifest.json')),
  validation: {
    unit: read(path.join(out, 'check.json')),
    browser: read(path.join(out, 'browser.json')),
    preparation: read(path.join(out, 'preparation-notes.json')),
    formatting: fs.existsSync(path.join(out, 'format-equivalence.json'))
      ? read(path.join(out, 'format-equivalence.json'))
      : null,
  },
  runs: Object.fromEntries(
    Object.entries(rounds).map(([order, r]) => [
      order,
      Object.fromEntries(
        Object.entries(r).map(([mode, run]) => [
          mode,
          {
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            chrome: run.chrome,
            loadStart: run.loadStart,
            loadEnd: run.loadEnd,
            failedBatches: run.failedBatches || [],
            warnings: run.samples.flatMap(s => s.warnings || []),
          },
        ])
      ),
    ])
  ),
  inputs: {
    initial: hash(fs.readFileSync(path.join(out, 'initial.json'))),
    weightSource: hash(
      fs.readFileSync('docs/benchmark/dc25-keyed-fast-path-final-results.json')
    ),
  },
};
fs.writeFileSync(
  path.join(out, 'results.json'),
  JSON.stringify(results, null, 2) + '\n'
);
console.log(
  JSON.stringify({ counts, weighted, memory: memory.pooled }, null, 2)
);

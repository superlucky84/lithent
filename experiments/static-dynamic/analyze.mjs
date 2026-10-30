import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const out = fs.realpathSync(process.argv[2]);
const read = f => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
const weightFile = 'docs/benchmark/dc25-keyed-fast-path-final-results.json';
const previous = JSON.parse(fs.readFileSync(weightFile));
const weights = Object.fromEntries(
  previous.rows.pooled.map((r, i) => [r.id, previous.weights[i]])
);
const names = ['stock', 'control', 'candidate'];
const pairs = {
  net: ['candidate', 'stock'],
  information: ['candidate', 'control'],
  hooks: ['control', 'stock'],
};
const rounds = Object.fromEntries(
  ['main', 'reverse'].map(o => [
    o,
    {
      cpu: read(`official-${o}/production-cpu.json`),
      mem: read(`official-${o}/production-mem.json`),
    },
  ])
);
const median = a => {
  const x = [...a].sort((a, b) => a - b),
    n = x.length;
  assert(n);
  return n % 2 ? x[(n - 1) / 2] : (x[n / 2 - 1] + x[n / 2]) / 2;
};
const distribution = a => {
  const x = [...a].sort((a, b) => a - b),
    n = x.length;
  return {
    n,
    median: median(x),
    p25: median(x.slice(0, Math.floor(n / 2))),
    p75: median(x.slice(Math.ceil(n / 2))),
    min: x[0],
    max: x.at(-1),
  };
};
for (const r of Object.values(rounds))
  for (const [mode, run] of Object.entries(r)) {
    assert(run.complete);
    for (const s of run.samples) {
      assert(names.includes(s.name));
      assert(!s.error);
      assert.equal(
        s.result.length,
        mode === 'mem' ? 3 : s.id.startsWith('04') ? 25 : 15
      );
    }
  }
const cpu = {},
  memory = {},
  weighted = {};
for (const order of ['main', 'reverse', 'pooled']) {
  const runs = order === 'pooled' ? Object.values(rounds) : [rounds[order]];
  cpu[order] = Object.keys(weights).map(id => {
    const conditions = Object.fromEntries(
      names.map(name => {
        const raw = runs.flatMap(r =>
          r.cpu.samples
            .filter(s => s.name === name && s.id === id)
            .flatMap(s => s.result)
        );
        return [
          name,
          Object.fromEntries(
            ['total', 'script', 'paint'].map(m => [
              m,
              distribution(raw.map(x => x[m])),
            ])
          ),
        ];
      })
    );
    return {
      id,
      weight: weights[id],
      conditions,
      change: Object.fromEntries(
        Object.entries(pairs).map(([p, [a, b]]) => [
          p,
          Object.fromEntries(
            ['total', 'script', 'paint'].map(m => [
              m,
              conditions[a][m].median / conditions[b][m].median - 1,
            ])
          ),
        ])
      ),
    };
  });
  weighted[order] = Object.fromEntries(
    Object.keys(pairs).map(p => [
      p,
      Object.fromEntries(
        ['total', 'script', 'paint'].map(m => [
          m,
          Math.exp(
            cpu[order].reduce(
              (sum, r) => sum + r.weight * Math.log(1 + r.change[p][m]),
              0
            ) / cpu[order].reduce((s, r) => s + r.weight, 0)
          ) - 1,
        ])
      ),
    ])
  );
  memory[order] = rounds.main.mem.samples
    .filter(s => s.name === 'stock')
    .map(s => {
      const conditions = Object.fromEntries(
        names.map(name => [
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
        change: Object.fromEntries(
          Object.entries(pairs).map(([p, [a, b]]) => [
            p,
            conditions[a].median / conditions[b].median - 1,
          ])
        ),
      };
    });
}
const counts = Object.fromEntries(
  ['cpu', 'mem'].map(m => [
    m === 'mem' ? 'memory' : m,
    Object.values(rounds).reduce(
      (sum, r) => sum + r[m].samples.reduce((s, v) => s + v.result.length, 0),
      0
    ),
  ])
);
assert.equal(counts.cpu, 870);
assert.equal(counts.memory, 90);
const core = read('core-regressions.json');
assert(core.success && core.numFailedTests === 0);
const result = {
  at: new Date().toISOString(),
  scope:
    'manual static/dynamic HTML blueprint on original cached A app; stock/control/candidate, no C4 or peer/Vue samples',
  pairs,
  counts,
  cpu,
  memory,
  weighted,
  builds: read('build-manifest.json'),
  validation: {
    unit: read('check.json'),
    identity: read('identity-check.json'),
    browser: read('browser.json'),
    core: {
      passed: core.numPassedTests,
      failed: core.numFailedTests,
      files: core.testResults.length,
    },
    preparation: read('preparation-notes.json'),
  },
  runs: Object.fromEntries(
    Object.entries(rounds).map(([o, r]) => [
      o,
      Object.fromEntries(
        Object.entries(r).map(([m, v]) => [
          m,
          {
            startedAt: v.startedAt,
            finishedAt: v.finishedAt,
            chrome: v.chrome,
            loadStart: v.loadStart,
            loadEnd: v.loadEnd,
            failedBatches: v.failedBatches || [],
            warnings: v.samples.flatMap(s => s.warnings || []),
          },
        ])
      ),
    ])
  ),
  inputs: {
    initial: createHash('sha256')
      .update(fs.readFileSync(path.join(out, 'initial.json')))
      .digest('hex'),
    weights: createHash('sha256')
      .update(fs.readFileSync(weightFile))
      .digest('hex'),
  },
};
fs.writeFileSync(
  path.join(out, 'results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({ counts, weighted, memory: memory.pooled }, null, 2)
);

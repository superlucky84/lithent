import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileHash, read } from './config.mjs';
import { verify } from './guard.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
verify(out);
const analysis = read(path.join(out, 'analysis.json')),
  diagnostic = read(path.join(out, 'diagnosis.json')),
  traceDiagnostic = read(path.join(out, 'trace-diagnosis.json')),
  mapping = read(path.join(out, 'source-map.json'));
assert.equal(diagnostic.complete, true);
assert.equal(diagnostic.runs.length, analysis.targets.length * 6);
assert.equal(traceDiagnostic.complete, true);
assert.equal(traceDiagnostic.runs.length, analysis.targets.length * 2);
assert.equal(diagnostic.protocol.mode, 'profile');
assert.equal(traceDiagnostic.protocol.mode, 'trace');
let mapper, coreMapper, originalPositionFor, sourceContentFor;
if (mapping.usable) {
  assert.equal(mapping.bundleSHA256, analysis.build.lithent.bundle);
  assert.equal(
    fileHash(path.join(out, 'diagnosis-source-map/main.js.map')),
    mapping.mapSHA256
  );
  const require = createRequire(
    path.join(out, 'sources/react-hooks/package.json')
  );
  const library = require('@jridgewell/trace-mapping');
  mapper = new library.TraceMap(
    read(path.join(out, 'diagnosis-source-map/main.js.map'))
  );
  originalPositionFor = library.originalPositionFor;
  sourceContentFor = library.sourceContentFor;
  if (mapping.coreMap) {
    assert.equal(
      fileHash(path.join(out, mapping.coreMap.file)),
      mapping.coreMap.sha256
    );
    coreMapper = new library.TraceMap(
      read(path.join(out, mapping.coreMap.file))
    );
  }
}
const summaries = [];
for (const run of diagnostic.runs) {
  assert.equal(run.complete, true);
  assert.equal(run.profiles.length, 10);
  assert.deepEqual(run.errors, []);
  assert.equal(fileHash(path.join(out, run.profileFile)), run.profileSHA256);
  const profiles = JSON.parse(
    zlib.gunzipSync(fs.readFileSync(path.join(out, run.profileFile)))
  ).profiles;
  assert.equal(profiles.length, 10);
  const functions = {},
    categories = {
      applicationUs: 0,
      driverUs: 0,
      gcUs: 0,
      idleUs: 0,
      otherUs: 0,
    };
  let sampledUs = 0;
  const excludedProfiles = [];
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i],
      nodes = new Map(profile.nodes.map(node => [node.id, node]));
    assert.equal(profile.samples.length, profile.timeDeltas.length);
    assert.equal(profile.samples.length, run.profiles[i].samples);
    assert.ok(profile.samples.every(sample => nodes.has(sample)));
    assert.ok(profile.timeDeltas.every(Number.isFinite));
    const negativeDeltas = profile.timeDeltas.flatMap((delta, index) =>
      delta < 0 ? [{ index, delta }] : []
    );
    if (negativeDeltas.length) {
      excludedProfiles.push({
        iteration: i,
        negativeDeltas,
        samples: profile.samples.length,
        reason:
          'Entire profile excluded from duration ranking; negative CDP deltas are not clamped or reordered',
      });
      continue;
    }
    for (let s = 0; s < profile.samples.length; s++) {
      const node = nodes.get(profile.samples[s]);
      assert.ok(node);
      const delta = profile.timeDeltas[s];
      assert.ok(Number.isFinite(delta) && delta >= 0);
      sampledUs += delta;
      const frame = node.callFrame,
        application = frame.url.includes('/' + run.name + '/');
      const category = application
        ? 'applicationUs'
        : frame.functionName === '(garbage collector)'
          ? 'gcUs'
          : frame.functionName === '(idle)'
            ? 'idleUs'
            : /evaluation|pptr:/.test(frame.url)
              ? 'driverUs'
              : 'otherUs';
      categories[category] += delta;
      if (application) {
        const key = [
          frame.url,
          frame.lineNumber,
          frame.columnNumber,
          frame.functionName,
        ].join(':');
        const fn = (functions[key] ||= {
          name: frame.functionName,
          url: frame.url,
          line: frame.lineNumber,
          column: frame.columnNumber,
          selfUs: 0,
          samples: 0,
        });
        fn.selfUs += delta;
        fn.samples++;
        if (
          run.name === 'lithent' &&
          mapper &&
          !fn.original &&
          frame.lineNumber >= 0 &&
          frame.columnNumber >= 0
        ) {
          const original = originalPositionFor(mapper, {
            line: frame.lineNumber + 1,
            column: frame.columnNumber,
          });
          if (original.source && original.line) {
            const source = sourceContentFor(mapper, original.source) || '';
            fn.original = {
              ...original,
              snippet: (source.split('\n')[original.line - 1] || '').slice(
                Math.max(0, original.column - 40),
                original.column + 240
              ),
            };
          }
        }
        if (
          fn.original &&
          coreMapper &&
          /\/lithent\.mjs$/.test(fn.original.source) &&
          !fn.coreOriginal
        ) {
          const original = originalPositionFor(coreMapper, {
            line: fn.original.line,
            column: fn.original.column,
          });
          if (original.source && original.line) {
            const source = sourceContentFor(coreMapper, original.source) || '';
            fn.coreOriginal = {
              ...original,
              snippet: source
                .split('\n')
                .slice(Math.max(0, original.line - 3), original.line + 5)
                .join('\n'),
              provenance:
                'Existing default ESM map, embedded source verified against frozen runtime',
            };
          }
        }
      }
    }
  }
  assert.equal(
    Object.values(categories).reduce((a, b) => a + b, 0),
    sampledUs
  );
  const summary = {
    id: run.id,
    name: run.name,
    round: run.round,
    sampledUs,
    validProfiles: profiles.length - excludedProfiles.length,
    excludedProfiles,
    categories,
    topFunctions: Object.values(functions)
      .sort((a, b) => b.selfUs - a.selfUs)
      .slice(0, 30),
  };
  const traceRun =
    run.round === 0
      ? traceDiagnostic.runs.find(t => t.id === run.id && t.name === run.name)
      : null;
  if (traceRun) {
    assert.equal(traceRun.complete, true);
    assert.equal(traceRun.profiles.length, 10);
    assert.deepEqual(traceRun.errors, []);
    assert.equal(
      fileHash(path.join(out, traceRun.traceFile)),
      traceRun.traceSHA256
    );
    const trace = JSON.parse(
      zlib.gunzipSync(fs.readFileSync(path.join(out, traceRun.traceFile)))
    );
    const events = trace.traceEvents || trace;
    const windows = [];
    for (let i = 0; i < 10; i++) {
      const start = events.find(e => e.name === 'peer-diag-' + i + '-start'),
        end = events.find(e => e.name === 'peer-diag-' + i + '-end');
      assert.ok(start && end && end.ts >= start.ts);
      windows.push({
        start: start.ts,
        end: end.ts,
        pid: start.pid,
        tid: start.tid,
      });
    }
    const names = [
      'FunctionCall',
      'EventDispatch',
      'UpdateLayoutTree',
      'Layout',
      'Paint',
      'V8.GCScavenger',
      'V8.GCCompactor',
    ];
    summary.trace = {
      source: traceRun.traceFile,
      independentContext: true,
      windows,
      events: Object.fromEntries(
        names.map(name => {
          const selected = events.filter(
            e =>
              e.name === name &&
              e.ph === 'X' &&
              Number.isFinite(e.dur) &&
              windows.some(
                w =>
                  e.pid === w.pid &&
                  e.tid === w.tid &&
                  e.ts >= w.start &&
                  e.ts + e.dur <= w.end
              )
          );
          return [
            name,
            {
              count: selected.length,
              inclusiveMs: selected.reduce((sum, e) => sum + e.dur, 0) / 1000,
            },
          ];
        })
      ),
      note: 'Complete events inside marked action windows on the renderer main thread; inclusive/nested durations are not additive. Setup/reset outside windows is excluded.',
    };
  }
  summaries.push(summary);
}
const groups = [];
for (const target of analysis.targets)
  for (const name of ['lithent', target.peer]) {
    const runs = summaries.filter(
      run => run.id === target.id && run.name === name
    );
    assert.equal(runs.length, 3);
    const functions = {};
    for (const run of runs)
      for (const fn of run.topFunctions) {
        const key = [fn.url, fn.line, fn.column, fn.name].join(':');
        const value = (functions[key] ||= { ...fn, selfUs: 0, samples: 0 });
        value.selfUs += fn.selfUs;
        value.samples += fn.samples;
      }
    groups.push({
      id: target.id,
      name,
      runs: 3,
      validProfiles: runs.map(run => run.validProfiles),
      excludedProfiles: runs.flatMap(run =>
        run.excludedProfiles.map(profile => ({ round: run.round, ...profile }))
      ),
      categories: Object.fromEntries(
        Object.keys(runs[0].categories).map(key => [
          key,
          runs.map(run => run.categories[key]),
        ])
      ),
      topFunctions: Object.values(functions)
        .sort((a, b) => b.selfUs - a.selfUs)
        .slice(0, 20),
    });
  }
const result = {
  complete: true,
  startedAt: diagnostic.startedAt,
  finishedAt: diagnostic.finishedAt,
  traceStartedAt: traceDiagnostic.startedAt,
  traceFinishedAt: traceDiagnostic.finishedAt,
  sourceMap: mapping,
  protocol: diagnostic.protocol,
  traceProtocol: traceDiagnostic.protocol,
  traceRuns: traceDiagnostic.runs,
  excludedFirstAttempt: fs.existsSync(
    path.join(out, 'diagnosis-first-attempt/index.json')
  )
    ? read(path.join(out, 'diagnosis-first-attempt/index.json'))
    : null,
  summaries,
  groups,
  samplePolicy:
    'Whole profiles with any negative timeDelta are excluded from duration rankings. All raw profiles are retained. Group sums have explicitly reported valid action counts and are not cross-condition speedup estimates.',
  limits: [
    'CPU profiles sample active, native, driver and idle frames with profiler overhead. Sampling-time totals are not official scores or exact function CPU accounting.',
    'Only the top 30 app functions/context enter the aggregate ranking; source map positions describe function locations, not proof that a whole function body caused the sampled work.',
    'Trace durations are inclusive, nested and measured at 1x diagnostic throttle. No official-score gain is inferred.',
  ],
};
fs.writeFileSync(
  path.join(out, 'profile-analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    groups.map(group => ({
      id: group.id,
      name: group.name,
      top: group.topFunctions.slice(0, 6),
    })),
    null,
    2
  )
);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root, hash, read, guard } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
const lane = process.argv[3] || 'production';
const coreVariant = lane === 'layout-candidate' ? 'candidate' : 'baseline';
guard(out);
const require = createRequire(import.meta.url);
const terserRequire = createRequire(require.resolve('terser'));
const mappingRequire = createRequire(
  terserRequire.resolve('@jridgewell/source-map')
);
const { TraceMap, originalPositionFor } = mappingRequire(
  '@jridgewell/trace-mapping'
);
const mapper = new TraceMap(read(path.join(out, lane, 'main.js.map')));
const coreMapper = new TraceMap(
  read(path.join(out, coreVariant, 'dist/lithent.mjs.map'))
);
const production = fs.readFileSync(path.join(out, lane, 'main.js'), 'utf8');
if (lane === 'production')
  assert.equal(
    hash(production),
    '12d25a3bf28c163d67c6734119ad7407473b362b136b91bc8f3ef7523db9be12'
  );
const coreSource = mapper.sources.findIndex(name =>
  name.endsWith('/lithent.mjs')
);
assert.equal(
  hash(mapper.sourcesContent[coreSource]),
  hash(fs.readFileSync(path.join(out, coreVariant, 'dist/lithent.mjs')))
);
for (let i = 0; i < coreMapper.sources.length; i++) {
  const file = path.resolve(out, coreVariant, 'dist', coreMapper.sources[i]);
  assert.equal(
    hash(coreMapper.sourcesContent[i]),
    hash(fs.readFileSync(file)),
    file
  );
}
function original(line, column) {
  const first = originalPositionFor(mapper, {
    line,
    column: Math.max(0, column - 1),
  });
  if (!first.source) return null;
  if (first.source.endsWith('/lithent.mjs')) {
    const second = originalPositionFor(coreMapper, {
      line: first.line,
      column: first.column,
    });
    return second.source
      ? {
          source: second.source.replace('../src/', 'src/'),
          line: second.line,
          column: second.column,
          name: second.name,
        }
      : first;
  }
  return {
    source: first.source.replace(/^.*\/sources\/lithent\//, 'app/'),
    line: first.line,
    column: first.column,
    name: first.name,
  };
}
const address = value => '0x' + BigInt(value).toString(16);
const icKinds = new Set([
  'LoadIC',
  'StoreIC',
  'KeyedLoadIC',
  'KeyedStoreIC',
  'StoreInArrayLiteralIC',
  'DefineKeyedOwnIC',
]);
const contextResults = [];
const rawInventory = [];

for (const name of fs
  .readdirSync(path.join(out, lane + '-diagnostic'))
  .filter(name => name.endsWith('-v8.log'))
  .sort()) {
  const bytes = fs.readFileSync(path.join(out, lane + '-diagnostic', name));
  rawInventory.push({
    file: lane + '-diagnostic/' + name,
    bytes: bytes.length,
    sha256: hash(bytes),
  });
  const lines = bytes.toString('utf8').split('\n');
  const scripts = new Map(),
    code = new Map(),
    maps = new Map();
  const sites = new Map(),
    functions = new Map(),
    markers = [];
  let targetId,
    v8,
    totalIC = 0,
    matchedIC = 0,
    unresolvedIC = 0,
    foreignIC = 0;
  for (let row = 0; row < lines.length; row++) {
    const fields = lines[row].split(',');
    const kind = fields[0];
    if (kind === 'v8-version') v8 = fields.slice(1, 5).join('.');
    else if (kind === 'script-source') {
      scripts.set(Number(fields[1]), fields[2]);
      if (fields[2].endsWith('/' + lane + '/main.js'))
        targetId = Number(fields[1]);
    } else if (kind === 'map-details') {
      const details = fields.slice(3).join(',');
      maps.set(address(fields[2]), {
        dictionary: details.includes('dictionary_map'),
        descriptors: [
          ...details.matchAll(/\[\d+\]:.*?<String\[\d+\]: #([^>]+)>/g),
        ].map(match => match[1]),
        instanceSize: Number(details.match(/instance size: (\d+)/)?.[1] || 0),
      });
    } else if (kind === 'code-creation') {
      const entry = {
        kind: fields[1],
        tick: Number(fields[3]),
        start: BigInt(fields[4]),
        size: BigInt(fields[5]),
        name: fields[6],
        sharedFunction: fields[7]?.startsWith('0x') ? address(fields[7]) : null,
        sourceId: undefined,
        sourceOffset: undefined,
        row: row + 1,
      };
      code.set(address(fields[4]), entry);
      const marker = fields[6].match(/(__shape_phase_\d+_[\w]+_(?:start|end))/);
      if (marker)
        markers.push({ marker: marker[1], tick: entry.tick, row: row + 1 });
      if (fields[6].includes('/' + lane + '/main.js:'))
        functions.set(address(fields[4]), entry);
    } else if (kind === 'code-source-info') {
      const entry = code.get(address(fields[1]));
      if (entry) {
        entry.sourceId = Number(fields[2]);
        entry.sourceOffset = Number(fields[3]);
      }
    } else if (kind === 'code-move') {
      const old = code.get(address(fields[1]));
      if (old) {
        code.delete(address(fields[1]));
        old.start = BigInt(fields[2]);
        code.set(address(fields[2]), old);
      }
    } else if (kind === 'code-delete') code.delete(address(fields[1]));
    else if (icKinds.has(kind)) {
      totalIC++;
      const pc = BigInt(fields[1]);
      // Most recent still-live code range owns this PC. Never attribute by property name alone.
      const candidates = [...code.values()]
        .filter(entry => entry.start <= pc && pc < entry.start + entry.size)
        .sort((a, b) => b.row - a.row);
      const owner = candidates[0];
      if (!owner || owner.sourceId === undefined) {
        unresolvedIC++;
        continue;
      }
      if (targetId === undefined || owner.sourceId !== targetId) {
        foreignIC++;
        continue;
      }
      matchedIC++;
      const line = Number(fields[3]),
        column = Number(fields[4]),
        property = fields[8];
      const key = `${kind}:${line}:${column}:${property}`;
      let site = sites.get(key);
      if (!site)
        sites.set(
          key,
          (site = {
            key,
            kind,
            line,
            column,
            property,
            original: original(line, column),
            transitions: [],
            receiverMaps: [],
            owners: [],
          })
        );
      const map = address(fields[7]);
      site.transitions.push({
        row: row + 1,
        tick: Number(fields[2]),
        old: fields[5],
        next: fields[6],
        map,
        pc: address(fields[1]),
      });
      if (!site.receiverMaps.includes(map)) site.receiverMaps.push(map);
      if (!site.owners.includes(owner.name)) site.owners.push(owner.name);
    }
  }
  if (targetId === undefined) continue;
  const siteResults = [...sites.values()].map(site => ({
    ...site,
    final: site.transitions.at(-1).next,
    states: [
      ...new Set(site.transitions.flatMap(item => [item.old, item.next])),
    ],
    mapDetails: Object.fromEntries(
      site.receiverMaps.map(map => [map, maps.get(map) || null])
    ),
  }));
  const accessSites = new Map();
  for (const item of siteResults) {
    const key = `${item.kind}:${item.line}:${item.column}`;
    let access = accessSites.get(key);
    if (!access)
      accessSites.set(
        key,
        (access = {
          key,
          kind: item.kind,
          line: item.line,
          column: item.column,
          original: item.original,
          cases: [],
          transitions: [],
        })
      );
    access.cases.push(item.property);
    access.transitions.push(
      ...item.transitions.map(event => ({ ...event, property: item.property }))
    );
  }
  const accesses = [...accessSites.values()].map(access => {
    access.transitions.sort((a, b) => a.row - b.row);
    access.states = [
      ...new Set(access.transitions.flatMap(event => [event.old, event.next])),
    ];
    access.final = access.transitions.at(-1).next;
    for (const event of access.transitions) {
      const start = markers.find(
        marker =>
          marker.marker.endsWith('_start') &&
          marker.tick <= event.tick &&
          markers.find(
            end =>
              end.marker === marker.marker.replace(/_start$/, '_end') &&
              end.tick >= event.tick
          )
      );
      event.phase = start
        ? start.marker.replace(/^__shape_phase_\d+_/, '').replace(/_start$/, '')
        : 'outside-actions';
    }
    return access;
  });
  contextResults.push({
    file: name,
    v8,
    scriptId: targetId,
    appURL: scripts.get(targetId),
    totalIC,
    matchedIC,
    unresolvedIC,
    foreignIC,
    sites: siteResults,
    accessSites: accesses,
    markers,
    functions: [...functions.values()].map(entry => ({
      address: address(entry.start),
      size: Number(entry.size),
      sharedFunction: entry.sharedFunction,
      name: entry.name,
      sourceOffset: entry.sourceOffset,
      source:
        entry.sourceOffset === undefined
          ? null
          : original(1, entry.sourceOffset + 1),
    })),
  });
}
assert.equal(contextResults.length, 3);
const probe = read(path.join(out, 'probe-diagnostic/result.json'));
assert.equal(probe.complete, true);
const debugLines = fs
  .readFileSync(path.join(out, 'probe-diagnostic/stdout.log'), 'utf8')
  .split('\n');
const debugMaps = [];
let context = -1,
  previousSample = Infinity;
for (let i = 0; i < debugLines.length; i++) {
  const match = debugLines[i].match(/SHAPE_SAMPLE:(\d+)/);
  if (!match) continue;
  const sample = Number(match[1]);
  if (sample <= previousSample) context++;
  previousSample = sample;
  const object = debugLines[i + 1]?.match(/<Object map = (0x[0-9a-f]+)>/i);
  assert.ok(object, debugLines[i + 1]);
  const record = probe.runs[context].samples[sample];
  assert.equal(record.token, 'SHAPE_SAMPLE:' + sample);
  debugMaps.push({ context, ...record, objectMap: address(object[1]) });
}
assert.equal(
  debugMaps.length,
  probe.runs.reduce((n, run) => n + run.samples.length, 0)
);
const transitions = [];
for (let r = 0; r < probe.runs.length; r++) {
  const byId = new Map();
  for (const sample of debugMaps.filter(item => item.context === r)) {
    const previous = byId.get(sample.id);
    if (previous && previous.objectMap !== sample.objectMap)
      transitions.push({
        context: r,
        id: sample.id,
        site: sample.site,
        from: {
          phase: previous.phase,
          stage: previous.stage,
          map: previous.objectMap,
          fields: previous.fields,
        },
        to: {
          phase: sample.phase,
          stage: sample.stage,
          map: sample.objectMap,
          fields: sample.fields,
        },
      });
    byId.set(sample.id, sample);
  }
}
const deoptLines = fs
  .readFileSync(path.join(out, lane + '-diagnostic/stdout.log'), 'utf8')
  .split('\n')
  .filter(line => line.includes('deopt'));
const deopts = deoptLines.map(line => {
  const codeAddress =
    line.match(/, (0x[0-9a-f]+) <Code /)?.[1] ||
    line.match(/dependent code (0x[0-9a-f]+)/)?.[1];
  const reasons =
    line.match(/reason: ([^)]+)\)/)?.[1] ||
    line.match(/reason: (.+)$/)?.[1] ||
    null;
  const sharedFunction =
    line.match(/(?:sfi = |SharedFunctionInfo[^>]*\n)(0x[0-9a-f]+)/)?.[1] ||
    line.match(/\((0x[0-9a-f]+) <SharedFunctionInfo/)?.[1];
  const untaggedSfi = sharedFunction
    ? '0x' + (BigInt(sharedFunction) - 1n).toString(16)
    : null;
  const pc = line.match(/pc (0x[0-9a-f]+)/)?.[1];
  let owners = untaggedSfi
    ? contextResults.flatMap(run =>
        run.functions
          .filter(fn => fn.sharedFunction === untaggedSfi)
          .map(fn => ({ log: run.file, name: fn.name, source: fn.source }))
      )
    : [];
  owners = [
    ...new Map(
      owners.map(owner => [
        owner.log + ':' + JSON.stringify(owner.source),
        owner,
      ])
    ).values(),
  ];
  return {
    kind: line.startsWith('[bailout') ? 'bailout' : 'dependent-invalidation',
    reason: reasons,
    codeAddress,
    sharedFunction,
    pc,
    owners,
    raw: line,
  };
});
const summary = contextResults.map(run => ({
  file: run.file,
  propertyCases: run.sites.length,
  accessSites: run.accessSites.length,
  matchedIC: run.matchedIC,
  unresolvedIC: run.unresolvedIC,
  finalStates: run.accessSites.reduce(
    (states, site) => (
      (states[site.final] = (states[site.final] || 0) + 1), states
    ),
    {}
  ),
  everN: run.accessSites
    .filter(site => site.states.includes('N'))
    .map(site => ({
      key: site.key,
      original: site.original,
      properties: site.cases,
      final: site.final,
      states: site.states,
    })),
}));
const result = {
  at: new Date().toISOString(),
  lane,
  note: 'IC log records transitions, not every access or durations. P/H/N counts do not measure cost. Source mapping verified against frozen bundle/core/source content.',
  sourceMapping: {
    production: hash(production),
    appMap: hash(fs.readFileSync(path.join(out, lane, 'main.js.map'))),
    coreMap: hash(
      fs.readFileSync(path.join(out, coreVariant, 'dist/lithent.mjs.map'))
    ),
    verifiedCoreSources: coreMapper.sources.length,
  },
  production: { summary, contexts: contextResults, deopts, rawInventory },
  probe: { runs: probe.runs, sampledMapTransitions: transitions, debugMaps },
};
fs.writeFileSync(
  path.join(
    out,
    lane === 'production' ? 'analysis.json' : 'analysis-' + lane + '.json'
  ),
  JSON.stringify(result, null, 2) + '\n'
);
guard(out);
console.log(
  JSON.stringify({
    summary,
    deopts: deopts.length,
    mappedDeopts: deopts.filter(item => item.owners.length).length,
    sampledMaps: debugMaps.length,
    sampledMapTransitions: transitions.length,
    probes: probe.runs.map(run => ({
      scenario: run.scenario,
      phases: run.phases.length,
    })),
  })
);

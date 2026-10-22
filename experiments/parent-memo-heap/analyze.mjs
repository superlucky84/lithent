import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { Snapshot } from './snapshot.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-heap-20261022');
const collection = JSON.parse(
  fs.readFileSync(path.join(out, 'collection.json'))
);
assert.equal(collection.complete, true);
assert.equal(collection.runs.length, 8);
assert.equal(
  collection.browser.sha256,
  '6e156f2271cef44afce9db36a5b920e94518857b94a4160f082696f8c3bd1c9d'
);
assert.equal(
  collection.browser.frameworkSHA256,
  'b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7'
);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const median = values => {
  const a = [...values].sort((a, b) => a - b);
  return (a[Math.floor((a.length - 1) / 2)] + a[Math.floor(a.length / 2)]) / 2;
};
const summarize = snap => {
  const templates = new Set();
  for (let i = 0; i < snap.count; i++) {
    if (snap.name(i) !== 'system / AllocationSite') continue;
    for (const edge of snap.edges(i))
      if (edge.type === 'internal' && edge.name === 'transition_info')
        templates.add(edge.to);
  }
  const groups = {},
    types = {},
    shapes = { componentInfo: 0, memo: 0, snapshot: 0, output: 0, rowData: 0 },
    maps = [],
    representatives = {},
    shapeIDs = {};
  let selfBytes = 0;
  for (let i = 0; i < snap.count; i++) {
    const type = snap.type(i),
      name = snap.name(i),
      bytes = snap.field(i, 'self_size');
    const label =
      name.length > 180
        ? name.slice(0, 100) + ' [sha256:' + hash(name) + ']'
        : name;
    for (const [target, key] of [
      [groups, type + ': ' + label],
      [types, type],
    ]) {
      const group = (target[key] ||= { count: 0, selfBytes: 0 });
      group.count++;
      group.selfBytes += bytes;
    }
    selfBytes += bytes;
    if (type === 'object') {
      const keys = snap.properties(i),
        has = required => required.every(key => keys.includes(key));
      for (const [shape, required] of Object.entries({
        componentInfo: ['ctor', 'vd', 'up', 'upR', 'umts'],
        memo: ['dependencies', 'version'],
        snapshot: ['keys', 'deps'],
        output: ['component', 'memo', 'version'],
        rowData: ['id', 'label'],
      })) {
        if (!has(required)) continue;
        shapes[shape]++;
        const ids = (shapeIDs[shape] ||= { templates: [], instances: [] });
        ids[templates.has(i) ? 'templates' : 'instances'].push(
          snap.field(i, 'id')
        );
        const examples = (representatives[shape] ||= []);
        if (examples.length < 3)
          examples.push({
            index: i,
            node: snap.describe(i),
            allocationTemplate: templates.has(i),
            properties: keys,
            path: snap.path(i),
          });
      }
    }
    if (type === 'object' && name === 'WeakMap') {
      const table = snap
        .edges(i)
        .find(edge => edge.type === 'internal' && edge.name === 'table');
      if (table) {
        const edges = snap.edges(table.to);
        maps.push({
          map: snap.describe(i),
          table: snap.describe(table.to),
          tableEdgesByType: Object.fromEntries(
            [...new Set(edges.map(edge => edge.type))].map(type => [
              type,
              edges.filter(edge => edge.type === type).length,
            ])
          ),
          tableTargets: Object.entries(
            edges.reduce((counts, edge) => {
              const label = snap.type(edge.to) + ': ' + snap.name(edge.to);
              counts[label] = (counts[label] || 0) + 1;
              return counts;
            }, {})
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
          path: snap.path(i),
        });
      }
    }
  }
  assert.equal(
    Object.values(groups).reduce((sum, group) => sum + group.selfBytes, 0),
    selfBytes
  );
  assert.equal(
    Object.values(types).reduce((sum, group) => sum + group.count, 0),
    snap.count
  );
  const wanted = new Map(
    Object.values(representatives)
      .flat()
      .map(example => [example.index, example])
  );
  for (let from = 0; from < snap.count; from++)
    for (const edge of snap.edges(from)) {
      const example = wanted.get(edge.to);
      if (example && (example.incoming ||= []).length < 12)
        example.incoming.push({
          edge: { type: edge.type, name: edge.name.slice(0, 180) },
          node: snap.describe(from),
          path: snap.path(from),
        });
    }
  return {
    nodeCount: snap.count,
    edgeCount: snap.data.snapshot.edge_count,
    selfBytes,
    types,
    shapes,
    shapeIDs,
    instances: Object.fromEntries(
      Object.keys(shapes).map(shape => [
        shape,
        shapeIDs[shape]?.instances.length || 0,
      ])
    ),
    allocationTemplates: Object.fromEntries(
      Object.keys(shapes).map(shape => [
        shape,
        shapeIDs[shape]?.templates.length || 0,
      ])
    ),
    weakMaps: maps,
    representatives,
    groups,
  };
};
const difference = (before, after) => {
  const groups = [
    ...new Set([...Object.keys(before.groups), ...Object.keys(after.groups)]),
  ].map(name => ({
    name,
    count: (after.groups[name]?.count || 0) - (before.groups[name]?.count || 0),
    selfBytes:
      (after.groups[name]?.selfBytes || 0) -
      (before.groups[name]?.selfBytes || 0),
  }));
  const total = after.selfBytes - before.selfBytes;
  assert.equal(
    groups.reduce((sum, group) => sum + group.selfBytes, 0),
    total
  );
  return {
    selfBytes: total,
    instanceSurvivors: Object.fromEntries(
      Object.keys(before.shapes).map(shape => {
        const afterIDs = new Set(after.shapeIDs[shape]?.instances || []);
        const ids = (before.shapeIDs[shape]?.instances || []).filter(id =>
          afterIDs.has(id)
        );
        return [shape, { count: ids.length, ids: ids.slice(0, 20) }];
      })
    ),
    byType: Object.fromEntries(
      [
        ...new Set([...Object.keys(before.types), ...Object.keys(after.types)]),
      ].map(type => [
        type,
        {
          count:
            (after.types[type]?.count || 0) - (before.types[type]?.count || 0),
          selfBytes:
            (after.types[type]?.selfBytes || 0) -
            (before.types[type]?.selfBytes || 0),
        },
      ])
    ),
    largestGrowth: groups
      .filter(group => group.selfBytes > 0)
      .sort((a, b) => b.selfBytes - a.selfBytes)
      .slice(0, 25),
    largestReduction: groups
      .filter(group => group.selfBytes < 0)
      .sort((a, b) => a.selfBytes - b.selfBytes)
      .slice(0, 15),
  };
};
const result = {
  complete: false,
  collection,
  metrics: {},
  snapshots: {},
  differences: {},
  limits: [
    'Self size is not retained size or CDP JSHeapUsedSize; native/embedder nodes are included by the snapshot.',
    'Only one snapshot context per condition. Snapshot collection changes GC and can affect optimization.',
    'Shape counts are specific to the exact preserved production build, not universal class labels. AllocationSite.transition_info boilerplates are separated from instances.',
    'Strong paths exclude weak/conditional ephemeron edges and DevTools console handles; no dominator analysis or statistical significance claim.',
  ],
};
for (const name of ['lithent-before', 'lithent']) {
  const runs = collection.runs.filter(
    run => run.kind === 'metrics' && run.name === name
  );
  assert.equal(runs.length, 3);
  result.metrics[name] = collection.protocol.checkpoints.map(cycles => {
    const points = runs.map(run =>
      run.points.find(point => point.label === 'clear-' + cycles)
    );
    assert.equal(points.length, 3);
    return {
      cycles,
      heapBytes: points.map(point => point.jsHeapBytes),
      medianHeapBytes: median(points.map(point => point.jsHeapBytes)),
      dom: points.map(point => ({
        documents: point.documents,
        nodes: point.nodes,
        jsEventListeners: point.jsEventListeners,
      })),
    };
  });
  const run = collection.runs.find(
    run => run.kind === 'snapshot' && run.name === name
  );
  assert.equal(run.points.length, 7);
  result.snapshots[name] = {};
  for (const point of run.points) {
    const compressed = fs.readFileSync(path.join(out, point.snapshot.file));
    assert.equal(hash(compressed), point.snapshot.gzipSHA256);
    const bytes = zlib.gunzipSync(compressed);
    assert.equal(hash(bytes), point.snapshot.sha256);
    assert.equal(bytes.length, point.snapshot.bytes);
    const snap = new Snapshot(JSON.parse(bytes));
    result.snapshots[name][point.label] = summarize(snap);
    if (point.label !== 'live-1000') {
      const instances = result.snapshots[name][point.label].instances;
      for (const shape of ['rowData', 'memo', 'snapshot', 'output'])
        assert.equal(
          instances[shape],
          0,
          name + ' ' + point.label + ' ' + shape
        );
      assert.equal(instances.componentInfo, 2, 'Only mounted App/Table remain');
    }
  }
  const snapshots = result.snapshots[name];
  result.differences[name] = Object.fromEntries(
    [
      ['clear-5', 'clear-25'],
      ['clear-25', 'clear-100'],
      ['clear-100', 'clear-300'],
      ['clear-300', 'live-1000'],
      ['live-1000', 'final-clear'],
    ].map(([before, after]) => [
      before + ' -> ' + after,
      difference(snapshots[before], snapshots[after]),
    ])
  );
}
result.complete = true;
fs.writeFileSync(
  path.join(out, 'analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      metrics: result.metrics,
      shapes: Object.fromEntries(
        Object.entries(result.snapshots).map(([name, points]) => [
          name,
          Object.fromEntries(
            Object.entries(points).map(([label, summary]) => [
              label,
              summary.shapes,
            ])
          ),
        ])
      ),
      deltas: Object.fromEntries(
        Object.entries(result.differences).map(([name, diffs]) => [
          name,
          Object.fromEntries(
            Object.entries(diffs).map(([label, diff]) => [
              label,
              {
                selfBytes: diff.selfBytes,
                top: diff.largestGrowth.slice(0, 4),
              },
            ])
          ),
        ])
      ),
    },
    null,
    2
  )
);

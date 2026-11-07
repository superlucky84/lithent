import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { read, guard } from './init.mjs';
import { distribution, median } from '../peer-baseline/statistics.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const raw = read(path.join(out, 'event-comparison/raw.json'));
assert(raw.finishedAt);
assert.deepEqual(raw.failures, []);
assert.equal(raw.timings.length, 128);
assert.equal(raw.memory.length, 48);
const names = ['baseline', 'event', 'c2', 'combined'];
const kinds = ['inline-only', 'inline-text', 'stable-text', 'noevent-text'];
assert.deepEqual(raw.protocol.variants, names);
const timing = {};
for (const order of ['main', 'reverse', 'pooled'])
  timing[order] = Object.fromEntries(
    kinds.map(kind => [
      kind,
      Object.fromEntries(
        names.map(name => {
          const pages = raw.timings.filter(
            page =>
              page.kind === kind &&
              page.variant === name &&
              (order === 'pooled' || page.order === (order === 'main' ? 0 : 1))
          );
          assert.equal(pages.length, order === 'pooled' ? 8 : 4);
          for (const page of pages) {
            assert.equal(page.updates.length, 30);
            assert.equal(page.dispatch.length, 10);
          }
          return [
            name,
            {
              pages: pages.length,
              updateMs: distribution(
                pages.flatMap(page => page.updates.map(value => value / 5))
              ),
              pageUpdateMedians: distribution(
                pages.map(page => median(page.updates) / 5)
              ),
              mountMs: distribution(pages.map(page => page.mount)),
              dispatch20kMs: distribution(
                pages.flatMap(page => page.dispatch.map(value => value.elapsed))
              ),
            },
          ];
        })
      ),
    ])
  );
const memory = Object.fromEntries(
  kinds.map(kind => [
    kind,
    Object.fromEntries(
      names.map(name => {
        const pages = raw.memory.filter(
          page => page.kind === kind && page.variant === name
        );
        assert.equal(pages.length, 3);
        return [
          name,
          {
            contexts: 3,
            updatedDeltaBytes: distribution(
              pages.map(page => page.updated.heap - page.empty.heap)
            ),
            churnDeltaBytes: distribution(
              pages.map(page => page.churned.heap - page.empty.heap)
            ),
            disposedDeltaBytes: distribution(
              pages.map(page => page.disposed.heap - page.empty.heap)
            ),
            settledDeltaBytes: distribution(
              pages.map(page => page.settled.heap - page.empty.heap)
            ),
            settledNodeGrowth: pages.map(
              page => page.settled.nodes - page.empty.nodes
            ),
            settledListenerGrowth: pages.map(
              page =>
                page.settled.jsEventListeners - page.empty.jsEventListeners
            ),
          },
        ];
      })
    ),
  ])
);
const comparisons = [
  ['event', 'baseline'],
  ['c2', 'baseline'],
  ['combined', 'baseline'],
  ['combined', 'event'],
  ['combined', 'c2'],
];
const ratios = Object.fromEntries(
  Object.entries(timing).map(([order, items]) => [
    order,
    Object.fromEntries(
      kinds.map(kind => [
        kind,
        Object.fromEntries(
          comparisons.map(([candidate, reference]) => [
            `${candidate}/${reference}`,
            Object.fromEntries(
              ['updateMs', 'pageUpdateMedians', 'mountMs', 'dispatch20kMs'].map(
                metric => [
                  metric,
                  items[kind][candidate][metric].median /
                    items[kind][reference][metric].median,
                ]
              )
            ),
          ])
        ),
      ])
    ),
  ])
);
const result = {
  at: new Date().toISOString(),
  scope:
    'Synthetic JS update/dispatch and post-GC heap; separate from final paint and official memory',
  protocol: raw.protocol,
  environment: raw.environment,
  timing,
  memory,
  ratios,
};
fs.writeFileSync(
  path.join(out, 'event-results.json'),
  JSON.stringify(result, null, 2) + '\n',
  { flag: 'wx' }
);
console.log(
  JSON.stringify(
    { pages: 128, memoryContexts: 48, updateRatios: ratios.pooled },
    null,
    2
  )
);

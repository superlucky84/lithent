// Offline diagnostics of the existing official traces. Does not change scores.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const out = fs.realpathSync(process.argv[2]);
const bench = JSON.parse(
  fs.readFileSync(path.join(out, 'runner-inputs.json'))
).bench;
const { computeResultsCPU, extractRelevantEvents } = await import(
  pathToFileURL(path.join(bench, 'webdriver-ts/dist/timeline.js'))
);
const jsNames = new Set([
  'EventDispatch',
  'EvaluateScript',
  'v8.evaluateModule',
  'FunctionCall',
  'TimerFire',
  'FireIdleCallback',
  'FireAnimationFrame',
  'RunMicrotasks',
  'V8.Execute',
]);
const renderNames = new Set([
  'UpdateLayoutTree',
  'Layout',
  'Commit',
  'Paint',
  'Layerize',
  'PrePaint',
]);
const median = a => {
  const x = [...a].sort((a, b) => a - b),
    n = x.length;
  return n % 2 ? x[(n - 1) / 2] : (x[n / 2 - 1] + x[n / 2]) / 2;
};
function unionDuration(intervals) {
  let end = -Infinity,
    sum = 0;
  for (const [a, b] of intervals.sort((a, b) => a[0] - b[0])) {
    if (b > end) {
      sum += b - Math.max(a, end);
      end = b;
    }
  }
  return sum;
}
const records = [];
const log = console.log;
console.log = () => {};
try {
  for (const order of ['main', 'reverse'])
    for (const name of ['baseline', 'candidate', 'preact-classes']) {
      const run = JSON.parse(
        fs.readFileSync(
          path.join(out, 'official-' + order, 'production-cpu.json')
        )
      );
      const sample = run.samples.find(
        x => x.name === name && x.id === '04_select1k'
      );
      assert(run.complete && sample.result.length === 25);
      for (let index = 0; index < 25; index++) {
        const relative = `official-${order}/traces/${name}-production-keyed_04_select1k_${index}.json`;
        const file = path.join(out, relative);
        const events = JSON.parse(fs.readFileSync(file)).traceEvents;
        const cpu = await computeResultsCPU(file, 'click');
        assert(Math.abs(cpu.duration - sample.result[index].total) < 1e-9);
        const click = events.find(
          x => x.name === 'EventDispatch' && x.args?.data?.type === 'click'
        );
        const relevant = events.filter(
          e =>
            e.pid === click.pid &&
            e.tid === click.tid &&
            e.ph === 'X' &&
            e.dur &&
            e.ts >= cpu.tsStart &&
            e.ts < cpu.tsEnd
        );
        const intervals = relevant
          .filter(e => jsNames.has(e.name) || renderNames.has(e.name))
          .map(e => [e.ts, Math.min(e.ts + e.dur, cpu.tsEnd)]);
        const coverage = unionDuration(intervals) / 1000;
        const selectedEvents = relevant
          .filter(e => jsNames.has(e.name) || renderNames.has(e.name))
          .sort((a, b) => a.ts - b.ts);
        const gaps = [];
        let selectedEnd = cpu.tsStart,
          previousName = 'start';
        for (const e of selectedEvents) {
          if (e.ts > selectedEnd)
            gaps.push({
              from: previousName,
              to: e.name,
              ms: (e.ts - selectedEnd) / 1000,
            });
          if (e.ts + e.dur > selectedEnd) {
            selectedEnd = Math.min(e.ts + e.dur, cpu.tsEnd);
            previousName = e.name;
          }
        }
        if (selectedEnd < cpu.tsEnd)
          gaps.push({
            from: previousName,
            to: 'selected end',
            ms: (cpu.tsEnd - selectedEnd) / 1000,
          });
        const largestGap = gaps.sort((a, b) => b.ms - a.ms)[0] || {
          from: 'none',
          to: 'none',
          ms: 0,
        };
        const microtasks = relevant.filter(e => e.name === 'RunMicrotasks');
        const lastMicrotaskEnd = Math.max(
          click.ts + click.dur,
          ...microtasks.map(e => e.ts + e.dur)
        );
        const firstRender = relevant
          .filter(e => renderNames.has(e.name))
          .sort((a, b) => a.ts - b.ts)[0];
        const firstMicrotask = microtasks.sort((a, b) => a.ts - b.ts)[0];
        const normalized = extractRelevantEvents(events, 'click').filter(
          e => e.pid === click.pid && e.ts >= cpu.tsStart && e.end <= cpu.tsEnd
        );
        const lastLogic = normalized
          .filter(e =>
            [
              'click',
              'functioncall',
              'layout',
              'fireAnimationFrame',
              'timerFire',
            ].includes(e.type)
          )
          .sort((a, b) => a.end - b.end)
          .at(-1);
        const gcIntervals = relevant
          .filter(e => /GC|Sweep|Marking/.test(e.name))
          .map(e => [e.ts, Math.min(e.ts + e.dur, cpu.tsEnd)]);
        records.push({
          order,
          name,
          index,
          file: relative,
          total: cpu.duration,
          script: sample.result[index].script,
          paint: sample.result[index].paint,
          clickDuration: click.dur / 1000,
          clickEndToFirstMicrotask: firstMicrotask
            ? Math.max(0, firstMicrotask.ts - (click.ts + click.dur)) / 1000
            : null,
          gcEventCoverage: unionDuration(gcIntervals) / 1000,
          coveredSelectedEvents: coverage,
          notCoveredBySelectedEvents: cpu.duration - coverage,
          largestGap,
          afterMicrotasksBeforeRender: firstRender
            ? Math.max(0, firstRender.ts - lastMicrotaskEnd) / 1000
            : null,
          lastLogic: lastLogic
            ? {
                type: lastLogic.type,
                relativeStart: (lastLogic.ts - cpu.tsStart) / 1000,
                relativeEnd: (lastLogic.end - cpu.tsStart) / 1000,
                details: JSON.parse(lastLogic.evt).args?.data,
              }
            : null,
          numberCommits: cpu.numberCommits,
          rafCorrection: cpu.raf_long_delay,
        });
      }
    }
} finally {
  console.log = log;
}
const groups = {};
for (const order of ['main', 'reverse', 'pooled'])
  for (const name of ['baseline', 'candidate', 'preact-classes']) {
    const rows = records.filter(
      r => (order === 'pooled' || r.order === order) && r.name === name
    );
    groups[order + '/' + name] = {
      count: rows.length,
      ...Object.fromEntries(
        [
          'total',
          'script',
          'paint',
          'coveredSelectedEvents',
          'notCoveredBySelectedEvents',
          'afterMicrotasksBeforeRender',
          'numberCommits',
          'gcEventCoverage',
          'clickDuration',
          'clickEndToFirstMicrotask',
        ].map(k => {
          const values = rows.map(r => r[k]).filter(Number.isFinite);
          return [k, values.length ? median(values) : null];
        })
      ),
    };
  }
fs.writeFileSync(
  path.join(out, 'trace-gaps.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      scope:
        'offline existing official selection traces; selected-event coverage is not proof of CPU idle or cause attribution',
      groups,
      records,
    },
    null,
    2
  ) + '\n'
);
console.log(groups);

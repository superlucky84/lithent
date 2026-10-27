// Enable the existing official memory definitions in one process only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export async function registerOfficialMemoryBenchmarks(bench) {
  const definitionsFile = path.resolve(
    bench,
    'webdriver-ts/dist/benchmarksPuppeteer.js'
  );
  const commonFile = path.resolve(
    bench,
    'webdriver-ts/dist/benchmarksCommon.js'
  );
  const definitions = await import(definitionsFile);
  const common = await import(commonFile);
  const additions = [
    [
      definitions.benchUpdate5Memory,
      common.Benchmark._23,
      'update every 10th row for 1k rows (5 cycles)',
      'Memory usage after clicking update every 10th row 5 times',
    ],
    [
      definitions.benchRun10KMemory,
      common.Benchmark._26,
      'run memory 10k',
      'Memory usage after adding 10,000 rows.',
    ],
  ];
  const added = [],
    metadataRestored = [];
  for (const [benchmark, id, label, description] of additions) {
    assert.ok(benchmark instanceof definitions.MemBenchmarkPuppeteer, id);
    // These labels/IDs come from the disabled metadata entries in the
    // upstream benchmarksCommon.ts. Workload methods stay untouched.
    if (!benchmark.benchmarkInfo) {
      benchmark.benchmarkInfo = {
        id,
        label,
        description,
        type: common.BenchmarkType.MEM,
      };
      metadataRestored.push(id);
    }
    assert.equal(benchmark.benchmarkInfo.id, id);
    if (!definitions.benchmarks.some(item => item.benchmarkInfo?.id === id)) {
      definitions.benchmarks.push(benchmark);
      added.push(id);
    }
  }
  const ids = [
    common.Benchmark._21,
    common.Benchmark._22,
    common.Benchmark._23,
    common.Benchmark._25,
    common.Benchmark._26,
  ];
  for (const id of ids)
    assert.equal(
      definitions.benchmarks.filter(
        item =>
          item instanceof definitions.MemBenchmarkPuppeteer &&
          item.benchmarkInfo?.id === id
      ).length,
      1,
      id
    );
  const hash = file =>
    crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  return {
    ids,
    added,
    metadataRestored,
    definitionsSHA256: hash(definitionsFile),
    commonSHA256: hash(commonFile),
    policy:
      'Process-local registration/metadata only; official scenario methods and memory measurement unchanged',
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(
    JSON.stringify(
      await registerOfficialMemoryBenchmarks(path.resolve(process.argv[2])),
      null,
      2
    )
  );

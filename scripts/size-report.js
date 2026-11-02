/**
 * RC-4 size gate.
 *
 * The base core keeps its 4,800B reference plus the measured DC-18 layout
 * allowance. DC-23 removes the DC-22 event allowance with the proxy runtime.
 * The concurrent budget is staged and rises per phase
 * (REQUIREMENTS §8) — raise `CONCURRENT_BUDGET` only when entering the phase
 * that is allowed to spend it.
 *
 *   node scripts/size-report.js            report + enforce
 *   node scripts/size-report.js --report   report only, never fails
 */
import { readFileSync } from 'fs';
import { brotliCompressSync, gzipSync } from 'zlib';

/** Budgets in brotli bytes. Baseline at f3921cc: base = 4,734. */
const BASE_REFERENCE = 4800;
const BASE_LAYOUT_ALLOWANCE = 24; // DC-18 compact13; no extra headroom.
// Keyed list and cache-hit render paths (POSITIONAL_KEYS_RESULTS.md): the
// measured growth, within the 150B the owner allowed over 4,817B.
const BASE_RENDER_ALLOWANCE = 101;
const BASE_BUDGET =
  BASE_REFERENCE + BASE_LAYOUT_ALLOWANCE + BASE_RENDER_ALLOWANCE;
const CONCURRENT_PHASE = 'T2 (fiber work loop)';
const CONCURRENT_BUDGET = 9000; // Phase 0 4800, T1 5400, T1.5 6200; T2 (D15)
/** lithent/element RC-3 (docs/element/REQUIREMENTS.md §4). */
const ELEMENT_BUDGET = 1000;

const targets = [
  {
    label: `lithent (base; ${BASE_REFERENCE}B reference + ${BASE_LAYOUT_ALLOWANCE}B DC-18 + ${BASE_RENDER_ALLOWANCE}B render paths)`,
    file: 'dist/lithent.umd.js',
    budget: BASE_BUDGET,
  },
  {
    label: `lithent-concurrent — ${CONCURRENT_PHASE}`,
    file: 'lithentConcurrent/dist/lithentConcurrent.umd.js',
    budget: CONCURRENT_BUDGET,
  },
  {
    label: 'lithent/element',
    file: 'element/dist/lithentElement.umd.js',
    budget: ELEMENT_BUDGET,
  },
];

const reportOnly = process.argv.includes('--report');
let failed = false;

for (const { label, file, budget } of targets) {
  let bytes;
  try {
    bytes = readFileSync(file);
  } catch {
    console.log(`${label}\n  ${file} — not built`);
    continue;
  }

  const br = brotliCompressSync(bytes).length;
  const over = br > budget;
  failed ||= over;

  console.log(
    `${label}\n  ${file}\n  raw ${bytes.length}  gzip ${gzipSync(bytes, { level: 9 }).length}  ` +
      `br ${br} / ${budget} ${over ? `OVER by ${br - budget}` : `(${budget - br} B headroom)`}`
  );
}

if (failed && !reportOnly) {
  console.error('\nRC-4: brotli budget exceeded.');
  process.exit(1);
}

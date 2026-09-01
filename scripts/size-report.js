/**
 * RC-4 size gate.
 *
 * The base core budget is a REGRESSION GUARD, not a target: `src/` is frozen
 * for the concurrent work (P1), so any movement there means something leaked
 * across the boundary. The concurrent budget is staged and rises per phase
 * (REQUIREMENTS §8) — raise `CONCURRENT_BUDGET` only when entering the phase
 * that is allowed to spend it.
 *
 *   node scripts/size-report.js            report + enforce
 *   node scripts/size-report.js --report   report only, never fails
 */
import { readFileSync } from 'fs';
import { brotliCompressSync, gzipSync } from 'zlib';

/** Budgets in brotli bytes. Baseline at f3921cc: base = 4,734. */
const BASE_BUDGET = 4800;
const CONCURRENT_PHASE = 'T1.5 (store tearing)';
const CONCURRENT_BUDGET = 6200; // Phase 0 was 4800, T1 5400; T2 -> 9000

const targets = [
  {
    label: 'lithent (base, frozen)',
    file: 'dist/lithent.umd.js',
    budget: BASE_BUDGET,
  },
  {
    label: `lithent-concurrent — ${CONCURRENT_PHASE}`,
    file: 'lithentConcurrent/dist/lithentConcurrent.umd.js',
    budget: CONCURRENT_BUDGET,
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

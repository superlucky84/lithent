import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { it } from 'vitest';
import {
  generateKeyedPortal,
  reduceKeyedPortal,
} from './helpers/keyedPortalCases';
import { ReplayFailure, replayKeyedPortal } from './helpers/keyedPortalReplay';

const readInt = (name: string, fallback: number, min: number, max: number) => {
  const input = process.env[name];
  if (input === undefined) return fallback;
  const value = Number(input);
  if (
    !/^\d+$/.test(input) ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`${name} must be an integer from ${min} through ${max}`);
  }
  return value;
};

const start = readInt('LITHENT_FUZZ_SEED', 1, 0, 0xffffffff);
const count =
  process.env.LITHENT_FUZZ_SEED === undefined
    ? readInt('LITHENT_FUZZ_SEEDS', 100, 1, 100_000)
    : 1;
const steps = readInt('LITHENT_FUZZ_STEPS', 24, 1, 1_000);

const runSeed = async (seed: number) => {
  const scenario = generateKeyedPortal(seed, steps);
  try {
    await replayKeyedPortal(scenario);
  } catch (error) {
    if (!(error instanceof ReplayFailure)) throw error;
    const output = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../artifacts/render-fuzz'
    );
    await mkdir(output, { recursive: true });
    const dir = await mkdtemp(join(output, `seed-${seed}-`));
    const report = {
      seed,
      steps,
      phase: error.phase,
      step: error.step,
      check: error.check,
      message: error.message,
      original: scenario,
    };
    const reportPath = join(dir, 'failure.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
    const reduced = await reduceKeyedPortal(scenario, error);
    const path = join(dir, 'keyed-portal.repro.ts');
    const testPath = `src/tests/keyed-portal-${seed}.test.ts`;
    const title = JSON.stringify(
      `keyed portal seed ${seed} (${error.phase}: ${error.check})`
    );
    await writeFile(
      path,
      [
        "import { it } from 'vitest';",
        "import { replayKeyedPortal } from '@/tests/helpers/keyedPortalReplay';",
        '',
        `it(${title}, async () => {`,
        `  await replayKeyedPortal(${JSON.stringify(reduced.scenario, null, 2).replace(/\n/g, '\n  ')});`,
        '});',
        '',
      ].join('\n')
    );
    await writeFile(
      reportPath,
      JSON.stringify(
        {
          ...report,
          attempts: reduced.attempts,
          exhausted: reduced.exhausted,
          reduced: reduced.scenario,
        },
        null,
        2
      ) + '\n'
    );
    throw new Error(
      `Seed ${seed} (${steps} ticks): ${error.message}\n` +
        `Reduced to ${reduced.scenario.ticks.length} ticks` +
        `${reduced.exhausted ? ' (reduction budget reached)' : ''}. ` +
        `Copy ${path} to ${testPath}, then run it with the same Vitest config`,
      { cause: error }
    );
  }
};

const chunk = 25;
for (let offset = 0; offset < count; offset += chunk) {
  const first = start + offset;
  const end = start + Math.min(count, offset + chunk);
  it(`keyed portal sequences, seeds ${first}-${end - 1}`, async () => {
    for (let seed = first; seed < end; seed++) await runSeed(seed);
  }, 60_000);
}

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import * as concurrentCore from '../index';

/**
 * C3 / RC-9 — the public surface is the contract.
 *
 * Satellite packages (helper, ssr, devHelper, ftags, tag, jsx-runtime) import
 * the core 41 times, every one of them through the bare `lithent` specifier.
 * That is what lets a consumer swap in this build with a single bundler alias,
 * so the two cores must expose the same names — no additions that satellites
 * would come to depend on, no removals that break them.
 *
 * The comparison target is the BUILT base bundle rather than `src/index.ts`,
 * for two reasons: it is the artifact satellites actually resolve, and both
 * `index.ts` files carry the same `declare global { namespace JSX }` block, so
 * importing them into one program is a duplicate-index-signature error.
 *
 * New concurrent-only exports (`startTransition` in T1, …) are a deliberate
 * widening: add them to `CONCURRENT_ONLY` in the same commit that exports them,
 * which keeps the diff visible in review instead of silent.
 */
const CONCURRENT_ONLY: string[] = ['startTransition', 'hasPending', 'whenIdle'];

const baseBundle = resolve(__dirname, '../../../dist/lithent.mjs');

describe('public export surface', () => {
  it('matches the base core, plus the declared concurrent-only additions', async () => {
    expect(
      existsSync(baseBundle),
      `base core bundle missing at ${baseBundle} — run \`pnpm build:core\` first`
    ).toBe(true);

    // Computed specifier: keeps the base core out of this file's type program
    // and out of Vite's static graph.
    const baseCore: Record<string, unknown> = await import(
      /* @vite-ignore */ baseBundle
    );

    const expected = [
      ...Object.keys(baseCore).filter(name => name !== 'default'),
      ...CONCURRENT_ONLY,
    ].sort();

    expect(Object.keys(concurrentCore).sort()).toEqual(expected);
  });

  it('exports every name as something defined', () => {
    for (const name of Object.keys(concurrentCore)) {
      expect(concurrentCore[name as keyof typeof concurrentCore]).toBeDefined();
    }
  });
});

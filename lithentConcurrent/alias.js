import { resolve } from 'path';

/**
 * Single source of truth for what the concurrent build branches.
 *
 * Key   = the `@/…` specifier as written in the source.
 * Value = the module name under `lithentConcurrent/src/` it resolves to.
 *
 * Everything NOT listed here is shared with the frozen base core in `../src`
 * (types, utils/*, hook/*) — 709 lines, see REQUIREMENTS §3.1.
 *
 * Two SHARED modules reference branched modules and are the reason this table
 * has to be applied everywhere (build, tests, and .d.ts emission):
 *   - `src/utils/predicator.ts` -> `@/wDom`         (Fragment identity check)
 *   - `src/hook/useRenew.ts`    -> `@/utils/redraw` (scheduler wiring)
 * Missing either redirect fails far away from its cause; the Phase 0-5 / 0-6
 * guards in `src/tests/` exist to catch exactly that.
 */
export const forkModules = {
  '@/index': 'index',
  '@/wDom': 'wDom',
  '@/diff': 'diff',
  '@/render': 'render',
  '@/scheduler': 'scheduler',
  '@/utils/redraw': 'scheduler',
};

/**
 * Vite/Vitest alias table (DESIGN §2.2).
 *
 * Order matters: the branched entries must precede the catch-all `@/` rule,
 * otherwise every branched module resolves back to the base core.
 *
 * @param pkgDir absolute path of the `lithentConcurrent/` package root
 */
export const concurrentAlias = pkgDir => {
  const shared = resolve(pkgDir, '..', 'src');

  const branched = Object.entries(forkModules).map(([specifier, name]) => ({
    find: new RegExp(`^${specifier.replace(/\//g, '\\/')}$`),
    replacement: resolve(pkgDir, 'src', `${name}.ts`),
  }));

  return [...branched, { find: /^@\//, replacement: `${shared}/` }];
};

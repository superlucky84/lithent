/**
 * Hand-written declarations for `alias.js`.
 *
 * `alias.js` stays plain JS because three very different consumers import it:
 * the Vite build config, the Vitest config, and `scripts/emitTypes.js` (run by
 * bare `node`, which cannot load TypeScript). Keeping one source of truth for
 * the branch table matters more than having it type-checked at its definition.
 */

/** Alias entry in Vite's array form. */
export interface AliasEntry {
  find: RegExp;
  replacement: string;
}

/** `@/…` specifier -> module name under `lithentConcurrent/src/`. */
export declare const forkModules: Record<string, string>;

/** @param pkgDir absolute path of the `lithentConcurrent/` package root */
export declare const concurrentAlias: (pkgDir: string) => AliasEntry[];

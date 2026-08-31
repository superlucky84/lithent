import { resolve } from 'path';

/**
 * Loads a module from the frozen base core, for the alias guards that assert
 * the concurrent build resolved to the FORK and not to it.
 *
 * The specifier is computed on purpose. A static `import '../../../src/wDom'`
 * pulls the base module into this package's type program, where the alias table
 * maps its own `@/…` imports to the fork — so from Phase 4 on, when the fork's
 * signatures diverge, base source starts failing type-check against fork
 * modules it never actually calls. The guards only ever wanted runtime module
 * identity, so they take it at runtime and leave the type program alone.
 */
const baseSrc = resolve(__dirname, '../../../src');

export const loadFromBaseCore = (modulePath: string): Promise<any> =>
  import(/* @vite-ignore */ `${baseSrc}/${modulePath}`);

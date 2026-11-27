import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * `lithent/live/runtime` (DESIGN §3.2, DC-6): the sandbox runtime as a
 * string, for `mountLive({ runtimeCode: sandboxRuntimeCode })` with no
 * network request. Run after vite.runtime.config.js has written
 * dist/sandboxRuntime.umd.js.
 */
const dist = resolve(import.meta.dirname, '../dist');
const code = readFileSync(resolve(dist, 'sandboxRuntime.umd.js'), 'utf8');
const literal = JSON.stringify(code);
const doc =
  '/** The sandbox runtime script (`sandboxRuntime.umd.js`) as a string. */\n';

writeFileSync(
  resolve(dist, 'runtime.mjs'),
  `${doc}export const sandboxRuntimeCode = ${literal};\n`
);
writeFileSync(
  resolve(dist, 'runtime.cjs'),
  `'use strict';\n${doc}exports.sandboxRuntimeCode = ${literal};\n`
);
const types = `${doc}export declare const sandboxRuntimeCode: string;\n`;
writeFileSync(resolve(dist, 'runtime.d.ts'), types);
writeFileSync(resolve(dist, 'runtime.d.cts'), types);

console.log(
  `lithent/live/runtime: ${code.length} characters -> dist/runtime.{mjs,cjs,d.ts,d.cts}`
);

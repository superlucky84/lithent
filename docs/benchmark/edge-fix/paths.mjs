import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const here = fileURLToPath(new URL('.', import.meta.url));
export const repo = resolve(here, '../../..');
// Bundles go outside the repository: one directory per core variant.
export const out = process.env.EDGE_FIX_OUT || '/tmp/lithent-edge-fix';

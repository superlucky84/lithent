import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
export const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
export const chrome =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
export const names = [
  'original-default',
  'original-isolated',
  'row-off',
  'row-helper',
  'row-memo',
];
export const hash = bytes =>
  crypto.createHash('sha256').update(bytes).digest('hex');
export const fileHash = file => hash(fs.readFileSync(file));
export const read = file => JSON.parse(fs.readFileSync(file));
export function guard(out) {
  const previous = read(
    path.join(root, 'docs/benchmark/parent-memo-isolation-results.json')
  );
  for (const [file, sha] of Object.entries(previous.provenance.baseline))
    assert.equal(fileHash(path.join(root, file)), sha, file);
  assert.equal(
    fileHash(path.join(root, 'package.json')),
    previous.defaultPackageSHA256
  );
  assert.equal(
    fileHash(path.join(bench, 'frameworks/keyed/lithent/src/main.tsx')),
    read(path.join(out, 'initial.json')).siblingSourceSHA256
  );
  assert.equal(
    fileHash(chrome),
    '6e156f2271cef44afce9db36a5b920e94518857b94a4160f082696f8c3bd1c9d'
  );
  assert.equal(
    fileHash(
      path.resolve(
        chrome,
        '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
      )
    ),
    'b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7'
  );
  assert.equal(
    fileHash(path.join(root, previous.evidence.file)),
    previous.evidence.sha256
  );
  return previous;
}

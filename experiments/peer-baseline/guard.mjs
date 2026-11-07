import assert from 'node:assert/strict';
import path from 'node:path';
import { fileHash, read, guard } from './config.mjs';
export function verify(out) {
  guard(out);
  const frozen = read(path.join(out, 'frozen-inputs.json'));
  for (const [file, item] of Object.entries(frozen.files))
    assert.equal(fileHash(file), item.sha256, file);
  return frozen;
}

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { verifyPlanConsumers } from '../verify-plan-consumers.mjs';

test(
  'a candidate consumer installs an unselected internal dependency from the registry, never its changed workspace archive',
  { timeout: 60_000 },
  async t => {
    const root = await mkdtemp(join(tmpdir(), 'release-consumer-registry-'));
    const alpha = 'lithent-release-fixture-alpha';
    const beta = 'lithent-release-fixture-beta';
    async function pack(name, label, dependencies = {}) {
      const directory = join(root, label);
      await mkdir(join(directory, 'package'), { recursive: true });
      const metadata = {
        fixtureNonce: randomUUID(), // A warm pnpm store must still fetch this registry archive.
        name,
        version: '1.0.0',
        type: 'module',
        dependencies,
        exports: {
          '.': {
            import: { types: './index.d.ts', default: './index.mjs' },
            require: { types: './index.d.cts', default: './index.cjs' },
          },
        },
      };
      await writeFile(
        join(directory, 'package/package.json'),
        JSON.stringify(metadata)
      );
      await writeFile(
        join(directory, 'package/index.mjs'),
        name === alpha
          ? `export {value} from '${beta}';`
          : `export const value = '${label}';`
      );
      await writeFile(
        join(directory, 'package/index.cjs'),
        name === alpha
          ? `module.exports = require('${beta}');`
          : `exports.value = '${label}';`
      );
      for (const extension of ['ts', 'cts'])
        await writeFile(
          join(directory, 'package/index.d.' + extension),
          'export declare const value: string;'
        );
      const archivePath = join(directory, 'archive.tgz');
      execFileSync('tar', ['-czf', archivePath, 'package'], { cwd: directory });
      return { name, version: '1.0.0', archivePath, packed: metadata };
    }
    const published = await pack(beta, 'registry-copy');
    const changed = await pack(beta, 'workspace-copy');
    const selected = await pack(alpha, 'alpha', { [beta]: '1.0.0' });
    const bytes = await readFile(published.archivePath);
    const requests = [];
    const server = createServer((request, response) => {
      requests.push(request.url);
      if (request.url === '/' + beta) {
        response.setHeader('content-type', 'application/json');
        response.end(
          JSON.stringify({
            name: beta,
            'dist-tags': { latest: '1.0.0' },
            versions: {
              '1.0.0': {
                ...published.packed,
                dist: {
                  tarball: `http://127.0.0.1:${server.address().port}/${beta}.tgz`,
                  integrity:
                    'sha512-' +
                    createHash('sha512').update(bytes).digest('base64'),
                },
              },
            },
          })
        );
      } else if (request.url === '/' + beta + '.tgz') response.end(bytes);
      else {
        response.statusCode = 404;
        response.end('{}');
      }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const results = await verifyPlanConsumers({
      repo: fileURLToPath(new URL('../../', import.meta.url)),
      plan: {
        order: [alpha],
        dependencies: [
          {
            consumer: alpha,
            name: beta,
            kind: 'dependencies',
            source: 'registry',
            version: '1.0.0',
          },
        ],
      },
      artifacts: new Map([
        [alpha, selected],
        [beta, changed],
      ]),
      registry: `http://127.0.0.1:${server.address().port}`,
    });
    const result = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import {value} from '${alpha}'; process.stdout.write(value);`,
      ],
      { cwd: results[0].consumer, encoding: 'utf8' }
    );
    assert.equal(result, 'registry-copy');
    assert(
      requests.includes('/' + beta),
      'Must query the registry package metadata'
    );
    assert(
      requests.includes('/' + beta + '.tgz'),
      'Must fetch the registry tarball'
    );
  }
);

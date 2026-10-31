import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

export const here = dirname(fileURLToPath(import.meta.url));
export const repo = resolve(here, '../..');
// Bundles go outside the repository: one directory per core variant.
export const out =
  process.env.POSITIONAL_KEYS_OUT || '/tmp/lithent-positional-keys';
export const require = createRequire(`${repo}/package.json`);

// Serves the pages here and the bundles under /out/.
export const serve = port =>
  createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.startsWith('/out/') ? out + path.slice(4) : here + path;
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': path.endsWith('.html')
          ? 'text/html'
          : 'text/javascript',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  }).listen(port);

export const median = xs => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

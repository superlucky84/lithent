import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { bench } from './config.mjs';
export async function serve(out) {
  const base = path.join(out, 'round-main');
  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'),
        dir = url.pathname.startsWith('/css/') ? bench : base,
        file = path.resolve(dir, '.' + url.pathname);
      assert.ok(file.startsWith(dir + '/'));
      res.setHeader(
        'content-type',
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.woff2': 'font/woff2',
          '.woff': 'font/woff',
        }[path.extname(file)] || 'application/octet-stream'
      );
      res.end(fs.readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

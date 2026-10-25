import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { read } from './init.mjs';

export async function serve(out) {
  const input = read(path.join(out, 'app-inputs.json'));
  const server = createServer((req, res) => {
    try {
      const parts = new URL(req.url, 'http://localhost').pathname
        .split('/')
        .filter(Boolean);
      const name = parts.shift();
      const directory =
        name === 'css'
          ? path.join(input.bench, 'css')
          : input.apps[name]
            ? path.join(out, 'round-main', name)
            : null;
      if (!directory) throw Error('Unknown route');
      const file = path.resolve(directory, parts.join('/') || 'index.html');
      if (!file.startsWith(directory + path.sep)) throw Error('Outside app');
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

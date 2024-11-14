// server.js
import path, { resolve } from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function createServer() {
  const entries = getEntries();
  const app = express();

  // Vite 서버 생성 및 미들웨어 적용
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    root: process.cwd(),
    plugins: [],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });

  app.use('/dist', express.static(path.resolve(__dirname, 'dist')));

  Object.entries(entries).forEach(([key, value]) => {
    console.log(key, value);
    const path = key.split('.')[0];
    console.log('PATH', path);

    app.get(`/${path === 'index' ? '' : path}`, async (req, res) => {
      try {
        // React 컴포넌트를 가져와서 렌더링
        // const { default: Root } = await vite.ssrLoadModule('@/index.tsx');
        const { default: Page } = await vite.ssrLoadModule(
          `@/pages/${path}.tsx`
        );
        const appHtmlOrig = `<!doctype html>${renderToString(h(Page))}`;

        const transformedHtml = await vite.transformIndexHtml(
          req.originalUrl,
          appHtmlOrig
        );
        const finalHtml = transformedHtml.replace(
          '</body>',
          `<script type="module" src="/src/pages/${path}.tsx"></script></body>`
        );

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  });

  app.use(vite.middlewares);

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

createServer();

function getScriptPath(routeString) {
  const directoryPath = path.resolve(__dirname, 'dist/assets');
  const files = fs.readdirSync(directoryPath);
  const targetFile = files.find(file => file.startsWith(`${routeString}.tsx`));
  return targetFile ? `/dist/assets/${targetFile}` : null;
}

function getEntries() {
  const entriesDir = resolve(__dirname, 'src/pages');
  const files = fs.readdirSync(entriesDir);

  return files.reduce((entries, file) => {
    const name = file.replace(/\.js$/, ''); // 확장자 제거
    entries[name] = resolve(entriesDir, file);
    return entries;
  }, {});
}

// server.js
import path, { resolve } from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function createServer() {
  const entries = getEntries();
  const app = express();

  // Vite 서버 생성 및 미들웨어 적용
  const isDev = process.env.NODE_ENV !== 'production';
  console.log('ISDEV', isDev, process.env.NODE_ENV);
  let vite;
  if (isDev) {
    vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
      root: process.cwd(),
      plugins: [],
      resolve: {
        alias: {
          '@': '/src',
        },
      },
    });
  }

  app.use('/dist', express.static(path.resolve(__dirname, 'dist')));

  Object.entries(entries).forEach(([key, value]) => {
    const routePath = key.split('.')[0];

    app.get(`/${routePath === 'index' ? '' : routePath}`, async (req, res) => {
      try {
        let finalHtml = '';

        if (isDev) {
          const { default: Page } = await vite.ssrLoadModule(
            `@/pages/${routePath}.tsx`
          );
          const appHtmlOrig = `<!doctype html>${Page}`;

          const transformedHtml = await vite.transformIndexHtml(
            req.originalUrl,
            appHtmlOrig
          );
          finalHtml = transformedHtml.replace(
            '</body>',
            `<script type="module" src="/src/pages/${routePath}.tsx"></script></body>`
          );
        } else {
          const resourcePath = getScriptPath(routePath);
          const modulePath = path.resolve(__dirname, resourcePath);
          const module = await import(modulePath);
          const Page = module.default;
          const appHtmlOrig = `<!doctype html>${Page}`;

          const scriptPath = resourcePath; // 경로에 맞게 수정 필요
          finalHtml = appHtmlOrig.replace(
            '</body>',
            `<script type="module" src="${scriptPath}"></script></body>`
          );
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        isDev && vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  });

  isDev && app.use(vite.middlewares);

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

createServer();

function getScriptPath(routeString) {
  const directoryPath = path.resolve(__dirname, 'dist');
  const files = fs.readdirSync(directoryPath);
  const targetFile = files.find(
    file => file.startsWith(`${routeString}`) && file.endsWith('.js')
  );
  return targetFile ? `dist/${targetFile}` : null;
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

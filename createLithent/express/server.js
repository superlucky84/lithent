// server.js
import path, { resolve } from 'path';
import express from 'express';
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import sortFiles from './sortFiles.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const isTailwindConfigPresent = fs.existsSync(
  path.join(__dirname, 'tailwind.config.ts')
);

const isDev = process.env.NODE_ENV !== 'production';
let vite;
if (isDev) {
  vite = await createViteServer({
    server: { middlewareMode: 'ssr', hmr: true },
    root: process.cwd(),
    plugins: [],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
}

async function createServer() {
  const entries = getEntries();
  const app = express();

  if (!isDev) {
    app.use('/dist', express.static(path.resolve(__dirname, 'dist')));
  }

  sortFiles(Object.keys(entries)).forEach(key => {
    const pathSplit = key.split('.');
    const newPathSplit = pathSplit.slice(0, pathSplit.length - 1);

    const expressPath = newPathSplit
      .map(item => (item === 'index' ? '' : item))
      .filter(item => item)
      .join('/');

    app.get(`/${expressPath.replace(/_/g, ':')}`, async (req, res, next) => {
      if (
        req.originalUrl === '/@vite-plugin-checker-runtime' ||
        Object.values(req.params).includes('@vite-plugin-checker-runtime') ||
        Object.values(req.params).includes('favicon.ico')
      ) {
        next();
        return;
      }

      const props = { params: req.params, query: req.query };

      try {
        let finalHtml = '';

        if (isDev) {
          const { default: Page, makeInitProp } = await vite.ssrLoadModule(
            `@/pages/${key}`
          );

          let initProp = null;
          if (makeInitProp) {
            initProp = await makeInitProp();
          }

          const PageString = renderToString(
            h(Page, Object.assign(props, { initProp }))
          );
          const appHtmlOrig = `<!doctype html>${PageString}`;

          const transformedHtml = await vite.transformIndexHtml(
            req.originalUrl,
            appHtmlOrig
          );

          finalHtml = transformedHtml.replace(
            '</body>',
            `<script type="module">
              import Page from '/src/pages/${key}';
              import { h, hydration } from '/src/utils';
              import { makeRoute } from '/src/route';

              const routeRef = makeRoute();
              routeRef.page = location.pathname;
              routeRef.destroy = hydration(h(Page, ${JSON.stringify(
                Object.assign(props, { initProp })
              )}), document.documentElement);
              </script></body>`
          );
        } else {
          const utilResourcePath = getScriptPath('utils.ts');
          const routeResourcePath = getScriptPath('route.ts');
          const resourcePath = getScriptPath(key);
          const modulePath = path.resolve(__dirname, resourcePath);

          const module = await import(modulePath);
          const Page = module.default;
          const makeInitProp = module.makeInitProp;

          let initProp = null;
          if (makeInitProp) {
            initProp = await makeInitProp();
          }

          const PageString = renderToString(
            h(Page, Object.assign(props, { initProp }))
          );
          const appHtmlOrig = `<!doctype html>${PageString}`;
          const scriptPath = resourcePath; // 경로에 맞게 수정 필요

          finalHtml = appHtmlOrig.replace(
            '</body>',
            `<script type="module">
              import Page from '/${scriptPath}';

              import { h, hydration } from '/${utilResourcePath}';
              import { makeRoute } from '/${routeResourcePath}';

              const routeRef = makeRoute();
              routeRef.page = location.pathname;
              routeRef.destroy = hydration(h(Page, ${JSON.stringify(
                Object.assign(props, { initProp })
              )}), document.documentElement);
              </script></body>`
          );

          if (isTailwindConfigPresent) {
            finalHtml = finalHtml.replace(
              '</head>',
              '<link rel="stylesheet" href="/dist/style.css" /></head>'
            );
          }
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        isDev && vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  });

  // 404 핸들러
  if (isDev) {
    app.use(vite.middlewares);
  } else {
    app.use((_req, res, next) => {
      res.status(404).set({ 'Content-Type': 'text/html' }).end('404 Not Found');
      next();
    });
  }

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

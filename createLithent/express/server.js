// server.js
import path, { resolve } from 'path';
import express from 'express';
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import sortFiles from './sortFiles.js';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const isDev = process.env.NODE_ENV !== 'production';
let vite;
if (isDev) {
  vite = await createViteServer({
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer], // 미리 import한 플러그인 사용
      },
    },
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

  app.use('/assets', express.static(path.resolve(__dirname, 'assets')));

  const sortedRouteList = sortFiles(Object.keys(entries));

  sortedRouteList.forEach(key => {
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
        Object.values(req.params).includes('favicon.ico') ||
        Object.values(req.params).includes('dist') ||
        Object.values(req.params).includes('next') ||
        Object.values(req.params).includes('src') ||
        Object.values(req.params).includes('_next') ||
        Object.values(req.params).includes('@vite') ||
        Object.values(req.params).includes('assets')
      ) {
        next();
        return;
      }
      const props = { params: req.params, query: req.query };

      try {
        let finalHtml = '';

        if (isDev) {
          const { default: Oops } = await vite.ssrLoadModule(
            `@/components/Oops`
          );
          const { default: Layout } = await vite.ssrLoadModule(`@/layout`);
          const { default: Page, preload } = await vite.ssrLoadModule(
            `@/pages/${key}`
          );
          let initProp = null;
          if (preload) {
            initProp = await preload(props);
          }

          globalThis.pagedata = initProp;

          const PageString = renderToString(
            h(Layout, Object.assign({ page: Page }, props))
          );
          const appHtmlOrig = `<!doctype html>${PageString}`;

          const transformedHtml = await vite.transformIndexHtml(
            req.originalUrl,
            appHtmlOrig
          );

          finalHtml = transformedHtml.replace(
            '</body>',
            `<script type="module">
              import load from '/src/base/load';
              load('${key}', ${JSON.stringify(
              Object.assign({}, props)
            )}, ${JSON.stringify(initProp)});
             </script></body>`
          );
        } else {
          const loadResourcePath = getScriptPath('base/load.ts');
          const cssResourcePath = getScriptPath('style');

          const oopsResourcePath = getScriptPath(`components/Oops.tsx`);
          const oopsPath = path.resolve(__dirname, oopsResourcePath);

          const resourcePath = getScriptPath(`pages/${key}`);
          const modulePath = path.resolve(__dirname, resourcePath);

          const layoutResourcePath = getScriptPath('layout.ts');
          const layoutPath = path.resolve(__dirname, layoutResourcePath);

          const module = await import(modulePath);
          const oops = await import(oopsPath);
          const Oops = oops.default;

          const Page = module.default;
          const preload = module.preload;

          const layoutModule = await import(layoutPath);
          const Layout = layoutModule.default;

          let initProp = null;
          if (preload) {
            initProp = await preload(props);
          }

          globalThis.pagedata = initProp;

          const PageString = renderToString(
            h(Layout, Object.assign({ page: Page }, props))
          );

          const appHtmlOrig = `<!doctype html>${PageString}`;
          finalHtml = appHtmlOrig.replace(
            '</head>',
            `<link rel="stylesheet" href="/${cssResourcePath}"></head>`
          );
          finalHtml = finalHtml.replace(
            '</body>',
            `<script type="module">
              import load from '/${loadResourcePath}';

              load('${key}', ${JSON.stringify(
              Object.assign({}, props)
            )}, ${JSON.stringify(initProp)});
              </script></body>`
          );
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
        console.log('---------------------------------------------------');
      } catch (e) {
        isDev && vite.ssrFixStacktrace(e);
        // res.status(500).end(e.message);
        console.error(e.stack);

        const { default: Oops } = await vite.ssrLoadModule(`@/components/Oops`);
        const { default: Layout } = await vite.ssrLoadModule(`@/layout`);

        const OopsPageString = renderToString(
          h(Layout, Object.assign({ page: Oops }, props))
        );

        const transformedHtml = await vite.transformIndexHtml(
          req.originalUrl,
          `<!doctype html>${OopsPageString}`
        );

        const finalHtml = transformedHtml.replace(
          '</body>',
          `<script type="module">
            import load from '/src/base/load';
            load();
           </script></body>`
        );

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      }
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
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

  const findFile = (dir, target) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        const found = findFile(fullPath, target);
        if (found) {
          return found;
        }
      } else {
        const relativePath = path.relative(directoryPath, fullPath);

        if (relativePath.endsWith('.d.ts')) {
          continue;
        }

        if (relativePath.includes(target)) {
          console.log(`Matched: ${relativePath}`); // 일치한 파일 경로 로그
          return relativePath;
        }
      }
    }
    return null;
  };

  const result = findFile(directoryPath, routeString);
  return result ? `dist/${result}` : null;
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

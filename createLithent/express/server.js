// server.js
import path, { resolve } from 'path';
import express from 'express';
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import { createServer as createViteServer } from 'vite';
import sortFiles from './sortFiles.js';
import createMakePage from './serverHelper/createMakePage.js';
import { getEntries } from './serverHelper/helper.js';
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
        const pageIns = createMakePage({ key, req, props, isDev, vite });
        const finalHtml = await pageIns.run();

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

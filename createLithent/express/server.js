// server.js
import path, { resolve } from 'path';
import express from 'express';
import sortFiles from './sortFiles.js';
import createMakePage from './serverHelper/createMakePage.js';
import { getEntries, excludeRoutePath } from './serverHelper/helper.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const isDev = process.env.NODE_ENV !== 'production';
let vite;
if (isDev) {
  const { createServer: createViteServer } = await import('vite');

  vite = await createViteServer({
    root: process.cwd(),
    server: { middlewareMode: 'ssr', hmr: true },
  });
}

async function createServer() {
  const entries = getEntries();
  const app = express();
  app.set('trust proxy', true);

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
      if (excludeRoutePath(req.params)) {
        next();
        return;
      }

      const protocol = req.protocol;
      const host = req.get('host');
      const origin = `${protocol}://${host}`;

      const props = { id: key, params: req.params, query: req.query, origin };
      let finalHtml = '';

      try {
        const pageIns = createMakePage({ key, req, props, isDev, vite });
        finalHtml = await pageIns.run();
      } catch (e) {
        isDev && vite.ssrFixStacktrace(e);
        console.error(e.stack);

        const pageIns = createMakePage({
          key: 'oops',
          req,
          props,
          isDev,
          vite,
        });
        finalHtml = await pageIns.runOops();
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    });
  });

  if (isDev) {
    app.use(vite.middlewares);
  } else {
    // 404 Handler
    app.use(async (req, res, next) => {
      const pageIns = createMakePage({
        key: 'notfound',
        req,
        props: {},
        isDev: false,
      });
      const finalHtml = await pageIns.run404();

      res.status(404).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      next();
    });
  }

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

createServer();

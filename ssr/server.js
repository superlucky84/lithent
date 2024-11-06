// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { renderToString } from './src/index';
// import path from 'path';

async function createServer() {
  const app = express();

  // Vite 서버 생성 및 미들웨어 적용
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
  });
  app.use(vite.middlewares);

  // 기본 라우트 설정
  app.get('/', async (_req, res) => {
    try {
      // React 컴포넌트를 가져와서 렌더링
      const { default: Root } = await vite.ssrLoadModule(
        './src/tests/tostring.jsx'
      );
      const appHtml = renderToString(Root());

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Express with Vite and JSX</title>
          </head>
          <body>
            <div id="app">${appHtml}</div>
            <script type="module" src="/src/main.jsx"></script>
          </body>
        </html>
      `;

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

createServer();

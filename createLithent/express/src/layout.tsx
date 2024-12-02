import type { TagFunction } from 'lithent';
import { h, mount } from 'lithent';
import { loadData } from '@/helper/data';
import '@/main.css';

const Layout = mount<{
  page: TagFunction;
  params: Record<string, string>;
  query: Record<string, string>;
}>(_r => {
  const initProp = loadData<{ layout: { title: string } }>();

  return ({ page: Page, params, query }) => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{initProp.layout.title}</title>
      </head>
      <body class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="flex">
          <Page params={params} query={query} />
        </div>
      </body>
    </html>
  );
});

export default Layout;

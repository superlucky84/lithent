import type { TagFunction } from 'lithent';
import { h, mount } from 'lithent';

const Layout = mount<{
  page: TagFunction;
  params: Record<string, string>;
  query: Record<string, string>;
  initProp: any;
}>(_r => {
  return ({ page: Page, params, query, initProp }) => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Lithent App</title>
        <link rel="preload" href="/dist/style.css" as="style" />
        <link
          rel="stylesheet"
          href={`/dist/style.css?${new Date().getTime()}`}
        />
      </head>
      <body class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-3/4 h-[80vh] flex">
          <Page params={params} query={query} initProp={initProp} />
        </div>
      </body>
    </html>
  );
});

export default Layout;

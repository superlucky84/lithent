import { h, mount } from '@/engine';
import { routeRef } from '@/route';

const Layout = mount((_r, _props, children) => {
  console.log('HAHA', routeRef.component);
  return () => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Lithent App</title>
        <link rel="preload" href="/dist/style.css" as="style" />
        <link rel="stylesheet" href={`/dist/style.css`} />
      </head>
      <body class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-3/4 h-[80vh] flex">{routeRef.component || children}</div>
      </body>
    </html>
  );
});

export default Layout;

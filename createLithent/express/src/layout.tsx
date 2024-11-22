import { h, mount } from '@/engine';

const Layout = mount((_r, _props, children) => {
  return () => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Lithent App</title>
        <link
          rel="stylesheet"
          href={`/dist/style.css?${new Date().getTime()}`}
        />
      </head>
      <body class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-3/4 h-[80vh] flex">{children}</div>
      </body>
    </html>
  );
});

export default Layout;

import { h, mount } from '@/engine';

const Layout = mount((_r, _props, children) => {
  return () => (
    <html lang="en" class="light" style="color-scheme: light;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Lithent App</title>
        <link rel="stylesheet" href="/dist/style.css" />
      </head>
      <body class="antialiased text-gray-800 dark:bg-black dark:text-gray-400">
        {children}
      </body>
    </html>
  );
});

export default Layout;

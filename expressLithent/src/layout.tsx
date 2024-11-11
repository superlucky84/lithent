import { h, mount } from 'lithent';
import { Script } from 'lithent/ssr';

// import type { WDom } from 'lithent';
// import Main from '@/pages/main';

const Layout = mount((_r, _props, children) => {
  return () => (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Express with Vite and JSX</title>
      </head>
      <body>
        {children}
        <Script />
      </body>
    </html>
  );
});

export default Layout;

import { h, mount } from 'lithent';

const Layout = mount((_r, _props, children) => {
  return () => (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Express with Vite and JSX</title>
      </head>
      <body>{children}</body>
    </html>
  );
});

export default Layout;

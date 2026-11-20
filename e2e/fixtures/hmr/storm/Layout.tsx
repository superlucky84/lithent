import { mount } from 'lithent';

export const Layout = mount<{ core?: string }>((_renew, props) => () => (
  <html lang="en" data-core={props.core}>
    <head>
      <title>HMR document root</title>
    </head>
    <body>
      <header class="storm-doc-header">header</header>
      <main>
        <h1 class="storm-doc-title">layout original</h1>
      </main>
    </body>
  </html>
));

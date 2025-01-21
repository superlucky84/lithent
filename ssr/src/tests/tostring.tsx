import { mount, Fragment } from 'lithent';

const Meta = mount(_r => {
  return () => (
    <Fragment>
      <meta name="twitter:card1" content="summary_large_image" />{' '}
      <meta name="twitter:site2" content="@superlucky84" />
    </Fragment>
  );
});

const Children = mount(r => {
  let v = 1;
  let k = 's';

  const increase = () => {
    v += 1;
    k += 's';
    r();
  };

  return () => (
    <div style={{ border: `${v}px solid red` }}>
      asve
      <br />
      <section innerHTML="<article>ss</article>" />
      <button disabled={false} onClick={increase}>
        {v} -== a1 - {v}
        {k}
      </button>
      {v}
      <span id="aa11" data-max-string="va">
        {'  '}123124
      </span>
    </div>
  );
});

const Root = mount(_r => {
  return () => (
    <html lang="en">
      <head>
        <title>Express with Vite and JSX</title>
        <Meta />
        <script src="/dist/lithentSsr.umd.js"></script>
      </head>
      <body>
        <div id="app">
          <Children />
        </div>
      </body>
    </html>
  );
});

export default Root;

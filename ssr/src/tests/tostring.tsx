import { h, mount, Fragment } from 'lithent';
// import { renderToString } from '@/index';

const Root = mount(_r => {
  return () => (
    <Fragment>
      111 222 45
      {/* <!-- aa --> */}
      <div>aaa</div>
      <div style={{ border: '1px solid red' }}>
        asve
        <br />
        <section innerHTML="<article>ss</article>" />
        <button disabled={true}>a</button>
        <span id="aa11" data-max-string="va">
          {'  '}123124
        </span>
      </div>
    </Fragment>
  );
});

export default Root;

// const result = renderToString(<Root />);
// console.log(result);

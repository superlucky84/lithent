import { h, mount, Fragment } from 'lithent';
// import { renderToString } from '@/index';

const Root = mount(r => {
  let v = 1;

  const increase = () => {
    v += 1;
    console.log('111', v);
    r();
  };

  return () => (
    <Fragment>
      {' '}
      111{/* <!-- aa --> */}222{'    '}45
      <div>aaa</div>
      <div style={{ border: '1px solid red' }}>
        asve
        <br />
        <section innerHTML="<article>ss</article>" />
        <button disabled={false} onClick={increase}>
          a1 - {v}
        </button>
        {v}
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

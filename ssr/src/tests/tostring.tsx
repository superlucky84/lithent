import { h, mount, Fragment } from 'lithent';

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
    <Fragment>
      {' '}
      111{/* <!-- aa --> */}222{'    '}45
      <Children />
      <div>aaa</div>
    </Fragment>
  );
});

export default Root;

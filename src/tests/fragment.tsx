import { mount, render, Fragment, h } from '@/index';

const Loop = mount(function (renew) {
  let pType: boolean = true;
  const handle = () => {
    pType = false;
    renew();
  };

  return () => (
    <div>
      <button onClick={handle}>handle</button>
      <div>start</div>
      {pType ? (
        <Fragment>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </Fragment>
      ) : (
        <Fragment>
          <div>two</div>
          <div>three</div>
          <div>four</div>
        </Fragment>
      )}
      <div>end</div>
    </div>
  );
});

const Root = <Loop />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));

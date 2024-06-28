// example.jsx
import { h, Fragment, render, mount, mountCallback } from '@/index';

const Depth4 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth4');
    return () => console.log('UNMOUNT - Depth4');
  });

  return () => (
    <Fragment>
      <div>depth4</div>
    </Fragment>
  );
});

const Depth3 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth3');
    return () => console.log('UNMOUNT - Depth3');
  });

  return () => (
    <Fragment>
      <div>depth3</div>
      <Depth4 />
    </Fragment>
  );
});

const Depth2 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth2');
    return () => console.log('UNMOUNT - Depth2');
  });

  return () => (
    <Fragment>
      <div>depth2</div>
      <Depth3 />
    </Fragment>
  );
});

const Depth1 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth1');
    return () => console.log('UNMOUNT - Depth1');
  });

  return () => (
    <Fragment>
      <div>depth1</div>
      <Depth2 />
    </Fragment>
  );
});

const CallbackRoot = mount(renew => {
  let isShow = true;

  const toggle = () => {
    isShow = !isShow;
    renew();
  };

  return () => (
    <Fragment>
      <button onClick={toggle}>TOGGLE</button>
      {isShow ? <Depth1 /> : null}
    </Fragment>
  );
});

const Root = <CallbackRoot />;

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));

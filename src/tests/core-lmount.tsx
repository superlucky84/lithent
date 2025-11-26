// Test lmount and useRenew functionality
import { h, Fragment, render, mount, lmount, useRenew } from '@/index';

// Test 1: Basic lmount without renew
const BasicLmount = lmount(() => {
  return () => <div id="basic-lmount">Basic lmount component</div>;
});

// Test 2: lmount with useRenew hook
const LmountWithRenew = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count++;
    renew();
  };

  return () => (
    <div id="lmount-with-renew">
      <span id="count">{count}</span>
      <button id="increment" onClick={increment}>
        Increment
      </button>
    </div>
  );
});

// Test 3: Mixed mount and lmount
const MountParent = mount(renew => {
  let parentCount = 0;

  const incrementParent = () => {
    parentCount++;
    renew();
  };

  return () => (
    <div id="mount-parent">
      <span id="parent-count">{parentCount}</span>
      <button id="increment-parent" onClick={incrementParent}>
        Increment Parent
      </button>
      <LmountWithRenew />
    </div>
  );
});

// Test 4: lmount child under mount parent
const LmountChild = lmount(() => {
  let childCount = 0;
  const renew = useRenew();

  const incrementChild = () => {
    childCount++;
    renew();
  };

  return () => (
    <div id="lmount-child">
      <span id="child-count">{childCount}</span>
      <button id="increment-child" onClick={incrementChild}>
        Increment Child
      </button>
    </div>
  );
});

const MixedParent = mount(renew => {
  let toggleState = true;

  const toggle = () => {
    toggleState = !toggleState;
    renew();
  };

  return () => (
    <div id="mixed-parent">
      <button id="toggle" onClick={toggle}>
        Toggle
      </button>
      {toggleState ? <LmountChild /> : <div id="toggled-off">Off</div>}
    </div>
  );
});

// Root component
const Root = (
  <Fragment>
    <h2>lmount Tests</h2>
    <BasicLmount />
    <LmountWithRenew />
    <MountParent />
    <MixedParent />
  </Fragment>
);

//@ts-ignore
window.root = Root;

render(Root, document.getElementById('root'));

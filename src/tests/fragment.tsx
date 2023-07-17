import { mount, render, Fragment, h, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);
const testChangeRef3 = ref<null | (() => void)>(null);

const Loop = mount(function (renew) {
  let pType: boolean = true;
  const handle = () => {
    pType = false;
    renew();
  };

  testChangeRef.value = () => {
    handle();
  };

  return () => (
    <div>
      <button onClick={handle}>handle</button>
      <div>start</div>
      {pType ? (
        <Fragment>
          <div>1</div> <div>2</div> <div>3</div> <div>4</div>
        </Fragment>
      ) : (
        <Fragment>
          <div>two</div> <div>three</div> <div>four</div>
        </Fragment>
      )}
      <div>end</div>
    </div>
  );
});

const Loop2 = mount(function (renew) {
  let pType: boolean = true;
  const handle = () => {
    pType = false;
    renew();
  };

  testChangeRef2.value = () => {
    handle();
  };

  return () => (
    <div>
      <button onClick={handle}>handle</button>
      <div>start</div>
      {pType ? (
        <div>33</div>
      ) : (
        <Fragment>
          <div>two</div> <div>three</div> <div>four</div>
        </Fragment>
      )}
      <div>end</div>
    </div>
  );
});

const Loop3 = mount(function (renew) {
  let pType: boolean = true;
  const handle = () => {
    pType = false;
    renew();
  };

  testChangeRef3.value = () => {
    handle();
  };

  return () => (
    <div>
      <button onClick={handle}>handle</button>
      <div>start</div>
      {pType ? (
        '777abcss'
      ) : (
        <Fragment>
          <div>two</div> <div>three</div> <div>four</div>
        </Fragment>
      )}
      <div>end</div>
    </div>
  );
});

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('typeReplace (fragment to fragment).', () => {
    const testWrap = document.createElement('div');
    render(<Loop />, testWrap);

    expect(testWrap.outerHTML).toBe(
      '<div><div><button>handle</button><div>start</div><div>1</div> <div>2</div> <div>3</div> <div>4</div><div>end</div></div></div>'
    );

    if (testChangeRef.value) {
      testChangeRef.value();
    }

    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div><button>handle</button><div>start</div>   <div>two</div> <div>three</div> <div>four</div><div>end</div></div></div>'
      );
    });
  });

  it('typeReplace (element to fragment).', () => {
    const testWrap = document.createElement('div');
    render(<Loop2 />, testWrap);

    expect(testWrap.outerHTML).toBe(
      '<div><div><button>handle</button><div>start</div><div>33</div><div>end</div></div></div>'
    );

    if (testChangeRef2.value) {
      testChangeRef2.value();
    }

    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div><button>handle</button><div>start</div><div>two</div> <div>three</div> <div>four</div><div>end</div></div></div>'
      );
    });
  });

  it('typeReplace (text to fragment).', () => {
    const testWrap = document.createElement('div');
    render(<Loop3 />, testWrap);

    expect(testWrap.outerHTML).toBe(
      '<div><div><button>handle</button><div>start</div>777abcss<div>end</div></div></div>'
    );

    if (testChangeRef3.value) {
      testChangeRef3.value();
    }

    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div><button>handle</button><div>start</div><div>two</div> <div>three</div> <div>four</div><div>end</div></div></div>'
      );
    });
  });
} else {
  render(<Loop />, document.getElementById('root'));
}

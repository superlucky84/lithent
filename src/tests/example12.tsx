import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeFiveRef = ref<null | (() => void)>(null);
const testChangeSixRef = ref<null | (() => void)>(null);

const Root = mount(function (r) {
  let showFive = true;
  let showSix = true;

  const toggleFive = () => {
    showFive = !showFive;
    r();
  };
  const toggleSix = () => {
    showSix = !showSix;
    r();
  };

  testChangeFiveRef.value = () => {
    showFive = !showFive;
    r();
  };

  testChangeSixRef.value = () => {
    showSix = !showSix;
    r();
  };

  return () => (
    <Fragment>
      <li>
        4 <button onClick={toggleFive}>toggleFive</button>
        <button onClick={toggleSix}>toggleSix</button>
      </li>
      {showFive ? <li>5</li> : null}
      {showSix ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
});

document.body.innerHTML = `<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <li id="next">8</li> <li>9</li> </ul>`;

const testWrap = document.getElementById('root') as HTMLElement;

render(<Root />, testWrap, document.getElementById('next'));

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("Test that 'Lithent' can correctly handle virtual DOM elements when real and virtual DOM elements are mixed under one parent.", () => {
    expect(testWrap.outerHTML).toBe(
      '<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <li>4 <button>toggleFive</button><button>toggleSix</button></li><li>5</li><li>6</li><li>7</li><li id="next">8</li> <li>9</li> </ul>'
    );
  });

  it('The toggle button should remove only the 5.', () => {
    if (testChangeFiveRef.value && testChangeSixRef.value) {
      testChangeFiveRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <li>4 <button>toggleFive</button><button>toggleSix</button></li><li>6</li><li>7</li><li id="next">8</li> <li>9</li> </ul>'
      );
    });
  });

  it('The toggle button should remove only the 6.', () => {
    if (testChangeFiveRef.value && testChangeSixRef.value) {
      testChangeSixRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<ul id="root"> <li>1</li> <li>2</li> <li>3</li> <li>4 <button>toggleFive</button><button>toggleSix</button></li><li>7</li><li id="next">8</li> <li>9</li> </ul>'
      );
    });
  });
}

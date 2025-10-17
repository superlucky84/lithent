import { h, render, mount } from 'lithent';
import { createContext } from '@/index';

const testContext = createContext();
const { Provider, contextState } = testContext;

const Component = mount(() => {
  const contextRef = contextState(3);

  return () => (
    <div>
      <Provider>
        <button type="text">increase A {contextRef.value}</button>
      </Provider>
    </div>
  );
});

const testWrap = document.getElementById('root');

render(<Component />, testWrap);

/*


if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Is renew working properly?', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button type="text">increase</button><span>computed: 25</span></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button type="text">increase</button><span>computed: 100</span></div>'
      );
    });
  });
}
  */

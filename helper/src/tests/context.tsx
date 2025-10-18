import { h, render, mount } from 'lithent';
import { createContext } from '@/index';

const testContext = createContext<number>();
const { Provider, contextState, useContext } = testContext;

const Component = mount(() => {
  const contextRef = contextState(3);
  console.log('Component');

  return () => (
    <div>
      <Provider state={contextRef}>
        <Children2 jj={9} />
      </Provider>
      <Provider state={contextRef}>
        <Children jj={9} />
      </Provider>
      <Provider state={contextRef}>
        <Children jj={9} />
      </Provider>
    </div>
  );
});
/*
const UserProvider = mount((_renew, _props, children: WDom[]) => {
  console.log('UserProvider');
  const contextRef = contextState(3);
  return () => <Provider state={contextRef}>{children}</Provider>;
});

const Component = mount(() => {
  return () => (
    <UserProvider>
      <Children jj={9} />
      <Children2 jj={9} />
    </UserProvider>
  );
});
*/

const Children = mount<{ jj: number }>(renew => {
  console.log('Children');
  const contextRef = useContext(testContext, renew);
  return () => <div>c1 value from context = {contextRef.value}</div>;
});
const Children2 = mount<{ jj: number }>(renew => {
  console.log('Children2');
  const contextRef = useContext(testContext, renew);
  return () => <div>c2 value from context = {contextRef.value}</div>;
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

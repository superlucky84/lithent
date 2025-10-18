import { h, render, mount } from 'lithent';
import { createContext } from '@/index';

// 다중 state를 위한 타입
type AppContext = {
  user: { value: string };
  theme: { value: string };
  count: { value: number };
};

const testContext = createContext<AppContext>();
const { Provider, contextState, useContext } = testContext;

const Component = mount(() => {
  const userState = contextState('Alice');
  const themeState = contextState('dark');
  const countState = contextState(0);

  console.log('Component');

  // 3초마다 count 증가 (테스트용)
  setTimeout(() => {
    countState.value = countState.value + 1;
  }, 3000);

  return () => (
    <div>
      <h2>Multiple State Context Example</h2>

      {/* 모든 state 전달 */}
      <Provider user={userState} theme={themeState} count={countState}>
        <div
          style={{ border: '2px solid blue', padding: '10px', margin: '10px' }}
        >
          <h3>Full Subscription (no keys)</h3>
          <ChildrenFullSubscribe jj={1} />
        </div>

        <div
          style={{ border: '2px solid green', padding: '10px', margin: '10px' }}
        >
          <h3>Selective Subscription (user only)</h3>
          <ChildrenUserOnly jj={2} />
        </div>

        <div
          style={{
            border: '2px solid orange',
            padding: '10px',
            margin: '10px',
          }}
        >
          <h3>Selective Subscription (theme + count)</h3>
          <ChildrenThemeCount jj={3} />
        </div>
      </Provider>

      <button
        onClick={() => {
          userState.value = userState.value === 'Alice' ? 'Bob' : 'Alice';
        }}
      >
        Toggle User
      </button>
      <button
        onClick={() => {
          themeState.value = themeState.value === 'dark' ? 'light' : 'dark';
        }}
      >
        Toggle Theme
      </button>
      <button
        onClick={() => {
          countState.value = countState.value + 1;
        }}
      >
        Increase Count
      </button>
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

// 전체 구독 (키 지정 안함)
const ChildrenFullSubscribe = mount<{ jj: number }>(renew => {
  console.log('ChildrenFullSubscribe - rendered');
  const ctx = useContext(testContext, renew); // 모든 키 구독

  console.log(ctx);

  return () => (
    <div>
      <p>User: {ctx.user?.value ?? 'N/A'}</p>
      <p>Theme: {ctx.theme?.value ?? 'N/A'}</p>
      <p>Count: {ctx.count?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>(Renders on ANY state change)</small>
    </div>
  );
});

// user만 구독
const ChildrenUserOnly = mount<{ jj: number }>(renew => {
  console.log('ChildrenUserOnly - rendered');
  const ctx = useContext(testContext, renew, ['user']); // user만 구독

  return () => (
    <div>
      <p>User: {ctx.user?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>(Only renders when user changes)</small>
    </div>
  );
});

// theme + count 구독
const ChildrenThemeCount = mount<{ jj: number }>(renew => {
  console.log('ChildrenThemeCount - rendered');
  const ctx = useContext(testContext, renew, ['theme', 'count']); // theme, count만

  return () => (
    <div>
      <p>Theme: {ctx.theme?.value ?? 'N/A'}</p>
      <p>Count: {ctx.count?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>
        (Only renders when theme or count changes)
      </small>
    </div>
  );
});

const testWrap = document.getElementById('root');

console.log('=== Starting context test ===');
console.log('testContext:', testContext);
console.log('Provider:', Provider);
console.log('useContext:', useContext);
console.log('contextState:', contextState);

render(<Component />, testWrap);

console.log('=== Render completed ===');

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

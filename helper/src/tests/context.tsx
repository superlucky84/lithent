import { h, render, mount, type WDom } from 'lithent';
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
  const ctx = useContext(testContext, renew); // 모든 키 구독

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

// 단일 state 패턴 테스트 (UserProvider 패턴)
const singleContext = createContext<{ state: { value: number } }>();
const {
  Provider: SingleProvider,
  contextState: singleContextState,
  useContext: useSingleContext,
} = singleContext;

const UserProvider = mount((_renew, _props, children: WDom[]) => {
  const contextRef = singleContextState(42);
  return () => <SingleProvider state={contextRef}>{children}</SingleProvider>;
});

const SingleChild = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div
      style={{ border: '2px solid purple', padding: '10px', margin: '10px' }}
    >
      <h3>UserProvider Pattern Test</h3>
      <p>Value: {ctx.state?.value ?? 'N/A'}</p>
    </div>
  );
});

const ComponentWithUserProvider = mount(() => {
  return () => (
    <div>
      <h2>UserProvider Pattern (Nested Provider)</h2>
      <UserProvider>
        <SingleChild jj={9} />
      </UserProvider>
    </div>
  );
});

// Provider 내부에서 state를 변경하는 컴포넌트
const SingleChildWithButton = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div
      style={{ border: '2px solid purple', padding: '10px', margin: '10px' }}
    >
      <h3>UserProvider Pattern Test</h3>
      <p>Value: {ctx.state?.value ?? 'N/A'}</p>
      <button
        onClick={() => {
          if (ctx.state) {
            ctx.state.value = ctx.state.value + 1;
          }
        }}
      >
        Increase Value
      </button>
    </div>
  );
});

const ComponentWithUserProviderAndButton = mount(() => {
  return () => (
    <div>
      <h2>UserProvider Pattern (With Update Test)</h2>
      <UserProvider>
        <SingleChildWithButton jj={10} />
      </UserProvider>
    </div>
  );
});

const testWrap = document.getElementById('root');

render(
  <div>
    <Component />
    <hr />
    <ComponentWithUserProvider />
    <hr />
    <ComponentWithUserProviderAndButton />
  </div>,
  testWrap
);

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

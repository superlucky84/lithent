import { h, render, lmount, nextTick, type WDom } from 'lithent';
import { createLContext } from '@/index';

// Type for multiple states
type AppContext = {
  user: string;
  count: number;
};

const testContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = testContext;

// Test 1: Basic lcontext usage with auto useRenew
const Component = lmount(() => {
  const userState = contextState('Alice');
  const countState = contextState(0);

  return () => (
    <div>
      <Provider user={userState} count={countState}>
        <ChildComponent />
      </Provider>

      <button
        id="toggle-user"
        onClick={() => {
          userState.value = userState.value === 'Alice' ? 'Bob' : 'Alice';
        }}
      >
        Toggle User
      </button>
      <button
        id="increase-count"
        onClick={() => {
          countState.value = countState.value + 1;
        }}
      >
        Increase Count
      </button>
    </div>
  );
});

// Child component using useContext without renew parameter
const ChildComponent = lmount(() => {
  const ctx = useContext(testContext); // No renew parameter! Auto useRenew

  return () => (
    <div id="child">
      <p id="user-display">User: {ctx.user?.value ?? 'N/A'}</p>
      <p id="count-display">Count: {ctx.count?.value ?? 'N/A'}</p>
    </div>
  );
});

// Test 2: Selective subscription
const ChildWithSelectiveSubscription = lmount(() => {
  const ctx = useContext(testContext, ['user']); // Only subscribe to user

  return () => (
    <div id="selective-child">
      <p id="selective-user">User: {ctx.user?.value ?? 'N/A'}</p>
    </div>
  );
});

const ComponentWithSelectiveChild = lmount(() => {
  const userState = contextState('Alice');
  const countState = contextState(0);

  return () => (
    <div>
      <Provider user={userState} count={countState}>
        <ChildWithSelectiveSubscription />
      </Provider>

      <button
        id="toggle-user-2"
        onClick={() => {
          userState.value = userState.value === 'Alice' ? 'Bob' : 'Alice';
        }}
      >
        Toggle User
      </button>
      <button
        id="increase-count-2"
        onClick={() => {
          countState.value = countState.value + 1;
        }}
      >
        Increase Count
      </button>
    </div>
  );
});

// Test 3: Children passed as props
const ProviderWrapper = lmount((_props, children: WDom[]) => {
  const userState = contextState('Charlie');
  const countState = contextState(100);

  return () => (
    <Provider user={userState} count={countState}>
      {children}
    </Provider>
  );
});

const ChildViaProps = lmount(() => {
  const ctx = useContext(testContext);

  return () => (
    <div id="props-child">
      <p id="props-user">User: {ctx.user?.value ?? 'N/A'}</p>
      <p id="props-count">Count: {ctx.count?.value ?? 'N/A'}</p>
      <button
        id="props-update"
        onClick={() => {
          if (ctx.user) {
            ctx.user.value = 'Updated';
          }
        }}
      >
        Update
      </button>
    </div>
  );
});

const ComponentWithPropsChildren = lmount(() => {
  return () => (
    <div>
      <ProviderWrapper>
        <ChildViaProps />
      </ProviderWrapper>
    </div>
  );
});

const testWrap = document.getElementById('root');

// Render for manual testing
if (testWrap) {
  render(
    <div>
      <Component />
      <hr />
      <ComponentWithSelectiveChild />
      <hr />
      <ComponentWithPropsChildren />
    </div>,
    testWrap
  );
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('lcontext should work with auto useRenew', async () => {
    const container = document.createElement('div');

    const TestComp = lmount(() => {
      const userState = contextState('Alice');
      const countState = contextState(0);

      const Child = lmount(() => {
        const ctx = useContext(testContext);
        return () => (
          <div>
            <span className="user">{ctx.user?.value ?? 'N/A'}</span>
            <span className="count">{ctx.count?.value ?? 'N/A'}</span>
          </div>
        );
      });

      return () => (
        <div>
          <Provider user={userState} count={countState}>
            <Child />
          </Provider>
          <button
            className="toggle"
            onClick={() => {
              userState.value = 'Bob';
            }}
          >
            Toggle
          </button>
        </div>
      );
    });

    render(<TestComp />, container);
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Alice');
    expect(container.querySelector('.count')?.textContent).toBe('0');

    const toggleBtn = container.querySelector('.toggle') as HTMLButtonElement;
    toggleBtn?.click();
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Bob');
  });

  it('lcontext selective subscription should work', async () => {
    const container = document.createElement('div');

    const TestComp = lmount(() => {
      const userState = contextState('Alice');
      const countState = contextState(0);

      const Child = lmount(() => {
        const ctx = useContext(testContext, ['user']); // Only user
        return () => (
          <div>
            <span className="user">{ctx.user?.value ?? 'N/A'}</span>
          </div>
        );
      });

      return () => (
        <div>
          <Provider user={userState} count={countState}>
            <Child />
          </Provider>
          <button
            className="inc-count"
            onClick={() => {
              countState.value = countState.value + 1;
            }}
          >
            Increase Count
          </button>
          <button
            className="change-user"
            onClick={() => {
              userState.value = 'Bob';
            }}
          >
            Change User
          </button>
        </div>
      );
    });

    render(<TestComp />, container);
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Alice');

    // Change user (subscribed) - should update
    const changeUserBtn = container.querySelector(
      '.change-user'
    ) as HTMLButtonElement;
    changeUserBtn?.click();
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Bob');
  });

  it('lcontext should work with children passed as props', async () => {
    const container = document.createElement('div');

    const TestProvider = lmount((_props, children: WDom[]) => {
      const userState = contextState('Start');
      const countState = contextState(50);

      return () => (
        <Provider user={userState} count={countState}>
          {children}
        </Provider>
      );
    });

    const Child = lmount(() => {
      const ctx = useContext(testContext);
      return () => (
        <div>
          <span className="user">{ctx.user?.value ?? 'N/A'}</span>
          <span className="count">{ctx.count?.value ?? 'N/A'}</span>
          <button
            className="update"
            onClick={() => {
              if (ctx.user) {
                ctx.user.value = 'Updated';
              }
            }}
          >
            Update
          </button>
        </div>
      );
    });

    const TestComp = lmount(() => {
      return () => (
        <TestProvider>
          <Child />
        </TestProvider>
      );
    });

    render(<TestComp />, container);
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Start');
    expect(container.querySelector('.count')?.textContent).toBe('50');

    const updateBtn = container.querySelector('.update') as HTMLButtonElement;
    updateBtn?.click();
    await nextTick();

    expect(container.querySelector('.user')?.textContent).toBe('Updated');
  });
}

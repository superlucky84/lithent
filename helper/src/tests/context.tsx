import { h, render, mount, nextTick, type WDom } from 'lithent';
import { createContext } from '@/index';

// Type for multiple states
type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const testContext = createContext<AppContext>();
const { Provider, contextState, useContext } = testContext;

const Component = mount(() => {
  const userState = contextState('Alice');
  const themeState = contextState('dark');
  const countState = contextState(0);

  return () => (
    <div>
      <h2>Multiple State Context Example</h2>

      {/* Pass all states */}
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

// Full subscription (no keys specified)
const ChildrenFullSubscribe = mount<{ jj: number }>(renew => {
  const ctx = useContext(testContext, renew); // Subscribe to all keys

  return () => (
    <div>
      <p>User: {ctx.user?.value ?? 'N/A'}</p>
      <p>Theme: {ctx.theme?.value ?? 'N/A'}</p>
      <p>Count: {ctx.count?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>(Renders on ANY state change)</small>
    </div>
  );
});

// Subscribe to user only
const ChildrenUserOnly = mount<{ jj: number }>(renew => {
  const ctx = useContext(testContext, renew, ['user']); // Subscribe to user only

  return () => (
    <div>
      <p>User: {ctx.user?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>(Only renders when user changes)</small>
    </div>
  );
});

// Subscribe to theme + count
const ChildrenThemeCount = mount<{ jj: number }>(renew => {
  const ctx = useContext(testContext, renew, ['theme', 'count']); // Subscribe to theme and count only

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

// Single state pattern test (UserProvider pattern)
const singleContext = createContext<{ state: number }>();
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

// Component that changes state inside Provider
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

// Pattern that receives children as props and renders them directly under Provider
const DirectChildrenProvider = mount((_renew, _props, children: WDom[]) => {
  const contextRef = singleContextState(100);
  return () => <SingleProvider state={contextRef}>{children}</SingleProvider>;
});

const DirectChild1 = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div style={{ border: '1px solid red', padding: '5px', margin: '5px' }}>
      <p>DirectChild1 - Value: {ctx.state?.value ?? 'N/A'}</p>
      <button
        onClick={() => {
          if (ctx.state) {
            ctx.state.value = ctx.state.value + 10;
          }
        }}
      >
        +10
      </button>
    </div>
  );
});

const DirectChild2 = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div style={{ border: '1px solid blue', padding: '5px', margin: '5px' }}>
      <p>DirectChild2 - Value: {ctx.state?.value ?? 'N/A'}</p>
      <button
        onClick={() => {
          if (ctx.state) {
            ctx.state.value = ctx.state.value - 5;
          }
        }}
      >
        -5
      </button>
    </div>
  );
});

const ComponentWithDirectChildren = mount(() => {
  return () => (
    <div>
      <h2>Direct Children Pattern (children passed via props)</h2>
      <p style={{ color: 'gray', fontSize: '0.9em' }}>
        UserProvider renders children received as props directly under Provider
      </p>
      <DirectChildrenProvider>
        <DirectChild1 jj={9} />
        <DirectChild2 jj={10} />
      </DirectChildrenProvider>
    </div>
  );
});

// Test auto-renew feature with contextState(value, renew)
const AutoRenewProvider = mount((renew, _props, children: WDom[]) => {
  const contextRef = singleContextState(200, renew); // Pass renew to auto-update
  return () => (
    <div>
      <SingleProvider state={contextRef}>{children}</SingleProvider>
      <button
        onClick={() => {
          contextRef.value = contextRef.value + 1;
        }}
      >
        Increment (Auto Renew)
      </button>
    </div>
  );
});

const AutoRenewChild = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div style={{ border: '2px solid teal', padding: '10px', margin: '10px' }}>
      <h3>Auto Renew Pattern Test</h3>
      <p>Value: {ctx.state?.value ?? 'N/A'}</p>
      <small style={{ color: 'gray' }}>
        (Provider has renew in contextState)
      </small>
    </div>
  );
});

const ComponentWithAutoRenew = mount(() => {
  return () => (
    <div>
      <h2>Auto Renew Pattern (contextState with renew)</h2>
      <p style={{ color: 'gray', fontSize: '0.9em' }}>
        Provider passes renew to contextState for automatic updates
      </p>
      <AutoRenewProvider>
        <AutoRenewChild jj={11} />
      </AutoRenewProvider>
    </div>
  );
});

const testWrap = document.getElementById('root');

// Render all examples in dev mode
if (testWrap) {
  render(
    <div>
      <Component />
      <hr />
      <ComponentWithUserProvider />
      <hr />
      <ComponentWithUserProviderAndButton />
      <hr />
      <ComponentWithDirectChildren />
      <hr />
      <ComponentWithAutoRenew />
    </div>,
    testWrap
  );
}

// Test component - tests pattern of receiving children as props and passing to Provider
const testContainer = document.createElement('div');

// Test if children passed via props correctly find the Provider
const TestDirectProvider = mount((_renew, _props, children: WDom[]) => {
  const stateRef = singleContextState(100);
  return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
});

const TestDirectChild1 = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div id="test-child1">
      <span id="value1-display">{ctx.state?.value ?? 'N/A'}</span>
      <button
        id="increase-btn1"
        onClick={() => {
          if (ctx.state) {
            ctx.state.value = ctx.state.value + 10;
          }
        }}
      >
        +10
      </button>
    </div>
  );
});

const TestDirectChild2 = mount<{ jj: number }>(renew => {
  const ctx = useSingleContext(singleContext, renew, ['state']);

  return () => (
    <div id="test-child2">
      <span id="value2-display">{ctx.state?.value ?? 'N/A'}</span>
      <button
        id="decrease-btn2"
        onClick={() => {
          if (ctx.state) {
            ctx.state.value = ctx.state.value - 5;
          }
        }}
      >
        -5
      </button>
    </div>
  );
});

const TestDirectComponent = mount(() => {
  return () => (
    <div>
      <TestDirectProvider>
        <TestDirectChild1 jj={9} />
        <TestDirectChild2 jj={10} />
      </TestDirectProvider>
    </div>
  );
});

// Render to actual DOM for manual testing in dev mode
if (testWrap) {
  render(<TestDirectComponent />, testContainer);
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('Children passed as props should find the correct Provider', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const Child1 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div id="child1">
          <span className="value1">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const Child2 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div id="child2">
          <span className="value2">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const TestComp = mount(() => {
      return () => (
        <TestProvider>
          <Child1 jj={1} />
          <Child2 jj={2} />
        </TestProvider>
      );
    });

    render(<TestComp />, container);
    await nextTick();

    const value1 = container.querySelector('.value1');
    const value2 = container.querySelector('.value2');

    expect(value1?.textContent).toBe('100');
    expect(value2?.textContent).toBe('100');
  });

  it('Children passed as props should share the same Provider state', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const Child1 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div>
          <span className="value1">{ctx.state?.value ?? 'N/A'}</span>
          <button
            className="btn1"
            onClick={() => {
              if (ctx.state) {
                ctx.state.value = ctx.state.value + 10;
              }
            }}
          >
            +10
          </button>
        </div>
      );
    });

    const Child2 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div>
          <span className="value2">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const TestComp = mount(() => {
      return () => (
        <TestProvider>
          <Child1 jj={1} />
          <Child2 jj={2} />
        </TestProvider>
      );
    });

    render(<TestComp />, container);

    const btn1 = container.querySelector('.btn1') as HTMLButtonElement;
    btn1?.click();
    await nextTick();

    const value1 = container.querySelector('.value1');
    const value2 = container.querySelector('.value2');

    expect(value1?.textContent).toBe('110');
    expect(value2?.textContent).toBe('110');
  });

  it('Multiple children should update together when Provider state changes', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const Child1 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div>
          <span className="value1">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const Child2 = mount<{ jj: number }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <div>
          <span className="value2">{ctx.state?.value ?? 'N/A'}</span>
          <button
            className="btn2"
            onClick={() => {
              if (ctx.state) {
                ctx.state.value = ctx.state.value - 5;
              }
            }}
          >
            -5
          </button>
        </div>
      );
    });

    const TestComp = mount(() => {
      return () => (
        <TestProvider>
          <Child1 jj={1} />
          <Child2 jj={2} />
        </TestProvider>
      );
    });

    render(<TestComp />, container);

    const btn2 = container.querySelector('.btn2') as HTMLButtonElement;
    btn2?.click();
    await nextTick();

    const value1 = container.querySelector('.value1');
    const value2 = container.querySelector('.value2');

    expect(value1?.textContent).toBe('95');
    expect(value2?.textContent).toBe('95');
  });

  it('Dynamically added children should find the Provider', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const ConditionalChild = mount<{ id: string }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return props => (
        <div className={`child-${props.id}`}>
          <span className="value">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const TestComp = mount(renew => {
      let showChild2 = false;

      return () => (
        <div>
          <TestProvider>
            <ConditionalChild id="1" />
            {showChild2 && <ConditionalChild id="2" />}
          </TestProvider>
          <button
            className="toggle"
            onClick={() => {
              showChild2 = !showChild2;
              renew();
            }}
          >
            Toggle
          </button>
        </div>
      );
    });

    render(<TestComp />, container);

    expect(container.querySelector('.child-1')).not.toBeNull();
    expect(container.querySelector('.child-2')).toBeNull();

    const toggleBtn = container.querySelector('.toggle') as HTMLButtonElement;
    toggleBtn?.click();
    await nextTick();

    const child2 = container.querySelector('.child-2');
    const child2Value = container.querySelector('.child-2 .value');

    expect(child2).not.toBeNull();
    expect(child2Value?.textContent).toBe('100');
  });

  it('Dynamically added children should share the same Provider state', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const ConditionalChild = mount<{ id: string }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return props => (
        <div className={`child-${props.id}`}>
          <span className="value">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const StateUpdater = mount(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <button
          className="updater"
          onClick={() => {
            if (ctx.state) {
              ctx.state.value = ctx.state.value + 50;
            }
          }}
        >
          Update
        </button>
      );
    });

    const TestComp = mount(renew => {
      let showChild2 = false;
      let showChild3 = false;

      return () => (
        <div>
          <TestProvider>
            <ConditionalChild id="1" />
            {showChild2 && <ConditionalChild id="2" />}
            {showChild3 && <ConditionalChild id="3" />}
            <StateUpdater />
          </TestProvider>
          <button
            className="toggle2"
            onClick={() => {
              showChild2 = !showChild2;
              renew();
            }}
          >
            Toggle2
          </button>
          <button
            className="toggle3"
            onClick={() => {
              showChild3 = !showChild3;
              renew();
            }}
          >
            Toggle3
          </button>
        </div>
      );
    });

    render(<TestComp />, container);

    const toggle2 = container.querySelector('.toggle2') as HTMLButtonElement;
    const toggle3 = container.querySelector('.toggle3') as HTMLButtonElement;
    const updater = container.querySelector('.updater') as HTMLButtonElement;

    // Add child2 and child3
    toggle2?.click();
    await nextTick();
    toggle3?.click();
    await nextTick();

    let value1 = container.querySelector('.child-1 .value');
    let value2 = container.querySelector('.child-2 .value');
    let value3 = container.querySelector('.child-3 .value');

    expect(value1?.textContent).toBe('100');
    expect(value2?.textContent).toBe('100');
    expect(value3?.textContent).toBe('100');

    // Update state
    updater?.click();
    await nextTick();

    value1 = container.querySelector('.child-1 .value');
    value2 = container.querySelector('.child-2 .value');
    value3 = container.querySelector('.child-3 .value');

    expect(value1?.textContent).toBe('150');
    expect(value2?.textContent).toBe('150');
    expect(value3?.textContent).toBe('150');
  });

  it('contextState with renew should auto-update component', async () => {
    // Create independent test environment
    const container = document.createElement('div');

    // Test simple component without Provider first
    const SimpleComp = mount((renew) => {
      const state = singleContextState(200, renew);
      return () => (
        <div>
          <span className="simple-display">{state.value}</span>
          <button
            className="simple-btn"
            onClick={() => {
              state.value = state.value + 1;
            }}
          >
            Increment
          </button>
        </div>
      );
    });

    render(<SimpleComp />, container);
    await nextTick();

    const display = container.querySelector('.simple-display');
    const btn = container.querySelector('.simple-btn') as HTMLButtonElement;

    expect(display?.textContent).toBe('200');

    btn?.click();
    await nextTick();

    expect(display?.textContent).toBe('201');
  });

  it('Removed and re-added children should still work correctly', async () => {
    // Create independent test environment
    const container = document.createElement('div');
    const TestProvider = mount((_renew, _props, children: WDom[]) => {
      const stateRef = singleContextState(100);
      return () => <SingleProvider state={stateRef}>{children}</SingleProvider>;
    });

    const ConditionalChild = mount<{ id: string }>(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return props => (
        <div className={`child-${props.id}`}>
          <span className="value">{ctx.state?.value ?? 'N/A'}</span>
        </div>
      );
    });

    const StateUpdater = mount(renew => {
      const ctx = useSingleContext(singleContext, renew, ['state']);
      return () => (
        <button
          className="updater"
          onClick={() => {
            if (ctx.state) {
              ctx.state.value = ctx.state.value + 50;
            }
          }}
        >
          Update
        </button>
      );
    });

    const TestComp = mount(renew => {
      let showChild2 = true;

      return () => (
        <div>
          <TestProvider>
            <ConditionalChild id="1" />
            {showChild2 && <ConditionalChild id="2" />}
            <StateUpdater />
          </TestProvider>
          <button
            className="toggle2"
            onClick={() => {
              showChild2 = !showChild2;
              renew();
            }}
          >
            Toggle2
          </button>
        </div>
      );
    });

    render(<TestComp />, container);

    const toggle2 = container.querySelector('.toggle2') as HTMLButtonElement;
    const updater = container.querySelector('.updater') as HTMLButtonElement;

    // Remove child2
    toggle2?.click();
    await nextTick();

    expect(container.querySelector('.child-2')).toBeNull();

    // Update state (100 + 50 = 150)
    updater?.click();
    await nextTick();

    // Add child2 again
    toggle2?.click();
    await nextTick();

    const child2 = container.querySelector('.child-2');
    const child2Value = container.querySelector('.child-2 .value');

    expect(child2).not.toBeNull();
    expect(child2Value?.textContent).toBe('150');
  });
}

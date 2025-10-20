import { h, render, mount, mountReadyCallback, nextTick } from '@/index';

// Test basic mountReadyCallback execution
const basicExecutionLog: string[] = [];

const BasicCallbackComponent = mount(() => {
  mountReadyCallback(() => {
    basicExecutionLog.push('callback-executed');
  });

  return () => <div className="basic-test">Basic Test</div>;
});

// Test callback execution order with nested components
const callbackOrder: string[] = [];

const NestedChild = mount(() => {
  mountReadyCallback(() => {
    callbackOrder.push('child');
  });

  return () => <div className="nested-child">Child</div>;
});

const NestedParent = mount(() => {
  mountReadyCallback(() => {
    callbackOrder.push('parent');
  });

  return () => (
    <div className="nested-parent">
      <span>Parent</span>
      <NestedChild />
    </div>
  );
});

// Test cleanup function return
const cleanupLog: string[] = [];

const CleanupChild = mount(() => {
  mountReadyCallback(() => {
    cleanupLog.push('mounted');
    return () => {
      cleanupLog.push('cleanup');
    };
  });

  return () => <div className="cleanup-child">Cleanup Child</div>;
});

const CleanupComponent = mount(renew => {
  let mounted = true;

  const toggle = () => {
    mounted = !mounted;
    renew();
  };

  return () => (
    <div>
      <button className="toggle-btn" onClick={toggle}>
        Toggle
      </button>
      {mounted && <CleanupChild />}
    </div>
  );
});

// Test multiple callbacks in single component
const multiCallbackLog: string[] = [];

const MultiCallbackComponent = mount(() => {
  mountReadyCallback(() => {
    multiCallbackLog.push('callback-1');
  });

  mountReadyCallback(() => {
    multiCallbackLog.push('callback-2');
  });

  mountReadyCallback(() => {
    multiCallbackLog.push('callback-3');
  });

  return () => <div className="multi-callback">Multi Callback Test</div>;
});

// Test callback execution before DOM rendering
const executionTimingLog: string[] = [];

const TimingTestChild = mount(() => {
  mountReadyCallback(() => {
    const element = document.querySelector('.timing-child');
    executionTimingLog.push(element ? 'dom-exists' : 'dom-not-exists');
  });

  return () => <div className="timing-child">Timing Child</div>;
});

const TimingTestParent = mount(() => {
  return () => (
    <div className="timing-parent">
      <TimingTestChild />
    </div>
  );
});

// Test with dynamic component mounting
const dynamicLog: string[] = [];

const DynamicChild = mount<{ id: number }>(() => {
  mountReadyCallback(() => {
    dynamicLog.push(`child-${Math.random().toString(36).substr(2, 4)}`);
  });

  return props => <div className="dynamic-child">Child {props.id}</div>;
});

const DynamicParent = mount(renew => {
  let showSecond = false;

  const addChild = () => {
    showSecond = true;
    renew();
  };

  return () => (
    <div className="dynamic-parent">
      <DynamicChild id={1} />
      {showSecond && <DynamicChild id={2} />}
      <button className="add-child-btn" onClick={addChild}>
        Add Child
      </button>
    </div>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

if (import.meta.vitest) {
  const { it, expect, beforeEach } = import.meta.vitest;

  beforeEach(() => {
    // Clear all logs before each test
    basicExecutionLog.length = 0;
    callbackOrder.length = 0;
    cleanupLog.length = 0;
    multiCallbackLog.length = 0;
    executionTimingLog.length = 0;
    dynamicLog.length = 0;
    testWrap.innerHTML = '';
  });

  it('Basic mountReadyCallback should execute after WDom creation', async () => {
    const container = document.createElement('div');

    expect(basicExecutionLog.length).toBe(0);

    render(<BasicCallbackComponent />, container);
    await nextTick();

    expect(basicExecutionLog).toContain('callback-executed');
    expect(basicExecutionLog.length).toBe(1);
  });

  it('Nested components should execute callbacks in creation order', async () => {
    const container = document.createElement('div');
    render(<NestedParent />, container);
    await nextTick();

    expect(callbackOrder).toEqual(['parent', 'child']);
  });

  it('Cleanup function should be called on unmount', async () => {
    const container = document.createElement('div');
    render(<CleanupComponent />, container);

    await nextTick();
    expect(cleanupLog).toContain('mounted');

    const toggleBtn = container.querySelector(
      '.toggle-btn'
    ) as HTMLButtonElement;
    toggleBtn?.click();
    await nextTick();

    expect(cleanupLog).toContain('cleanup');
  });

  it('Multiple callbacks in single component should all execute', async () => {
    const container = document.createElement('div');
    render(<MultiCallbackComponent />, container);
    await nextTick();

    expect(multiCallbackLog).toEqual([
      'callback-1',
      'callback-2',
      'callback-3',
    ]);
  });

  it('Callback should execute before DOM rendering', async () => {
    const container = document.createElement('div');
    render(<TimingTestParent />, container);
    await nextTick();

    // mountReadyCallback executes after WDom creation but before DOM rendering
    // so DOM element should not exist yet during callback execution
    expect(executionTimingLog[0]).toBe('dom-not-exists');
  });

  it('Dynamically added components should trigger callbacks', async () => {
    const container = document.createElement('div');
    render(<DynamicParent />, container);
    await nextTick();

    const initialCount = dynamicLog.length;
    expect(initialCount).toBe(1); // Only first child

    const addButton = container.querySelector(
      '.add-child-btn'
    ) as HTMLButtonElement;
    addButton?.click();
    await nextTick();

    expect(dynamicLog.length).toBe(2); // First + second child
  });

  it('Should handle callback with conditional rendering', async () => {
    const container = document.createElement('div');
    const conditionalLog: string[] = [];

    const ConditionalChild = mount(() => {
      mountReadyCallback(() => {
        conditionalLog.push('child-mounted');
        return () => {
          conditionalLog.push('child-unmounted');
        };
      });

      return () => <div className="conditional-child">Conditional</div>;
    });

    const ConditionalParent = mount(renew => {
      let show = true;

      const toggle = () => {
        show = !show;
        renew();
      };

      return () => (
        <div>
          <button className="toggle" onClick={toggle}>
            Toggle
          </button>
          {show && <ConditionalChild />}
        </div>
      );
    });

    render(<ConditionalParent />, container);
    await nextTick();

    expect(conditionalLog).toContain('child-mounted');

    const toggleBtn = container.querySelector('.toggle') as HTMLButtonElement;
    toggleBtn?.click();
    await nextTick();

    expect(conditionalLog).toContain('child-unmounted');

    toggleBtn?.click();
    await nextTick();

    // Should mount again
    expect(conditionalLog.filter(log => log === 'child-mounted').length).toBe(
      2
    );
  });
}

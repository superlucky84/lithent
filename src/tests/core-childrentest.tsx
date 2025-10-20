import { h, render, mount, nextTick, type WDom } from '@/index';

// Provider 컴포넌트 - children을 props로 받아서 렌더링
const Provider = mount((renew, _props, children: WDom[]) => {
  let k = 0;
  return () => (
    <div className="provider">
      <div className="provider-content">
        <h3>Provider</h3>
        <div className="children-wrapper">{children}</div>
      </div>
      <button
        className="provider-btn"
        onClick={() => {
          k = k + 1;
          renew();
        }}
      >
        Provider Renew (k={k})
      </button>
    </div>
  );
});

// Child 컴포넌트 - 자체 상태를 가지고 있음
const Child = mount<{ id: string }>(renew => {
  let v = 0;
  return props => (
    <div className={`child child-${props.id}`}>
      <span className="child-id">Child {props.id}</span>
      <button
        className="child-btn"
        onClick={() => {
          v = v + 1;
          renew();
        }}
      >
        v = {v}
      </button>
    </div>
  );
});

// 테스트 컴포넌트 - Provider에 children을 props로 전달
const TestComponent = mount(() => {
  return () => (
    <div className="test-component">
      <h2>Children Test</h2>
      <Provider>
        <Child id="A" />
        <Child id="B" />
      </Provider>
    </div>
  );
});

const testWrap = document.getElementById('root');

// 개발 모드에서 렌더링
if (testWrap) {
  render(<TestComponent />, testWrap);
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('Children disappearing issue reproduction', () => {
    it('Children should not disappear when parent renews after child renews', async () => {
      const container = document.createElement('div');

      render(<TestComponent />, container);
      await nextTick();

      // 초기 상태 확인
      const childA = container.querySelector('.child-A');
      const childB = container.querySelector('.child-B');
      const providerBtn = container.querySelector(
        '.provider-btn'
      ) as HTMLButtonElement;
      const childABtn = container.querySelector(
        '.child-A .child-btn'
      ) as HTMLButtonElement;

      expect(childA).not.toBeNull();
      expect(childB).not.toBeNull();
      expect(childABtn?.textContent).toContain('v = 0');

      console.log('[TEST] Step 1: Initial state - children visible');

      // Step 1: Child A의 버튼 클릭 (v = 0 → v = 1)
      childABtn?.click();
      await nextTick();

      console.log(
        '[TEST] Step 2: Child A renewed - checking children still visible'
      );

      const childAAfterRenew = container.querySelector('.child-A');
      const childBAfterRenew = container.querySelector('.child-B');
      const childABtnAfter = container.querySelector(
        '.child-A .child-btn'
      ) as HTMLButtonElement;

      expect(childAAfterRenew).not.toBeNull();
      expect(childBAfterRenew).not.toBeNull();
      expect(childABtnAfter?.textContent).toContain('v = 1');

      // Step 2: Provider의 버튼 클릭 (k = 0 → k = 1)
      providerBtn?.click();
      await nextTick();

      console.log(
        '[TEST] Step 3: Provider renewed - checking children still visible'
      );

      const childAFinal = container.querySelector('.child-A');
      const childBFinal = container.querySelector('.child-B');
      const childABtnFinal = container.querySelector(
        '.child-A .child-btn'
      ) as HTMLButtonElement;
      const providerBtnFinal = container.querySelector(
        '.provider-btn'
      ) as HTMLButtonElement;

      // 핵심 검증: Provider가 renew된 후에도 children이 사라지지 않아야 함
      expect(childAFinal).not.toBeNull();
      expect(childBFinal).not.toBeNull();
      expect(childABtnFinal?.textContent).toContain('v = 1'); // Child의 상태도 유지되어야 함
      expect(providerBtnFinal?.textContent).toContain('k=1');

      console.log(
        '[TEST] Test completed - children preserved after parent renew'
      );
    });

    it('Multiple child renews followed by parent renew should preserve children', async () => {
      const container = document.createElement('div');

      render(<TestComponent />, container);
      await nextTick();

      const providerBtn = container.querySelector(
        '.provider-btn'
      ) as HTMLButtonElement;
      const childABtn = container.querySelector(
        '.child-A .child-btn'
      ) as HTMLButtonElement;
      const childBBtn = container.querySelector(
        '.child-B .child-btn'
      ) as HTMLButtonElement;

      // Child A를 2번 renew
      childABtn?.click();
      await nextTick();
      childABtn?.click();
      await nextTick();

      // Child B를 1번 renew
      childBBtn?.click();
      await nextTick();

      expect(
        container.querySelector('.child-A .child-btn')?.textContent
      ).toContain('v = 2');
      expect(
        container.querySelector('.child-B .child-btn')?.textContent
      ).toContain('v = 1');

      // Provider renew
      providerBtn?.click();
      await nextTick();

      // Children이 여전히 존재하고 상태도 유지되어야 함
      const childAFinal = container.querySelector('.child-A');
      const childBFinal = container.querySelector('.child-B');
      const childABtnFinal = container.querySelector(
        '.child-A .child-btn'
      ) as HTMLButtonElement;
      const childBBtnFinal = container.querySelector(
        '.child-B .child-btn'
      ) as HTMLButtonElement;

      expect(childAFinal).not.toBeNull();
      expect(childBFinal).not.toBeNull();
      expect(childABtnFinal?.textContent).toContain('v = 2');
      expect(childBBtnFinal?.textContent).toContain('v = 1');
    });

    it('Direct slot children pattern should work correctly', async () => {
      // 비교를 위해 slot 패턴도 테스트
      const SlotProvider = mount(renew => {
        let k = 0;
        return () => (
          <div className="slot-provider">
            <h3>Slot Provider</h3>
            <Child id="X" />
            <Child id="Y" />
            <button
              className="slot-provider-btn"
              onClick={() => {
                k = k + 1;
                renew();
              }}
            >
              Slot Provider Renew (k={k})
            </button>
          </div>
        );
      });

      const container = document.createElement('div');
      render(<SlotProvider />, container);
      await nextTick();

      const childXBtn = container.querySelector(
        '.child-X .child-btn'
      ) as HTMLButtonElement;
      const providerBtn = container.querySelector(
        '.slot-provider-btn'
      ) as HTMLButtonElement;

      // Child X renew
      childXBtn?.click();
      await nextTick();
      expect(
        container.querySelector('.child-X .child-btn')?.textContent
      ).toContain('v = 1');

      // Provider renew
      providerBtn?.click();
      await nextTick();

      // Slot 패턴에서는 정상 동작해야 함
      expect(container.querySelector('.child-X')).not.toBeNull();
      expect(container.querySelector('.child-Y')).not.toBeNull();
      expect(
        container.querySelector('.child-X .child-btn')?.textContent
      ).toContain('v = 1');
    });
  });
}

import { h, render, mount, nextTick, type WDom } from 'lithent';
import { unwrapChildren } from '@/utils/children';

// Render props 패턴 - DataProvider
const DataProvider = mount((renew, _props, children: WDom[]) => {
  let count = 0;

  return () => {
    const candidate = unwrapChildren(children) as unknown;

    // 함수인지 확인하고 호출
    if (typeof candidate === 'function') {
      const renderChild = candidate as (data: {
        count: number;
        increment: () => void;
      }) => WDom;
      const data = {
        count,
        increment: () => {
          count++;
          renew();
        },
      };
      return renderChild(data);
    }

    return <div className="data-provider">{candidate ?? children}</div>;
  };
});

// 테스트 컴포넌트
const TestRenderProps = mount(() => {
  return () => (
    <DataProvider>
      {(data: any) => (
        <div className="render-props-result">
          <span className="count">Count: {data.count}</span>
          <button className="increment-btn" onClick={data.increment}>
            Increment
          </button>
        </div>
      )}
    </DataProvider>
  );
});

const testWrap = document.getElementById('root');

if (testWrap) {
  render(<TestRenderProps />, testWrap);
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('Render props pattern', () => {
    it('Should support function as children (render props)', async () => {
      const container = document.createElement('div');

      render(<TestRenderProps />, container);
      await nextTick();

      const countSpan = container.querySelector('.count');
      const incrementBtn = container.querySelector(
        '.increment-btn'
      ) as HTMLButtonElement;

      expect(countSpan?.textContent).toContain('Count: 0');

      incrementBtn?.click();
      await nextTick();

      expect(countSpan?.textContent).toContain('Count: 1');

      incrementBtn?.click();
      await nextTick();

      expect(countSpan?.textContent).toContain('Count: 2');
    });
  });
}

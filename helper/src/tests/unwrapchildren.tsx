import { h, render, mount, nextTick, type WDom } from 'lithent';
import { unwrapChildren } from '@/utils/children';

// 테스트 1: 단일 자식 (함수) - render props
const RenderPropsProvider = mount((renew, _props, children: WDom[]) => {
  let count = 0;

  return () => {
    const child = unwrapChildren(children);

    // 단일 자식이므로 WDom 타입 (함수)
    if (typeof child === 'function') {
      const data = {
        count,
        increment: () => {
          count++;
          renew();
        },
      };
      return (child as any)(data);
    }

    return <div className="fallback">{children}</div>;
  };
});

// 테스트 2: 단일 자식 (컴포넌트)
const SingleChildProvider = mount((_renew, _props, children: WDom[]) => {
  return () => {
    const child = unwrapChildren(children);

    return (
      <div className="single-provider">
        <h3>Single Child Provider</h3>
        <div className="content">{child}</div>
      </div>
    );
  };
});

// 테스트 3: 여러 자식
const MultiChildProvider = mount((_renew, _props, children: WDom[]) => {
  return () => {
    const childs = unwrapChildren(children);

    // 여러 자식이므로 WDom[] 타입
    const childArray = Array.isArray(childs) ? childs : [childs];

    return (
      <div className="multi-provider">
        <h3>Multi Child Provider</h3>
        <div className="child-count">Count: {childArray.length}</div>
        <div className="content">{childs}</div>
      </div>
    );
  };
});

const Child = mount<{ id: string }>(() => {
  return props => <div className={`child-${props.id}`}>Child {props.id}</div>;
});

const testWrap = document.getElementById('root');

if (testWrap) {
  render(
    <div>
      <RenderPropsProvider>
        {(data: any) => (
          <div className="render-result">
            <span className="count">Count: {data.count}</span>
            <button className="btn" onClick={data.increment}>
              Increment
            </button>
          </div>
        )}
      </RenderPropsProvider>

      <SingleChildProvider>
        <Child id="A" />
      </SingleChildProvider>

      <MultiChildProvider>
        <Child id="B" />
        <Child id="C" />
        <Child id="D" />
      </MultiChildProvider>
    </div>,
    testWrap
  );
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('unwrapChildren helper', () => {
    it('Should unwrap single child (render props pattern)', async () => {
      const container = document.createElement('div');

      render(
        <RenderPropsProvider>
          {(data: any) => (
            <div className="render-result">
              <span className="count">Count: {data.count}</span>
              <button className="btn" onClick={data.increment}>
                Increment
              </button>
            </div>
          )}
        </RenderPropsProvider>,
        container
      );
      await nextTick();

      const countSpan = container.querySelector('.count');
      const btn = container.querySelector('.btn') as HTMLButtonElement;

      expect(countSpan?.textContent).toContain('Count: 0');

      btn?.click();
      await nextTick();

      expect(countSpan?.textContent).toContain('Count: 1');
    });

    it('Should unwrap single child component', async () => {
      const container = document.createElement('div');

      render(
        <SingleChildProvider>
          <Child id="A" />
        </SingleChildProvider>,
        container
      );
      await nextTick();

      const childA = container.querySelector('.child-A');
      expect(childA).not.toBeNull();
      expect(childA?.textContent).toContain('Child A');
    });

    it('Should unwrap multiple children as array', async () => {
      const container = document.createElement('div');

      render(
        <MultiChildProvider>
          <Child id="B" />
          <Child id="C" />
          <Child id="D" />
        </MultiChildProvider>,
        container
      );
      await nextTick();

      const childCount = container.querySelector('.child-count');
      const childB = container.querySelector('.child-B');
      const childC = container.querySelector('.child-C');
      const childD = container.querySelector('.child-D');

      expect(childCount?.textContent).toContain('Count: 3');
      expect(childB).not.toBeNull();
      expect(childC).not.toBeNull();
      expect(childD).not.toBeNull();
    });

    it('Should handle empty children', async () => {
      const EmptyProvider = mount((_renew, _props, children: WDom[]) => {
        return () => {
          const child = unwrapChildren(children);
          const isEmpty = Array.isArray(child) && child.length === 0;

          return (
            <div className="empty-provider">
              {isEmpty ? 'No children' : 'Has children'}
            </div>
          );
        };
      });

      const container = document.createElement('div');

      render(<EmptyProvider />, container);
      await nextTick();

      const provider = container.querySelector('.empty-provider');
      expect(provider?.textContent).toContain('No children');
    });
  });
}

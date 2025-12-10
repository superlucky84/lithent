import { Fragment, h, mount, render } from '@/index';

type Item = { label: string };

const LoopWithoutKeyDemo = mount(function (renew) {
  let list: Item[] = [{ label: 'A' }, { label: 'B' }];

  const updateList = (next: Item[]) => {
    list = next;
    renew();
  };

  const reset = () => updateList([{ label: 'A' }, { label: 'B' }]);
  const updateSameOrder = () => updateList([{ label: 'X' }, { label: 'Y' }]);
  const swapOrder = () => updateList([{ label: 'B' }, { label: 'A' }]);

  return () => (
    <Fragment>
      <header class="panel">
        <div>
          <p class="eyebrow">Keyless loop</p>
          <h1>DOM 재사용 눈으로 보기</h1>
          <p class="hint">
            버튼을 눌러 텍스트만 바꾸거나 순서를 바꿔보세요. 애니메이션이 끊기지
            않으면 DOM이 그대로 재사용된 것입니다.
          </p>
        </div>
        <div class="controls">
          <button onClick={reset}>Reset A,B</button>
          <button onClick={updateSameOrder}>Same order update</button>
          <button onClick={swapOrder}>Swap order (no key)</button>
        </div>
      </header>
      <main class="list">
        {list.map(item => (
          <div class="item">
            <span class="item__label">{item.label}</span>
            <span class="item__sub">animation keeps running</span>
          </div>
        ))}
      </main>
    </Fragment>
  );
});

const root = document.getElementById('root');
if (root) {
  render(<LoopWithoutKeyDemo />, root);
}

import { h, render, mount, nextTick, type WDom } from 'lithent';
import { createContext } from '@/index';

const ctx = createContext<{ label: string }>();
const { Provider, contextState, useContext } = ctx;

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const setup = () => {
    let rows = [1, 2, 3, 4];
    let setLabel = (_: string) => {};
    let bumpList = () => {};
    const Wrapper = mount((_r, _p, kids: WDom[]) => {
      const label = contextState('first');
      setLabel = v => {
        label.value = v;
      };
      return () => <Provider label={label}>{kids}</Provider>;
    });
    const Leaf = mount<{ n: number; key?: number }>((renew, props) => {
      const c = useContext(ctx, renew, ['label']);
      return () => (
        <i>
          {props.n}:{c.label?.value}
        </i>
      );
    });
    const List = mount(renew => {
      bumpList = renew;
      return () => (
        <div>
          {rows.map(n => (
            <Leaf key={n} n={n} />
          ))}
        </div>
      );
    });
    const App = mount(() => () => (
      <Wrapper>
        <List />
      </Wrapper>
    ));
    const el = document.createElement('div');
    render(<App />, el);
    return {
      el,
      setRows: (r: number[]) => {
        rows = r;
        bumpList();
      },
      setLabel: (v: string) => setLabel(v),
    };
  };
  const texts = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('i')).map(n => n.textContent);

  it('removing rows after the context changed leaves no ghost rows', async () => {
    const t = setup();
    await nextTick();
    t.setRows([1, 2]);
    await nextTick();
    t.setLabel('second');
    await nextTick();
    expect(texts(t.el)).toEqual(['1:second', '2:second']);
  });
  it('removing rows and changing the context in the same tick leaves no ghost rows', async () => {
    const t = setup();
    await nextTick();
    t.setRows([1, 2]);
    t.setLabel('second');
    await nextTick();
    expect(texts(t.el)).toEqual(['1:second', '2:second']);
  });
  it('changing the context then removing rows in the same tick leaves no ghost rows', async () => {
    const t = setup();
    await nextTick();
    t.setLabel('second');
    t.setRows([1, 2]);
    await nextTick();
    expect(texts(t.el)).toEqual(['1:second', '2:second']);
  });
}

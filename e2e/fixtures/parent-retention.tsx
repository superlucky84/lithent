import { Fragment, mount, nextTick, render } from 'lithent';

const spans: WeakRef<object>[] = [];
const fragments: WeakRef<object>[] = [];
let step = async () => {};
const App = mount(renew => {
  let count = 0;
  step = async () => {
    count++;
    renew();
    await nextTick();
  };
  return () => {
    const span = <span key="stable">{count}</span>;
    const fragment = <Fragment>{[span]}</Fragment>;
    spans.push(new WeakRef(span));
    fragments.push(new WeakRef(fragment));
    return <div>{fragment}</div>;
  };
});
render(<App />, document.querySelector('#app'));

declare global {
  interface Window {
    parentRetention: {
      step: () => Promise<void>;
      stats: () => { renders: number; spans: number; fragments: number };
    };
  }
}
window.parentRetention = {
  step: () => step(),
  stats: () => ({
    renders: spans.length,
    spans: spans.filter(ref => ref.deref()).length,
    fragments: fragments.filter(ref => ref.deref()).length,
  }),
};

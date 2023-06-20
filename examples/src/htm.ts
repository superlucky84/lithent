import { h, render, mount, Fragment, WDom } from 'lithent';
import { state } from 'lithent/helper';
import htm from 'htm';

const html = htm.bind(h);

const Component = mount(r => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return (): WDom =>
    html`
      <${Fragment}>
        <li>count: ${count.v}</li>
        <button onClick=${change}>increase</button>
      <//>
    ` as WDom;
});

render(html`<${Component} />` as WDom, document.getElementById('root'));

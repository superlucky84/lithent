import { h, render, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';
import htm from 'htm';
const html = htm.bind(h);

const Component = mount((r, _props) => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return () => html`
    <${Fragment}>
      <li>count: ${count.v}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

render(html`<${Component} />`, document.getElementById('root'));

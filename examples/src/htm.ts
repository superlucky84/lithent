import { render, mount, Fragment, WDom } from 'lithent';
import { state } from 'lithent/helper';
import { lTag } from 'lithent/tag';

const Component = mount(r => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return (): WDom =>
    lTag`
      <${Fragment}>
        <li>count: ${count.v}</li>
        <button onClick=${change}>increase</button>
      <//>
    ` as WDom;
});

render(lTag`<${Component} />` as WDom, document.getElementById('root'));

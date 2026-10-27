// Reproduces BUG-1 in Chromium: a component that appears in an empty slot
// right before a portal sibling is inserted before the portal *target*
// (not a child of the parent), so insertBefore throws and the parent loses
// its other children. Same result with the published lithent@1.25.2 UMD.
//
//   node experiments/bundle-size-recheck/portal-anchor-repro.cjs <lithent.umd.js>
const fs = require('fs');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setContent(
    '<!doctype html><body><div id="root"></div><div id="portal"></div></body>'
  );
  await page.addScriptTag({
    content: fs.readFileSync(process.argv[2], 'utf8'),
  });
  const states = await page.evaluate(async () => {
    const { h, Fragment, mount, lmount, render, portal } = window.lithent;
    let show = false;
    let renewApp;
    const Child = lmount(
      () => () => h(Fragment, null, h('span', null, 'x'), h('b', null, 'y'))
    );
    const App = mount(renew => {
      renewApp = renew;
      return () =>
        h(
          'div',
          null,
          h('p', null, 'head'),
          show ? h(Child) : null,
          portal(h('i', null, String(show)), document.getElementById('portal')),
          h('em', null, 'tail')
        );
    });
    render(h(App), document.getElementById('root'));
    const out = [document.getElementById('root').innerHTML];
    for (const next of [true, false]) {
      show = next;
      renewApp();
      await new Promise(resolve => setTimeout(resolve, 10));
      out.push(document.getElementById('root').innerHTML);
    }
    return out;
  });
  console.log(states.join('\n'));
  console.log('page errors:', errors);
  await browser.close();
  // Expected after the fix: '<div><p>head</p><span>x</span><b>y</b><em>tail</em></div>' and no errors.
  process.exit(errors.length ? 1 : 0);
})();

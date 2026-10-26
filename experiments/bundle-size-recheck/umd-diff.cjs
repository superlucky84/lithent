// Differential smoke test for UMD output candidates. Runs one scenario
// (keyed list select/update/swap/remove/append+reverse/clear/refill, hooks,
// lmount/useRenew, ref/style, portal, a component toggled in front of the
// portal, events and dispose) on each bundle in jsdom, then compares DOM
// snapshots, lifecycle logs, uncaught errors and export names with the first.
//
//   node experiments/bundle-size-recheck/umd-diff.cjs <reference.umd.js> <candidate.umd.js>...
//
// This is an output-equivalence check, not a replacement for the test suite.
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const run = async file => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', e => errors.push(String(e.message)));
  const dom = new JSDOM(
    '<!doctype html><body><div id="root"></div><div id="portal"></div></body>',
    { runScripts: 'outside-only', virtualConsole }
  );
  const w = dom.window;
  w.eval(fs.readFileSync(file, 'utf8'));
  const L = w.lithent;
  const { h, Fragment, mount, lmount, render, portal } = L;
  const { mountCallback, updateCallback, mountReadyCallback, ref, useRenew } =
    L;
  const log = [];
  const snaps = [];
  const snap = tag => snaps.push(`${tag}:${w.document.body.innerHTML}`);
  let rows = [1, 2, 3, 4, 5].map(id => ({ id, label: `r${id}` }));
  let selected = 0;
  let renewApp;
  let clicks = 0;

  const Row = mount((_renew, props) => {
    mountCallback(() => {
      log.push(`mount${props.row.id}`);
      return () => log.push(`unmount${props.row.id}`);
    });
    updateCallback(
      () => {
        log.push(`upd${props.row.id}`);
      },
      () => [props.row.label]
    );
    return () =>
      h(
        'tr',
        { class: props.sel ? 'danger' : '', onClick: () => clicks++ },
        h('td', null, props.row.id),
        h('td', null, props.row.label)
      );
  });
  const Child = lmount(() => {
    const r = ref(null);
    mountReadyCallback(() => log.push('ready'));
    const renew = useRenew();
    return () =>
      h(
        Fragment,
        null,
        h('span', { ref: r, style: { color: 'red' } }, 'x'),
        h('b', null, typeof renew)
      );
  });
  const App = mount(renew => {
    renewApp = renew;
    return () =>
      h(
        'div',
        null,
        h(
          'table',
          null,
          h(
            'tbody',
            null,
            rows.map(row =>
              h(Row, { key: row.id, row, sel: row.id === selected })
            )
          )
        ),
        selected % 2 ? h(Child) : null,
        portal(
          h('i', null, `p${selected}`),
          w.document.getElementById('portal')
        ),
        [
          h('em', { key: 'a' }, 'a'),
          false,
          h('em', { key: 'b', title: String(selected) }, 'b'),
        ]
      );
  });

  const dispose = render(h(App), w.document.getElementById('root'));
  snap('init');
  const steps = [
    () => {
      selected = 2;
    },
    () => {
      rows = rows.map((r, i) => (i % 2 ? { ...r, label: `${r.label}!` } : r));
    },
    () => {
      const a = rows.slice();
      [a[1], a[3]] = [a[3], a[1]];
      rows = a;
    },
    () => {
      rows = rows.filter(r => r.id !== 3);
      selected = 1;
    },
    () => {
      rows = rows.concat([6, 7].map(id => ({ id, label: `r${id}` }))).reverse();
    },
    () => {
      rows = [];
      selected = 0;
    },
    () => {
      rows = [8, 9].map(id => ({ id, label: `r${id}` }));
      selected = 9;
    },
  ];
  for (let i = 0; i < steps.length; i++) {
    steps[i]();
    renewApp();
    await new Promise(resolve => setTimeout(resolve));
    snap(`s${i}`);
  }
  const tr = w.document.querySelector('tr');
  if (tr) tr.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  log.push(`clicks${clicks}`);
  dispose();
  snap('disposed');
  return {
    snaps,
    log,
    errors,
    keys: Object.keys(L).sort().join(),
    tag: Object.prototype.toString.call(L),
  };
};

(async () => {
  const [reference, ...candidates] = process.argv.slice(2);
  const a = await run(reference);
  console.log(
    `reference ${reference}: ${a.snaps.length} snapshots, ${a.log.length} log entries, ${a.errors.length} uncaught errors, ${a.tag}`
  );
  let failed = false;
  for (const file of candidates) {
    const b = await run(file);
    const same = ['snaps', 'log', 'errors', 'keys'].every(
      key => JSON.stringify(a[key]) === JSON.stringify(b[key])
    );
    failed ||= !same;
    console.log(
      `${file}: ${same ? 'IDENTICAL dom/log/errors/exports' : 'DIFFERENT'}, ${b.tag}`
    );
  }
  process.exit(failed ? 1 : 0);
})();

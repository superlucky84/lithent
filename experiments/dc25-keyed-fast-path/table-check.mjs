import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { root, hash, read, write } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const file = path.join(root, 'docs/benchmark/dc25-keyed-fast-path-table.html');
const html = fs.readFileSync(file, 'utf8');
const data = read(path.join(out, 'final-candidate-results.json'));
const colors = read(path.join(out, 'colors.json'));
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const document = dom.window.document;
let modes = 0,
  cells = 0,
  goals = 0;
for (const order of ['main', 'reverse', 'pooled'])
  for (const metric of ['total', 'script', 'paint', 'memory']) {
    document.querySelector('#order').value = order;
    document.querySelector('#metric').value = metric;
    document
      .querySelector('#metric')
      .dispatchEvent(new dom.window.Event('change'));
    const memory = metric === 'memory';
    const rows = data[memory ? 'memory' : 'rows'][order];
    const actual = [...document.querySelectorAll('#results tr')];
    assert.equal(actual.length, rows.length + 1);
    assert(!actual[0].textContent.includes('undefined'));
    assert(actual[0].textContent.includes('K'));
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      assert.equal(actual[i + 1].children[0].textContent, row.id);
      for (let j = 0; j < data.names.length; j++) {
        const name = data.names[j],
          cell = actual[i + 1].children[j + 1];
        const stat = memory
          ? row.conditions[name]
          : row.conditions[name][metric];
        assert.equal(cell.firstChild.textContent, stat.median.toFixed(3));
        const color =
          colors[memory ? 'memory' : 'rows'][order][i].metrics[metric][name]
            .color;
        assert.equal(cell.style.backgroundColor, color);
        assert(
          cell.querySelector('small').textContent.endsWith('N=' + stat.count)
        );
        cells++;
      }
      if (!memory) {
        const goal = data.goal[order].find(item => item.id === row.id);
        const cell = actual[i + 1].lastElementChild;
        assert.equal(cell.className, goal.pass ? 'pass' : 'miss');
        assert(cell.textContent.startsWith(goal.ratio.toFixed(3)));
        goals++;
      }
    }
    modes++;
  }
dom.window.close();
write(path.join(out, 'table-inspection.json'), {
  pass: true,
  modes,
  numericCells: cells,
  goalCells: goals,
  htmlSHA256: hash(html),
  note: 'JSDOM controls/numeric/color inspection; not a Chrome visual inspection.',
});
console.log(JSON.stringify({ modes, cells, goals, pass: true }));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, read, hash } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const data = read(path.join(out, 'final-event-results.json'));
assert(read(path.join(out, 'final-event-audit.json')).pass);
const input = read(path.join(out, 'app-inputs.json'));
const common = fs.readFileSync(
  path.join(input.bench, 'webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const body = common.match(
  /const computeColor = function \(factor: number\): string \{([\s\S]*?)\n\};/
)[1];
const computeColor = new Function('factor', body);
for (const [factor, color] of [
  [1, 'rgb(99, 191, 124)'],
  [2, 'rgb(255, 236, 132)'],
  [4, 'rgb(249, 105, 108)'],
])
  assert.equal(computeColor(factor), color);
const colorSource = `const computeColor = function(factor) {${body}\n};\n`;
fs.writeFileSync(path.join(out, 'color-function.js'), colorSource, {
  flag: 'wx',
});
const colors = {
  sourceSHA256: hash(common),
  extractedSHA256: hash(colorSource),
  normalization:
    'Minimum among all six displayed apps for color; four fixed peers for the CPU goal.',
  rows: {},
  memory: {},
};
for (const [key, isMemory] of [
  ['rows', false],
  ['memory', true],
])
  for (const [order, items] of Object.entries(data[key]))
    colors[key][order] = items.map(item => ({
      id: item.id,
      metrics: Object.fromEntries(
        (isMemory ? ['memory'] : ['total', 'script', 'paint']).map(metric => {
          const values = Object.fromEntries(
            data.names.map(name => [
              name,
              isMemory
                ? item.conditions[name].median
                : item.conditions[name][metric].median,
            ])
          );
          const best = Math.min(...Object.values(values));
          return [
            metric,
            Object.fromEntries(
              data.names.map(name => [
                name,
                {
                  factor: values[name] / best,
                  color: computeColor(values[name] / best),
                },
              ])
            ),
          ];
        })
      ),
    }));
fs.writeFileSync(
  path.join(out, 'colors.json'),
  JSON.stringify(colors, null, 2) + '\n',
  { flag: 'wx' }
);
fs.copyFileSync(
  path.join(out, 'colors.json'),
  path.join(root, 'docs/benchmark/comprehensive-colors.json')
);
const serialized = JSON.stringify(data).replaceAll('<', '\\u003c');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DC-22 final comparison</title>
<style>
body{font:15px system-ui,sans-serif;margin:32px auto;padding:0 24px;max-width:1400px;color:#172434;background:#f7f9fb}h1{font-size:26px}p{line-height:1.65}label{display:inline-block;margin:12px 24px 16px 0}select{font:inherit;padding:8px}table{border-collapse:collapse;width:100%;background:white}th,td{padding:12px;border:1px solid #c7d2dd;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{background:#edf2f7}td small{display:block;margin-top:4px}.scroll{overflow:auto}.pass{color:#155f35}.miss{color:#a12e21}.note{font-size:13px;color:#4a5868}a{color:#2456b8}
</style>
<h1>DC-22: event proxy and fixed peers</h1>
<p>Fresh original cached-app samples. B = compact13; E = repaired event proxy. React hooks19.2.0 / classes19.0.0; Preact hooks/classes11.0.0.<br>Colors normalize to all six displayed apps. CPU goal uses the fastest of the four peers, ≤1.10 for every total median.</p>
<label>Order <select id="order"><option value="pooled">Pooled</option><option value="main">Main</option><option value="reverse">Reverse</option></select></label>
<label>Metric <select id="metric"><option value="total">Total ms</option><option value="script">JS ms</option><option value="paint">Paint ms</option><option value="memory">Official memory MB</option></select></label>
<p id="summary"></p><div class="scroll"><table id="results"></table></div>
<p class="note">Each cell shows the median, relative factor and N. Hover for quartiles and range. Total/JS/paint medians need not add up. Small/order-dependent differences are uncertain; these are not confidence intervals. Official memory is separate from post-GC JS heap diagnostics.</p>
<p><a href="COMPREHENSIVE_RESULTS.md">Full selection, costs, failures and validation</a> · <a href="comprehensive-final-results.json">All distributions and ratios</a> · <a href="comprehensive-colors.json">Color factors</a></p>
<script>
const data=${serialized};
${colorSource}
const labels={baseline:'B',event:'E','react-hooks':'React hooks','react-classes':'React classes','preact-hooks':'Preact hooks','preact-classes':'Preact classes'};
function update(){
 const order=document.getElementById('order').value,metric=document.getElementById('metric').value,memory=metric==='memory';
 const rows=data[memory?'memory':'rows'][order],goals=data.goal[order];
 document.getElementById('summary').textContent=goals.filter(item=>item.pass).length+'/9 total CPU goals pass ('+order+'). Requirement: all nine.';
 const table=document.getElementById('results');table.replaceChildren();
 const header=document.createElement('tr');for(const text of ['Item',...data.names.map(name=>labels[name]),...(memory?[]:['E / fastest peer total'])]){const cell=document.createElement('th');cell.textContent=text;header.append(cell);}table.append(header);
 for(const row of rows){
  const tr=document.createElement('tr'),title=document.createElement('td');title.textContent=row.id;tr.append(title);
  const value=name=>memory?row.conditions[name].median:row.conditions[name][metric].median,best=Math.min(...data.names.map(value));
  for(const name of data.names){const stat=memory?row.conditions[name]:row.conditions[name][metric],cell=document.createElement('td');cell.textContent=value(name).toFixed(3);cell.style.backgroundColor=computeColor(value(name)/best);cell.title='Q1='+stat.p25.toFixed(3)+'; Q3='+stat.p75.toFixed(3)+'; min='+stat.min.toFixed(3)+'; max='+stat.max.toFixed(3);const small=document.createElement('small');small.textContent=(value(name)/best).toFixed(3)+'× · N='+stat.count;cell.append(small);tr.append(cell);}
  if(!memory){const goal=goals.find(item=>item.id===row.id),cell=document.createElement('td');cell.className=goal.pass?'pass':'miss';cell.textContent=goal.ratio.toFixed(3)+'× '+(goal.pass?'PASS':'MISS');tr.append(cell);}table.append(tr);
 }
}
document.getElementById('order').addEventListener('change',update);document.getElementById('metric').addEventListener('change',update);update();
</script></html>`;
fs.writeFileSync(
  path.join(root, 'docs/benchmark/comprehensive-table.html'),
  html
);
console.log(
  JSON.stringify({
    file: 'docs/benchmark/comprehensive-table.html',
    colorNormalization: colors.normalization,
  })
);

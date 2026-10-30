// DC-29 R111: official js-framework-benchmark gap for lithent vs peers, using the
// site factor (mean total / fastest mean) and CPU weights. Projections below are
// local improvement rates multiplied onto official means, not measurements.
// Usage: node official-gap.mjs <js-framework-benchmark>/webdriver-ts-results/src/results.ts
import fs from 'node:fs';

const src = fs.readFileSync(process.argv[2], 'utf8');
const grab = name => {
  const line = src.split('\n').find(l => l.startsWith(`export const ${name}`));
  return JSON.parse(line.slice(line.indexOf('=') + 1).replace(/;\s*$/, ''));
};
const resStart = src.indexOf('=[', src.indexOf('export const results')) + 1;
const resEnd = src.indexOf('\nexport const frameworks');
const results = JSON.parse(
  src
    .slice(resStart, resEnd)
    .trim()
    .replace(/;$/, '')
    .replace(/,\s*\]$/, ']')
);
const frameworks = grab('frameworks');
const benchmarks = grab('benchmarks');
const W = [
  0.64280248137063, 0.5607178150466176, 0.5643800750716564, 0.1925635870170522,
  0.13200612879341714, 0.5277091212292658, 0.5644449600965534,
  0.5508359820582848, 0.4225836631419211,
];
const cpu = benchmarks.filter(b => b.type === 0).slice(0, 9);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const median = a => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const byFw = new Map(results.map(r => [r.f, r]));
const val = (fi, bi, key = 'total', stat = mean) => {
  const r = byFw.get(fi);
  if (!r) return null;
  const e = r.b.find(x => x.b === bi);
  if (!e || !e.v[key]) return null;
  return stat(e.v[key]);
};
const cpuIdx = cpu.map(b => benchmarks.indexOf(b));
const fastest = cpuIdx.map(bi =>
  Math.min(...frameworks.map((_, fi) => val(fi, bi) ?? Infinity))
);
const geo = fi => {
  let g = 0,
    w = 0;
  cpuIdx.forEach((bi, k) => {
    const v = val(fi, bi);
    if (v != null) {
      g += W[k] * Math.log(v / fastest[k]);
      w += W[k];
    }
  });
  return w ? Math.exp(g / w) : NaN;
};
const ranked = frameworks
  .map((f, fi) => ({ name: f.name, fi, g: geo(fi) }))
  .filter(x => !isNaN(x.g))
  .sort((a, b) => a.g - b.g);
const find = re => frameworks.findIndex(f => re.test(f.name));
const picks = [
  ['lithent', /^lithent-/],
  ['vanillajs', /^vanillajs-keyed/],
  ['ivi', /^ivi-/],
  ['inferno', /^inferno-/],
  ['solid', /^solid-v/],
  ['svelte', /^svelte-v/],
  ['vue', /^vue-v/],
  ['preact-hooks', /^preact-hooks-/],
  ['preact-classes', /^preact-classes-/],
  ['react-hooks', /^react-hooks-v/],
  ['react-classes', /^react-classes-/],
]
  .map(([label, re]) => [label, find(re)])
  .filter(([, fi]) => fi >= 0);

console.log(`frameworks with CPU results: ${ranked.length}`);
for (const [label, fi] of picks) {
  const rank = ranked.findIndex(x => x.fi === fi) + 1;
  console.log(
    `${label.padEnd(15)} ${frameworks[fi].name.padEnd(34)} geo ${geo(fi).toFixed(3)}  rank ${rank}`
  );
}
const L = picks[0][1];
console.log('\nper benchmark (mean total ms; factor = / fastest; script ms):');
console.log(
  'bench'.padEnd(24) +
    'w     fastest  lithent  factor  script | ' +
    picks
      .slice(1)
      .map(p => p[0].slice(0, 9).padStart(9))
      .join('')
);
cpu.forEach((b, k) => {
  const bi = cpuIdx[k];
  const lv = val(L, bi),
    ls = val(L, bi, 'script');
  const peers = picks
    .slice(1)
    .map(([, fi]) => {
      const v = val(fi, bi);
      return v == null ? '        -' : (v / fastest[k]).toFixed(2).padStart(9);
    })
    .join('');
  console.log(
    `${b.id.padEnd(24)}${W[k].toFixed(2)}  ${fastest[k].toFixed(1).padStart(7)}  ${lv.toFixed(1).padStart(7)}  ${(lv / fastest[k]).toFixed(2).padStart(6)}  ${ls.toFixed(1).padStart(6)} | ${peers}`
  );
});
console.log('\nlithent script vs peers (mean script ms):');
cpu.forEach((b, k) => {
  const bi = cpuIdx[k];
  console.log(
    b.id.padEnd(24) +
      picks
        .map(([l, fi]) => {
          const v = val(fi, bi, 'script');
          return `${l.slice(0, 9)}=${v == null ? '-' : v.toFixed(1)}`;
        })
        .join('  ')
  );
});
// Which items cost lithent the most in the weighted geomean (contribution of log factor).
console.log('\nlithent weighted log-factor share:');
const contrib = cpu.map((b, k) => ({
  id: b.id,
  c: W[k] * Math.log(val(L, cpuIdx[k]) / fastest[k]),
}));
const tot = contrib.reduce((s, x) => s + x.c, 0);
contrib
  .sort((a, b) => b.c - a.c)
  .forEach(x =>
    console.log(`  ${x.id.padEnd(24)} ${((100 * x.c) / tot).toFixed(1)}%`)
  );
// What geomean would lithent get if one item matched the best of preact/react/vue?
const peerFis = picks
  .filter(([l]) => /preact|react|vue|inferno/.test(l))
  .map(p => p[1]);
console.log(
  '\nlithent geo if an item matched the best of preact/react/vue/inferno:'
);
cpu.forEach((b, k) => {
  const bi = cpuIdx[k];
  const best = Math.min(...peerFis.map(fi => val(fi, bi) ?? Infinity));
  const lv = val(L, bi);
  if (best >= lv) return;
  let g = 0,
    w = 0;
  cpuIdx.forEach((bj, j) => {
    const v = j === k ? best : val(L, bj);
    g += W[j] * Math.log(v / fastest[j]);
    w += W[j];
  });
  console.log(
    `  ${b.id.padEnd(24)} ${lv.toFixed(1)} -> ${best.toFixed(1)} ms   geo ${geo(L).toFixed(3)} -> ${Math.exp(g / w).toFixed(3)}`
  );
});
// Neighbors in the ranking.
const li = ranked.findIndex(x => x.fi === L);
console.log('\nranking around lithent:');
ranked
  .slice(Math.max(0, li - 6), li + 5)
  .forEach((x, i) =>
    console.log(
      `  ${String(Math.max(0, li - 6) + i + 1).padStart(3)} ${x.name.padEnd(40)} ${x.g.toFixed(3)}`
    )
  );

// Projection: apply local 1.25.3 node-shape pooled changes to official 1.25.2 means.
const proj = (changes, label) => {
  let g = 0,
    w = 0;
  cpuIdx.forEach((bi, k) => {
    const v = val(L, bi) * (1 + changes[k] / 100);
    g += W[k] * Math.log(v / fastest[k]);
    w += W[k];
  });
  const pg = Math.exp(g / w);
  const rank = ranked.filter(x => x.fi !== L && x.g < pg).length + 1;
  console.log(`${label.padEnd(44)} geo ${pg.toFixed(3)}  rank ~${rank}`);
};
console.log(
  '\nprojection for lithent 1.25.3+ (local node-shape changes applied):'
);
const ns = [-3.17, -9.19, -10.15, -25.34, -6.23, -0.52, -3.09, -3.36, -3.09];
proj(ns, 'all nine items');
proj(
  ns.map((c, k) => (k === 3 ? 0 : c)),
  'select unchanged (vsync caution)'
);
proj(
  ns.map((c, k) => (k === 3 ? 0 : c / 2)),
  'half the gains, select unchanged'
);
for (const [l, re] of [
  ['preact-classes', /^preact-classes-/],
  ['vue', /^vue-v/],
]) {
  const fi = find(re);
  console.log(
    `  ref ${l.padEnd(16)} geo ${geo(fi).toFixed(3)} rank ${ranked.findIndex(x => x.fi === fi) + 1}`
  );
}

console.log(
  '\nprojection: 1.25.3 + C4 P2 per-item changes (local, compounded):'
);
const c4 = [-0.25, 0.79, -14.93, -26.72, 3.08, 2.92, -0.18, 1.25, -5.17];
const comb = (a, b) =>
  a.map((x, k) => ((1 + x / 100) * (1 + b[k] / 100) - 1) * 100);
proj(comb(ns, c4), '1.25.3 + C4 (all items)');
proj(
  comb(
    ns.map((c, k) => (k === 3 ? 0 : c)),
    c4.map((c, k) => (k === 3 ? 0 : c))
  ),
  '1.25.3 + C4, select unchanged'
);

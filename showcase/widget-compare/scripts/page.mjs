/**
 * Writes the comparison page in English (dist/index.html) and Korean
 * (dist/index.ko.html) from dist/sizes.json and results.json
 * (docs/widget-compare/DESIGN.md DC-10). build.mjs calls it; after a new
 * measurement, `pnpm --filter lithent-widget-compare page` rewrites the page
 * without rebuilding.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dist, frameworks, root } from './frameworks.mjs';

const repo = 'https://github.com/superlucky84/lithent';
const source = path => `${repo}/blob/main/${path}`;

const escape = value =>
  String(value).replace(
    /[&<>"']/g,
    char =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]
  );
const kb = bytes => `${(bytes / 1024).toFixed(2)} KB`;
const ms = value => `${Math.round(value)} ms`;
const ratio = (value, base) => `${(value / base).toFixed(2)}×`;

const copy = {
  en: {
    lang: 'en',
    file: 'index.html',
    other: { href: './index.ko.html', label: '한국어' },
    title: 'Same widget, four frameworks',
    lede: `The feedback card that <code>npx create-lithent my-widget --template widget</code> creates, built four times: with lithent, React, Preact and Lit. Each build is one <code>&lt;script&gt;</code> file, framework included, that any page can load. Same features, same stylesheet, same build settings, and one browser test runs the same steps on all four.`,
    sizeTitle: 'Bundle size',
    sizeNote: `One minified IIFE per version, built by Vite with the same target and production mode. React and Preact also carry a small hand-written Custom Element wrapper (<a href="${source('showcase/widget-compare/src/shared/define-element.ts')}">source</a>), the job lithent/element and LitElement do in the other two.`,
    version: 'Version',
    packages: 'Packages',
    raw: 'Minified',
    gzip: 'gzip',
    brotli: 'brotli',
    vsLithent: 'brotli vs lithent',
    globals: 'Adds to window',
    none: 'nothing',
    loadTitle: 'Load time',
    loadNote: count =>
      `<strong>Shown</strong>: from navigation start until the widget's question is in its shadow root. <strong>Script</strong>: the part after <code>widget.js</code> finished downloading (parse, run and first render). Median of ${count} loads per version and profile, each in a new browser context with an empty cache; the bar spans the 25th to 75th percentile.`,
    profile: {
      mobile: 'Mobile: CPU 4× slower, 150 ms round trip, 1.6 Mbps',
      desktop: 'Desktop: no throttling',
    },
    shown: 'Shown',
    spread: 'Middle half',
    script: 'Script',
    transfer: 'Transferred',
    measured: r =>
      `Measured ${escape(r.measuredAt.slice(0, 10))} in ${escape(r.environment.browser)} on ${escape(r.environment.cpu)}, ${escape(r.environment.os)}, commit <a href="${repo}/commit/${escape(r.commit)}"><code>${escape(r.commit.slice(0, 7))}</code></a>${r.dirty ? ' with local changes' : ''}.`,
    stale: names =>
      `The ${names} bundles changed after this measurement, so these times are for the earlier builds. The size table is always the current build.`,
    notMeasured:
      'Load times have not been measured yet. Run the measurement below.',
    tryTitle: 'Try them',
    tryNote:
      'Each frame is the template’s demo page, a stand-in for a customer’s website, loading one of the four bundles. Rate, send, reject a send, switch the page, the labels or the theme: all four answer the same way.',
    open: 'Open alone',
    code: 'Source',
    methodTitle: 'How this was made',
    method: [
      `<strong>The same widget.</strong> The lithent build is the template’s own source (<a href="${source('createLithent/widget/src/FeedbackWidget.tsx')}">FeedbackWidget.tsx</a>). The other three are written the way each framework is usually written: function components with hooks for React and Preact, a <code>LitElement</code> for Lit. All four use the template’s stylesheet and props declaration. <a href="${source('e2e/widget-compare.spec.ts')}">e2e/widget-compare.spec.ts</a> runs the same steps on each in Chromium, Firefox and WebKit on every pull request: attributes, an Object property, events, a cancelled submit, slots, <code>::part</code>, CSS variables and a strict Content-Security-Policy.`,
      `<strong>The same build.</strong> <a href="${source('showcase/widget-compare/scripts/build.mjs')}">scripts/build.mjs</a> builds all four with one Vite configuration: library mode, one IIFE, target <code>es2020</code> / Safari 14, <code>NODE_ENV=production</code>. Only the JSX import source differs.`,
      `<strong>The same load.</strong> <a href="${source('showcase/widget-compare/scripts/measure.mjs')}">scripts/measure.mjs</a> serves the files brotli-compressed, as a CDN would, and loads each version’s page in Chromium. The mobile profile uses Lighthouse’s mobile defaults through DevTools throttling. Rounds rotate the order of the four versions.`,
    ],
    limitsTitle: 'What this does not show',
    limits: [
      'One small widget. It says nothing about rendering large apps or about developer experience.',
      'Lab times from one machine. Compare the versions with each other rather than reading the numbers as what your visitors will see.',
      'Other Custom Element wrappers for React or Preact would change their sizes.',
      'A page that already runs React or Preact could share its runtime with a widget built for it. This compares widgets that bring everything they need, for pages you do not control.',
    ],
    rerun: 'Reproduce',
    footer: `Part of <a href="${repo}">lithent</a>. Design notes: <a href="${repo}/tree/main/docs/widget-compare">docs/widget-compare</a>.`,
  },
  ko: {
    lang: 'ko',
    file: 'index.ko.html',
    other: { href: './index.html', label: 'English' },
    title: '같은 위젯, 네 프레임워크',
    lede: `<code>npx create-lithent my-widget --template widget</code>이 만드는 피드백 카드를 lithent, React, Preact, Lit으로 네 번 만들었습니다. 빌드마다 프레임워크가 들어 있는 <code>&lt;script&gt;</code> 파일 하나이고, 어떤 페이지든 불러 쓸 수 있습니다. 기능·스타일시트·빌드 설정이 같고, 같은 브라우저 테스트가 네 빌드에 똑같은 단계를 돌립니다.`,
    sizeTitle: '번들 크기',
    sizeNote: `버전마다 minify된 IIFE 하나입니다. Vite가 같은 target과 production 모드로 빌드했습니다. React와 Preact에는 직접 쓴 작은 커스텀 엘리먼트 래퍼(<a href="${source('showcase/widget-compare/src/shared/define-element.ts')}">소스</a>)가 함께 들어 있습니다. 다른 두 빌드에서는 lithent/element와 LitElement가 그 일을 합니다.`,
    version: '버전',
    packages: '패키지',
    raw: 'minify',
    gzip: 'gzip',
    brotli: 'brotli',
    vsLithent: 'brotli, lithent 대비',
    globals: 'window에 남기는 것',
    none: '없음',
    loadTitle: '로딩 시간',
    loadNote: count =>
      `<strong>표시</strong>: 내비게이션 시작부터 위젯의 질문 문구가 shadow root에 들어갈 때까지. <strong>스크립트</strong>: <code>widget.js</code> 내려받기가 끝난 뒤의 시간(파싱, 실행, 첫 렌더). 버전·프로필마다 ${count}번 불러온 중앙값이고, 매번 캐시가 빈 새 브라우저 컨텍스트입니다. 막대는 25~75 백분위 범위입니다.`,
    profile: {
      mobile: '모바일: CPU 4배 느리게, 왕복 150ms, 1.6Mbps',
      desktop: '데스크톱: 제한 없음',
    },
    shown: '표시',
    spread: '중간 50%',
    script: '스크립트',
    transfer: '전송량',
    measured: r =>
      `${escape(r.measuredAt.slice(0, 10))} 측정, ${escape(r.environment.browser)}, ${escape(r.environment.cpu)}, ${escape(r.environment.os)}, 커밋 <a href="${repo}/commit/${escape(r.commit)}"><code>${escape(r.commit.slice(0, 7))}</code></a>${r.dirty ? ' (로컬 변경 포함)' : ''}.`,
    stale: names =>
      `측정 뒤 ${names} 번들이 바뀌어, 이 시간은 이전 빌드의 값입니다. 크기 표는 항상 현재 빌드입니다.`,
    notMeasured: '아직 로딩 시간을 재지 않았습니다. 아래 명령으로 측정하세요.',
    tryTitle: '직접 써 보기',
    tryNote:
      '각 프레임은 템플릿의 데모 페이지(고객사 웹사이트 역할)이고, 네 번들 중 하나를 불러옵니다. 별점, 보내기, 보내기 거절, 페이지·문구·테마 바꾸기를 해 보세요. 네 위젯이 똑같이 반응합니다.',
    open: '따로 열기',
    code: '소스',
    methodTitle: '만든 방법',
    method: [
      `<strong>같은 위젯.</strong> lithent 빌드는 템플릿 소스 그대로입니다(<a href="${source('createLithent/widget/src/FeedbackWidget.tsx')}">FeedbackWidget.tsx</a>). 나머지 셋은 각 프레임워크에서 보통 쓰는 방식으로 썼습니다. React·Preact는 hooks를 쓰는 함수 컴포넌트, Lit은 <code>LitElement</code>입니다. 네 빌드 모두 템플릿의 스타일시트와 props 선언을 씁니다. <a href="${source('e2e/widget-compare.spec.ts')}">e2e/widget-compare.spec.ts</a>가 모든 PR에서 Chromium·Firefox·WebKit으로 네 빌드에 같은 단계를 돌립니다. 속성, Object 프로퍼티, 이벤트, 취소한 보내기, slot, <code>::part</code>, CSS 변수, 엄격한 Content-Security-Policy를 확인합니다.`,
      `<strong>같은 빌드.</strong> <a href="${source('showcase/widget-compare/scripts/build.mjs')}">scripts/build.mjs</a>가 Vite 설정 하나로 네 빌드를 만듭니다. 라이브러리 모드, IIFE 하나, target <code>es2020</code> / Safari 14, <code>NODE_ENV=production</code>. 다른 것은 JSX import source뿐입니다.`,
      `<strong>같은 로딩.</strong> <a href="${source('showcase/widget-compare/scripts/measure.mjs')}">scripts/measure.mjs</a>가 CDN처럼 brotli로 압축해 보내고, Chromium에서 각 버전의 페이지를 불러옵니다. 모바일 프로필은 Lighthouse 모바일 기본값을 DevTools 제한으로 적용합니다. 바퀴마다 네 버전의 순서를 돌립니다.`,
    ],
    limitsTitle: '이 비교가 보여 주지 않는 것',
    limits: [
      '작은 위젯 하나의 비교입니다. 큰 앱의 렌더 성능이나 개발 경험은 다루지 않습니다.',
      '한 기계의 실험실 측정입니다. 방문자가 겪을 값이 아니라, 같은 조건에서 버전끼리의 차이로 읽어 주세요.',
      'React·Preact에 다른 커스텀 엘리먼트 래퍼를 쓰면 크기가 달라집니다.',
      '이미 React나 Preact를 쓰는 페이지라면 그 런타임을 위젯과 나눠 쓸 수 있습니다. 이 비교는 내가 관리하지 않는 페이지에 들어가는, 필요한 것을 모두 가지고 다니는 위젯을 가정합니다.',
    ],
    rerun: '재현',
    footer: `<a href="${repo}">lithent</a>의 일부입니다. 설계 문서: <a href="${repo}/tree/main/docs/widget-compare">docs/widget-compare</a>.`,
  },
};

const styles = `
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --surface: #f6f7f9;
  --text: #16181d;
  --muted: #5b616e;
  --border: #e2e5ea;
  --accent: #2f6fdf;
  --bar: #9db6e8;
  --bar-lithent: #2f6fdf;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg: #111318;
    --surface: #1a1d24;
    --text: #e8eaee;
    --muted: #a0a6b2;
    --border: #2c313b;
    --accent: #7ea6f2;
    --bar: #3f5784;
    --bar-lithent: #7ea6f2;
  }
}
:root[data-theme='dark'] {
  --bg: #111318;
  --surface: #1a1d24;
  --text: #e8eaee;
  --muted: #a0a6b2;
  --border: #2c313b;
  --accent: #7ea6f2;
  --bar: #3f5784;
  --bar-lithent: #7ea6f2;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.6 system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', sans-serif;
}
main { max-width: 1040px; margin: 0 auto; padding: 40px 16px 64px; }
a { color: var(--accent); }
code { font: 0.9em ui-monospace, Menlo, Consolas, monospace; }
header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; align-items: baseline; }
h1 { margin: 0; font-size: 2rem; line-height: 1.2; }
h2 { margin: 48px 0 8px; font-size: 1.35rem; }
h3 { margin: 24px 0 8px; font-size: 1rem; }
.lede { max-width: 760px; font-size: 1.05rem; }
.note { max-width: 760px; color: var(--muted); font-size: 0.95rem; }
.scroll { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { padding: 10px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--border); }
th:first-child, td:first-child { text-align: left; }
tbody tr:last-child td { border-bottom: 0; }
th { font-size: 0.85rem; font-weight: 600; color: var(--muted); background: var(--surface); }
td.bar { width: 40%; min-width: 160px; }
.track { position: relative; height: 10px; border-radius: 5px; background: var(--surface); }
.fill { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 5px; background: var(--bar); }
tr.lithent .fill { background: var(--bar-lithent); }
.range { position: absolute; top: 0; bottom: 0; border-radius: 5px; background: var(--bar); }
tr.lithent .range { background: var(--bar-lithent); }
.name { font-weight: 600; }
.small { color: var(--muted); font-size: 0.85rem; }
.wrap { white-space: normal; text-align: left; }
.notice { max-width: 760px; padding: 10px 14px; border-left: 3px solid var(--accent); background: var(--surface); }
.demos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 16px; }
figure { margin: 0; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
figcaption { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; padding: 10px 12px; background: var(--surface); border-bottom: 1px solid var(--border); }
iframe { display: block; width: 100%; height: 560px; border: 0; background: #f8fafc; }
ul { padding-left: 20px; max-width: 760px; }
li { margin: 6px 0; }
pre { overflow-x: auto; padding: 12px 14px; border-radius: 10px; background: var(--surface); }
footer { margin-top: 56px; color: var(--muted); font-size: 0.9rem; }
/* Phones: keep the compared numbers, drop the secondary columns. */
@media (max-width: 640px) {
  .opt { display: none; }
  td.bar { min-width: 96px; }
  th, td { padding: 8px; }
  iframe { height: 480px; }
}
`;

const sizeTable = (t, sizes, results) => {
  const max = Math.max(...frameworks.map(({ id }) => sizes[id].brotli));
  const base = sizes.lithent.brotli;
  const rows = frameworks.map(({ id, label }) => {
    const size = sizes[id];
    const globals = results?.frameworks[id]?.globals;
    const packages = Object.entries(size.packages)
      .map(([name, version]) => `${escape(name)} ${escape(version)}`)
      .join(', ');
    return `<tr class="${id}">
      <td><span class="name">${escape(label)}</span><br /><span class="small">${packages}</span></td>
      <td class="opt">${kb(size.raw)}</td>
      <td class="opt">${kb(size.gzip)}</td>
      <td><strong>${kb(size.brotli)}</strong></td>
      <td class="bar"><div class="track"><div class="fill" style="width:${((size.brotli / max) * 100).toFixed(1)}%"></div></div></td>
      <td>${ratio(size.brotli, base)}</td>
      ${globals ? `<td class="wrap small">${globals.length ? globals.map(key => `<code>${escape(key)}</code>`).join(' ') : t.none}</td>` : ''}
    </tr>`;
  });
  return `<div class="scroll"><table>
    <thead><tr><th>${t.version}</th><th class="opt">${t.raw}</th><th class="opt">${t.gzip}</th><th>${t.brotli}</th><th></th><th>${t.vsLithent}</th>${results ? `<th class="wrap">${t.globals}</th>` : ''}</tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
};

const loadTable = (t, results, profile) => {
  const rows = frameworks.map(
    ({ id }) => results.frameworks[id].profiles[profile]
  );
  const max = Math.max(...rows.map(row => row.shown.p75));
  const at = value => ((value / max) * 100).toFixed(1);
  return `<div class="scroll"><table>
    <thead><tr><th>${t.version}</th><th>${t.shown}</th><th class="bar">${t.spread}</th><th>${t.script}</th><th class="opt">${t.transfer}</th></tr></thead>
    <tbody>${frameworks
      .map(({ id, label }, index) => {
        const { shown, execute, transfer } = rows[index];
        return `<tr class="${id}">
          <td class="name">${escape(label)}</td>
          <td><strong>${ms(shown.median)}</strong></td>
          <td class="bar"><div class="track"><div class="range" style="left:${at(shown.p25)}%;width:${Math.max(Number(at(shown.p75)) - Number(at(shown.p25)), 1).toFixed(1)}%"></div></div><span class="small">${ms(shown.p25)} – ${ms(shown.p75)}</span></td>
          <td>${ms(execute.median)}</td>
          <td class="opt">${kb(transfer)}</td>
        </tr>`;
      })
      .join('')}</tbody>
  </table></div>`;
};

const loadSection = (t, sizes, results) => {
  if (!results) return `<p class="notice">${t.notMeasured}</p>`;
  const changed = frameworks
    .filter(
      ({ id }) => results.frameworks[id]?.bundle.sha256 !== sizes[id].sha256
    )
    .map(({ label }) => label);
  return `<p class="note">${t.loadNote(results.method.runs)}</p>
    ${changed.length ? `<p class="notice">${t.stale(escape(changed.join(', ')))}</p>` : ''}
    ${Object.keys(results.method.profiles)
      .map(
        profile =>
          `<h3>${t.profile[profile]}</h3>${loadTable(t, results, profile)}`
      )
      .join('')}
    <p class="note">${t.measured(results)}</p>`;
};

const demos = t =>
  `<div class="demos">${frameworks
    .map(
      ({ id, label, sources }) => `<figure>
        <figcaption><span class="name">${escape(label)}</span>
          <a href="./${id}/index.html">${t.open}</a>
          <a href="${source(sources[1] ?? sources[0])}">${t.code}</a>
        </figcaption>
        <iframe src="./${id}/index.html" title="${escape(label)}" loading="lazy"></iframe>
      </figure>`
    )
    .join('')}</div>`;

const render = (t, sizes, results) => `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${t.title} · lithent</title>
<meta name="description" content="${escape(t.title)}: lithent, React, Preact, Lit" />
<style>${styles}</style>
</head>
<body>
<main>
  <header><h1>${t.title}</h1><a href="${t.other.href}" hreflang="${t.lang === 'en' ? 'ko' : 'en'}">${t.other.label}</a></header>
  <p class="lede">${t.lede}</p>

  <h2>${t.sizeTitle}</h2>
  <p class="note">${t.sizeNote}</p>
  ${sizeTable(t, sizes, results)}

  <h2>${t.loadTitle}</h2>
  ${loadSection(t, sizes, results)}

  <h2>${t.tryTitle}</h2>
  <p class="note">${t.tryNote}</p>
  ${demos(t)}

  <h2>${t.methodTitle}</h2>
  <ul>${t.method.map(item => `<li>${item}</li>`).join('')}</ul>
  <h3>${t.limitsTitle}</h3>
  <ul>${t.limits.map(item => `<li>${item}</li>`).join('')}</ul>
  <h3>${t.rerun}</h3>
  <pre><code>pnpm install
pnpm build
pnpm --filter lithent-widget-compare measure
pnpm --filter lithent-widget-compare page</code></pre>

  <footer>${t.footer}</footer>
</main>
</body>
</html>
`;

export const writePage = sizes => {
  const file = resolve(root, 'results.json');
  const results = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf8'))
    : null;
  for (const t of Object.values(copy))
    writeFileSync(resolve(dist, t.file), render(t, sizes, results));
};

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  writePage(JSON.parse(readFileSync(resolve(dist, 'sizes.json'), 'utf8')));

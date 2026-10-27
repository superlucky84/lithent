import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const data = read(path.join(out, 'final-candidate-results.json'));
const audit = read(path.join(out, 'final-candidate-audit.json'));
assert(audit.pass);
const retention = read(path.join(out, 'retention.json'));
const disposal = read(path.join(out, 'dispose-results.json'));
assert(retention.complete && disposal.complete);
for (const [file, expected] of Object.entries(
  read(path.join(out, 'measurement-plan.json')).sourceFiles
))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, file);
const compiled = Object.fromEntries(
  ['baseline', 'candidate'].map(name => [
    name,
    read(path.join(out, name, 'build.json')),
  ])
);
for (const [file, item] of Object.entries(compiled.baseline.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(root, 'dist', file))),
    item.sha256,
    file
  );
const probe = read(path.join(out, 'formats.json'));
for (const [format, item] of Object.entries(probe.concurrent))
  assert.equal(
    hash(
      fs.readFileSync(
        path.join(root, 'lithentConcurrent/dist/lithentConcurrent.' + format)
      )
    ),
    item.sha256
  );
const browser = read(path.join(out, 'browser-checks/report.json'));
assert.equal(browser.stats.expected, 78);
assert.equal(
  browser.stats.unexpected + browser.stats.flaky + browser.stats.skipped,
  0
);
const records = [];
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value.results)) records.push(...value.results);
  for (const [key, child] of Object.entries(value))
    if (key !== 'results') collect(child);
}
collect(browser);
assert(records.every(result => result.retry === 0));
const defaultBrowser = read(path.join(out, 'default-browser/report.json'));
assert.equal(defaultBrowser.stats.expected, 78);
assert.equal(
  defaultBrowser.stats.unexpected +
    defaultBrowser.stats.flaky +
    defaultBrowser.stats.skipped,
  0
);
records.length = 0;
collect(defaultBrowser);
assert.equal(records.length, 78);
assert(records.every(result => result.retry === 0));
const defaultValidation = {
  pass: true,
  stats: defaultBrowser.stats,
  retries: 0,
  command: read(path.join(out, 'default-browser/command.json')),
  scope:
    'Final unchanged default base/concurrent with original e2e server and the same fixed Chrome.',
};
const defaultValidationFile = path.join(out, 'default-browser/validation.json');
if (!fs.existsSync(defaultValidationFile))
  write(defaultValidationFile, defaultValidation);
else assert.deepEqual(read(defaultValidationFile), defaultValidation);
fs.copyFileSync(
  defaultValidationFile,
  path.join(
    root,
    'docs/benchmark/dc25-keyed-fast-path-default-browser-validation.json'
  )
);
const executions = label => {
  const file = fs
    .readdirSync(path.join(out, 'commands'))
    .find(name => name.startsWith(label + '-') && name.endsWith('.log'));
  assert(file, label);
  const text = fs.readFileSync(path.join(out, 'commands', file), 'utf8');
  return [...text.matchAll(/^\s+Tests\s+(\d+) passed/gm)].reduce(
    (sum, item) => sum + Number(item[1]),
    0
  );
};
const counts = {
  initialDual: executions('baseline-dual'),
  defaultTests: executions('final-default-tests'),
  ssr: executions('final-base-ssr'),
  concurrentSatellites: executions('final-concurrent-satellites'),
  candidateCore: executions('candidate-core'),
  candidateFinalContracts: executions('candidate-final-contracts'),
  candidateConcurrent: executions('candidate-concurrent-core'),
  candidatePackages: executions('candidate-packages'),
};
assert.deepEqual(counts, {
  initialDual: 1150,
  defaultTests: 1008,
  ssr: 15,
  concurrentSatellites: 172,
  candidateCore: 259,
  candidateFinalContracts: 10,
  candidateConcurrent: 347,
  candidatePackages: 169,
});
let failed = 0,
  warnings = 0;
for (const order of ['main', 'reverse'])
  for (const mode of ['cpu', 'mem']) {
    const run = read(
      path.join(out, `official-${order}/production-${mode}.json`)
    );
    assert(run.complete);
    failed += run.failedBatches?.length || 0;
    warnings += run.samples.reduce(
      (sum, sample) => sum + (sample.warnings?.length || 0),
      0
    );
  }
assert.equal(failed + warnings, 0);
const validation = {
  head: initial.head,
  branch: initial.branch,
  decision: 'defer; retain released main runtime and existing guards',
  counts,
  browser: browser.stats,
  retries: 0,
  officialFailedBatches: failed,
  officialWarnings: warnings,
  audit,
  retentionContexts: retention.samples.length,
  disposalContexts: disposal.samples.length,
  defaultSourcesUnchanged: Object.keys(initial.files).length,
  defaultBundlesMatchFrozenBaseline: true,
  concurrentBundlesUnchanged: true,
  formatProbes: 9,
  candidateExportsMatchBaseline: true,
  table: read(path.join(out, 'table-inspection.json')),
  preservation:
    'See separate evidence manifest and independent decoded archive audit.',
};
const validationFile = path.join(out, 'validation.json');
if (!fs.existsSync(validationFile)) write(validationFile, validation);
else assert.deepEqual(read(validationFile), validation);
fs.copyFileSync(
  validationFile,
  path.join(root, 'docs/benchmark/dc25-keyed-fast-path-validation.json')
);
const report = path.join(
  root,
  'docs/benchmark/DC25_KEYED_FAST_PATH_RESULTS.md'
);
const notes = path.join(out, 'preparation-notes.md');
if (!fs.existsSync(notes)) {
  const before = fs.readFileSync(report, 'utf8');
  const start = before.indexOf('## 관찰된 한계와 준비 실패');
  const end = before.indexOf('## 다음 단계와 인계');
  assert(start >= 0 && end > start);
  fs.writeFileSync(
    notes,
    before.slice(start, end) +
      '- 첫 공통 DOM 계약 adapter는 격리 디렉터리에서 @playwright/test를 찾지 못했다. 패키지 해석용 node_modules 링크를 추가한 별도 v2 실행에서 6앱 DOM 계약을 통과했으며 실패 driver/log를 보존했다.\n',
    { flag: 'wx' }
  );
}
const pct = ratio =>
  (ratio >= 1 ? '+' : '−') + Math.abs((ratio - 1) * 100).toFixed(3) + '%';
const median = values => {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};
const cpuRows = data.rows.pooled
  .map((row, index) => {
    const b = row.conditions.baseline,
      c = row.conditions.candidate,
      goal = data.goal.pooled[index];
    return `| ${row.id} | ${b.total.median.toFixed(4)} | ${c.total.median.toFixed(4)} | ${pct(c.total.median / b.total.median)} | ${pct(c.script.median / b.script.median)} | ${goal.baselineRatio.toFixed(4)} | ${goal.ratio.toFixed(4)} |`;
  })
  .join('\n');
const orders = ['main', 'reverse', 'pooled']
  .map(order => {
    const value = data.ratios[order]['candidate/baseline'].weighted;
    const goal = data.goal[order];
    return `| ${order} | ${pct(value.total)} | ${pct(value.script)} | ${goal.filter(item => item.baselineRatio <= 1.1).length}/9 | ${goal.filter(item => item.pass).length}/9 |`;
  })
  .join('\n');
const memories = data.memory.pooled
  .map(row => {
    const b = row.conditions.baseline.median,
      c = row.conditions.candidate.median;
    return `| ${row.id} | ${b.toFixed(6)} | ${c.toFixed(6)} | ${pct(c / b)} |`;
  })
  .join('\n');
const ret = ['baseline', 'candidate']
  .map(name => {
    const samples = retention.samples.filter(sample => sample.name === name);
    return `| ${name} | ${samples.length} | ${median(samples.map(sample => sample.checkpoints.at(-1).jsHeapMB)).toFixed(6)} | ${median(samples.map(sample => sample.updateCheckpoints.at(-1).jsHeapMB)).toFixed(6)} | 0 / 0 |`;
  })
  .join('\n');
const manifestFile = path.join(
  root,
  'docs/benchmark/dc25-keyed-fast-path-evidence-manifest.json'
);
const archiveAudit = path.join(
  root,
  'docs/benchmark/dc25-keyed-fast-path-archive-audit.json'
);
const closeoutManifest = path.join(
  root,
  'docs/benchmark/dc25-keyed-fast-path-closeout-manifest.json'
);
const closeoutAudit = path.join(
  root,
  'docs/benchmark/dc25-keyed-fast-path-closeout-audit.json'
);
const archived =
  fs.existsSync(manifestFile) &&
  fs.existsSync(archiveAudit) &&
  fs.existsSync(closeoutManifest) &&
  fs.existsSync(closeoutAudit);
let preserved =
  '실행 원자료는 `/private/tmp/lithent-dc25-20261027`에 동결되어 있다. bounded archive와 독립 decoded-member 감사는 진행 중이다.';
if (archived) {
  const manifest = read(manifestFile),
    checked = read(archiveAudit);
  assert(checked.pass);
  preserved = `[영구 manifest](./dc25-keyed-fast-path-evidence-manifest.json)의 archive ${manifest.parts.length}개/${manifest.entries.length} entries, 압축 ${checked.compressedBytes.toLocaleString('en-US')}B를 보존했다. [독립 압축/decoded-member 감사](./dc25-keyed-fast-path-archive-audit.json)가 모든 archive/member 해시를 확인했다. node_modules·npm cache는 제외하고 고정 lock/설치 inventory·production/diagnostic 코드·원자료/trace·실패·driver를 포함한다. 최종 Markdown 보고서는 frozen 실행 입력과 별도로 관리한다.`;
  const extra = read(closeoutManifest),
    extraAudit = read(closeoutAudit);
  assert(extraAudit.pass);
  preserved += ` 최종 default 브라우저 검증은 [closeout manifest](./dc25-keyed-fast-path-closeout-manifest.json)의 별도 archive ${extra.parts.length}개/${extra.entries.length} entries(${extraAudit.compressedBytes.toLocaleString('en-US')}B)와 [decoded 감사](./dc25-keyed-fast-path-closeout-audit.json)로 보존했다. 최초 13개 archive는 덮어쓰지 않았다.`;
}
fs.writeFileSync(
  report,
  `# DC-25 — same-order keyed fast path

2026-10-27. **첫 결합 후보의 구현·측정·회귀·통합 검증을 완료했고 기본 채택은 보류했다. ${archived ? '영구 증거 보존과 감사도 완료했다.' : '영구 증거 보존 중이다.'}** 기본 runtime/guard는 main 그대로다.

정본은 [요구사항](../performance-improvement/REQUIREMENTS.md#dc-25--같은-순서-keyed-빠른-경로) → [설계](../performance-improvement/DESIGN.md#dc-25--같은-순서-keyed-빠른-경로) → [실행 계획](../performance-improvement/IMPLEMENT.md#dc-25--실행-계획) → [M-20](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-20-dc-25-같은-순서-keyed-빠른-경로--r72r79)다. [인터랙티브 6앱 표](./dc25-keyed-fast-path-table.html)는 양순서/pooled·전체/JS/paint/공식 메모리와 네 peer를 모두 표시한다. [전체 통계](./dc25-keyed-fast-path-final-results.json), [검증](./dc25-keyed-fast-path-validation.json), [실측 후보 패치](./dc25-keyed-fast-path-candidate.patch)를 연결한다.

## 판단

가중 전체 시간은 pooled **${pct(data.ratios.pooled['candidate/baseline'].weighted.total)}**, JS는 ${pct(data.ratios.pooled['candidate/baseline'].weighted.script)}다. 전체는 main에서 +0.402%, reverse에서 −1.260%로 방향이 다르다. partial/select JS 감소는 관찰했지만 select 전체 pooled는 +2.775%였고, 고정 네 peer 목표는 **baseline/candidate 모두 8/9**다. 따라서 안정적인 전체 이득이나 목표 개선을 입증하지 못했다. 개별 회귀 하나 때문에 기각한 것이 아니며, size +268B와 추가 경로 복잡성을 정당화할 근거가 부족하다.

기존 base guard **4,824B**, 실제 UMD **4,819B**, compact13·native 이벤트·1.25.3 portal 수정/출력 정책을 유지한다. allowance를 늘리거나 candidate source를 기본 runtime에 복사하지 않았다. 과거 6/9가 이번 8/9로 바뀐 것을 DC-25의 성과로 설명하지 않는다. 이번 baseline도 8/9이며 browser/toolchain/peer rebuild가 다른 과거 표본과 합산하지 않았다.

## 고정 입력과 수집

- 브랜치 \`perf/dc25-keyed-fast-path\`, main \`${initial.head}\`, 배포 태그 \`lithent@1.25.3\`(\`7842b57cf400834ce65ecad703bd4babb6c9249c\`). 기본 runtime/설정 28개·실제 세 base bundle·concurrent bundle, sibling의 실험 앱/입력은 보존했다.
- Node 24.22.1·pnpm 12.15.0·현재 lock, Chrome156.0.8078.48/V8 15.6.75.19와 binary/engine hash를 고정했다. React hooks19.2.0/classes19.0.0, Preact hooks/classes11.0.0을 보존 source/lock과 새 설치 의존성으로 현재 Node에서 다시 빌드했다. React 버전 차이와 hooks/classes 효과를 분리한 비교는 아니다.
- 같은 여섯 production 앱으로 CPU **1,740개**, 공식 메모리 **180개**를 양순서 수집했다. baseline/candidate 580/60은 사전에 선언한 동일 수집의 부분집합이며 별도·역사 표본이 아니다. official 실패/재시도 0, CPU warnings 0이다. 준비 실패는 아래에 분리했다.
- CPU UTC05:51~06:37, 메모리 UTC06:37~07:15. 수집 중 build/test/profile/다른 benchmark를 병행하지 않았다. 실제 환경은 비격리 머신이므로 작은 차이를 유의성·일반 성능 보장으로 표현하지 않는다.
- 독립 Python 감사: **576분포·45가중값·405비율**, 표본/양순서/해시/9항목 목표 검증 통과(tolerance 1e−12). 색상은 표시한 6앱 최저, CPU 목표는 고정 4peer 최저로 별도 계산했다. 표의 12모드·576숫자/색상·81목표 셀은 JSDOM에서 확인했으며 Chrome 시각 검사는 아니다.

## CPU

전체/JS/paint 중앙값은 각각 계산하며 서로 합산하지 않는다. 음수 변화가 빠른 방향이다. 각 CPU 항목은 조건별 pooled N=30, select N=50이다.

| 순서 | 가중 전체 K/B | 가중 JS K/B | baseline 목표 | candidate 목표 |
| --- | ---: | ---: | ---: | ---: |
${orders}

| 항목 | B 전체 ms | K 전체 ms | 전체 변화 | JS 변화 | B/최저 peer | K/최저 peer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${cpuRows}

pooled 미달 항목은 select이며 K/최저 peer=1.4094다. main/reverse는 서로 다른 pass 수와 변화 방향을 보인다. HTML/JSON의 각 차수·IQR·range를 함께 읽고 pooled 작은 차이만으로 채택하지 않는다. 프로파일링으로 원인을 새로 귀속한 결과는 아니다.

## 메모리와 수명

공식 메모리는 각 조건/항목 pooled N=6이다. 별도 CDP JS heap과 같은 지표가 아니며 CPU의 1.10 한도를 메모리에 적용하지 않는다. 10k는 28.164620→28.164690MB로 사실상 같은 관찰 범위다.

| 항목 | B MB | K MB | 변화 |
| --- | ---: | ---: | ---: |
${memories}

별도 조건별 3 fresh contexts에서 100회 생성/삭제와 100회 partial을 수행했다. 마지막 post-GC JS heap의 차수 중앙값은 아래와 같다. 두 조건 모두 처음보다 heap이 증가했으며 증가 원인을 전부 귀속하지 않았다. 검사한 DOM/listener 수가 돌아왔다는 사실을 전체 JS heap 누수 부재로 확대하지 않는다.

| 조건 | contexts | 100회 clear 후 JS heap MB | 100회 partial 후 JS heap MB | DOM/listener 증가 |
| --- | ---: | ---: | ---: | ---: |
${ret}

별도 disposer 진단은 실제 partial 2회 후 1,000행을 가진 root를 삭제했다. 각 조건×3 contexts의 DOM WeakRef 8,022개는 앱 전역 store/cache를 유지하면 남고, 그 앱 상태를 해제하면 **모두 0개**가 됐다. 외부 형제와 empty DOM/listener 수는 보존했다. 이는 dispose/release export를 추가한 진단 앱이며 공식 성능 번들이 아니다.

## 구현·작업량·번들

원본 key의 기존 읽기 순서를 snapshot/Set으로 보존하고, dense·고유 key·동일 길이에서 위치를 대조했다. 중간 mismatch는 아직 소비하지 않은 snapshot의 Map으로 이어가 prefix diff/콜백을 재실행하지 않는다. 중복·혼합·길이 차이는 일반 매칭이다. 증명은 list의 희소 \`so/sc\`와 노드 참조가 없는 ready/invalid root frame으로 전달하고 props 처리 전 소비·이후 배열 재검증·throw/reentry/finally 무효화·clone 제외를 적용했다. common factory와 concurrent 실행 코드는 유지했다.

JSDOM 11동작에서 key 읽기·content 방문·cleanup 횟수는 기준과 같다. select/select-next/partial의 Map 생성/get/delete, 미사용 자식 filter 1,000방문, render 4배열과 인덱스 재분석을 생략했다. 대신 snapshot 1,000쓰기·Set 생성/has/add·root frame 비용이 생기며 fallback에는 Set/snapshot 다음 Map도 필요하다. O(n) 목록 방문과 used 배열은 남는다. 이 계수는 시간·바이트 이득이 아니다.

| base UMD | raw | gzip level9 | Brotli | 현행 guard |
| --- | ---: | ---: | ---: | --- |
| B | 12,746 | 5,207 | 4,819 | 5B 여유 |
| K | 13,500 | 5,498 | 5,087 | 263B 초과, B 대비 +268B |

B ESM/UMD/CJS는 \`6665eac4…\`/\`1501e239…\`/\`8a22f1e4…\`, K는 \`49c999b6…\`/\`dff07e1c…\`/\`b7912dde…\`다. 세 K 산출물과 측정 앱을 해시로 고정했다. 출력 옵션·source map 연결·guard는 바꾸지 않았다.

## 회귀와 통합

- P1 전체 build·strict base/concurrent/e2e types·baseline literal test:dual 1,150/기존3 skipped. 이 시점 새 회귀는 4개였고 이후 최종 공통 6개를 별도로 확인했다.
- 후보 frozen core 259(마지막 getter 사례 전), 최종 공통6+수명4 별도 통과. shared 모듈을 연결한 unchanged concurrent 347통과. 겹치는 실행을 고유 테스트 수로 합산하지 않는다.
- 후보 실제 ESM을 연결한 helper51/devHelper11/ftags10/SSR15/element82=**169통과·기존3 skipped**. baseline/candidate/concurrent×3형식 **9 export/VNode probes**, 후보 public exports21개 동등 확인.
- 후보 ESM/UMD overlay와 unchanged concurrent의 Playwright **78통과**, skipped/flaky/unexpected/retry 0. 예제/docs·SSR/hydration·HMR·CSP/element·native 이벤트·focus/identity·parent retention·scheduler/commit/abandon을 포함한다. 원본 e2e server/config를 수정하지 않고 생성 adapter를 보존했다.
- 최종 default \`pnpm test\` **1,008통과/기존3 skipped** + SSR15 + concurrent satellites172 = 1,195회 통과로 test:dual 하위 범위를 충족했다. 최종 literal test:dual 재실행으로 표현하지 않는다. build는 동일 default source/실제 bundle hash인 P1 결과를 재사용했다. \`verify:concurrent\`도 통과했다.
- 최종 유지할 default base/concurrent도 원본 e2e server와 같은 고정 Chrome에서 **Playwright 78통과**, skipped/flaky/unexpected/retry 0을 별도로 확인했다. [추가 검증](./dc25-keyed-fast-path-default-browser-validation.json)은 후보 overlay의 78개와 구분한다.

${fs.readFileSync(notes, 'utf8')}
## 영구 보존과 인계

${preserved}

- done: 첫 DC-25 결합 후보를 격리 구현하고 정합성·CPU/메모리·수명·형식/통합을 검증했다. 기본 채택은 보류했고 source/guard·sibling은 유지했다. 후보 패치는 현재 main에 \`git apply --check\`로 적용 가능함을 확인했다.
- next: 새 성능 가설이 있을 때 현재 select 전체 격차와 차수별 분포부터 검토한다. 기존 keymatch/ordered 단독이나 proxy E/C1/C3/full22를 자동 반복하지 않는다. 실제 sparse array hole의 concurrent 예외는 별도 정합성 후속이다.
- blockers: ${archived ? '이번 검증/보존 작업의 실행 블로커 없음.' : '실행 검증 블로커 없음. 최종 archive 보존/감사는 진행 중이다.'} 전체 CPU 목표 9/9는 달성하지 못했다.
- commit: 기준 main \`${initial.head}\`; 이번 작업은 미커밋이다. 버전 변경·배포·커밋/푸시는 수행하지 않았다.
`
);
console.log(JSON.stringify({ report, archived, decision: 'defer', counts }));

import fs from 'node:fs';
import path from 'node:path';
import { root, read } from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-cache-20261022');
const a = read(path.join(out, 'analysis.json'));
const percent = ratio => ((ratio - 1) * 100).toFixed(2) + '%';
const signed = value => (value >= 0 ? '+' : '') + value.toFixed(3);
const fixed = value => value.toFixed(3);
const conditions = [
  'original-default',
  'original-isolated',
  'row-off',
  'row-helper',
  'row-memo',
];
const labels = {
  renderer: 'B/A renderer 비용',
  memo: 'E/C memo 기능',
  helper: 'D/C helper 기능',
  memoVsHelper: 'E/D 같은 행 구조',
  endToEnd: 'E/A 기존 앱 대비 종단',
  helperEndToEnd: 'D/A helper 행 앱 종단',
};
let text = `# C3 실제 캐시 앱 비교 — DC-15

2026-10-23 정리. 기준 commit \`${a.initial.head}\`.
**전체 CPU1,450표본·공식 메모리150표본·두 실행 순서를 완료했다.**
합산 가중 전체 시간은 memo가 기존 캐시 앱 대비 **${percent(a.comparisons.endToEnd.cpu.pooled.weighted.total)}**,
같은 행 helper 대비 **${percent(a.comparisons.memoVsHelper.cpu.pooled.weighted.total)}**다.
캐시 없는 행 앱 대비 **${percent(a.comparisons.memo.cpu.pooled.weighted.total)}**와 구분한다.
같은 행 구조의 memo/helper와 원래 캐시 앱 대비 종단 차이를 구분한다.
기본 런타임은 그대로이며 공개 예산·API 배포·최종 채택·전체peer 목표는 미확정이다.
이번 목표의 개선안으로 현재 C3를 채택하지 않는다. 기존 앱과 같은 행 helper 대비 손해가
양차수에서 반복됐고 메모리/번들 비용도 추가됐다. 범용 입력 예제·캐시 없는 행 앱의 이득은
기존 앱의 개선과 분리해 보존한다.

[사전 계획](./PARENT_MEMO_CACHE_PLAN.md), [raw](./parent-memo-cache-results.json),
[증거](./parent-memo-cache-evidence.json.gz), [재현 도구](../../experiments/parent-memo-cache/README.md).

## 조건과 정합성

| ID | 조건 | 설명 |
| --- | --- | --- |
| A | original-default | 원래 monolithic cacheUpdate 앱 + default core |
| B | original-isolated | A와 동일 source/helper + isolated C3, memo 비사용 |
| C | row-off | 부모 Table + RowView, 캐시 off |
| D | row-helper | C와 같은 RowView + 기존 cacheUpdate |
| E | row-memo | C와 같은 RowView + useParentMemo |

C/D/E는 source/core/production JS가 동일하며 HTML의 최초 설정만 다르다.
모든 동작이 부모 Table renew다. D는 updater 진입을 유지하며 JSX만 재사용하고,
E는 incoming row identity/id/label/selected deps가 같으면 updater 진입도 생략한다.
원래 앱은 행 컴포넌트가 없어 E/A에는 앱 구조·생성/삭제 방식 차이가 함께 들어간다.

다섯 production의 타입·DOM 계약·공식 keyed/9동작/font를 통과했다.
별도 행 diagnostic9context는 props/identity/배칭/mutable label/선택·삭제와 updater/view 횟수를 확인했다.
refresh에서 C는1,000/1,000, D는1,000/0, E는0/0(updater/view)였다.
부분 갱신은 C1,000/1,000, D1,000/100, E100/100이다.
각1,000개 key를 보유한 최종 dispose에서 등록/관찰 VDOM/host0개와 mount/unmount 일치를 확인했다.
원래 앱 두 조건은 별도6context에서1,000개 행+host의 WeakRef 관찰1,001개가 모두 회수됐다.
production에는 이 diagnostic interface/카운터가 없다.
같은 core hash의 isolated251회귀/dual1,070·3skip 및 package/type 증거는 재사용했다.

## 공식 CPU

클릭→최종 paint 전체 시간이 주 지표다. 양차수에 선택25/나머지15표본씩 조건별 수집했다.
표의 합산은 같은 이번 staging 두 차수만 사용하며 과거 표본과 섞지 않는다.
가중치는 고정 upstream Common.ts의9개 값이고 ID순 가중 기하평균이다.
작거나 차수 방향이 다른 차이는 불확실하다. 유의확률/신뢰구간을 계산한 결과가 아니다.

| 비교 | 첫 차수 전체 | 반대 차수 전체 | 합산 전체 | 합산 JS |
| --- | ---: | ---: | ---: | ---: |
`;
for (const [key, value] of Object.entries(a.comparisons))
  text += `| ${labels[key]} | ${percent(value.cpu.main.weighted.total)} | ${percent(value.cpu.reverse.weighted.total)} | ${percent(value.cpu.pooled.weighted.total)} | ${percent(value.cpu.pooled.weighted.script)} |\n`;
text += `
합산 항목별 전체 시간 중앙값(ms):

| 항목 | A | B | C | D | E | E/A | E/D |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
`;
for (const row of a.rows.pooled)
  text += `| ${row.id} | ${conditions.map(name => fixed(row.conditions[name].total.median)).join(' | ')} | ${percent(row.conditions['row-memo'].total.median / row.conditions['original-default'].total.median)} | ${percent(row.conditions['row-memo'].total.median / row.conditions['row-helper'].total.median)} |\n`;
text += `
합산 항목별 JS 중앙값(ms):

| 항목 | A | B | C | D | E |
| --- | ---: | ---: | ---: | ---: | ---: |
`;
for (const row of a.rows.pooled)
  text += `| ${row.id} | ${conditions.map(name => fixed(row.conditions[name].script.median)).join(' | ')} |\n`;
text += `
각 차수/합산의 전체·JS·paint 표본 수, 중앙값, 사분위·min/max는 raw에 보존한다.
중앙값은 짝수 표본의 가운데 두 값을 평균하며 사분위는 홀수의 가운데 값을 제외한 절반의 중앙값이다.
Python statistics/math가 원본1,450표본의 분포와36개 가중 비교를 독립 계산해1e−12 이내 일치를 확인했다.

## 공식 메모리와 크기

각 조건/항목/차수3표본, 합산6개 중앙값(MB=bytes/1024²)이다.
측정은 기존 measureUserAgentSpecificMemory API 그대로이며 CDP heap과 다르다.
기존 process-local metadata/registry 복원으로21/22/23/25/26의5개 dispatch를 사전 확인했다.

| 항목 | A MB | B MB | C MB | D MB | E MB | E−A MB | E−D MB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
`;
for (const row of a.memory.pooled)
  text += `| ${row.id} | ${conditions.map(name => fixed(row.conditions[name].median)).join(' | ')} | ${signed(row.conditions['row-memo'].median - row.conditions['original-default'].median)} | ${signed(row.conditions['row-memo'].median - row.conditions['row-helper'].median)} |\n`;
text += `
전체 production JS의 크기(HTML/공유 CSS/fonts 제외), gzip level9와 brotli:

| 조건 | raw B | gzip B | brotli B |
| --- | ---: | ---: | ---: |
`;
for (const name of conditions) {
  const s = a.sizes[name]['main.js'];
  text += `| ${name} | ${s.raw} | ${s.gzip} | ${s.brotli} |\n`;
}
text += `
압축 환경은 Node${a.compression.node}/zlib${a.compression.zlib}다.
C/D/E의 같은 JS에는 helper/memo 두 경로 코드가 모두 들어 있다.
기본 UMD br4,798B와 별도 renderer br5,691B의 기존 비용/미채택 결정은 유지한다.

## production retention

조건별3 fresh context, 총15개에서 create1k/clear300회와 partial100회를 실행했다.
각 checkpoint에 GC2회 후 CDP heap/DOM/listener를 기록했다. App/Table/root 버튼은 유지한다.
다음은 create/clear300회 heap의 세 값과 warm5회 대비 DOM/listener 및 partial 후 clear의 변화다.
공식 메모리·snapshot·전체 root dispose와 섞지 않는다.

| 조건 | 300회 heap MB(3context) | DOM 증가5→300 | listener 증가5→300 | partial 후 clear DOM/listener |
| --- | --- | --- | --- | --- |
`;
for (const name of conditions) {
  const runs = a.retentionSummary.filter(run => run.name === name);
  text += `| ${name} | ${runs.map(run => fixed(run.after300HeapMB)).join(', ')} | ${runs.map(run => run.nodes5to300).join(', ')} | ${runs.map(run => run.listeners5to300).join(', ')} | ${runs.map(run => run.nodesAfterUpdateClear + '/' + run.listenersAfterUpdateClear).join(', ')} |\n`;
}
text += `
일정한 DOM/listener와 관찰 객체 회수가 전체 heap의 상한·장기 누수 부재를 증명하지 않는다.
같은 core의 outputs WeakMap 빈 용량은 [DC-14](./PARENT_MEMO_HEAP_RESULTS.md)에서 귀속했지만,
이번 heap의 모든 변동을 그 메커니즘 하나에 귀속하지 않는다. 코어 정리 패치를 섞지 않았다.
memo의 세 번째 context는1.645MB로 다른 둘의 약1.391MB보다 높았다. 새 snapshot 없이
이 추가분의 원인을 귀속하지 않는다.

## provenance와 제한

- 공식 실행 구간(UTC): ${a.cpu[0].startedAt} ~ ${a.mem[1].finishedAt}.
  추가 retention은 ${a.retention.startedAt} ~ ${a.retention.finishedAt}에 별도로 실행했다.
  날짜/시간 간격이 다른 진단이며 공식 표본과 합산하지 않는다.
- 원래 source: \`${a.build['original-default'].appSource}\`.
- 행 source: \`${a.build['row-memo'].appSource}\`.
- 같은 행 JS: \`${a.build['row-memo'].bundle}\`.
- helper: \`${a.build['row-memo'].helper}\`.
- baseline/C3 ESM: \`${a.build['original-default'].core}\` / \`${a.build['row-memo'].core}\`.
- Chrome 실행 파일/engine은 모든 official run에서 동일하다. 정확한 hash와 runner/source/lock/명령/환경은 raw와 archive에 있다.
- upstream source/compiled runner/CSS/lock ${a.upstreamAudit.files}개도 이전 영구 증거의 hash와 일치했다.
- CPU 실패 배치${a.cpu.reduce((sum, run) => sum + (run.failedBatches?.length || 0), 0)}개, 메모리 실패 배치${a.mem.reduce((sum, run) => sum + (run.failedBatches?.length || 0), 0)}개.
  실패 시도·유효 prefix/resume이 있으면 raw/로그에 보존한다.
- 원순서 A/B/C/D/E와 반대 순서를 항목별 교대했다. 두 순서가 시간 흐름·다섯 조건 간 실행 간격·외부 부하를 모두 제거하지는 않는다.
  시작/종료 시각·machine·load·표본별 결과를 보존했다. 빠른 색상 구간/전체 React·Preact 목표 판정은 미정이다.
- 기본28 source/산출물·package exports·실제 sibling targeted 앱은 전후 동일하다. 기본 core·helper 구현은 수정하지 않았다.
- 정상 CPU trace1,450개의 hash/size와 선택 index0의10개 내용을 보존한다. 다른 정상 trace 내용은 임시 출력에만 있다.
  전체 실패 시도는 영구 보존한다. 기존 core 회귀 증거는 nested archive로 포함한다.

## 상태 / 핸드오프

- done:DC-15 다섯 조건의 gate·양순서CPU1,450/메모리150·retention15context·dispose·독립 통계 감사.
- next:C3의 기존 앱 개선안 채택을 보류하고 원래 앱/React·Preact의 전체 항목 비교 조건을 고정한다. 그 근거로 다음 코어 후보를 선택한다. 공개 예산·concurrent·최종 hardening/integration은 남아 있다.
- blockers:실행 블로커 없음. 전 항목 목표의 수치 임계치는 미확정이며 이번 결과만으로 목표 달성을 선언하지 않는다.
- commit:\`${a.initial.head}\`; 이번 DC-15 후속 도구·문서·증거는 작업 트리다.
`;
fs.writeFileSync(
  path.join(root, 'docs/benchmark/PARENT_MEMO_CACHE_RESULTS.md'),
  text
);

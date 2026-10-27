import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, names, peers, read } from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
const a = read(path.join(root, 'docs/benchmark/peer-baseline-results.json'));
const decision = read(path.join(out, 'decision.json'));
assert.equal(decision.complete, true);
const validProfiles = a.profile.summaries.reduce(
    (s, r) => s + r.validProfiles,
    0
  ),
  excludedProfiles = a.profile.summaries.reduce(
    (s, r) => s + r.excludedProfiles.length,
    0
  );
const f = value => value.toFixed(3),
  ratio = value => value.toFixed(3) + '×',
  percent = value => (value * 100).toFixed(2) + '%';
let text = `# 고정 React/Preact 전체 비교 — DC-16

사용자가 확정한 목표는 **CPU 9항목 각각에서 고정 네 peer 중 가장 빠른 전체 시간 중앙값의 1.10배 이내**다.
이번 합산 결과는 **${a.goal.pooledPassed}/9항목 통과**, 첫 차수 ${a.goal.mainPassed}/9, 반대 차수 ${a.goal.reversePassed}/9다.
${a.goal.allPooled ? (a.goal.allOrders ? '합산과 양차수 모두 목표를 통과했다.' : '합산은 통과했지만 차수별 경계 통과가 일치하지 않아 안정적인 달성은 미확정이다.') : '아직 전 항목 목표를 달성하지 못했다.'}
CPU 1,450표본·공식 메모리 150표본을 같은 production 두 순서에서 새로 수집했다.
기본 core/helper·package는 유지했다. C3는 이번 비교에 포함하지 않는다.

[비교표](./PEER_BASELINE_TABLE.html), [raw](./peer-baseline-results.json),
[증거](./peer-baseline-evidence.json.gz), [재현 도구](../../experiments/peer-baseline/README.md),
[요구사항](../performance-improvement/REQUIREMENTS.md).

## 비교 조건

| 조건 | 고정 버전 | production 빌드 |
| --- | --- | --- |
| lithent | 1.25.2 default | 원래 monolithic cacheUpdate 앱, Vite |
`;
for (const name of peers)
  text += `| ${name} | ${a.provenance.peers[name].version} | \`${a.provenance.peers[name].buildScript}\` |\n`;
text += `
upstream의 실제 source/lock/빌드 설정을 그대로 사용했다. React hooks 19.2.0과 classes 19.0.0은
서로 다른 고정 버전이다. 이 결과는 네 실제 구현의 비교이며 React 버전이나 hooks 효과를 분리한 실험이 아니다.
이전 설치본은 source/lock·모든 설치 package 버전·npm 의존성 트리가 일치할 때 재사용하고 새 staging에서 다시 빌드했다.
네 peer를 모두 공개하며 유리한 한 구현만 선택하지 않는다.
다섯 앱 모두 별도 DOM 정체성 계약과 공식 keyed/9동작/font를 통과했다.
framework별 bulk 제거 mutation 수가 같은지는 요구하지 않았다.

## CPU 전체 시간과 목표

공식 클릭→최종 paint의 total 중앙값(ms)이 주 지표다. 각 차수에 선택25/나머지15표본씩 수집했다.
합산은 이번 두 차수의 원본 표본만 사용한다. 색상은 고정 Common.ts 함수와 **다섯 앱 최저값**으로 계산한다.
사용자 목표는 **네 peer 최저값** 기준이며 색상·평균으로 항목별 판정을 대체하지 않는다.
표시는 소수3자리로 반올림하지만 통과 여부는 반올림하지 않은 중앙값의 비율로 계산한다.

| 항목 | lithent | react-hooks | react-classes | preact-hooks | preact-classes | L/최저 peer | 1.10 목표 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
`;
for (const [i, row] of a.rows.pooled.entries())
  text += `| ${row.id} | ${names.map(n => f(row.conditions[n].total.median)).join(' | ')} | ${ratio(a.goal.rows[i].lithentPeerRatio)} | ${a.goal.rows[i].pass ? '통과' : '미달'} |\n`;
text += `
| 항목 | 최저 peer | 첫 차수 L/최저 | 반대 차수 L/최저 | 목표 초과 ms | 목표까지 현재 시간 감축 |
| --- | --- | ---: | ---: | ---: | ---: |
`;
for (const row of a.goal.rows)
  text += `| ${row.id} | ${row.referencePeers.join(', ')} | ${ratio(row.orders.main)} | ${ratio(row.orders.reverse)} | ${f(row.excessMs)} | ${percent(row.requiredReduction)} |\n`;
text += `
감축률은 \`max(0, 1−1.10/(L/최저 peer))\`다. 모든 항목을 같은 비율로 개선할 수 있다는 예측이 아니다.
실행 순서는 각 항목마다 교대하며 두 번째 차수는 첫 차수의 반대 순서다.
두 차수가 시간 변화·외부 부하·구현 간 간격을 모두 제거하지는 않는다.
작은 차이나 순서별 경계 교차는 불확실하며 통계적 유의성을 주장하지 않는다.
배치 종료 시 기록한1분 load 범위는 첫 차수 ${f(Math.min(...a.cpu[0].samples.map(s => s.load[0])))}~${f(Math.max(...a.cpu[0].samples.map(s => s.load[0])))},
반대 차수 ${f(Math.min(...a.cpu[1].samples.map(s => s.load[0])))}~${f(Math.max(...a.cpu[1].samples.map(s => s.load[0])))}였다.
load는 대기 작업 수의 OS 지표이며 CPU 사용률이나 특정 표본의 오차를 계산하는 값이 아니다.

## 보조 CPU 지표

다음은 Lithent/각 peer의 upstream 가중 기하평균이다. 1보다 작으면 Lithent가 빠르다.
전체9항목 목표는 이 평균과 별도로 판정한다.

| peer | 첫 전체 | 반대 전체 | 합산 전체 | 첫 JS | 반대 JS | 합산 JS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
`;
for (const name of peers) {
  const c = a.peerComparisons[name].cpu;
  text += `| ${name} | ${['total', 'script'].flatMap(m => ['main', 'reverse', 'pooled'].map(r => ratio(c[r].weighted[m]))).join(' | ')} |\n`;
}
text += `
합산 JS 중앙값(ms):

| 항목 | lithent | react-hooks | react-classes | preact-hooks | preact-classes |
| --- | ---: | ---: | ---: | ---: | ---: |
`;
for (const row of a.rows.pooled)
  text += `| ${row.id} | ${names.map(n => f(row.conditions[n].script.median)).join(' | ')} |\n`;
text += `
total·script·paint의 각 차수/합산 표본 수·중앙값·Tukey 절반 사분위·min/max를 raw에 보존했다.
짝수 중앙값은 가운데 두 값의 평균이며 홀수 사분위는 가운데 값을 제외한 절반의 중앙값이다.
독립 Python 감사가 분포 ${a.audit.distributions}개·가중 값 ${a.audit.weightedComparisons}개와 색상/목표를
원본 표본에서 재계산해1e−12 이내 일치를 확인했다. 평균·JS만으로 최종 목표를 선언하지 않는다.

## 공식 메모리와 전송 크기

각 앱/항목/차수3표본, 합산6개의 중앙값이다. MB=bytes/1024²다.
공식 measureUserAgentSpecificMemory를 사용하며 CDP heap과 다르다.
CPU1.10 목표를 메모리에 적용하지 않는다. 별도 메모리 예산은 확정하지 않았다.

| 항목 | lithent MB | react-hooks MB | react-classes MB | preact-hooks MB | preact-classes MB | L/최저 peer | 차이 MB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
`;
for (const [i, row] of a.memory.pooled.entries()) {
  const norm = a.normalizedMemory.pooled[i];
  text += `| ${row.id} | ${names.map(n => f(row.conditions[n].median)).join(' | ')} | ${ratio(norm.lithentPeerRatio)} | ${f(norm.delta)} |\n`;
}
text += `
각 production의 HTML/전체 JS 크기(B)다. 공유 CSS/fonts와 startup 시간은 포함하지 않는다.
HTML과 JS를 개별 압축했으며 gzip level9, brotli 기본 quality11, Node${a.compression.node}/zlib${a.compression.zlib}다.

| 조건 | 종류 | raw | gzip | brotli |
| --- | --- | ---: | ---: | ---: |
`;
for (const name of names)
  for (const [kind, size] of Object.entries(a.sizes[name]))
    text += `| ${name} | ${kind} | ${size.raw} | ${size.gzip} | ${size.brotli} |\n`;
text += `
## 별도 병목 진단과 다음 후보

공식 실행 완료 후 목표 대비 비율이 큰 미달 항목 최대 두 개에만 profiler를 붙였다.
각 항목의 Lithent와 최저 peer를3 fresh context×10action씩 교차 실행했다.
CPU1x·sampling250µs·action 후2rAF이며 공식 warmup/throttle과 다르다.
CPU profile과 trace는 동시 수집하지 않고, trace는 항목/앱별 별도 fresh context4개에서10action씩 수집했다.
reset은 profile 밖이며 trace는 표시된 action 구간만 집계한다.
샘플링·native/idle/driver·profiler 비용이 포함되므로 이 시간은 공식 스코어가 아니다.
trace의 FunctionCall/EventDispatch/layout/paint는 포괄·중첩 시간으로 더할 수 없다.
${a.profile.excludedFirstAttempt ? `첫 진단에 음수 timeDelta가 있는 profile ${a.profile.excludedFirstAttempt.invalidProfiles}개가 있어 첫 시도를 전량 함수 시간 순위에서 제외하고 보존했다.` : '별도 첫 진단 제외 기록은 없다.'}
분리 수집 ${validProfiles + excludedProfiles}profile 중 음수 간격이 있는 ${excludedProfiles}개는 해당 profile 전체를 제외했다. 유효 ${validProfiles}개의 간격은 모두 비음수다.
조건별 유효 profile 수를 아래에 공개하며 이 합계를 조건 간 속도비로 사용하지 않는다.
음수 간격의 원인은 미확정이며 값을0으로 고치거나 시간순으로 재배열하지 않았다.
새 CPU profile UTC: ${a.profile.startedAt} ~ ${a.profile.finishedAt}; 별도 trace: ${a.profile.traceStartedAt} ~ ${a.profile.traceFinishedAt}.
공식 수집과 진단 사이 시간 간격이 크며 시간·부하 조건이 동일하다는 가정으로 합산하지 않는다.
`;
if (a.profile.sourceMap.usable)
  text += `
별도 hidden source map 빌드의 JS가 측정 bundle과 byte 단위로 일치해 원래 소스 위치를 사용했다.
함수 위치는 전체 함수가 비용의 원인이라는 증거가 아니며 top30/context 집계 밖의 함수는 순위에서 빠질 수 있다.
기존 default ESM이 연결한 core map의14개 embedded source도 고정 runtime 해시와 일치했다.
이 보조 map의 위치는 core 재빌드로 새로 생성한 결과와 구분해 raw provenance에 기록한다.
`;
else
  text += `
일치하는 source map이 없거나 진단할 미달 항목이 없어 소스 위치 기반 귀속을 사용하지 않았다.
`;
for (const group of a.profile.groups) {
  text += `\n### ${group.id} / ${group.name}\n\n유효 profile/context: ${group.validProfiles.join('/')}.\n\n| 함수 | app self 샘플 ms(유효 profile 합) | 소스 위치 |\n| --- | ---: | --- |\n`;
  for (const fn of group.topFunctions.slice(0, 8)) {
    const original = fn.coreOriginal || fn.original;
    const loc = original
      ? `${original.source}:${original.line}:${original.column}`
      : `${fn.url.split('/').at(-1)}:${fn.line + 1}:${fn.column}`;
    text += `| ${fn.name || '(anonymous)'} | ${f(fn.selfUs / 1000)} | \`${loc.replaceAll('|', '%7C')}\` |\n`;
  }
}
text +=
  '\n별도 trace의 표시된10action 안 main-thread 포괄 시간(ms):\n\n| 항목 | 앱 | FunctionCall | style | layout | paint |\n| --- | --- | ---: | ---: | ---: | ---: |\n';
for (const s of a.profile.summaries.filter(s => s.trace)) {
  const e = s.trace.events;
  text += `| ${s.id} | ${s.name} | ${f(e.FunctionCall.inclusiveMs)} | ${f(e.UpdateLayoutTree.inclusiveMs)} | ${f(e.Layout.inclusiveMs)} | ${f(e.Paint.inclusiveMs)} |\n`;
}
text += `\n${decision.findings.map(v => '- ' + v).join('\n')}\n\n**다음 단계:** ${decision.next}\n\n${decision.limits.map(v => '- ' + v).join('\n')}\n`;
text += `
## 증거와 보존

- 기준 commit: \`${a.initial.head}\`.
- 공식 실행 UTC: ${a.cpu[0].startedAt} ~ ${a.mem[1].finishedAt}.
- CPU 실패 배치 ${a.cpu.reduce((n, r) => n + (r.failedBatches?.length || 0), 0)}개, 메모리 실패 배치 ${a.mem.reduce((n, r) => n + (r.failedBatches?.length || 0), 0)}개. raw에 시도·표본·machine/load/명령을 보존했다.
- source/lock·의존 package·runtime·runner/CSS·manifest·production ${a.frozenInputs.files}파일을 전후 검사했다. 기본28파일·package·실제 sibling 앱도 유지했다.
- 원래 앱/source: \`${a.provenance.lithent.app}\`; baseline ESM: \`${a.provenance.lithent.core}\`.
- Lithent production JS: \`${a.build.lithent.bundle}\`. 모든 공식 차수에서 Chrome/engine hash가 일치한다.
- 정상 trace ${a.tracePolicy.normal}개의 hash/size와 선택 index0/조건/차수 ${a.tracePolicy.preserved}개 내용을 보존했다. 모든 실패 시도와 별도 진단 profile/trace는 전체 보존한다. 나머지 정상 trace 내용은 임시 경로에 있다.
- 같은 해시의 기존 type/B3/core/dual 증거는 DC-15 archive에 포함해 재사용했다. 변경 없는 core의 회귀 suite를 반복 실행한 결과로 쓰지 않는다.
- evidence SHA256: \`${a.evidence.sha256}\`, ${a.evidence.files} entries, ${a.evidence.bytes}B. 디코딩한 모든 entry hash를 검사했다.

## 상태 / 핸드오프

- done:DC-16 전체 peer gate·CPU1,450/메모리150·독립 감사·별도 profile·영구 증거.
- next:${decision.next}
- blockers:실행 블로커 없음. 전 항목 CPU 목표 ${a.goal.allPooled && a.goal.allOrders ? '이번 고정 조건에서 통과' : '미달 또는 순서 일관성 미확정'}. 공개 예산·concurrent·후보 hardening/integration은 별도 추적한다.
- commit:\`${a.initial.head}\`; 이번 DC-16 변경은 작업 트리다.
`;
fs.writeFileSync(
  path.join(root, 'docs/benchmark/PEER_BASELINE_RESULTS.md'),
  text
);

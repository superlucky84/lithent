import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const out = fs.realpathSync(process.argv[2]);
const read = name => JSON.parse(fs.readFileSync(path.join(out, name)));
const result = read('results.json');
const audit = read('audit.json');
const integrity = read('integrity.json');
const decision = read('decision.json');
assert(audit.passed && integrity.passed);
const pct = v => `${v >= 0 ? '+' : ''}${(100 * v).toFixed(2)}%`;
const number = v => v.toFixed(4);
const peer = result.peerRatios.pooled;
const within = name => peer[name].items.filter(r => r.within110).length;
const cpuTable = result.cpu.pooled
  .map(row => {
    const c = row.conditions;
    return `| ${row.id} | ${number(c.baseline.total.median)} | ${number(c.candidate.total.median)} | ${pct(row.change.total)} | ${pct(row.change.script)} | ${number(c['preact-classes'].total.median)} | ${(c.candidate.total.median / c['preact-classes'].total.median).toFixed(3)} |`;
  })
  .join('\n');
const orderTable = ['main', 'reverse', 'pooled']
  .map(order => {
    const w = result.weighted[order];
    return `| ${order} | ${pct(w.total)} | ${pct(w.script)} | ${pct(w.paint)} |`;
  })
  .join('\n');
const memoryTable = result.memory.pooled
  .map(row => {
    const c = row.conditions;
    return `| ${row.id} | ${number(c.baseline.median)} | ${number(c.candidate.median)} | ${number(c.candidate.median - c.baseline.median)} | ${pct(row.change)} | ${number(c['preact-classes'].median)} |`;
  })
  .join('\n');
const b = result.builds;
const sizeTable = ['baseline', 'candidate', 'preact-classes']
  .map(
    name => `| ${name} | ${b[name].raw} | ${b[name].gzip} | ${b[name].brotli} |`
  )
  .join('\n');
const workTable = result.validation.snapshot.work
  .map(
    r =>
      `| ${r.n} | ${r.variant} | ${r.operation} | ${r.keyOf} | ${r.mapGet} | ${r.snapshotKeyWrites} |`
  )
  .join('\n');
const runTable = Object.entries(result.runs)
  .flatMap(([order, modes]) =>
    Object.entries(modes).map(
      ([mode, run]) =>
        `| ${order}/${mode} | ${run.startedAt} | ${run.finishedAt} | ${run.chrome} | ${run.failedBatches.length} | ${run.warnings.length} |`
    )
  )
  .join('\n');
const markdown = `# C4 P3 — key snapshot 비교 결과

${decision.summary}

## 비교 범위와 판단

- 브랜치 ~BT~perf/c4-key-snapshot~BT~. 기존 진단/P1/P2를 커밋한 ~BT~7f4df5c~BT~의 P2 owner가 이번 baseline이다. 이번 P3는 별도 실험 파일이며 기본 runtime/public export/guard는 그대로다.
- 같은 P2 owner 앱·row cache·source core를 두 번 빌드하고 controller의 key snapshot 한 축만 바꿨다. Preact class11은 고정 source/lock/설치 inventory에서 다시 빌드했다.
- 새 CPU${result.counts.cpu}/공식 메모리${result.counts.memory}표본을 양순서로 수집했다. 원래 A 앱은 이번 비교에 없으며 과거 P2 개선율과 곱하거나 합산하지 않는다. 네 peer/Vue 목표 검증도 아니다.
- 판단: **${decision.disposition}**. ${decision.reasons.join(' ')}
- ${decision.next}

## 전체/JS/paint — P3/P2 가중 변화

항목별 중앙값 비율의 기존 가중 기하평균이다. 음수는 P3가 작다. 순서별/pooled 분포(p25/p75/min/max)와 peer 비율은 [JSON](./c4-key-snapshot-results.json)에 있다. 표본 변동이 있으므로 작은 pooled 차이만으로 원인이나 우위를 확정하지 않는다.

| 순서 | 전체 | JS | paint |
| --- | ---: | ---: | ---: |
${orderTable}

## 9항목 pooled 전체 시간

단위 ms. JS 열은 P3/P2 변화다. Preact class1.10 이내는 P2 ${within('baseline')}/9, P3 ${within('candidate')}/9다. Preact 대비 가중 전체는 P2 ${pct(peer.baseline.weighted.total - 1)}, P3 ${pct(peer.candidate.weighted.total - 1)}다. 이는 이번 한 peer의 비교다.

| 항목 | P2 | P3 | 전체 변화 | JS 변화 | Preact class | P3/Preact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${cpuTable}

${decision.interpretation}

## 추가·제거한 작업

set의 기존 순회에서 keys[index]를 저장하고 items/keys/indexes를 검증 후 함께 게시한다. 구조 flush와 최초 owner view는 저장한 key를 describe에 전달한다. describe의 현재 key/출력 key 검사는 남긴다. 실패한 set은 기존 snapshot을 유지하며 lifecycle set은 다음 배치 snapshot을 만든다. 부분 갱신의 Map 조회·정렬과 일반 keyed core의 O(n) 매칭은 유지한다.

아래는 별도 **비시간 작업량 검사**다. keyOf/전역 Map.get은 해당 격리 fixture의 실제 호출 계수이며 일반 성능 비율을 뜻하지 않는다. snapshot key 쓰기 수는 set 입력 길이와 소스의 대입문에서 산정한 값으로, 배열 쓰기 counter나 할당 바이트 실측이 아니다. 배열 n개 쓰기/저장 비용이 추가된다.

| 행 수 | 조건 | 작업 | keyOf | Map.get | 코드상 snapshot key 쓰기 |
| ---: | --- | --- | ---: | ---: | ---: |
${workTable}

순수 keyOf/view·불변 고유 string/number key라는 기존 실험 계약을 전제로 한다. 일반 getter 호출 횟수 보존 최적화로 적용하지 않는다. 구조 갱신의 전체 순회 자체를 없애지는 못했다.

## 공식 메모리와 앱 크기

메모리 단위는 공식 runner의 MB다. 별도 retention에서 P2/P3 각각3context의100회 create/clear와100회 partial 뒤 clear를 확인했고 DOM/listener는 초기 수준으로 돌아왔다. 전체 JS heap 누수 부재를 보장하지 않는다.

| 항목 | P2 MB | P3 MB | 차이 MB | 변화 | Preact MB |
| --- | ---: | ---: | ---: | ---: | ---: |
${memoryTable}

같은 compressor의 앱 번들 전체 크기다. base UMD의 guard와 직접 비교하지 않는다. P3의 Brotli 차이는 ${b.candidate.brotli - b.baseline.brotli}B다.

| 조건 | raw B | gzip B | Brotli B |
| --- | ---: | ---: | ---: |
${sizeTable}

## 정합성·수집·감사

- strict source/core/P2/P3 types 통과. 공유 owner19검사(계약18 + 기존 portal 관찰1), snapshot 추가5검사, 1k/10k 작업량8조건을 통과했다. set 이후 key mutation/재시도·caller 배열 변경·실패한 set 원자성·lifecycle 다음 배치·falsy/±0/dispose를 확인했다.
- 실제 Chrome owner12 + 앱9검사, 세 앱 공식 keyed/9동작/font 검증, 조건별3context retention을 통과했다. P2의 지원 범위 안에서 부모 renew/중첩/root component/오류/focus/제거·재마운트를 확인했다.
- 독립 Python 감사: ${audit.distributions}분포, ${audit.weighted}가중, ${audit.peerChecks}peer 비율/가중 검산과 순서·표본·bundle 해시 통과. source/browser/runner/peer inventory는 별도 integrity.json에 보존했다.
- 중단 사이 Chrome이156.0.8078.48→156.0.8078.74로 바뀌어 첫 collection이 **표본 수집 전** 해시 guard에서 중단됐다. 이전 검증/오류를 보존했다. 준비 도구가 과거 framework 경로를 그대로 쓰던 점도 현재 Current의 실경로를 고정하도록 수정하고 최종 staging에서 native gate를 반복했다. 이번 timing은 현재 브라우저의 새 세션만 포함한다.
- 공식 수집 중 별도 build/test/profile/benchmark를 실행하지 않았다. 준비의 기존 Browserslist 데이터 알림은 고정 의존성 그대로 기록했으며 timing 경고와 구분한다.

| 순서/모드 | 시작 UTC | 종료 UTC | Chrome | 실패 batch | warnings |
| --- | --- | --- | --- | ---: | ---: |
${runTable}

## 지원 한계와 재현

중첩 portal을 보통 요소 아래에서 삭제할 때 target 내용이 남는 기존 BUG-3은 P3에서도 지원 한계다. 단일 owner 수명/동일 위치 parent renew를 유지하며 새 owner를 먼저 만드는 교대·일반 clone·concurrent/SSR/HMR·최종 API는 별도 설계/검증이 필요하다. 모든 diff/DOM 오류의 rollback을 약속하지 않는다.

[도구와 명령](../../experiments/c4-key-snapshot/README.md), [정본 인계](../performance-improvement/IMPLEMENT.md#상태--핸드오프). staging은 ~BT~${out}~BT~이다. [새 archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/c4-key-snapshot-evidence.tar.gz)와 [manifest](./c4-key-snapshot-evidence-manifest.json)에 실제 소스/번들·raw/trace·runner/lock/설치 inventory·준비 이력과 도구를 보존한다. 기존 P1/P2 자료는 유지한다.
`;
fs.writeFileSync(
  'docs/benchmark/C4_KEY_SNAPSHOT_RESULTS.md',
  markdown.replaceAll('~BT~', '`')
);
fs.writeFileSync(
  'docs/benchmark/c4-key-snapshot-results.json',
  JSON.stringify({ ...result, decision, audit, integrity }, null, 2) + '\n'
);
console.log(JSON.stringify({ report: 'C4_KEY_SNAPSHOT_RESULTS.md', decision }));

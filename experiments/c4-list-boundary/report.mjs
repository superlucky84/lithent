import fs from 'node:fs';
import path from 'node:path';
const out = fs.realpathSync(process.argv[2]);
const r = JSON.parse(fs.readFileSync(path.join(out, 'results.json')));
const pct = x => (x * 100).toFixed(2) + '%';
const n = x => x.toFixed(3);
const labels = [
  '1,000행 생성',
  '1,000행 교체',
  '부분 갱신',
  '행 선택',
  '행 교환',
  '한 행 삭제',
  '10,000행 생성',
  '1,000행 추가',
  '전체 삭제',
];
const cpuTable = r.cpu.pooled
  .map(
    (v, i) =>
      `| ${labels[i]} | ${n(v.conditions.baseline.total.median)} | ${n(v.conditions.candidate.total.median)} | ${pct(v.change.total)} | ${pct(v.change.script)} |`
  )
  .join('\n');
const memoryTable = r.memory.pooled
  .map(
    v =>
      `| ${v.id} | ${n(v.conditions.baseline.median)} | ${n(v.conditions.candidate.median)} | ${pct(v.change)} |`
  )
  .join('\n');
const orderTable = Object.entries(r.weighted)
  .map(([order, v]) => `| ${order} | ${pct(v.total)} | ${pct(v.script)} |`)
  .join('\n');
const b = r.builds.baseline,
  c = r.builds.candidate;
const tick = String.fromCharCode(96);
const text = `# C4 첫 목록 경계 실험 — 2026-10-29

**명시적으로 변경 key를 알리는 C4 프로토타입을 구현하고 기존 캐시 앱과 비교했다.** 가중 전체 변화는 ${pct(r.weighted.pooled.total)}, JS는 ${pct(r.weighted.pooled.script)}다. 아래 값은 새로운 B/C 표본이며 과거 peer 수치와 합산하지 않았다. 제품 기본 채택은 하지 않았다.

정본은 [DC-26-C4-P1](../performance-improvement/DESIGN.md#dc-26-c4-p1--첫-격리-프로토타입-계약-2026-10-29), [실행 계획](../performance-improvement/IMPLEMENT.md#dc-26--진단과-조건부-후속-계획), [M-21](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-21-dc-26-진단과-후속-경계--r80r84)다. [집계 JSON](./c4-list-boundary-results.json), [도구/재현](../../experiments/c4-list-boundary/README.md)을 연결한다.

## 구현과 비교 범위

- Boundary는 배열 snapshot과 key→index Map을 소유한다. ${tick}set(items)${tick}는 구조 갱신이며 기존 전체 keyed diff/render를 사용한다. ${tick}invalidate(keys)${tick}는 해당 slot의 VDOM만 기존 diff/render로 처리한다. 행별 mount/resolver와 직접 DOM 쓰기는 추가하지 않았다.
- 선택은 이전/다음 key, 부분 갱신은 실제 수정 루프에서 모은 key를 전달한다. 변경 key 수집·Map/배열·scheduler 비용을 모두 포함한다. 알리지 않은 외부 mutation을 자동 추적하지 않는다.
- B는 이전 공식 A 앱의 원본 row cache/view다. C는 그 코드를 유지하면서 Table의 갱신 경로를 boundary로 바꿨다. **새 API를 사용하는 앱의 효과**이며 기존 앱 무수정 코어 개선이 아니다.
- 두 앱 모두 동일한 변경 없는 base source를 Vite 5.4.8로 앱과 함께 production 빌드했다. 배포된 prebuilt core를 링크한 과거 비교와 빌드 구조가 다르며 그 수치를 섞지 않는다.
- 고유 불변 string/number key, 순수 view, 컴포넌트/portal 없는 단일 element item root, 한 번 mount하는 안정된 소유 범위로 제한한다. 잘못된 root/중복 key/알 수 없는 알림/검출한 key 변경과 재진입 쓰기를 거부한다. 알려주지 않은 mutation이나 모든 미지원 subtree를 자동 검출하는 API가 아니다.
- 자체 microtask에서 중복 알림을 합치고 구조 변경이 pending item 갱신보다 우선한다. throwing view는 commit 전에 계산해 명시적 재시도가 가능하다. diff/DOM 예외의 일반 rollback은 제공하지 않으며 해당 경우 owner 재구성이 필요하다.

## 측정

Apple M4 Pro 12코어/24GB, Node 24.22.1, ${r.runs.main.cpu.chrome}, 비격리 머신이다. browser binary/engine·source·runner·앱 해시를 고정했다. CPU는 ${r.counts.cpu}표본(선택 조건/차수별25, 나머지15), 공식 메모리는 ${r.counts.memory}표본(조건/차수/항목별3)이다. main/reverse에서 항목별 두 앱의 실행 순서를 뒤집었으며 수집 중 build/test/진단 브라우저를 병행하지 않았다.

이번에는 기존 네 peer와 Vue를 수집하지 않았다. 과거 Preact class의 절대 ms를 대입해 현재 목표 달성이나 순위를 판정하지 않는다. 독립 중앙값인 total/JS/paint는 서로 더하지 않는다.

| 차수 | 가중 전체 변화 C/B | 가중 JS 변화 |
| --- | ---: | ---: |
${orderTable}

## CPU 전체 시간

음수는 빨라진 방향이다. 각 항목 pooled 표본은 조건별30, 선택은50이다. 양순서 분포·IQR/range·paint는 JSON에 있다.

| 동작 | B 전체 ms | C4 전체 ms | 전체 변화 | JS 변화 |
| --- | ---: | ---: | ---: | ---: |
${cpuTable}

## 메모리와 크기

공식 메모리 단위는 MB, 항목/조건별 pooled N=6이다. CDP의 별도 JS heap 지표와 합산하지 않는다.

| 항목 | B MB | C4 MB | 변화 |
| --- | ---: | ---: | ---: |
${memoryTable}

앱 전체 번들은 B→C4 raw ${b.raw}→${c.raw}B, gzip9 ${b.gzip}→${c.gzip}B, Brotli ${b.brotli}→${c.brotli}B(**+${c.brotli - b.brotli}B**)다. 이는 앱+코어 총량이며 base UMD의 새 측정/새 allowance가 아니다. 기본 runtime/4,824B guard는 변경하지 않았다.

## 정합성·수명 검증과 한계

- Strict TypeScript: 최종 source core·boundary·B/C 앱 통과. 초기 Fragment 명시 호출의 타입 호환과 미사용 import 오류를 고친 뒤 측정했다. 타입 수정 전후 B/C/diagnostic의 세 JS/HTML 해시가 모두 같아 첫 keyed/browser 검증을 명시적으로 재사용했다.
- 일반 편집 목록 JSDOM **22개**: n=1k/10k × k=1/2/100/1k의 뷰 호출량, 말미 수정, 중복 알림, 구조 변경 우선, swap 후 수정/삭제, 잘못된 key, 입력 focus/선택, throwing view/재시도, 재진입 거부, dispose 후 pending 무효화 통과.
- 공식 keyed 판정과 9동작/font는 B/C 모두 통과. 별도 실제 Chrome 진단 **9개**: 선택1/2회·partial100회 뷰 호출, identity, swap 뒤 갱신, 선택된 행 삭제 후 선택, 같은 turn 중복 알림, 재생성을 확인했다.
- 조건별 **3 fresh contexts**에서 100회 생성/삭제와 100회 partial 후 clear를 수행했다. 최종 강제 GC 뒤 DOM/listener 수는 초기값과 같았다. 수집한 heap 절대값과 변화는 JSON에 보존했으며 전체 JS heap 누수 부재로 일반화하지 않는다.
- 제품 경로는 변경하지 않았으므로 기존 전체 core/satellite/e2e suite를 새 API 검증으로 재실행하지 않았다. **concurrent·SSR/hydration·HMR·nested component lifecycle·owner clone/부모 재렌더·일반 예외 복구는 미지원/미검증**이다. 전체 D3/D4 제품 통합 완료나 공개 채택으로 해석하지 않는다.

## 판단과 다음 단계

이 실험은 변경 정보를 공급하면 목록 전체 탐색 없이 k개 item을 처리할 수 있음을 확인한다. 수치상 이득과 생성/삭제·메모리·번들 비용은 위 전체 표를 함께 본다. C4를 제품으로 진행하려면 데이터 소유권/알림 누락·기존 앱 API, owner 수명/부모 갱신, 예외 복구와 양코어 지원 계약을 먼저 확장해야 한다. 기존 API의 자동 최적화나 Vue/Preact 대비 우위는 이번 결과로 입증하지 않았다.

첫 원리 검증은 **후속 설계에 투자할 근거가 있다**고 판단한다. 선택/partial 전체 이득은 두 순서에서 반복됐고 가중 전체도 두 순서 모두 줄었다. 1k 교체 전체/JS와 한 행 삭제 JS의 증가를 숨기지 않는다. 생성·교환·추가·삭제의 작은 전체 차이나 clear의 이득을 특정 원인에 새로 귀속하지 않는다. 비격리 머신의 표본이며 통계적 유의성이나 일반 앱의 같은 개선율을 보장하지 않는다.

## 검산과 영구 보존

독립 Python 감사는 **192분포·9가중값**, CPU580/메모리60 표본, 양순서, 실제 앱 bundle hash를 검증했다. 공식 CPU/메모리의 실패 배치·재시도·warnings는 모두 0이다. 최초 sandbox의 포트 차단, strict TS 준비 오류와 보고서 template 오류는 성능 표본과 분리해 보존했다. 측정 뒤 포맷한 최종 source를 다시 빌드했고 세 앱 JS/HTML hash가 모두 측정 번들과 동일했다. 이 등가성은 별도 JSON과 source snapshot으로 남겼다.

[영구 manifest](./c4-list-boundary-evidence-manifest.json)와 [archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/c4-list-boundary-evidence.tar.gz)는 실제 입력/소스·앱/진단 번들·CPU/메모리 원자료와 trace·검증·실패 준비·재현 도구를 보존한다. 의존 node_modules와 설치된 Chrome 자체는 포함하지 않으며 lock/설치 inventory·browser/engine hash를 기록한다. archive를 다시 열어 모든 member의 decoded hash를 대조한다. 기본 runtime과 sibling·기존 archive는 변경하지 않았다.
`;
fs.writeFileSync('docs/benchmark/C4_LIST_BOUNDARY_RESULTS.md', text);
fs.copyFileSync(
  path.join(out, 'results.json'),
  'docs/benchmark/c4-list-boundary-results.json'
);

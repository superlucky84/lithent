import fs from 'node:fs';
import path from 'node:path';
const out = fs.realpathSync(process.argv[2]);
const r = JSON.parse(fs.readFileSync(path.join(out, 'results.json')));
const d = JSON.parse(
  fs.readFileSync(path.join(out, 'selection-diagnostics.json'))
);
const cg = d.trace.groups['pooled/candidate'],
  pg = d.trace.groups['pooled/preact-classes'];
const largest = Object.entries(d.trace.gaps.candidate.locations).sort(
  (a, b) => b[1] - a[1]
)[0];
const percent = x => (100 * x).toFixed(2) + '%';
const num = x => x.toFixed(3);
const labels = [
  '1k 생성',
  '1k 교체',
  '부분 갱신',
  '선택',
  '교환',
  '한 행 삭제',
  '10k 생성',
  '1k 추가',
  '전체 삭제',
];
const table = r.cpu.pooled
  .map(
    (v, i) =>
      `| ${labels[i]} | ${num(v.conditions.baseline.total.median)} | ${num(v.conditions.candidate.total.median)} | ${num(v.conditions['preact-classes'].total.median)} | ${percent(v.change.total)} | ${r.peerRatios.pooled.candidate.items[i].total.toFixed(3)} |`
  )
  .join('\n');
const memory = r.memory.pooled
  .map(
    v =>
      `| ${v.id} | ${num(v.conditions.baseline.median)} | ${num(v.conditions.candidate.median)} | ${num(v.conditions['preact-classes'].median)} | ${percent(v.change)} |`
  )
  .join('\n');
const order = Object.entries(r.weighted)
  .map(
    ([name, v]) =>
      `| ${name} | ${percent(v.total)} | ${percent(v.script)} | ${r.peerRatios[name].candidate.weighted.total.toFixed(4)} |`
  )
  .join('\n');
const b = r.builds.baseline,
  c = r.builds.candidate;
const pass = r.peerRatios.pooled.candidate.items.filter(
  x => x.within110
).length;
const failed = Object.values(r.runs)
  .flatMap(x => Object.values(x))
  .reduce((n, x) => n + x.failedBatches.length, 0);
const warnings = Object.values(r.runs)
  .flatMap(x => Object.values(x))
  .reduce((n, x) => n + x.warnings.length, 0);
const text = [
  '# C4 P2 — owner 컴포넌트와 중첩 수명 확장 (2026-10-29)',
  '',
  `**부모 renew·중첩 컴포넌트·수명/오류 처리를 확장한 C4를 구현했다.** 새 baseline/C4 P2/Preact class11의 공식 CPU ${r.counts.cpu}·메모리 ${r.counts.memory}표본을 양순서 수집했다. C4의 baseline 대비 가중 전체 변화는 **${percent(r.weighted.pooled.total)}**, JS는 **${percent(r.weighted.pooled.script)}**다.`,
  '',
  '정본은 [P2 설계](../performance-improvement/DESIGN.md#dc-26-c4-p2--owner와-갱신-배치-계약), [E0~E4](../performance-improvement/IMPLEMENT.md#c4-p2--후속-실행-e0e4), [M-22](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-22-c4-p2-owner중첩-확장--r89r94)다. [집계 JSON](./c4-owner-results.json), [재현 도구](../../experiments/c4-owner/README.md)를 연결한다. 첫 [C4 P1](./C4_LIST_BOUNDARY_RESULTS.md)의 표본과 합산하지 않았다.',
  '',
  '## 달라진 동작과 남은 범위',
  '',
  '- 목록당 하나의 View 컴포넌트가 content와 mount 세션을 소유한다. 같은 owner identity/위치의 부모 renew는 현재 content를 반환해 item 재방문을 피한다. item slot은 최신 owner wrapper에서 갱신하며 행마다 component를 강제로 추가하지 않는다.',
  '- view/diff의 needDiffRef 문맥을 보존해 중첩 component와 keyed component root를 기존 base 매칭으로 처리한다. props 동기화·자체 renew·다중 DOM 출력·mount/unmount를 검증했다.',
  '- edit(key, fn)는 수정 뒤 자동 알림한다. set/invalidate도 지원하며 직접 외부 mutation에는 명시적 알림이 계속 필요하다. key 변경이나 throw가 이미 발생시킨 데이터 변경까지 rollback하지 않는다.',
  '- 이번 CPU 앱은 P1과 맞춰 set/invalidate로 변경 key를 전달한다. edit는 일반 계약 검사와 Chrome fixture에서 검증했으며 edit 호출 자체의 성능을 별도로 측정한 결과는 아니다. unmount는 원하는 item 데이터를 보존하고 dispose는 controller 소유 참조를 해제한다. 호출자가 보관한 cache의 DOM 수명까지 대신 관리하지 않는다.',
  '- flush가 items/indexes/dirty 배치를 분리해 lifecycle의 새 알림을 다음 배치로 보존한다. k개 slot lookup/view 뒤 index 정렬 O(k log k)로 좌→우 content 순서를 유지한다. 구조 변경은 기존 전체 keyed diff/render와 Map 재작성이다.',
  '- 순수 view 안의 쓰기/flush 재진입은 거부한다. view 오류는 명시적 retry, diff/DOM 오류는 fault로 commit을 잠근 뒤 owner unmount/remount를 요구한다. 최초 view 실패는 owner 세션을 해제하고 dispose는 멱등이다.',
  '- controller당 한 active owner다. 기존 owner cleanup 전에 새 setup이 발생하는 subtree handover/clone은 지원하지 않으며 먼저 별도 commit으로 unmount해야 한다. concurrent·SSR/HMR·공개 API 채택은 미완료다.',
  '',
  '## 새로 확인한 기존 portal 한계',
  '',
  '**BUG-3:** 일반 element 안에 portal을 중첩하면 바깥 element 삭제 후 target 내용이 남을 수 있다. 이번 검사에서 C4와 변경 없는 일반 base 컴포넌트 경로 모두 재현했다. P2가 만든 회귀로 분류하지 않았고 기본 core 수정을 이번 성능 후보에 섞지 않았다. portal teardown 지원 완료나 제품 전체 안정화로 표시하지 않는다.',
  '',
  '## 측정 조건',
  '',
  `Apple M4 Pro 12코어/24GB, Node24.22.1, Vite5.4.8, ${r.runs.main.cpu.chrome}, 비격리 머신이다. B/C는 같은 변경 없는 source core와 원래 A row cache/view를 앱과 함께 production 빌드했다. Preact class11은 보존 source/lock과 검증한 설치 inventory에서 새 staging으로 다시 빌드했다. 원래 sibling·기존 archive를 수정하지 않았다.`,
  '',
  'CPU 조건/차수별 선택25·나머지15, 공식 메모리는 항목/조건/차수별3이다. 차수별 앱 실행 순서는 반대이며 수집 중 build/test/진단 browser를 병행하지 않았다. 같은 환경의 세 앱을 비교했지만 다른 React/Preact peer와 Vue는 측정하지 않았다. 이 한 peer의 1.10 판정을 기존 네 peer 최저 목표로 대신하지 않는다.',
  '',
  '| 차수 | 가중 전체 C/B | 가중 JS C/B | 가중 전체 C/Preact class |',
  '| --- | ---: | ---: | ---: |',
  order,
  '',
  '## CPU 전체 시간',
  '',
  '전체는 클릭→최종 paint ms 중앙값이다. 각 조건 pooled N=30, 선택50이다. 독립 중앙값인 전체·JS·paint를 합산하지 않는다. 차수별/IQR/range·JS/paint·비율은 JSON에 있다.',
  '',
  '| 항목 | B ms | C4 P2 ms | Preact class ms | C/B 변화 | C/P 비율 |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  table,
  '',
  `Preact class 한 구현 대비 전체 시간 1.10 이내는 pooled **${pass}/9**다. 특정 항목의 초과/이득과 각 차수 분포를 함께 읽고 평균만으로 전 항목 우위를 주장하지 않는다.`,
  `같은 수집의 가중 전체 B/Preact class는 ${r.peerRatios.pooled.baseline.weighted.total.toFixed(4)}, C4/Preact class는 ${r.peerRatios.pooled.candidate.weighted.total.toFixed(4)}다. P1의 다른 세션 개선율과 직접 차감하지 않는다.`,
  '',
  '## 공식 메모리와 앱 크기',
  '',
  '| 항목 | B MB | C4 P2 MB | Preact class MB | C/B 변화 |',
  '| --- | ---: | ---: | ---: | ---: |',
  memory,
  '',
  `앱 전체 B→C4 P2는 raw ${b.raw}→${c.raw}B, gzip9 ${b.gzip}→${c.gzip}B, Brotli ${b.brotli}→${c.brotli}B(**+${c.brotli - b.brotli}B**)다. base UMD의 새 크기나 allowance가 아니며 기본 runtime/guard는 변경하지 않았다. P1과 시간 표본을 섞지 않는다.`,
  '',
  '## 검증과 증거',
  '',
  '- Strict types는 source core·B/C·진단 fixture를 확인했다. JSDOM19개 중 18개는 owner/item/오류 계약 검사, 1개는 기존 portal 한계의 동등 관찰이다. CPU 측정 전에 타입 오류와 fault-test 준비 오류를 해결했다.',
  '- 실제 Chrome owner fixture12검사와 기존 앱 진단9개, 세 앱의 공식 keyed/9동작/font를 확인했다. B/C 각각3 fresh contexts에서100회 생성/삭제와100회 partial 후 clear를 수행했고 최종 강제 GC 뒤 DOM/listener 수가 초기값과 같았다. JS heap 수치는 별도 JSON이며 전체 누수 부재의 증명이 아니다.',
  `- 수집 후 추가한 다중 DOM root 교체 오류 진단의 ${d.faultProbe.ownerOnlyLeavesOldElement ? 'owner 재마운트 뒤 잔존 DOM이 관찰됐다' : 'owner unmount/remount로 복구됐다'}. 이 추가 사례는 별도 fault-probe.json에 있으며 일반적인 DOM rollback 전체를 증명하지 않는다.`,
  `- 공식 실패 배치/재시도 ${failed}, CPU/메모리 warnings ${warnings}다. Preact 빌드의 오래된 browserslist 안내는 준비 로그에 따로 남겼다. 초기 v1 strict types와 portal/fault-test 관찰도 성능 표본과 분리했다.`,
  '- 독립 Python으로 분포·가중값·표본 수·반대 순서·peer 비율/1.10 판정·실제 앱 해시를 검산했다. [영구 manifest](./c4-owner-evidence-manifest.json)와 [archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/c4-owner-evidence.tar.gz)에 source/lock·실제 번들·raw/trace·도구/실패·감사를 보존하고 decoded member hash를 대조했다. node_modules와 Chrome 자체는 제외하고 설치 inventory와 binary/engine hash를 남겼다.',
  '',
  '## 판단과 후속',
  '',
  'owner와 중첩 component를 확장한 경로에서 얻은 실제 성능·메모리·크기를 위 표로 판단한다. 제품 기본 채택은 하지 않았다. 다음 제품 계약에는 portal teardown BUG-3, owner handover/clone, 변경 정보 소유권/알림 누락과 concurrent·SSR/HMR을 포함해야 한다. 이번 한 peer 결과를 네 peer/Vue 전체 우위로 표현하지 않는다.',
  '',
  '### 선택 trace와 class 값 별도 진단',
  '',
  '[별도 진단 JSON](./c4-owner-selection-diagnostics.json)은 기존 선택 trace150개와 추가 class 표현 pilot100표본을 연결한다. 주 비교870/90에 pilot을 합산하지 않는다.',
  '',
  `기존 선택 trace의 C4 pooled JS 중앙값은${cg.script}ms, Preact class는${pg.script}ms다. 클릭 thread의 선정 JS/렌더 이벤트 union으로 덮이지 않은 구간의 중앙값은 각각${cg.notCoveredBySelectedEvents}/${pg.notCoveredBySelectedEvents}ms였다. C4의 가장 큰 미포함 구간은${cg.count}개 중${largest[1]}개에서 ${largest[0]} 사이였다. 전체 commit 수 중앙값은${cg.numberCommits}, 검사한 GC 이벤트 coverage 중앙값은${cg.gcEventCoverage}다. 이 구간은 CPU idle이나 특정 scheduler 원인, VDOM 비용으로 귀속한 값이 아니다. 공식 점수 계산은 변경하지 않았다.`,
  '',
  `DOM 검사에서 기존 앱의 비선택 class는 처음에는 없고 선택 해제 뒤 문자열 undefined로 남았다. 대조 앱은 빈 문자열만 쓰도록 한 축을 바꿨다. 양쪽 keyed/9동작/font는 통과했다. 공식 선택 pilot ${d.classPilot.count}표본에서 전체 변화는 첫 차수${percent(d.classPilot.rows.main.change.total)}, 반대${percent(d.classPilot.rows.reverse.change.total)}, pooled${percent(d.classPilot.rows.pooled.change.total)}다. 양순서 모두 전체 감소 여부는 ${d.classPilot.stableTotalReduction}다. 이번에는 방향이 갈려 채택하지 않았다. 초기 생성/메모리에는 class 속성 수 비용도 생길 수 있어 이 pilot으로 전체 개선을 주장하지 않는다.`,
  '',
  '교환 경로의 정적 후속 가설은 C4의 구조 검증 중 추가 n회 Map.get과 중복 keyOf 호출을 key snapshot 증명으로 대체하는 것이다. 검사 자체를 없애거나 성능 이득을 확정한 제안이 아니다. snapshot 배열/쓰기/메모리 비용까지 다음 별도 후보에서 검증해야 한다. 기존 Map 삭제/LIS 미세 최적화의 반복과 구분한다.',
  '',
].join('\n');
fs.writeFileSync('docs/benchmark/C4_OWNER_RESULTS.md', text);
fs.copyFileSync(
  path.join(out, 'results.json'),
  'docs/benchmark/c4-owner-results.json'
);

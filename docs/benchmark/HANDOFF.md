# summary

## 영문 커밋과 DC-15 실제 캐시 비교 완료 — 2026-10-23

- 사용자 요청으로 DC-14 heap 분석·증거와 캐시 비교 사전 계획을 영문 커밋했다.
  **`defa088e9863b6e82ea7f903e86fbcc97354beca`** —
  `perf: attribute parent memo heap growth and define cache comparison`.
- [실제 캐시 비교 보고서](./PARENT_MEMO_CACHE_RESULTS.md), [raw](./parent-memo-cache-results.json),
  [증거](./parent-memo-cache-evidence.json.gz), [도구](../../experiments/parent-memo-cache/README.md)를 읽는다.
  A/B는 원래 앱 default/isolated, C/D/E는 같은 행 앱 off/helper/memo다. 행 세 조건은 같은 JS다.
- done: 다섯 조건 타입·B3 keyed/9동작/font, 행 diagnostic9context·원래 앱 dispose6context 통과.
  기존 same-hash251회귀/dual1,070·3skip/package 증거는 재사용했고 기본28파일/package/sibling을 보존했다.
- CPU1,450/메모리150표본, 양순서·실패 배치0개. Python으로 분포480/가중36개와 메모리 비교를
  독립 감사했고 upstream source/compiled runner/CSS/lock183개도 이전 증거 hash와 일치했다.
- memo의 합산 가중 전체는 **기존 앱 대비+21.08%/JS+70.27%**, 같은 행 helper 대비 **+3.75%**다.
  캐시 없는 행 앱 대비−9.30%와 구분한다. 기존 앱 대비 합산9항목이 모두 느렸고 양차수 전체도
  +22.50%/+20.03%였다. 현재 C3를 기존 앱 개선안으로 채택하지 않는다.
- 10k 공식 MB는 기존 앱27.474→memo36.438(+8.964MB)다. 생성/삭제300회·partial100회/15context에서
  DOM/listener 증가는0이지만 memo 한 context의 추가 heap은 미귀속이다. 장기 누수 부재로 확대하지 않는다.
  공식 측정은2026-10-22UTC, 추가 churn은2026-10-23UTC로 분리했다.
- next: 원래 앱/React·Preact의 전체 항목 비교 조건을 고정해 다음 코어 후보를 선택한다.
  C3 outputs 정리·공개 예산 상향/API 배포·concurrent 확장을 이번 결과에 섞지 않는다.
- blockers: 실행 블로커 없음. 전체peer/색상 임계치·최종 B4/hardening/integration은 미완료다.
- commit: 최신 `defa088`; 이번 DC-15 후속 도구·문서·증거는 작업 트리다.
  출력은 `/tmp/lithent-c3-cache-20261022`이며 아래 기록은 각 당시의 이력이다.

## 영문 커밋과 DC-14 heap 귀속 완료 — 2026-10-22

- 사용자 요청으로 DC-12/DC-13 도구·문서·증거29파일을 커밋했다.
  **`aa20ccc84f4252c46e5a89ce1abb9ead0c6ee387`** —
  `perf: validate isolated parent memo overhead and opt-in tradeoffs`.
- [heap 보고서](./PARENT_MEMO_HEAP_RESULTS.md), [raw](./parent-memo-heap-results.json),
  [증거](./parent-memo-heap-evidence.json.gz), [도구](../../experiments/parent-memo-heap/README.md)를 읽는다.
- done: 기존 DC-13 production JS/HTML/core 그대로300회 churn6context와 별도14 snapshot/2context를 확인했다.
  기본28파일/package/실제 sibling은 보존했고 새 공식 CPU/메모리 표본은0개다.
- outputs WeakMap table은5→25회65,556→262,164B(+196,608B)이며25/100/300회와 마지막 clear의
  ID/크기가 같았다. clear 뒤 table edge는 Hole/엔진 Map뿐이다. 실제 row/memo/snapshot/output은0개,
  App/Table은2개였다. shape상 남는1개는 각 AllocationSite 생성 템플릿으로 경로를 확인했다.
- Python이 전체14개 hash/self size/shape/템플릿과 강한 WeakMap 경로를 별도로 감사했다.
  300회까지 DOM/listener 증가는0이었다. 전체 heap은 이후에도 코드/브라우저 기록 증가가 있고
  on 한 context의 추가 약0.25MB는 미귀속이다. 장기 누수 부재를 확정하지 않는다.
- next: [DC-15 실제 캐시 앱 계획](./PARENT_MEMO_CACHE_PLAN.md)의 기존 앱 default/isolated와
  같은 행 앱 off/helper/memo 다섯 조건을 빌드·타입/B3/diagnostic 검증 후 동차수 공식 비교한다.
  계획CPU1,450·메모리150표본은 미실행이다. outputs 명시적 정리는 별도 개선 가설로 남겼다.
- blockers: 실행 블로커 없음. 다른 heap 변동·전체peer·공개 예산/concurrent·최종 hardening/integration은 미완료다.
- commit: 최신 `aa20ccc`; 이번 DC-14 후속 도구·문서·증거는 작업 트리다.
  출력은 `/tmp/lithent-c3-heap-20261022`이며 아래 기록은 각 당시의 이력이다.

## DC-13 같은 행 앱의 memo on/off 완료 — 2026-10-22

- [기능 대조 보고서](./PARENT_MEMO_OPTIN_RESULTS.md), [raw](./parent-memo-optin-results.json),
  [압축 증거](./parent-memo-optin-evidence.json.gz), [도구](../../experiments/parent-memo-optin/README.md)를 읽는다.
  같은 core/source/production JS에서 HTML 시작 설정만 다르며 모든 동작은 부모 Table renew다.
  row 자체 renew·cacheUpdate/수동 VDOM 캐시는 없다. 원래 캐시 앱의 대조가 아니다.
- done: 앱 타입·B3 keyed/9동작/font·diagnostic6context와 full dispose/GC 통과.
  같은 해시의251회귀/dual1,070·3skip은 재사용했다. 새 재현 빌드/자동 타입 검사도 같은 JS/HTML을 생성했다.
- CPU580표본/실패0: 가중 전체 **−8.12%/JS−13.11%**. 두 차수 전체−8.56%/−8.39%.
  생성/교체/10k 생성 전체 약5% 증가는 함께 공개한다.
- 공식 메모리60표본:1k **+0.343MB(+8.37%)**,10k **+3.231MB(+9.82%)**.
  upstream 비활성23/26의 registry/metadata를 프로세스 안에서만 복원했다.
  초기 등록 오류2회와 유효12표본 resume을 보존했고 workload/GC/측정 API·sibling은 바꾸지 않았다.
  현재 runner의 CPU 부분이 실제 측정 당시와 같음도 감사했다.
- production100회 create/clear·partial100회/조건별3context 완료. DOM/listener 증가는 모두0.
  on heap은5→25회 약0.18MB 증가 후25→100회 약0.015MB 증가했다. 원인은 아직 미귀속이다.
  별도 full dispose에서 key1천개 유지 뒤 등록/관찰한 VDOM/host0개를 확인한 것과 구분한다.
- 기본28파일/package/실제 sibling 앱은 보존했고 별도 UMD br5,691B·기본4,798B다.
  후보는 실험 유지·기본 채택 보류다. 정상 trace580개 inventory/선택4개 내용을 영구 보존한다.
- next: **heap 잔류 원인 분석과 실제 cacheUpdate/원래 앱의 동차수 대조**.
  통제 앱 이득을 원래 앱/전체peer 판정으로 확대하지 않고 C1/C2/C4는 결합하지 않는다.
- blockers: 현재 실행 블로커 없음. 전체peer·concurrent 새 API·공개 진입점/예산·최종 B4/
  hardening/integration·RC-5/IC-1은 미완료다. 출력은 `/tmp/lithent-c3-optin-20261022`다.
- commit: 최신 `d660fdf33578885c9534fec8040ef8b5602bbe23`. DC-12/DC-13 후속은 미커밋이다.

## DC-12 별도 렌더러 격리·비참여 비용 완료 — 2026-10-22

- 사용자 요청으로 앞선 C3 증거/도구/정본 16파일을 영문 메시지
  `perf: preserve C3 parent memo prototype evaluation`로 커밋했다.
  SHA **`d660fdf33578885c9534fec8040ef8b5602bbe23`**.
- [격리 보고서](./PARENT_MEMO_ISOLATION_RESULTS.md)를 먼저 읽는다. 로컬
  `doc-driven-designer-v1` 규칙으로 정본 네 문서의 R18~R20/DC-12/검사·인계를 갱신했다.
  검증된 C3 source 17개를 별도 staging에서 재빌드했고 세 런타임 번들은 이전 후보와 같다.
  기본 source/산출물28개·package.json/exports와 실제 sibling의 targeted 앱을 보존했다.
- staging **251 passed**(shared core218+C3 전용33), 기존 dual **1,070 passed·3 skipped**,
  source/consumer 타입·실제 ESM/CommonJS·private package self-reference/NodeNext·혼용 실패,
  입력 UI9context·원래 앱 B3 keyed/9동작/font를 통과했다. concurrent 새 API는 미지원이다.
- 같은 원래 앱·helper의 비참여 렌더러 대조 **580표본/두 순서/실패0·재시도0** 완료.
  합산 가중 전체 **+0.10%**, JS **+0.32%**. 차수별 전체 **+0.48%/−0.45%**로 작은 차이의
  방향도 달라 불확실하다. 기본 runtime의 회귀나 memo 기능의 이득으로 해석하지 않는다.
- 기본 base br **4,798B**, 별도 전체 렌더러 br **5,691B**. 기본 경로의 추가 bytes/분기는0이지만
  후보 자체를 작게 만들지 않았고 optional 예산/public subpath/배포/채택은 미정이다.
- [raw](./parent-memo-isolation-results.json)/[압축 증거](./parent-memo-isolation-evidence.json.gz)에
  전 표본·source/build/types·러너·lock·명령·로그를 보존했다. 정상 trace는580개 inventory와
  선택 index0의4개 내용만 영구 보존한다. 다른 정상 trace는 임시 출력에만 있다.
- done: DC-12 한정 격리·정합성·비참여 비용 대조·영구 증거. 실행 위치는
  `/tmp/lithent-c3-isolated-20261022`; 공식 두 출력은 `original`, `original-reverse`다.
- next: **같은 행 컴포넌트 앱에서 memo on/off의 공식 CPU·생성/삭제·메모리 대조**.
  기능 이득·비용을 먼저 얻고 공개 진입점/예산을 판단한다. C1/C2/C4는 결합하지 않는다.
- blockers: 현재 실행 블로커 없음. 전체peer·공식 메모리5개·100회 churn·Phase5/6·RC-5/IC-1의
  최종 목표 기준은 미완료다. 다음 한정 실험을 막는 승인 조건으로 다루지 않는다.
- commit: 최신 `d660fdf`; 이번 격리 후속 결과는 작업 트리에 남겼다. 아래 기록은 각 당시의 이력이다.

## C3 base 프로토타입 검증·보존 및 baseline 복원 — 2026-10-22

- 사용자 요청으로 앞선 계약·기준 회귀 6파일을 영문 메시지
  `docs: define C3 parent memo contract and baseline regressions`로 커밋했다.
  SHA **`ddd545e5b8c3878cfd5a6340464106e4c417da4f`**. 이어서 C3 base 후보를 실제 구현했다.
- [C3 보고서](./PARENT_MEMO_RESULTS.md)를 먼저 읽는다. `useParentMemo`의 incoming deps,
  props/slot fallback, parent hit와 self 경계, setup/work 성공 게시·실패/초기화 하위 정리를
  구현·검증했다. **기본 채택 보류**, 후보는 [패치](./parent-memo-candidate.patch)와
  [raw](./parent-memo-results.json)/[증거](./parent-memo-evidence.json.gz)에 보존하고 runtime은 복원했다.
- 전용 **33개**, dual **1,070 passed·3 skipped**, 실제 ESM/CommonJS/consumer 타입·
  concurrent 미지원 import 실패, 같은 원래 앱의 contracts·공식 keyed·9동작·폰트 통과.
- 같은 일반 입력 UI를 baseline/후보 비사용/후보 opt-in 3context씩 검증했다.
  1k 부모 refresh의 자식 updater **1,000→0회**, 한 label/version 변경은 **1,000→1회**다.
  DOM/state/refresh focus와 이동·삭제를 확인했다. key1천개 유지 dispose/GC 뒤 모든 context에서
  등록·관찰한 VDOM/host 생존0개. 이는 작업량/회수 검사이며 공식 시간·메모리 개선율이 아니다.
- 최종 후보 UMD raw15,481/gzip6,169/br**5,691B**, baseline br4,798B보다893B 증가,
  4,800B 한도보다 **891B 초과**다. gzip은 집계 Node20.3/zlib1.2.13 기준이며
  `pnpm size`의 Node22.13/zlib1.3은6,157B다. 양쪽 br는 같고 한도는 바꾸지 않았다.
- base의 실패한 parent diff/live pointer·hook cursor는 자동 롤백되지 않는 기존 한계가 있다.
  memo 실패 상태를 무효화하는 것과 전체 실패 복구를 구분했다. parent selector 오류 뒤의
  명시적 재시도는 이전 unretired tree를 사용했으며 자동 재시도 완료로 해석하지 않는다.
- 18개 후보 파일 해시를 확인하고 자신의 patch만 역적용했다. base rebuild/size 및
  복원 후 base21/concurrent23 회귀 통과. 이전 소스/산출물28개·실제 sibling 앱 해시가 일치한다.
  현재 default export에 새 hook이 없고 concurrent runtime/helper는 바꾸지 않았다.
- 최종 감사: 증거153개 파일 SHA-256·패치 SHA-256·로컬 링크124개·Prettier/ESLint/diff·
  복원한 base TypeScript 검사가 통과했다. 증거 SHA-256은
  `94ed789b1277de331a0f473cd610d057f025d1c22950a36253b377cae43783d8`이다.
- done: C3 base 한정 구현·동작/회수·B1/B3·크기·영구 증거와 baseline 복원.
- next: **DC-12의 기능 격리/고정 비용 절감 설계와 비사용자 비용 대조**. API/subpath/한도 변경을
  미리 확정하지 않는다. 기존 후보의 contract와 동작 증거를 유지한 뒤 새 후보를 비교한다.
- blockers: 현재 사용자 결정 블로커 없음. 공식 CPU/역순/전체peer/공식 메모리/100회 churn/최종 B4는 미실행.
- commit: 최신 `ddd545e` 이후 이번 후보 증거·보고서·재현 도구·정본 갱신은 미커밋.
  새 push·배포는 하지 않았다. `/tmp/lithent-c3-parent-memo-20261022/final`이 최종 실행이며
  앞선 `screen-v1`은 다른 후보 해시이므로 표본/결과를 섞지 않는다.

## C3 한정 계약·기준 회귀 완료 — 2026-10-22

- 로컬 `doc-driven-designer-v1` 에이전트 규칙과 스킬을 적용해 정본 네 문서를
  REQUIREMENTS → DESIGN → IMPLEMENT → MANUAL_TEST_CHECKLIST 순서로 갱신했다.
  **Phase 3의 계약·baseline 회귀만 완료**했으며 C3 API 구현·성능 검증은 다음 작업이다.
- [DESIGN C3](../performance-improvement/DESIGN.md)의 DC-4를 한정 후보 결정으로 닫았다.
  base의 새 setup hook `useParentMemo`에서 incoming props의 deps를 복사해 비교하고,
  key 추가/삭제·nonempty slots·특수 props는 기존 경로로 보낸다. 부모 hit는 live wrapper를
  유지하며 updater와 두 단계 callback을 생략하고, 자체 renew/public replace는 검사를 우회한다.
  스냅샷은 성공한 DOM/post 처리 뒤 게시하고 실패·삭제 시 pending을 정리하는 계약이다.
- 중요한 기준 차이: 같은 task의 parent→child 예약은 **base 자식 1회/concurrent 2회**,
  child→parent는 양쪽 2회다. miss는 이 기존 배칭을 보존하고 hit는 예약된 자체 작업을 소비하지 않는다.
  concurrent 새 API는 첫 후보에서 export하지 않으며 commit/abandon 지원은 새 DC-11로 분리했다.
- 새 [기준 회귀](../../src/tests/core-parentUpdateContract.test.tsx) **10개씩**에서 정확한
  pre/updater/post 순서·변경/동일 props·post callback 재예약·삭제·DOM identity를 확인했다.
  전체 `pnpm test:dual` **1,070 passed·3 skipped**(13개 suite 집계, base runner 409/concurrent runner 312),
  `pnpm exec tsc --noEmit` 통과. baseline 결과를 미구현 후보의 통과로 해석하지 않는다.
- done: C3 DC-4 한정 계약과 기준 회귀. 런타임은 C1 복원 baseline이며 C1 채택 보류·C2 보류를 유지한다.
  복원 manifest의 소스/산출물 28개·실제 sibling 앱 SHA-256 일치, ESLint·Prettier·diff/로컬 파일 링크 검사도 통과했다.
- next: IMPLEMENT Phase 3 **C3-T1~T5**의 후보 전용 테스트·base 구현, 이후 T6/T7의 일반 입력 UI·
  같은 행 구조의 opt-in 대조·비사용자 core-only 비용 검증. C1/C2/C4를 처음부터 결합하지 않는다.
- blockers: 현재 없음. 최종 표의 RC-5/IC-1과 조건부 DC-5/DC-8~DC-11은 각 진입 시점에 닫는다.
- commit: 최신 `b4eef39afa5fcc49937cb2ac168099f664b51fbe`(C1 증거 체크포인트).
  이번 C3 문서·기준 회귀는 미커밋이며 실제 sibling의 기존 targeted 앱을 보존했다.

## C1 검증 커밋·ctxbin 인계 체크포인트 — 2026-10-21

- 사용자 요청으로 아래 C1 보고서·후보 패치·raw/압축 증거·재현 도구·회귀와 정본 계획을
  `perf: preserve C1 parent-position evaluation` 커밋에 보존한다. 정확한 커밋 SHA는
  `git log`와 이번 ctxbin 인계 기록에 남긴다. 아래 미커밋 표기는 각 측정 당시의 이력이다.
- 런타임은 복원된 base 1.25.2/concurrent 0.2.2다. 이번 커밋은 C1 기본 채택이 아니다.
  다음은 Phase 3 DC-4의 C3 계약 검토이며 실제 sibling의 기존 targeted 앱을 보존한다.
- 이번 요청은 커밋과 ctxbin 인계 저장이며 새 push·배포는 하지 않는다.

## C1 부모 위치 검색 후보 검증 완료 — 2026-10-21

- [C1 보고서](./PARENT_POSITION_RESULTS.md)를 먼저 읽는다. base 부모 children의 위치 캐시를
  구현해 검증했고 **기본 코어 채택은 보류**, 후보 패치·raw·압축 증거를 보존한 뒤 runtime을 복원했다.
- 일반 10k 항목 중 1k 반복 자체 갱신은 JS+nextTick **약 17~18% 감소**했다. 부모 검색 예상 방문
  4,996,000회를 1,000회 위치 확인으로 대체했다. slot 검색과 원래 Table의 전체 순회는 남는다.
- 동일 원래 앱의 공식 9항목 **290표본**에서는 가중 전체 **−0.55%**, JS **−1.13%**.
  부분 갱신 −4.4%, 선택 +6.2%로 엇갈렸다. 한 차수이며 역순·전체 React/Preact 비교는 미실행이다.
- 일반 1k 컴포넌트를 모두 갱신한 GC 후 JS heap은 중앙값 **+82.5KiB (+3.0%)**.
  1천 key를 유지해도 dispose 후 1천 VDOM/부모 배열은 양쪽 3context씩 모두 회수됐다.
  초기 검사 코드의 참조 보관 오류를 수정했고 최종 `diagnostic-v3`만 수치에 사용했다.
- 후보 brotli **4,853B**, baseline 대비 +55B/한도 +53B. dual **1,050 passed·3 skipped**,
  production 계약·keyed·9동작·폰트 통과. size는 실패로 공개했고 한도는 바꾸지 않았다.
- done: C1 한정 검증·증거 보존·두 코어 재빌드·기존 size 복원. 개별 회귀/메모리 증가만으로
  기각한 것은 아니며, 작은 단일 차수 전체 신호·미해결 주 병목·크기 비용으로 채택을 보류했다.
- next: **C3의 부모 기인 갱신 생략과 자체 renew 보존 계약**을 DC-4에서 구체화한다.
  C2는 시간상 기각 없이 보류하고, C1의 저장 구조 절약·slot/concurrent 확장도 별도 후보로 남긴다.
- blockers: 현재 사용자 결정 블로커 없음. Phase 4~6 및 최종 표의 색상/수치 목표는 미완료다.
- commit: Phase 1 `979f88f222c45cadadd1871d8d9f861a5e71f9a0` 이후 이번 변경은 미커밋.
  새 push·배포는 하지 않았고 실제 sibling의 기존 targeted 앱 수정은 보존했다.

## 범용 코어 구조 개선 Phase 2 착수 — 2026-10-21

- 사용자의 커밋 후 바로 다음 페이즈 진행 요청으로 Phase 1의 문서·도구·증거 9파일을
  `979f88f222c45cadadd1871d8d9f861a5e71f9a0`에 커밋하고, [정본 Phase 2](../performance-improvement/IMPLEMENT.md)의
  **C1 한정 프로토타입**을 시작한다. 기존 Phase 1 보고서는 측정 당시 기록으로 보존한다.
- done: DC-6에서 **base 부모 children 검색만** lazy `WeakMap<CompKey, WeakMap<WDom[], number>>`
  sidecar로 다루는 후보를 확정했다. 현재 배열·노드 identity를 검증하고 성공 위치만 저장하며 stale은
  native fallback이다. slot은 raw 설명 alias의 첫 등장 증명 부족, concurrent는 commit 경계 차이로 미수정이다.
- next: C1만 독립 구현해 회귀·cold/warm/stale 작업량·새 WeakMap/생성/유지 비용·production 사전 비교·
  크기와 회수를 확인한다. 원래 Table의 전체 순회·조상 slot 검색·render 앵커 검색은 남는다.
  후보 검증 완료·최종 채택은 아직 아니며 실패 후보도 소스·증거를 보존한다.
- blockers: 사용자 결정이 필요한 현재 블로커 없음. base **4,800B** 게이트와 최종 채택 전 Phase 4~6 검증은 유지한다.
- commit: Phase 1 `979f88f222c45cadadd1871d8d9f861a5e71f9a0`. Phase 2 변경은 미커밋이며 push·배포는 하지 않았다.

## 범용 코어 구조 개선 Phase 1 완료 — 2026-10-21

- 사용자의 후속 착수 요청으로 로컬 `doc-driven-designer-v1` 에이전트·스킬을 적용해
  [정본 실행 계획](../performance-improvement/IMPLEMENT.md)의 **Phase 1 기준선·비용 분해**를 완료했다.
  아래의 계획만 수행했다는 문단은 앞선 Phase 0의 이력이다. 새 채택 구현이나 성능 개선 판정은 없다.
- 문서·설계와 실행·증거 책임을 나누고 테스트·빌드·브라우저 계측은 실행 담당이 직렬 수행했다.
  원래 앱·실제 upstream의 targeted 실험 앱·새 staging을 구분하고, 기존 보고서·실측은 보존한다.
- done: 런타임·앱/runner 조건 재확인, 1k/10k·변경 수/위치별 **38개 진단**, B1 dual·B2 build/size·
  B3 양쪽 contracts 및 공식 keyed·9개 동작·폰트 검증 완료. [보고서](./STRUCTURAL_BASELINE_RESULTS.md),
  [raw manifest·카운터](./structural-baseline-results.json), [영구 증거](./structural-baseline-evidence.json.gz),
  [재현 도구](./structural-baseline.mjs)에 보존한다. 새 코어 후보·공식 CPU/메모리 비교는 없다.
- next: 일반 nested slot에서도 검색 증가가 확인되어 **C1 한정 프로토타입**을 우선한다.
  컴포넌트 소유 hint의 parent/각 slot 배열 참조·index 검증을 검토하고, 저장 방식·생성/이동 유지비·
  concurrent commit publication을 DC-6에서 확정한다. C1은 원래 Table의 n개 순회를 해결하지 않는다.
  C2는 시간상 기각 없이 보류하며 C3의 parent-refresh updater n+1 근거는 별도 계약 연구로 유지한다.
- blockers: Phase 1 완료의 블로커 없음. DC-6은 C1 구현 전, IC-1 최종 색상/수치 임계치는 최종 판정 전에 닫는다.
  base **4,800B** 크기 게이트를 유지하며, 한도 변경은 별도 명시적 결정이 필요하다.
- commit: Phase 0 문서 체크포인트 `dbbd320a5b92c63262d43b667692396ae5d53322`,
  런타임 기준 `085137b0447a8bbe7d28d3bf55c0a997779132b2`. 이번 실행 변경은 미커밋이다.

## 범용 코어 구조 개선 계획 — 2026-10-21

- 사용자는 작은 앱 최적화의 후속 upstream PR보다 **일반 앱에도 적용되는 코어의 구조적 개선**을
  우선하기로 했다. `doc-driven-designer-v1` 서브에이전트의 초안과 부모 검토로 문서·계획 작성을
  완료했다. 이번 단계에서는 런타임 구현이나 새 성능 측정을 시작하지 않았다.
- 현재 계획의 정본은 [REQUIREMENTS](../performance-improvement/REQUIREMENTS.md),
  [DESIGN](../performance-improvement/DESIGN.md), [IMPLEMENT](../performance-improvement/IMPLEMENT.md),
  [MANUAL_TEST_CHECKLIST](../performance-improvement/MANUAL_TEST_CHECKLIST.md)다.
  과거 Map/LIS 계획은 이력으로 보존하고, 아래 실험 보고서는 측정 당시의 결과로 유지한다.
- 일부 개별 시간·메모리 손해를 허용하는 사용자 기준을 유지한다. 전체 가중 시간의 개선과
  최종 비교표의 모든 항목이 빠른 범위에 드는 것은 다른 판정이며, 어느 쪽도 아직 달성을 보장하지 않는다.
- 앱 후보는 개선 가능한 작업을 찾는 근거다. `full`의 수동 행 VDOM 캐시와 `retained-row`의
  코어 관리 VDOM 참조 읽기는 각각 추가 설명이 필요하며, 둘 다 upstream의
  [수동 DOM·VDOM 캐싱 주석 #1261](https://github.com/krausest/js-framework-benchmark/issues/1261)
  적용 가능성이 있다. 이는 검토상 추론이며 PR 거절 확정이 아니다. 공개 API 사용·동작 검사 통과만으로
  무주석 통과를 주장하지 않는다. 벤치마크 전용 코드를 코어/helper에 숨기는 방식은 개선 범위가 아니다.
- 후보 검토는 전체 방문량, 목록 구조 검사·매칭·배치, 부모의 컴포넌트 재실행과 자체 renew 비용을
  나눠 다룬다. 기존 계약으로 가능한 생략과 추가적인 변경 정보가 필요한 경로를 구분하고,
  임의의 mutable 상태 변경을 코어가 자동으로 안다고 가정하지 않는다.
- 기준 커밋 `085137b0447a8bbe7d28d3bf55c0a997779132b2`는
  `origin/docs/select-partial-update-analysis`에 푸시되어 있다. 다음 구현은 정본 계획의 기준선·계약
  확인부터 시작하며, 아래의 1.25.2 런타임과 실제 upstream 실험 앱의 구분을 유지한다.

## 목표 재확인과 체크포인트 — 2026-10-21

- 사용자의 목표는 **일부 항목의 시간·메모리 손해를 허용하더라도 최종 비교표의 모든 항목을
  충분히 빠른 색상 구간(최근 표현은 파란 구간)에 넣는 것**이다. 라이브러리 코어 변경도 허용한다.
  원본 대비 한 항목이라도 느리면 자동 탈락시키는 기준으로 바꾸지 않는다.
- 앞선 답변에서 초기 행별 renew 후보와 후속 후보를 구분하지 않고 전체 이득이 없다고 설명한
  부분을 정정했다. [현재 행 VDOM 재사용 후보](./STRUCTURAL_UPDATE_RESULTS.md)는 원래 앱 대비
  메인 차수의 가중 전체 시간이 **−2.1%**, JS가 **−9.4%**였다. 1,000행 메모리는
  **3.506 → 4.145MB (+0.639MB, +18.2%)**이며, 이 증가 자체를 치명적이라고 판단할 근거는 없다.
  전체 삭제 등 개별 손해는 남고, 전체 9항목의 반대 순서 재측정과 React·Preact 비교는 미완료다.
- 별도 [전체 행 VDOM 캐시 후보](./OVERALL_UPDATE_RESULTS.md)의 `full`도 첫 차수 가중 전체
  **−3.0%**였다. 이 후보는 메모리·반대 순서 검증이 남았다. 두 후보의 측정 차수를 섞지 않는다.
  둘 다 **앱 구조 개선** 결과이며 코어 개선으로 표현하지 않는다.
- 현재까지 모든 항목이 목표 색상 범위에 들어갔다고 확인된 후보는 없다. 이는 목표가 불가능하거나
  1.25.2가 최적이라는 뜻이 아니다. 후속 검토는 일부 손해 자체보다 최종 상대 성능과 전체 이득을
  판단해야 한다. 색상은 비교 대상·표 설정에 의존하므로 같은 환경의 전체 항목 비교가 필요하다.
- 원래 진단의 넓은 순회는 남아 있다. 1,000행의 선택·부분 갱신 모두 캐시 검사와 목록 매칭을
  수행하며, 최근 세 코어 후보는 순회 내부 비용을 줄였을 뿐 전체 방문 범위를 없애지 않았다.
- 런타임은 복원된 상태다. base 소스 16개와 ESM·UMD·CJS는 npm **1.25.2**와 일치하고,
  실제 `../js-framework-benchmark-upstream`의 앱은 이전 `targeted-main.tsx` 실험본이다.
  라이브러리 동일성과 벤치마크 앱 동일성을 혼동하지 않는다.
- 사용자 요청으로 실험 보고서·원본 증거·재현 도구·keyed 회귀 테스트와 이 판단을 커밋하고,
  `npx ctxbin help`로 사용법을 확인한 뒤 컨텍스트에 남기는 체크포인트다. 아래의 미커밋·미배포
  표현은 각 실험 당시 기록이며, 보존한 측정 시점 HEAD·해시·채택 결정을 덮어쓰지 않는다.

## 동일 VDOM 타입 비교 후속 검토 — 2026-10-21

- [TYPE_IDENTITY_CORE_RESULTS.md](./TYPE_IDENTITY_CORE_RESULTS.md)를 먼저 읽는다.
  원본 앱·helper를 고정한 세 번째 코어 후보도 **미채택**이다. 두 코어의 타입 비교에서
  동일 객체를 바로 판정하고, base에서는 복제 검사에 사용한 비교 결과를 재사용했다.
- 최종 구현의 공식 CPU **580개 표본**에서 가중 전체 시간은 첫 차수 **+0.40%**, 반대 순서
  **−0.13%**, 합산 **−0.02%**로 사실상 같았다. JS는 합산 **−0.57%**였다.
  선택은 **−0.7% / −1.4%**였지만 부분 갱신은 **+1.5% / +1.7%**, 추가는 **+1.0% / +0.8%**다.
- 앞선 사전 구현의 **290개 표본**은 가중 전체 **−1.2%**였지만 크기 한도를 2B 넘었다.
  최종 구현에서 base 크기를 원래의 **4,798B**로 맞춘 뒤 새로 측정했으며,
  사전 결과를 최종 개선율에 섞지 않았다. 공식 표본은 합계 **870개**다.
- 고정 Chrome **155.0.8059.85**의 실행 파일·엔진과 번들 해시는 두 최종 차수에서 같다.
  차수 사이 약 4시간 43분의 간격과 비격리 시스템 부하를 기록했다. 실패 배치·재시도는 없었다.
- 최종 후보의 dual 단위 테스트, 브라우저 **64개**, 공식 keyed·9개 동작·폰트·DOM 계약,
  두 코어 빌드·크기 검사 통과. 전체 이득이 없어 추가 메모리·retention 검사는 생략했다.
- **현재 런타임은 다시 실험 전 상태다.** 두 코어의 ESM·UMD·CJS·소스맵을 재빌드했고,
  base 소스 16개와 세 번들 형식은 npm **1.25.2**와 일치한다. 캐시·keyed 소비 계약
  **4개씩**도 복원 후 통과했다. 크기는 base **4,798B**, concurrent **6,903B**다.
  `core-keyedConsumption.test.tsx`와 측정 도구·보고서·원본 증거는 유지한다.
- 실제 upstream 앱은 이전 행별 renew 후보 그대로다. 이번 코어 변경을 반영하거나 그 앱을
  전체 최선으로 재선정하지 않았다. 버전 변경·커밋·배포는 하지 않았다.

## 전체 성능 우선 코어 후보 검토 — 2026-10-20

- 사용자는 라이브러리 코어 수정도 허용하며 전체 성능을 우선한다고 재확인했다.
  원본 upstream 앱·helper를 고정하고 **두 코어 후보**를 각각 분리해 구현·검증했다.
  공식 CPU는 base 대상이며, concurrent도 같은 변경의 동작·빌드를 검증했다.
- [순서 유지 목록의 할당 감소](./ORDERED_CORE_RESULTS.md)는 **미채택**이다.
  가중 전체 시간은 첫 차수 **+1.2%**, 후속 **−0.2%**로 일관된 이득이 없었다.
  두 차수 사이 Chrome이 **.82→.85**로 바뀌었으므로 **580개 표본을 합산하지 않는다**.
- [keyed 매칭의 Map 삭제 제거](./KEYMATCH_CORE_RESULTS.md)도 **미채택**이다.
  고정 Chrome **155.0.8059.85**에서 순서를 뒤집은 두 차수 **580개 표본**을 완료했다.
  가중 전체 시간은 **+2.5% / +0.7%**, 합산 **+1.7%**이며 부분 갱신·교환·전체 삭제가
  두 차수 모두 느렸다. 첫 차수 선택의 CDP 시간 초과 2회와 전체 배치 재시도도 기록했다.
- 두 후보의 dual 단위 테스트, 브라우저 통합 **각 64개**, 공식 keyed·9개 동작·폰트·DOM
  계약 검사·빌드·크기 검사는 통과했다. 추가 메모리 검사는 CPU 채택 기준 탈락 뒤 생략했다.
- **런타임 변경은 모두 복원했다.** 두 코어의 ESM·UMD·CJS·소스맵을 재빌드했으며,
  변경 파일과 ESM·UMD는 실험 전 해시와 같다. base 런타임 소스 16개와 세 번들 형식은
  npm **1.25.2**와 일치한다. base br **4,798B**, concurrent **6,903B**다.
  새 `core-keyedConsumption.test.tsx`는 유지했고 복원한 두 코어에서도 통과했다.
- 측정 도구에 `LITHENT_CHROME_BINARY`와 실행 파일·Chrome Framework의 시작/종료 해시
  검사를 추가했다. 각 보고서의 JSON·압축 evidence에 실제 사용한 소스·번들·러너를 보존했다.
- 실제 upstream 앱은 이전 `targeted-main.tsx` 그대로다. 선택·부분 갱신을 우선했던 이 앱을
  전체 최선으로 재선정한 것이 아니다. **이번 후보에서 전체 개선을 입증하지 못했다**는 결론이며,
  현재 구현이 모든 가능한 개선 중 최선이거나 공개 표의 모든 항목이 초록색이라는 뜻은 아니다.
  버전 변경·커밋·배포는 하지 않았다.

## 전체 성능 우선 앱 후보 사전 비교 — 2026-10-20

- [OVERALL_UPDATE_RESULTS.md](./OVERALL_UPDATE_RESULTS.md)에 원본 앱과 `full`, `scalar`,
  `static`의 공식 CPU **580개 표본**을 보존했다. 코어·helper는 모두 npm **1.25.2**다.
- 첫 차수의 가중 전체 시간은 `full` **−3.0%**, `static` **−1.9%**, `scalar` **−0.3%**다.
  `full`이 가장 균형 잡혔으나 생성이 소폭 느려졌고 메모리·반대 순서는 미측정이다.
- 사용자가 코어 개선을 우선한다고 재확인해 위 코어 실험으로 전환했다. 앱 후보는
  사전 비교 단계에서 **미채택**이며 실제 upstream에 설치하지 않았다. 후보별 strict 타입·
  lint·형식, 공식 keyed·9개 동작·폰트·DOM 계약 검사는 통과했다.

## Fragment 일괄 제거 실험 — 2026-10-19

- [BULK_REMOVAL_RESULTS.md](./BULK_REMOVAL_RESULTS.md)를 먼저 읽는다. base·concurrent에서
  중첩된 행 컴포넌트의 실제 DOM 루트가 부모 자식 전체와 일치할 때 한 번에 제거하는 후보를
  구현·검증했으나 **미채택**했다. 현재 런타임과 실제 upstream 앱은 실험 전 그대로다.
- Chrome에서 1,000행 제거 기록은 **1,000개 → 1개**로 줄었다. 공식 전체 삭제는 두 차수에서
  **14.267 → 13.632ms**, **15.444 → 14.152ms**로 개선됐다. 정리 콜백 순서는 보존했다.
- 그러나 선택 전체 시간이 메인 **5.001 → 5.778ms**, 반대 순서 **4.194 → 5.496ms**,
  추가 차수 **3.979 → 4.449ms**로 늘었다. 추가 차수의 동일 기준 번들 대조군은 **4.033ms**다.
  JS·paint 합계 밖의 간격이 차이에 기여했지만 원인 확정은 아니다. 선택 이득을 보존했다고
  판단할 수 없어 후보를 복원하지 않는다. 행 캐시 조합도 전체 삭제·교체의 손해가 남아 미채택이다.
- 공식 CPU **800개 표본**, 후보의 dual 단위 테스트·브라우저 통합 **64개**·공식 keyed·9개 동작·
  폰트·DOM 계약 검사 통과. 메모리 추가 측정은 성능 기준에서 탈락한 뒤 실행하지 않았다.
- [bulk-removal-results.json](./bulk-removal-results.json)과
  [bulk-removal-evidence.json.gz](./bulk-removal-evidence.json.gz)에 소스·번들·테스트·원본을
  보존했다. 후보 전용 테스트는 압축본에만 남긴다. 복원 후 두 코어 소스·ESM·UMD의 해시가
  실험 전과 같고 크기는 base **4,798 / 4,800B**, concurrent **6,903 / 9,000B**다.
  버전 변경·커밋·배포는 하지 않았다.

## 구조 갱신 비용 재검토 — 2026-10-19

- [STRUCTURAL_UPDATE_RESULTS.md](./STRUCTURAL_UPDATE_RESULTS.md)를 먼저 읽는다. 행별 renew의
  선택·부분 갱신을 유지하면서 부모가 변경 없는 행 컴포넌트를 다시 실행하는 비용을 줄일 수 있었다.
- [현재 VDOM 재사용 후보](./retained-row-main.tsx)는 공개 `getComponentSubInfo(key, 'vd')`의
  참조를 읽어 이미 마운트된 행을 재사용한다. 코어·helper 변경과 DOM 직접 조작은 없다.
  이 앱의 고정 props·명시적 행 renew 조건에 의존하는 실험이며 임의의 컴포넌트에 일반화하지 않는다.
- 메인 차수에서 앞선 후보 대비 교환 **24.082 → 17.448ms**, 한 행 삭제 **13.831 → 11.492ms**.
  선택 **3.881 → 3.507ms**, 부분 갱신 **14.629 → 14.403ms**로 두 항목의 이득을 유지했다.
- **미채택이다.** 전체 삭제·교체가 반대 순서에서도 악화됐다. 두 차수 합친 전체 시간은 각각
  **15.548 → 17.142ms (+10.2%)**, **30.112 → 31.366ms (+4.2%)**다. 9개 항목 평균이
  앞선 후보 대비 3.5% 좋아졌다는 이유로 개별 악화를 숨기지 않는다.
- 별도 [평범한 행 후보](./structural-main.tsx)는 구조 갱신을 회복했지만 선택이
  **4.670 → 7.286ms**로 느려져 미채택했다. 두 실험의 공식 CPU는 총 **930개 표본**이며
  추가 차수의 trace는 별도 경로로 보존한다. 다음 개선 지점은 Fragment 목록의 일괄 삭제와
  생명주기 계약을 보존하는 명시적인 컴포넌트 캐시다.
- 실제 upstream 앱은 앞선 `targeted-main.tsx` 그대로다. 실험 소스와 검증 자료만 추가했다.
  버전 변경·커밋·배포는 하지 않았다.

## 행별 renew 후보 검증 — 2026-10-19

- 사용자가 지정한 `~/project/js-framework-benchmark-upstream`에서 선택·부분 갱신을 개선했다.
  [TARGETED_UPDATE_RESULTS.md](./TARGETED_UPDATE_RESULTS.md)와 [최종 앱](./targeted-main.tsx)을 먼저 읽는다.
- 코어·helper는 npm 1.25.2 그대로다. 선택은 이전·새 행, 부분 갱신은 변경 행의 `renew`를 호출한다.
  원본 공식 러너의 최종 CPU 530개 표본에서 부분 갱신은 **18.265 → 15.474ms**, 선택은
  **7.369 → 4.387ms**다. Preact classes의 **15.240 / 4.570ms**와 비슷한 수준이다.
- **전체 성능 개선안으로 해석하지 않는다.** 교환·삭제·추가가 느려져 9개 CPU 항목의 첫 차수
  가중 전체 시간은 **+4.7%**, 가중 JS는 **+12.8%**다. 1,000행 메모리도 **3.502 → 4.421MB (+26.2%)**다.
  두 항목을 우선하는 검토용 후보로 실제 upstream 작업트리의 `src/main.tsx`에 반영했다.
- 전후·비교군 4개 모두 공식 keyed·9개 동작·폰트 검사 통과. 일괄 갱신 순서, 선택 후 구조 변경,
  20회 갱신/삭제/재생성도 검사했다. 3차수의 100회 생성·삭제 후 DOM/리스너는 **63 / 32**로 회수됐다.
- strict TypeScript, 앱 ESLint, Prettier, 크기 검사 통과. 마지막 타입 단언 보완 전후와 실제 upstream
  빌드가 측정한 JS와 바이트까지 같다. 최종 실제 파일도 공식 keyed·동작·폰트 재검사를 통과했다.
- [targeted-update-results.json](./targeted-update-results.json),
  [targeted-update-evidence.json.gz](./targeted-update-evidence.json.gz)에 표본·소스·번들·해시를 보존했다.
  초기 후보 240개 표본은 별도 보존하고 최종 수치에 합치지 않았다. 버전 변경·커밋·배포는 하지 않았다.

## 행 선택·부분 갱신 진단 — 2026-10-18

- [SELECT_PARTIAL_UPDATE_ANALYSIS.md](./SELECT_PARTIAL_UPDATE_ANALYSIS.md)에 공식 앱과 npm
  `lithent@1.25.2`의 계측 결과를 정리했다. 런타임과 벤치마크 앱은 수정하지 않았다.
- 선택 이동은 DOM class 2개, 부분 갱신은 텍스트 100개만 바꾸지만, 두 경우 모두 캐시 검사가
  1,000회 발생했다. 전체 diff 호출은 각각 1,021회·1,903회이며, DOM 정체성은 유지됐다.
- 전체 Table 갱신과 keyed 목록 처리, 변경 행의 VDOM 재생성이 비용의 주요 경로다.
  행 컴포넌트 갱신은 Table 1회이며, LIS와 DOM 이동은 없었다.
- 원본 표본·소스·번들·프로파일을 `select-partial-results.json`과
  `select-partial-evidence.json.gz`에 보존했다. 로컬 진단 시간은 공식 점수 재현이 아니며,
  개선 후보는 아직 적용하거나 검증하지 않았다.

## base 크기 게이트 해결 — 2026-10-08

- 사용자 요청으로 기존 55B 초과를 해결했다. 코어 로직을 바꾸지 않고 UMD 출력의 지역 변수명과
  출력 형식만 정리했다. Terser의 `compress`는 끄고, ESM은 기존 빌드를 유지한다.
- base brotli **4,855 → 4,758B**, 한도 **4,800B**보다 **42B** 작다. gzip은 122B 줄고 raw는
  61B 늘었다. concurrent **6,385 / 9,000B**, element **998 / 1,000B**는 그대로다. `pnpm size` 통과.
- 먼저 [UMD_SIZE_REVIEW.md](./UMD_SIZE_REVIEW.md)를 읽는다. ESM core는 바이트·해시까지 동일해
  기존 benchmark 결과를 유지한다. UMD CPU 성능은 별도로 재측정하지 않았다.
- `pnpm build:core`, `pnpm test`, 변경 파일 ESLint, `pnpm verify:release` 통과. 실제 UMD의 브라우저
  검사 18회가 전후 동일하고, CommonJS export 21개와 소스맵 원본 14개 파일도 동일하다.
- [umd-size-results.json](./umd-size-results.json), [umd-size-evidence.json.gz](./umd-size-evidence.json.gz)에
  원본을 보존했다. 측정 당시 미커밋 변경을 사용자 요청으로 이 체크포인트 커밋에 포함해
  `origin/master`로 푸시한다. 버전은 여전히 base `1.23.0`, concurrent `0.1.2`다.
  아래 크기 게이트의 55B 초과 기록은 이 빌드 변경 전의 기록이다. 버전 변경·배포는 남아 있다.

## 수정·검증 체크포인트 커밋 — 2026-10-08

- 사용자 요청으로 아래 props·portal 오류 수정, 회귀 테스트, 호환성·성능 검증 도구와 원본을
  이 인계 파일과 함께 체크포인트 커밋에 보존한다. 전체 삭제 함수 분리 후보는 포함하지 않는다.
- 현재 `main`의 추적 브랜치는 `origin/master`다. 앞서 커밋한 `4356120` 성능 개선과 이
  체크포인트를 함께 해당 원격 브랜치로 푸시한다. 버전 변경·패키지 배포는 이번 요청 범위에 없다.
- 아래의 미커밋·커밋·푸시하지 않았다는 표현은 각 검증 당시의 기록이다. 측정 당시 HEAD와
  소스·번들 해시를 현재 커밋으로 바꾸지 않는다. base 크기 게이트의 55B 초과는 그대로 남는다.

## 전체 삭제 후속 후보 검증 — 2026-10-08

- 사용자가 전체 삭제 개선의 가능성과 의미를 물어봐, portal 호스트 정리를 별도 함수로
  분리하는 작은 후보만 검증했다. **미채택**이며 런타임은 아래 props·portal 수정본 그대로다.
- 공식 CPU **210개 표본**에서 전체 삭제는 3차수 모두 전체 **0.6~3.5%**, JS **3.8~9.6%**
  줄었다. 하지만 한 행 삭제는 두 순서 모두 전체 **2.6~4.8%**, JS **1.9~3.4%** 늘었고,
  base·concurrent 압축 크기도 각각 12B 늘어 후보만 되돌렸다. 새 종합 점수는 계산하지 않았다.
- [UNMOUNT_PERFORMANCE.md](./UNMOUNT_PERFORMANCE.md)를 먼저 읽는다.
  [unmount-results.json](./unmount-results.json)과 [unmount-evidence.json.gz](./unmount-evidence.json.gz)에
  210개 공식·144개 진단 원본, 양쪽 소스·번들과 `reject` 결정을 보존했다.
- 후보와 복원 후 base 18개·concurrent 22개 계약 검사, 두 코어 빌드와 변경 파일 ESLint 통과.
  후보의 양쪽 공식 keyed·9개 동작·폰트 검사도 통과했다. 복원한 9개 런타임 소스와 base
  번들의 해시가 기준과 일치한다. 기존 전체 검증의 런타임을 복원했으므로 전체 검사는 반복하지 않았다.
- 일반 DOM 리스너 정책·props 오류 수정·외부 portal 정리는 유지했다. 크기는 다시
  base **4,855 / 4,800B**로 55B 초과다. 추가 구조 최적화·버전 변경·커밋·배포는 하지 않았다.

## props·portal 수정의 CPU 영향 검증 — 2026-10-08

- 사용자 요청으로 수정 전 마지막 성능 종료본과 현재 수정본을 같은 base benchmark 앱·helper로
  공식 CPU 비교했다. 기준 앱 번들이 이전 측정의 SHA-256과 정확히 일치한다.
- 9개 항목 290개 표본과 전체 삭제의 반대 순서 30개를 완료했다. 첫 차수의 가중 수정 후/전은
  전체 **0.9968**(약 -0.3%), JS **0.9999**(거의 동일)다. 공개 공식 점수나 새 타 프레임워크 비교는 아니다.
- **전체 삭제는 두 순서 모두 느려졌다.** 각 30개를 합치면 전체 **12.632 → 13.688ms (+8.4%)**,
  JS **10.302 → 11.139ms (+8.1%)**다. 종합 결과가 비슷하다는 이유로 이 악화 신호를 숨기지 않는다.
- 먼저 [COMPATIBILITY_PERFORMANCE.md](./COMPATIBILITY_PERFORMANCE.md)를 읽는다.
  [compatibility-performance-results.json](./compatibility-performance-results.json)과
  [compatibility-performance-evidence.json.gz](./compatibility-performance-evidence.json.gz)에 원본을
  보존했다. 아래 동작 수정 결과와 이전 성능 수치는 덮어쓰지 않았다.
- 양쪽 공식 keyed·9개 동작·폰트 검사 통과. benchmark 저장소 tracked 파일은 바꾸지 않았다.
  항목별 순서 교대는 wrapper의 선택적 환경 변수이며 공식 러너의 계산과 설정은 변경하지 않았다.
- 이번 턴에서 런타임은 추가 수정하지 않았다. 일반 DOM의 개별 리스너 해제는 여전히 복원하지
  않았으며, props·외부 portal 호스트 오류 수정은 유지한다. 크기 게이트의 55B 초과도 남아 있다.

## props와 portal 이벤트 수정 완료 — 2026-10-08

- 사용자의 후속 요청으로 실제 props 반영 오류와 살아 있는 외부 portal 호스트의 이벤트 누적을
  두 코어에서 고쳤다. 일반 DOM 삭제 시 개별 리스너 정리를 생략하는 정책은 유지한다.
- component props 갱신은 own enumerable string key만 삭제·복사한다. DOM props는 inherited
  enumerable 키까지 반영하되 hidden/shadowed prop이 이전 attribute·handler를 남기지 않는다.
- shared unmount 순회에서 portal 호스트의 handler만 정리한다. concurrent의 portal-containing
  새 subtree는 commit에서 DOM을 만들도록 바꿔 중단·재시도의 외부 호스트 이벤트 누적도 막았다.
- 새 shared 회귀 14개와 concurrent 전용 4개, `pnpm test:dual`, `pnpm test`, 두 코어 빌드,
  strict TypeScript, 변경 파일 ESLint와 Playwright 52개가 통과했다.
  Chrome 비교 도구의 36개 실행에서도 두 코어의 portal 제거/destroy 후 호출은 모두 0회다.
  `pnpm verify:release`의 세 패키지와 공개 import 11개·strict consumer 타입 검사도 통과했다.
- [COMPATIBILITY_REVIEW.md](./COMPATIBILITY_REVIEW.md)의 후속 수정부터 읽는다.
  [compatibility-fixed-results.json](./compatibility-fixed-results.json)과
  [compatibility-fixed-evidence.json.gz](./compatibility-fixed-evidence.json.gz)에 실행 원본과 해시를
  보존했다. 초기 재현 자료와 과거 성능 수치는 덮어쓰지 않았다. 당시에는 동작만 검증했고,
  후속 CPU 측정은 위 항목에 따로 기록했다.
- 기존 크기 한도는 유지했다. base br **4,855 / 4,800B**로 이전보다 92B 늘었고,
  `pnpm size`는 **55B 초과로 실패**한다. concurrent **6,385 / 9,000B**, element **998 / 1,000B**.
  릴리스 시 크기 기준을 판단해야 한다. 버전 변경·커밋·푸시·배포는 하지 않았다.

## 배포 전 호환성 검토 — 2026-10-08

- 사용자가 성능 변경의 기존 동작 위험성을 먼저 확인하도록 요청했다.
  [COMPATIBILITY_REVIEW.md](./COMPATIBILITY_REVIEW.md)를 먼저 읽는다.
- 이후 사용자가 기존과 달라도 사용성·성능상 옳은 변경은 유지한다는 기준을 명확히 했다.
  일반 DOM 삭제의 리스너 정리 생략은 유지하며 복원하지 않는다. Preact 10.29.8의 실제
  unmount·event prop 소스에서도 같은 삭제 정책을 확인했다.
- `326a181`과 `4356120`을 두 코어의 같은 브라우저 재현 코드로 비교했다.
  props 제거 판단의 회귀와 저수준 portal 호스트의 리스너 누적을 재현했다.
  버려진 DOM의 리스너 유지도 기존 동작과 다른 정책 변경임을 확인했다.
- 기존 dual과 Playwright 52개는 다시 통과했지만 위 조건을 검출하지 못했다.
  현재 상태의 바로 배포를 권하지 않는다. 코드·버전은 변경하지 않고 검토 원본만 보존했다.
- 성능 종료 결과는 유지한다. 다음 수정 대상은 최신 props 반영 오류와 외부 portal 호스트의
  핸들러 누적이다. 이전 동작과 다르다는 이유만으로 성능 변경을 되돌리지 않는다.
  이번 검토 자료는 미커밋이며 커밋·푸시·릴리스는 사용자 요청 시 진행한다.

## 성능 작업 완료 — 2026-10-08

- 사용자가 마지막 동일 VDOM 후보를 검증한 뒤 성능 작업을 마무리하도록 요청했고 완료했다.
  먼저 [PERFORMANCE_CLOSEOUT.md](./PERFORMANCE_CLOSEOUT.md)를 읽는다.
- 동일 VDOM 조기 반환은 **미채택**이다. 공식 CPU 9개 항목 290개 표본과 부분 갱신의
  역순 비교 30개를 완료했다. 선택·교환·삭제의 JS는 약 21~32% 줄었지만 부분 갱신의 전체
  시간은 두 순서에서 약 7~11% 늘었다. 환경 오차는 남지만 안정적인 전체 개선을 확보하지
  못해 후보만 되돌렸다. 기존 생성 경로 타입 비교 생략은 유지한다.
- 측정 당시 core HEAD는 `039cba6`이며, 당시 미커밋 소스는 결과 파일의 해시로 식별한다.
  성능 수정·계약 테스트·측정 자료는 이 문서를 포함한 체크포인트 커밋에 보존한다.
  벤치 앱 `8839611`은 변경하지 않았다.
  base br **4,763 / 4,800B**, concurrent **6,249 / 9,000B**, element **998 / 1,000B**.
- 후보의 dual·전체 단위 테스트, core 빌드, ESLint, Playwright 52개와 A/B keyed·동작 검사를
  완료했다. 후보 제거 후 캐시 계약 3개를 각 코어에서 다시 검사하고 core 번들 해시가
  기준 스냅샷과 같은지 확인했다.
- [identity-results.json](./identity-results.json), [identity-evidence.json.gz](./identity-evidence.json.gz)에
  미채택 후보의 원본과 `reject` 결정을 보존했다. 새 계약 테스트는
  `src/tests/core-cachedIdentity.test.tsx`다. 이전 결과는 덮어쓰지 않았다.
- 배포 준비 확인에서 `pnpm verify:release`도 통과했다. 3개 패키지의 manifest·exports·bin,
  별도 설치 환경의 공개 import 11개와 strict JSX/core/helper 타입을 검사했다.
  npm 최신 `lithent`는 `1.23.0`으로 확인했다. 새 버전 배포는 아직 하지 않았다.
- **이 성능 작업에서 더 진행할 후보는 없다.** 사용자의 요청으로 체크포인트를 커밋한다.
  푸시·릴리스·등재 PR은 별도 요청 시 진행한다. 추가 성능 탐색을 자동으로 시작하지 않는다.

## 생성 경로 후속 작업 완료 — 2026-10-08

- 현재 코어 경로: `/Users/n250109005/project/lithent`, `main`, 추적 브랜치 `origin/master`.
  아래 후속 변경은 이 문서를 포함한 체크포인트 커밋에 보존한다. 벤치 저장소는 `8839611` 그대로다.
- 1,000/10,000행 생성의 CPU·할당 프로파일링을 끝냈고, 이전 VDOM이 없는 노드의
  타입 비교 생략만 base/concurrent에 적용했다. 자식 없는 노드 준비 생략은 채택하지 않았다.
- 공식 러너 150개 CPU 표본: 1,000행 생성 JS 중앙값 **9.564 → 9.128ms**(약 -4.5%),
  전체 **28.673 → 28.380ms**(약 -1.0%). 두 실행 순서 모두 JS 개선을 확인했다.
  교체·추가는 JS가 줄었지만 전체 중앙값은 조금 늘었다. 시스템 부하·페인트 변동이 남는다.
- `pnpm test:dual`, `pnpm test`, base/concurrent 빌드, 변경 파일 ESLint,
  Playwright 52개, A/B 공식 keyed·9개 동작·폰트 검사 통과.
- 현재 크기: base br **4,763 / 4,800B**(여유 **37B**), concurrent **6,249 / 9,000B**,
  element **998 / 1,000B**.
- 먼저 [CREATION_PROFILE.md](./CREATION_PROFILE.md)를 읽는다.
  [creation-results.json](./creation-results.json)과 [creation-evidence.json.gz](./creation-evidence.json.gz)에
  원본 시간 표본·프로파일·사용한 번들을 보존했다. 이전 결과 파일은 수정하지 않았다.
- 당시 후속 후보였던 동일 VDOM 조기 반환은 위 최종 검증에서 미채택으로 종료했다.
  추가 생성·갱신 최적화는 별도 작업으로 다룬다. 푸시·릴리스는 사용자 요청 시 진행한다.

## 이전 체크포인트

2026-10-08 인계. 사용자가 벤치 측정 검토, `cacheUpdate` 확인, 벤치 앱 최적화를 요청했고,
구현·재측정·검증을 완료했다. 이어 이번 변경의 커밋·푸시와 ctxbin 컨텍스트 업데이트를 요청했다.
당시 다음 작업이었던 **1,000행 생성 경로 프로파일링**은 위 후속 작업에서 완료했다.
릴리스와 upstream 등재 PR은 하지 않았다.

먼저 읽을 파일:

1. 이 파일 — 현재 상태, 결정, 다음 작업.
2. [PRODUCTION_RESULTS.md](./PRODUCTION_RESULTS.md) — 최종 결과와 재현 방법.
3. [production-results.json](./production-results.json) — 전체 원본 표본과 소스·번들 SHA-256.
4. [STATUS.md](./STATUS.md), [FOLLOWUP_ANALYSIS.md](./FOLLOWUP_ANALYSIS.md) — 과거 측정·후보·등재 절차.
   아래의 과거 "미커밋" 및 크기 여유 1B 표기는 당시 기록이다.

저장소와 커밋:

- 코어: `/Users/superlucky84/project/lithent`, `main`, 원격 `superlucky84/lithent`.
  - `71e54c1`: 버려지는 DOM의 리스너 해제 제거(이번 세션 시작 전에 존재).
  - `2fcd091`: 해당 변경과 측정 문서(이번 세션 시작 전에 존재).
  - `0746966`: `cacheUpdate` 의존 배열 길이 변경 처리와 계약 테스트.
  - `183fec7`: base/concurrent 부모 getter 격리 및 이전 VDOM 회수 회귀 테스트.
  - 이 인계 파일을 포함한 후속 docs 커밋에 측정 스크립트와 모든 결과를 보존한다.
- 벤치 앱: `/Users/superlucky84/project/js-framework-benchmark`, `main`, 원격 `superlucky84/testbench`.
  - `8839611`: 행별 컴포넌트 제거, keyed 행 캐시, 전체 화면 Lithent 렌더.
  - `origin/main` 푸시 완료. upstream `krausest/js-framework-benchmark`에 등재한 것은 아니다.

최종 코어와 helper 변경은 위 source 커밋을 기준으로 한다. 결과 JSON의 `libraryHead`와
`benchmarkHead`는 **측정 당시 HEAD**이며, 당시 미커밋 소스는 `finalSources` 해시로 식별한다.
커밋한 뒤라고 측정 메타데이터를 현재 HEAD로 바꾸지 않는다.

완료한 결과:

- 기존 벤치의 고정 2요소 `cacheUpdate`는 정상 적용됐다. 배열 길이가 달라질 때의 별도 API 오류를
  수정했다. 기존 테스트의 반환하지 않은 `nextTick().then(...)`도 `await`로 고쳤다.
- 벤치 앱은 행별 `mount`를 없애고 행 모델의 `cacheUpdate`로 keyed `tr`를 반환한다.
  의존성은 `[row.label, selectedId === row.id]`, 선택/삭제 핸들러는 행마다 한 번 생성한다.
  버튼 영역은 한 번 렌더하고 Table만 `renew`한다.
- 부모 getter가 이전 diff 스코프를 보유하던 오류를 base/concurrent에서 수정했다.
  1,000행을 유지하며 100회 부분 갱신한 뒤 GC 후 JS heap이 **17.769 → 4.026MB**로 줄었다.
  생성·삭제 100회 뒤 DOM 노드는 **63 → 63**, 이벤트 리스너는 **32 → 32**로 유지된다.
  라벨은 갱신마다 정상적으로 길어지므로 약간의 힙 증가는 실제 데이터 증가다.
- 같은 코어로 앱 변경만 비교한 1차 CPU 지표는 **1.609 → 1.388**(약 13.8% 감소).
  이 차수의 Preact hooks는 1.529, React hooks는 1.565다.
- 최종 부모 getter 수정의 별도 CPU 비교는 최종/수정 전 **1.0059**(약 +0.6%),
  최종/Preact hooks **0.9111**(약 8.9% 빠름)이다. 메모리 회수를 고치며 CPU 비용을 대체로 유지했다.
  두 차수의 지표를 섞어 최종 vanillajs 대비 점수를 계산하지 않는다.
- CPU 총 **1,595개 표본**, 공식 UASM 메모리 **84개 표본**.
  최종 공식 메모리 중앙값: 1,000행 **3.574MB**, 5회 갱신 **3.563MB**, 10,000행 **27.989MB**.
- 최종 크기: base br **4,757 / 4,800B**, concurrent **6,254 / 9,000B**, element **998 / 1,000B**.
  base 여유는 **43B**다. 앱 HTML+JS gzip 합계 **6,178B**(기존 6,262B).

검증은 이미 완료했다:

- `pnpm test:dual`: base/concurrent 및 관련 패키지 통과. helper는 각 모드 51개 통과.
- `pnpm exec playwright test`: **52개 통과**, 이전 VDOM 회수 검사 포함.
  회수 테스트는 수정 전 두 코어 모두 이전 span/Fragment 51개가 남아 실패했고,
  수정 후 현재 1개씩만 남아 통과했다.
- 변경 파일 ESLint, core/helper/concurrent 빌드, `pnpm size` 통과.
- 실제 벤치 앱 TypeScript 검사와 Vite 프로덕션 빌드 통과.
- 1차 8개 앱 및 최종 3개 앱의 공식 keyed 검사와 동작·DOM 정체성·폰트 로딩 확인.
- 두 저장소 `git diff --check` 통과.
- 로컬 검사 로그: `/tmp/lithent-dual-parent.log`, `/tmp/lithent-e2e-parent.log`.
  `/tmp`가 사라져도 소스·테스트·원본 결과는 저장소에 남아 있다.

# decisions

- **커밋은 매번 사용자가 요청했을 때만 한다.** 이번 요청은 이번 체크포인트의 커밋·푸시다.
  다음 세션의 새 변경을 자동으로 커밋하거나 릴리스하지 않는다.
- 공식 러너의 warmup, CPU throttling, GC, 새 탭, trace와 paint 계산은 변경하지 않았다.
  직접 DOM 조작, 앱 이벤트 위임, 측정 타이밍을 이용한 별도 렌더 경로를 쓰지 않았다.
- `cacheUpdate`는 반환한 VDOM의 memoization이며 batching 기능이 아니다.
  프레임워크는 자식 컴포넌트를 자동으로 생략하지 않으므로, 행에 필요하지 않은 mount 비용을 앱에서 줄였다.
- 정적 HTML 버튼도 upstream 규칙상 허용된다. 화면 전체 Lithent 렌더가 등재 필수라는 이전 해석은
  수정했다. 최종 앱은 전체 화면을 렌더하지만 초기 script 비용은 약 0.3ms 증가했다.
- 기존 생성·삭제 5회 메모리만으로 "누수 없음"을 주장하지 않는다. 이번 수정은 재현한 이전 VDOM
  보유 경로의 회수를 검증한다. 모든 가능한 누수의 부재를 증명한 것은 아니다.
- 과거의 `bindRedraw` 규칙을 유지한다: renew 호출 당시의 노드를 갱신하되 부모가 갱신하면 건너뛴다.
  concurrent에는 이 최적화를 이식하지 않았다. concurrent의 commit/publish 동작을 존중한다.
- 기존 실험의 반대 근거도 유지한다: props의 `Object.keys`를 `for...in`으로 바꾸면 Proxy의
  상속 키 deleteProperty 동작이 달라진다. 개별 후보의 개선율은 더해서 계산하지 않는다.

# open

- 이전 측정의 1,000행 생성: Lithent **28.433ms**, Preact **25.848ms**.
  후속 생성 최적화 결과는 `CREATION_PROFILE.md`를 참고한다. 이번 차수에 Preact를 다시 측정하지
  않았으므로 과거 Preact 값과 새 Lithent 값을 섞어 개선 후 차이를 계산하지 않는다.
- 동일 VDOM 조기 반환은 최종 앱·코어로 검증하고 미채택으로 종료했다.
  최종 후보 크기는 +21B였다. empty 삭제, key 이동, parent 링크, props 재사용, 갱신 콜백과
  concurrent 동작 검증은 통과했지만 전체 성능 개선을 안정적으로 확보하지 못했다.
- 과거 빈 배열·빈 훅 큐 생략 후보도 미적용이다. 이번에 종료한 성능 작업에서 추가 검토하지 않는다.
- npm 릴리스와 등재 PR은 미진행. 마지막 확인에서는 npm `lithent` 1.23.0에 이번 성능 작업이 없었다.
  실제 릴리스 전에 registry 버전을 다시 확인하고 CHANGELOG·버전·`pnpm verify:release`를 준비한다.
  concurrent 변경과 미릴리스 SSR 속성 escaping 수정(`d41ff48`)도 릴리스 범위에 포함해 검토한다.
- adoption 정책 항목(지원 범위, 취약점 신고, 응답 기한, deprecation)은 유지보수자 결정이 필요하다.
- 같은 tick의 부모·자식 renew가 base에서는 자식 1회, concurrent에서는 2회 실행되는 기존 차이는
  `src/tests/core-updatePaths.test.tsx`에 남아 있으며 이번에 변경하지 않았다.

# next

1. 이 인계와 `PERFORMANCE_CLOSEOUT.md`를 읽고 두 저장소의 `git status --short --branch`와
   `git log -5 --oneline`으로 확인한다. 현재 후속 변경은 미커밋이고 성능 작업은 완료다.
2. 사용자가 요청하면 이번 생성 최적화·프로파일·회귀 테스트·종료 자료의 커밋·푸시를 준비한다.
3. 사용자가 릴리스/등재를 요청하면 별도로 준비한다. 등재용 앱은 로컬 `file:` 의존성 대신
   개선을 포함한 npm 배포본을 고정 버전으로 사용해야 한다.

재현의 기본 순서(전체 조건은 PRODUCTION_RESULTS.md):

```sh
pnpm build:core
pnpm build:helper
node docs/benchmark/production-prepare.mjs
node docs/benchmark/production-run.mjs verify
node docs/benchmark/production-run.mjs cpu
node docs/benchmark/production-run.mjs mem lithent-before,lithent,preact-hooks,react-hooks,vanillajs
node docs/benchmark/production-run.mjs retention lithent-before,lithent,preact-hooks
```

비교 구현들의 설치와 실제 `build-prod`, `webdriver-ts/dist`는 먼저 준비해야 한다.
prepare는 저장된 이전 **앱**과 현재 앱을 **현재 dist**로 빌드한다.
기록된 수정 전 코어와의 비교를 자동으로 복구하는 명령은 아니다.
getter 수정의 격리 프로토타입은 `parent-retention.mjs`, 실제 브라우저 회귀 검사는
`e2e/parent-retention.spec.ts`를 참고한다.

# risks

- 측정 머신은 실제 확인한 **Apple M4, 10코어, 24GB**, Chrome **154.0.8037.98**이다.
  과거 M4 Pro 표기는 이번 환경과 다르다. 비교 버전은 Preact 10.27.1, React 19.2.0,
  Solid 1.9.3, Svelte 5.42.1, Vue 3.6.0-alpha.2, Vite 5.4.21이다.
- 전용 격리 머신이 아니었다. 최종 선택 시나리오의 시작 load가 5.82였다.
  선택/삭제의 작은 변동을 코어 수정 때문이라고 확정하지 않는다.
- 가중 지표는 공식 표 가중치를 로컬 중앙값에 적용한 수치이며 공개 공식 점수가 아니다.
  GC 후 JS heap과 공식 UASM 메모리 값도 서로 다른 측정이다.
- 원본 JSON은 보존한다. 새 실험은 `LITHENT_PRODUCTION_OUT`으로 새 디렉터리를 지정한다.
  기본 `/tmp/lithent-production-review`와 `webdriver-ts/results/`는 새 실행에 덮어써질 수 있다.
- CPU/메모리 측정을 동시에 실행하지 않는다. 중단된 측정은 동일 소스·번들·버전에 한해
  `LITHENT_PRODUCTION_RESUME=1`로 완료된 묶음을 보존하고 실패한 묶음 전체를 다시 측정한다.
- Bootstrap 폰트는 git 무시 대상이다. 새 checkout에서 `css/bootstrap/dist/fonts/`를 복원하고
  verify로 실제 폰트 응답을 확인한다.
- 원격 ctxbin save/load에는 네트워크가 필요하다. sandbox에서 NETWORK가 발생하면 반복하지 말고
  허용된 네트워크 환경에서 한 번 다시 시도한다. 컨텍스트에는 비밀 정보를 넣지 않는다.
- 기존 `audit.mjs` 일부 문자열 교체는 최신 소스에 적용되지 않을 수 있다. 진단 스크립트가
  실제 소스를 바꾸는지 확인하며, 다른 미커밋 파일을 `git checkout`으로 되돌리지 않는다.

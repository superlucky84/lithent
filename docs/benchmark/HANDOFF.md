# summary

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

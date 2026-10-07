# summary

2026-10-08 인계. 사용자가 벤치 측정 검토, `cacheUpdate` 확인, 벤치 앱 최적화를 요청했고,
구현·재측정·검증을 완료했다. 이어 이번 변경의 커밋·푸시와 ctxbin 컨텍스트 업데이트를 요청했다.
다음 세션의 우선 작업은 **1,000행 생성 경로 프로파일링**이다. 릴리스와 upstream 등재 PR은 하지 않았다.

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

- 1,000행 생성: 최종 Lithent **28.433ms**, Preact **25.848ms**, 약 10% 차이가 남는다.
  10,000행 생성과 추가도 프로파일링 후보다.
- 동일 VDOM 객체가 돌아올 때 `makeNewWDomTree` 입구에서 조기 반환하는 후보는 아직 적용하지 않았다.
  과거 진단은 약 +17B와 작은 개선 신호가 있었지만 최종 앱·코어로 새 측정이 필요하다.
  empty VDOM 삭제, key 이동, parent 링크, props 재사용, concurrent 동작을 함께 확인해야 한다.
- 과거 빈 배열·빈 훅 큐 생략 후보도 미적용이다. 현재 병목과 측정에서 가치가 있는지 다시 판단한다.
- npm 릴리스와 등재 PR은 미진행. 마지막 확인에서는 npm `lithent` 1.23.0에 이번 성능 작업이 없었다.
  실제 릴리스 전에 registry 버전을 다시 확인하고 CHANGELOG·버전·`pnpm verify:release`를 준비한다.
  concurrent 변경과 미릴리스 SSR 속성 escaping 수정(`d41ff48`)도 릴리스 범위에 포함해 검토한다.
- adoption 정책 항목(지원 범위, 취약점 신고, 응답 기한, deprecation)은 유지보수자 결정이 필요하다.
- 같은 tick의 부모·자식 renew가 base에서는 자식 1회, concurrent에서는 2회 실행되는 기존 차이는
  `src/tests/core-updatePaths.test.tsx`에 남아 있으며 이번에 변경하지 않았다.

# next

1. `npx ctxbin skill load ctxbin` 후 `npx ctxbin ctx load lithent/main`으로 컨텍스트를 읽는다.
   두 저장소의 `git status --short --branch`와 `git log -5 --oneline`으로 체크포인트를 확인한다.
2. 생성 경로의 VDOM/props/DOM 할당과 row 캐시·핸들러 초기화 비용을 프로파일링한다.
   이번에 끝낸 전체 비교 측정을 이유 없이 처음부터 반복하지 않는다.
3. 후보 하나씩 적용해 의미 있는 동작 검증과 같은 조건의 A/B 측정을 한다.
   동일 VDOM 조기 반환은 현재 43B 여유 내에서 다시 검토할 수 있다.
4. 변경이 유효하면 필요한 dual/browser 테스트와 크기 검사를 완료한다.
   성능이 좋아진 후보만 공식 러너로 확인하고 새 결과 파일에 저장한다.
5. 사용자가 릴리스/등재를 요청하면 별도로 준비한다. 등재용 앱은 로컬 `file:` 의존성 대신
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

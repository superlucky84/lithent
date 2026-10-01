# MANUAL_TEST_CHECKLIST — Concurrent 렌더링 릴리스 전 수동 확인

- 작성일: 2026-08-28 (최종 수정: 2026-10-01)
- 대상: `feat/concurrentRendering` — `lithent-concurrent` 별도 빌드 (T1 스케줄러 / T1.5 순수화·tearing / T2 파이버)
- 사전 조건: `pnpm build && pnpm test` 전량 통과 상태에서 수행
- 자동화: 기존 CLI·산출물 검사 + Playwright/Chromium 실제 브라우저 검사 (DC-21, 20개 통과)
- 섹션 B 수행: `pnpm dev:concurrent` → `/html/transition.html`
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [IMPLEMENT.md](./IMPLEMENT.md)
- 배포 준비: DC-22의 버전·영문/국문 기능 문서·pack 검사(H) 진행 예정. 실제 publish와 추가 커밋은 별도 요청.

> **단계별 적용 범위**: A·B·D는 T1부터, C·F는 T1.5부터, E는 T2부터.
> 착수하지 않은 단계의 섹션은 `N/A`로 표기한다.
>
> **B~F는 `lithent` → `lithent-concurrent` alias를 적용한 앱에서 수행한다.**
> 기본 코어는 동결이므로 동작 변화가 없어야 한다 (A-7).
>
> **현재 상태 (2026-10-01)**: 기존 미완 27개 중 **24개를 이번 CLI/E2E 근거로 완료**했다.
> 남은 것은 **A-3 성능 회귀, A-7 과거 릴리스 비교, B-1 입력 응답성 측정**이다.
> C/F는 이번 E2E로 재확인했고 E는 2026-09-02 기록을 유지한다. 이번에 E의 새 성능 측정은 하지 않았다.
> 새 배포 준비의 H 항목은 구현·검증 결과를 받은 뒤 별도로 체크한다. T1 단독 3-5/3-5b는 현재 T2 범위에 N/A다.
>
> **B-2 판정 시 주의**: 전환은 렌더를 미루지 상태를 미루지 않는다. 같은 컴포넌트가
> 전환 도중 급한 갱신으로도 렌더되면 전환 값이 즉시 보이는 것이 **정상**이다
> (REQUIREMENTS §8 "RC-2의 단서").
>
> **B-3 판정 시 주의**: `hasPendingRender`는 조회일 뿐 스스로 리렌더를 일으키지 않는다.
> pending 표시는 sync로 렌더되는 부모·형제에 두고 확인할 것 (§8 "RC-3의 단서").
>
> **import 경로**: 코어는 alias(`lithent` → `lithent-concurrent`)로 바꾸고,
> `deferred`/`ldeferred`/`hasPendingRender`는 `lithent-concurrent/helper`에서 가져온다.
> `lithent/helper`(기본)의 `lstate`/`computed` 등은 그대로 쓴다.
> 내부 store 통지는 기본 코어에서 무동작이며 concurrent 전용 공개 API는 별도 helper에 둔다 (DC-13/DC-17).

## 실행 방법과 근거 구분 (DC-21)

`pnpm test:e2e`는 준비된 출시 빌드를 Chromium에서 검사하고,
`pnpm test:e2e:build`는 빌드 후 같은 검사를 실행한다. 기대 코어를 base/concurrent로
명시하고 검사 이름·개수·완료 상태를 단언한다. 기능 탐지로 검사 항목을 생략하지 않는다.
검사 0개·누락·모듈 미실행·예상 코어 불일치·예상하지 않은 pageerror/콘솔 오류·시간초과는 실패다.
실패 trace를 보존하고 핵심 검사는 돌연변이로 실패 가능성을 확인한다.

| 항목 | 기본 확인 방법 | 종료 근거 / 남은 판단 |
|---|---|---|
| A-1·2·4·5·8·9·11, G-1·2·3 | 기존 CLI·산출물·문서 확인 | 최신 명령/HEAD/결과와 해당 단언 기록 |
| A-6·10, B-2~9, D-1~4 | 출시 빌드 base/concurrent Playwright E2E | 실제 DOM·이벤트·순서·노드 동일성·HMR 교체 |
| A-3·B-1 | 별도 반복 성능 측정 | 기기/브라우저/시나리오/샘플·상대 비교 및 DC-6/RC-10 판정 |
| A-7 | size 가드 + 과거 릴리스 앱 동작 비교 | **과거 릴리스 기준 미확정. 크기만 통과해도 전체 완료 아님** |

E2E 순서는 consumer/C/F 및 B-4/B-9 → B-2/B-3/B-5·context/lcontext·portal →
SSR/hydration/HMR → examples/docs·하드닝이다 (IMPLEMENT E2E-0~4).
성능(A-3/B-1), 과거 릴리스 기준(A-7), 릴리스·npm 공개·3-5/3-5b 판단은 기능 E2E 통과와 별개로 기록한다.

## A. 자동 검증 + 빌드 무결성 (릴리스 직전 1회)

> **A-1·2·4·5·8·9·11은 기존 CLI·산출물 검사를 사용한다.** A-6/A-10은 실제 브라우저에서
> Provider 탐색·갱신 및 소비자 앱을 확인한다. A-7은 크기와 이전 릴리스 동작 비교를 함께 요구한다.
>
> ```bash
> pnpm build
> pnpm test
> pnpm size
> pnpm test:dual
> pnpm verify:concurrent
> node docs/performance-improvement/bench/verify-order.mjs
> ```

- [x] A-1. `pnpm build && pnpm test` 전량 통과 (0 실패) — 2026-10-01, build exit 0 / test 413회 실행
- [x] A-2. `node docs/performance-improvement/bench/verify-order.mjs` → ALL PASS — 2026-10-01
- [ ] A-3. `node docs/performance-improvement/bench/bench10k.mjs` → 회귀 판정
  - T1·T1.5: 회귀 0
  - T2: DC-6 기준(대규모 시나리오 총 체감) 적용
- [x] A-4. 크기 실측 — 2026-10-01 concurrent **6,149 B / T2 9,000 B**, base **4,734 B / 4,800 B**
- [x] A-5. **Fragment 동일성**: concurrent 빌드에서 `checkFragmentFunction(Fragment) === true`
  (alias 함정 — DESIGN §2.2. 자동 테스트 0-5가 있어도 릴리스 빌드 산출물로 1회 확인)
  > Phase 0에서 `concurrent-aliasFragment.tsx`로 자동화됨. 여기서는 **소스가 아니라
  > `lithentConcurrent/dist/lithentConcurrent.mjs`를 import해서** 확인하는 것이 목적이다.
- [x] A-6. **기존 `getParent` 계약**: 양쪽 출시 빌드에서 `context`·`lcontext`의
  Provider 탐색과 갱신이 동작 — DC-19의 스택 순회이므로 노드 `return` 포인터·shim은 사용하지 않는다
- [ ] A-7. **기본 코어 무회귀**: `pnpm size` 통과 (`dist/lithent.umd.js` br ≤ 4,800 B) **이고**
  기본 코어로 빌드한 예제 앱의 동작이 이전 릴리스와 동일
  > 과거 릴리스/행동 기준은 미확정. 현행 base 앱 E2E가 성공해도 과거 동등성을 단독으로 증명하지 못한다.
  > 2026-10-01 크기 가드 4,734 / 4,800 B와 `src/` 무변경은 확인했지만 전체 항목은 미완이다.
- [x] A-8. **RC-9 이중 실행**: `pnpm test:dual` 통과 — 위성 스위트가 양쪽 코어에서 동일 결과
- [x] A-9. **타입 선언 자립**: concurrent의 `.d.ts`만으로 외부 소비자 파일이
  `tsc --strict`를 통과한다 (`@/…` 잔여 specifier 0건 — DESIGN D13)
- [x] A-10. **소비자 alias 시나리오**: 번들러에서 `lithent` → `lithent-concurrent`로 바꾼
  앱이 동작하고, 서브패스(`lithent/helper`, `lithent/jsx-runtime`)는 **실제 패키지로 남는다**
  (DESIGN D14 — anchored 매칭)
- [x] A-11. **`lithent-concurrent/helper` 해석**: 위 alias 상태에서
  `import { ldeferred } from 'lithent-concurrent/helper'`가 동작한다

## B. 스케줄러 동작 (실브라우저) — T1부터

> `pnpm dev:concurrent` → `/html/transition.html`.
> 세 섹션이 각각 어떤 항목을 덮는지, 무엇이 기대 동작인지 화면에 적혀 있다.
> B-6~B-8은 기존 앱(`pnpm dev` / `dev:examples` / `dev:docs`)에서 확인한다.
>
> 수동 데모의 렌더 횟수 비교는 B-5의 보조 근거다. B-2는 pending 중 이전 DOM,
> B-4/B-9는 실행 순서, B-3는 비반응성 조회 계약을 직접 검사한다.
> E2E는 출시 번들을 사용하며 기존 데모의 소스 alias만 검사하지 않는다.
> B-1은 렌더 횟수만으로 입력 응답성을 판정하지 않고, 큰 워크로드의 입력 지연·최장 블록을
> 동일 조건에서 반복 측정한다. 커밋이 지배적인 대량 교체는 이득이 없는 것이 허용된다 (RC-10).

- [ ] B-1. **입력 응답성**: 무거운 저우선순위 갱신 대기 중 텍스트 입력이 끊기지 않는다
  (빌드가 지배적인 시나리오의 base/concurrent 상대 비교로 판정. 별도 성능 측정 필요)
- [x] B-2. **이전 화면 유지**: `deferRender` 갱신 완료 전까지 이전 내용이 그대로 보인다
  (빈 화면·깜빡임 없음)
  > 같은 컴포넌트에 sync 갱신을 넣지 않는 조건이다. 그런 갱신이 들어오면 새 클로저 값의 즉시 노출은 정상이다.
- [x] B-3. **hasPendingRender**: pending 조회가 대기 중 true·완료 뒤 false
  > 조회값과 표시 갱신을 구분한다. pending 자체는 리렌더하지 않으며 sync 부모/형제의 갱신으로 표시를 확인한다.
- [x] B-4. **급한 갱신 우선**: 저우선순위 대기 중 급한 갱신이 먼저 반영된다
- [x] B-5. **대기 중 갱신 수렴**: 전환 중 값을 연속 변경해도 최종 값 1개만 렌더되고
  중간 값이 화면에 나타나지 않는다 (deferred 패널의 `renders` ≪ 타자 수)
  > 대기 중 병합되는 갱신을 검사하고 최종 값 수렴을 단언한다. 이미 커밋된 값까지 숨기는 계약은 아니다.
  > 중단된 빌드 폐기는 DC-18의 폐기 자격을 지키는 별도 시나리오로 검사한다.
- [x] B-6. 전용 portal fixture에서 저우선순위 갱신 후 host 위치·내용 정상 — 2026-10-01 두 코어
  > `e2e/fixtures/integration.html`의 host 내용 갱신·앱 본문 중복 부재를 확인했다. 기존 `html/portal.html` 직접 실행과 구분한다.
- [x] B-7. examples의 명시적 5개 페이지에서 인터랙션 정상, 콘솔 에러 0건 — 2026-10-01 두 코어
  > E2E 대상 페이지·행동 목록과 출시 코어 선택을 기록한다. 페이지 진입 성공만으로 전체 기능 통과로 세지 않는다.
- [x] B-8. docs 예제 42개 경로 및 대표 데모·가이드 이동 정상 — 2026-10-01 두 코어
  > 같은 기준으로 대표 문서 탐색과 실행되는 코드 데모의 이벤트·결과를 확인한다.
  > 42개 경로의 정확한 기대 heading을 비교하고 computed/store/keyed/context/portal 대표 데모를 조작한다.
  > 잘못 열린 페이지의 heading도 보인다는 이유로 통과시키지 않는다.
- [x] B-9. **BC-4**: `await nextTick()` 직후에는 저우선순위 렌더가 **미반영**,
  `await whenIdle()` 직후에는 **반영**된다 (문서화된 대로 동작하는지)

## C. 라이프사이클 순서 (BC-1) — T1.5부터 — **전 항목 통과 (2026-09-02)**

2026-10-01 `contracts.spec.ts`의 C/F 검사로 재확인했다. 검사표 12개·C-1~6/F-1~3 이름·실패 0개·
재실행 및 base/concurrent의 의도된 C-6 차이를 단언했다. 아래 2026-09-02 기록은 유지한다.

```bash
pnpm check:lifecycle      # C와 F를 한 페이지에서 자동 검사
```

> **C-6은 "같아야 통과"가 아니다.** BC-1은 의도된 차이이므로 **정확히 이렇게 달라야**
> 통과다 — base `[A:1, B:2]`(첫 형제가 절반만 지어진 DOM), concurrent `[A:2, B:2]`
> (완성된 커밋). 결과 DOM은 같아야 한다. 같은 값이 나오면 오히려 실패다.

- [x] C-1. `mountCallback`이 DOM 삽입 **후** 1회만 실행 ✅ 2026-09-02 (base 2회 · concurrent 2회)
- [x] C-2. `mountReadyCallback`이 DOM 삽입 **전** 실행 ✅ 2026-09-02 (양쪽 코어)
- [x] C-3. keyed 리스트 추가/삭제/정렬 반복 시 마운트·언마운트 1:1 ✅ 2026-09-02 (10 = 10, 양쪽)
  (콘솔 로그 카운트)
- [x] C-4. 중첩 컴포넌트 언마운트 정리가 **부모 → 자식** 순서 (React와 동일) ✅ 2026-09-02
  > **문구를 실제에 맞춰 고쳤다 (2026-09-02).** 원래 "자식 → 부모"라고 적혀 있었는데
  > **base부터 그렇지 않다.** 실측·문서·React가 모두 부모 → 자식으로 일치하고
  > 체크리스트 문구 하나만 반대였다.
  > 근거: `lithentDocs/src/components/examples/example14.tsx`의 안내문이
  > "1. Inventory system shutdown (Depth 1 - parent)"로 부모를 먼저 적고 있다.
  > React도 서브트리 삭제 시 위에서 아래로 훑으며 정리를 호출한다.
  > 아래 §"콜백 순서 실측표"가 전체 그림이다.
- [x] C-5. `updateCallback` deps 비교 정상 ✅ 2026-09-02 (같을 때 0회 · 다를 때 1회, 양쪽)
- [x] C-6. 변경된 순서가 체인지로그 초안과 일치 ✅ 2026-09-02
  (base `[A:1, B:2]` · concurrent `[A:2, B:2]`, 결과 DOM 동일 — **의도된 차이가 정확히 그 값으로 갈렸다**)

### 콜백 순서 실측표 (2026-09-02, base·concurrent 동일)

3단 중첩(top > mid > deep)에 `mountCallback`과 `updateCallback`을 함께 걸고 잰 값이다.

| 시점 | 순서 | 방향 |
|---|---|---|
| 마운트 | `mount:deep > mount:mid > mount:top` | 자식 → 부모 |
| 갱신 — `updateCallback` **본문** | `top > mid > deep` | 부모 → 자식 |
| 갱신 — `updateCallback` **반환값** | `deep > mid > top` | 자식 → 부모 |
| 언마운트 — `mountCallback` **반환값** | `top > mid > deep` | 부모 → 자식 |

**두 반환값은 성격이 다르다. 이것이 가장 헷갈리는 지점이다.**

| | 언제 등록되나 | 언제 실행되나 |
|---|---|---|
| `mountCallback`의 반환값 | 마운트 시 1회 | **언마운트 때** — 진짜 클린업 |
| `updateCallback`의 반환값 | 갱신마다 | **그 갱신의 커밋 때** — 커밋 후처리 |

`updateCallback`의 반환값은 **"다음에 정리할 것"이 아니라 "이번 커밋 끝에 실행할 것"**이다.
React의 `useEffect` 반환값과 **다른 물건**이므로 그렇게 읽으면 안 된다.

`helper`의 `effect()`가 그 차이를 이렇게 흡수한다 — 정리를 반환값에 맡기지 않고
본문 첫 줄에서 직접 부른다:

```ts
updateCallback(() => {
  if (backward) backward();   // 정리는 여기서 (그래서 부모 -> 자식)
  return forward;             // 반환값은 커밋 후처리 (자식 -> 부모)
}, dependencies);
```

**concurrent 코어도 네 줄 전부 동일하다.** BC-1이 "언마운트 계열은 건드리지 않는다"고
한 약속이 지켜지고 있다는 뜻이며, C-4·C-6의 판정 근거이기도 하다.

## D. SSR / Hydration / HMR

- [x] D-1. 전용 SSR fixture에서 실제 서버 렌더 페이지 생성 →
  hydration 전후 기존 DOM 노드 동일성 유지 + 이벤트 동작 (전체 DOM 재생성으로 통과시키지 않음)
- [x] D-2. hydration 직후 저우선순위 갱신 정상
- [x] D-3. hydration 후 keyed 리스트 갱신(추가/삭제/정렬) 정상
  > 먼저 기존 Row의 로컬 상태를 변경하고 같은 key의 상태와 DOM 참조가 갱신 뒤 유지되는지 검사한다.
  > 2026-10-01에 양쪽 코어에서 공유 JSX 어댑터의 동적 배열 펼침으로 상태 리셋을 재현했다.
  > 수정 후 Row 로컬 상태·원래 서버 Row1 DOM 참조 유지 및 jsx/jsxs·jsxDEV/jsxs 회귀가 양쪽 코어에서 통과했다 (DESIGN D18).
- [x] D-4. 실제 Vite HMR 전용 fixture의 컴포넌트 수정 시 바운더리 교체 정상
  (`devHelper/createBoundary`가 concurrent 코어에서도 동작)
  > 실제 `@lithent/lithent-vite`를 배선한 임시 fixture에서 파일 변경→교체 후 이벤트와 페이지 reload 부재를 확인한다.
  > 기본 examples 설정은 HMR 플러그인·concurrent alias를 연결하지 않으므로 단독 실행을 D-4 통과로 세지 않는다.
  > `.e2e-work/<core>/Counter.tsx`만 수정·복원하며 reload 토큰 유지·교체 뒤 이벤트를 확인했다.
  > HMR 바운더리 교체는 리마운트하므로 로컬 상태 0 초기화가 기대값이다. keyed 상태 유지와 구분한다.

## E. 중단 동작 (T2 파이버) — T2부터 — **전 항목 통과 (2026-09-02)**

> **1차 수행에서 코어 버그 2건, 데모 버그 2건이 나왔다.** 단위 테스트 128개가 전부
> 통과하는 상태였다 — 이 섹션이 아니었으면 그대로 나갔을 것들이다.
> 경위는 IMPLEMENT §"섹션 E가 잡은 것".
>
> **E-3·E-6은 처음에 빈 리스트에서 돌아 `0 === 0` / `undefined === undefined`로
> 공허하게 통과했다.** 지금은 검증 대상이 없으면 통과 대신 「측정 불가」가 뜬다.
> 초록색이 떴다고 곧바로 믿지 말고 **숫자가 0이 아닌지** 확인할 것.

```bash
pnpm check:interrupt      # 두 코어를 빌드하고 섹션 E 페이지를 연다
```

> **판정은 느낌이 아니라 "최장 블록"으로 한다.** 메인 스레드가 막힌 시간은 밖에서 보면
> **애니메이션 프레임 사이의 공백**이고, 페이지가 그것을 잰다.
> 왼쪽이 오늘의 동작(base + `renew()`), 오른쪽이 T2(concurrent + `deferRender`)다.
>
> - **총 시간은 비슷한 것이 정상이다.** 중단은 빨라지는 게 아니라 쪼개지는 것이다.
> - 두 코어 모두 **빌드 산출물**로 뜬다 — `pnpm build` 선행 (스크립트가 알아서 한다).
> - 각 패널 입력창에 타이핑하면서 버튼을 누르면 입력→페인트 지연도 함께 나온다.
> - 다른 탭을 닫고 이 탭을 포커스에 둘 것. 2~3회 돌려 안정된 쪽을 취한다.
>
> E-1은 `DOM 동일 확인`, E-2·E-3·E-6은 concurrent 패널의 카운터
> (살아있는 마운트 = 행 수 / updateCallback 횟수 / 행 앞의 `#인스턴스 번호`가 변하지 않음),
> E-5는 `언마운트` 버튼이다.

- [x] E-1. **중단·재개 동치성** ✅ 2026-09-02: 중단된 렌더의 최종 DOM이 무중단 렌더 결과와 동일
  > **중단은 따로 일으키지 않아도 된다.** low 레인 슬라이스가 5ms인데 10k 빌드는
  > 그보다 훨씬 길어서, 미룬 갱신은 이미 매번 여러 번 멈췄다 이어진다.
  > 오른쪽 패널의 **8ms 초과 블록이 2개 이상**이면 실제로 중단된 것이고,
  > 그 상태에서 **DOM 동일 확인**이 통과하면 E-1이다.
  > (왼쪽 base는 sync라 항상 무중단이므로 비교 기준이 된다.)
- [x] E-2. **마운트 단위 폐기 금지** ✅ 2026-09-02 (살아있는 마운트 3 = 행 3): 새 컴포넌트가 마운트되는 갱신 중 급한 갱신을
  발생시켜도 mounter 본문이 중복 실행되지 않는다
  > **「마운트 중 급한 갱신 (E-2)」 버튼**이 그 상황을 만든다 — 미룬 마운트 갱신을
  > 시작하고 한 태스크 만에 급한 갱신으로 끼어든다.
  > 판정은 **살아있는 마운트 수 = 행 수**다. 커밋되지 않은 mounter가 돌았다면 그
  > 컴포넌트들은 등록만 되고 언마운트되지 않으므로 수가 더 크게 나온다.
  > 근거는 DC-7 (B) — 마운트를 포함한 빌드는 폐기하지 않고 완주시킨다.
- [x] E-3. **이펙트 무결성** ✅ 2026-09-02 (updateCallback 1,000회 = 바뀐 행 1,000개): 폐기 후 재시작된 렌더에서 `updateCallback`이
  유실되지도 중복되지도 않는다
  > **「갱신 중 급한 갱신 (E-3·E-6)」 버튼.** 미룬 렌더가 **의존성을 안 움직이게** 해서
  > 이펙트를 발화시키지 않고 → 폐기 가능한 상태로 만든 뒤, 급한 갱신이 끼어들어
  > 의존성을 움직인다. 판정은 **updateCallback 횟수 = 바뀐 행 수**다.
  > 적으면 폐기된 빌드가 훅 커서를 어긋난 채 남긴 것(유실), 많으면 중복이다.
- [x] E-4. **빌드 단계 비차단** ✅ 2026-09-02 (좁힌 문구 기준 — 아래): 미룬 렌더에서 **최장 블록**이 base보다 뚜렷하게 짧다 —
  **RC-10. T2의 존재 이유이므로 필수 통과**
  > **워크로드별로 판정한다** (REQUIREMENTS §8 "RC-10의 단서"):
  > 신규 마운트(빈 목록 → 10k)와 갱신(10개당 1개)에서는 **차이가 나야 통과**.
  > **대량 교체(10k → 10k 새 키)는 차이가 없는 것이 정상** — 커밋이 98%이고
  > 커밋은 쪼갤 수 없다. 여기서 차이가 없다고 실패로 읽지 말 것.
  > 1,000행에서 양쪽이 같은 것도 정상이다 (경계는 1k~10k 사이, §Phase 7).
  > 이 항목이 **"concurrent rendering"이라는 서술의 명명 근거**다 (REQUIREMENTS §2.1).
  > 파이버 코드가 들어간 시점이 아니라 여기가 통과하는 시점에 그 주장이 참이 된다.
  > 그래도 `concurrent mode`라는 표현은 쓰지 않는다 — 그건 React의 기능 묶음 이름이다.
- [x] E-5. ✅ 2026-09-02 — 중단 중 페이지 이탈·컴포넌트 언마운트 시 에러 없음
  > **「중단 중 언마운트 (E-5)」 버튼.** 미룬 빌드를 시작하고 **같은 턴에** 언마운트하므로
  > 정리가 빌드가 멈춰 있는 상태에서 일어난다. 콘솔에 에러가 없으면 통과.
- [x] E-6. **클로저 상태 보존** ✅ 2026-09-02 (인스턴스 번호 `#1` 유지 → 9-2 실증): 중단·폐기·재시작을 반복해도 `state`/`lstate` 값이
  리셋되지 않는다 (current·WIP가 같은 인스턴스 클로저를 공유하는지 — DESIGN D8 / Phase 9-2)
  > **E-3과 같은 버튼**이 함께 판정한다. 행은 키를 그대로 유지하므로, 폐기를 겪고도
  > 행 앞의 `#인스턴스 번호`가 변하지 않아야 한다. 그 번호는 mounter 클로저에 있으므로
  > 값이 바뀌면 클로저가 갈아엎힌 것이다. **이것이 9-2의 실증이기도 하다.**

## F. tearing — T1.5부터 — **전 항목 통과 (2026-09-02)**

2026-10-01의 C/F E2E에서 F-1~3을 재확인했다. 아래 수치와 날짜는 최초 수행 기록으로 유지한다.

> `pnpm check:lifecycle` 같은 페이지에서 함께 검사한다. F는 concurrent 쪽만 의미가 있고,
> store는 `lithent/helper`가 아니라 같은 계약(DC-17)으로 페이지 안에서 만든다 —
> helper 번들은 bare `lithent`를 가리켜 한 페이지에서 두 코어에 물릴 수 없다.

> **F 판정 시 주의 (Phase 6, DC-18)**: 폐기 대상은 **관측 가능한 일을 아무것도 하지 않은
> 빌드**뿐이다. 새 컴포넌트를 마운트했거나 `updateCallback`이 발화한 빌드는 그대로
> 커밋되며 **tearing인 채 남는 것이 정상**이다. F-1·F-2는 그 두 가지가 없는 구성으로
> 확인할 것. 대가와 근거는 IMPLEMENT §Phase 6에 있다.
>
> T1.5에서 빌드는 동기이므로 끼어들 수 있는 쓰기는 **그 빌드 안에서 시작된 것**뿐이다.
> 외부 쓰기가 빌드 중간에 들어오는 상황은 T2에서 생긴다.

- [x] F-1. 같은 store를 구독하는 컴포넌트 여러 개를 저우선순위로 갱신하는 동안 store를 변경 ✅ 2026-09-02
  → 화면의 모든 표시값이 서로 일치 (섞인 값 없음)
- [x] F-2. 렌더 도중 store를 변경해도 최종 화면이 일관 ✅ 2026-09-02 (화면 `[2, 2, 2]`)
- [x] F-3. 재시도 상한 초과 시 무한 루프 없이 수렴 ✅ 2026-09-02 (빌드 3회 = 폐기 2 + 커밋 1)

## G. N1 경계 확인 (T2부터, 릴리스마다)

- [x] G-1. 컴포넌트 렌더 중 Promise를 throw했을 때 **언와인딩되지 않고**
  일반 예외로 처리된다 (Suspense가 의도치 않게 들어오지 않았음을 확인)
  > 기존 10-10 검증을 재실행해 원래 throw 값 전달과 fallback/재호출 부재를 확인한다. 기대 오류는 별도 단언한다.
  > 2026-10-01 `pnpm test`에서 기존 N1 boundary(10-10) 검사 2개 통과.
- [x] G-2. 공개 API에 `use`·`Suspense` 상당물이 노출되어 있지 않다 — 2026-10-01 기존 10-10 및 export 검사
- [x] G-3. 문서에 N1 불변 조건이 명시되어 있다 — 2026-10-01 REQUIREMENTS §5 / DESIGN P6 확인

## H. 버전·배포 준비·사용자 문서 (2026-10-01, DC-22)

DESIGN D19의 버전 표와 IMPLEMENT PREP-0~3를 따른다. 아직 이번 버전/문서 변경의 최종 결과를
기록하지 않았으며, 앞선 E2E 20개 통과 기록을 새 가이드·데모 검사로 대신 쓰지 않는다.

- [ ] H-1. 루트 1.22.1, private helper/JSX 0.21.1, concurrent/private concurrent helper 0.1.0,
  create-lithent 0.3.4, private docs 0.6.0이 manifest/lockfile에 정렬되고 유지 패키지 버전은 움직이지 않는다
- [ ] H-2. concurrent private 해제·peer `lithent ^1.22.1`, helper/JSX/타입/export 대상의 실제 pack 포함 확인
- [ ] H-3. create-lithent 양쪽 템플릿이 `lithent ^1.22.1`을 사용하고 pack에 올바른 템플릿이 포함된다
- [ ] H-4. 영문/국문 concurrent rendering·helpers·변경 내역의 경로·내용·메뉴 이동 확인
- [ ] H-5. 새 데모가 실제 concurrent 코어를 실행하고 입력/미룬 DOM/pending 조회/완료 대기 결과를 검사한다
- [ ] H-6. nextTick/MountHooks/UpdateHooks/ManualJSX 보완과 API 런타임 helper 3개·타입·BC 조건·N1이 실제 동작과 일치한다
- [ ] H-7. 최신 build/unit/dual/size/artifact/브라우저 및 범위 타입/lint/format·pack 검사 근거를 기록한다
- [ ] H-8. 기본 `src/` 동결, A-3/A-7/B-1·11-9 미완, T1 조건 N/A, 실제 publish/추가 커밋 미실행을 기록한다

## 통과 기준

- **T1 릴리스**: A·B·D 전 항목 + 콘솔 에러 0건.
- **T1.5 릴리스**: 위 + C·F 전 항목. C-6의 순서 변경이 체인지로그에 반영됐을 것.
- **T2 릴리스**: 위 + E·G 전 항목.
  - **E-4 미달 시 릴리스 보류** — T2의 유일한 도입 근거이므로 미달이면 되돌리는 것이 맞다.
  - **E-6 미달은 심각** — 클로저 모델이 깨졌다는 뜻이므로 Phase 9-2를 재검토한다.
- **모든 단계 공통**: **A-7(기본 코어 무회귀) 미달 시 무조건 릴리스 보류.**
  기본 코어 동결이 이 작업의 전제다.
- A-3 벤치 회귀는 단계별 기준을 적용하며, 미달 시 DESIGN DC-6 재협의 대상.
- **현재 배포 준비 종료**: H 전 항목의 구현·검증 근거 확보. 이는 실제 공개 완료나 T2 릴리스 게이트 통과와 별개다.
  3-5/3-5b는 T1 단독 조건이므로 현재 T2 준비에 N/A이며, A-3/A-7/B-1·11-9는 그대로 남긴다.

## 기록

각 실행 시 아래를 IMPLEMENT.md 해당 Phase에 남긴다.

| 항목 | 값 |
|---|---|
| 실행일 | |
| 커밋 SHA | |
| 명령 / 기대 코어 / 브라우저 | |
| 실행 검사 이름·개수 / 실패 trace | |
| 단계 (T1/T1.5/T2) | |
| 기본 br / concurrent br | |
| bench 요약 | |
| 미통과 항목 | |

## 이번 실행 근거 (2026-10-01)

검증 기준은 `f8677a0411748c8ea0d9103a97aefaf33eff5705` + 현재 작업 트리다. 커밋하지 않았다.
실행 안내는 [e2e/README.md](../../e2e/README.md), 상세 명령·개수·돌연변이 결과는 IMPLEMENT의 실행 기록을 따른다.

| 항목 | 이번 근거 |
|---|---|
| A-1 | `pnpm build` exit 0 / `pnpm test` exit 0, 413회 실행 |
| A-2 | `verify-order.mjs` ALL PASS |
| A-4 | size base 4,734/4,800 B, concurrent 6,149/9,000 B |
| A-5·9·11 | `verify:concurrent` ALL PASS, 빌드 Fragment·선언 22개·외부 strict 소비자·export map·helper |
| A-6·10·11 | `contracts.spec.ts` consumer(base 10/concurrent 13개 검사표)·context/lcontext·갱신·서브패스 |
| A-8 | `test:dual` 472회 실행; 위성 helper 43/devHelper 2/ftags 10/ssr 9 양쪽 동일 |
| B-2·3·4·5·9 | `scheduler.spec.ts`, 시점별 이전 DOM·pending·urgent/deferred 순서·1,000행 최종 commit 1회 |
| B-6 | `contracts.spec.ts` 전용 integration fixture의 portal host·deferred 내용·중복 부재 |
| B-7 | `apps.spec.ts` HTM·MDX·sharedStore·JSX·complex 5개 페이지 × 두 코어 조작 |
| B-8 | `apps.spec.ts` 영문/국문 예제 42개 경로 × 두 코어 exact heading·computed/guide·store·keyed·context·portal 조작 |
| D-1·2·3 | `contracts.spec.ts` 전용 SSR fixture의 HTML·hydration·이벤트·keyed 상태·서버 Row1 DOM 참조; `jsx.spec.ts` 어댑터 회귀 |
| D-4 | `contracts.spec.ts` 실제 HMR 플러그인·임시 파일 변경/복원·reload 없음·리마운트 뒤 이벤트 |
| G-1·2·3 | 기존 N1 boundary(10-10) 두 검사 및 공개 export·문서 확인 |

Chromium E2E는 **20 PASS(base 9/concurrent 11), skip 0**다. jsxs 3/6인자 타입 호환 보강 뒤에도
`build:jsxruntime`·독립 strict tsc·범위 lint/prettier와 E2E **20 PASS(11.8s)**를 재확인했다.
돌연변이는 wrong-core 1 / scheduler-sync 2 / hydration-rebuild 1 / hmr-reload 1 / jsx-flatten 1의
예상 단언 실패를 모두 검출했다. **5종·예상 실패 6개, skip 0·startup 오류 0**, runner exit 0이다.
JSON 보고서는 `test-results/mutations`, 실패 screenshot/trace는 `test-results`에 보존한다.

## 상태 / 핸드오프 (2026-10-01)

- done: 기존 미완 27개 중 24개 완료. Chromium 20개·돌연변이 5종·CLI 검사 통과.
  C/F는 이번 E2E 재확인, E는 2026-09-02 기록 유지. 공유 JSX keyed 회귀 수정 및 양쪽 코어 검사 통과.
- 준비 설계: DC-22에 따라 H / PREP-0~3의 버전·사용자 문서·pack 검사를 추가했다. 실제 새 결과는 대기 중이다.
- next: 새 버전/영문·국문 가이드·실행 데모/pack의 실제 근거로 H를 닫는다.
  A-3/B-1 반복 측정·A-7 과거 릴리스 기준은 별도 잔여이며, 11-9는 이 세 항목 때문에 미완이다.
- blockers: A-7 과거 릴리스 기준 미확정. A-3/B-1 반복 성능 측정은 기능 E2E와 별도 작업이다.
- 현재 HEAD: `5a9f148fbe964e993b3aba12cc26ff86bf415370` (2026-10-01, 배포 준비 전).
  앞선 E2E 검증 기준은 위 역사적 실행 기록에 보존한다.
- 실제 publish·추가 커밋은 별도 사용자 요청으로 남긴다. 3-5/3-5b는 현재 T2 범위에 N/A다.

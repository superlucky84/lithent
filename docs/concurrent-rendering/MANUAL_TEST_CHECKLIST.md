# MANUAL_TEST_CHECKLIST — Concurrent 렌더링 릴리스 전 수동 확인

- 작성일: 2026-08-28 (최종 수정: 2026-08-28)
- 대상: `feat/concurrentRendering` — `lithent-concurrent` 별도 빌드 (T1 스케줄러 / T1.5 순수화·tearing / T2 파이버)
- 사전 조건: `pnpm build && pnpm test` 전량 통과 상태에서 수행
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [IMPLEMENT.md](./IMPLEMENT.md)

> **단계별 적용 범위**: A·B·D는 T1부터, C·F는 T1.5부터, E는 T2부터.
> 착수하지 않은 단계의 섹션은 `N/A`로 표기한다.
>
> **B~F는 `lithent` → `lithent-concurrent` alias를 적용한 앱에서 수행한다.**
> 기본 코어는 동결이므로 동작 변화가 없어야 한다 (A-7).

## A. 자동 검증 + 빌드 무결성 (릴리스 직전 1회)

- [ ] A-1. `pnpm build && pnpm test` 전량 통과 (0 실패)
- [ ] A-2. `node docs/performance-improvement/bench/verify-order.mjs` → ALL PASS
- [ ] A-3. `node docs/performance-improvement/bench/bench10k.mjs` → 회귀 판정
  - T1·T1.5: 회귀 0
  - T2: DC-6 기준(대규모 시나리오 총 체감) 적용
- [ ] A-4. 크기 실측 — concurrent가 단계 예산 이내 (T1 ≤ 5,400 / T1.5 ≤ 6,200 / T2 ≤ 9,000)
- [ ] A-5. **Fragment 동일성**: concurrent 빌드에서 `checkFragmentFunction(Fragment) === true`
  (alias 함정 — DESIGN §2.2. 자동 테스트 0-5가 있어도 릴리스 빌드 산출물로 1회 확인)
- [ ] A-6. **`getParent` shim**: concurrent 빌드에서 `helper/context`·`lcontext`의
  Provider 탐색이 동작 (파이버 `return` 포인터 경유)
- [ ] A-7. **기본 코어 무회귀**: `dist/lithent.umd.js` br ≤ 4,800 B **이고**
  기본 코어로 빌드한 예제 앱의 동작이 이전 릴리스와 동일

## B. 스케줄러 동작 (실브라우저) — T1부터

- [ ] B-1. **입력 응답성**: 무거운 저우선순위 갱신 대기 중 텍스트 입력이 끊기지 않는다
- [ ] B-2. **이전 화면 유지**: `startTransition` 갱신 완료 전까지 이전 내용이 그대로 보인다
  (빈 화면·깜빡임 없음)
- [ ] B-3. **isPending**: 전환 중 pending 표시가 켜지고 완료 시 꺼진다
- [ ] B-4. **급한 갱신 우선**: 저우선순위 대기 중 급한 갱신이 먼저 반영된다
- [ ] B-5. **낡은 전환 폐기**: 전환 중 값을 연속 변경해도 최종 값 1개만 렌더되고
  중간 값이 화면에 나타나지 않는다
- [ ] B-6. `pnpm dev` (html/portal.html) — portal 데모가 저우선순위 갱신 후에도 위치·내용 정상
- [ ] B-7. `pnpm dev:examples` — 예제 전반 인터랙션 정상, 콘솔 에러 0건
- [ ] B-8. `pnpm dev:docs` — 문서 사이트 이동·코드 데모 정상
- [ ] B-9. **BC-4**: `await nextTick()` 직후에는 저우선순위 렌더가 **미반영**,
  `await whenIdle()` 직후에는 **반영**된다 (문서화된 대로 동작하는지)

## C. 라이프사이클 순서 (BC-1) — T1.5부터

- [ ] C-1. `mountCallback`이 DOM 삽입 **후** 1회만 실행 (중복 없음)
- [ ] C-2. `mountReadyCallback`이 DOM 삽입 **전** 실행
- [ ] C-3. keyed 리스트 추가/삭제/정렬 반복 시 마운트·언마운트 콜백이 행마다 정확히 1:1
  (콘솔 로그 카운트)
- [ ] C-4. 중첩 컴포넌트 언마운트 시 자식 → 부모 순서 보존
- [ ] C-5. `updateCallback` deps 비교 정상 (같으면 미실행, 다르면 실행)
- [ ] C-6. 변경된 순서가 체인지로그 초안과 일치

## D. SSR / Hydration / HMR

- [ ] D-1. `createLithent` 보일러플레이트(또는 ssr 예제)로 SSR 페이지 생성 →
  hydration 후 이벤트 동작 (재렌더 없이 인터랙티브해지는지)
- [ ] D-2. hydration 직후 저우선순위 갱신 정상
- [ ] D-3. hydration 후 keyed 리스트 갱신(추가/삭제/정렬) 정상
- [ ] D-4. HMR — `pnpm dev:examples`에서 컴포넌트 수정 시 바운더리 교체 정상
  (`devHelper/createBoundary`가 concurrent 코어에서도 동작)

## E. 중단 동작 (T2 파이버) — T2부터

- [ ] E-1. **중단·재개 동치성**: 10k행 저우선순위 갱신을 중단시켜도 최종 DOM이
  무중단 렌더 결과와 동일 (개발자 도구로 노드 순서·개수 확인)
- [ ] E-2. **마운트 단위 폐기 금지**: 새 컴포넌트가 마운트되는 갱신 중 급한 갱신을
  발생시켜도 mounter 본문이 중복 실행되지 않는다 (mounter에 `console.log` 후 카운트)
- [ ] E-3. **이펙트 무결성**: 폐기 후 재시작된 렌더에서 `updateCallback`이
  유실되지도 중복되지도 않는다
- [ ] E-4. **입력 비차단**: 단일 컴포넌트의 무거운 렌더(10k행) 진행 중에도 텍스트 입력이
  프레임 드랍 없이 반영된다 — **RC-10. T2의 존재 이유이므로 필수 통과**
- [ ] E-5. 중단 중 페이지 이탈·컴포넌트 언마운트 시 에러 없음
- [ ] E-6. **클로저 상태 보존**: 중단·폐기·재시작을 반복해도 `state`/`lstate` 값이
  리셋되지 않는다 (current·WIP가 같은 인스턴스 클로저를 공유하는지 — DESIGN D8 / Phase 9-2)

## F. tearing — T1.5부터

- [ ] F-1. 같은 store를 구독하는 컴포넌트 여러 개를 저우선순위로 갱신하는 동안 store를 변경
  → 화면의 모든 표시값이 서로 일치 (섞인 값 없음)
- [ ] F-2. 렌더 도중 이벤트 핸들러로 store를 변경해도 최종 화면이 일관
- [ ] F-3. 재시도 상한 초과 시 sync 폴백으로 정상 수렴 (무한 루프 없음)

## G. N1 경계 확인 (T2부터, 릴리스마다)

- [ ] G-1. 컴포넌트 렌더 중 Promise를 throw했을 때 **언와인딩되지 않고**
  일반 예외로 처리된다 (Suspense가 의도치 않게 들어오지 않았음을 확인)
- [ ] G-2. 공개 API에 `use`·`Suspense` 상당물이 노출되어 있지 않다
- [ ] G-3. 문서에 N1 불변 조건이 명시되어 있다

## 통과 기준

- **T1 릴리스**: A·B·D 전 항목 + 콘솔 에러 0건.
- **T1.5 릴리스**: 위 + C·F 전 항목. C-6의 순서 변경이 체인지로그에 반영됐을 것.
- **T2 릴리스**: 위 + E·G 전 항목.
  - **E-4 미달 시 릴리스 보류** — T2의 유일한 도입 근거이므로 미달이면 되돌리는 것이 맞다.
  - **E-6 미달은 심각** — 클로저 모델이 깨졌다는 뜻이므로 Phase 9-2를 재검토한다.
- **모든 단계 공통**: **A-7(기본 코어 무회귀) 미달 시 무조건 릴리스 보류.**
  기본 코어 동결이 이 작업의 전제다.
- A-3 벤치 회귀는 단계별 기준을 적용하며, 미달 시 DESIGN DC-6 재협의 대상.

## 기록

각 실행 시 아래를 IMPLEMENT.md 해당 Phase에 남긴다.

| 항목 | 값 |
|---|---|
| 실행일 | |
| 커밋 SHA | |
| 단계 (T1/T1.5/T2) | |
| 기본 br / concurrent br | |
| bench 요약 | |
| 미통과 항목 | |

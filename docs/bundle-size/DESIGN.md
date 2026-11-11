# DESIGN — base 코어 번들 크기 축소

- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 문서의 수치는 구현 전 조사값이다(기준 `6639195`, 소스 사본을 실제 설정과 같은 옵션으로 빌드). 구현 뒤 실제 값은 IMPLEMENT의 Phase 기록에 있다.

## 조사 결과

| 단계 (누적)                        |    raw |  gzip | Brotli | 현재 대비 |
| ---------------------------------- | -----: | ----: | -----: | --------: |
| 현재 (`6639195`)                   | 12,827 | 5,289 |  4,901 |      기준 |
| ① Terser 출력 옵션                 | 12,755 | 5,272 |  4,878 |      −23B |
| ② + 작은 소스 정리 15건            | 12,532 | 5,194 |  4,812 |      −89B |
| ③ + diff·배치 경로 함수 합치기 6건 | 12,402 | 5,134 |  4,763 |     −138B |
| (제외) + hidden source map         | 12,362 | 5,099 |  4,734 |     −167B |

base UMD 기준이다. 대조 빌드의 UMD와 CJS는 저장소의 `dist`와 byte가 같았다.

### Vite 8 이후 Terser 후처리가 하는 일

`vite.config.js`의 `compact-umd-identifiers` 플러그인은 `renderChunk`에서 Terser를 돌린다. Vite 8(Rolldown)에서는 이 hook이 **minify 전** 코드를 받고, 그 뒤에 Oxc가 다시 minify한다. 그래서:

- Terser의 mangle과 compress 4종(`booleans`·`lhs_constants`·`if_return`·`join_vars`)은 최종 출력에 거의 남지 않는다. 4종을 모두 꺼도, mangle을 꺼도 결과는 같은 4,878B였다(`wrap_func_args: false` 기준).
- 남는 것은 Terser 5.18의 기본 출력 옵션 `wrap_func_args`가 함수 인자에 씌우는 괄호 36쌍이다(`forEach((e=>{…}))`). Oxc가 이 괄호를 보존해서 72B(raw), 23B(Brotli)가 늘어난다.
- 플러그인을 통째로 빼면 4,880B다. 현재 출력과 다른 곳은 구문 5곳(if/else 순서, 변수 선언 합치기, `!1===x`, De Morgan)이고 함수 수는 같다.

플러그인의 주석("Rename, reprint…")은 Vite 5 때의 설명이라 지금 동작과 맞지 않는다.

### 소스 정리의 성격

한 번만 쓰이는 작은 함수, 중복된 반환, 쓰이지 않는 기본 인자·별칭이다. Oxc는 함수를 호출 위치로 옮기지 않으므로(그래서 scope 정책이 유지된다) 이런 것은 소스에서 직접 정리해야 줄어든다. 한 건의 Brotli 변화는 −10~+9B로 잡음 수준이지만, 묶으면 UMD·CJS·ESM 모두에서 raw·gzip·Brotli가 같이 줄었다.

## 결정

- [x] **DC-1 — Terser 출력 옵션.** 플러그인의 `minify` 호출에 `format: { wrap_func_args: false }`를 넣는다. 근거: 결과가 현재 배포본과 **AST가 완전히 같다**(괄호만 빠진다). CJS·ESM은 원래 이 괄호가 없다. 플러그인 주석을 지금 동작에 맞게 고친다. 검증: Phase 1의 AST 대조, M-1.
- [x] **DC-2 — 작은 소스 정리 15건(S-1~S-15).** 아래 표대로 적용한다. 근거: 동작이 같고, 호출 하나를 없애거나 죽은 코드를 지우는 수준이라 함수 구조에 미치는 영향이 작다. 검증: 양 코어 테스트, M-2.
- [ ] **DC-3 — 함수 합치기 6건(H-1~H-6)의 채택.** Phase 3에서 작업 트리에 구현하되 **후보**로 둔다. diff·배치의 hot path라서 성능 확인(Phase 5) 뒤에 사용자가 채택 여부를 정한다. 근거: `src/diff.ts`에 "한 함수로 합쳤더니 1,000행 생성이 6% 느려졌다"는 기록이 있다. 느려지면 H 묶음만 되돌린다(S와 파일 단위로 겹치므로 되돌릴 항목을 표로 관리한다). 검증: M-5.
- [ ] **DC-4 — 크기 guard 하향.** TBD. `scripts/size-report.js`의 base 예산 4,953B를 결과에 맞춰 내릴지, 내린다면 값과 표기 방식(기존 allowance 합 유지 또는 새 기준값). 채택 범위(DC-3)가 정해진 뒤 사용자가 정한다.
- [ ] **DC-5 — Terser 플러그인 제거.** TBD. DC-1 뒤에는 플러그인이 2B(4,880 → 4,878B)만 기여한다. 빼면 빌드 단계와 source map 체인이 단순해지고 root의 `terser` devDependency도 뺄 수 있는지 확인할 수 있다. 출력의 구문 5곳이 달라지므로 이번에는 넣지 않고 후속 결정으로 둔다.
- [x] **DC-6 — hidden source map 제외.** U-2. 자동 연결을 유지한다.
- [x] **DC-7 — concurrent.** `lithentConcurrent/src/*`는 손대지 않는다. 공유 모듈에 들어가는 S-6·S-7·S-8·S-9·S-11·S-13·S-15는 concurrent 번들에도 반영된다. export를 지우는 경우는 concurrent가 쓰지 않는 것만 지운다.

## 변경 목록

### 빌드 (DC-1)

`vite.config.js`: `minify(code, { compress: {…}, mangle: true, format: { wrap_func_args: false }, sourceMap })`. compress 4종과 mangle은 그대로 둔다(결과에 영향이 없지만, 제거는 DC-5에서 함께 판단한다).

### 작은 소스 정리 (DC-2)

| ID   | 파일                                                        | 변경                                                                                                                                                                |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-1  | `src/wDom.ts`                                               | `makeNode`: 문자열이 아닌 태그만 Fragment·컴포넌트를 확인한다. element 반환을 한 곳으로 줄이고, Fragment는 spread 복사 없이 `createWDom('f', children)`으로 만든다. |
| S-2  | `src/wDom.ts`                                               | `syncAncestorComponentChildren`: 중첩 재귀 함수를 `while`로 바꾼다. 방문 순서와 `Set` 검사는 같다.                                                                  |
| S-3  | `src/render.ts`                                             | `rootDelete`를 호출부(`render`의 해제 함수)로 옮긴다.                                                                                                               |
| S-4  | `src/render.ts`                                             | `updateText`를 `typeUpdate`로 옮긴다.                                                                                                                               |
| S-5  | `src/wDom.ts`                                               | `reRender`에서 `initUpdateHookState(compKey)` 대신 `compKeyRef.value = compKey`. export는 남긴다(concurrent 사용).                                                  |
| S-6  | `src/hook/internal/useUpdate.ts`                            | `useUpdated`의 기본 인자 `() => []` 제거. 호출자는 `updateCallback`뿐이고 항상 넘긴다.                                                                              |
| S-7  | `src/hook/internal/useUpdate.ts`                            | `checkNeedPushQueue`를 `useUpdated`로 옮긴다.                                                                                                                       |
| S-8  | `src/utils/predicator.ts`                                   | `checkSameCustomComponent`: `('ctor' in n ? n.ctor : n) === (o && o.ctor)`.                                                                                         |
| S-9  | `src/hook/internal/unmount.ts`                              | `removeItem`을 `runUnmountQueueFromWDom`으로 옮긴다.                                                                                                                |
| S-10 | `src/utils/redraw.ts`                                       | `schedule`을 `bindRedraw`로 옮기고, base에서 쓰이지 않는 `setRedrawAction`을 지운다(concurrent는 자기 scheduler의 것을 쓴다).                                       |
| S-11 | `src/utils/universalRef.ts`                                 | `setComponetRef`를 `initMountHookState`에 합친다.                                                                                                                   |
| S-12 | `src/wDom.ts`                                               | `resolveComponent`: `tag`·`component` 별칭 변수를 없앤다.                                                                                                           |
| S-13 | `src/wDom.ts`, `src/utils/predicator.ts`                    | `checkFragmentFunction(x)` 호출을 `x === Fragment`로 쓴다. export는 남긴다(concurrent 사용).                                                                        |
| S-14 | `src/render.ts`                                             | `checkRefData` 호출을 `dataKey === 'ref' && isObject(dataValue)`로 쓴다. export는 남긴다(concurrent·SSR 사용).                                                      |
| S-15 | `src/utils/universalRef.ts`, `src/hook/internal/unmount.ts` | manual 모드 플래그를 함수 호출 없이 읽는다.                                                                                                                         |

S-1과 S-4는 `h()`와 텍스트 갱신 경로에 있지만 호출·분기를 늘리지 않는다. 문자열 태그는 지금처럼 `typeof` 한 번으로 끝난다.

### 함수 합치기 후보 (DC-3)

| ID  | 파일            | 변경                                                                                                                                 |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| H-1 | `src/render.ts` | `updateChildren` 배치 패스: `createdCount`와 길이 비교 대신 "tail 앞에서 만든 자식이 있는가" 플래그. `isNew`/`needMove`를 한 식으로. |
| H-2 | `src/diff.ts`   | `inheritPropForRender`를 `remakeNewWDom`으로 옮긴다.                                                                                 |
| H-3 | `src/diff.ts`   | `remakeChildrenForDiff`를 `remakeNewWDom`으로 옮긴다. `remakeChildrenForAdd`와 `…ForUpdate`는 따로 둔다.                             |
| H-4 | `src/diff.ts`   | `syncResolverProps`를 `runUpdate`로 옮긴다.                                                                                          |
| H-5 | `src/diff.ts`   | `getWDomType` 호출을 `makeNewWDomTree`에 직접 쓴다. export는 남긴다(concurrent 사용).                                                |
| H-6 | `src/diff.ts`   | `generalize`를 `remakeNewWDom`으로 옮긴다.                                                                                           |

H-1의 동등성: 기존 조건 `createdCount > children.length - tail`은 "끝의 추가 구간 밖에서 만든 자식이 하나 이상"과 같다. `created[i]`는 요소이거나 `undefined`이므로 `created[i] || (keep && keep[i] === false && getElementFromFragment(item))`는 기존 `isNew ? created[i] : needMove ? getElementFromFragment(item) : 없음`과 같다.

## 지키는 계약

- **scope 정책(RQ-5):** `makeParentGetter`(`parent => () => parent`)와 `remakeChildren`의 `getParent` 클로저는 옮기지 않는다. 옮기는 함수는 클로저를 만들지 않거나, 만들더라도 diff의 이전 tree를 붙잡지 않는 것뿐이다. 출력에서 함수 수와 getter 형태를 대조한다(M-3).
- **공개 계약(RQ-2):** `src/index.ts`를 바꾸지 않는다. WDom 생성 함수(`createWDom`·`createCompWDom`)의 필드와 순서를 바꾸지 않는다.
- **공유 모듈의 export:** concurrent·SSR이 쓰는 export는 base가 더 이상 부르지 않아도 남긴다. base 번들에서는 tree shaking으로 빠진다.

## 검증 연결

| 결정 | 검증                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| DC-1 | 배포본 대비 AST 동일, `pnpm size`, source map 주석 유지 — Phase 1, M-1                            |
| DC-2 | `pnpm test:core`·`pnpm test:concurrent`, `tsc`·ESLint(빌드의 checker), export 대조 — Phase 2, M-2 |
| DC-3 | 위 검사 + 성능 확인(로컬 선별 → Mac 공식 러너) — Phase 3·5, M-5                                   |
| DC-4 | 결정 뒤 `pnpm size`의 예산 표기 — Phase 5, M-1                                                    |
| DC-7 | concurrent 크기·테스트, `pnpm verify:concurrent` — Phase 5, M-4                                   |

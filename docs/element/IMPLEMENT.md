# IMPLEMENT — `lithent/element` (Custom Element 래퍼)

- 작성일: 2026-10-06
- 상태: **Phase 7 완료 (2026-10-06). 다음: Phase 8.**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md), [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 공통 규칙

- **모든 Phase의 기본 게이트(BG)**: 아래가 전부 통과해야 Phase를 닫는다.
  - BG-1 `pnpm --filter lithent-element test` (base 코어)
  - BG-2 `LITHENT_CORE=concurrent pnpm --filter lithent-element test` (사전: `pnpm build:concurrent`)
  - BG-3 `git diff --stat 98db595 -- src lithentConcurrent/src` 출력 없음 (RC-1. B-1 수정 커밋 이후 기준)
  - BG-4 `pnpm --filter lithent-element build` 성공, 타입체크·eslint 통과
- **테스트 파일 명명**: `element/src/tests/element-<주제>.test.ts`.
  루트 `vite.config.js`의 vitest `exclude`에 `**/element/**`가 있어 루트 `test:core`는 이 파일들을
  잡지 않는다 (루트에서는 `@`가 코어 `src`를 가리켜 import가 깨진다). element 테스트는 항상
  패키지 단위로 실행된다 (`pnpm test`, `test:satellites`에 포함).
- **E2E 실행 주의 (이 컨테이너 한정)**: 설치된 `@playwright/test`가 요구하는 chromium 빌드(1243)와
  컨테이너의 `/opt/pw-browsers/chromium-1194`가 다르다. 저장소 설정을 바꾸지 않고, 커밋하지 않는 임시
  설정(`launchOptions.executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`)으로 실행했다.
- **돌연변이 확인**: 각 Phase의 핵심 테스트는 구현 한 줄을 일부러 깨뜨려 실패하는지 1회 확인하고
  결과를 해당 Phase "실측 결과"에 적는다 (concurrent 작업과 같은 규약).
- **Phase를 닫을 때** 상태 줄, 체크박스, 실측 결과, 커밋 SHA를 갱신한다.

---

## Phase 0 — 패키지 스캐폴딩 + 리스크 확인

진입 조건: DC-1, DC-9 확정.

- [x] 0-1 `pnpm install` (현재 `node_modules` 없음)
- [x] 0-2 `element/` 생성: `package.json`(name `lithent-element`, private), `tsconfig.json`,
      `vite.config.js`(`ftags/vite.config.js` 복제, `coreAlias` 유지, lib name `lithentElement`)
- [x] 0-3 `element/src/index.ts`에 빈 `defineElement` 시그니처만 export
- [x] 0-4 루트 `package.json`: `exports["./element"]`, `files`, `build:element`/`watch:element`,
      `test`·`test:satellites`에 element 추가. `pnpm-workspace.yaml`에 `element` 추가.
      `build:parallel`은 제외 목록 방식이라 **수정 불필요** (element가 자동 포함됨, 전체 `pnpm build` 통과로 확인)
- [x] 0-5 `scripts/size-report.js` targets에 `element/dist/lithentElement.umd.js` (예산 1,000 B)
- [x] 0-6 **R-1 확인**: `e2e/fixtures/element-dual.html` + `e2e/element.spec.ts`. 결과는 DESIGN §10 R-1

**기본 테스트**: `element-smoke.test.ts` — import 성공, `defineElement`가 함수,
**실행 중인 코어가 의도한 코어인지**(`'deferRender' in core === (LITHENT_CORE === 'concurrent')`).
**종료 조건**: BG-1~4 통과, `import 'lithent/element'`가 루트에서 해석됨, R-1 결과 기록.

### Phase 0 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 base | `element-smoke` 2/2 통과 |
| BG-2 concurrent | 2/2 통과, "resolves the concurrent core" |
| BG-3 코어 diff | `git diff --stat -- src lithentConcurrent/src` 출력 없음 |
| BG-4 빌드 | 통과 (타입체크·eslint·prettier 포함). 처음엔 prettier 1건으로 실패 → 포맷 후 통과 |
| `lithent/element` 해석 | ESM `import('lithent/element')` → `['defineElement']`, CJS `require.resolve` → `element/dist/lithentElement.umd.js` |
| RC-3 크기 | 스캐폴드 UMD **br 221 B / 1,000 B** (base 코어 br 4,739 / 4,800 변화 없음) |
| 전체 회귀 | `pnpm test` 통과, `test:satellites`·`test:satellites:concurrent` 통과, 전체 `pnpm build` 통과(1m37s) |
| R-1 E2E | base(base 2벌)·concurrent(base 호스트 + concurrent 위젯) **2/2 통과** |
| E2E 타입체크 | `pnpm exec tsc -p e2e/tsconfig.json` 통과 |

### Phase 0 돌연변이 검증

| 돌연변이 | 기대 | 결과 |
|---|---|---|
| `element/vite.config.js`에서 `...coreAlias` 제거 후 `LITHENT_CORE=concurrent` 실행 | smoke의 코어 판별 테스트 실패 | **실패함** (`expected false to be true`) → 복구 |
| fixture에서 호스트 클릭 시 위젯 슬롯의 첫 자식을 제거 | R-1 스펙 실패 | **실패함** (위젯 항목 5개 기대 / 1개 수신) → 복구 |

### Phase 0에서 드러난 것

- **fixture 실수 → 코어 버그로 오인할 뻔했다.** R-1 첫 실행에서 "keyed 이동 시 DOM 노드 유지" 단언이
  base·concurrent 모두 실패했다. 대조군(`?second=same`, lithent 1벌)에서도 똑같이 실패해 R-1과 무관함을
  확인했고, 원인은 fixture가 리스트를 `h('ul', {}, ...items.map(...))`처럼 **펼쳐서** 넘긴 것이었다.
  lithent의 keyed diff는 자식이 **배열**(loop 타입)일 때만 적용된다. 배열로 넘기면 같은 key의 노드가 보존된다
  (component key·element key 둘 다 확인). → 대조 모드 `?second=same`은 진단용으로 fixture에 남겼다.
  **Phase 10 문서에 "keyed 리스트는 배열로 넘길 것"을 element 가이드 예제에도 반영한다.**
- 루트 vitest가 `.test.ts`를 자동 수집해 element 테스트를 잘못된 `@` alias로 실행했다 → 루트 exclude 추가 (위 공통 규칙).

## Phase 1 — 등록과 마운트/언마운트 (FR-1, FR-2 기본)

진입 조건: DC-7, DC-8 확정.

- [x] 1-1 `customElements` 부재 시 `undefined` 반환 (SSR 안전)
- [x] 1-2 중복 정의 시 기존 생성자 반환 (DC-7)
- [x] 1-3 `connectedCallback`에서 Host 래퍼(DESIGN §2.2)로 렌더 루트에 render
- [x] 1-4 `disconnectedCallback`에서 destroy (이 단계는 즉시 destroy. 지연은 Phase 6)
- [x] 1-5 이름에 하이픈이 없으면 브라우저 예외를 그대로 전파 (자체 검사 코드 없이 크기 절약)
- [x] (앞당김) 4-1 렌더 루트 선택 — 1-3이 렌더 루트를 필요로 해서 Phase 4에서 가져왔다.
      기본 open shadow, `'closed'`, `false`(호스트 자신) 세 경우 모두 테스트

**기본 테스트** (`element-lifecycle.test.ts` 11건, `element-ssr.test.ts` 1건):
- 요소를 붙이면 내부 DOM이 렌더 루트에 생긴다 (open / closed / `shadow: false`)
- 요소를 떼면 `mountCallback`이 돌려준 cleanup이 **중첩 컴포넌트까지** 실행된다
- 재연결하면 새 인스턴스 (closed root 재사용, `attachShadow` 재호출 없음)
- 렌더 루트 안에서 renew·클로저 상태 유지
- 정의 전 문서에 있던 요소가 정의 시 업그레이드돼 렌더된다
- 같은 이름 2회 정의 → 예외 없음, 같은 생성자, 첫 컴포넌트 유지
- 하이픈 없는 이름 → 브라우저 예외
- `lmount` 컴포넌트 허용
- **SSR**: `@vitest-environment node`에서 `HTMLElement`·`customElements`가 실제로 없는 상태로 import·호출 → `undefined`

**종료 조건**: BG 통과 + 위 테스트 + 돌연변이 1회.

### Phase 1 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 14/14 (base), 14/14 (concurrent) |
| BG-3 | B-1 수정(`98db595`) 외 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 |
| RC-3 크기 | **br 444 B / 1,000 B** (`#private` 사용 시 669 B → DESIGN §2.4) |
| 전체 회귀 | `pnpm test:dual` 실패 0, `verify:concurrent` ALL PASS, `verify:release` ALL PASS, **E2E 24/24** |

### Phase 1 돌연변이 검증

| 돌연변이 | 기대 | 결과 |
|---|---|---|
| 중복 이름 가드 제거 | DC-7 테스트 실패 | **실패함** (1건) → 복구 |
| `disconnectedCallback`에서 `this.d()` 제거 | 언마운트·재연결 테스트 실패 | **실패함** (2건) → 복구 |
| B-1 수정 되돌리기 (코어) | 코어 회귀 테스트 실패 | **base·concurrent 각 3/5 실패** → 복구 |

### Phase 1에서 드러난 것

- **코어 버그 B-1** (DESIGN §10.1). 언마운트 테스트가 실패해서 순수 lithent로 재현했고, 사용자 결정으로 코어를 고쳤다.
  기존 코어 테스트는 destroy 후 DOM이 비는 것만 봤고 unmount 콜백은 검사하지 않았다.
- **테스트 격리**: B-1을 고치자 unmount 로그가 실제로 찍히면서, `beforeEach`가 로그를 비운 *뒤* `body`를 비워
  이전 테스트의 unmount 로그가 다음 테스트로 섞였다 → `body` 먼저 비우도록 수정.
- **lmount 타입**: 코어 `TagFunction`이 `lmount` 결과를 받지 않아 빌드 타입체크가 실패 → `ElementComponent` 도입 (DESIGN §2.4).
- **크기**: `#private` 필드의 다운레벨 헬퍼가 669 B 중 절반 이상 → WeakMap + `declare`로 444 B.

## Phase 2 — 속성 → props (FR-3)

진입 조건: DC-2 확정.

- [x] 2-1 `observedAttributes` = 선언 키의 kebab-case (static getter)
- [x] 2-2 타입 변환 표(DESIGN §4.1) 구현
- [x] 2-3 연결 전 속성 → 첫 렌더 반영
- [x] 2-4 연결 후 속성 변경 → renew (Host가 `renew`를 `this.r`에 보관, 분리 시 해제)

**기본 테스트** (`element-attributes.test.ts` 11건):
- 타입별 변환·제거 시 값 (표의 모든 행, 잘못된 숫자·JSON)
- Boolean: 처음부터 없음 → `false`, `"false"` → `true`, 제거 → `false`
- `max-count` ↔ `maxCount`, `observedAttributes` 목록
- 같은 태스크에 속성 3개 변경 → 내부 updater 실행 1회 (FR-3 배치)
- 선언되지 않은 속성 변경은 렌더를 일으키지 않는다
- 갱신 시 DOM 노드 유지 (`<p>` 동일성)
- 연결 전 속성 → 첫 렌더, 분리 중 변경 → 렌더 없음 → 재연결 시 최신 값
- `lmount` 컴포넌트도 setup 시점의 `props` 참조로 새 값을 본다 (DESIGN §2.1의 제자리 갱신 확인)

### Phase 2 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 25/25 (base), 25/25 (concurrent) |
| BG-3 | `git diff --stat 98db595 -- src lithentConcurrent/src` 출력 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 |
| RC-3 크기 | **br 657 B / 1,000 B** (Phase 1 444 B → +213 B) |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 2 돌연변이 검증

| 돌연변이 | 결과 |
|---|---|
| 속성 변경 시 `this.r()` 호출 제거 | **7/11 실패** → 복구 |
| kebab 변환 제거 (`keyOf[key] = key`) | **2/11 실패** → 복구 |
| Boolean 변환을 `value === ''`로 | **1/11 실패** (`"false"` 케이스) → 복구 |

### Phase 2에서 드러난 것

- **Boolean 초기값 불일치**: 처음엔 "처음부터 없는 Boolean = `undefined`, 넣었다 빼면 `false`"였다. 브라우저가 없는 속성에
  콜백을 부르지 않기 때문. 생성자에서 Boolean을 `false`로 채워 일관시켰다 (DESIGN §4.1).
- **dev 경고 철회**: 저장소에 개발 전용 빌드 규약이 없어 경고를 넣지 않기로 했다 (DESIGN §4.4).
- **크기 경고**: 남은 여유 343 B로 Phase 3(접근자·업그레이드), 4(스타일·slot·자식 비움), 5(`host`·`emit`), 6(지연 destroy)를 해야 한다.
  각 Phase에서 측정하고, 초과가 보이면 Phase 8-4 전에 예산 재검토를 사용자에게 올린다.

## Phase 3 — 프로퍼티 → props (FR-4)

- [x] 3-1 선언 키마다 prototype get/set 접근자
- [x] 3-2 업그레이드 전 할당 흡수 (DESIGN §4.2) — **생성자에서** (문서의 `connectedCallback`에서 변경, 근거 §4.2)
- [x] 3-3 프로퍼티 값은 변환하지 않음 (객체·함수 그대로)

**기본 테스트** (`element-properties.test.ts` 9건):
- `el.options = {…}` → 내부 props가 같은 참조, 문자열을 숫자 prop에 넣어도 변환 없음
- 선언되지 않은 이름은 그냥 expando (props에 안 들어감)
- getter는 현재 prop (속성으로 들어온 변환 값 포함)
- 프로퍼티가 속성으로 반영되지 않음 (DC-3)
- 속성·프로퍼티를 섞으면 마지막 쓰기가 이김
- 같은 태스크에 프로퍼티 3개 → 렌더 1회
- 연결 전 할당 → 첫 렌더 반영
- 정의 전 할당: `createElement` 후 할당 → 정의 시 흡수 / 파싱된 요소에 할당 → 정의 시 흡수, 이후 접근자 동작
- 네이티브 이름(`title`) 특성화: prop이 이기고 속성은 설정되지 않음 (DESIGN §4.2.1)

### Phase 3 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 34/34 (base), 34/34 (concurrent) |
| BG-3 | `98db595` 이후 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 |
| RC-3 크기 | **br 719 B / 1,000 B** (+62 B). 남은 여유 281 B로 Phase 4~6 |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 3 돌연변이 검증

| 돌연변이 | 결과 |
|---|---|
| 업그레이드 흡수 블록 무력화 | **2/9 실패** (정의 전 할당 2건) → 복구 |
| setter의 `this.r()` 제거 | **4/9 실패** → 복구 |
| getter가 `undefined` 반환 | **3/9 실패** → 복구 |

### Phase 3에서 드러난 것

- jsdom도 정의 전 `createElement`·파싱된 요소를 `define` 시 업그레이드한다. 실제 브라우저 확인은 Phase 9 E2E.
- 네이티브 이름 충돌은 막지 않고 제약으로 문서화 (DESIGN §4.2.1, R-5).

## Phase 4 — Shadow DOM, 스타일, slot (FR-6, FR-7)

진입 조건: DC-6, DC-8 확정.

- [x] 4-1 `shadow` 옵션에 따라 `attachShadow({mode})` 또는 호스트 자신을 렌더 루트로 — **Phase 1에서 완료**
- [x] 4-2 `styles`: 정의당 `CSSStyleSheet` 1회 생성(첫 사용 시) + `adoptedStyleSheets`, 미지원 시 `<style>` 폴백
- [x] 4-3 non-shadow 모드: 마운트 전 기존 자식 비움 (DC-6), `styles` 무시 (경고 없음, DESIGN §4.4)
- [x] 4-4 **R-2 회귀 가드**: 폴백 `<style>`이 있는 shadowRoot에서 내부 컴포넌트가
      0개 ↔ N개 자식으로 바뀌고 언마운트돼도 `<style>`이 남는지

**기본 테스트** (`element-shadow.test.ts` 11건):
- 폴백: 스타일 배열을 합친 `<style>` 1개가 루트 첫 자식, 인스턴스마다 / 스타일 없으면 없음 / light DOM 모드는 무시
- R-2: 루트 자식 2 → 0 → 3 → 언마운트 → 재마운트 내내 `<style>` 정확히 1개, 첫 자식
- adopted: `ShadowRoot.prototype.adoptedStyleSheets`·`CSSStyleSheet` 스텁으로 정의당 시트 1개 공유, `<style>` 없음, 스타일 없으면 시트 생성 안 함
- slot: 기본 slot 투영 + 이후 추가된 자식, 이름 있는 slot
- DC-6: 서버 폴백 콘텐츠 교체, 분리 중 추가된 자식 제거, shadow 모드는 light 자식 유지

### Phase 4 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 45/45 (base), 45/45 (concurrent) |
| BG-3 | `98db595` 이후 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 (테스트의 `h(Fragment…)`는 ftags와 같은 `FragmentFunction` 캐스트) |
| RC-3 크기 | **br 835 B / 1,000 B** (+116 B). 남은 여유 165 B로 Phase 5·6 |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 4 돌연변이 검증

| 돌연변이 | 결과 |
|---|---|
| 스타일을 루트 생성 때가 아니라 매 연결마다 추가 | **1/11 실패** (R-2: `<style>` 2개) → 복구 |
| light DOM 비우기 제거 | **2/11 실패** → 복구 |
| 시트 공유 제거 (인스턴스마다 생성) | **1/11 실패** → 복구 |

### Phase 4에서 드러난 것

- jsdom에는 `adoptedStyleSheets`가 없고 `CSSStyleSheet.replaceSync`도 없다 → 단위 테스트는 폴백 경로가 기본,
  adopted 경로는 스텁으로 공유 로직만 확인. **실제 브라우저 적용은 Phase 9-1에서 반드시 확인**.
- 시트를 정의 시점에 만들면 jsdom에서 `replaceSync` 부재로 정의가 실패한다 → 첫 사용 시 생성 (DESIGN §5).
- 크기: adopted 분기가 약 60 B. 예산 초과 시 첫 축소 후보 (DESIGN §5 크기 메모).

## Phase 5 — 이벤트 발행 (FR-5)

진입 조건: DC-5 확정.

- [x] 5-1 Host가 내부 컴포넌트에 `host` prop 주입
- [x] 5-2 `emit(el, name, detail)` export (`bubbles`, `composed`, **`cancelable`** true, 반환값 = `dispatchEvent` 결과)
- [x] 5-3 `options.props`에 `host` 선언 시 정의 단계 예외 (등록도 안 됨)

**기본 테스트** (`element-events.test.ts` 9건):
- `props.host`가 요소 자신, 재렌더 후에도
- `host` 선언 → 예외, 미등록
- 요소 리스너가 `detail` 수신 / 페이지·document까지 버블링 (target = 요소)
- **중첩 shadow**: 다른 shadow root 안의 위젯이 보낸 이벤트가 document에 도달 (target = 바깥 호스트) — `composed` 검증
- closed shadow 요소, light DOM 요소에서도 동작
- 페이지가 `preventDefault()` → `emit`이 `false`
- 이벤트 객체가 `CustomEvent`이고 `bubbles`·`composed`·`cancelable`

Phase 2 테스트 2건이 props를 정확히 비교(`toEqual`)하고 있어 `host: el`을 기대값에 추가했다 (의도된 변화).

### Phase 5 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 54/54 (base), 54/54 (concurrent) |
| BG-3 | `98db595` 이후 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 |
| RC-3 크기 | **br 911 B / 1,000 B** (+76 B). 내역: 예약어 검사 26 B(긴 메시지였으면 +18), `cancelable` 11 B. 남은 여유 89 B로 Phase 6 |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 5 돌연변이 검증

| 돌연변이 | 결과 |
|---|---|
| `host` 주입 제거 | **5/8 실패** → 복구 |
| `composed: false` | 처음엔 **1/8만 실패** (속성 검사 테스트뿐) → 아래 참고, 테스트 교체 후 **2/9 실패** → 복구 |
| `cancelable` 제거 | **2/8 실패** → 복구 |
| 예약어 검사 제거 | **1/8 실패** → 복구 |

### Phase 5에서 드러난 것

- **`composed` 오해**: 초안은 "composed로 shadow 경계를 넘어 페이지에 닿는다"였지만 `emit`은 호스트 요소에서 발행하므로
  버블링만으로 닿는다. 돌연변이에서 동작 테스트가 실패하지 않아 발견했다. `composed`가 실제로 필요한 상황(중첩 shadow)으로
  테스트를 바꾸고 DESIGN §6을 고쳤다.
- **`styles` 유지 결정** (사용자, DESIGN §5) — 이 Phase 시작 전에 확정.

## Phase 6 — DOM 이동 보존 (DC-4)

진입 조건: DC-4 확정.

- [x] 6-1 destroy를 microtask 지연, 재연결이면 취소
- [x] 6-2 분리된 상태에서의 속성 변경은 렌더하지 않음

**기본 테스트** (`element-move.test.ts` 8건):
- 한 번 호출 이동(`appendChild` 다른 부모, `insertBefore`, `replaceChildren`) → 상태 보존, unmount 0회, 이후 갱신도 동작
- **두 번 호출 이동**(`remove()` → `appendChild`, 같은 태스크) → 상태 보존 (DESIGN §7.0)
- light DOM 요소 이동 → 상태 보존, 렌더된 자식 유지 (DC-6 비우기가 이동에 걸리지 않음)
- 떼고 microtask 경과 → unmount 1회 / 다음 태스크에 다시 붙임 → 새 인스턴스
- 이동 후 같은 태스크에 제거 → unmount 1회
- 분리 중 속성 변경·renew → 렌더 없음, 재연결 시 새 인스턴스

기존 테스트 조정: 언마운트가 microtask 뒤로 밀려 Phase 1·4 테스트 5건이 "떼자마자 언마운트"를 가정하고 있었다.
`beforeEach`에서 `body`를 비운 뒤 microtask를 기다리고, 해당 테스트는 `remove()` 뒤 microtask를 기다리도록 바꿨다.

### Phase 6 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 62/62 (base), 62/62 (concurrent) |
| BG-3 | `98db595` 이후 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과 |
| RC-3 크기 | **br 935 B / 1,000 B** (+24 B). 기능 Phase(1~6) 종료 시점. 남은 여유 65 B |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 6 돌연변이 검증

| 돌연변이 | 결과 |
|---|---|
| 즉시 destroy (microtask 없이 `isConnected` 검사만) | 처음엔 **1/7만 실패** → 2회 호출 이동 테스트 추가 후 **2/8 실패** → 복구 |
| `isConnected` 검사 제거 (microtask 후 무조건 destroy) | **3/7 실패** → 복구 |
| `connectedCallback`의 `if (this.d) return` 제거 | **4/7 실패** → 복구 |

### Phase 6에서 드러난 것

- **CE 반응 타이밍** (DESIGN §7.0): 한 번 호출 이동은 `isConnected`만으로 충분했다. microtask가 지키는 건 2회 호출 이동이다.
  돌연변이가 이걸 드러냈고 해당 테스트를 추가했다. jsdom도 표준 타이밍을 따른다 — 실제 브라우저는 Phase 9에서 확인.

## Phase 7 — 타입과 UMD (RC-5, RC-6)

- [x] 7-1 DESIGN §8 타입 구현 (`PropsOf`, `ElementProps`, `LithentElementOf` export)
- [x] 7-2 타입 테스트 (`element-types.test.ts`: `expectTypeOf` + 컴파일 전용 `@ts-expect-error` 9건)
- [x] 7-3 UMD 산출물에서 전역 `lithentElement` 확인 — `vm`에서 코어 UMD → element UMD 순서로 실행:
      `defineElement`, `emit` 노출, `customElements` 없으면 `undefined`. 의존성 연결은 전역 `lithent`·CJS `require`·AMD 모두.
      실제 브라우저 확인은 Phase 9 MT-1 자동화

**기본 테스트**: `element-types.test.ts` 3건(런타임) + 컴파일 전용 함수. Phase 5 테스트의 `host` 선언 줄에도
`@ts-expect-error` 추가 — 런타임 가드는 타입 없는 호출자용으로 계속 검증.

### Phase 7 실측 결과 (2026-10-06)

| 항목 | 결과 |
|---|---|
| BG-1 / BG-2 | element 65/65 (base), 65/65 (concurrent) |
| BG-3 | `98db595` 이후 코어 diff 없음 |
| BG-4 | 빌드·타입체크·eslint 통과, `dist/index.d.ts` 생성 확인 |
| RC-3 크기 | **br 935 B** (변화 0) |
| 전체 회귀 | `pnpm test` 실패 0, `test:satellites:concurrent` 통과 |

### Phase 7 돌연변이 검증 (타입)

빌드 타입체크가 실패해야 통과다 (`@ts-expect-error`가 "사용되지 않음"이 됨).

| 돌연변이 | 결과 |
|---|---|
| `host?: never` 가드 제거 | **빌드 오류 2건** → 복구 |
| 컴포넌트 매개변수를 `never`로 (검사 끔) | **빌드 오류 5건** → 복구 |
| `NoInfer` 제거 | 미사용 선언 오류 1건뿐 — 동작 차이 없음 → **`NoInfer` 자체를 제거** (DESIGN §8) |

### Phase 7에서 드러난 것

- `NoInfer`는 필요 없었다 (위 표). 비교 실험: 선택적 prop만 가진 컴포넌트를 선언 없이 넘기면 weak type 검사로 오류 —
  선언 누락을 잡아주는 바람직한 동작이라 타입 테스트에 고정.
- Prettier가 긴 호출을 여러 줄로 나누면 `@ts-expect-error`가 오류 줄 바로 위에 있지 않게 된다 → 짧은 변수로 한 줄 유지.

## Phase 8 — 테스트 하드닝

- [ ] 8-1 경계 케이스: 렌더 중 예외를 던지는 내부 컴포넌트, 연결→분리→연결 빠른 반복 100회(누수 없음),
      `Object` 타입에 잘못된 JSON, 같은 요소에 대한 중첩 정의
- [ ] 8-2 concurrent 코어에서 `deferRender` 진행 중 분리 (R-4)
- [ ] 8-3 각 Phase 핵심 테스트 돌연변이 재확인 (최소 5개 돌연변이, 결과 표로 기록)
- [ ] 8-4 RC-3 크기 실측 기록, 초과 시 축소 작업

## Phase 9 — 통합 테스트

- [ ] 9-1 Playwright `e2e/element.spec.ts` + fixture 페이지 (base·concurrent 두 프로젝트 모두):
  - 순수 HTML + UMD (MT-1 자동화)
  - 호스트 CSS가 shadow 내부에 새지 않음 / 내부 CSS가 밖으로 새지 않음 (computed style 비교)
  - 실제 브라우저의 `adoptedStyleSheets` 경로
  - React 호스트 앱 안에서 렌더·속성 갱신·이벤트 수신 (MT-4 자동화, React는 fixture 전용 devDependency)
  - lithent 2벌 동시 로드 (R-1 최종 확인)
- [ ] 9-2 `pnpm test`, `pnpm test:dual`, `pnpm size`, `pnpm verify:release` 전부 통과

## Phase 10 — 문서와 출하 준비

- [ ] 10-1 `lithentDocs`에 Element 가이드 (en/ko 페이지 쌍, 기존 `*_ko.tsx` 규약)
- [ ] 10-2 README Ecosystem 표에 `lithent/element` 추가
- [ ] 10-3 `skills/lithent`와 `lithent-agent-addon.md`에 API 추가 (`pnpm build:skills`)
- [ ] 10-4 CHANGELOG 항목, 버전 결정(마이너 업)
- [ ] 10-5 IDEAS.md §4 상태 갱신
- [ ] 10-6 `scripts/verify-release.mjs`의 공개 import 경로 검사(현재 10개)에 `lithent/element` 추가
- [ ] 10-7 B-1 수정(`98db595`) 포함 릴리스의 버전 결정 (CHANGELOG Unreleased → 버전 절)

---

## 진행 기록

| 날짜 | 완료 | 다음 | 블로커 | 커밋 |
|---|---|---|---|---|
| 2026-10-06 | 문서 4종 초안, IDEAS.md | DC-1~DC-9 사용자 확정 → Phase 0 | DC 미확정 | `deea8c6` |
| 2026-10-06 | DC-1~DC-9 확정, Phase 0 완료 (스캐폴딩, exports, size gate, R-1 E2E) | Phase 1 (등록·마운트/언마운트) | 없음 | `a811b16` |
| 2026-10-06 | 코어 B-1 수정, Phase 1 완료 (등록·마운트/언마운트·렌더 루트) | Phase 2 (속성 → props) | 없음 | `98db595`, `6e7f0ae` |
| 2026-10-06 | Phase 2 완료 (속성 → props, Boolean 기본 false, dev 경고 철회) | Phase 3 (프로퍼티 → props) | 없음 | `19597be` |
| 2026-10-06 | Phase 3 완료 (프로퍼티 접근자, 생성자에서 업그레이드 흡수, 네이티브 이름 제약 문서화) | Phase 4 (스타일·slot·non-shadow 자식) | 없음 | `d537013` |
| 2026-10-06 | Phase 4 완료 (스타일 adopted+폴백, slot, light DOM 비움, R-2 가드) | Phase 5 (이벤트 발행) | 없음 | `1ad0f8d` |
| 2026-10-06 | `styles` 유지 결정, Phase 5 완료 (`host` prop, `emit` cancelable, composed 설명 정정) | Phase 6 (DOM 이동 보존) | 없음 | `0d533ce` |
| 2026-10-06 | Phase 6 완료 (이동 시 인스턴스 보존, CE 반응 타이밍 확인) — 기능 Phase 종료 | Phase 7 (타입·UMD) | 없음 | `d707586` |
| 2026-10-06 | Phase 7 완료 (props 타입 추론, host·미선언·불일치 컴파일 오류, UMD 전역 확인, NoInfer 불필요 확인) | Phase 8 (테스트 하드닝) | 없음 | (Phase 7 커밋) |

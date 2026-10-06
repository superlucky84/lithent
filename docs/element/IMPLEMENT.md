# IMPLEMENT — `lithent/element` (Custom Element 래퍼)

- 작성일: 2026-10-06
- 상태: **Phase 0 완료 (2026-10-06). DC-1~DC-9 확정. 다음: Phase 1.**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md), [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 공통 규칙

- **모든 Phase의 기본 게이트(BG)**: 아래가 전부 통과해야 Phase를 닫는다.
  - BG-1 `pnpm --filter lithent-element test` (base 코어)
  - BG-2 `LITHENT_CORE=concurrent pnpm --filter lithent-element test` (사전: `pnpm build:concurrent`)
  - BG-3 `git diff --stat -- src lithentConcurrent/src` 출력 없음 (RC-1)
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

- [ ] 1-1 `customElements` 부재 시 `undefined` 반환 (SSR 안전)
- [ ] 1-2 중복 정의 시 기존 생성자 반환 (DC-7)
- [ ] 1-3 `connectedCallback`에서 Host 래퍼(DESIGN §2.2)로 렌더 루트에 render
- [ ] 1-4 `disconnectedCallback`에서 destroy (이 단계는 즉시 destroy. 지연은 Phase 6)
- [ ] 1-5 이름에 하이픈이 없으면 브라우저 예외를 그대로 전파 (자체 검사 코드 없이 크기 절약)

**기본 테스트** (`element-lifecycle.test.ts`):
- 요소를 붙이면 내부 DOM이 렌더 루트에 생긴다
- 요소를 떼면 `mountCallback`이 돌려준 cleanup이 실행된다
- 정의 전 문서에 있던 요소가 정의 시 업그레이드돼 렌더된다
- 같은 이름 2회 정의 → 예외 없음, 같은 생성자
- `globalThis.customElements`를 지운 상태에서 import·호출 → 예외 없음

**종료 조건**: BG 통과 + 위 테스트 + 돌연변이 1회.

## Phase 2 — 속성 → props (FR-3)

진입 조건: DC-2 확정.

- [ ] 2-1 `observedAttributes` = 선언 키의 kebab-case
- [ ] 2-2 타입 변환 표(DESIGN §4.1) 구현
- [ ] 2-3 연결 전 속성 → 첫 렌더 반영
- [ ] 2-4 연결 후 속성 변경 → renew

**기본 테스트** (`element-attributes.test.ts`):
- 타입별 변환·제거 시 값 (표의 모든 행)
- `max-count` ↔ `maxCount`
- 같은 태스크에 속성 3개 변경 → 내부 updater 실행 1회 (FR-3 배치)
- 선언되지 않은 속성 변경은 렌더를 일으키지 않는다

## Phase 3 — 프로퍼티 → props (FR-4)

- [ ] 3-1 선언 키마다 prototype get/set 접근자
- [ ] 3-2 업그레이드 전 할당 흡수 (DESIGN §4.2)
- [ ] 3-3 프로퍼티 값은 변환하지 않음 (객체·함수 그대로)

**기본 테스트** (`element-properties.test.ts`):
- `el.options = {a:1}` → 내부 props가 같은 참조
- 정의 전 할당 → 정의 후 반영
- 속성과 프로퍼티를 섞어 쓰면 마지막 쓰기가 이긴다

## Phase 4 — Shadow DOM, 스타일, slot (FR-6, FR-7)

진입 조건: DC-6, DC-8 확정.

- [ ] 4-1 `shadow` 옵션에 따라 `attachShadow({mode})` 또는 호스트 자신을 렌더 루트로
- [ ] 4-2 `styles`: 정의당 `CSSStyleSheet` 1회 생성 + `adoptedStyleSheets`, 미지원 시 `<style>` 폴백
- [ ] 4-3 non-shadow 모드: 첫 렌더 전 기존 자식 비움 (DC-6), `styles` 무시 + dev 경고
- [ ] 4-4 **R-2 회귀 가드**: 폴백 `<style>`이 있는 shadowRoot에서 내부 컴포넌트가
      0개 ↔ N개 자식으로 바뀌고 언마운트돼도 `<style>`이 남는지

**기본 테스트** (`element-shadow.test.ts`): 위 4개 + shadow 내부 `<slot>` 렌더 시 light DOM 자식 투영
(jsdom의 `assignedNodes()`로 확인).

## Phase 5 — 이벤트 발행 (FR-5)

진입 조건: DC-5 확정.

- [ ] 5-1 Host가 내부 컴포넌트에 `host` prop 주입
- [ ] 5-2 `emit(el, name, detail)` export (`bubbles`, `composed` true)
- [ ] 5-3 `options.props`에 `host` 선언 시 정의 단계 예외

**기본 테스트** (`element-events.test.ts`): shadow 내부 클릭 → 호스트 바깥 리스너가 `detail` 수신.

## Phase 6 — DOM 이동 보존 (DC-4)

진입 조건: DC-4 확정.

- [ ] 6-1 destroy를 microtask 지연, 재연결이면 취소
- [ ] 6-2 분리된 상태에서의 속성 변경은 렌더하지 않음

**기본 테스트** (`element-move.test.ts`):
- `parentA.appendChild(el)` → `parentB.appendChild(el)` 같은 태스크 → 내부 상태(클로저 카운터) 보존, unmount 0회
- 떼고 microtask 경과 → unmount 1회
- 떼고 다음 태스크에 다시 붙임 → 새 인스턴스(상태 초기화)

## Phase 7 — 타입과 UMD (RC-5, RC-6)

- [ ] 7-1 DESIGN §8 타입 구현
- [ ] 7-2 타입 테스트 (`element-types.test-d.ts` 또는 `expectTypeOf`)
- [ ] 7-3 UMD 산출물에서 `window.lithentElement.defineElement` 확인

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

---

## 진행 기록

| 날짜 | 완료 | 다음 | 블로커 | 커밋 |
|---|---|---|---|---|
| 2026-10-06 | 문서 4종 초안, IDEAS.md | DC-1~DC-9 사용자 확정 → Phase 0 | DC 미확정 | `deea8c6` |
| 2026-10-06 | DC-1~DC-9 확정, Phase 0 완료 (스캐폴딩, exports, size gate, R-1 E2E) | Phase 1 (등록·마운트/언마운트) | 없음 | `a811b16` |

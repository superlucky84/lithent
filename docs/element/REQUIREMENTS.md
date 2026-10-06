# REQUIREMENTS — `lithent/element` (Custom Element 래퍼)

- 브랜치: `claude/ecstatic-sagan-xyu35m` / 기준 커밋 `285d8f8`
- 작성일: 2026-10-06
- 상태: **설계 단계. 코드 없음. DESIGN의 DC-1~DC-9 사용자 확정 대기.**
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.1, §3.1

## 1. 배경 및 목적

### 1.1 제품 목표

lithent 컴포넌트를 **표준 Custom Element**로 내보내서, 어떤 호스트 페이지
(React·Vue·jQuery·서버 렌더링 HTML·CMS)에도 `<script>` 한 줄과 태그 하나로 심을 수 있게 한다.

목표 사용자는 **남의 페이지에 들어가는 UI를 만드는 팀**이다
(결제 버튼, 상담 위젯, 리뷰 위젯, 사내 공통 헤더/푸터, 광고 슬롯).

### 1.2 왜 lithent여야 하는가 (마케팅 근거 — 검증 대상)

| 주장 | 검증 항목 |
|---|---|
| 코어 + element 합쳐 **약 5KB**(brotli, `scripts/size-report.js` 기준) | RC-3 |
| 호스트의 프레임워크·버전과 **충돌 없음** | MT-4 (React 호스트 안에서 동작) |
| Shadow DOM으로 **CSS 양방향 격리** | MT-2, E2E |
| 빌드 도구 없이 **UMD 한 줄** | MT-1 |

### 1.3 지켜야 할 것

1. **코어 무수정** — `src/`와 `lithentConcurrent/src/`를 수정하지 않는다.
   공개 API(`h`, `render`, `mount`, `lmount`)만 사용한다.
   **승인된 예외 1건 (2026-10-06, 사용자 결정):** Phase 1에서 찾은 코어 버그 B-1
   (`render()`의 destroy가 unmount 콜백을 건너뜀, DESIGN §10.1) 수정. 커밋 `98db595`로 분리했다.
2. **양쪽 코어 호환** — 다른 위성(ftags 등)과 같이 `LITHENT_CORE=concurrent`에서도 테스트 통과.
3. **클로저 모델 유지** — 사용자는 기존 `mount`/`lmount` 컴포넌트를 *수정 없이* 넘긴다.
   element 전용 컴포넌트 작성법을 강요하지 않는다.
4. **opt-in** — `lithent` 코어 번들 크기에 영향 없음. `lithent/element` 서브패스로만 제공.

## 2. 용어

| 용어 | 정의 |
|---|---|
| **호스트 요소** | `defineElement`로 등록된 Custom Element 인스턴스 (`<pay-button>`) |
| **내부 컴포넌트** | 사용자가 넘긴 lithent 컴포넌트 (`PayButton`) |
| **렌더 루트** | 내부 컴포넌트가 그려지는 곳. shadow 모드면 `shadowRoot`, 아니면 호스트 요소 자신 |
| **속성(attribute)** | HTML 문자열 속성 (`amount="1000"`) |
| **프로퍼티(property)** | JS 객체 프로퍼티 (`el.amount = 1000`, `el.items = [...]`) |
| **props** | 내부 컴포넌트가 받는 객체. 속성·프로퍼티에서 만들어진다 |

## 3. 기능 요구사항

### FR-1. 등록

- `defineElement(tagName, component, options?)`로 Custom Element를 등록한다.
- 같은 이름이 이미 등록돼 있으면 **예외 없이 무시하고 기존 생성자를 반환**한다
  (위젯 스크립트가 한 페이지에 두 번 로드되는 일이 흔하다). → DC-7
- `customElements`가 없는 환경(SSR, Node)에서 **import만으로 예외가 나지 않는다**.

### FR-2. 마운트 / 언마운트

- 호스트 요소가 문서에 연결되면(`connectedCallback`) 내부 컴포넌트를 렌더 루트에 렌더한다.
- 문서에서 분리되면(`disconnectedCallback`) 언마운트한다 — lithent의 unmount 훅이 실행된다.
- **DOM 내 이동**(분리 직후 같은 태스크에서 재연결)은 언마운트·재마운트하지 않고
  상태를 보존한다. → DC-4

### FR-3. 속성 → props

- `options.props`에 선언된 이름만 관찰한다(`observedAttributes`).
- 속성 값은 선언된 타입으로 변환한다: `String`, `Number`, `Boolean`, `Object`(JSON). → DC-2
- 속성 이름은 kebab-case, props 키는 camelCase (`max-count` ↔ `maxCount`).
- 속성 변경 시 내부 컴포넌트가 새 props로 갱신된다. 같은 태스크의 여러 변경은 **1회 렌더**로 합쳐진다.

### FR-4. 프로퍼티 → props

- 선언된 props는 호스트 요소의 JS 프로퍼티로도 설정할 수 있다 (객체·배열·함수 전달 경로).
- **요소 정의 전에 설정된 프로퍼티**(업그레이드 전 할당)도 정의 후 반영된다.
- 프로퍼티를 속성에 다시 반영(reflect)하는지 → DC-3

### FR-5. 이벤트 발행

- 내부 컴포넌트가 호스트 요소에서 DOM `CustomEvent`를 발행할 수 있다.
  호스트 페이지는 `el.addEventListener('pay', ...)`로 받는다. → DC-5

### FR-6. 스타일 격리

- shadow 모드에서 `options.styles`(CSS 문자열 배열)를 렌더 루트에 적용한다.
- 호스트 페이지 CSS가 내부에 새지 않고, 내부 CSS가 밖으로 새지 않는다(shadow 모드 한정).

### FR-7. 자식 콘텐츠 (slot)

- shadow 모드에서 내부 컴포넌트가 `<slot>`을 렌더하면 호스트의 light DOM 자식이 투영된다.
- non-shadow 모드의 자식 처리 → DC-6

## 4. 비기능 요구사항 (RC = Regression/Release Check)

| ID | 요구사항 | 측정 |
|---|---|---|
| RC-1 | `src/`, `lithentConcurrent/src/` diff 0줄 — **B-1 수정(`98db595`, 양쪽 `render.ts` 1줄 + 회귀 테스트)만 예외** | `git diff --stat 98db595 -- src lithentConcurrent/src` |
| RC-2 | base·concurrent 양쪽 코어에서 element 테스트 통과 | `pnpm --filter lithent-element test`, `LITHENT_CORE=concurrent` |
| RC-3 | `lithent/element` UMD 단독 ≤ **1,000 B** brotli (코어 예산 4,800 B와 합산 ≤ 5,800 B) | `pnpm size` (`scripts/size-report.js` targets에 추가) |
| RC-4 | 기존 테스트 전부 통과 (`pnpm test`) | CI |
| RC-5 | TypeScript 타입 제공: `options.props` 선언으로 props 타입 추론 | 타입 테스트 |
| RC-6 | UMD 빌드 제공, 전역 `lithentElement` | 빌드 산출물 확인 |
| RC-7 | 실제 브라우저(Chromium)에서 shadow·스타일·slot·이동 동작 확인 | Playwright E2E |

## 5. 비목표 (v1에서 하지 않는 것)

- **N1. Declarative Shadow DOM SSR / hydration** — `lithent/ssr`과의 결합은 v2.
- **N2. Form-associated custom elements** (`ElementInternals`, 폼 값 참여) — v2 후보.
- **N3. 스코프드 Custom Element 레지스트리** — 브라우저 지원이 불충분.
- **N4. 프레임워크별 래퍼** (React용 `<PayButton/>` 래퍼 등) — 표준 요소로 충분.
- **N5. 코어 변경** — 필요해 보이면 이 문서에 기록하고 별도 결정으로 넘긴다.

## 6. 가정과 제약

- 대상 브라우저: Custom Elements v1 + Shadow DOM v1을 지원하는 에버그린 브라우저.
  `adoptedStyleSheets` 미지원 환경은 `<style>` 폴백 (DESIGN §5).
- 단위 테스트는 jsdom(Custom Element·shadowRoot 지원, `adoptedStyleSheets` 미지원).
  스타일 격리와 실제 이벤트 retargeting은 Playwright로 검증한다.
- 개발 환경에 `node_modules`가 없으므로 Phase 0 진입 시 `pnpm install`이 선행된다.

## 7. 성공 기준

1. MANUAL_TEST_CHECKLIST의 MT-1~MT-6 전부 PASS.
2. RC-1~RC-7 전부 충족.
3. 데모: 같은 위젯이 (a) 순수 HTML, (b) React 앱, (c) 다른 버전 lithent가 있는 페이지에서
   동시에 동작하는 예제 페이지.

# IDEAS — Lithent / state-ref 차별화 및 기업 도입 아이디어

- 작성일: 2026-10-06
- 기준 커밋: `285d8f8`
- 상태: **아이디어 목록. 착수된 항목은 §4의 "상태" 열과 각 기능 문서 폴더를 따른다. `lithent/element` 구현 완료.**
- 착수 문서: [../element/](../element/) (`lithent/element`, 우선순위 1)

이 문서는 기능 결정이 아니라 **후보 목록**이다. 착수가 결정된 항목은 별도 폴더에
REQUIREMENTS / DESIGN / IMPLEMENT / MANUAL_TEST_CHECKLIST를 만들고 여기서는 링크만 건다.

## 1. 출발점 — 우리가 이미 가진 것

| 자산 | 위치 | 남들이 갖기 어려운 이유 |
|---|---|---|
| 경로 단위 의존성 추적 | state-ref path 트리 | 컴포넌트가 *정확히 어떤 경로*를 읽는지 안다 (`user.house[1].color`) |
| 불변 + copy-on-write | state-ref core | 모든 시점의 상태가 싸게 남는다 |
| draft + 필드 단위 충돌 감지 | `state-ref/draft` | 상태에 fork/merge 개념이 이미 있다 |
| 쓰기 원장 | `state-ref/plugin` `createWriteJournal` | 누가 어떤 경로를 썼는지 기록할 통로가 있다 |
| 명시적 갱신 | lithent `renew` | `watch(renew)` 한 줄이 곧 구독. 렌더 원인이 결정적이다 |
| 4KB 코어, 빌드 없는 템플릿 | lithent, `ftags`, `tag`, UMD | CDN 한 줄로 동작 |
| 우선순위·중단 가능 렌더 | `lithent-concurrent` | 별도 코어로 이미 출하됨 |

## 2. 기업 도입 관점의 포지셔닝

**기업은 기능 하나 때문에 메인 프레임워크를 바꾸지 않는다.** 채용·레퍼런스·유지보수 리스크가
기능보다 크다. 따라서 React와 정면으로 붙지 않고 **"React가 불편한 자리"**를 가져온다.

> 핵심 메시지: **"메인 앱은 React 그대로. React가 무거운 곳엔 lithent."**

### 2.1 공략 지점

| 자리 | 문제 | lithent의 답 | 필요한 기능 |
|---|---|---|---|
| **외부에 심는 위젯 / SDK** (결제창, 상담 채팅, 광고, 공통 헤더) | React SDK는 40KB+, 호스트의 React 버전·CSS와 충돌 | 4KB + Shadow DOM 격리 | **`lithent/element`** (§3.1) |
| **레거시 서버 렌더링 페이지** (JSP, Thymeleaf, PHP) | SPA 전환 예산 없음, jQuery 스파게티 | 빌드 없이 영역 단위 컴포넌트화 | `lithent/element`의 `shadow: false` (§3.2 — `autoMount`는 보류) |
| **폼 많은 백오피스** | 편집 중 덮어쓰기 사고 | draft 격리 + 충돌 표시 | **Draft Boundary** (§3.3) |

### 2.2 기능보다 먼저 채워야 할 도입 승인 체크리스트

| 항목 | 할 일 |
|---|---|
| 지속성 | semver·LTS 정책, 로드맵, 1인 메인테이너 리스크에 대한 답 |
| 보안 | CSP·Trusted Types 호환 명시, `innerHTML` 경로 문서화, `SECURITY.md` |
| 테스트 | `lithent/test` (render·쿼리·이벤트 발생 유틸) |
| 성능 증거 | js-framework-benchmark 등재, 저사양 WebView·키오스크 실측 |
| 탈출구 | 위젯·아일랜드 단위 도입 = 언제든 뺄 수 있음을 문서로 증명 |
| 레퍼런스 | 실서비스 사례 1~2건 (작은 위젯도 충분) |

## 3. 기능 후보 상세

### 3.1 `lithent/element` — Custom Element + Shadow DOM 래퍼 ⭐ 착수

```ts
defineElement('pay-button', PayButton, { shadow: true, props: { amount: Number } });
// 고객사 페이지: <script src="cdn/pay.js"></script> <pay-button amount="1000"></pay-button>
```

"React 사이트든 jQuery 사이트든 5KB로 어디에나 심는다." → [../element/](../element/)

### 3.2 `autoMount` — 서버 HTML 위의 선언형 아일랜드 ⛔ 보류 (2026-10-07)

```html
<div data-lithent="OrderTable" data-props='{"orderId":42}'>서버가 그린 HTML</div>
<script>lithent.autoMount({ OrderTable })</script>
```

경쟁: Alpine.js, htmx, Stimulus. 차별점으로 삼으려던 것: 컴포넌트·상태·hydration까지 있는 구조화된 대안.

**보류 사유 — 현실성이 없다.**

- hydration은 서버 HTML을 파싱해 가상 DOM을 만드는 것이 아니라, 컴포넌트(JS)가 만든 가상 DOM을
  기존 DOM과 태그 구조로 대조하는 것이다. JSP·PHP 서버는 JSX를 실행할 수 없으므로 같은 마크업을
  서버 템플릿과 JSX에 **손으로 두 번** 써서 구조를 맞춰야 한다. 유지보수가 안 된다.
- hydration을 빼고 "지우고 새로 그리기"로 가면 `lithent/element`의 `shadow: false`와 같은 물건이
  된다. light DOM 엘리먼트는 연결될 때 서버가 그린 자식을 비우고 렌더하고, `Object` prop은 속성의
  JSON을 받으며, 나중에 삽입된 HTML도 브라우저가 업그레이드한다.

```html
<order-table order-id="42">서버가 그린 HTML</order-table>
```

레거시 서버 페이지 공략(§2.1)은 새 기능 없이 `lithent/element`로 한다.

### 3.3 Draft Boundary — "모든 폼이 트랜잭션"

```tsx
const d = draftScope(store.user, renew);   // 서브트리가 draft를 본다
// d.ref.*로 편집, d.isDirty(), d.apply(), d.discard(), 필드별 conflict 표시
```

`createDraft` + `status.conflicts`를 lithent에 바인딩. 데모: 두 탭에서 같은 폼 편집 → 충돌 표시.

### 3.4 AI 에이전트 상태 샌드박스

에이전트는 경로 주소(`cart.items[2].qty`)로 **draft에만** 쓴다. UI가 `changes()`를 diff
오버레이로 보여주고 사람이 `apply()`/`discard()`. 3.3의 메커니즘 재사용.
"AI가 틀리지 않는 프레임워크" — 작은 API 표면이 컨텍스트에 통째로 들어간다는 실험 근거 확보 필요.

### 3.5 렌더 인과 추적 devtools

`createWriteJournal` + `watch(renew)` 결합:

```
<OrderRow #3> 재렌더
  ← cart.items[2].qty  1 → 3
  ← 쓴 곳: CartPanel.tsx:42 (onClick)
```

부산물: 쓰기 로그(JSON)만으로 재현되는 **리플레이 버그 리포트**.

### 3.6 경로 기반 우선순위 렌더 (lithent-concurrent 결합)

```ts
priority(store, { 'search.query': 'urgent', 'search.results': 'deferred' });
```

`startTransition`처럼 호출 지점이 아니라 **데이터 경로**에 우선순위를 선언.
현재 `deferRender`의 "urgent 입력과 무거운 렌더는 컴포넌트를 분리하라" 제약을 없애는 방향.
구현 난이도 최상.

### 3.7 프레임워크 침투형 아일랜드

state-ref의 React/Vue/Svelte/Solid 커넥터로 기존 앱 안에 lithent 위젯을 넣고 스토어 공유.
단독 킬러 기능이 아니라 도입 장벽 제거용.

## 4. 우선순위와 상태

| 순위 | 항목 | 근거 | 상태 |
|---|---|---|---|
| 1 | `lithent/element` (§3.1) | 구현 작음, 포지션 명확 (코어는 버그 B-1 수정만) | **구현·검증 완료 (2026-10-06)**, 출하 버전 결정 대기 — [../element/](../element/) |
| 2 | `autoMount` (§3.2) | 레거시 현대화 시장, 1의 변환 규칙 재사용 | **보류 (2026-10-07)** — 서버·클라이언트 마크업 이중 작성이 필요해 현실성 없음. 1의 `shadow: false`로 대체 |
| 3 | 도입 체크리스트 (§2.2) | 기능과 무관하게 승인에 필요 | **진행 중 (2026-10-07)** — 보안·지속성·탈출구 문서 초안 작성, `lithent/test`·벤치마크 등재·레퍼런스는 대기 — [../adoption/](../adoption/) |
| 4 | Draft Boundary (§3.3) | 차별성 최대, state-ref 기능 그대로 활용 | 대기 |
| 5 | AI 샌드박스 (§3.4) | 4 위에 얹음 | 대기 |
| 6 | 인과 추적 (§3.5) | 기존 write journal 활용 | 대기 |
| 7 | 경로 우선순위 (§3.6) | 임팩트 크나 난이도 최상 | 대기 |

## 5. 주의 — 차별점이 약한 것

time-travel, persist, 전역 store 자체는 Redux·zustand에도 있다. 이것만으로 마케팅하지 않는다.
"필드 단위 충돌 감지 + draft 격리"와 "어디에나 심는 5KB 위젯"이 메인 메시지다.

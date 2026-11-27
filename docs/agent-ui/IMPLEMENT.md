# IMPLEMENT — `lithent/agent` & `lithent/live`

- 브랜치: `feat/agent-ui` / 기준 커밋 `ead8b2e`
- 작성일: 2026-11-27
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 (`REQUIREMENTS`, `DESIGN`, `IMPLEMENT`, `MANUAL_TEST_CHECKLIST`) | done |
| 1 | `lithent/agent` 코어 패키지 (`agentAction`, `agentState`, `createAgentBridge`) | done |
| 2 | `lithent/agent` 어댑터 (WebMCP, `confirm` 승인 훅, `lithent/element` 연동) | done |
| 3 | `lithent/agent` 배포 연결·스킬·문서 (선택적 1차 릴리스 게이트) | planned |
| 4 | `lithent/live` 샌드박스 런타임 및 `postMessage` 양방향 RPC 브릿지 | planned |
| 5 | `lithent/live` Direct 모드, `<lithent-live>`, 오류 힌트, 자동 리사이즈 | planned |
| 6 | `lithent/live` 배포 연결·스킬·문서·인터랙티브 데모 | planned |
| 7 | Test Hardening (보안·경계값·오류 격리·동시성·누수 강화) | planned |
| 8 | Integration Test (이중 코어, 실제 브라우저 E2E, React 호스트, 릴리스 검증) | planned |

---

## Phase 0 — 문서 작성: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-2, DC-3, DC-4, DC-5, DC-6, DC-7, DC-8, DC-9, DC-10, DC-11, DC-12, DC-13, DC-14, M-1, M-2, M-3, M-4, M-5, M-6, M-7

- [x] `feat/agent-ui` 브랜치 생성 (`ead8b2e` 기준)
- [x] `docs/agent-ui/REQUIREMENTS.md` 작성 (확정 요청·제약, `RQ-1`~`RQ-12`, 비목표)
- [x] `docs/agent-ui/DESIGN.md` 작성 및 `DC-1`~`DC-14` 권장안 일괄 확정 (2026-11-27 사용자 승인)
- [x] `docs/agent-ui/IMPLEMENT.md` 작성 (Phase 0~8 계획, 기준 테스트, Test Hardening, Integration Test, Handoff)
- [x] `docs/agent-ui/MANUAL_TEST_CHECKLIST.md` 작성 (`M-1`~`M-7` 수동 검증 절차 및 합격 기준)
- [x] `docatlas check --strict` 검증 통과

Files:
- `docs/agent-ui/REQUIREMENTS.md` (added)
- `docs/agent-ui/DESIGN.md` (added)
- `docs/agent-ui/IMPLEMENT.md` (added)
- `docs/agent-ui/MANUAL_TEST_CHECKLIST.md` (added)

---

## Phase 1 — `lithent/agent` 코어 패키지: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-9, RQ-10, RQ-11, DC-1, DC-2, DC-3, DC-5, DC-9, DC-11, DC-12

### 진입 조건
- `DESIGN.md`의 `DC-1`, `DC-2`, `DC-3`, `DC-5`, `DC-9`, `DC-11`, `DC-12`가 사용자 확인을 거쳐 확정되어 있을 것 (충족 완료).

### 구현 체크리스트
- [x] `agent/` 워크스페이스 패키지 구성 (`package.json`, `tsconfig.json`, `vite.config.js`, `pnpm-workspace.yaml` 등록 — `element/`·`test/` 패턴 준용, `LITHENT_CORE=concurrent` alias 포함)
  - `pnpm-lock.yaml`에는 `agent` importer 6줄만 추가했다 (`pnpm install --fix-lockfile`은 무관한 의존성까지 재해석하므로 사용하지 않음).
  - 루트 `vite.config.js` vitest `exclude`의 `agent/**`는 Phase 3 항목이지만 Phase 1에서 선반영했다. 없으면 루트 `pnpm test:core`가 `agent/src/tests`를 루트 `@` alias로 수집해 기존 스위트가 깨진다 (RQ-11).
- [x] `createAgentBridge()` 및 `defaultAgentBridge` 구현 (`listTools`, `getState`, `callTool`, `subscribe`, `notifyStateChange`, `dispose`) — `agent/src/bridge.ts`
- [x] 파라미터 스펙(`DC-2`) → JSON Schema 변환기 및 런타임 인자 검증기 구현 (`INVALID_PARAMS`, `NOT_FOUND`, `EXECUTION_ERROR`, 미선언 여분 키 strip `DC-11`) — `agent/src/schema.ts`, 상세 형식은 `DESIGN.md` §2.5
- [x] `agentAction()` 구현 (`mountCallback` 자동 등록/해제, 사람 직접 호출 vs `callTool` 경로, 동기/비동기 실행, `mount`/`lmount` 공용) — `agent/src/hooks.tsx`
  - `DC-5`의 Phase 1 범위는 경로 분리(사람 직접 호출은 검증 없이 즉시 실행, `callTool`만 검증)까지다. `confirm` 승인 훅과 `setConfirmHandler`는 Phase 2 항목이다.
- [x] `agentState()` 구현 (JSON-safe 스냅샷 수집, 예외·순환참조 시 `{ __agentStateError }` 격리 `DC-12`, `updateCallback` 기반 일반 UI 입력 상태 변경 자동 감지 및 마이크로태스크 알림) — 통지 병합 규칙은 `DESIGN.md` §2.3 항목 6
- [x] 스코프 격리 및 다중 인스턴스 이름 충돌 정책(`DC-3`) 구현 (`scopeId`, `<AgentScope bridge={...}>`/`useAgentBridge()` WDom 부모 체인 탐색)
  - 구현 중 `scopeId` 구분자 `.`이 OpenAI 등 일부 벤더 도구 이름 규칙과 맞지 않는 문제를 발견해 `DESIGN.md` `DC-15`(TBD)로 기록했다. 현재 구현은 `DC-3`대로 `.`이다. → 2026-11-27 `DC-15` 결정으로 `__`로 변경 ("Phase 2 후속" 참고).
- [x] ESM/CJS/UMD(`lithentAgent`) 및 `.d.ts`/`.d.cts` 타입 추론 빌드 검증
  - Node에서 `dist/lithentAgent.mjs`(import), `dist/lithentAgent.cjs`(require), `dist/lithentAgent.umd.js`(`vm` 컨텍스트 + `lithent.umd.js` 전역) 로드 후 `callTool` 동작 확인.
  - 외부 소비자 TSX를 `index.d.ts`·`index.d.cts` 양쪽에 대해 `skipLibCheck: false`로 타입 검사 통과 (`ParamsOf` 추론, 필수 인자 누락 `@ts-expect-error` 포함).

### 기준 테스트
- [x] `agent/src/tests/action.test.tsx`: `mount`·`lmount` 양쪽에서 사람 클릭 호출, `callTool` 호출, 비동기 반환, 파라미터 타입/필수/enum 검증 실패, 예외 격리 (24 tests, `ParamsOf` 타입 테스트 포함)
- [x] `agent/src/tests/state.test.tsx`: 스냅샷 조회, 일반 UI 입력 및 액션으로 상태 변경 시 `subscribe` 자동 통지, 언마운트 시 상태 제거, getter 예외 격리 (12 tests)
- [x] `agent/src/tests/lifecycle.test.tsx`: 마운트·언마운트 자동 등록/해제, 다중 인스턴스 충돌(`DC-3`, 덮어쓴 최신 엔트리 보호), `<AgentScope>` 독립 브릿지 스코프 격리 (17 tests)
- [x] `agent/src/tests/ssr.test.ts`: Node/SSR 환경에서 import 및 브릿지 생성 무예외 (3 tests, `@vitest-environment node`)
- [x] base 및 `LITHENT_CORE=concurrent` 양쪽 코어에서 전체 테스트 통과 (각 56/56)

### 종료 조건
- `agent/` 단위 테스트가 base·concurrent 양쪽에서 100% 통과.
- `src/`와 `lithentConcurrent/src/` diff 0줄 (`RQ-9`).
- `agent/dist/lithentAgent.umd.js` brotli 크기가 `DC-9` 예산 이내.

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm --filter lithent-agent test` → 4 files, 56/56 통과
- [x] `LITHENT_CORE=concurrent pnpm --filter lithent-agent test` → 4 files, 56/56 통과 (임시 프로브로 concurrent 번들 해석 확인 후 프로브 삭제)
- [x] `pnpm --filter lithent-agent build` → 성공 (vite-plugin-checker 타입 검사 + ESLint 포함), `lithentAgent.umd.js` raw 4,393 B / **brotli 1,884 B ≤ 2,000 B** (`DC-9`)
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` 및 `git status --porcelain -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)
- [x] `pnpm build:sequence && pnpm test` → 성공 (루트 core 81 files/516 tests, concurrent 77 files/394 tests 포함 전 스위트 통과). 빌드 전 첫 실행은 `lithent/devHelper`, `@lithent/lithent-template-vite` dist 미빌드로 2개 파일이 로드 실패했으며 Phase 1 변경과 무관함을 빌드 후 재실행으로 확인.
- [x] 코어 `dist/lithent.umd.js` brotli 4,774 B (무변화)
- 참고: Phase 2에서 `confirm`·`connectWebMCP`를 같은 번들에 추가하면 남은 여유 116 B로는 2,000 B 예산을 넘을 가능성이 높다 (Handoff `risks` 참고).

Files:
- `agent/package.json` (added)
- `agent/tsconfig.json` (added)
- `agent/vite.config.js` (added)
- `agent/src/index.ts` (added)
- `agent/src/types.ts` (added)
- `agent/src/schema.ts` (added)
- `agent/src/bridge.ts` (added)
- `agent/src/hooks.tsx` (added)
- `agent/src/tests/action.test.tsx` (added)
- `agent/src/tests/state.test.tsx` (added)
- `agent/src/tests/lifecycle.test.tsx` (added)
- `agent/src/tests/ssr.test.ts` (added)
- `pnpm-workspace.yaml` (modified)
- `pnpm-lock.yaml` (modified)
- `vite.config.js` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 2 — `lithent/agent` 어댑터 (WebMCP·승인 훅·Custom Element 연동): done

Refs: RQ-4, RQ-5, RQ-9, RQ-11, DC-4, DC-5, M-1, M-2, M-5

### 진입 조건
- Phase 1 종료 조건 충족.
- `DESIGN.md`의 `DC-4`(WebMCP 정책) 및 `DC-5`(`confirm` 정책) 확정.

### 구현 체크리스트
- [x] `setConfirmHandler` 및 액션별 `confirm` 승인 훅 구현 (거부 시 `REJECTED`, 비동기 승인 지원) — `agent/src/bridge.ts`, `agent/src/hooks.tsx`
  - 핸들러가 없거나 예외를 던지거나 정확히 `true`를 반환하지 않으면 `REJECTED`(보안 기본값). 승인 대기 중 언마운트되면 `NOT_FOUND`. 세부 동작은 `DESIGN.md` §2.3 항목 4.
- [x] `connectWebMCP(bridge?, options?)` 구현 (`navigator.modelContext` 감지, 도구 등록/해제 동기화, 미지원 환경 no-op, 테스트용 커스텀 `target` 주입 지원) — `agent/src/webmcp.ts`
  - **설계 편차**: 현재 Chrome WebMCP에 맞춰 `document.modelContext`를 먼저 감지하고, `AbortSignal`로 해제하며, `unregisterTool`은 있을 때만 호출한다 (`DESIGN.md` §2.6 편차 기록, `DC-4` 구현 메모).
- [x] `lithent/element` Custom Element 내부 컴포넌트에서 `agentAction`/`agentState` 사용 및 호스트 브릿지 연결 확인
  - 코드 변경 없이 동작 확인. 요소 내부는 별도 render 루트이므로 바깥 `<AgentScope>`는 적용되지 않으며, 페이지 브릿지는 `Object` prop으로 넘긴다 (`DESIGN.md` §2.4 `lithent/element` 경계).

### 기준 테스트
- [x] `agent/src/tests/confirm.test.tsx`: 승인/거부/비동기 승인, 사람 직접 호출 vs `callTool` 경로 동작(`DC-5`) (15 tests — 핸들러 없음·예외·`true` 외 값·`null` 해제·검증 선행·승인 대기 중 언마운트·스코프별 핸들러·액션별 핸들러·`useAgentBridge` 포함)
- [x] `agent/src/tests/webmcp.test.tsx`: 모의 `navigator.modelContext` 등록/언마운트 해제/재등록/미지원 환경 no-op (9 tests — `AbortSignal` 방식과 `unregisterTool` 방식 모의 대상, `document`→`navigator` 감지 순서, `execute` 결과, `DC-3` 재등록, 등록 실패 격리 포함)
- [x] `agent/src/tests/element-interop.test.tsx`: `defineElement`로 감싼 위젯 마운트/이동/제거 시 브릿지 도구 동기화 (6 tests — 이동 시 등록 유지·이벤트 없음, 제거 후 해제·재추가 재등록, `Object` prop 페이지 브릿지 + 속성 기반 `scopeId`, 속성 변경 상태 통지, 바깥 스코프 비전파)

### 종료 조건
- Phase 1~2 테스트가 base·concurrent 양쪽에서 모두 통과.
- `lithent/element` 기존 테스트 무회귀.

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm --filter lithent-agent test` → 7 files, 86/86 통과 (Phase 1 56 + Phase 2 30)
- [x] `LITHENT_CORE=concurrent pnpm --filter lithent-agent test` → 7 files, 86/86 통과
- [x] `pnpm --filter lithent-element test` → 12 files, 86 passed + 3 skipped(기존 skip) / `LITHENT_CORE=concurrent` → 12 files, 89/89 통과 (무회귀, element 파일 변경 없음)
- [x] `pnpm --filter lithent-agent build` → 성공 (타입 검사 + ESLint). Node에서 ESM/CJS/UMD 산출물의 `connectWebMCP`·`setConfirmHandler` 동작 확인, 외부 소비자 TSX가 `index.d.ts`·`index.d.cts`에 대해 `confirm`·`ActionConfirmHandler`·`WebMCPModelContext` 타입 검사 통과
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)
- [x] **크기**: `lithentAgent.umd.js` brotli **2,340 B** — 당시 예산 2,000 B를 340 B 초과해 `DESIGN.md` `DC-16`(TBD)으로 기록했고(`connectWebMCP` 제외 시 2,049 B), 2026-11-27 `DC-16` 결정으로 예산이 2,500 B가 되어 통과 ("Phase 2 후속" 참고).
- 참고: Phase 2는 루트 설정 파일을 바꾸지 않았으므로 Phase 1의 전체 `pnpm build:sequence && pnpm test` 결과가 그대로 유효하다.

Files:
- `agent/src/types.ts` (modified)
- `agent/src/bridge.ts` (modified)
- `agent/src/hooks.tsx` (modified)
- `agent/src/index.ts` (modified)
- `agent/src/webmcp.ts` (added)
- `agent/src/tests/confirm.test.tsx` (added)
- `agent/src/tests/webmcp.test.tsx` (added)
- `agent/src/tests/element-interop.test.tsx` (added)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)
- `docs/agent-ui/MANUAL_TEST_CHECKLIST.md` (modified)

---

## Phase 2 후속 — `DC-15`·`DC-16` 결정 반영: done

Refs: DC-3, DC-9, DC-15, DC-16, RQ-4, RQ-10

### 진입 조건
- Phase 2 종료 (커밋 `1d08cc8`), 2026-11-27 사용자 결정: `DC-15` → `__`, `DC-16` → 옵션 A + 예산 2,500 B.

### 체크리스트
- [x] `scopeId` 구분자를 `.` → `__`로 변경 (`agent/src/hooks.tsx` `fullName`, `agent/src/types.ts` 주석) — 예: `cart__add_item`
- [x] 테스트 기대값 갱신: `lifecycle.test.tsx`(`cart__add_item`·`profile__add_item` + `^[a-zA-Z0-9_-]+$` 검사 추가), `element-interop.test.tsx`(`left__read_label`, `solo__label`)
- [x] `DESIGN.md`: `DC-15`·`DC-16` 확정 기록, `DC-3`·§2.4(이름 접두사 규칙, `lithent/element` 경계 예시)를 `__`로 갱신, §2.5 이름 규칙 주의 추가, `DC-9`·§5 `lithent/agent` 예산 2,500 B
- [x] `REQUIREMENTS.md`: 상태 줄, `RQ-10` 예산 2,500 B
- [x] `connectWebMCP` tree-shaking 확인 (분리하지 않는 결정의 전제)

### 검증 기록 (2026-11-27)
- [x] `pnpm --filter lithent-agent test` / `LITHENT_CORE=concurrent` → 각 7 files, 86/86 통과
- [x] `pnpm --filter lithent-agent build` → 성공 (타입 검사 + ESLint), `lithentAgent.umd.js` brotli **2,340 B ≤ 2,500 B** (여유 160 B)
- [x] tree-shaking: esbuild로 `agent/dist/lithentAgent.mjs`를 번들(`lithent` external, minify) — `connectWebMCP` 미사용 소비자 1,879 B br, `modelContext`·`AbortController` 미포함 / 사용 시 2,174 B br

Files:
- `agent/src/hooks.tsx` (modified)
- `agent/src/types.ts` (modified)
- `agent/src/tests/lifecycle.test.tsx` (modified)
- `agent/src/tests/element-interop.test.tsx` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 3 — `lithent/agent` 배포 연결·스킬·문서: planned

Refs: RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-9, DC-10, M-1

### 진입 조건
- Phase 2 종료 조건 충족.
- `DESIGN.md` `DC-16`(크기 예산 초과 대응) 결정 — 충족: 옵션 A, `lithent/agent` 예산 2,500 B, `connectWebMCP` 분리 없음 (2026-11-27).
- 권장: `DESIGN.md` `DC-15`(`scopeId` 구분자) 결정 — 충족: `__` (2026-11-27).

### 구현 체크리스트
- [ ] 루트 `package.json`: `exports["./agent"]`, `files`, `build:agent`, `build:sequence`, `build:parallel` 제외 목록, `test:satellites`·`test` 연결
- [x] 루트 `vite.config.js` vitest `exclude`에 `agent/**` 추가 (Phase 1에서 선반영 — Phase 1 체크리스트 참고)
- [ ] `scripts/size-report.js`, `scripts/verify-release.mjs`, `scripts/ci-build-artifacts.mjs`, `.github/release-policy.json`에 `agent` 등록 (`size-report.js` 예산 2,500 B — `DC-16`)
- [ ] `agent/README.md`, `skills/lithent/reference/agent.md`, `skills/lithent/SKILL.md`, `lithent-agent-addon.md` 업데이트
- [ ] `lithentDocs` 가이드 페이지(영어·한국어) 추가
- [ ] (`DC-10` 옵션 A 확정) `lithent/agent` 단독 1차 minor 릴리스 전 `pnpm verify:release` 및 수동 체크 `M-1`, `M-2`, `M-5` 점검

### 기준 테스트
- [ ] `pnpm build && pnpm size && pnpm verify:release` 통과
- [ ] `pnpm test:dual` 통과

### 종료 조건
- `lithent/agent`가 공식 서브패스로 빌드·타입·크기·릴리스 검증을 모두 통과.

---

## Phase 4 — `lithent/live` 샌드박스 런타임 및 양방향 RPC 브릿지: planned

Refs: RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, DC-6, DC-7, DC-8, DC-9, DC-13, DC-14, M-3, M-4

### 진입 조건
- Phase 2 종료 조건 충족 (Phase 3은 병행 또는 선행 완료).
- `DESIGN.md`의 `DC-6`, `DC-7`, `DC-8`, `DC-9`, `DC-13`, `DC-14` 확정 (충족 완료).

### 구현 체크리스트
- [ ] `live/` 워크스페이스 패키지 구성 (`package.json`, `tsconfig.json`, `vite.config.js`, `pnpm-workspace.yaml` 등록)
- [ ] Sandbox iframe 부트스트랩 HTML 생성기 구현 (`sandbox="allow-scripts"` 강제, `allow-same-origin` 금지, 기본 CSP 메타 태그 적용 `DC-7`, `runtimeCode`/`runtimeUrl` 필수 검사 `DC-13`)
- [ ] 별도 샌드박스 번들 `live/dist/sandboxRuntime.umd.js` 및 문자열 export `lithent/live/runtime`(`sandboxRuntimeCode`) 빌드 파이프라인 구성 (`lithent` + `helper` + `ftags` + `tag` + `agent` 심볼 주입, `DC-6`, `DC-9`)
- [ ] 호스트 ↔ iframe `postMessage` 양방향 RPC 브릿지 구현 (`channelId`·`event.source` 검증, `ready`/`event`/`call`/`result`/`props`/`error` 메시지, `timeoutMs` 만료 시 `TIMEOUT`, 호스트 측 `requiresConfirm` 승인 선실행 `DC-14`)
- [ ] 호스트 측 `LiveHandle` 구현 (`bridge`가 `lithent/agent`의 `AgentBridge` 계약과 100% 동일, 내부 클로저 상태를 보존하는 `updateProps`, `reload`, `destroy`)

### 기준 테스트
- [ ] `live/src/tests/rpc.test.ts`: 메시지 프로토콜, `channelId`/`source` 위조 차단, 타임아웃, 동시 다중 호출 매칭, 호스트 측 `confirm` 선실행(`DC-14`), `destroy()` 후 정리
- [ ] `live/src/tests/sandbox.test.ts`: `sandbox` 속성 검증(`allow-same-origin` 부재), CSP 메타 태그 포함 여부(`DC-7`), `runtimeCode`·`runtimeUrl` 둘 다 생략 시 설정 오류(`DC-13`), 오류 전파
- [ ] `live/src/tests/bridge-compat.test.ts`: `LiveHandle.bridge`가 `AgentBridge` 계약(`listTools`, `getState`, `callTool`, `subscribe`)을 준수함

### 종료 조건
- `live/` 단위 테스트가 base·concurrent 양쪽에서 100% 통과.
- `src/`와 `lithentConcurrent/src/` diff 0줄 (`RQ-9`).
- `live/dist/lithentLive.umd.js` ≤ 3,000 B brotli, `live/dist/sandboxRuntime.umd.js` ≤ 11,000 B brotli (`DC-9`).

---

## Phase 5 — `lithent/live` Direct 모드, `<lithent-live>`, 오류 힌트, 리사이즈: planned

Refs: RQ-6, RQ-7, RQ-8, DC-6, DC-7, DC-8, M-3, M-5, M-6

### 진입 조건
- Phase 4 종료 조건 충족.

### 구현 체크리스트
- [ ] `mode: 'direct'` 구현 (명시적 opt-in, `lithent/element` Shadow DOM 격리, 비신뢰 코드 금지 주석/문서)
- [ ] `<lithent-live>` Custom Element 래퍼 구현 (`code`, `mode`, `styles`, `props` 속성/프로퍼티, `live-ready`/`live-error` 이벤트, `el.bridge` 프로퍼티 노출)
- [ ] `LiveError.hint` 자가 수정(self-repair) 힌트 생성기 구현 (mounter가 JSX 직접 반환, `lstate`를 `mount`에서 사용, 문법 오류 등)
- [ ] `autoResize` (`ResizeObserver` → `resize` 메시지) 및 `theme` CSS 변수 전달 구현 (`DC-8`)

### 기준 테스트
- [ ] `live/src/tests/direct.test.tsx`: Direct 모드 마운트·`updateProps`·`reload`·`destroy` 및 Shadow DOM 격리
- [ ] `live/src/tests/error-hints.test.ts`: 대표 LLM 코딩 실수 5종에 대한 구조화된 `LiveError(phase, message, hint)` 검증
- [ ] `live/src/tests/element-wrapper.test.tsx`: `<lithent-live>` 속성 변경, `el.bridge` 호출, 언마운트 정리

### 종료 조건
- Phase 4~5 테스트가 base·concurrent 양쪽에서 100% 통과.

---

## Phase 6 — `lithent/live` 배포 연결·스킬·문서·인터랙티브 데모: planned

Refs: RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-6, DC-9, DC-10, M-3, M-6, M-7

### 진입 조건
- Phase 5 종료 조건 충족.

### 구현 체크리스트
- [ ] 루트 `package.json`: `exports["./live"]`, `exports["./live/runtime"]`, `files`, `build:live`, `build:sequence`, `build:parallel` 제외 목록, `test:satellites`·`test` 연결
- [ ] 루트 `vite.config.js` vitest `exclude`에 `live/**` 추가
- [ ] `scripts/size-report.js`, `scripts/verify-release.mjs`, `scripts/ci-build-artifacts.mjs`, `.github/release-policy.json`에 `live` 및 `live/runtime` 등록
- [ ] `live/README.md`, `skills/lithent/reference/live.md`, `skills/lithent/SKILL.md`, `lithent-agent-addon.md` 업데이트 (LLM이 1회 시도에 유효한 `lithent/live` 코드를 생성하는 규약 포함)
- [ ] `lithentDocs` 가이드 페이지(영어·한국어) 및 **양방향 Generative UI 인터랙티브 플레이그라운드** (코드 실행 → 사용자 마우스 조작 → AI 도구 호출로 상태 변경 시연) 구축
- [ ] `README.md`, `CHANGELOG.md`, `docs/ideas/IDEAS.md` 상태 갱신

### 기준 테스트
- [ ] `pnpm build && pnpm size && pnpm verify:release` 통과
- [ ] 문서 사이트 및 플레이그라운드 빌드(`pnpm build:docs`) 통과

### 종료 조건
- `lithent/agent`와 `lithent/live` 모두 배포 산출물·문서·스킬·크기 게이트 통과.

---

## Phase 7 — Test Hardening (보안·경계값·오류·누수 강화): planned

Refs: RQ-1, RQ-2, RQ-3, RQ-5, RQ-7, RQ-8, RQ-9, DC-3, DC-5, DC-7, DC-11, DC-12, DC-13, DC-14, M-4, M-5

### 진입 조건
- Phase 1~6 구현 및 기본 테스트 완료.

### 강화 체크리스트
- [ ] **보안 음성 대조 테스트**: 샌드박스 내부에서 `window.parent.document`, `localStorage`, `document.cookie`, 임의 외부 `fetch`(기본 CSP 활성 시), 위조된 `postMessage`(다른 `channelId`·다른 `source`) 접근이 모두 차단됨을 검증
- [ ] **재진입·경합·언마운트 경계 테스트**: `callTool` 실행 도중 컴포넌트 언마운트 / `reload()` / `destroy()` 발생 시 메모리 누수·미처리 Promise rejection 0건 검증
- [ ] **상태 직렬화 경계 테스트**: `agentState`가 순환 참조, `BigInt`, 함수, 예외를 반환할 때 `{ __agentStateError }` 격리(`DC-12`) 및 `BigInt` 문자열화 검증
- [ ] **여분 키·승인 경계 테스트**: `agentAction` 미선언 여분 키 strip(`DC-11`), Sandbox `confirm` 거부 시 iframe으로 `call` 메시지 미전송(`DC-14`), `runtimeCode`·`runtimeUrl` 모두 생략 시 외부 요청 0건(`DC-13`) 검증
- [ ] **오류 복구 루프 테스트**: 잘못된 코드 로드(`LiveError` + `hint` 반환) → `reload(수정된 코드)` 호출 시 이전 iframe/리스너가 완전히 정리되고 새 위젯이 정상 동작함 검증
- [ ] **대량 등록·해제 스트레스 테스트**: 100회 연속 마운트/언마운트 및 `reload` 반복 후 리스너 수·등록 엔트리 수 0으로 복귀 검증

### 기준 테스트
- [ ] `agent/src/tests/hardening.test.tsx` 및 `live/src/tests/hardening.test.ts` 신규 작성 및 base·concurrent 양쪽 통과

### 종료 조건
- 모든 음성 대조·경계값·누수 회귀 테스트 100% 통과.

---

## Phase 8 — Integration Test (이중 코어·실제 브라우저 E2E·릴리스 검증): planned

Refs: RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-4, DC-7, DC-9, DC-10, M-1, M-2, M-3, M-4, M-5, M-6, M-7

### 진입 조건
- Phase 7 종료 조건 충족.

### 통합 검증 체크리스트
- [ ] **Playwright E2E (`e2e/agent-ui.spec.ts`)**: 실제 Chromium에서 다음 시나리오 자동 검증
  1. 로컬 `lithent` 컴포넌트의 `agentAction`/`agentState` 양방향 조작 (`M-1`)
  2. 모의 WebMCP 모델 컨텍스트(`document.modelContext`, 이전 초안의 `navigator.modelContext`) 동기화 (`M-2`)
  3. `mountLive` Sandbox 모드에서 LLM 스타일 `ftags`/`tag` 코드 실행 → 사용자 입력(슬라이더/버튼) → 호스트 `bridge.getState()` 조회 → `bridge.callTool()`로 기존 상태 유지하며 부분 갱신 (`M-3`)
  4. 악성 코드의 호스트 DOM/쿠키/외부 네트워크 차단 확인 (`M-4`)
  5. `confirm` 승인/거부 흐름 (`M-5`)
  6. React 호스트 앱 안에서 `<lithent-live>` + `el.bridge` 양방향 조작 (`M-6`)
  7. UMD CDN 무빌드 페이지에서 `lithent` + `lithentAgent` + `lithentLive` 동작 (`M-7`)
- [ ] **전체 저장소 게이트 실행**:
  - `pnpm build`
  - `pnpm test:dual`
  - `pnpm test:toolchain`
  - `pnpm size`
  - `pnpm verify:concurrent`
  - `pnpm verify:release`
  - `pnpm test:e2e`
- [ ] `MANUAL_TEST_CHECKLIST.md`의 브라우저 수동 확인 항목(`M-1`~`M-7`) 수행 및 결과 기록

### 기준 테스트
- [ ] `e2e/agent-ui.spec.ts` Chromium/Firefox/WebKit 통과 (로컬 환경에서 지원되는 브라우저 우선, CI에서 전 브라우저 확인)
- [ ] 코어 무수정 검증: `git diff --stat main -- src lithentConcurrent/src` 출력 0줄

### 종료 조건
- 모든 자동·수동 게이트 통과 및 `MANUAL_TEST_CHECKLIST.md` 출하 판정 완료.

---

## Handoff

- **done**:
  - Phase 0 문서 4종 작성 및 `DC-1`~`DC-14` 확정 (커밋 `d290fc3`)
  - **Phase 1 (`lithent/agent` 코어 패키지) 구현 완료** — 브릿지, `DC-2` 스키마·검증, `agentAction`, `agentState`, `AgentScope`/`useAgentBridge`, `DC-3` 충돌 정책 (Phase 1 "검증 기록")
  - **Phase 2 (어댑터) 구현 완료** — `setConfirmHandler`·액션별 `confirm`(`DC-5`, 보안 기본값 `REJECTED`), `connectWebMCP`(`DC-4`, 현재 WebMCP에 맞춘 편차 포함), `lithent/element` 연동 확인
  - agent 테스트 7 files base·concurrent 각 86/86, element 무회귀, 빌드·타입 통과, 코어 diff 0줄 (Phase 2 "검증 기록")
  - `DESIGN.md`: §2.1 구현 상태·`WebMCPModelContext` 계약 갱신, §2.3 `confirm` 세부, §2.4 `lithent/element` 경계, §2.6 편차 기록, `DC-4` 구현 메모, `DC-9` 측정 기록. `REQUIREMENTS.md`·`MANUAL_TEST_CHECKLIST.md`(`M-2`)에 `document.modelContext` 반영
  - Phase 1·2를 `feat/agent-ui`에 Phase별로 커밋·푸시 (Phase 1 `c7917de`, Phase 2 `1d08cc8`)
  - **Phase 2 후속 (`DC-15`·`DC-16` 결정 반영) 완료** — `scopeId` 구분자 `__`(예: `cart__add_item`), `lithent/agent` 예산 2,500 B(현재 2,340 B), `connectWebMCP` tree-shaking 확인. 테스트 base·concurrent 각 86/86 ("Phase 2 후속" 검증 기록)
- **next**:
  1. 사용자 결정: Phase 2(및 후속) 리뷰(`doc-driven-reviewer-v1`) 여부, 또는 Phase 3 착수
  2. Phase 3: 루트 `exports["./agent"]`·빌드/테스트 스크립트, `scripts/size-report.js`(예산 2,500 B)·릴리스 검증 스크립트 등재, README·스킬·문서 사이트
- **blockers**: 없음 (Phase 3 진입 조건 `DC-16` 충족)
- **risks / follow-ups**:
  - 크기 여유 160 B (2,340 / 2,500 B). Phase 7 하드닝이 이 안에서 끝나야 한다.
  - 이름 규칙: 라이브러리는 `name`·`scopeId`에 `[a-zA-Z0-9_-]` 외 문자가 들어가도 검사하지 않는다 (`DESIGN.md` §2.5). 필요하면 Phase 7에서 개발 경고 추가를 검토.
  - `DC-3` 결과: 같은 이름을 덮어쓴 최신 인스턴스가 먼저 언마운트되면, 아직 마운트된 이전 인스턴스는 다시 등록되지 않는다 (설계대로의 동작). Phase 7 경계 테스트에서 의도 확인 권장.
  - WebMCP는 표준화 진행 중이다. `annotations`(`consequentialHint` 등)와 `requiresConfirm` 매핑, `execute`의 `{ signal }` 취소는 미반영 (`DESIGN.md` §2.6). 실제 Chrome 검증은 `M-2`(수동)와 Phase 8 E2E에서 한다.
  - `useAgentBridge()` 위임 브릿지의 메서드(`setConfirmHandler` 포함)는 마운트 전에 호출하면 `defaultAgentBridge`로 간다.
  - 로컬 Node 22 환경: `pnpm` 명령에 `pnpm_config_runtime_on_fail=ignore` 필요. agent의 element 연동 테스트는 `element/dist`(예: `pnpm build:element` 또는 `pnpm build:sequence`)가 필요하다.
- **latest commit**: `1d08cc8` (Phase 2). "Phase 2 후속" 변경은 아직 커밋하지 않음 — not committed yet

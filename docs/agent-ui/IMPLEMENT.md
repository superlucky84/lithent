# IMPLEMENT — `lithent/agent` & `lithent/live`

- 브랜치: `feat/agent-ui` / 기준 커밋 `ead8b2e`
- 작성일: 2026-11-27
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 (`REQUIREMENTS`, `DESIGN`, `IMPLEMENT`, `MANUAL_TEST_CHECKLIST`) | done |
| 1 | `lithent/agent` 코어 패키지 (`agentAction`, `agentState`, `createAgentBridge`) | done |
| 2 | `lithent/agent` 어댑터 (WebMCP, `confirm` 승인 훅, `lithent/element` 연동) | done |
| 3 | `lithent/agent` 배포 연결·스킬·문서 (선택적 1차 릴리스 게이트) | done (수동 체크 `M-1`·`M-2`·`M-5` 대기) |
| 4 | `lithent/live` 샌드박스 런타임 및 `postMessage` 양방향 RPC 브릿지 | done |
| 5 | `lithent/live` Direct 모드, `<lithent-live>`, 오류 힌트, 자동 리사이즈 | done |
| 6 | `lithent/live` 배포 연결·스킬·문서·인터랙티브 데모 | done (수동 체크 `M-3`·`M-6`·`M-7`은 Phase 8) |
| 7 | Test Hardening (보안·경계값·오류 격리·동시성·누수 강화) | done |
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

## Phase 3 — `lithent/agent` 배포 연결·스킬·문서: done

Refs: RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-9, DC-10, DC-15, DC-16, M-1

### 진입 조건
- Phase 2 종료 조건 충족.
- `DESIGN.md` `DC-16`(크기 예산 초과 대응) 결정 — 충족: 옵션 A, `lithent/agent` 예산 2,500 B, `connectWebMCP` 분리 없음 (2026-11-27).
- 권장: `DESIGN.md` `DC-15`(`scopeId` 구분자) 결정 — 충족: `__` (2026-11-27).

### 구현 체크리스트
- [x] 루트 `package.json`: `exports["./agent"]`, `files`, `build:agent`, `build:sequence`, `build:parallel` 제외 목록, `test:satellites`·`test` 연결
  - `files`는 `lithent/element`와 같이 `agent/dist`, `agent/src`, `agent/package.json`, `agent/README.md`. `keywords`에 `ai`, `mcp`, `webmcp` 추가.
- [x] 루트 `vite.config.js` vitest `exclude`에 `agent/**` 추가 (Phase 1에서 선반영 — Phase 1 체크리스트 참고)
- [x] `scripts/size-report.js`, `scripts/verify-release.mjs`, `scripts/ci-build-artifacts.mjs`, `.github/release-policy.json`에 `agent` 등록 (`size-report.js` 예산 2,500 B — `DC-16`)
  - `verify-release.mjs`: 공개 import 경로 12 → 13개. 설치된 tarball 소비자에서 ESM export 목록·`callTool`·`connectWebMCP` no-op, CJS 내보내기 동등성·SSR(`renderToString`)에서 미등록, Bundler 타입(`agentAction` 인자 추론·`@ts-expect-error`), Node16/NodeNext ESM·CJS 선언 검사에 `lithent/agent` 추가.
  - `.github/release-policy.json`: `lithent` 패키지 `sourcePaths`에 `agent/` 추가 (변경 시 `lithent` 릴리스 대상).
- [x] `agent/README.md`, `skills/lithent/reference/agent.md`, `skills/lithent/SKILL.md`, `lithent-agent-addon.md` 업데이트
- [x] `lithentDocs` 가이드 페이지(영어·한국어) 추가 — `/guide/agent-native`, `/ko/guide/agent-native` (`lithentDocs/src/pages/AgentNative.tsx`, 사이드바 "AI Agents / AI 에이전트" 그룹). 기존 `/guide/agent-guide`(AI 코딩 도우미 설정 안내)와는 별도 페이지다.
  - `pnpm build:docs` 통과, Chromium에서 두 언어 경로 렌더링(제목·섹션 10개·오류 코드 표 4행, 페이지 오류 0건) 확인.
- [ ] (`DC-10` 옵션 A 확정) `lithent/agent` 단독 1차 minor 릴리스 전 `pnpm verify:release` 및 수동 체크 `M-1`, `M-2`, `M-5` 점검
  - `pnpm verify:release` 통과 (아래 검증 기록). **수동 체크 `M-1`, `M-2`, `M-5`는 사용자 수행 대기** — `MANUAL_TEST_CHECKLIST.md`에 브라우저별 결과를 기록한 뒤 릴리스(버전·CHANGELOG·publish)를 진행한다. 릴리스 자체는 이 Phase 범위 밖이다.

### 기준 테스트
- [x] `pnpm build && pnpm size && pnpm verify:release` 통과
- [x] `pnpm test:dual` 통과

### 종료 조건
- `lithent/agent`가 공식 서브패스로 빌드·타입·크기·릴리스 검증을 모두 통과.

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm build` (`build:sequence`에 `build:agent` 포함 + `build:parallel`) → 성공
- [x] `pnpm size` → 성공. `lithent/agent` **2,340 / 2,500 B** (여유 160 B), 코어 4,774 / 4,800 B, concurrent 6,690 / 9,000 B, element 968 / 1,000 B
- [x] `pnpm test:dual` → 성공. `test:satellites`·`test:satellites:concurrent`에서 `lithent-agent` 각 7 files, 86/86
- [x] `pnpm verify:release` → `ALL PASS (8 prepared packages; nothing published)`. "all 13 public import paths", "all 13 require paths", 설치된 base Node16/NodeNext ESM·CJS 선언(`skipLibCheck: false`)에 `lithent/agent` 포함
- [x] `pnpm build:docs` → 성공, `/guide/agent-native`·`/ko/guide/agent-native` Chromium 렌더링 확인
- [x] CI fixture 테스트: `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs` → 50/50 통과. (`pnpm test:ci`의 `--test-isolation=none`은 Node 24 옵션이라 이 컨테이너의 Node 22에서는 옵션 오류로 시작하지 못함 — 환경 차이이며 CI는 Node 24)
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)

Files:
- `package.json` (modified)
- `scripts/size-report.js` (modified)
- `scripts/verify-release.mjs` (modified)
- `scripts/ci-build-artifacts.mjs` (modified)
- `.github/release-policy.json` (modified)
- `agent/README.md` (added)
- `skills/lithent/reference/agent.md` (added)
- `skills/lithent/SKILL.md` (modified)
- `lithent-agent-addon.md` (modified)
- `lithentDocs/src/pages/AgentNative.tsx` (added)
- `lithentDocs/src/pages/AgentNative_ko.tsx` (added)
- `lithentDocs/src/components/Layout.tsx` (modified)
- `lithentDocs/src/components/Sidebar.tsx` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 3 후속 — Phase 1~3 리뷰 반영: done

Refs: RQ-1, RQ-2, RQ-4, RQ-5, DC-2, DC-4, DC-9

### 진입 조건
- `doc-driven-reviewer-v1`의 Phase 1~3 리뷰(`d290fc3..c470fb5`, Verdict `APPROVE`, Critical 0 / Warning 4 / Suggestion 4)를 받아, 사용자가 타당하고 도움이 되는 항목만 반영하도록 요청 (2026-11-27).

### 반영한 항목
- [x] **Warning 1 — `useAgentBridge()`를 자식·Custom Element에 넘기면 `defaultAgentBridge`에 등록되던 문제**: 마운트 콜백은 자식부터 실행되므로(`src/render.ts` `addMountedQueue`가 자식 처리 뒤 호출) 부모의 `mountCallback`보다 자식 등록이 먼저 일어났다. 실패 테스트로 재현 후, 스코프를 컴포넌트가 그려진 뒤 첫 호출에서 찾아 고정하도록 수정 (`agent/src/hooks.tsx`). 자기 mounter가 실행 중인 컴포넌트의 키만 쓰도록 해, 컴포넌트 밖 호출이 남은 키로 다른 컴포넌트의 스코프를 잡지 않게 했다.
- [x] **Warning 2 — `connectWebMCP` 실패·해제 정리**: 등록이 동기 예외·비동기 거부로 실패하면 등록 목록에서 빼서 해제 때 `unregisterTool`을 부르지 않고 다음 동기화 때 다시 시도한다. `unregisterTool` 예외는 무시해 나머지 도구 해제가 계속된다 (`agent/src/webmcp.ts`).
- [x] **Warning 3 — 사람 직접 호출에서 `run`이 동기 예외를 던지면 상태 알림 누락**: `try/finally`로 `callTool`과 같게 맞췄다.
- [x] **Warning 4 — Phase 3 `Refs:`에 `DC-15`·`DC-16` 누락**: 추가. (Handoff `latest commit`은 그 줄을 기록한 커밋 자신을 가리킬 수 없으므로 지적 대상이 아니다.)
- [x] **Suggestion 1 — `Number` 검증을 `Number.isFinite`로**: `Infinity`처럼 JSON으로 표현할 수 없는 값도 `INVALID_PARAMS`로 거절한다 (`DESIGN.md` §2.5 갱신).
- [x] **Suggestion 2 — 경고 키 충돌**: 외부 브릿지 경고 키를 문자열 `'bridge'` 대신 모듈 심볼 `REG`로 바꿔, `bridge`라는 이름의 선언 경고와 섞이지 않게 했다 (크기 증가 없음).

### 반영하지 않은 항목 (사유)
- **Suggestion 3 — `listTools()`가 내부 디스크립터를 그대로 반환**: 얕은 복사로는 중첩된 `inputSchema`를 보호하지 못하고, 깊은 복사는 크기 여유(126 B)를 쓴다. 소비자가 반환값을 제자리 수정하는 경우는 드물어 현재 동작을 유지한다. 필요하면 Phase 7에서 재검토.
- **Suggestion 4 — `agent/package.json`의 `repository.url` 형식**: `element/package.json`, `test/package.json`과 같은 저장소 관례이며 `private: true`라 배포에 영향이 없다. 위성 패키지 전체를 한꺼번에 고칠 때 함께 다룬다.

### 기준 테스트
- [x] 실패 재현: `lifecycle.test.tsx` "can be handed to a child, which mounts before its parent"가 수정 전 실패, 수정 후 통과
- [x] 회귀 테스트 추가: `Infinity` 거절(`action.test.tsx`), 직접 호출 예외 후 상태 알림(`state.test.tsx`), `bridge` 이름 경고 분리(`lifecycle.test.tsx`), 실패 등록 미해제·`unregisterTool` 예외 격리(`webmcp.test.tsx`)

### 검증 기록 (2026-11-27)
- [x] `pnpm --filter lithent-agent test` / `LITHENT_CORE=concurrent` → 각 7 files, **91/91** 통과 (86 + 신규 5)
- [x] `pnpm --filter lithent-agent build` → 성공 (타입 검사 + ESLint), `node scripts/size-report.js` → `lithent/agent` **2,374 / 2,500 B** (여유 126 B)
- [x] `pnpm build:docs` → 성공 (문서 사이트 안내 문구 갱신)
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)

Files:
- `agent/src/hooks.tsx` (modified)
- `agent/src/schema.ts` (modified)
- `agent/src/webmcp.ts` (modified)
- `agent/src/tests/action.test.tsx` (modified)
- `agent/src/tests/lifecycle.test.tsx` (modified)
- `agent/src/tests/state.test.tsx` (modified)
- `agent/src/tests/webmcp.test.tsx` (modified)
- `skills/lithent/reference/agent.md` (modified)
- `lithentDocs/src/pages/AgentNative.tsx` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 4 — `lithent/live` 샌드박스 런타임 및 양방향 RPC 브릿지: done

Refs: RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, DC-6, DC-7, DC-8, DC-9, DC-13, DC-14, M-3, M-4

### 진입 조건
- Phase 2 종료 조건 충족 (Phase 3은 병행 또는 선행 완료).
- `DESIGN.md`의 `DC-6`, `DC-7`, `DC-8`, `DC-9`, `DC-13`, `DC-14` 확정 (충족 완료).

### 구현 체크리스트
- [x] `live/` 워크스페이스 패키지 구성 (`package.json`, `tsconfig.json`, `vite.config.js`, `pnpm-workspace.yaml` 등록)
  - 호스트 빌드(`vite.config.js`, `lithentLive.{mjs,cjs,umd.js}` + `.d.ts`/`.d.cts`)와 샌드박스 런타임 빌드(`vite.runtime.config.js`, 외부 의존 없는 `sandboxRuntime.umd.js`, 전역 `lithentLiveRuntime`)를 분리했다. `pnpm-lock.yaml`에는 `live` importer 6줄만 추가했다.
  - 루트 `vite.config.js` vitest `exclude`의 `live/**`는 Phase 6 항목이지만 Phase 4에서 선반영했다 (Phase 1의 `agent/**`와 같은 이유: 없으면 루트 `pnpm test:core`가 `live/src/tests`를 수집해 기존 스위트가 깨진다).
- [x] Sandbox iframe 부트스트랩 HTML 생성기 구현 (`sandbox="allow-scripts"` 강제, `allow-same-origin` 금지, 기본 CSP 메타 태그 적용 `DC-7`, `runtimeCode`/`runtimeUrl` 필수 검사 `DC-13`) — `live/src/srcdoc.ts`, `live/src/mountLive.ts`
  - 생성 코드는 `<`를 모두 이스케이프한 JSON으로 전달하고, 런타임 코드·스타일의 `</script`·`<!--`·`</style`도 이스케이프한다. 런타임이 로드되지 않으면 시작 스크립트가 즉시 `compile` 오류를 보낸다.
- [x] 별도 샌드박스 번들 `live/dist/sandboxRuntime.umd.js` 및 문자열 export `lithent/live/runtime`(`sandboxRuntimeCode`) 빌드 파이프라인 구성 (`lithent` + `helper` + `ftags` + `tag` + `agent` 심볼 주입, `DC-6`, `DC-9`) — `live/src/runtime/{symbols,boot,entry}.ts`, `live/scripts/build-runtime-module.mjs`(→ `dist/runtime.{mjs,cjs,d.ts,d.cts}`)
- [x] 호스트 ↔ iframe `postMessage` 양방향 RPC 브릿지 구현 (`channelId`·`event.source` 검증, `ready`/`event`/`call`/`result`/`props`/`error` 메시지, `timeoutMs` 만료 시 `TIMEOUT`, 호스트 측 `requiresConfirm` 승인 선실행 `DC-14`)
  - 샌드박스는 `result`·`ack`를 대기 중인 마이크로태스크가 끝난 뒤 보내 호스트 상태 캐시가 먼저 갱신되게 했다 (Chromium 확인 중 발견해 수정).
- [x] 호스트 측 `LiveHandle` 구현 (`bridge`가 `lithent/agent`의 `AgentBridge` 계약과 100% 동일, 내부 클로저 상태를 보존하는 `updateProps`, `reload`, `destroy`)
  - 시작·`reload` 실패 시 `LiveError`로 reject하고 iframe을 남기지 않는다. 세부 동작은 `DESIGN.md` §3.4 "구현 세부 (Phase 4)".
  - `mode: 'direct'`는 Phase 5까지 `LiveError(phase: 'compile')`로 거절한다.

### 기준 테스트
- [x] `live/src/tests/rpc.test.ts`: 메시지 프로토콜, `channelId`/`source` 위조 차단, 타임아웃, 동시 다중 호출 매칭, 호스트 측 `confirm` 선실행(`DC-14`), `destroy()` 후 정리 (20 tests — `updateProps` ack·타임아웃, `reload` 채널 교체, 복제 불가 인자·잘못된 결과 포함)
- [x] `live/src/tests/sandbox.test.ts`: `sandbox` 속성 검증(`allow-same-origin` 부재), CSP 메타 태그 포함 여부(`DC-7`), `runtimeCode`·`runtimeUrl` 둘 다 생략 시 설정 오류(`DC-13`), 오류 전파 (13 tests — 이스케이프, 시작 타임아웃, 채널 분리 포함)
- [x] `live/src/tests/bridge-compat.test.ts`: `LiveHandle.bridge`가 `AgentBridge` 계약(`listTools`, `getState`, `callTool`, `subscribe`)을 준수함 (6 tests — 메서드 집합이 `createAgentBridge()`와 동일, 타입 동일)
- [x] 추가: `live/src/tests/runtime.test.tsx`: 샌드박스 쪽 `boot`를 가짜 전송으로 검증 (14 tests — `DC-6` 심볼 21개 주입, `fTags`·`lTag` 코드 실행, 오류 phase 구분, 상태 이벤트 후 `result`·`ack` 순서, 샌드박스 내부 인자 검증, 승인된 confirm 액션 실행, 복제 불가 결과, 위젯 내부 도구 변경 전달, teardown)
- 하니스: `live/src/tests/harness.ts` — jsdom은 srcdoc 스크립트를 실행하지 않으므로 테스트가 샌드박스 역할을 한다(채널 읽기, 호스트 송신 기록, iframe 창을 `source`로 한 응답).

### 종료 조건
- `live/` 단위 테스트가 base·concurrent 양쪽에서 100% 통과.
- `src/`와 `lithentConcurrent/src/` diff 0줄 (`RQ-9`).
- `live/dist/lithentLive.umd.js` ≤ 3,000 B brotli, `live/dist/sandboxRuntime.umd.js` ≤ 11,000 B brotli (`DC-9`).

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm --filter lithent-live test` → 4 files, **53/53** / `LITHENT_CORE=concurrent` → 4 files, **53/53**
- [x] `pnpm --filter lithent-live build` → 성공 (타입 검사 + ESLint, 호스트·런타임·문자열 모듈). `lithentLive.umd.js` **2,084 / 3,000 B**, `sandboxRuntime.umd.js` **8,277 / 11,000 B** brotli (`DC-9`)
- [x] 실제 Chromium(Playwright, 임시 페이지) 확인: `runtimeCode`로 위젯 렌더, 사람 클릭·`callTool`·인자 검증, 호스트 승인(핸들러 없음 `REJECTED` → 승인 후 실행), `updateProps` 뒤 클로저 상태 유지, `await` 직후 `getState()` 최신, 문법 오류 `compile`·비컴포넌트 `compile`·mounter 예외 `mount`, 런타임 없음 즉시 `compile`(`DC-13`), 잘못된 `runtimeUrl` 즉시 `compile`, 생성 코드의 `parent.document`·`top.location`·`localStorage`·`document.cookie` 접근 `SecurityError`·origin `"null"`, 기본 CSP의 `fetch`·이미지 차단과 `allowNetwork: true`의 허용, `destroy()` 뒤 iframe 0개, 페이지 오류 0건. (마지막 재확인 실행 1회는 권한 검사로 막혀 생략 — 동일 항목은 앞선 실행에서 확인)
- [x] 루트 `pnpm test:core` → 81 files / 516 tests 통과 (`live/**` 제외 확인)
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)

Files:
- `live/package.json` (added)
- `live/tsconfig.json` (added)
- `live/vite.config.js` (added)
- `live/vite.runtime.config.js` (added)
- `live/scripts/build-runtime-module.mjs` (added)
- `live/src/index.ts` (added)
- `live/src/types.ts` (added)
- `live/src/srcdoc.ts` (added)
- `live/src/mountLive.ts` (added)
- `live/src/runtime/symbols.ts` (added)
- `live/src/runtime/boot.ts` (added)
- `live/src/runtime/entry.ts` (added)
- `live/src/tests/harness.ts` (added)
- `live/src/tests/sandbox.test.ts` (added)
- `live/src/tests/rpc.test.ts` (added)
- `live/src/tests/bridge-compat.test.ts` (added)
- `live/src/tests/runtime.test.tsx` (added)
- `pnpm-workspace.yaml` (modified)
- `pnpm-lock.yaml` (modified)
- `vite.config.js` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 5 — `lithent/live` Direct 모드, `<lithent-live>`, 오류 힌트, 리사이즈: done

Refs: RQ-6, RQ-7, RQ-8, DC-6, DC-7, DC-8, M-3, M-5, M-6

### 진입 조건
- Phase 4 종료 조건 충족.

### 구현 체크리스트
- [x] `mode: 'direct'` 구현 (명시적 opt-in, `lithent/element` Shadow DOM 격리, 비신뢰 코드 금지 주석/문서)
  - 샌드박스 런타임 `boot`를 이 페이지에서 실행하고 open Shadow Root에 그린다. 메시지는 메모리에서 비동기로 오가 RPC·승인·`reload`·타임아웃 로직을 Sandbox 모드와 공유한다. 첫 사용 시 `console.warn`, 타입 주석에 신뢰 코드 전용 명시.
  - `boot`는 동적 `import()`라 ESM·CJS에서는 별도 청크로 분리되고, 호스트 빌드는 `lithent` 하위 경로를 모두 외부 모듈로 둔다 (`DESIGN.md` §3.2 Direct 모드 의존성).
  - Shadow DOM 격리는 `lithent/element`를 쓰지 않고 직접 `attachShadow`로 구현했다 (호스트가 lithent 코어를 정적으로 import하지 않게).
- [x] `<lithent-live>` Custom Element 래퍼 구현 (`code`, `mode`, `styles`, `props` 속성/프로퍼티, `live-ready`/`live-error` 이벤트, `el.bridge` 프로퍼티 노출) — `live/src/element.ts`, `defineLiveElement(name?)`
  - **설계 편차**: `lithent/element` 대신 plain Custom Element, 등록은 `defineLiveElement()` 호출 시에만, 위젯은 요소 자신(light DOM)에 그린다 (`DESIGN.md` §3.1 편차 기록). Shadow Root 안의 iframe에는 jsdom이 창을 만들지 않아 테스트 중 발견했고, 위젯은 이미 iframe·Direct Shadow Root로 격리되므로 요소의 Shadow Root는 필요 없다고 판단했다.
  - 추가 속성·프로퍼티: `runtime-url`·`allow-network` 속성, `runtimeCode`·`theme`·`autoResize`·`timeoutMs` 프로퍼티. 같은 task 안의 변경은 한 번에 적용, 이동은 유지, 제거 시 정리.
- [x] `LiveError.hint` 자가 수정(self-repair) 힌트 생성기 구현 (mounter가 JSX 직접 반환, `lstate`를 `mount`에서 사용, 문법 오류 등) — `live/src/hints.ts` (호스트에서 오류와 코드로 생성)
  - 대상: JSX, `import`, `export`, 컴포넌트 미반환, React 훅·`React`, `render`·`createRoot` 직접 호출, 그 밖의 미정의 이름(사용 가능한 심볼 목록), `timeout`. "`lstate`를 `mount`에서 사용"은 오류가 나지 않아(`useRenew()` 기반) 대상에서 뺐다 (`DESIGN.md` §3.4 구현 세부 Phase 5).
  - 심볼 이름 목록을 import 없는 `live/src/names.ts`로 분리해 호스트 힌트가 런타임 의존성을 끌어오지 않게 했다.
- [x] `autoResize` (`ResizeObserver` → `resize` 메시지) 및 `theme` CSS 변수 전달 구현 (`DC-8`) — `live/src/runtime/entry.ts`(`watchHeight`), `live/src/srcdoc.ts`(`themeCss`), `live/src/mountLive.ts`

### 기준 테스트
- [x] `live/src/tests/direct.test.tsx`: Direct 모드 마운트·`updateProps`·`reload`·`destroy` 및 Shadow DOM 격리 (8 tests — jsdom에서 실제 실행, 경고 1회, 스타일·테마, 승인, 시작 실패 정리 포함)
- [x] `live/src/tests/error-hints.test.ts`: 대표 LLM 코딩 실수 5종에 대한 구조화된 `LiveError(phase, message, hint)` 검증 (19 tests — 엔진별 문구 단위 케이스, Direct 모드 실제 오류 5종, Sandbox 오류에 호스트가 힌트 추가)
- [x] `live/src/tests/element-wrapper.test.tsx`: `<lithent-live>` 속성 변경, `el.bridge` 호출, 언마운트 정리 (11 tests — 등록·SSR, 변경 묶음 처리, `reload`·`props`·재마운트, `live-error`, 이동 유지, 제거 정리, Direct 모드)
- [x] 추가: `sandbox.test.ts`(테마 CSS·`autoResize` 설정, 15 tests), `rpc.test.ts`(`resize` 처리, 22 tests), `runtime.test.tsx`(`watchHeight`, 16 tests)

### 종료 조건
- Phase 4~5 테스트가 base·concurrent 양쪽에서 100% 통과.

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm --filter lithent-live test` → 7 files, **97/97** / `LITHENT_CORE=concurrent` → 7 files, **97/97**
- [x] `pnpm --filter lithent-live build` → 성공 (타입 검사 + ESLint). 산출물에 Direct 모드 청크 `boot-*.js`·`boot-*.cjs`와 공유 `names-*` 청크 추가
- [x] 실제 Chromium(Playwright, 요청 가로채기로 빌드 산출물 제공, 저장소에 임시 파일 없음): Sandbox `autoResize`로 iframe 높이 120px → 260px, 테마 변수 적용(계산 색 `rgb(1, 2, 3)`), Direct 모드(ESM 청크 로드·Shadow DOM·`callTool`·테마), `<lithent-live>`(`live-ready`·`el.bridge` 호출·`props` 갱신), 실제 V8 오류의 JSX·React 힌트, 페이지 오류 0건
- [x] **크기**: `lithentLive.umd.js` brotli **4,536 B** — 당시 예산 3,000 B를 1,536 B 초과해 `DESIGN.md` `DC-17`(TBD)로 기록했고, 2026-11-27 `DC-17` 결정으로 예산이 5,500 B가 되어 통과 ("Phase 5 후속" 참고). `sandboxRuntime.umd.js` 8,485 / 11,000 B
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)

Files:
- `live/src/names.ts` (added)
- `live/src/hints.ts` (added)
- `live/src/element.ts` (added)
- `live/src/index.ts` (modified)
- `live/src/types.ts` (modified)
- `live/src/srcdoc.ts` (modified)
- `live/src/mountLive.ts` (modified)
- `live/src/runtime/symbols.ts` (modified)
- `live/src/runtime/entry.ts` (modified)
- `live/vite.config.js` (modified)
- `live/src/tests/direct.test.tsx` (added)
- `live/src/tests/error-hints.test.ts` (added)
- `live/src/tests/element-wrapper.test.tsx` (added)
- `live/src/tests/sandbox.test.ts` (modified)
- `live/src/tests/rpc.test.ts` (modified)
- `live/src/tests/runtime.test.tsx` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 5 후속 — `DC-17` 결정 반영: done

Refs: DC-9, DC-17, RQ-10

### 진입 조건
- Phase 5 종료 (커밋 `97709b1`), 2026-11-27 사용자 결정: `DC-17` → 옵션 A, `lithent/live` 호스트 예산 5,500 B (Phase 7 하드닝 여유 포함), API 분리 없음, 측정 기준 UMD brotli 유지.

### 체크리스트
- [x] `DESIGN.md`: `DC-17` 확정 기록(옵션·근거·ESM tree-shaking 참고 기록), `DC-9` 확정 예산과 측정 기록, §3.2·§5 호스트 예산을 5,500 B로 갱신
- [x] `REQUIREMENTS.md`: 상태 줄, 구분 표기, `RQ-10` 호스트 예산 5,500 B
- [x] `IMPLEMENT.md`: Phase 5 크기 항목, Phase 6 진입 조건(충족)과 `size-report.js` 등재 예산, Handoff
- [x] ESM tree-shaking 참고 측정 (`DC-16`과 같은 방식)

### 검증 기록 (2026-11-27)
- [x] 호스트 UMD `lithentLive.umd.js` **4,536 / 5,500 B** brotli (여유 964 B) — Phase 5 빌드 그대로, 코드 변경 없음
- [x] ESM tree-shaking: esbuild로 `live/dist/lithentLive.mjs` 번들(`lithent`·하위 경로 external, minify, splitting) — `defineLiveElement` 미사용 소비자 초기 청크 3,093 B br(`live-ready`·`customElements.define` 미포함), 사용 시 3,741 B br. Direct 모드 청크 878 B + 147 B는 두 경우 모두 지연 로드
- [x] `docatlas check --strict` 통과

Files:
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 6 — `lithent/live` 배포 연결·스킬·문서·인터랙티브 데모: done

Refs: RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-6, DC-9, DC-10, DC-17, M-3, M-6, M-7

### 진입 조건
- Phase 5 종료 조건 충족.
- `DESIGN.md` `DC-17`(`lithent/live` 호스트 크기 예산 초과 대응) 결정 — 충족: 옵션 A, 호스트 예산 5,500 B, API 분리 없음, 측정 기준 UMD brotli 유지 (2026-11-27).

### 구현 체크리스트
- [x] 루트 `package.json`: `exports["./live"]`, `exports["./live/runtime"]`, `files`, `build:live`, `build:sequence`, `build:parallel` 제외 목록, `test:satellites`·`test` 연결
  - `exports`는 `lithent/agent`와 같은 모양(`import`/`require` × `types`/`default`). `files`에 `live/dist`·`live/src`·`live/package.json`·`live/README.md`를 넣어 해시 청크(`boot-*`, `names-*`)가 `live/dist`째로 실린다. 키워드 `generative-ui` 추가.
  - `build:sequence`: `build:agent` 다음에 `build:live` (live 빌드가 `lithent/agent`·`helper`·`ftags`·`tag` dist를 쓰므로).
- [x] 루트 `vite.config.js` vitest `exclude`에 `live/**` 추가 (Phase 4에서 선반영 — Phase 4 체크리스트 참고)
- [x] `scripts/size-report.js`, `scripts/verify-release.mjs`, `scripts/ci-build-artifacts.mjs`, `.github/release-policy.json`에 `live` 및 `live/runtime` 등록 (`size-report.js` 예산: `lithentLive.umd.js` 5,500 B — `DC-17`, `sandboxRuntime.umd.js` 11,000 B)
  - `verify-release.mjs`: 소비자 검사 경로 15개(`lithent/live`, `lithent/live/runtime` 추가). ESM: 공개 키 `defineLiveElement`·`mountLive`, DOM 없는 환경에서 `defineLiveElement()`가 조용히 `undefined`, `sandboxRuntimeCode`에 `lithentLiveRuntime` 포함. CJS: 런타임 문자열이 ESM과 같음. 타입: `mountLive` 호출, `code` 누락 `@ts-expect-error`, `defineLiveElement()`. 타입 스코프는 base 13개 + concurrent 쪽은 그대로.
- [x] `live/README.md`, `skills/lithent/reference/live.md`, `skills/lithent/SKILL.md`, `lithent-agent-addon.md` 업데이트 (LLM이 1회 시도에 유효한 `lithent/live` 코드를 생성하는 규약 포함)
  - 규약(`reference/live.md` "The code the model writes"): 함수 본문, `return lmount(props => { ... return () => ... })`, 스코프에 있는 이름 목록, JSX·`import`·`export` 금지, `fTags`/`lTag`, 자식은 `flMount`, 액션·상태는 마운터에서, 이름 `[a-zA-Z0-9_-]`, 파괴적 액션 `confirm: true`, JSON 안전 반환값, 네트워크·`parent`·저장소 없음, React 관용구 금지. 예제 위젯은 Direct 모드에서 실제로 실행해 확인했다 (`flMount` 자식 포함).
  - UMD Direct 모드에 필요한 전역(`lithent`·`lithentHelper`·`lithentFTags`·`lithentTag`·`lithentAgent`)을 `live/README.md` "Without a bundler"에 명시 (Phase 5 Handoff 항목).
- [x] `lithentDocs` 가이드 페이지(영어·한국어) 및 **양방향 Generative UI 인터랙티브 플레이그라운드** (코드 실행 → 사용자 마우스 조작 → AI 도구 호출로 상태 변경 시연) 구축
  - `/guide/live`, `/ko/guide/live` (사이드바 "AI Agents" 그룹 "Generative UI"). `LivePlayground`: 편집 가능한 여행 예산 위젯 코드 → Sandbox 실행 → 사람은 슬라이더 조작, 에이전트 패널은 `listTools()` 결과마다 JSON 인자 + 호출 버튼(`confirm` 액션은 🔒, `window.confirm`으로 승인), `bridge.subscribe`로 갱신되는 `getState()` 표시, 호출 기록, "망가진 버전"(JSX)으로 `LiveError.hint` 시연.
- [x] `README.md`, `CHANGELOG.md`, `docs/ideas/IDEAS.md` 상태 갱신
  - `CHANGELOG.md` Unreleased에 `lithent/agent`·`lithent/live` 항목(미출시 표시), `IDEAS.md` 5번 "부분 착수", `README.md` 기능 절과 Ecosystem 표 2행.

### 기준 테스트
- [x] `pnpm build && pnpm size && pnpm verify:release` 통과
- [x] 문서 사이트 및 플레이그라운드 빌드(`pnpm build:docs`) 통과

### 종료 조건
- `lithent/agent`와 `lithent/live` 모두 배포 산출물·문서·스킬·크기 게이트 통과.

### 검증 기록 (2026-11-27, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] `pnpm build` → 성공 (`build:sequence`에 `build:live` 포함)
- [x] `pnpm size` → `lithent/agent` **2,374 / 2,500 B**, `lithent/live` 호스트 **4,536 / 5,500 B**, `lithent/live/runtime` **8,485 / 11,000 B** (brotli, UMD). 코어 기존 항목 변화 없음
- [x] `pnpm test:dual` → 성공. 루트 코어 516/516·394/394, live base·concurrent 각 **97/97**, agent 91/91 ×2, 나머지 위성 패키지 기존과 같음
- [x] `pnpm verify:release` → `ALL PASS (8 prepared packages; nothing published)`. 설치된 소비자에서 ESM·CJS **15개** 공개 경로, Node16·NodeNext 선언(`skipLibCheck: false`) 통과. `lithent-1.26.1.tgz`에 `live/dist`의 `boot-*`·`names-*` 청크(ESM·CJS), `lithentLive.umd.js`, `sandboxRuntime.umd.js`, `live/README.md`, `live/package.json`이 실린 것을 확인 (Phase 5 Handoff 항목)
- [x] `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs` (`pnpm test:ci` 대체) → 50/50
- [x] `pnpm build:docs` → 성공 (`/guide/live`, `/ko/guide/live` 포함)
- [x] 실제 Chromium(Playwright, 문서 사이트 빌드 결과를 요청 가로채기로 제공, 저장소에 임시 파일 없음): 플레이그라운드 iframe 자동 높이 145px, 사람이 슬라이더 조작 → `getState().trip.budget` 1200, 에이전트 `add_expense`·`set_budget` 호출로 위젯 갱신, `clear_expenses`(`confirm: true`)는 확인 대화상자 표시, "망가진 버전"은 JSX 힌트 표시, 한국어 경로 동작, 페이지 오류 0건
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)
- 수동 체크 `M-3`·`M-6`·`M-7`(`lithent/live` 2차 출하)은 Phase 8에서 수행한다.

Files:
- `package.json` (modified)
- `scripts/size-report.js` (modified)
- `scripts/verify-release.mjs` (modified)
- `scripts/ci-build-artifacts.mjs` (modified)
- `.github/release-policy.json` (modified)
- `live/README.md` (added)
- `skills/lithent/reference/live.md` (added)
- `skills/lithent/SKILL.md` (modified)
- `lithent-agent-addon.md` (modified)
- `README.md` (modified)
- `CHANGELOG.md` (modified)
- `docs/ideas/IDEAS.md` (modified)
- `lithentDocs/src/components/LivePlayground.tsx` (added)
- `lithentDocs/src/pages/Live.tsx` (added)
- `lithentDocs/src/pages/Live_ko.tsx` (added)
- `lithentDocs/src/components/Layout.tsx` (modified)
- `lithentDocs/src/components/Sidebar.tsx` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 6 후속 — Phase 4~6 리뷰 반영: done

Refs: RQ-7, RQ-8, RQ-10, RQ-12, DC-5, DC-7, DC-11, DC-14, DC-17

### 진입 조건
- `doc-driven-reviewer-v1`의 Phase 4~6 리뷰(`c470fb5..d8d37a0`, Verdict `REQUEST_CHANGES`, Critical 2 / Warning 5 / Suggestion 4)를 받아, 사용자가 의미 있는 항목만 판단해 반영하도록 요청 (2026-11-28).

### 반영한 항목
- [x] **Critical 1 — 시작 중 `reload()`·`destroy()`가 그 세션을 닫지 못함**: `current`는 `ready` 뒤에만 정해지므로, 시작 중인 세션은 다음 `reload`·`destroy`의 `clear()`에 걸리지 않았고 늦게 온 `ready`가 파괴된 핸들에 iframe과 `message` 리스너를 남겼다. 진행 중인 시작을 끊는 함수(`abort`)를 두고 `clear()`가 먼저 부른다. 끊긴 시작은 iframe·리스너·타이머를 지우고 `LiveError(phase: 'mount')`로 reject한다. 호출한 쪽이 요청한 일이므로 `onError`는 부르지 않는다 (`live/src/mountLive.ts`). `<lithent-live>`는 작업을 순서대로 실행하므로 이 경합이 없었고, `LiveHandle`을 직접 쓰는 호출자에게 해당했다.
- [x] **Critical 2 — 샌드박스 메시지를 검증 없이 캐시에 넣음**: 채널이 맞는 위조 메시지(`tools: null`, `state: undefined`, `event: null`, `BigInt`·배열 상태 등)로 호스트의 `listTools()`·`getState()`·리스너가 예외를 냈다. 도구 목록은 배열·문자열 `name` 항목만, 상태는 JSON 텍스트(객체가 아니면 `{}`)로 저장하고, 이벤트는 확인한 캐시로 다시 만들어 보내며, `error`는 `LiveError` 모양으로, `resize`는 유한한 숫자만 받는다. 시작 스크립트는 설정을 함수 스코프로 옮겨 `window.c`를 없앴다 (`live/src/srcdoc.ts`). 다만 위젯 코드는 호스트가 보내는 메시지를 받아 볼 수 있어 채널 id를 알아낼 수 있으므로, 이것은 보조 조치이고 실제 방어는 호스트 쪽 확인이다 (`DESIGN.md` §3.3 구현 메모).
- [x] **Warning 1 — 샌드박스를 만들다 동기 예외(잘못된 `runtimeUrl`, 순환 참조 `props`)**: 날것의 `TypeError`로 reject되고 시작 타이머가 남아 나중에 `timeout` 오류가 따로 왔다. `openSandbox`를 감싸 `LiveError(phase: 'mount')` + `onError` 한 번으로 끝내고 타이머를 지운다.
- [x] **Warning 2 — 승인 전 인자 검사가 없음**: `lithent/agent`는 검사 → 승인(정리된 인자) → 실행 순서인데, `lithent/live`는 원래 인자로 승인을 물은 뒤 샌드박스에서 `INVALID_PARAMS`가 날 수 있었다(사람이 틀린 호출을 승인하고, 선언되지 않은 키도 승인 창에 보임). 호스트가 위젯이 보고한 `inputSchema`로 `lithent/agent`와 같은 규칙의 검사를 먼저 하고(`live/src/args.ts`), 승인과 `call` 메시지 모두 정리된 인자를 받는다. `DC-14`(거부된 호출은 샌드박스에 닿지 않음)는 그대로다. 같은 선언을 로컬 브릿지와 위젯 디스크립터로 각각 호출해 결과가 같은지 확인하는 테스트를 넣어 두 구현이 어긋나지 않게 했다.
- [x] **Warning 3 — `<lithent-live>` 정의 전 프로퍼티 유실**: `connectedCallback`에서 자기 프로퍼티를 꺼내 접근자로 다시 넣는다 (`lithent/element`와 같은 처리).
- [x] **Warning 5 — `version: { { VERSION } }`**: Prettier가 YAML frontmatter의 `{{VERSION}}`을 `{ { VERSION } }`로 바꾼다. `reference/live.md`와, 같은 문제가 2026-10-26(`95d6faf`)부터 있던 `skills/lithent/SKILL.md`를 고쳤고, `scripts/build-skills.js`가 두 형태를 모두 치환하게 해 다시 포맷되어도 깨지지 않게 했다.
- [x] **Suggestion 1 — 플레이그라운드 연속 실행·이탈 경합**: 실행 번호와 언마운트 표시를 두어, 늦게 끝난 이전 실행의 위젯은 바로 `destroy()`한다.
- [x] **Suggestion 3 — `live/vite.config.js` 주석**: `DC-9 ≤ 3,000 B` → `DC-17 ≤ 5,500 B`.
- [x] **Suggestion 4 — Phase 6 `Refs:`에 `DC-17`**: 추가.
- [x] 크기 증가에 맞춰 문서의 호스트 크기 표기를 "약 4.5 KB" → "약 5 KB"로 갱신 (`live/README.md`, `reference/live.md`, `CHANGELOG.md`, 문서 사이트 `Live.tsx`).

### 반영하지 않은 항목 (사유)
- **Warning 4 — `updateProps` 다시 그리기 예외 시 `ack` 미송신**: 전제가 맞지 않았다. lithent의 `renew()`는 다시 그리기를 마이크로태스크에 넣기만 하므로(`src/utils/redraw.ts`) `renew()`도 `nextTick()`도 예외를 내지 않는다. `try/catch` + `ack`에 오류를 싣는 수정을 넣고 테스트해 보니 `ack`는 수정 전에도 바로 갔고(오류는 비어 있음), 렌더 예외는 따로 잡히지 않은 예외로 나왔다. 샌드박스에서는 이 예외가 창의 `error` 리스너를 거쳐 `onError`(`phase: 'render'`)로 온다. 효과 없는 코드라 되돌리고, 확인한 동작을 `DESIGN.md` §3.4에 기록했다.
- **Suggestion 2 — `runtimeUrl` 스킴 검사**: `runtimeUrl`은 개발자가 주는 설정이지 모델 출력이 아니다. `javascript:` 같은 값은 `<script src>`로 실행되지 않고 런타임이 없다는 `compile` 오류로 바로 끝난다. 크기를 쓸 만큼의 이득이 없다.

### 기준 테스트
- [x] 회귀 테스트 추가 (`live/src/tests/rpc.test.ts` 11개, `bridge-compat.test.ts` 1개, `element-wrapper.test.tsx` 1개 — 97 → 110):
  - 시작 중 `reload`가 앞 세션을 닫음 / 시작 중 `destroy`가 세션·타이머를 지우고 늦은 `ready`를 무시
  - 모양이 틀린 `ready`·`event`·`error`·`resize`에도 호스트 캐시가 안전
  - 승인 전 `INVALID_PARAMS`(승인·전송 없음), 선언된 인자만 전송, 모양이 틀린 `inputSchema`에도 예외 없음
  - 잘못된 `runtimeUrl`·순환 참조 `props` → `LiveError(phase: 'mount')`, 늦은 `timeout` 없음
  - `lithent/agent`와 인자 검사 결과 일치 (8가지 인자 조합)
  - 정의 전에 넣은 `code`·`runtimeCode`·`props`로 마운트
- [x] 기존 테스트 3개를 새 동작에 맞춤: 승인 창이 받는 인자(선언되지 않은 `why` 제거), 복제할 수 없는 인자 테스트를 `object` 매개변수로, srcdoc 시작 스크립트 형식

### 검증 기록 (2026-11-28, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] 실패 재현: 수정 전 `mountLive.ts`로 새 테스트를 돌리면 12개 실패(시작 중단 2, 메시지 확인 4, 승인 전 검사 2·일치 1·기존 승인 인자 1, 설정 실패 2), 수정 전 `element.ts`로 정의 전 프로퍼티 테스트 실패. 수정 후 모두 통과
- [x] `pnpm --filter lithent-live test` / `LITHENT_CORE=concurrent` → 각 7 files, **110/110** (97 + 신규 13)
- [x] `pnpm build` → 성공 (live 타입 검사 + ESLint 포함), `node scripts/build-skills.js` → `dist/skills`의 `SKILL.md`·`reference/live.md` frontmatter `version: 1.26.1`
- [x] `pnpm size` → `lithent/live` 호스트 **5,082 / 5,500 B** (여유 418 B, +546 B), 런타임 8,485 / 11,000 B (변화 없음), `lithent/agent` 2,374 / 2,500 B
- [x] `pnpm test:dual` → 성공 (live base·concurrent 각 110/110, 나머지 Phase 6과 같음)
- [x] `pnpm verify:release` → `ALL PASS (8 prepared packages; nothing published)`, ESM·CJS 15개 경로
- [x] `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs` → 50/50
- [x] `pnpm build:docs` → 성공
- [x] 실제 Chromium (Playwright, 요청 가로채기, 저장소에 임시 파일 없음):
  - 문서 사이트 플레이그라운드: Phase 6 시나리오 전부 그대로(자동 높이 145px, 슬라이더 → 상태, 에이전트 호출, 승인 대화상자, JSX 힌트, 한국어), "실행" 세 번 연타 후 iframe 1개, 샌드박스 안 `typeof c`·`typeof r`·`typeof window.c` 모두 `undefined`, 페이지 오류 0건
  - 빌드한 UMD(`lithentLive.umd.js` + `runtimeUrl`)로 위조 시나리오: 위젯 코드가 호스트의 `call` 메시지에서 채널 id를 알아내 `event: null`, `tools: null`, `BigInt` 상태, `error: null`, `resize: Infinity`를 보냄 → 호스트 `listTools()` `[]`, `getState()` `{}`, 이벤트는 확인한 값으로만 전달, `onError`는 `{ phase: 'render', message: 'null' }`, iframe 높이 유지, 페이지 오류 0건. 승인 전 검사: `{ n: 'x', extra: 1 }` → `INVALID_PARAMS`(`n (type)`), `{ n: 2, extra: 1 }` → `{ ok: true, value: 2 }`. 시작 중 `destroy` → `reload`는 `phase: 'mount'`로 reject, 남은 iframe 0개
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)
- [x] `docatlas check --strict` 통과

Files:
- `live/src/args.ts` (added)
- `live/src/mountLive.ts` (modified)
- `live/src/srcdoc.ts` (modified)
- `live/src/element.ts` (modified)
- `live/vite.config.js` (modified)
- `live/src/tests/rpc.test.ts` (modified)
- `live/src/tests/bridge-compat.test.ts` (modified)
- `live/src/tests/element-wrapper.test.tsx` (modified)
- `live/src/tests/sandbox.test.ts` (modified)
- `live/README.md` (modified)
- `scripts/build-skills.js` (modified)
- `skills/lithent/SKILL.md` (modified)
- `skills/lithent/reference/live.md` (modified)
- `lithentDocs/src/components/LivePlayground.tsx` (modified)
- `lithentDocs/src/pages/Live.tsx` (modified)
- `CHANGELOG.md` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

---

## Phase 7 — Test Hardening (보안·경계값·오류·누수 강화): done

Refs: RQ-1, RQ-2, RQ-3, RQ-5, RQ-7, RQ-8, RQ-9, DC-3, DC-5, DC-7, DC-11, DC-12, DC-13, DC-14, DC-15, M-4, M-5

### 진입 조건
- Phase 1~6 구현 및 기본 테스트 완료 — 충족 (Phase 6 `d8d37a0`, Phase 4~6 리뷰 반영 `0ad8d82`).

### 강화 체크리스트
- [x] **보안 음성 대조 테스트**: 샌드박스 내부에서 `window.parent.document`, `localStorage`, `document.cookie`, 임의 외부 `fetch`(기본 CSP 활성 시), 위조된 `postMessage`(다른 `channelId`·다른 `source`) 접근이 모두 차단됨을 검증
  - **편차**: opaque origin과 CSP는 브라우저가 집행하고 jsdom은 srcdoc을 실행하지 않는다(`sandbox` 속성도 집행하지 않음). 그래서 둘로 나눴다. jsdom 자동 테스트(`live/src/tests/hardening.test.ts`)는 라이브러리가 맡는 부분을 검사한다: 호스트가 다른 `source`(이 창·다른 iframe·`null`)와 다른 모양의 데이터를 무시, 샌드박스 런타임(`entry.start`)이 `parent`가 아닌 출처·다른 채널의 메시지에 답하지 않음, srcdoc이 `props`·`code`·`styles`·`theme`·`runtimeCode`에 넣은 `</script>`·`<!--` 공격에도 스크립트 2개·스타일 2개를 유지, 모든 옵션 조합에서 `sandbox="allow-scripts"`만, 기본 CSP가 `default-src 'none'`이고 네트워크 지시어 없음. 브라우저가 집행하는 부분은 실제 Chromium에서 확인해 아래 검증 기록에 남겼고, 저장소의 자동 브라우저 테스트는 Phase 8 `e2e/agent-ui.spec.ts`(시나리오 4, `M-4`)에서 만든다.
- [x] **재진입·경합·언마운트 경계 테스트**: `callTool` 실행 도중 컴포넌트 언마운트 / `reload()` / `destroy()` 발생 시 메모리 누수·미처리 Promise rejection 0건 검증
  - 두 하드닝 파일 모두 테스트마다 `unhandledRejection`을 모아 0건인지 확인하고, live는 창의 `message` 리스너 순증가 수를 센다.
  - agent: 언마운트 뒤 거부되는 `run` → `EXECUTION_ERROR`·이벤트 없음, 액션 안에서 같은 브릿지의 다른 도구 호출, 변경마다 도구를 부르는 리스너가 무한 반복 없이 수렴, 전달 중 자기 구독 해제, 호출 중 `dispose`.
  - live: 승인 중 `reload`(아래 결함 1), 승인 핸들러 안의 `destroy`, `destroy` 시 대기 중 호출·`updateProps`와 타이머 정리, `reload`의 `tools-changed`에서 리스너 예외, `destroy` 두 번, Direct 모드 청크 로드 중 `destroy`, 실행 중 액션이 있는 Direct 위젯 `destroy`.
- [x] **상태 직렬화 경계 테스트**: `agentState`가 순환 참조, `BigInt`, 함수, 예외를 반환할 때 `{ __agentStateError }` 격리(`DC-12`) 및 `BigInt` 문자열화 검증
  - 기존(Phase 1) 순환 참조·`Error` 예외·`BigInt`·함수 테스트에 더해: `Error`가 아닌 값(`'text'`, `null`) 던지기, `toJSON` 예외, 중첩 `BigInt`·`Symbol`·`Date`·`NaN`·`-Infinity`, 같은 방식으로 계속 실패하는 getter는 변경으로 보고하지 않음, 회복한 getter는 값이 다시 보이고 경고는 한 번. Direct 모드로 실제 런타임을 거쳐 호스트까지 격리·문자열화가 유지됨.
- [x] **여분 키·승인 경계 테스트**: `agentAction` 미선언 여분 키 strip(`DC-11`), Sandbox `confirm` 거부 시 iframe으로 `call` 메시지 미전송(`DC-14`), `runtimeCode`·`runtimeUrl` 모두 생략 시 외부 요청 0건(`DC-13`) 검증
  - `__proto__`·`constructor` 키 제거와 프로토타입 오염 없음, `NaN`·`±Infinity` 거절과 `-0`·1만 개 배열 허용, 읽으면 예외가 나는 인자(아래 결함 2). `DC-14`는 rpc 테스트와 승인 중 `reload`·`destroy`로, `DC-13`은 `fetch` 호출·`script`/`iframe`/`link` 생성·`message` 리스너 0건으로 검사.
- [x] **오류 복구 루프 테스트**: 잘못된 코드 로드(`LiveError` + `hint` 반환) → `reload(수정된 코드)` 호출 시 이전 iframe/리스너가 완전히 정리되고 새 위젯이 정상 동작함 검증
  - `mountLive` 실패(JSX 힌트) → iframe·리스너 0 → 고친 코드로 `mountLive` 성공. `reload`로 깨진 코드 → 고친 코드를 20회 반복해도 iframe 1개·리스너 1개, `destroy` 뒤 0.
- [x] **대량 등록·해제 스트레스 테스트**: 100회 연속 마운트/언마운트 및 `reload` 반복 후 리스너 수·등록 엔트리 수 0으로 복귀 검증
  - agent: 100회 마운트/언마운트, 스코프별 100개 인스턴스 동시 등록(도구 200개) 후 전부 해제, 구독·해제 100쌍, 한 task 안 100번 변경 → 이벤트 1번.
  - live: 연속 `reload` 100회, 기다리지 않는 `reload` 100회(마지막만 시작, 99개 `phase: 'mount'` reject), 위젯 100개 시작·파괴, 동시 호출 100개 역순 응답, Direct 모드 `reload` 50회, `<lithent-live>` 한 task 안 `code` 변경 50번·이동 50번·제거.
- [x] **이름 규칙 (`DC-15` 검증 항목)**: 규칙을 지키는 `scopeId`·`name`의 조합 이름은 `^[a-zA-Z0-9_-]+$`를 지킨다. 라이브러리는 이름을 검사하지 않는다는 계약(§2.5)도 테스트로 고정했다 (`cart.add`는 그대로 등록).

### 하드닝에서 찾아 고친 결함
1. **승인 중 `reload`하면 승인된 호출이 새 위젯에서 실행됨 (`lithent/live`)**: 승인 뒤 같은 이름의 도구가 있는지만 봤기 때문에, 승인 대화상자가 열린 사이 `reload`된 새 위젯이 같은 이름의 도구를 가지면 이전 위젯을 위해 승인한 호출이 새 위젯으로 갔다(재현 결과 `{ ok: true, value: 'ran on new' }`). `lithent/agent`는 엔트리 동일성으로 막는다(`NOT_FOUND`). 호출이 시작될 때의 세션을 기억해 승인 뒤 세션이 바뀌었으면 `NOT_FOUND`(`"…" was removed before it ran.`)를 돌려준다 (`live/src/mountLive.ts`).
2. **읽으면 예외가 나는 인자에서 `callTool`이 reject (`lithent/agent`, `lithent/live` 호스트)**: getter나 `Proxy`가 예외를 내는 인자 객체에서 검사 중 예외가 그대로 나가 "`callTool`은 던지지 않는다"는 계약(`agent/README.md`, 스킬)을 어겼다. 검사를 감싸 `INVALID_PARAMS`(예외 메시지)로 돌려준다 (`agent/src/bridge.ts`, `live/src/mountLive.ts`). `lithent/agent` +13 B.
3. **엄격한 호스트 CSP에서 시작 타임아웃 힌트가 원인을 짚지 못함 (`lithent/live`)**: Chromium에서 호스트 페이지 CSP가 `script-src 'self'`이면 샌드박스가 정책을 상속해 시작하지 못하고 `timeout`으로 끝나는데, 힌트는 무한 루프만 말했다. 시작 타임아웃 힌트에 "페이지 CSP가 인라인 스크립트와 `'unsafe-eval'`을 허용해야 한다"를 덧붙였다 (호출 타임아웃 힌트는 그대로, `live/src/hints.ts`).

### 검토 후보 (Phase 6 Handoff) 판단
- **이름 규칙 검사 없음**: 그대로 둔다. 검사를 넣으면 `lithent/agent` 여유(113 B)를 쓰고, 규칙은 제공자마다 다르다(길이 제한 등). 계약을 테스트로 고정했다.
- **`DC-3` 덮어쓰기 후 이전 인스턴스 미재등록**: 그대로 둔다(최신 인스턴스 우선이라는 `DC-3` 결정대로). `lifecycle.test.tsx`가 고정한다.
- **WebMCP `annotations`·`signal`, 보류한 리뷰 제안 2건**: 하드닝 범위가 아니다. 그대로 Phase 8 이후 후보로 남긴다.

### 기준 테스트
- [x] `agent/src/tests/hardening.test.tsx` 및 `live/src/tests/hardening.test.ts` 신규 작성 및 base·concurrent 양쪽 통과

### 종료 조건
- 모든 음성 대조·경계값·누수 회귀 테스트 100% 통과.

### 검증 기록 (2026-11-28, Node 22.23.5 + `pnpm_config_runtime_on_fail=ignore`)
- [x] 결함 재현: 승인 중 `reload` 시나리오를 수정 전 코드로 돌리면 새 iframe에 `call`이 가고 `{ ok: true, value: 'ran on new' }`, 읽으면 예외가 나는 인자는 `callTool`이 `getter trap`으로 reject. 수정 후 각각 `NOT_FOUND`·`INVALID_PARAMS`
- [x] `pnpm --filter lithent-agent test` / `LITHENT_CORE=concurrent` → 각 8 files, **110/110** (91 + 하드닝 19)
- [x] `pnpm --filter lithent-live test` / `LITHENT_CORE=concurrent` → 각 8 files, **133/133** (110 + 하드닝 22 + 힌트 1)
- [x] 하드닝 테스트마다 `unhandledRejection` 0건, live는 창 `message` 리스너 순증가를 확인 (위젯이 살아 있으면 1, 파괴 뒤 0)
- [x] `pnpm build` → 성공 (타입 검사 + ESLint)
- [x] `pnpm size` → `lithent/agent` **2,387 / 2,500 B** (+13 B), `lithent/live` 호스트 **5,145 / 5,500 B** (+63 B), 런타임 **8,478 / 11,000 B**, 코어 항목 변화 없음
- [x] `pnpm test:dual` → 성공 (루트 코어 516/516·394/394, agent 110/110 ×2, live 133/133 ×2, 나머지 위성 패키지 기존과 같음)
- [x] `pnpm verify:release` → `ALL PASS (8 prepared packages; nothing published)`, ESM·CJS 15개 경로
- [x] `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs` → 50/50
- [x] `pnpm build:docs` → 성공
- [x] 실제 Chromium (Playwright, 빌드한 UMD + `runtimeUrl`, 요청 가로채기, 저장소에 임시 파일 없음) — 위젯 코드가 시도한 탈출:
  - 기본 설정: `parent.document`·`top.location.href`·`localStorage`·`sessionStorage`·`document.cookie` 쓰기 `SecurityError`, `location.origin` `"null"`, `window.open` `null`, `fetch`·no-cors `fetch` `TypeError`, 이미지는 브라우저 안에서 `csp`로 실패(가로채기 핸들러에 도달하지 않음), `sendBeacon`은 `true`를 돌려주지만 요청 없음, 채널 없는 `postMessage` 무시, 호스트 쿠키 `secret=host-only` 그대로, 페이지 오류 0건
  - `allowNetwork: true` 대조: `fetch`(200)·no-cors·`sendBeacon`·이미지 요청이 나감 → 기본 설정의 차단이 CSP 때문임을 확인. 저장소·부모 접근은 여전히 `SecurityError`
  - 호스트 페이지 CSP `script-src 'self'`: 샌드박스가 정책을 상속해 시작하지 못하고 3초 뒤 `LiveError(phase: 'timeout')`, 외부 요청 0건, 페이지 오류 0건 → 결함 3의 힌트 보강
  - 위젯이 알아낸 채널로 보낸 위조 메시지: "Phase 6 후속" 검증 기록(2026-11-28)과 같은 방식으로 확인됨
- [x] `git diff --stat ead8b2e -- src lithentConcurrent/src` → 출력 없음 (`RQ-9`)
- [x] `docatlas check --strict` 통과

Files:
- `agent/src/tests/hardening.test.tsx` (added)
- `agent/src/bridge.ts` (modified)
- `live/src/tests/hardening.test.ts` (added)
- `live/src/tests/error-hints.test.ts` (modified)
- `live/src/mountLive.ts` (modified)
- `live/src/hints.ts` (modified)
- `docs/agent-ui/REQUIREMENTS.md` (modified)
- `docs/agent-ui/DESIGN.md` (modified)
- `docs/agent-ui/IMPLEMENT.md` (modified)

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
  - **`lithent/agent` (Phase 1~3 + 후속)** — 코어·어댑터·배포 연결·스킬·문서 사이트, `DC-15`·`DC-16` 반영, Phase 1~3 리뷰 반영 (커밋 `c7917de` … `ed97caa`)
  - **Phase 4 (`lithent/live` Sandbox 모드·RPC)** (커밋 `d3c6afe`)
  - **Phase 5 (`lithent/live` Direct 모드·`<lithent-live>`·힌트·리사이즈·테마)** (커밋 `97709b1`), **Phase 5 후속 (`DC-17`)** — 호스트 예산 5,500 B (커밋 `4a43aa2`)
  - **Phase 6 (`lithent/live` 배포 연결·스킬·문서·플레이그라운드)** — 루트 `exports["./live"]`·`["./live/runtime"]`·`files`·빌드/테스트 스크립트, `size`·`verify:release`·CI 아티팩트·릴리스 정책 등재, `live/README.md`, 스킬 `reference/live.md`(LLM 코드 규약), `SKILL.md`·`lithent-agent-addon.md`·`README.md`·`CHANGELOG.md`·`IDEAS.md`, 문서 사이트 `/guide/live`(영·한)와 양방향 Generative UI 플레이그라운드
  - Phase 6 검증: `build`·`size`·`test:dual`·`verify:release`(15개 경로, 청크 패킹 확인)·`build:docs`·CI fixture 통과, Chromium 플레이그라운드 확인, 코어 diff 0줄 (Phase 6 "검증 기록", 커밋 `d8d37a0`)
  - **Phase 6 후속 (Phase 4~6 리뷰 반영)** — 시작 중 `reload`·`destroy` 정리, 샌드박스 메시지 모양 확인, 승인 전 호스트 인자 검사(`lithent/agent`와 같은 규칙), 샌드박스 설정 실패 처리, `<lithent-live>` 정의 전 프로퍼티, 스킬 `{{VERSION}}`. Warning 4(`updateProps` ack)는 전제가 맞지 않아 반영하지 않음 ("Phase 6 후속" 참고)
  - **Phase 7 (Test Hardening)** — `agent/src/tests/hardening.test.tsx`(19개), `live/src/tests/hardening.test.ts`(22개), base·concurrent 통과. 결함 3건 수정: 승인 중 `reload` 뒤 새 위젯에서 실행, 읽으면 예외가 나는 인자에서 `callTool` reject, 엄격한 호스트 CSP의 시작 타임아웃 힌트. 브라우저 집행 격리는 Chromium 확인 기록 ("Phase 7" 검증 기록)
- **next**:
  1. 사용자 수동 체크: `MANUAL_TEST_CHECKLIST.md`의 `M-1`, `M-2`, `M-5` (`lithent/agent` 1차 릴리스)
  2. Phase 8 (Integration Test): `e2e/agent-ui.spec.ts` — 기존 Playwright 설정(`playwright.config.ts`, `e2e/*.spec.ts`, `pnpm test:e2e`)을 쓴다. 시나리오 1~7(`M-1`~`M-7`), 특히 4번은 Phase 7 Chromium 확인 항목(부모·저장소·쿠키 `SecurityError`, CSP의 `fetch`·이미지·`sendBeacon` 차단, `allowNetwork` 대조, 위젯이 알아낸 채널로 보낸 위조 메시지, 엄격한 호스트 CSP의 `timeout`)을 자동화한다. 전체 저장소 게이트와 수동 체크 기록.
- **blockers**: 없음
- **risks / follow-ups**:
  - 크기 여유: `lithent/agent` 113 B (2,387 / 2,500 B), `lithent/live` 호스트 355 B (5,145 / 5,500 B), 런타임 2,522 B (8,478 / 11,000 B). 호스트에 코드를 더해야 하면 먼저 크기를 재고, 넘으면 `DC-16`·`DC-17`을 다시 연다.
  - srcdoc 문서는 호스트 페이지 CSP를 상속한다: `script-src 'self'` 같은 엄격한 정책에서는 Sandbox 위젯이 시작하지 못한다(`timeout`, 힌트가 CSP 안내). 해결하려면 별도 origin에서 런타임 문서를 내려주는 방식이 필요하며 지금 설계 범위 밖이다 — 문서에 한계로 적혀 있다(`live/README.md` "Limits").
  - `sendBeacon`은 기본 CSP에서 요청 없이 `true`를 돌려준다(브라우저 동작). 위젯 코드가 결과를 믿지 않도록 따로 할 일은 없다.
  - WebMCP `annotations`·`signal` 미반영, 보류한 리뷰 제안 2건(`listTools()` 내부 디스크립터 반환, `agent/package.json` `repository.url`) — Phase 8 이후 후보.
  - 로컬 Node 22 환경: `pnpm` 명령에 `pnpm_config_runtime_on_fail=ignore`, `pnpm test:ci`는 `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs`로 대체, `npm pack`은 `devEngines` 때문에 실패하므로 패킹 확인은 `verify:release`가 만든 tarball로 한다. live 빌드는 `lithent/agent`·`helper`·`ftags`·`tag` dist가 먼저 있어야 한다. Phase 8 `pnpm test:e2e`는 설치된 Chromium(`/opt/pw-browsers`)을 쓴다.
- **latest commit**: `0ad8d82` (Phase 6 후속). Phase 7 변경은 이 기록과 함께 커밋한다.

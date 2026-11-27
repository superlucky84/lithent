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
- [ ] **크기**: `lithentLive.umd.js` brotli **4,536 B > 3,000 B** (`DC-9` 초과, 1,536 B). 종료 조건 항목은 아니지만 Phase 6 크기 게이트를 막으므로 `DESIGN.md` `DC-17`(TBD)로 기록했다. `sandboxRuntime.umd.js` 8,485 / 11,000 B (통과)
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

## Phase 6 — `lithent/live` 배포 연결·스킬·문서·인터랙티브 데모: planned

Refs: RQ-9, RQ-10, RQ-11, RQ-12, DC-1, DC-6, DC-9, DC-10, M-3, M-6, M-7

### 진입 조건
- Phase 5 종료 조건 충족.
- `DESIGN.md` `DC-17`(`lithent/live` 호스트 크기 예산 초과 대응) 결정 — `scripts/size-report.js`에 등재할 예산과, 옵션 B 선택 시 서브패스 추가 여부가 이 결정에 달려 있다. (Phase 5 종료 시 추가)

### 구현 체크리스트
- [ ] 루트 `package.json`: `exports["./live"]`, `exports["./live/runtime"]`, `files`, `build:live`, `build:sequence`, `build:parallel` 제외 목록, `test:satellites`·`test` 연결
- [x] 루트 `vite.config.js` vitest `exclude`에 `live/**` 추가 (Phase 4에서 선반영 — Phase 4 체크리스트 참고)
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
  - **`lithent/agent` (Phase 1~3 + 후속)** — 코어·어댑터·배포 연결·스킬·문서 사이트, `DC-15`·`DC-16` 반영, Phase 1~3 리뷰 반영 (커밋 `c7917de` … `ed97caa`)
  - **Phase 4 (`lithent/live` Sandbox 모드·RPC)** (커밋 `d3c6afe`)
  - **Phase 5 (`lithent/live` Direct 모드·`<lithent-live>`·힌트·리사이즈·테마)** — `mode: 'direct'`(같은 `boot`를 Shadow Root에서, 동적 청크), `defineLiveElement()`(plain Custom Element, light DOM — 설계 편차), 호스트 측 자기 수정 힌트, `ResizeObserver` 자동 높이, `theme` CSS 변수
  - Phase 5 검증: live 테스트 base·concurrent 각 97/97, Chromium에서 높이 맞춤·테마·Direct·요소·실제 오류 힌트 확인, 코어 diff 0줄 (Phase 5 "검증 기록")
- **next**:
  1. 사용자 결정: `DC-17` (`lithent/live` 호스트 4,536 B > 3,000 B: A 예산 상향 / B Direct·요소 서브패스 분리 / C 축소 / D ESM 기본 청크로 측정) — **Phase 6 진입 조건**
  2. 사용자 수동 체크: `MANUAL_TEST_CHECKLIST.md`의 `M-1`, `M-2`, `M-5` (`lithent/agent` 1차 릴리스)
  3. 사용자 결정: Phase 4~5 리뷰(`doc-driven-reviewer-v1`) 여부
  4. Phase 6: 루트 `exports["./live"]`·`["./live/runtime"]`, 빌드·테스트·크기·릴리스 스크립트 등재, README·스킬·문서 사이트·인터랙티브 플레이그라운드
- **blockers**:
  - Phase 6 착수: `DC-17` 결정 필요
- **risks / follow-ups**:
  - `lithent/agent` 크기 여유 126 B (2,374 / 2,500 B). Phase 7 하드닝이 이 안에서 끝나야 한다.
  - Phase 6 `verify-release`: `live/dist`에 해시가 붙은 청크(`boot-*`, `names-*`)가 있으므로 `files`·패킹·소비자 검사에서 청크가 함께 실리는지 확인해야 한다.
  - Direct 모드를 UMD로 쓰려면 `lithentHelper`·`lithentFTags`·`lithentTag`·`lithentAgent` 전역이 필요하다 — Phase 6 README·문서에 명시.
  - srcdoc 문서는 호스트 페이지 CSP를 상속한다 — 엄격한 호스트 CSP에서의 동작은 Phase 7·8에서 확인 (`DESIGN.md` §3.3 구현 메모).
  - `mountLive`는 시작 실패 시 reject하고 핸들을 주지 않는다 — Phase 7 "오류 복구 루프"는 `reload` 실패 → 성공과 `mountLive` 재호출로 검증.
  - 이름 규칙 검사 없음(`DESIGN.md` §2.5), `DC-3` 덮어쓰기 후 이전 인스턴스 미재등록, WebMCP `annotations`·`signal` 미반영, 보류한 리뷰 제안 2건 — Phase 7 검토 후보.
  - 로컬 Node 22 환경: `pnpm` 명령에 `pnpm_config_runtime_on_fail=ignore`, `pnpm test:ci`는 `node --test --experimental-test-isolation=none scripts/tests/*.test.mjs`로 대체. live 빌드는 `lithent/agent`·`helper`·`ftags`·`tag` dist가 먼저 있어야 한다.
- **latest commit**: `d3c6afe` (Phase 4). Phase 5 변경은 이 기록 직후 커밋한다

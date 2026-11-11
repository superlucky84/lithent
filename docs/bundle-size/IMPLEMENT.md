# IMPLEMENT — base 코어 번들 크기 축소

- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 현재 상태는 맨 아래 [상태 / 핸드오프](#상태--핸드오프)에 있다.

## 공통 규칙

- 크기는 `pnpm build:core` 뒤의 `pnpm size`(= `scripts/size-report.js`)로 잰다. 저장돼 있던 `dist`가 아니라 **지금 소스를 다시 빌드한 값**만 적는다.
- 단계마다 raw / gzip(level 9) / Brotli를 함께 적는다. 건별 수치를 더해서 예측하지 않는다.
- 사본 빌드로 후보를 비교할 때는 [`experiments/core-size/measure.mjs`](../../experiments/core-size/README.md)를 쓴다. 작업 트리의 `dist`를 건드리지 않는다.
- 성능 측정 중에는 빌드·테스트·다른 측정을 돌리지 않는다([performance-improvement의 공통 실행 규칙](../performance-improvement/IMPLEMENT.md#공통-실행-규칙)).
- 커밋은 사용자가 요청할 때만 한다.

## Phase 0 — 문서·브랜치·기준선: done

Refs: RQ-8, DC-6

진입: `main`이 깨끗하고 `origin/main`과 같다(`6639195`).

- [x] `perf/core-size` 브랜치를 `main`에서 만든다.
- [x] `docs/bundle-size/`에 네 문서를 만든다.
- [x] 기준선을 다시 빌드해 확인한다: base UMD 12,827 / 5,289 / 4,901B. 사본 빌드의 UMD·CJS가 `dist`와 byte가 같다.
- [x] 측정 도구를 `experiments/core-size/`에 둔다.

종료: 문서 네 개가 서로 맞고, 기준선 수치가 재현된다.

Files:

- `docs/bundle-size/REQUIREMENTS.md` (added)
- `docs/bundle-size/DESIGN.md` (added)
- `docs/bundle-size/IMPLEMENT.md` (added)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (added)
- `experiments/core-size/README.md` (added)
- `experiments/core-size/measure.mjs` (added)
- `experiments/core-size/ast-equal.mjs` (added)
- `docs/benchmark/BUNDLE_SIZE_RESULTS.md` (modified)

## Phase 1 — Terser 출력 옵션: done

Refs: RQ-1, RQ-3, DC-1

진입: Phase 0 완료.

- [x] `vite.config.js`의 UMD 후처리에 `format: { wrap_func_args: false }`를 넣고 주석을 지금 동작에 맞게 고친다.

기준 검사: `pnpm build:core`, `pnpm size`, 새 UMD와 Phase 0 UMD의 AST 대조(`experiments/core-size/ast-equal.mjs`), UMD 끝의 `sourceMappingURL` 주석.

종료: AST가 같고 Brotli가 조사값(4,878B)과 같다.

결과 (2026-11-11, 작업 트리):

- base UMD **12,755 / 5,272 / 4,878B**(−23B). guard 여유 75B.
- Phase 0 UMD와 AST가 같다(함수 172개, `same tree`). CJS와 ESM은 Phase 0과 byte가 같다.
- UMD 끝의 `//# sourceMappingURL=lithent.umd.js.map`이 그대로 있다.

Files:

- `vite.config.js` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)

## Phase 2 — 작은 소스 정리 S-1~S-15: done

Refs: RQ-1, RQ-2, RQ-5, RQ-6, DC-2, DC-7

진입: Phase 1 완료.

- [x] S-1~S-15를 적용한다([DESIGN의 표](./DESIGN.md#작은-소스-정리-dc-2)).
- [x] S-15에서 더 이상 쓰이지 않는 `isComponentMapManualMode`를 지웠다(저장소 안에 다른 사용처가 없다). S-10에서 `bindRedraw`의 주석이 가리키던 `setRedrawAction` 언급을 고쳤다.

기준 검사: `pnpm build:core`(tsc·ESLint 포함), `pnpm test:core`, `pnpm test:concurrent`, `pnpm size`, UMD export 이름 대조.

종료: 검사가 모두 통과하고 크기가 Phase 1보다 줄었다.

결과 (2026-11-11, 작업 트리):

- base UMD **12,532 / 5,194 / 4,812B**(기준 대비 −89B). guard 여유 141B.
- `pnpm build:core`(tsc·ESLint), `tsc --noEmit`, ESLint, `git diff --check` 통과.
- core `vitest run` 74파일 473개, `pnpm test:concurrent` 74파일 376개 + helper 8개 통과.
- UMD·CJS export 21개가 Phase 0과 같다. ESM export 21개.
- 출력의 함수 172 → 160개. 줄어든 12개는 옮기거나 지운 함수와 일치한다: `rootDelete`, `updateText`, `checkNeedPushQueue`, `useUpdated`의 기본 인자, `removeItem`, `schedule`, `setComponetRef`, 조상 걷기의 중첩 함수, `initUpdateHookState`, `checkFragmentFunction`, `checkRefData`, `isComponentMapManualMode`. 독립 parent getter(`e=>()=>e`)는 그대로다.

Files:

- `src/wDom.ts` (modified)
- `src/render.ts` (modified)
- `src/hook/internal/unmount.ts` (modified)
- `src/hook/internal/useUpdate.ts` (modified)
- `src/utils/predicator.ts` (modified)
- `src/utils/redraw.ts` (modified)
- `src/utils/universalRef.ts` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)

## Phase 3 — 함수 합치기 후보 H-1~H-6: done (채택은 DC-3 대기)

Refs: RQ-1, RQ-4, RQ-5, DC-3

진입: Phase 2 완료.

- [x] H-1~H-6을 적용한다([DESIGN의 표](./DESIGN.md#함수-합치기-후보-dc-3)). 채택이 아니라 후보다.
- [x] H 묶음만 담은 patch를 [`experiments/core-size/h-candidates.patch`](../../experiments/core-size/h-candidates.patch)에 둔다. `git apply -R`로 빼면 Phase 2의 UMD와 byte가 같아진다(확인함).

기준 검사: Phase 2와 같다. 추가로 출력의 함수 수와 parent getter 형태를 Phase 2 출력과 비교해 적는다.

종료: 검사가 통과한다. 채택 여부(DC-3)는 Phase 5의 성능 확인 뒤에 정한다.

결과 (2026-11-11, 작업 트리):

- base UMD **12,402 / 5,134 / 4,763B**(기준 대비 −138B). guard 여유 190B.
- concurrent UMD 17,991 / 7,257 / 6,696 → **17,909 / 7,228 / 6,667B**(−29B, 공유 모듈의 S 변경분). element 968B 그대로.
- `pnpm build:core`, `tsc --noEmit`, ESLint, `git diff --check` 통과.
- core `vitest run` 74파일 473개, `pnpm test:concurrent` 376개 + 8개, `pnpm test:satellites`(helper 51, devHelper 11, ftags 10, SSR 15, element 86 + 제외 3) 통과.
- UMD·CJS export 21개가 Phase 0과 같다. 세 형식 끝에 `sourceMappingURL` 주석이 있다.
- 출력의 함수 160 → 155개. 줄어든 5개는 `inheritPropForRender`, `remakeChildrenForDiff`, `syncResolverProps`, `getWDomType`, `generalize`다. 독립 parent getter는 그대로다.
- jsdom smoke(keyed 목록 추가·역순·삭제·비우기·dispose): Phase 0·1·2·3 UMD의 DOM 출력이 모두 같다.
- **하지 않은 것:** 성능 측정, `pnpm test:e2e`, 전체 `pnpm build`, `pnpm verify:concurrent`, `pnpm verify:release`, satellites의 concurrent 쪽(`test:satellites:concurrent`). Phase 5에서 한다.

Files:

- `src/diff.ts` (modified)
- `src/render.ts` (modified)
- `experiments/core-size/h-candidates.patch` (added)
- `experiments/core-size/README.md` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)
- `docs/bundle-size/REQUIREMENTS.md` (modified)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (modified)

## Phase 4 — Test Hardening: TBD

Refs: RQ-2, RQ-5, DC-2, DC-3

진입: Phase 3 완료, 사용자가 진행을 정함.

- [ ] H-1의 배치 패스를 직접 겨냥하는 회귀 테스트: 끝 추가 구간 앞에서 만든 자식 + 이동(LIS 밖) + 유지가 섞인 keyed 목록, portal이 낀 경우, 추가만 있고 이동이 없는 경우. 기존 테스트가 이미 덮는 조합은 근거를 적고 생략한다.
- [ ] S-1: 문자열·Fragment·컴포넌트가 아닌 태그(잘못된 입력)의 기존 동작(element로 만든다)을 고정하는 테스트.
- [ ] S-2: 조상 순환이 있을 때 걷기가 끝나는지(기존 `Set` 검사) 확인하는 테스트가 있는지 보고, 없으면 추가한다.
- [ ] 변경 전(1.25.8 배포본)과 변경 후 UMD를 같은 jsdom 시나리오로 돌려 DOM·lifecycle 로그·export를 대조한다([bundle-size-recheck의 도구](../../experiments/bundle-size-recheck/README.md) 재사용).

기준 검사: `pnpm test:core`, `pnpm test:concurrent`.

종료: 추가한 테스트가 변경 전 코드에서도 통과한다(동작 고정이므로).

## Phase 5 — Integration Test와 채택 판단: TBD

Refs: RQ-1, RQ-4, RQ-6, RQ-7, DC-3, DC-4, DC-5, DC-7

진입: Phase 4 완료.

- [ ] 전체 회귀: `pnpm build`, `pnpm test:dual`, `pnpm test:e2e`, `pnpm verify:concurrent`, `pnpm verify:release`, `git diff --check`.
- [ ] `pnpm size`: base·concurrent·element 세 값과 여유를 적는다.
- [ ] 성능 선별(비공식): `experiments/memo-free-rows/measure.mjs`로 등재 앱(`a-cache`)에 main 코어와 후보 코어(S만 / S+H)를 붙여 비교한다.
- [ ] 성능 확인(공식): Mac 공식 러너. `experiments/memo-free-rows/official-prepare.mjs`에 `a-main=a:main a-size=a:WORKTREE`를 주고 CPU·메모리 짝수 회차를 모은다. 실행 시점과 회차 수는 사용자와 정한다(기계를 통째로 쓴다).
- [ ] DC-3 결정: H 묶음 채택 또는 되돌림. 되돌리면 크기를 다시 잰다.
- [ ] DC-4 결정: guard 하향 값. 정하면 `scripts/size-report.js`를 고친다.
- [ ] DC-5 결정: Terser 플러그인 제거 여부.
- [ ] MANUAL_TEST_CHECKLIST의 M-1~M-6을 채운다.

종료: 전체 회귀가 통과하고, 열린 결정이 닫히거나 사유와 함께 남는다.

## 상태 / 핸드오프

- done (2026-11-11): Phase 0~3. base UMD Brotli 4,901 → 4,878(①) → 4,812(②) → **4,763B**(③ 후보 포함). concurrent 6,696 → 6,667B. 조사값과 구현 뒤 값이 모든 단계에서 같다.
- validation (작업 트리): `pnpm build:core`(tsc·ESLint), core 74파일 473개, concurrent 376 + 8개, base satellites, `pnpm size`, export 21개 대조, Phase 1의 AST 동일, jsdom smoke. 성능·E2E·전체 build·release 검증은 하지 않았다.
- open: DC-3(H 묶음 채택 — 성능 확인 필요), DC-4(guard 하향), DC-5(Terser 플러그인 제거).
- next: 사용자가 Phase 1~3 변경의 리뷰 또는 Phase 4(Test Hardening) 진행을 정한다. 그 뒤 Phase 5에서 전체 회귀와 성능을 확인하고 DC-3·DC-4·DC-5를 닫는다. H를 빼려면 `git revert eccd6e5`(또는 `git apply -R experiments/core-size/h-candidates.patch`) 뒤 `pnpm build:core && pnpm size`(4,812B가 나와야 한다).
- blockers: 없음. 공식 러너 측정은 기계를 통째로 쓰므로 실행 시점을 사용자와 정한다.
- commit: 기준 `main` `6639195`. 브랜치 `perf/core-size`. `e5dfab1`(Phase 1, build) → `a8c10ec`(Phase 2, S) → `eccd6e5`(Phase 3, H 후보) → 그 위의 `docs:` 커밋(이 문서와 도구). H만 빼려면 `git revert eccd6e5`다. push하지 않았다.

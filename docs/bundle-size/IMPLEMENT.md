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

## Phase 3.5 — 로컬 성능 선별: done

Refs: RQ-4, DC-3

U-4로 Phase 4보다 먼저 했다. Phase 5의 "성능 선별" 항목을 앞당긴 것이다.

진입: Phase 1~3을 나눠 커밋했다(`e5dfab1`, `a8c10ec`, `eccd6e5`).

- [x] 등재 앱(`experiments/memo-free-rows/apps/a-cache.tsx`)에 세 코어를 붙였다: main(`6639195`의 `dist/lithent.mjs`), S(`a8c10ec`), S+H(`eccd6e5`). helper는 같은 `lithentHelper.mjs`다.
- [x] `experiments/memo-free-rows/measure.mjs`로 두 세션, 세션마다 항목·앱당 40표본(합 80), 메모리 3회를 쟀다. 두 세션은 앱 순서를 반대로 줬다. 벤치마크의 CSS를 붙였다.
- [x] [`experiments/core-size/speed-summary.py`](../../experiments/core-size/speed-summary.py)로 두 세션을 합쳐 중앙값 비와 95% bootstrap 구간을 냈다. 요약은 [local-speed-check.json](./local-speed-check.json)이다.

결과 (2026-11-11, Apple M4 Pro, Node 24.22.1, Playwright Chromium 153.0.8010.12). main 대비 가중 기하평균:

| 코어 | script (JS)           | total (script + 강제 layout) | 1,000행 heap    | 1만 행 heap       |
| ---- | --------------------- | ---------------------------- | --------------- | ----------------- |
| S    | −0.31% [−1.25, +0.52] | +0.35% [−0.89, +1.14]        | 3.605 → 3.602MB | 18.722 → 18.720MB |
| S+H  | −0.23% [−1.30, +0.66] | +0.39% [−0.85, +1.17]        | 3.605 → 3.596MB | 18.722 → 18.720MB |

- **판단: 성능 하향이 없다.** 가중 전체의 구간이 script·total 모두 0을 포함하고 폭이 ±1.3% 안이다. H를 더한 효과(S+H / S)는 script +0.09%, total +0.05%로 구분되지 않는다.
- 구간이 0을 벗어난 항목은 빨라진 쪽뿐이다: script의 append 1k(S −0.90%, S+H −1.97%), create 10k(S −0.51%).
- update every 10th의 total 중앙값이 두 세션 모두 +4.5%로 보였지만(구간 −1.6~+9.1%) 실제 이동이 아니다. 이 항목의 layout 시간은 10~15ms에 넓게 퍼져 있고 분위수(q10 10.8/10.7/10.8, q25 11.1/11.3/11.3, q75 13.3/13.4/13.2ms)와 평균(12.34 / 12.55 / 12.34ms)이 세 코어에서 같다. script 평균도 3.09 / 3.06 / 3.07ms로 같다. 바뀐 코드가 이 경로에서 하는 DOM 쓰기도 그대로다(텍스트 노드의 `nodeValue` 대입).
- 한계: 공식 러너가 아니다. 페이지 안에서 잰 script와 강제 layout이며 paint는 없다. 측정 중 load average가 2~7로 기계가 한가하지 않았다. 앱 순서를 회차마다 바꾸고 두 세션의 순서를 뒤집어 상쇄했지만, ±1% 안쪽의 차이는 이 측정으로 가릴 수 없다.
- 원자료(두 세션의 JSON·표, 세 번들과 코어, load 기록)는 `docs/benchmark/core-size-local-speed-evidence.tar.gz`에 있다(gitignore 대상, 업로드하지 않음; SHA-256 `3054dc9f023d4648b05e54577e3943e898320f10078490dace5206dae31ec385`).

Files:

- `experiments/core-size/speed-summary.py` (added)
- `docs/bundle-size/local-speed-check.json` (added)
- `docs/bundle-size/IMPLEMENT.md` (modified)

## Phase 4 — Test Hardening: done

Refs: RQ-2, RQ-5, DC-2, DC-3

진입: Phase 3 완료, 로컬 성능 선별에서 하향이 없다(U-4).

- [x] H-1의 배치 패스: `src/tests/core-placementPass.test.tsx` 9개. 고정 형제 사이의 keyed 목록에서 ① 끝 추가 구간 앞 생성 + 이동 + 유지 + 끝 추가, ② 이동 없이 앞쪽 생성만, ③ 끝 추가만(다음 형제 앞에 들어가는지), ④ 빈 목록 채우기와 비우기, ⑤ 생성 없는 이동과 역순, ⑥ 삭제·이동·생성 동시, ⑦ 태그가 바뀐 자식의 교체 + 이동, ⑧ fragment를 그리는 keyed 컴포넌트의 이동, ⑨ 자리가 바뀌는 portal. 최종 순서, 노드 동일성, `MutationObserver`로 본 "건드리지 않은 노드"를 확인한다.
- [x] S-1: `src/tests/core-nodeKinds.test.tsx` 5개. 문자열 태그(props 기본값 포함), `h(Fragment, …)`(자식 유무, 부모 연결, 그리기), redraw 밖에서 만든 컴포넌트 노드, 문자열도 함수도 아닌 태그는 element로 만든다는 기존 동작.
- [x] S-2: 새 테스트를 추가하지 않았다. 조상 `compChild` 동기화는 `core-childrentest.tsx`의 3개(자식 renew 뒤 부모 renew, 반복, slot children)가 덮는다. 순환은 공개 API로 만들 수 없어서 `Set` 검사를 직접 겨냥한 테스트는 두지 않았다. 검사 자체는 코드에 그대로 있다.
- [x] UMD 대조: `experiments/bundle-size-recheck/umd-diff.cjs`로 `6639195`의 UMD와 Phase 1·2·3 UMD를 비교했다. DOM 스냅샷 9개, lifecycle 로그 23개, 예외, export가 모두 같다.
- [x] 새 테스트의 검출력: 사본에 결함을 넣어 확인했다. 배치 패스 생략(생성만 있을 때), 이동 미배치, portal 대상 삽입, 끝 추가 구간을 `appendChild`로, `h(Fragment)`의 자식 누락 — 5개 모두 실패로 잡혔다.

기준 검사: `pnpm test:core`, `pnpm test:concurrent`.

종료: 추가한 테스트가 변경 전 코드에서도 통과한다(동작 고정이므로).

결과 (2026-11-11, 작업 트리, `5fb08a2` 위):

- 새 테스트 14개가 **변경 전 소스(`6639195`)에서도 14개 모두 통과**한다. concurrent 코어에서도 통과한다.
- core `vitest run` 76파일 487개, `pnpm test:concurrent` 76파일 390개 + helper 8개, `tsc --noEmit`, ESLint, `git diff --check` 통과.
- 런타임 소스는 바꾸지 않았다. 크기는 Phase 3과 같다(4,763B).

Files:

- `src/tests/core-placementPass.test.tsx` (added)
- `src/tests/core-nodeKinds.test.tsx` (added)
- `experiments/core-size/README.md` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)
- `docs/bundle-size/REQUIREMENTS.md` (modified)
- `docs/bundle-size/DESIGN.md` (modified)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (modified)

## Phase 5 — Integration Test와 채택 판단: done

Refs: RQ-1, RQ-4, RQ-6, RQ-7, DC-3, DC-4, DC-5, DC-7

진입: Phase 4 완료.

- [x] 전체 회귀: `pnpm build`, `pnpm test:dual`, `pnpm test:e2e`, `pnpm verify:concurrent`, `pnpm verify:release`, `git diff --check`.
- [x] `pnpm size`: base·concurrent·element 세 값과 여유를 적는다.
- [x] 성능 선별(비공식): Phase 3.5에서 했다. 하향 없음.
- [x] 성능 확인(공식): 이 Phase에서는 하지 않았다(U-6). 뒤에 사용자가 요청해 [Phase 6](#phase-6--mac-공식-러너-확인-done)에서 했다(U-7).
- [x] DC-3 결정: H 묶음을 채택한다(U-6). 크기는 4,763B 그대로다.
- [x] DC-4 결정: guard 4,953 → 4,800B. `scripts/size-report.js`에서 allowance 세 개를 없애고 예산을 4,800B 하나로 적었다.
- [ ] DC-5 결정: 이번에는 넣지 않았다. 사용자 결정이 없어 후속으로 남긴다.
- [x] MANUAL_TEST_CHECKLIST: M-1~M-4는 통과로 채웠다. M-5는 선별 결과와 미실행 사유를, M-6은 자동 부분의 결과를 적고 체크하지 않았다.

종료: 전체 회귀가 통과하고, 열린 결정이 닫히거나 사유와 함께 남는다.

결과 (2026-11-11, `eccd6e5`의 소스 + 작업 트리의 Phase 4 테스트):

| 검사                     | 결과                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `pnpm build`             | 성공. ESLint 경고 1건은 손대지 않은 `lithentConcurrent/helper/src/tests/deferred.tsx`의 기존 경고다. |
| `pnpm size`              | base 12,402 / 5,134 / **4,763B**(여유 190B), concurrent 17,909 / 7,228 / 6,667B, element 968B        |
| `pnpm test:dual`         | 1,234개 통과 / 3개 제외. core 487, concurrent 390 + 8, satellites 173 + 176                          |
| `pnpm test:e2e`          | 90개 통과(Chromium, base·concurrent). UMD를 쓰는 CSP fixture와 `parent-retention` 포함               |
| `pnpm verify:concurrent` | 7항목 ALL PASS                                                                                       |
| `pnpm verify:release`    | 8개 패키지 ALL PASS(설치 소비자, Node16/NodeNext ESM·CJS 선언). 아래 주의 참고                       |
| `git diff --check`       | 통과                                                                                                 |

- `pnpm verify:release`는 처음에 `Artifact target escapes package or is not a file: ./dist/lithent.cjs`로 실패했다. 이 Mac의 기본 임시 폴더가 symlink(`/var` → `/private/var`)인데 `scripts/artifact-utils.mjs`의 `safeFile`이 root는 그대로 두고 대상만 realpath로 비교하기 때문이다. 이번 변경과 무관한 기존 동작이다. 실제 경로인 `TMPDIR`을 주고 다시 실행해 통과했다. 스크립트 수정은 범위 밖이라 하지 않았다.
- Firefox·WebKit E2E는 돌리지 않았다(`pnpm test:e2e`의 기본 프로젝트만). CI의 Validate가 세 엔진을 돈다.
- guard 반영 뒤(2026-11-11): `pnpm size`가 base 4,763 / 4,800B(여유 37B)로 통과한다. `pnpm test:ci`(scripts의 fixture 49개)도 통과했다. 이것도 `verify:release`와 같은 이유로 실제 경로인 `TMPDIR`이 필요했다(기본 값에서는 7개가 같은 오류로 실패).
- 남는 것: DC-5(후속), M-5의 공식 러너(이 시점에는 하지 않기로 함 → Phase 6에서 실행), M-6의 사람이 하는 확인.

Files:

- `scripts/size-report.js` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)
- `docs/bundle-size/DESIGN.md` (modified)
- `docs/bundle-size/REQUIREMENTS.md` (modified)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (modified)

## Phase 6 — Mac 공식 러너 확인: done

Refs: RQ-4, DC-3, M-5

U-7로 했다. Phase 5에서 하지 않고 남겼던 "성능 확인(공식)"이다.

진입: Phase 5 완료. 비교할 세 코어가 커밋으로 있다(`6639195`, `a8c10ec`, `eccd6e5`).

- [x] `experiments/memo-free-rows/official-prepare.mjs`로 등재 앱(`a`)에 세 코어를 붙였다: `a-main=a:main`, `a-s=a:a8c10ec`(S), `a-sh=a:eccd6e5`(S+H). 벤치마크 checkout은 `fdee29a2`다.
- [x] `official-run.mjs gate`: 공식 keyed 검사와 DOM·폰트 시나리오 9개를 세 앱 모두 통과했다.
- [x] `official-run.mjs cpu-1 cpu-2 cpu-3 cpu-4 mem-1 mem-2`: CPU 4회차(회차마다 앱·항목당 15표본, select 25표본)와 메모리 2회차(3표본)를 모았다. 회차마다 앱 순서를 뒤집는다. 22:33~23:40 KST, 66분. 오류·재시도 없이 끝났다.
- [x] `official-analyze.py`(trace 1,740개 검사)와 `official-weighted-ci.py`로 분석했다. 요약은 [official-speed-check.json](./official-speed-check.json)이다.

종료: M-5의 통과 기준으로 판정한다.

결과 (2026-11-11, Apple M4 Pro, Chrome 157.0.8103.51, Node 24.22.1). 가중 기하평균의 변화와 95% bootstrap 구간:

| 비교       | total                 | script (JS)               | active                |
| ---------- | --------------------- | ------------------------- | --------------------- |
| S / main   | −0.62% [−1.58, +0.23] | −0.59% [−1.48, +0.34]     | −0.33% [−0.98, +0.28] |
| S+H / main | −0.31% [−1.38, +0.76] | **−1.64% [−2.66, −0.62]** | −0.58% [−1.24, +0.05] |
| S+H / S    | +0.32% [−0.62, +1.30] | −1.07% [−2.02, −0.06]     | −0.26% [−0.89, +0.36] |

- **판정: 성능 하향이 없다. M-5 통과, H 묶음(`eccd6e5`) 유지.** 세 비교 모두 total의 구간이 0을 포함하고, S+H는 script가 구간째로 줄었다. 회차별 가중 total(S+H / main)은 +0.04 / +0.31 / −0.85 / +0.11%로 한쪽으로 쏠리지 않는다.
- 구간이 0을 벗어난 항목은 select의 total 하나를 빼면 모두 빨라진 쪽이다.
  - replace 1k (S+H): total 27.48 → 26.81ms, **−2.41% [−3.29, −1.75]**, script 8.42 → 7.78ms(−7.54% [−8.54, −6.17]). 4회차 모두 −2.2~−3.4%다. S만으로는 +0.21%라서 H에서 온 것이다(S+H / S −2.62% [−3.53, −1.83]). 원인은 따로 분석하지 않았다. 로컬 선별(Phase 3.5)에서는 보이지 않았던 차이다.
  - create 10k (S+H): total −0.45% [−0.73, −0.16], script −2.77%. S만으로도 script −2.05% [−2.80, −1.75].
  - append 1k (S+H): script −1.72% [−2.49, −0.84], total은 +0.00%.
- select의 total은 프레임 대기가 만든다(DC-28, [SELECT_VSYNC_PHASE](../benchmark/SELECT_VSYNC_PHASE.md)). total은 main 5.64 / S 5.20 / S+H 6.09ms로 S −7.8%, S+H +8.0%(S+H / S는 +17.1% [+0.2, +36.3])로 갈리지만, 중앙값 대기가 0.49 / 0.00 / 0.58ms로 다르기 때문이다. 대기를 뺀 active는 5.00 / 4.87 / 4.96ms이고 S+H / main −0.69% [−5.40, +4.38], S+H / S +1.82% [−1.13, +5.48], script는 2.01 / 2.01 / 2.03ms다. 실제 일의 차이로 볼 근거가 없다.
- 다른 항목에서 total +3%를 넘는 것은 없다. 가장 큰 증가는 update every 10th의 S+H / S +1.82% [−1.91, +3.75]다(S+H / main +0.62%).
- 메모리(MB, main → S → S+H): ready 0.646 → 0.645 → 0.647, run 1k 3.573 → 3.592 → 3.588, update 3.647 → 3.641 → 3.635, run-clear 0.932 → 0.925 → 0.928, run 10k 28.156 → 28.163 → 28.163. 모두 ±1% 안이다(가장 큰 증가는 run 1k의 S +0.54%, 가장 큰 감소는 run-clear의 S −0.75%).
- 공식 앱 번들(raw / Brotli): 15,106 / 5,925 → 14,899 / 5,840(S) → 14,764 / 5,796B(S+H). Brotli −129B.
- 한계: 한 세션이다. 구간은 회차 안의 표본을 다시 뽑은 것이라 세션 간 차이는 들어 있지 않다. 1분 load average는 cpu-1 시작 때(gate 직후) 5.5였고 그 뒤 회차는 1.2~3.1이었다. S는 Terser 옵션(Phase 1)을 포함한 `a8c10ec`인데, 앱은 ESM을 다시 묶으므로 그 옵션은 이 비교에 영향이 없다.
- 원자료(trace, 회차별 결과, 세 앱 번들과 소스, 도구 사본, 분석 출력)는 `docs/benchmark/core-size-official-20261111-evidence.tar.gz`에 있다(82MB, gitignore 대상, 업로드하지 않음; SHA-256 `22f74a4699eee7aa0edd3f8d11e6c46ba9faf4085572ad428c9f7be642a5082c`).

Files:

- `docs/bundle-size/official-speed-check.json` (added)
- `docs/bundle-size/IMPLEMENT.md` (modified)
- `docs/bundle-size/DESIGN.md` (modified)
- `docs/bundle-size/REQUIREMENTS.md` (modified)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (modified)
- `experiments/core-size/README.md` (modified)

## Phase 7 — 1.25.9 릴리스 준비: done

Refs: RQ-1, RQ-2, RQ-6, RQ-7, M-7

U-8로 했다.

진입: Phase 6 완료. Phase 3.5~6의 변경을 나눠 커밋했다(`9c27d35` 테스트, `3c68596` guard, `3f747f2` 측정 기록).

- [x] root `package.json`의 version을 1.25.8 → 1.25.9로 올렸다. 동작과 공개 API가 같아 패치다. 다른 패키지의 버전은 그대로다.
- [x] `lithent-concurrent`는 0.2.6을 유지한다. 공유 모듈의 정리(DC-7)는 Concurrent를 다시 빌드하면 6,696 → 6,667B로 반영되지만 이번 발행 대상이 아니다. 사유를 [RELEASING](../../RELEASING.md#1259-릴리스)에 적었다.
- [x] [CHANGELOG](../../CHANGELOG.md#2026-11-11)에 1.25.9 항목을, RELEASING에 1.25.9 절을 추가했다.
- [x] 후보 검증(아래 표).
- [x] 브랜치를 push하고 PR을 열었다. 병합과 발행은 하지 않았다.

종료: 후보가 검증을 통과하고 release plan이 `lithent@1.25.9` 하나만 고른다.

결과 (2026-11-11, `3f747f2` + 버전 변경, Node 24.22.1):

| 검사                                                   | 결과                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `pnpm build`                                           | 성공                                                                                     |
| `pnpm size`                                            | base 12,402 / 5,134 / **4,763B** / 4,800B(여유 37B), concurrent 6,667B, element 968B     |
| `pnpm test:dual`                                       | 1,234개 통과 / 3개 제외                                                                  |
| `pnpm test:e2e`                                        | 90개 통과(Chromium, base·concurrent)                                                     |
| `pnpm test:ci`                                         | 통과                                                                                     |
| `pnpm verify:concurrent`                               | ALL PASS                                                                                 |
| `pnpm verify:release --output-dir artifacts/release`   | 8개 패키지 ALL PASS. `lithent-1.25.9.tgz`를 만들었다                                     |
| `pnpm release:plan --allow-dirty`                      | `lithent` 1.25.9만 `version-increased-and-unpublished`. 나머지 7개는 `already-published` |
| `node scripts/verify-plan-consumers.mjs --allow-dirty` | PASS: `lithent@1.25.9`(선택 archive + registry 의존성)                                   |

- release plan은 `lithent-concurrent`에 "Source paths changed but this version will not be published" 경고를 냈다. 위에 적은 대로 알고 둔 것이다.
- plan과 소비자 검사는 커밋 전 작업 트리에서 `--allow-dirty`로 돌린 미리보기다. 발행 근거는 main의 수동 Validate run이 만든다.
- `verify:release`·`test:ci`는 실제 경로인 `TMPDIR`을 주고 돌렸다(Phase 5의 주의와 같다).
- Firefox·WebKit E2E는 PR의 CI가 돈다.

Files:

- `package.json` (modified)
- `CHANGELOG.md` (modified)
- `RELEASING.md` (modified)
- `docs/bundle-size/IMPLEMENT.md` (modified)
- `docs/bundle-size/REQUIREMENTS.md` (modified)
- `docs/bundle-size/MANUAL_TEST_CHECKLIST.md` (modified)

## 상태 / 핸드오프

- done (2026-11-11): Phase 0~7. base UMD Brotli 4,901 → 4,878(①) → 4,812(②) → **4,763B**(③). concurrent 6,696 → 6,667B. guard 4,953 → 4,800B(여유 37B). 성능은 로컬 선별과 Mac 공식 러너(CPU 4회차·메모리 2회차) 모두에서 S·S+H가 main 대비 하향이 없다. 공식 러너의 S+H / main은 가중 total −0.31% [−1.38, +0.76], script −1.64% [−2.66, −0.62]이고 replace 1k가 −2.4% 빨라졌다. 회귀 테스트 14개를 추가했다. 전체 회귀(build, dual 1,234개, E2E 90개, verify:concurrent, verify:release, test:ci)가 통과했다. `lithent` 1.25.9로 릴리스를 준비했다(버전·CHANGELOG·RELEASING, 후보 검증 통과).
- decisions (2026-11-11 사용자): hidden source map 제외(U-2), guard 4,800B(U-6), H 묶음 유지(U-6), 공식 러너도 확인(U-7 — 결과가 H 유지를 뒷받침한다), 코어 버전을 올려 배포(U-8 — `lithent` 1.25.9, Concurrent는 0.2.6 유지).
- validation: Phase 5·6·7 표. M-1~M-5 통과. M-6은 자동 부분만 했다. M-7(발행 확인)은 병합 뒤에 한다.
- open: DC-5(Terser 플러그인 제거 — 후속 주제, 사용자 결정 없음).
- next: PR의 CI(세 브라우저 포함)가 통과하면 merge commit으로 main에 병합한다. 그다음 main을 대상으로 Validate를 수동 실행해 발행하고, npm의 1.25.9·태그·문서 배포를 확인해 M-7과 RELEASING에 기록한다. H를 빼야 하면 `git revert eccd6e5` 뒤 guard도 다시 정한다(H 없이는 4,812B로 4,800B를 넘는다).
- blockers: 없음.
- note: `pnpm verify:release`와 `pnpm test:ci`는 이 Mac의 기본 `TMPDIR`(symlink 경로)에서 `Artifact target escapes package`로 실패한다. `scripts/artifact-utils.mjs`의 `safeFile`이 대상만 realpath로 비교하기 때문이며 이번 변경과 무관하다. 실제 경로인 `TMPDIR`을 주면 통과한다. 별도 수정 후보다.
- commit: 기준 `main` `6639195`. 브랜치 `perf/core-size`. `e5dfab1`(Phase 1, build) → `a8c10ec`(Phase 2, S) → `eccd6e5`(Phase 3, H) → `5fb08a2`(docs·도구) → `9c27d35`(Phase 4 테스트) → `3c68596`(guard) → `3f747f2`(Phase 3.5·5·6 기록) → 릴리스 준비 커밋(이 문서가 들어 있는 `chore: prepare lithent 1.25.9 release`). push했고 PR을 열었다. 병합·발행·태그는 하지 않았다.

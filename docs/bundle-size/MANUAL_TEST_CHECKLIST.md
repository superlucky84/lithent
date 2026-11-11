# MANUAL_TEST_CHECKLIST — base 코어 번들 크기 축소

- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 각 항목에는 커밋 SHA(또는 "작업 트리"), 명령, 기대값과 실제값을 적는다. 실행하지 않은 항목은 사유를 적고 체크하지 않는다.
- 최종 판정은 Phase 5에서 한다. 그 전 Phase의 결과는 중간 기록으로 적는다.
- 중간 기록(2026-11-11, 작업 트리, Phase 3 종료): M-1의 크기 4,763B·세 형식의 `sourceMappingURL` 주석, M-2의 export 21개 동일, M-3의 getter 유지와 함수 172 → 155개(옮긴 17개와 일치)를 확인했다. 선언 산출물 대조·전체 회귀·성능·브라우저 smoke는 아직 하지 않았으므로 어느 항목도 체크하지 않는다. 근거는 [IMPLEMENT Phase 1~3](./IMPLEMENT.md).
- 중간 기록(2026-11-11, Phase 3.5·4): M-5의 선별 단계(로컬, 비공식)에서 S와 S+H 모두 main 대비 가중 전체의 95% 구간이 0을 포함했고 heap은 같거나 0.2% 작았다. 공식 러너 판정은 하지 않았으므로 M-5는 체크하지 않는다. 근거는 [IMPLEMENT Phase 3.5](./IMPLEMENT.md#phase-35--로컬-성능-선별-done)와 [local-speed-check.json](./local-speed-check.json).

## 크기와 산출물

- [x] **M-1 — RQ-1, RQ-3, RQ-7, DC-1, DC-4.** `pnpm build:core && pnpm size`.
  - 통과: base UMD Brotli가 4,857B 이하이고 guard 안이다. `dist/lithent.umd.js`·`lithent.cjs`·`lithent.mjs` 끝에 `sourceMappingURL` 주석이 있고 `.map` 파일이 있다. 세 UMD(base·concurrent·element)가 모두 "not built"가 아니다.
  - 실패: 크기 증가, 주석 누락, 저장돼 있던 `dist`로 잰 값.
  - 결과(2026-11-11, `eccd6e5` 소스, `pnpm build` 직후): base 12,402 / 5,134 / **4,763B**(guard 4,953B, 여유 190B), concurrent 17,909 / 7,228 / 6,667B(여유 2,333B), element 968B(여유 32B). 세 형식 끝의 `sourceMappingURL` 주석과 `.map` 파일이 있다. 이 시점의 guard는 4,953B였다.
  - 결과(2026-11-11, DC-4 반영 뒤): guard를 4,800B로 내렸고 `pnpm size`가 base 4,763 / 4,800B(여유 37B)로 통과한다.
- [x] **M-2 — RQ-2, DC-2.** 공개 계약 대조.
  - 통과: UMD·CJS·ESM의 export 이름 21개가 1.25.8 배포본과 같다. `dist`의 `.d.ts`에서 공개 타입이 바뀌지 않았다(`git diff`로 선언 산출물 비교 또는 `pnpm verify:release`의 타입 소비자 통과).
  - 실패: export 추가·삭제·이름 변경, 선언 변화.
  - 결과(2026-11-11): UMD·CJS export 21개가 `6639195`의 빌드와 같고 ESM도 21개다. `dist/index.d.ts`의 export 목록은 그대로다. `pnpm verify:release`의 설치 소비자(공개 import 11개, strict JSX·core·helper 선언, Node16/NodeNext ESM·CJS)가 통과했다. 내부 선언 파일 세 개는 바뀌었다(`utils/universalRef.d.ts`에서 `isComponentMapManualMode` 제거와 `componentMapManualMode` 추가, `utils/redraw.d.ts`에서 `setRedrawAction` 제거, `hook/internal/useUpdate.d.ts`의 두 번째 인자 필수). 패키지 `exports`에 없는 경로라 공개 계약이 아니다.
- [x] **M-3 — RQ-5.** scope 정책.
  - 통과: minified UMD에 독립 parent getter(`e=>()=>e` 형태)가 그대로 있다. 함수 수의 감소가 DESIGN의 S·H 목록으로 설명된다(옮긴 함수 수와 일치).
  - 실패: getter가 다른 함수 안으로 들어감, 설명되지 않는 함수 증감.
  - 결과(2026-11-11): UMD에 `e=>()=>e`가 그대로 있다. 함수 172 → 160(S) → 155(H)개이고 줄어든 17개가 옮기거나 지운 함수와 일치한다([IMPLEMENT Phase 2·3](./IMPLEMENT.md)). 실제 보유 확인으로 Playwright `e2e/parent-retention.spec.ts`(갱신 뒤 이전 VDOM과 분리된 fragment가 회수되는지)가 base·concurrent 모두 통과했다.

## 동작

- [x] **M-4 — RQ-2, RQ-6, DC-7.** 전체 회귀.
  - 명령: `pnpm build`, `pnpm test:dual`, `pnpm test:e2e`, `pnpm verify:concurrent`, `pnpm verify:release`.
  - 통과: 모두 성공. concurrent 크기가 예산 안이고 변화량을 적었다.
  - 실패: 하나라도 실패하거나 건너뜀.
  - 결과(2026-11-11, `eccd6e5` 소스 + Phase 4 테스트): `pnpm build` 성공. `pnpm test:dual` 1,234개 통과 / 3개 제외(기존 element 제외분). `pnpm test:e2e` 90개 통과(Chromium, base·concurrent). `pnpm verify:concurrent` 7항목 ALL PASS. `pnpm verify:release` 8개 패키지 ALL PASS. concurrent 6,696 → 6,667B.
  - 주의: `pnpm verify:release`는 이 Mac의 기본 `TMPDIR`(`/var/folders/…`, `/private/var`의 symlink)에서는 `Artifact target escapes package`로 실패한다. `scripts/artifact-utils.mjs`의 `safeFile`이 root는 그대로 두고 대상만 realpath로 바꿔 비교하기 때문이며 이번 변경과 무관하다. 실제 경로인 `TMPDIR`을 주고 실행해 통과했다. 스크립트는 고치지 않았다.
- [x] **M-5 — RQ-4, DC-3.** 성능.
  - 방법: 등재 앱에 main 코어와 후보 코어를 붙여 비교한다. 선별은 `experiments/memo-free-rows/measure.mjs`, 판정은 Mac 공식 러너(`official-prepare.mjs` → `official-run.mjs` → `official-analyze.py`).
  - 통과: 가중 전체가 main 대비 느려지지 않는다(95% 구간이 0을 포함하거나 감소). 개별 항목 +3% 초과가 있으면 적고 사용자가 판단한다. 메모리 ±1% 안.
  - 실패: 가중 전체가 구간째로 증가. 이 경우 H 묶음을 되돌리고 S만으로 다시 잰다.
  - select 항목은 프레임 대기의 영향을 받는다. 전체 시간이 아니라 활성 시간으로 비교한다([SELECT_VSYNC_PHASE](../benchmark/SELECT_VSYNC_PHASE.md)).
  - 선별 결과(2026-11-11, 로컬): S+H / main 가중 script −0.23% [−1.30, +0.66], total +0.39% [−0.85, +1.17], heap 같거나 0.2% 작음. 사용자가 이 결과로 H를 유지하기로 했다(U-6).
  - 판정 결과(2026-11-11, Mac 공식 러너, U-7; `6639195` / `a8c10ec` / `eccd6e5`, CPU 4회차·메모리 2회차, Chrome 157.0.8103.51): **통과.** S+H / main 가중 total −0.31% [−1.38, +0.76], script −1.64% [−2.66, −0.62], active −0.58% [−1.24, +0.05]. S / main total −0.62% [−1.58, +0.23]. 메모리는 S·S+H 모두 다섯 항목이 ±0.8% 안이다.
  - +3%를 넘은 개별 항목: select의 total뿐이다(S+H / main +8.0% [−11.4, +27.4], S / main은 −7.8%). 중앙값 프레임 대기가 main 0.49 / S 0.00 / S+H 0.58ms로 달라서 생긴 값이고, active는 S+H / main −0.69% [−5.40, +4.38]다. 반대로 replace 1k는 S+H에서 −2.41% [−3.29, −1.75]로 빨라졌다.
  - 근거: [IMPLEMENT Phase 6](./IMPLEMENT.md#phase-6--mac-공식-러너-확인-done), [official-speed-check.json](./official-speed-check.json). 한 세션의 결과다.
- [ ] **M-6 — RQ-2.** 브라우저 smoke.
  - 방법: 새 `dist/lithent.umd.js`를 쓰는 Playwright fixture(element-umd, csp)와 `pnpm dev`의 예제 한 개에서 목록 추가·역순·삭제·비우기, 입력 포커스 유지, portal 열고 닫기.
  - 통과: 콘솔 오류 없음, 동작이 1.25.8과 같다.
  - 중간 결과(2026-11-11): 자동 부분은 통과했다. 새 UMD를 쓰는 `e2e/csp.spec.ts` 2개와 element·입력·포커스·portal을 다루는 E2E가 90개 안에 들어 있다. `pnpm dev` 예제를 사람이 직접 눌러 보는 확인은 하지 않았으므로 체크하지 않는다.

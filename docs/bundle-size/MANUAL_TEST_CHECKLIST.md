# MANUAL_TEST_CHECKLIST — base 코어 번들 크기 축소

- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 각 항목에는 커밋 SHA(또는 "작업 트리"), 명령, 기대값과 실제값을 적는다. 실행하지 않은 항목은 사유를 적고 체크하지 않는다.
- 최종 판정은 Phase 5에서 한다. 그 전 Phase의 결과는 중간 기록으로 적는다.
- 중간 기록(2026-11-11, 작업 트리, Phase 3 종료): M-1의 크기 4,763B·세 형식의 `sourceMappingURL` 주석, M-2의 export 21개 동일, M-3의 getter 유지와 함수 172 → 155개(옮긴 17개와 일치)를 확인했다. 선언 산출물 대조·전체 회귀·성능·브라우저 smoke는 아직 하지 않았으므로 어느 항목도 체크하지 않는다. 근거는 [IMPLEMENT Phase 1~3](./IMPLEMENT.md).

## 크기와 산출물

- [ ] **M-1 — RQ-1, RQ-3, RQ-7, DC-1, DC-4.** `pnpm build:core && pnpm size`.
  - 통과: base UMD Brotli가 4,857B 이하이고 guard 안이다. `dist/lithent.umd.js`·`lithent.cjs`·`lithent.mjs` 끝에 `sourceMappingURL` 주석이 있고 `.map` 파일이 있다. 세 UMD(base·concurrent·element)가 모두 "not built"가 아니다.
  - 실패: 크기 증가, 주석 누락, 저장돼 있던 `dist`로 잰 값.
- [ ] **M-2 — RQ-2, DC-2.** 공개 계약 대조.
  - 통과: UMD·CJS·ESM의 export 이름 21개가 1.25.8 배포본과 같다. `dist`의 `.d.ts`에서 공개 타입이 바뀌지 않았다(`git diff`로 선언 산출물 비교 또는 `pnpm verify:release`의 타입 소비자 통과).
  - 실패: export 추가·삭제·이름 변경, 선언 변화.
- [ ] **M-3 — RQ-5.** scope 정책.
  - 통과: minified UMD에 독립 parent getter(`e=>()=>e` 형태)가 그대로 있다. 함수 수의 감소가 DESIGN의 S·H 목록으로 설명된다(옮긴 함수 수와 일치).
  - 실패: getter가 다른 함수 안으로 들어감, 설명되지 않는 함수 증감.

## 동작

- [ ] **M-4 — RQ-2, RQ-6, DC-7.** 전체 회귀.
  - 명령: `pnpm build`, `pnpm test:dual`, `pnpm test:e2e`, `pnpm verify:concurrent`, `pnpm verify:release`.
  - 통과: 모두 성공. concurrent 크기가 예산 안이고 변화량을 적었다.
  - 실패: 하나라도 실패하거나 건너뜀.
- [ ] **M-5 — RQ-4, DC-3.** 성능.
  - 방법: 등재 앱에 main 코어와 후보 코어를 붙여 비교한다. 선별은 `experiments/memo-free-rows/measure.mjs`, 판정은 Mac 공식 러너(`official-prepare.mjs` → `official-run.mjs` → `official-analyze.py`).
  - 통과: 가중 전체가 main 대비 느려지지 않는다(95% 구간이 0을 포함하거나 감소). 개별 항목 +3% 초과가 있으면 적고 사용자가 판단한다. 메모리 ±1% 안.
  - 실패: 가중 전체가 구간째로 증가. 이 경우 H 묶음을 되돌리고 S만으로 다시 잰다.
  - select 항목은 프레임 대기의 영향을 받는다. 전체 시간이 아니라 활성 시간으로 비교한다([SELECT_VSYNC_PHASE](../benchmark/SELECT_VSYNC_PHASE.md)).
- [ ] **M-6 — RQ-2.** 브라우저 smoke.
  - 방법: 새 `dist/lithent.umd.js`를 쓰는 Playwright fixture(element-umd, csp)와 `pnpm dev`의 예제 한 개에서 목록 추가·역순·삭제·비우기, 입력 포커스 유지, portal 열고 닫기.
  - 통과: 콘솔 오류 없음, 동작이 1.25.8과 같다.

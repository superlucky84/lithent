# REQUIREMENTS — base 코어 번들 크기 축소

- 작성일: 2026-11-11
- 브랜치: `perf/core-size` (기준 `main` `6639195`, lithent 1.25.8)
- 상태: Phase 0~3 구현 완료(`e5dfab1`·`a8c10ec`·`eccd6e5`). base UMD Brotli 4,901 → 4,763B(①② 4,812B + 후보 ③). Phase 4(Test Hardening)·Phase 5(Integration Test, 성능 확인)와 DC-3·DC-4·DC-5 결정이 남아 있다. 현재 상태는 [IMPLEMENT의 핸드오프](./IMPLEMENT.md#상태--핸드오프)를 따른다.
- 적용 절차: `doc-driven-designer-v1`.
- 정본: 이 문서, [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).

## 배경과 문서 위치

DC-29(컴포넌트 생성 경량화·직접 그리기·문자열 태그 빠른 경로)로 base UMD Brotli가 4,857 → 4,901B(+44B)가 됐다. 크기 gate(`scripts/size-report.js`)의 base guard는 4,953B로 여유가 52B다. 사용자가 늘어난 크기를 되찾을 방법을 물었고, 조사에서 성능 정책을 바꾸지 않고 줄일 수 있는 세 묶음을 찾았다.

이 작업만 다루는 기존 정본은 없다. [`docs/performance-improvement/`](../performance-improvement/REQUIREMENTS.md)는 렌더 성능 작업의 정본이고, 과거 크기 조사는 그 안의 DC-24와 [`docs/benchmark/`](../benchmark/BUNDLE_SIZE_RESULTS.md)의 결과 문서로 남아 있다. 크기 축소를 독립 주제로 이어 가기 위해 `docs/bundle-size/`에 네 문서를 새로 둔다(U-3). 과거 문서의 계약과 수치는 복제하지 않고 링크한다.

관련 코드:

- 빌드: `vite.config.js`(UMD 후처리), `scripts/size-report.js`(크기 gate).
- base 코어: `src/wDom.ts`, `src/diff.ts`, `src/render.ts`.
- 양 코어가 공유하는 모듈: `src/utils/*`(단 `redraw.ts`는 base 전용), `src/hook/*`. concurrent는 [`lithentConcurrent/alias.js`](../../lithentConcurrent/alias.js)의 표대로 `wDom`·`diff`·`render`·`redraw`만 자기 것을 쓴다.
- 측정 도구: [`experiments/core-size/`](../../experiments/core-size/README.md).

## 사용자 결정

- U-1 (2026-11-11): 최근 렌더링 최적화로 늘어난 번들 크기를 줄일 방법을 확인한다.
- U-2 (2026-11-11): hidden source map은 넣지 않는다. JS 끝의 `sourceMappingURL` 자동 연결을 유지한다. DC-24의 보류 결정과 같다.
- U-3 (2026-11-11): `doc-driven-designer-v1`로 진행한다. 문서는 적당한 위치에 새로 만들고, 짧고 명확한 이름의 새 브랜치에서 작업한다.

## 요구사항

| ID   | 요구사항                                                                                                                                                                 | 확인 방법                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| RQ-1 | base UMD Brotli를 4,901B보다 줄인다. 1차 목표는 DC-29 이전 값 4,857B 이하, 조사에서 잰 도달 가능 값은 4,812B(①②)와 4,763B(①②③)다.                                        | `pnpm build:core && pnpm size`, M-1      |
| RQ-2 | 공개 계약을 바꾸지 않는다. export 21개, WDom 필드 이름과 layout, 타입 선언, 동작이 같다. 새 API도 없다.                                                                  | export 대조, 양 코어 테스트, M-2         |
| RQ-3 | source map 자동 연결을 유지한다(U-2).                                                                                                                                    | UMD/CJS/ESM 끝의 주석 확인, M-1          |
| RQ-4 | 렌더 성능을 떨어뜨리지 않는다. diff·배치 경로의 함수 구조를 바꾸는 변경(③)은 성능 확인 뒤에만 채택한다.                                                                  | DC-3, M-5                                |
| RQ-5 | parent getter의 독립 scope(이전 diff tree를 붙잡지 않게 하는 정책)를 유지한다. 함수를 호출부로 옮겨도 `makeParentGetter`와 getter 클로저의 위치는 바꾸지 않는다.         | 출력의 함수 수·getter 형태 대조, M-3     |
| RQ-6 | concurrent 코어의 자기 파일(`lithentConcurrent/src/*`)은 수정하지 않는다(DC-29-7 유지). 공유 모듈의 변경은 concurrent에도 들어가므로 양 코어 테스트로 확인하고 공개한다. | `pnpm test:concurrent`, `pnpm size`      |
| RQ-7 | 크기 gate를 통과한다. guard 숫자를 내릴지와 그 값은 결과를 본 뒤 사용자가 정한다(DC-4).                                                                                  | `pnpm size`, M-1                         |
| RQ-8 | 측정은 재현할 수 있어야 한다. 도구·버전·기준 커밋·단계별 수치를 남긴다.                                                                                                  | `experiments/core-size/`, IMPLEMENT 기록 |

## 범위 밖

- hidden source map(U-2), Terser 전체 compress(함수를 호출 위치로 옮겨 scope 정책과 충돌), property mangling(helper·SSR·devHelper가 읽는 WDom 계약 변경).
- 기능 제거나 선택 기능 분리(hydration·portal·custom element 처리의 별도 진입점). 수백 B 단위가 필요할 때의 후속 설계 주제다. [CORE_BUNDLE_ANALYSIS_2026_11](../benchmark/CORE_BUNDLE_ANALYSIS_2026_11.md)에 조사 방향이 있다.
- concurrent 포크 파일의 같은 정리, element 패키지 크기.
- 버전 올림·CHANGELOG·발행. 채택이 끝난 뒤 별도로 정한다.

## 가정과 제약

- 크기 기준은 gate와 같다: `dist/lithent.umd.js`의 Node 기본 Brotli. gzip level 9와 raw를 함께 적는다.
- Brotli는 비선형이다. 한 건씩 재면 ±10B로 흔들리고 UMD와 CJS의 증감 방향도 엇갈린다. 판단은 묶음 단위의 raw·gzip·Brotli 동시 감소로 한다. 건별 수치를 더해서 예측하지 않는다.
- 도구: Node 24.22.1, pnpm 12.15.0, Vite 8.3.6(Rolldown·Oxc), Terser 5.18.1.
- 소비자 앱은 ESM을 자기 번들러로 다시 묶는다. UMD 수치를 앱의 절감량으로 그대로 옮기지 않는다. 조사에서 카운터 앱 번들은 4,489 → 4,356B였다(①②③ 기준).

# IMPLEMENT — 공개 lifecycle helper 통합

- 갱신일: 2026-10-10
- 브랜치: `feature/closure-lifecycle-helper`
- 기준 / 최근 확정 커밋: `123c243476b00336faf40e3c249ffde8b118dc8d`
- [요구사항](./REQUIREMENTS.md) · [계약](./DESIGN.md) · [출시 체크리스트](./MANUAL_TEST_CHECKLIST.md)

## Phase A — Baseline / 문서 정렬

- [x] canonical 문서 위치·사용자 결정을 확인하고 새 브랜치를 만든다.
- [x] 이전 helper ESM/CJS/UMD·크기를 보관하고 기존 9개 해시를 확인한다.
- [x] 네 문서를 현재 요구사항·명시적 결정·단계·출시 기준으로 정렬한다.
- [x] 기존 helper 테스트 base·Concurrent 각각 51개 통과.

Baseline: 7단계 lifecycle base 57개, Concurrent 68개, Chromium 32개 통과 기록.
Exit: baseline 보관·core 불변 기준·문서 정렬·기존 helper 회귀 통과.

## Phase B — 공개 API 이동

- [x] 구현 정본을 helper 내부로 옮기고 함수 9개·명시적 타입을 export한다.
- [x] 실험에 재수출 shim을 남기고 회귀·시연을 공개 import로 바꾼다.
- [x] helper 선언·ESM/CJS/UMD 빌드·TypeScript·ESLint 통과.
- [x] 공개 사용 예제·exact core alias·수명 계약을 문서화한다.

Baseline: 이전 함수·인자·동작 계약, helper 51개 × 2.
Exit: 중복 구현 없음·core diff 0·빌드한 helper로 base 57개 / Concurrent 68개 통과.

## Phase C — Test Hardening

- [x] cleanup 오류·abort/observer 재진입·inactive task·제거 전 microtask·SSR·adapter 예약을 공개 import로 확인한다.
- [x] 엄격한 소비자 타입에서 핸들·제네릭 결과·잘못된 인자 거부를 확인한다.
- [x] lifecycle 미사용 / state 전용 ESM tree shaking을 이전 helper와 비교한다.

Baseline: 기존 회귀·이전 helper 번들. 새 검사는 공개 계약 또는 이동의 위험을 확인한다.
Exit: observer/cleanup/lifetime 유지·타입 통과·미사용 lifecycle 코드와 컬렉션 제거.

## Phase D — Integration Test

- [x] 격리 배포 패키지에서 ESM/CJS·Bundler/Node16/NodeNext 선언을 확인한다.
- [x] exact core alias 아래 helper subpath·동일 core 인스턴스를 확인한다.
- [x] 공개 import 시연 두 빌드·Chromium 두 코어 × 두 호스트 32개를 확인한다.
- [x] core 6개 해시·소스 불변, helper raw/gzip/Brotli·ESM 앱 비용을 기록한다.

Baseline: 7단계 core 해시·Chromium 시연·helper UMD Brotli 1,879 B.
Exit: 패키지/선언/호스트 통과·core 증가 0·helper 비용 공개·출시 미검증 항목 명시.

## Phase E — 리뷰 / 인계

- [x] 결과·재현 명령·한계를 네 문서에 맞춰 갱신한다.
- [ ] 새 브랜치의 review 가능한 커밋과 draft PR을 준비한다.
- [x] 완료·다음 단계·blocker·최근 commit SHA를 갱신한다.

Baseline: Phase B~D 결과. Exit: 문서 정렬·열린 결정 없음 또는 TBD 추적·review 가능한 결과.
main 병합·버전 변경·npm 배포는 별도 작업이다.

## 이번 통합 결과

| 검사                                                     | 결과                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 공개 helper lifecycle (base / Concurrent)                | 57 / 68 PASS                                                                       |
| 기존 helper 회귀 (base / Concurrent)                     | 51 / 51 PASS (baseline과 동일)                                                     |
| Chromium 두 코어 × 일반/element host                     | 32 PASS, pageerror 0                                                               |
| 빌드 페이지 데스크톱 1365 px / 모바일 390 px             | 두 코어 모두 상태 보존·undo·버튼 hit area·넘침·콘솔 오류 확인 PASS                 |
| 격리 npm tarball ESM/CJS/UMD·SSR                         | 두 코어 모두 PASS, 함수 20개 = 기존 11개 + lifecycle 9개                           |
| 엄격한 타입 소비자                                       | 두 코어 × Bundler ESM / Node16 ESM·CJS / NodeNext ESM·CJS = 10조합 PASS            |
| TypeScript / ESLint / formatting                         | PASS                                                                               |
| helper·standalone 실험·두 시연·과거 benchmark probe 빌드 | PASS                                                                               |
| core 소스·타입·exports / production ESM·CJS·UMD          | 기준 이후 diff 0 / 6개 SHA-256 동일                                                |
| 미사용·state 전용 ESM                                    | lifecycle 컬렉션·작업·DOM 코드 제거, 이전 helper와 지역 변수명 정규화 후 코드 동일 |

검증기는 [verify-lifecycle-helper.mjs](../../scripts/verify-lifecycle-helper.mjs), 전체 크기·해시·소비자 결과는
[HELPER_INTEGRATION_RESULTS.json](./HELPER_INTEGRATION_RESULTS.json)에 기록한다.
소비자는 실제 npm tarball을 임시 node_modules에 풀어 사용하며 repository source alias에 의존하지 않는다.
core exact alias는 Node ESM/CJS 실행과 시연 bundler에서 확인했다. 내부 protocol은 helper export에 없다.
타입은 기존 verify-release.mjs처럼 ESM/CJS를 별도 프로그램으로 검사하고 skipLibCheck=false를 유지한다.
CJS named import·import=require 문법과 잘못된 lifetime·observer 값 타입·active 값·readonly scope 거부를 포함한다.

RetainedHostProps interface를 객체 타입 별칭으로 정리해 `h(Host, props)`의 기존 Record-shaped props 계약과 호환시켰다.
명시적 핸들·work·initializer·reporter 타입을 추가했으며 런타임 수명·취소·pause 정책은 그대로다.
Vite가 순수 컬렉션 생성 annotation을 산출해 별도 런타임 변경 없이 미사용 boundary가 제거됐다.
이번에는 helper 배치·타입만 바뀌므로 기존 core 전체 회귀·시간 벤치마크는 반복하지 않았다.
코어 SHA와 내부 정책이 동일하므로 [최종 성능 기록](./PERFORMANCE_FINAL.md)의 조건·한계가 그대로 적용된다.

### 크기

Node v24.19.0, Vite 5.4.8, gzip level 9, Node 기본 Brotli, source map 제외.
core·전체 helper는 다른 파일이다. ESM fixture는 lithent를 external로 두며 코어 전송 비용을 포함하지 않는다.

| 산출물                          |  raw B | gzip B | Brotli B |       기준 대비 Brotli |
| ------------------------------- | -----: | -----: | -------: | ---------------------: |
| base UMD                        | 12,966 |  5,142 |    4,758 |                      0 |
| Concurrent UMD                  | 17,740 |  7,171 |    6,635 |         0 (7단계 대비) |
| 전체 helper ESM                 | 18,468 |  4,968 |    4,349 |                 +2,234 |
| 전체 helper CJS                 | 11,994 |  4,156 |    3,716 |                 +1,909 |
| 전체 helper UMD                 | 12,105 |  4,249 |    3,790 | +1,911 (1,879 → 3,790) |
| 미사용 helper ESM fixture       |     37 |     57 |       41 |                      0 |
| state 전용 ESM fixture          |    185 |    142 |      114 |  -2 (압축 변수명 차이) |
| owner + latest task ESM fixture |    999 |    530 |      476 |         신규 선택 기능 |

state fixture raw·gzip는 동일하고 코드 차이는 압축기의 지역 변수명뿐이다. 미사용 fixture는 바이트까지 동일하다.
476 B는 작은 owner/latest factory fixture의 최종 Brotli이며 전체 lifecycle 또는 임의 앱의 비용 보장이 아니다.
전체 helper UMD는 모든 기능을 포함하므로 약 1.9 KB 증가한다. ESM 선택 사용과 구분한다.
Concurrent의 최초 원본 대비 +250 B는 이미 7단계에 포함된 비용이며 이번 이동의 증가분은 0 B다.

### 재현

저장소 root에서 코어·helper 산출물을 먼저 준비한다. pnpm 표준 build 명령 또는 아래 로컬 실행기를 사용할 수 있다.

```sh
./node_modules/.bin/vite build
(cd lithentConcurrent && ../node_modules/.bin/vite build)
(cd helper && ../node_modules/.bin/vite build)
(cd helper && ../node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1)
(cd helper && LITHENT_CORE=concurrent ../node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1)
./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
LITHENT_CORE=concurrent ./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
./node_modules/.bin/tsc -p helper/tsconfig.json
./node_modules/.bin/tsc -p experiments/closure-lifecycle/tsconfig.json
node scripts/verify-lifecycle-helper.mjs --baseline-helper /path/to/phase7-helper-dist --output /path/to/results.json
./node_modules/.bin/vite build --config experiments/closure-lifecycle/demo/vite.config.ts
LITHENT_CORE=concurrent ./node_modules/.bin/vite build --config experiments/closure-lifecycle/demo/vite.config.ts
LITHENT_CHROMIUM_PATH=/usr/bin/chromium ./node_modules/.bin/playwright test --config experiments/closure-lifecycle/playwright.config.ts
```

크기 비교 baseline은 별도 checkout의 기준 커밋 helper build 세 파일이다. baseline 옵션을 생략하면 현재 패키지는 검사하되 이전 helper 비교는 NOT RUN으로 표시한다.
이 환경은 서버·Chromium과 일부 nested 프로세스 실행에 sandbox 외부 실행이 필요했다. registry install·배포는 하지 않았다.
기본 시연 빌드의 기존 notifyStoreWrite namespace capability 경고는 optional lookup이며, 두 코어 소비자 동작은 통과했다.
실제 서버·Firefox·Safari·접근성·제품 CSP는 [출시 체크리스트](./MANUAL_TEST_CHECKLIST.md)에 남긴다.

## 역사 기록

1단계: owner/latest/useOwnerScope, base·Concurrent 24/24, 기존 9개 해시 동일.
당시 UMD Brotli: base 4,758 B / Concurrent 6,385 B / helper 1,879 B / 선택 실험 670 B.
[당시 IMPLEMENT 원문](https://github.com/superlucky84/lithent/blob/925b4aa98c40ca20b309ea2613cc625d260fa5b1/docs/closure-lifecycle/IMPLEMENT.md).
후속 결과: [PHASE2](./PHASE2.md), [PHASE3](./PHASE3.md), [PHASE4](./PHASE4.md), [PHASE5](./PHASE5.md), [PHASE6](./PHASE6.md), [PHASE7](./PHASE7.md), [최종 성능](./PERFORMANCE_FINAL.md).
역사 기록의 경로·커밋·수치를 현재 공개 통합 결과와 섞지 않는다.

## 인계 상태

- 완료: 네 문서 정렬, 공개 helper 9개·명시적 타입, 구현 정본 이동, 공개 import 시연, 회귀·브라우저 259개, 패키지·타입 10조합·tree shaking·크기·core 불변 검증.
- 다음: 검증 결과 commit·draft PR로 인계한 뒤 공개 API 리뷰. 버전·배포와 제품 검증은 이후 작업.
- blocker: 없음. 제품 적용의 다른 브라우저·실제 서버·포커스/접근성은 별도 항목이다.
- 최근 확정 commit SHA: `123c243476b00336faf40e3c249ffde8b118dc8d`.

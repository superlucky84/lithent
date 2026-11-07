# IMPLEMENT — 오류 복구·검증·선택적 npm 배포

- 상태: Phase 0~7 구현/로컬 검증과 U-15 수정분 재리뷰 APPROVE를 완료했다. U-16으로 버전업 정렬·커밋·PR 생성으로 인계한다. 배포 도구 검증은 47 fixture·33 mutation, 재리뷰는 빠른 검사 41 PASS다. 이전 전체 Quality/실제 패키지/3엔진 270 PASS는 제품 입력이 같은 수정 전 이력이다. 외부 GitHub/npm 설정·원격 CI·실제 발행은 별도 미완료다.
- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 각 phase 시작 시 `git status --porcelain -uall`을 기록하고, 완료 시 git의 실제 변경으로 `Files:`를 작성한다.
- 구현 phase 종료 시 `doc-driven-designer-v1`의 Phase Completion에 따라 리뷰 또는 다음 phase 진행을 사용자에게 묻는다.
  사용자가 이미 정한 선택은 다시 묻지 않는다. 사용자 선택 없이 reviewer를 실행하지 않는다.

## Phase 0 — 기준선·정책 확정: done

Refs: RQ-1, RQ-4, RQ-6, RQ-10, RQ-15, DC-0, DC-1, DC-6, DC-7, DC-8, DC-9, M-6, M-9

진입: 네 문서 초안과 현재 브랜치/기준 SHA가 존재한다.

- [x] cleanup 보고 계약 DC-1은 U-6로 확정했다. 발행 허용 목록/기준/이벤트/인증 상세는 Phase 4 진입 전에 확정하며 cleanup 구현을 막지 않는다.
- [x] 기존 `RELEASING.md`·`CONTRIBUTING.md`의 연결·갱신을 사용자에게 확인받고 새 정본을 연결했다(U-5, DC-9). 자동화 전까지 기존 실행 절차를 유지한다.
- [x] Node 24.22.1/pnpm 12.15.0을 별도 작업 경로에 설치하고 frozen install·fresh build를 통과했다. lockfile 변경은 없다.
- [x] `test:dual` 1,176 PASS/기존 skip 3, `verify:concurrent`, `verify:release`의 pack 3개·공개 import 11개·ESM/CJS·strict 타입을 통과했다. root runner에 포함되지 않는 개발 도구의 독립 runner 범위는 Phase 2에서 정렬한다.
- [x] Chromium 151.0.7922.173에서 기존 E2E 78개를 통과했다. 실제 서버 listen이 가능한 네트워크 실행과 세션용 system Chromium config를 사용했다.
- [x] 공개 패키지 8개·private/서브패스 소유 관계와 registry의 현재 버전 존재를 읽기 전용으로 확인했다. 모두 발행된 버전이다. 실제 후보 계산기 dry-run 구현은 Phase 4 범위다.

Baseline: 앞선 검토의 선택 실행 462/365 통과·cleanup 4×2 재현·E2E 78 discovery를 이력으로 보존한다.
기존 Node 24.19.0 결과나 재현 테스트 통과를 고정 환경의 수정 검증으로 대체하지 않는다.
Exit: 필수 결정과 실행 가능한 기준선이 기록되거나 실행 불가 사유가 명시되어 후속 범위가 결정된다.

2026-11-06 결과: base 4,925B/4,925B, Concurrent 6,953B/9,000B, element 998B/1,000B Brotli.
기준 base UMD SHA-256: `dff0ab8b5c652a880346cb1aaf160088be2d50022750767f8c7b596cac379c4b`.
세션 로그는 `/workspace/work/lithent-implementation/baseline-*`에 보관했다.
U-6의 cleanup 구현 진행 선택에 따라 이 준비 기준선 이후 Phase 1을 진행한다. npm 운영 상세는 Phase 4에서 확정한다.

Files:

- `docs/reliability/REQUIREMENTS.md` (added)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — cleanup 격리와 element 복구: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, DC-1, DC-2, DC-10, IC-1, M-1, M-2, M-3

진입: DC-1이 확정되고 공유 unmount와 두 코어의 제거 경로를 확인했다.

- [x] 기대 동작을 단언하는 core 11개·element 4개를 추가했다. 기존 코드에서 양 코어 각각 전부 실패했다. 탐색 테스트를 복사해 잘못된 동작을 통과시키지 않았다.
- [x] cleanup 큐를 먼저 비우고 등록별 예외를 격리했다. microtask에서 reportError를 호출하고 불가능/실패 시 원래 오류를 던진다. core 11개 × 2코어가 통과했다.
- [x] destroy·교체·keyed 제거·부모/자식/형제·수동 map·재시도/재진입·portal 핸들러를 두 코어에서 검증했다.
- [x] element shadow/light의 disconnect/reconnect와 같은 태스크 이동 4개 × 2코어가 통과했다. element 런타임은 수정하지 않았다.
- [x] 정상 순서·동일 함수 복수 등록을 보존했다. fresh build에서 base 4,953B(+28B), Concurrent 6,986B(+33B), element 998B(동일)로 크기 검사를 통과했다(DC-10).

Baseline: Phase 0 결과, 기존 destroy/portal/element 회귀, 두 코어의 기존 번들 크기.
Exit: 새 회귀와 관련 기존 회귀가 양 코어에서 통과하고 오류 보고·크기 판정이 문서에 연결된다.

2026-11-06 검증 결과:

| 검증                                                          | 결과                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 수정 전 기대 동작 회귀                                        | core 11개·element 4개가 두 코어 각각 모두 FAIL; 기존 결함 검출 확인                                    |
| 수정 후 `pnpm test:dual`                                      | 1,206 PASS / 기존 skip 3; 기준선 대비 신규 30개                                                        |
| Chromium cleanup/native events                                | 18개 단독 재실행 PASS (신규 cleanup 4개 포함)                                                          |
| fresh core·Concurrent·element 및 examples/docs/template build | PASS                                                                                                   |
| `verify:concurrent`, `verify:release`                         | PASS; root 1.25.6·Concurrent 0.2.5·generator 0.3.4의 3 pack, 11 import/require·strict 타입 소비자 검증 |
| TypeScript·대상 ESLint·크기                                   | PASS                                                                                                   |

브라우저 첫 실행은 build/unit 검사와 동시 실행 중 기존 `events: replace`의 context 종료가 30초를 초과해
17 PASS / teardown timeout 1이었다. trace의 실패 action은 fixture/hook이고 단언 실패는 없었다.
동일 코드·동일 timeout·retry 0으로 검사를 단독 재실행해 18개 모두 통과했다. 첫 실패 로그/trace와 재실행 로그를 별도로 보존했다.
새 전역 오류 보고·fallback 4개는 첫 실행과 재실행 모두 통과했다. discovery는 13파일 82개를 확인했으며 전체 suite와 Firefox/WebKit 실행은 Phase 3·6에서 다룬다.

패키지 버전 변경 후 pnpm 12가 자동 설치를 수행해 제한된 실행에서 의존성 설치가 중단된 적이 있다.
네트워크를 허용한 frozen install로 복구했고 lockfile 변경 없이 빌드·회귀·소비자 검증을 완료했다.
manifest를 바꾼 후에는 네트워크를 허용한 명시적 설치를 먼저 하고 같은 도구/캐시 설정으로 스크립트를 실행한다.

실제 배포는 수행하지 않았다. 준비 버전은 `lithent@1.25.6`, `lithent-concurrent@0.2.5`이며 둘 다 버전 준비 시점 registry 조회에서 미발행(404)이었다.
소스 `src/utils/universalRef.ts` SHA-256: `77a6f53f92efdc3cceadeeb984fa841d7e1a93c7af8043afbac95eb0356e1890`.
base UMD SHA-256: `e15cf71bd44766fda3fcf6dfb7df361c8831f854358621a9e2786ee910a716ab`.
Concurrent UMD SHA-256: `9800222c50ab9f11f8a636351b3ea9d168974423044ffb5a3424f64ab92d94e7`.
로그·실패 trace는 `/workspace/work/lithent-implementation/phase1-*`에 보관했다.

Files:

- `src/utils/universalRef.ts` (modified)
- `src/tests/core-cleanupErrors.test.ts` (added)
- `element/src/tests/element-cleanupErrors.test.ts` (added)
- `e2e/cleanup.spec.ts` (added)
- `e2e/fixtures/cleanup.html` (added)
- `e2e/fixtures/cleanup.ts` (added)
- `scripts/size-report.js` (modified)
- `package.json` (modified)
- `lithentConcurrent/package.json` (modified)
- `CHANGELOG.md` (modified)
- `RELEASING.md` (modified)
- `docs/reliability/REQUIREMENTS.md` (added)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 2 — PR/main CI와 패키지 검증 확장: done

Refs: RQ-6, RQ-7, RQ-9, RQ-12, DC-3, DC-11, DC-12, DC-13, DC-14, IC-2, M-4, M-8, M-11

진입: 고정 도구 버전의 기준선과 필요한 검증 명령의 실제 범위를 확인했다.

- [x] PR/main workflow에 frozen install·fresh build·양 코어/satellite·개발 도구 검증을 연결했다. 전체 로컬 단위와 복원한 빌드의 Chromium E2E를 통과했다. 실제 GitHub 실행은 미실행이다.
- [x] 독립 공개 패키지 8개의 실제 tarball과 소비자 검증을 준비했다. 기존 3개의 11경로·strict ESM/CJS·JSX/SSR 검사에 도구 5개와 generator --help를 더해 모두 통과했다.
- [x] hmr-parser 0.2.4·MDX 0.2.7·Vite 0.3.5에 실제 CJS 출력/조건별 선언을 제공하고 template-parser 0.1.2의 CJS 선언과 template-vite 0.1.2의 parser 의존/default 해석을 정렬했다. UMD 이름과 template-vite의 ESM 출력 계약을 보존했다. 준비한 7개 새 버전은 registry 404, generator 0.3.4는 기존 발행 버전(200)이다.
- [x] 검증 성공 후 8개 archive 이름·버전·SHA-256·SHA-512 SRI·source revision/dirty manifest를 기록했다. 별도 checkout에 build bundle을 복원하고 433파일 hash를 대조했다.
- [x] 누락 exports/bin·workspace 잔여·private/버전 불일치·변조/누락/다른 SHA·dirty·실패/생략/취소/검사 0개의 fixture 5개를 통과했다. size의 산출물 누락 성공 경로를 고치고 빈 cwd에서 CLI 실패를 확인했다. 기존 출력 디렉터리를 재사용하는 production CLI도 실패한다.
- [x] workflow는 contents: read와 persist-credentials: false를 사용한다. 실패 로그·HTML/trace는 7일 보관한다. required check 이름은 CI이며 저장소 ruleset 설정과 실제 GitHub 실행은 별도로 남긴다.

Baseline: 기존 build/test/verify-release/verify-concurrent 결과와 8개 패키지 export 표면.
Exit: 정상/의도적 실패 fixture가 기대 exit code를 만들고, required checks의 설정 필요 상태가 기록된다.

진행 근거: `/workspace/work/lithent-phase2/`의 build·tool-rebuild·release·ci-fixtures·production-guards·build-artifacts·restored-artifacts 로그.
workspace 전체 빌드 후 CJS factory 호출에서 MDX default interop와 Vite의 ESM-only 의존 해석 실패를 발견했다.
interop: auto와 template-vite의 ESM default 조건으로 수정하고 두 도구를 재빌드해 실제 packed factory 호출까지 통과했다.
최초 dual 실행은 Node fixture 파일이 root Vitest에 중복 수집되어 473개 단언 통과/파일 1개 실패였다.
전용 `test:ci`로 분리하고 root Vitest에서 해당 경로만 제외한 뒤 전체 dual을 재실행해 모두 통과했다.
이 환경의 네트워크 제한 명령에서는 subprocess spawn 자체가 EPERM일 수 있으므로 실제 CLI 실패와 구분한다.
fixture는 spawn error/signal을 먼저 검사하며, 명시적 네트워크 허용 명령에서 5개 모두 통과했다.

2026-11-06 최종 로컬 검증 (Node 24.22.1 / pnpm 12.15.0 / Playwright 1.63.0):

| 검사                                                                     | 결과                                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| frozen install·전체 workspace build·interop 수정 도구 재빌드             | PASS, lockfile 변경 없음                                                                                                  |
| `test:dual`                                                              | 13 runner, 1,206 PASS / 기존 skip 3                                                                                       |
| `test:toolchain`                                                         | 5 runner, 172 PASS / skip 0                                                                                               |
| `test:ci`·production CLI 음성 검사                                       | fixture 5 PASS; 동일 크기 변조도 거부; dirty CI 증거·기존 출력 재사용 거부                                                |
| `verify:release`                                                         | 8개 실제 pack·11개 core import/require·5개 tool import/선언된 CJS·factory·generator help·strict Node16/NodeNext 모두 PASS |
| build artifact 복원                                                      | 별도 checkout + frozen install, 433개 파일 hash PASS; 기존 dist/node_modules를 복사해 사용하지 않음                       |
| 복원 빌드의 공식 Chromium 153.0.8010.12 E2E                              | base 40 + Concurrent 42 = 82 PASS, 3.1분, retry 0 / skip 0                                                                |
| Concurrent artifact·크기·actionlint 1.7.7·대상 ESLint/Prettier·diff 공백 | PASS                                                                                                                      |

base 4,953B·Concurrent 6,986B·element 998B로 Phase 1 크기를 유지했다.
`src/utils/universalRef.ts`와 양 코어 UMD SHA-256도 Phase 1 기록과 같다. cleanup 런타임을 재수정하지 않았다.
release manifest SHA-256: `4c46b83593717cd34bae9a29a122f78cd8f0bc0840d81d66074b5c82d72f184c`.
build bundle SHA-256: `a63b72551ac02bb28408487294fc093dade5c31885e7a553b5735331ce0262d0`.
build manifest SHA-256: `1589624e7e881f7370d71025bba0f066e552075f579c994961619b8815b5bc82`.
이 로컬 manifest는 `d594983897bab460b469cea8c6e73dfd354f1fd2` + `dirty=true`를 명시하며 발행용 clean 증거로 사용하지 않는다.
로그와 복원 checkout/report/trace는 `/workspace/work/lithent-phase2/`에 보관했다.
GitHub PR/main 실행과 ruleset의 required check **CI** 활성화는 아직 수행하지 않았다. 실제 npm 발행·push·병합·저장소 설정 변경도 없다.

Files:

- `.gitignore` (modified)
- `CHANGELOG.md` (modified)
- `CONTRIBUTING.md` (modified)
- `RELEASING.md` (modified)
- `package.json` (modified)
- `packages/hmrParser/package.json` (modified)
- `packages/hmrParser/vite.config.js` (modified)
- `packages/lithentMdx/package.json` (modified)
- `packages/lithentMdx/vite.config.ts` (modified)
- `packages/lithentTemplateParser/package.json` (modified)
- `packages/lithentTemplateVite/package.json` (modified)
- `packages/lithentVite/package.json` (modified)
- `packages/lithentVite/src/plugin.ts` (modified)
- `packages/lithentVite/vite.config.ts` (modified)
- `scripts/emit-declaration-formats.mjs` (modified)
- `scripts/size-report.js` (modified)
- `scripts/verify-release.mjs` (modified)
- `vite.config.js` (modified)
- `.github/workflows/ci.yml` (added)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `scripts/artifact-utils.mjs` (added)
- `scripts/ci-build-artifacts.mjs` (added)
- `scripts/ci-gate.mjs` (added)
- `scripts/release-packages.mjs` (added)
- `scripts/tests/ci-artifacts.test.mjs` (added)

## Phase 3 — Firefox/WebKit과 입력·포커스 검증: done

Refs: RQ-8, RQ-9, DC-4, DC-15, DC-16, DC-17, DC-18, IC-1, M-5

진입: 기존 Chromium 결과와 서버·core 식별 계약을 확보했다.

- [x] 명시적 브라우저 선택과 오타/빈 값 실패를 검사했다. CI의 Chromium/Firefox/WebKit job은 base/concurrent 이름·포트·동일 bundle을 유지하며 보고서에 실제 엔진/버전을 남긴다.
- [x] 세 discovery의 테스트 이름 목록이 같고 각 14파일 90개(base 44/Concurrent 46)임을 대조했다. 원래 78개+cleanup 4개+form 4종 × 2코어이며 세 엔진 전체 270 PASS다.
- [x] 실제 keyboard/input/change 이벤트와 native 대조군, caret/selection 양방향, 동일 노드 renew/다른 keyed 행 재정렬의 focus·DOM identity, Tab/Shift+Tab·Space·checked를 추가했다. 기존 cleanup과 이벤트 검사는 각 엔진 전체 suite에서 그대로 실행했다.
- [x] fixture의 static/dynamic 배열 오류, Firefox UI favicon 요청, 로컬 공유 라이브러리/캐시/namespace와 병렬 부하를 구분했다. CSP 정책·console/network 검사·30초 기본 timeout·10초 expect timeout·retry 0을 유지했다. 최종 skipped/flaky/unexpected는 세 엔진 모두 0이다.

Baseline: Phase 2 공식 Chromium 153.0.8010.12의 82 PASS, core/UMD hash, 433파일 bundle. 시작 상태와 기존 변경 파일 hash를 `/workspace/work/lithent-phase3/start*`에 기록했다.
Exit: 세 엔진의 양 코어 결과·실제 Safari 미검증 범위가 기록되고 새 회귀가 기존 계약을 관찰한다.

진행 근거: Chromium 153.0.8010.12 전체 90 PASS (기존 82 + form 4종 × 2코어), retry 0/skip 0.
새 fixture의 첫 keyed 검사는 배열을 spread해 static child 슬롯으로 전달한 오류로 DOM identity 단언 2개가 실패했다.
기존 keyed 배열 API대로 배열 자체를 전달한 뒤 전체 90개를 통과했다. 런타임 코드는 수정하지 않았다.
첫 실패 로그·trace는 `/workspace/work/lithent-phase3/chromium-focused-failed/`에 보존한다.
config/CI fixture는 새 브라우저 선택 검사 포함 6 PASS다. 최초 병렬 준비 중 CLI spawn 30초 timeout은
별도 `ci-fixtures-first-failed.log`에 보존했고, 같은 제한으로 재실행해 통과했다.

로컬 환경: Playwright 1.63.0의 공식 Firefox 155.0·WebKit 26.6을 실제 기동하고 reportError/Trusted Types·GC API를 확인했다.
Docker 공식 이미지는 vfs layer 추출 공간 부족으로 실패했다. 필요한 Debian 라이브러리는 작업 폴더에만 내려받아 풀었으며 시스템 패키지는 설치하지 않았다.
Firefox는 읽기 전용 home 대신 작업 폴더의 XDG config/cache/data를 사용하고,
읽기 전용 uid_map 환경에서 로컬 `MOZ_DISABLE_CONTENT_SANDBOX=1`로 실행한다. 호스트 sandbox는 변경하지 않았다.
WebKit zip의 실행 wrapper가 LD_LIBRARY_PATH를 덮어쓰므로 다운로드한 bundle의 sys/lib 검색 폴더에 누락 라이브러리만 보충했다.
ldconfig 기반 dlopen 검사에는 이 사용자 경로가 표시되지 않아 로컬 host-requirements 사전 검사만 끄고 실제 renderer/전체 E2E를 실행한다.
CI에는 이 로컬 설정을 넣지 않으며 각 job의 `playwright install --with-deps`를 사용한다. 테스트 skip과 구분한다.

Firefox 첫 전체 실행에서 CSP fixture가 브라우저 UI의 자동 favicon 요청 때문에 console 오류를 수집했다.
렌더링/스타일/이벤트와 페이지 policy-violation 단언은 통과했다. DC-18의 Firefox 전용 site_icons 설정으로
테스트 범위 밖 UI 요청을 끄며, CSP 정책이나 오류 수집기를 완화하지 않고 재검증한다.

2026-11-06 최종 결과 (Node 24.22.1 / pnpm 12.15.0 / Playwright 1.63.0):

| 엔진     | 실제 버전     | base / Concurrent | 전체 | 결과        |
| -------- | ------------- | ----------------- | ---- | ----------- |
| Chromium | 153.0.8010.12 | 44 / 46           | 90   | PASS, 2.2분 |
| Firefox  | 155.0         | 44 / 46           | 90   | PASS, 4.9분 |
| WebKit   | 26.6          | 44 / 46           | 90   | PASS, 4.9분 |

세 HTML report의 metadata·browser annotation·stats를 직접 추출해 총 270 expected / unexpected 0 / skipped 0 / flaky 0을 확인했다.
`report-summary.json`과 엔진별 report/trace/log는 `/workspace/work/lithent-phase3/`에 있다.
브라우저 선택을 포함한 CI fixture 6개·TypeScript·대상 ESLint/Prettier·actionlint·433파일 bundle hash 검사를 통과했다.
cleanup 소스와 양 코어 UMD hash는 Phase 1 기록과 일치하며, 준비된 공개 패키지 버전도 모두 Phase 2와 같다. 새 런타임 수정·버전업·발행은 없다.

Firefox 첫 전체 실행은 favicon 오류 2 / 나머지 88 PASS였다. `firefox-first-failed-*`에 근거를 보존했다.
site_icons=false의 독립 대조 검사에서 정상 페이지 console 오류 0과 raw innerHTML의 Trusted Types 거부를 함께 확인했다.
수정 후 두 번째 실행은 별도 discovery CLI들을 동시에 실행한 부하 중 문서 tour 2개가 30초 제한을 넘겼다(88 PASS).
`firefox-load-timeout-*`에 두 실패 trace와 로그를 보존했으며, 별도 검사를 끝내고 같은 코드·같은 timeout·retry 0으로
전체를 단독 실행해 90 PASS를 확인했다. CI의 엔진 job도 별도 runner로 분리하며 quality/추가 CLI와 겹치지 않는다.
실제 GitHub 실행·required check CI 설정·Safari/OS IME는 미실행이다.
U-9의 계속 진행 지시에 따라 Phase 3 리뷰 선택을 재질문하지 않고 Phase 4 운영안 구체화로 이어간다.

Files:

- `CONTRIBUTING.md` (modified)
- `e2e/parent-retention.spec.ts` (modified)
- `e2e/test.ts` (modified)
- `playwright.config.ts` (modified)
- `.github/workflows/ci.yml` (added)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `e2e/fixtures/forms.html` (added)
- `e2e/fixtures/forms.ts` (added)
- `e2e/forms.spec.ts` (added)
- `scripts/tests/browser-config.test.mjs` (added)

## Phase 4 — 버전별 npm 후보와 발행 workflow: done

Refs: RQ-10, RQ-11, RQ-12, RQ-13, RQ-14, RQ-15, DC-5, DC-6, DC-7, DC-8, DC-9, DC-19, DC-20, DC-21, DC-22, DC-23, DC-24, DC-25, DC-26, IC-2, M-6, M-7, M-8, M-9, M-10

진입: read-only 후보 계산은 DC-19/DC-20/DC-21과 Phase 2의 검증된 manifest로 먼저 진행한다.
실제 발행 부분은 DC-6/DC-7/DC-8의 필수 운영 계약/활성화 상태를 정리한 뒤 연결한다. 미정 정책을 승인된 것으로 처리하지 않는다.

- [x] 공개 패키지 허용 목록과 초기 기준, 버전 변경·registry 대조로 후보 보고서를 만들었다. 실제 npm 조회에서 준비 버전 7개만 선택하고 generator는 baseline으로 제외했다.
- [x] 후보 0개·한 개·여러 개, private 변경, 기존 버전, 새 패키지, downgrade, 조회 실패를 fixture로 검증했다.
- [x] packed 내부 의존 그래프·workspace 치환·발행 순서와 제외된 소유 패키지의 소스 변경을 보고한다. sourcePaths의 공유 src는 두 코어에 연결했다. 파일 diff는 후보 선택에 사용하지 않는다.
- [x] read-only plan/후보 소비자를 PR/main Quality에 연결하고 build bundle에 plan·proof를 추가했다. 권한은 contents:read로 유지한다.
- [x] 실제 7개 후보 소비자를 격리 설치해 선택 archive + registry 의존성·공개 import/선언된 require·strict 혼합 타입·Vite/MDX/template 변환을 통과했다. 로컬 registry fixture에서 변경된 비선택 workspace archive가 설치를 가리지 않는지 관측했다.
- [x] 주입형 발행 실행기로 같은 tarball·직전 조회·의존 순서·integrity 확인·부분 실패/중단/재시도를 검증했다. 이어 별도 production CLI adapter를 연결했고 실제 npm publish는 실행하지 않았다.
- [x] PR dry-run과 main 검증 후 발행 job을 분리하고 event/ref·보호 main·활성화 변수·환경·GitHub-hosted·OIDC·Node/npm 조건을 검사했다. privileged job은 install scripts를 실행하지 않는다.
- [x] 검증한 절대 archive 경로만 npm publish에 넘기고 직전 registry·직렬 순서·부분 성공 receipt를 확인한다. CLI 오류 뒤 실제 registry 성공도 integrity 확인 후에만 복구한다.
- [x] 같은 run/SHA의 각 attempt에서 확인된 published receipt만 모아 성공 태그를 기록하고 root docs.yml을 해당 태그/release_sha로 명시 dispatch한다. tag 충돌·다른 SHA·실패 dispatch를 mock에서 거부/기록한다. 원격 tag/docs 실행은 하지 않았다.
- [x] DC-9로 확인받은 RELEASING/CONTRIBUTING을 갱신하고 패키지 소유자·저장소 관리자의 외부 초기 설정/활성화 미완료를 구분했다. 1.25.5 이력을 보존했다.

Baseline: registry 요청과 publish executor를 대체한 fixture, 패키지별 현재 manifest, 기존 수동 릴리스 절차.
Exit: dry-run과 실패/재시도 검증이 통과하며 실제 발행 활성화 여부가 별도 기록된다.
테스트 통과를 위해 real npm publish를 실행하지 않는다.

시작 상태와 기존 파일 hash는 `/workspace/work/lithent-phase4/start*`에 보존했다.
공식 npm 문서와 현재 registry 조회도 같은 경로에 보관했다. 준비 버전 7개는 정확한 버전 조회 404,
create-lithent 0.3.4는 200이며 최초 후보 계산은 이 차이를 실제로 재현해야 한다.
DC-7 질문은 U-10으로 해결했다. main 필수 검증 성공 후 stable/latest 자동 발행을 구현하며 동일 결정을 재질문하지 않는다.

초기 planner fixture 7개·전체 CI fixture 13개에서 출발해 read-only/주입형 검증 25개를 통과했고, 실제 adapter/workflow 연결 후 최종 35개를 통과했다.
여기에는 실제 로컬 registry 설치·tarball/plan/proof/source/policy 변조 거부·PR/push base SHA·부분 실패/지연 가시성/CLI 오류 후 확인이 포함된다.
현재 registry dry-run은 7 후보/1 baseline 제외를 재현했다.
semver 직접 의존성 추가 시 pnpm이 optional supports-color peer snapshot을 광범위하게 다시 작성했으므로,
원래 lockfile의 기존 해석을 유지하고 root importer 3줄만 추가한 뒤 frozen install을 통과했다. 의존 버전 업그레이드는 없다.
후보 소비자의 혼합 .mts/.cts 검사에서 기존 JSX index signature 중복을 발견했다. 실제 pack 복사본의 대조 검사
(`mixed-type-before.log`/`mixed-type-after.log`)에서 실패/수정 통과와 key/value 타입 동등성을 확인해 DC-22로 수정했다.
fresh core/Concurrent build·size·8개 pack 검증이 통과했다. Node16/NodeNext에서 두 코어의 .mts/.cts를 같은 프로그램으로 검사하고 skipLibCheck:false를 유지한다.
양 코어 UMD SHA-256은 Phase 1 기록과 같고 크기는 4,953/6,986/998B다. 타입/배포 도구 변경으로 E2E를 다시 실행하지 않았으며 Phase 3의 270 PASS를 이력으로 연결한다.

근거 경로: `/workspace/work/lithent-phase4/`의 `release.log`, `consumers-bound.log`, `ci-fixtures-complete.log`,
`plan-complete.log`, `type-build.log`, `size.log`, `build-artifacts.log`.
첫 후보 소비자 실행은 기존 JSX 선언 충돌로 실패했다. 후속 transform fixture의 불필요한 lithent import는
peer로 lithent를 요구하지 않는 template-vite 소비자에서 해석되지 않아 fixture를 독립 템플릿으로 고쳤다.
제품의 peer 요구를 임의로 추가하거나 검사를 느슨하게 만들지 않았으며 최종 7개 소비자의 실제 변환까지 통과했다.
actionlint·대상 ESLint·diff 공백 검사도 통과했다. 현재 build bundle은 plan/proof를 포함한 436개 파일이다.
별도 checkout에 현 소스를 복사하고 기존 dist/node_modules 복사 없이 frozen install·bundle 복원·436파일 검증을 통과했다.
근거: `restored-install.log`, `restored-artifacts.log`, `bundle-consumer/`.
같은 복원 checkout에서 실패 proof·같은 크기의 archive 변조·dirty CI 증거를 production CLI가 거부했고 원본 복구 후 재검증했다(`restored-guards.log`).
현재 release manifest SHA-256은 `a825d99d9e7f508d2a6a7f5021edf3ec8dfde0df470aec3a2d909b0dc2d1c355`,
bundle SHA-256은 `b9eae88dd292ca409e483de461d27d2c229913778a4431a187501379662397e5`다.
로컬 source/manifest/proof는 모두 dirty=true이며 실제 발행을 허용하는 clean 증거가 아니다.

2026-11-07 U-10 이후 연결 검증:

- `pnpm test:ci`: 35 PASS, skip/retry 0. production CLI는 주입형 npm executor로 검증했으며 실제 registry 발행/GitHub 쓰기는 없다.
- 실제 YAML을 파싱해 세 브라우저·필수 job 의존·main/PR/fork/ref/실패/활성화 조건과 최소 권한을 검사했다. failed-jobs 재실행은 Quality가 출력한 원래 artifact 이름을 사용한다.
- 같은 run/SHA의 이전 attempt 성공 receipt를 합쳐 태그를 복구하고, 같은 SHA 태그는 유지·다른 SHA 태그는 거부한다. root docs dispatch는 SHA를 전달하며 dispatch 접수와 사이트 배포 성공을 구분한다.
- 로컬 production CLI 실행과 --allow-dirty를 모두 거부했다. 발행 receipt가 만들어지지 않았음을 확인했다(`production-entry-guards.log`).
- root를 다시 pack해 기존 검증 archive와 SHA-256이 같음을 확인했다(`repack-control.log`). 기존 8 pack·7 실제 후보 소비자·436파일 별도 복원 검증은 위 근거를 유지한다.
- actionlint 1.7.7과 diff 공백 검사 PASS. 이번 연결은 배포 도구/workflow/문서 변경이며 runtime UMD는 바꾸지 않았다. 최종 전체 통합은 Phase 6에 남긴다.
- `NPM_PUBLISH_ENABLED` 미설정 시 검증은 실행하고 publish/record job만 생략한다. npm environment/main 보호·Trusted Publisher 등록·첫 발행 2일 만료 조건·변수 활성화는 소유자/관리자의 운영 작업이며 아직 수행하지 않았다.

근거: `/workspace/work/lithent-phase4/{all-release-fixtures,workflow-fixtures,production-entry-guards,repack-control}.log`.

Files:

- `.github/release-policy.json` (added)
- `.github/workflows/ci.yml` (added)
- `.github/workflows/docs.yml` (modified)
- `CHANGELOG.md` (modified)
- `CONTRIBUTING.md` (modified)
- `RELEASING.md` (modified)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `lithentConcurrent/src/index.ts` (modified)
- `package.json` (modified)
- `pnpm-lock.yaml` (modified)
- `scripts/ci-build-artifacts.mjs` (added)
- `scripts/execute-release.mjs` (added)
- `scripts/github-release-api.mjs` (added)
- `scripts/npm-registry.mjs` (added)
- `scripts/plan-release.mjs` (added)
- `scripts/publish-release.mjs` (added)
- `scripts/record-release.mjs` (added)
- `scripts/release-changes.mjs` (added)
- `scripts/release-context.mjs` (added)
- `scripts/release-inputs.mjs` (added)
- `scripts/release-packages.mjs` (added)
- `scripts/release-plan.mjs` (added)
- `scripts/release-policy.mjs` (added)
- `scripts/tests/execute-release.test.mjs` (added)
- `scripts/tests/publish-release.test.mjs` (added)
- `scripts/tests/record-release.test.mjs` (added)
- `scripts/tests/release-consumers.test.mjs` (added)
- `scripts/tests/release-inputs.test.mjs` (added)
- `scripts/tests/release-plan.test.mjs` (added)
- `scripts/tests/release-workflow.test.mjs` (added)
- `scripts/verify-plan-consumers.mjs` (added)
- `scripts/verify-release.mjs` (modified)
- `src/index.ts` (modified)

## Phase 5 — Test Hardening: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-7, RQ-10, RQ-11, RQ-12, RQ-13, RQ-14, DC-1, DC-2, DC-3, DC-6, DC-27, DC-28, IC-2, M-1, M-2, M-3, M-4, M-6, M-7, M-8, M-9, M-12

진입: Phase 1~4의 각각의 종료 기준을 충족한다.

- [x] cleanup 등록별 격리·큐 선비우기·비동기 보고·fallback을 각각 제거한 4개 결함을 두 코어에서 모두 검출했다. 재진입 행위자를 한 번으로 제한해 stack overflow 없이 실제 호출 횟수 단언을 실패시켰다.
- [x] 정상 cleanup 22개·실제 element 복구 8개를 통과했다. registry HTTP 오류/404 구분과 실제 abort deadline을 없애면 해당 단언이 실패했다.
- [x] private/초기 기준/버전·archive/source/경로·event/ref·부분 실패/중복 발행·receipt SHA/성공 여부·CI 엔진/게이트/권한/취소 등 총 29개 결함을 모두 검출했다. 정상 CI fixture는 하네스 보호 4개를 더해 39 PASS다.
- [x] 공개 DOM·cleanup 호출/원래 오류·실제 파일/설치 소비자·명령/registry/태그 요청을 관측한다. 검사 0/skip/잘못된 수집/강제 종료/spawn/import 오류를 검출 성공으로 세지 않는 하네스도 검증했다.
- [x] CI Quality에 독립 mutation runner를 연결하고 정상 기준선 뒤 결함 주입을 강제한다. 보고서/로그만 7일 보관하며 /tmp 소스 사본·node_modules symlink는 업로드하지 않는다.

Baseline: Phase 1~4의 정상 결과와 정확한 source/artifact SHA.
Exit: 주요 실패 경로를 검출하고 알려진 결함·미실행 항목을 성공과 구분한다.

U-11에 따라 Phase 4 리뷰를 실행하지 않고 진행한다. 시작 상태/hash는 `/workspace/work/lithent-phase5/start*`에 보존했다.
정상 기준선은 두 코어 cleanup 22개·element 복구 8개와 기존 CI fixture 35개다.
결함 주입 runner는 source 사본만 수정하며 정상 test 수/skip, 실제 assertion 실패 이름/메시지와 실행 오류를 구분한다.
검출되지 않은 변이는 숨기지 않고 첫 보고서를 보존한 뒤 관측 단언을 보강한다. 제품 계약 변경이 필요하면 먼저 DESIGN에 기록한다.

첫 실행 `artifacts/hardening/run-yYYGM6/summary.json`: 정상 cleanup 22개/Node fixture 31개 PASS, 29개 변이 중 26개 검출/3개 생존이다.
생존은 artifact-no-path-boundary, publish-ignore-event, publish-ignore-ref이며 DC-28에 원인과 보강 기준을 기록했다.
제품의 보호 코드 결함이 아니라 기존 음성 검사가 다른 오류로 통과하던 검출력 빈틈이다. 첫 보고서/로그는 보존한다.

2026-11-07 최종 결과:

| 검증                                      | 결과                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| `pnpm test:ci`                            | 39 PASS, skip 0; 실제 local registry 소비자 포함            |
| mutation 정상 기준선                      | cleanup 11 × 2코어 + 선택 Node fixture 31 = 53 PASS, skip 0 |
| cleanup 결함                              | 4종 × 2코어 = 8/8 검출                                      |
| 후보/registry 결함                        | 5/5 검출                                                    |
| artifact/소스 경계 결함                   | 4/4 검출                                                    |
| 발행 guard/부분 실패/재시도 결함          | 6/6 검출                                                    |
| 성공 receipt/태그 SHA 결함                | 2/2 검출                                                    |
| 실제 CI YAML 결함                         | 4/4 검출                                                    |
| element cleanup 실제 runner               | base 4 + Concurrent 4 = 8 PASS, skip 0                      |
| actionlint·Prettier·ESLint·diff·파일/Refs | PASS; style.log/lint.log·CLI·문서/Files 대조                |

최종 보고서: `artifacts/hardening/run-2T2E8a/summary.json`, SHA-256
`87e168fe9d8ab539d72d7b9f955d67b2a0a1c0dd373c7e8c77feff5dac70e31d`.
모든 결함이 동일한 테스트 수/이름을 유지한 채 의도한 assertion을 실패시켰다. `workingTreeSourcesUnchanged=true`를 확인했다.
런타임/발행 보호 소스는 수정하지 않았다. `src/utils/universalRef.ts`와 양 코어 UMD hash는 Phase 1 기록과 같다.
이 단계에서 앱/패키지 rebuild·전체 dual/toolchain·E2E를 반복하지 않았으며 최종 전체 통합은 Phase 6 범위다.

원본/최종 보고서 복사본과 전체 출력은 `/workspace/work/lithent-phase5/{mutations-first-report.json,mutations-final-report.json,mutations-initial.log,mutations-final.log,ci-fixtures.log}`에 있다.
실제 element JSON/로그는 같은 경로의 `element-{base,concurrent}.{json,log}`다. npm 발행·GitHub 쓰기·push·커밋은 수행하지 않았다.

Files:

- `.github/workflows/ci.yml` (added)
- `CONTRIBUTING.md` (modified)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `scripts/check-reliability-mutations.mjs` (added)
- `scripts/hardening-node-reporter.mjs` (added)
- `scripts/hardening-utils.mjs` (added)
- `scripts/tests/ci-artifacts.test.mjs` (added)
- `scripts/tests/hardening-harness.test.mjs` (added)
- `scripts/tests/publish-release.test.mjs` (added)
- `src/tests/core-cleanupErrors.test.ts` (added)

## Phase 6 — Integration Test와 인계: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, RQ-13, RQ-14, RQ-15, DC-1, DC-2, DC-3, DC-4, DC-5, DC-6, DC-7, DC-8, DC-9, DC-27, DC-28, DC-29, DC-30, IC-1, IC-2, M-1, M-2, M-3, M-4, M-5, M-6, M-7, M-8, M-9, M-10, M-11, M-12, M-13

진입: Test Hardening 통과 후 실제 최종 소스와 산출물이 고정됐다.

- [x] 별도 clean snapshot SHA에서 frozen install·fresh build·전체 dual/toolchain/CI·실제 8 pack/7 후보·크기·3엔진 E2E를 통과했다. 기존 dist/node_modules는 복사하지 않았다.
- [x] 합성 catalog에서 한 패키지만 버전업한 경우 해당 1개만 설치/검증/발행 모의/태그 처리했고, root+Concurrent 버전업은 의존 순서로 처리했다. 실제 Lithent archive 소비자는 별도로 8 pack/7 후보를 통과했다.
- [x] production adapter를 사용하는 합성 통합에서 A 성공/B 실패→같은 commit 재계산→B만 재실행→원래 성공 receipt를 합친 tag/docs 요청을 확인했다. 실제 YAML/권한/이벤트 가드와 함께 CI fixture 41개가 통과했다.
- [x] 코드/로컬 검증 완료와 GitHub required CI·npm 환경/Trusted Publisher/활성화 변수·실제 발행/tag/docs 운영 미완료를 각각 표시했다.
- [x] 네 정본의 결정/결과/미완료/인계를 정렬했다. 사용자 브랜치 HEAD와 검증용 local commit을 구분하고 코드 입력 동일성을 확인했다.

Baseline: Hardening 종료 시점의 동일 SHA·동일 tarball manifest.
Exit: RQ 추적이 완성되고 운영 미활성화·실제 Safari 미검증 등을 숨기지 않는 인계가 가능하다.

U-12에 따라 Phase 5 리뷰를 실행하지 않는다. 시작 상태/hash는 `/workspace/work/lithent-phase6/start*`에 보존했다.
DC-29의 검증 사본은 clean snapshot SHA를 사용하고 사용자 브랜치의 HEAD는 그대로 둔다.
DC-30의 합성 배포 통합 fixture와 실제 패키지/브라우저 검증을 구분해 기록한다.
브라우저는 다른 CPU 집약 검증과 겹치지 않게 순차 실행한다. 이 managed host의 Phase 3 local browser 라이브러리/환경 보완은 CI 설정에 넣지 않는다.

검증 snapshot `0f7c8f2af837d128ebe2f284f4b33731b6cb3a04`의 frozen install·fresh workspace build·dual 1,206 PASS/기존 skip 3·toolchain 172 PASS·CI fixture 41 PASS·mutation 29/29 검출·실제 8 pack/7 후보 소비자·size를 통과했다.
release/plan/proof/build manifest는 모두 같은 SHA와 dirty=false를 확인했다. 417파일 bundle 생성/검증 후 새 browser-consumer checkout에 frozen install·복원·clean hash 대조를 통과했다.
기존 dirty bundle의 436파일과 비교해 빠진 19개는 basic/examples/docs의 과거 해시 JS/CSS/map 자산뿐이다. 신규 누락 exports는 없으며 실제 공개 진입점 검증을 통과했다(`build-inventory-diff.json`).
Chromium/Firefox/WebKit 각각 90 PASS로 총 270개가 첫 실행에서 통과했다. 모든 test의 결과가 passed 1회이며 expected failure·retry·skip·flaky·unexpected는 없다.
세 엔진의 case 집합과 base 44/Concurrent 46 구성도 일치한다. E2E 후에도 복원 bundle 417파일 hash와 두 checkout의 clean 상태를 다시 확인했다.
결과는 `/workspace/work/lithent-phase6/{quality-summary.json,browser-summary.json,code-equivalence.json,tool-versions.json,logs,reports}`에 보관한다.

최종 검증 환경: Node 24.22.1 / pnpm 12.15.0 / npm 11.9.0 / TypeScript 5.6.3 / Playwright 1.63.0.

| 검증                                | 최종 결과                                                          |
| ----------------------------------- | ------------------------------------------------------------------ |
| frozen install·전체 workspace build | PASS, clean source 유지                                            |
| dual: 두 코어·모든 satellite        | 13 runner, 1,206 PASS / 기존 skip 3                                |
| 다섯 toolchain suite                | 172 PASS / skip 0                                                  |
| Node CI/배포 fixture                | 41 PASS / skip 0; 합성 end-to-end 2개 포함                         |
| 결함 주입                           | 29/29 검출, 정상 baseline 53 PASS                                  |
| 실제 release 검증                   | 8 archive·11 core 공개 경로·도구/CLI·strict ESM/CJS/혼합 타입 PASS |
| 실제 후보 소비자                    | 7 PASS; 실제 registry 조회는 7 미발행 후보/1 baseline 제외         |
| size Brotli                         | base 4,953B / Concurrent 6,986B / element 998B, 모두 예산 PASS     |
| Chromium 153.0.8010.12              | 90 PASS (base 44 + Concurrent 46), 2.1분                           |
| Firefox 155.0                       | 90 PASS (base 44 + Concurrent 46), 3.3분                           |
| WebKit 26.6                         | 90 PASS (base 44 + Concurrent 46), 4.0분                           |
| 별도 checkout 복원/전후 대조        | 417파일 hash PASS, dirty=false 유지                                |

검증용 local commit: `0f7c8f2af837d128ebe2f284f4b33731b6cb3a04`.
release manifest SHA-256: `441bb5d4aceeaa9923b948fd82b329b14068e9c1f73c64a2281ba527ad5edf84`.
build bundle SHA-256: `098d0b0eed759e46bcd2a86d09ad82ba3c3c654410543075d2eec50a39d16fbb`.
Phase 6 종료 시점에는 코드/테스트/workflow/정책 등 1,408개 입력 중 1,407개가 검증 snapshot과 같은 byte hash였다. 합성 배포 통합 테스트 1개는 최종 Prettier 검사에서 호출 체인의 줄바꿈만 정리했다. 위치 정보를 제외한 AST가 같고 해당 통합 테스트 2개가 재통과했다(`test-format-equivalence.json`, `logs/integration-format-recheck.log`). 이 전체 검증은 위 snapshot SHA의 수정 전 이력이며 이후 배포 도구 변경과 검증은 Phase 7에 기록한다.
사용자 브랜치 `review/cleanup-ci-browser`의 HEAD는 `d594983897bab460b469cea8c6e73dfd354f1fd2` 그대로이며 commit/push/merge하지 않았다.

| 요구사항                     | 최종 로컬 근거와 운영 구분                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| RQ-1, RQ-2, RQ-3, RQ-4, RQ-5 | dual·실제 cleanup/element·native/fallback E2E·mutation 통과                                     |
| RQ-6, RQ-7                   | 전체 Quality·3엔진·gate/artifact 음성 검사 통과; 실제 GitHub run/required CI 설정은 미완료      |
| RQ-8, RQ-9                   | 동일 case 270개, 실제 엔진/버전·retry/skip 0; 실제 Safari/OS IME는 미검증                       |
| RQ-10, RQ-11, RQ-12, RQ-14   | 실제 8 archive/7 후보·합성 단일/복수 버전업/부분 실패 재실행·SHA/정책/권한 경계 통과            |
| RQ-13, RQ-15                 | main 검증 후 OIDC·성공 tag/docs 코드와 mock 통과; 외부 초기 설정/원격 발행·사이트 배포는 미실행 |

운영 인계: [RELEASING](../../RELEASING.md)의 순서대로 저장소 관리자가 required **CI**·**npm** 환경의 main 제한·**NPM_PUBLISH_ENABLED=true**를 설정하고, 패키지 소유자가 실제 발행할 각 패키지에 **ci.yml / npm** Trusted Publisher와 직접 publish 허용을 등록한다.
새 연결의 첫 발행 2일 조건과 원래 run/SHA의 receipt 재시도·30일 보관도 같은 문서에 있다. 이 세션에서 외부 설정·npm publish·GitHub tag/docs 쓰기는 수행하지 않았다.

Files:

- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `scripts/tests/release-integration.test.mjs` (added)

## Phase 7 — 최종 리뷰의 미확정 발행 복구: done

Refs: RQ-11, RQ-12, RQ-14, RQ-15, RQ-16, DC-23, DC-26, DC-27, DC-31, M-7, M-9, M-10, M-14

진입: U-13 최종 리뷰에서 결함 1건을 모의 응답으로 재현하고 U-14로 수정 요청을 받았다.

- [x] 업로드 후 확인 실패를 `unconfirmed`로 구분하고 원래 run/SHA의 receipt를 재확인해 tag/docs를 복구한다.
- [x] HTTP 오류/timeout/404 기한 소진 뒤 재실행, 기록 job만 재실행, 같은 commit 재계산을 회귀로 연결한다.
- [x] 다른 run/SHA/archive·integrity 충돌·skipped/미시도 건의 무단 복구를 거부하고 미확정 기록은 실패시킨다.
- [x] 정상 기준선·추가 결함 주입·전체 CI fixture·정적 검사를 통과하고 운영 문서와 현재 인계를 정렬한다.

Baseline: Phase 6 실제 검증 이력과 최종 리뷰의 빠른 검사 36 PASS·417파일 대조 PASS. 새 회귀는 수정 전 의도한 단언으로 실패해야 한다.
Exit: 동일 run/SHA의 확인 가능한 발행은 중복 upload 없이 tag/docs를 복구하고, 확인 불가는 빈 성공으로 종료하지 않는다. 실제 npm/GitHub 쓰기 없이 검증하고 기존 전체 build/E2E 이력과 새 배포 도구 검증을 구분한다.

시작 상태/hash는 `/workspace/work/lithent-phase7/start*`에 보존한다. U-15로 formal 재리뷰를 실행했고 APPROVE였다.

2026-11-07 검증 결과:

| 검증                              | 결과                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| 수정 전 새 회귀                   | 4개가 의도한 assertion으로 FAIL; 같은 파일의 13개 PASS                  |
| executor/record 수정 후 대상 회귀 | 17 PASS, skip 0                                                         |
| 전체 `pnpm test:ci`               | 47 PASS, skip 0; production adapter 합성 통합 3개 포함                  |
| 업로드 뒤 확인 오류/기한 소진     | unconfirmed 보존, 재시도 시 중복 upload 없음                            |
| 원래 run/SHA의 세 복구 경로       | publish 재시도·record만 재시도·후보 0 재계산 모두 tag/docs 복구 PASS    |
| 계속 미확정·다른 run/SHA/bytes    | 기록 실패/쓰기 거부 PASS; 독립 성공 패키지는 기록                       |
| 결함 주입                         | 기존 29 + 새 4 = 33/33 검출; 정상 baseline 58 PASS, 작업 트리 소스 불변 |
| 정적 검사                         | Prettier·Node 구문·actionlint·diff 공백·Refs/Files/링크 대조 PASS       |

첫 전체 CI는 기존 부분 실패 통합 fixture가 미확정 B의 기록을 성공으로 기대해 46/47이었다. A의 tag/docs는 기록되지만 B가 계속 404이면 기록 job은 실패해야 하므로 그 기대를 정렬한 뒤 47/47을 통과했다. 첫 로그도 `ci-fixtures-first.log`에 보존했다.
하드닝은 미확정 상태 제거·integrity 충돌의 잘못된 복구 허용·미확정 receipt 무시·기록 실패 숨기기 4개를 추가해 각각 의도한 assertion으로 검출했다.
보고서 `artifacts/hardening/run-Xp9JAQ/summary.json`의 SHA-256은 `d9ca01075a33c53545ee64c6f4560684f789fe3b05f3366703f951c0160dc107`이다.
상세 로그/보고서/시작 hash와 결과 요약은 `/workspace/work/lithent-phase7/`에 있다.

이번 변경은 배포 도구 2개·mutation runner·회귀와 문서에 한정했다. 제품 소스·패키지 manifest/lockfile·workflow가 Phase 6 입력과 같은지 hash로 확인했다. 패키지 rebuild나 전체 dual/toolchain/E2E를 다시 실행하지 않았으며 Phase 6 기록을 새 전체 CI 성공으로 취급하지 않는다. 실제 npm/GitHub 쓰기와 사용자 브랜치 commit/push/merge는 없다.

U-15 재리뷰(2026-11-07): 12파일 범위에서 Critical/Warning/Suggestion 0으로 APPROVE. 빠른 검사 41개, actionlint/Prettier/diff와 문서의 Refs/Files를 통과했다. 이전 오류 경로를 실제 검증 archive와 모의 registry/GitHub 응답으로 다시 실행해 unconfirmed→skipped 뒤에도 upload 1회·원래 SHA의 tag/docs 각 1회를 확인했다. 계속 확인 불가인 경우는 쓰기 0회와 기록 실패였다. 전체 47 fixture·33 mutation 보고서의 source hash도 현재 코드와 일치했다.

Files:

- `CONTRIBUTING.md` (modified)
- `RELEASING.md` (modified)
- `docs/reliability/DESIGN.md` (added)
- `docs/reliability/IMPLEMENT.md` (added)
- `docs/reliability/MANUAL_TEST_CHECKLIST.md` (added)
- `docs/reliability/REQUIREMENTS.md` (added)
- `scripts/check-reliability-mutations.mjs` (added)
- `scripts/execute-release.mjs` (added)
- `scripts/record-release.mjs` (added)
- `scripts/tests/execute-release.test.mjs` (added)
- `scripts/tests/record-release.test.mjs` (added)
- `scripts/tests/release-integration.test.mjs` (added)

## 현재 인계

- done: Phase 0~7 구현/로컬 검증과 U-15 재리뷰 APPROVE 완료. 전체 CI fixture 47 PASS·정상 baseline 58 PASS·33/33 결함 검출과 재리뷰의 빠른 검사 41 PASS를 확인했다. U-16의 npm 재조회에서 root 1.25.6·Concurrent 0.2.5·hmr-parser 0.2.4·MDX 0.2.7·template-parser 0.1.2·template-vite 0.1.2·Vite 0.3.5는 모두 미발행이었다. create-lithent 0.3.4는 기존 발행 버전으로 유지한다. 내부 workspace 의존성은 검증 archive의 새 버전으로 치환된다.
- next: 사용자가 이미 요청한 커밋/PR 생성을 진행하고 원격 CI 결과를 확인한다. 실제 활성화는 RELEASING의 외부 초기 설정과 원격 main CI·발행/tag/docs 운영 근거를 별도로 남긴다. 추가 구현 phase나 리뷰 선택을 다시 묻지 않는다.
- blockers: 코드/버전업/리뷰의 차단 항목은 없다. npm Trusted Publisher와 required CI·npm 환경 main 제한·NPM_PUBLISH_ENABLED=true 설정 및 실제 원격 발행은 별도 미완료다. 이미 확정된 main 검사 성공 후 발행을 재질문하지 않는다.
- latest commit: 작성 기준 사용자 브랜치 `review/cleanup-ci-browser`의 HEAD는 `d594983897bab460b469cea8c6e73dfd354f1fd2`다. 이 인계를 포함한 최종 변경 커밋은 해당 브랜치 HEAD(`git rev-parse HEAD`)로 확인한다. 이전 전체 검증 사본은 `0f7c8f2af837d128ebe2f284f4b33731b6cb3a04`이며 원격 main/OIDC 실행으로 취급하지 않는다.
- source of truth: 버전은 8개 허용 manifest와 `.github/release-policy.json`에 있고 U-16의 재조회 근거는 `/workspace/work/lithent-pr/npm-versions.json`에 있다. 배포 도구의 최신 검증은 `/workspace/work/lithent-phase7/`, 이전 전체 build/8 pack/7 후보/3엔진 270 PASS는 `/workspace/work/lithent-phase6/`에 보존한다. 이번 출고 정리는 리뷰 결과/인계 기록만 갱신하며 검증된 제품/배포 코드와 준비 버전을 바꾸지 않는다. 실제 Safari/IME·외부 OIDC/패키지 권한·원격 배포는 미확인 상태다.

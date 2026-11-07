# DESIGN — 오류 복구·검증·선택적 npm 배포

- 상태: Phase 7 로컬 검증과 U-15 재리뷰 APPROVE를 완료했다. DC-31은 47 fixture·33 mutation과 재리뷰의 빠른 검사 41개로 확인했다. U-16의 커밋/PR 준비에서 기존 7개 patch와 내부 의존성을 재확인했으며 발행 단위/초기 기준/인증 계약을 바꾸지 않는다. U-10의 main 필수 검사 성공 후 발행 조건과 외부 설정 미완료 상태는 유지한다.
- 정본 연결: [REQUIREMENTS](./REQUIREMENTS.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).

## 결정 목록

- [x] DC-0: 새 정본을 `docs/reliability/`에 둔다. 사용자 U-2와 여러 모듈에 걸친 소유 범위에 따른다. 검증: 문서 링크·중복 정본 검사.
- [x] DC-1: 전체 teardown을 계속하고 `reportError`로 보고하며 함수가 없는 환경에서는 microtask에서 원래 오류를 던진다. 2026-11-06 사용자 U-6 승인. 한 cleanup의 오류가 후속 정리를 막지 않으면서 원래 오류를 전역에서 관측하기 위한 선택이다. `destroy()` 호출자는 cleanup 오류를 동기 try/catch로 받지 않는다. 검증: RQ-1~RQ-5, M-1~M-3.
- [x] DC-2: 실행할 cleanup 큐를 먼저 분리·비우고 등록 순서대로 개별 실행한다. 동일 함수의 중복 등록은 각각 한 번이며 map 수동 관리 정책은 유지한다. 재진입 시 DOM 중복 제거까지 안전한지는 별도 회귀로 확인한다. 검증: RQ-2, RQ-3.
- [x] DC-3: PR 검증과 발행 권한을 분리한다. 실패·미실행 검증은 발행의 성공 조건이 아니다. 검증: RQ-6, RQ-7, RQ-13, M-4, M-9.
- [x] DC-4: 브라우저를 CI job 행렬로 분리하고 기존 프로젝트 이름 `base`/`concurrent`는 유지한다. 테스트·포트·HMR 경로의 이름 의존을 보존하기 위해서다. 검증: RQ-8, RQ-9, M-5.
- [x] DC-5: 공개 패키지별 manifest 버전업을 발행 의사로 사용한다. 전체 일괄 bump나 git 경로 변경만으로 발행하지 않는다. 사용자 U-3/U-4의 선택이다. 검증: RQ-10, M-6.
- [x] DC-6: 공개 패키지 허용 목록 8개와 registry 존재가 확인된 초기 기준을 `.github/release-policy.json`에 고정했다. 실제 read-only dry-run은 준비 버전 7개만 후보로, generator 0.3.4는 baseline으로 제외했다. fixture에서 미발행 bootstrap·새 패키지·private 자동 가입을 거부했다. U-4의 선택적 버전업 범위 내 구현 판단이며 npm 권한 활성화는 DC-8에 남긴다. 검증: RQ-10, RQ-11, M-6, M-7.
- [x] DC-7: U-10(2026-11-07)으로 main의 Quality·세 브라우저·최종 CI 성공 후 stable/latest 자동 발행을 확정했다. 같은 workflow의 main 수동 실행/재실행도 모든 검증 뒤 복구에 사용할 수 있다. prerelease는 보류한다. 운영 활성화는 npm/저장소 초기 설정과 별도로 기록한다. 검증: RQ-13, RQ-15, M-9.
- [x] DC-8: GitHub-hosted runner·지원 Node/npm CLI의 Trusted Publishing/OIDC로 구현한다. `.github/workflows/ci.yml`의 발행 job만 id-token:write를 가지며 environment는 npm이다. 소유자가 각 패키지에 owner/repo·ci.yml·npm 환경과 직접 npm publish 허용을 등록해야 한다. main만 허용하는 환경 보호와 required CI를 설정한 후 저장소 변수 NPM_PUBLISH_ENABLED=true로 활성화한다. 장기 토큰은 추가하지 않는다. 실제 외부 권한/등록은 미확인으로 M-9에 남긴다. 검증: RQ-15, M-9, event/ref/runner/CLI/OIDC guard fixture.
- [x] DC-9: 기존 `RELEASING.md`와 `CONTRIBUTING.md`를 새 정본에 연결하고 자동화 구현 후 발행 안내를 정렬한다. 2026-11-06 사용자 U-5 승인. 1.25.5 이력을 보존하고 구현 전 안내와 실행 절차가 혼동되지 않게 한다. 검증: RQ-15, M-10.
- [x] DC-10: base의 cleanup 복구 크기 예산을 별도 28B로 관리한다. 기존 4,925B + 28B = 4,953B이며 Concurrent/element 예산은 유지한다. 구현 판단으로, U-6의 오류 격리를 유지하면서 일반 최적화 경로를 변경하지 않기 위한 선택이다. 사전 측정의 control UMD SHA-256은 기준 빌드와 일치했고 복구 후보는 4,953B였다. 실제 반영본에서도 재측정한다. 검증: Phase 1 fresh build·size, RQ-1, RQ-4.
- [x] DC-11: CI는 Quality → Browser(chromium) → 고정 이름 CI gate로 구성한다. PR/main의 검사 실패·취소·생략은 gate 실패다. token은 contents: read만 허용하고 npm 발행은 하지 않는다. 세 엔진 행렬은 Phase 3에서 확장한다. 검증: RQ-6, RQ-7, M-4, M-11.
- [x] DC-12: 8개 공개 패키지를 실제 pack한 뒤 격리 소비자에서 선언한 exports·형식·타입을 검증한다. 소비자 overrides로 모든 내부 공개 의존성을 같은 tarball에 고정하고 필요한 공개 외부 의존성/peer는 registry에서 설치한다. workspace 링크로 검증을 대신하지 않는다. 기존 core의 strict Node16/NodeNext와 JSX/SSR 검사는 보존한다. 검증: RQ-7, RQ-12, M-8, M-11.
- [x] DC-13: 확대 검증으로 드러난 배포 형식 오류는 Phase 2에서 수정하고 해당 공개 패키지의 patch 버전을 올린다. hmr-parser/MDX/Vite의 기존 require 대상이 빈 객체를 반환하는 것을 구현 전 확인했다. 기존 브라우저 UMD 이름을 보존하면서 실제 .cjs 진입점과 조건별 선언을 제공한다. ESM-only template-vite에는 CJS 지원을 새로 강제하지 않는다. 검증: 8개 격리 소비자·개발 도구 독립 suite.
- [x] DC-14: release manifest는 검증을 모두 통과한 뒤 SHA-256/SRI·패키지명·버전·상대 archive 경로·source revision/dirty 상태와 함께 기록한다. CI build bundle도 파일별 hash로 검증한다. dirty 로컬 검증은 표시하고 clean 검증 조건으로 발행 가능한 CI 근거와 구분한다. 출력 디렉터리는 비어 있어야 하며 실패 실행이 과거 성공 manifest를 남겨 통과시키지 않게 한다. 검증: RQ-7, RQ-12, IC-2, M-11.
- [x] IC-1: core·element·helper는 테스트마다 동일 코어 인스턴스를 사용한다. Concurrent는 기존 alias 표를 재사용한다. 검증: 두 코어 회귀·공개 패키지 소비자.
- [x] DC-15: Phase 3는 LITHENT_E2E_BROWSER의 chromium/firefox/webkit만 허용하고 미설정 시 Chromium을 쓴다. 빈 문자열/오타/별칭은 실패다. CI는 세 job에서 동일 build bundle을 검증해 소비하며 base/concurrent 프로젝트 이름과 서버 포트를 유지한다. 보고서는 선택 엔진과 실제 버전을 남긴다. 검증: config 음성 fixture, 엔진별 discovery/전체 E2E, RQ-8, RQ-9, M-5.
- [x] DC-16: 새 입력 회귀는 실제 keyboard 입력과 native 대조군으로 이벤트 순서·신뢰 여부를 확인하고, 동일 노드의 renew와 다른 keyed 행 재정렬에서 focus/selection·입력값·DOM identity를 확인한다. Tab/Space 조작과 checked 상태도 검사한다. 프레임워크가 실제 이동시킨 DOM의 브라우저 기본 blur까지 새 보존 기능으로 확대하지 않으며, 문제를 발견하면 관찰 근거와 수정 범위를 먼저 기록한다. 실제 OS IME/Safari 검증으로 간주하지 않는다. 검증: 세 엔진의 새 form 회귀, M-5.
- [x] DC-17: 기존 Chromium 전용 CDP GC 호출은 세 엔진이 제공하는 Playwright page.requestGC로 바꾼다. Trusted Types 등 엔진 기능 차이는 실제 capability/기대 동작을 명시해 검사하며 조용한 skip으로 대체하지 않는다. GC 요청의 엔진별 보장 차이와 환경 실패를 제품 결함과 구분한다. 검증: 기존 parent-retention/CSP 전체 suite, RQ-8, M-5.
- [x] DC-18: Firefox의 browser.chrome.site_icons를 테스트 launch에서 끈다. 첫 전체 실행에서 페이지의 CSP 동작 단언은 통과했지만 브라우저 UI의 FaviconLoader가 암묵적으로 /favicon.ico를 요청해 default-src 'none'에 막힌 console 오류가 발생했다. 탭 아이콘 UI는 테스트 대상에 포함하지 않으며, CSP/Trusted Types 정책·단언과 모든 페이지 console/network 오류 검사는 유지한다. 검증: Firefox 전체 suite와 세 엔진 CSP 검사, M-5, RQ-9.
- [x] IC-2: 검증한 tarball·패키지명·버전·integrity·SHA를 manifest로 고정하고 publish가 그대로 사용한다. 소스에서 다시 pack한 다른 파일을 발행하지 않는다. 검증: RQ-12, M-8.

## cleanup 경계

`src/utils/universalRef.ts`의 공유 cleanup 루프를 우선 경계로 삼는다. 각 등록을 try/catch로 격리해
동일 컴포넌트와 나머지 트리가 끝까지 진행되도록 한다. `disposeComponentEntry`와 공유 unmount 경로,
양쪽 render/diff의 destroy·교체·keyed 제거에서 결과를 확인한다. DOM 작업 자체의 모든 예외까지 삼키는 확장은 하지 않는다.

확정한 DC-1에 따라 `destroy()`가 cleanup 예외를 동기로 다시 던지지 않는다.
오류를 유실하거나 `console.error`만 남겨 성공처럼 처리하지 않고 호스트 오류 보고 경로로 전달한다.
`reportError` 유무와 fallback의 비동기 예외는 별도로 관측하며, 보고 호출 자체가 teardown을 중단하지 않도록 경계를 검토한다.
[reportError 호환성 데이터](https://github.com/mdn/browser-compat-data/blob/main/api/_globals/reportError.json)의 브라우저 지원은 Chrome/Edge 95+, Firefox 93+, Safari 15.4+다. ESM 지원과는 별개이며 Node.js·테스트 환경에도 fallback이 필요할 수 있다.

보고는 각 cleanup의 catch에서 예약한 microtask가 실행한다. 정상 teardown을 먼저 끝내 전역 error handler의 재진입이 진행 중 정리를 건드리지 않게 한다.
그 microtask에서 reportError 호출이 불가능하거나 throw하면 원래 cleanup 오류를 그대로 던진다. 별도 reporter 오류로 교체하지 않는다.

element는 disconnect microtask에서 destroy 후 상태가 해제되는지 검사한다.
Phase 1에서 기존 코드로 실패한 shadow/light의 재연결·동일 태스크 이동 4개를 양 코어에서 다시 실행해 모두 통과했다.
cleanup 예외가 core 밖으로 나오지 않아 기존 element의 상태 비우기에 도달한다. 따라서 element 런타임의 추가 finally는 넣지 않았으며 998B를 유지했다.

## 개발 도구의 배포 형식

실행 소비자는 저장소의 고정 Node 24.22.1을 사용한다. Node16/NodeNext 검사는 TypeScript 해석 모드이며
Node 16 런타임 지원을 주장하지 않는다. MDX/Vite의 CJS 출력은 ESM 외부 의존성의 default를 interop: auto로 읽는다.
template-vite는 ESM 파일을 가리키는 default export 조건을 추가해 Node 24의 require(ESM) 해석을 허용하되
CJS 파일/조건은 추가하지 않는다. 실제 CJS 소비자는 플러그인 factory까지 호출해 빈 namespace·잘못된 default를 검출한다.
template-parser의 patch를 실제 packed 의존성에 반영하는 template-vite도 patch 버전을 올린다.

## PR 검증과 브라우저 행렬

새 CI는 PR와 main push를 받아 frozen install과 fresh build를 수행한다.
`test:dual`과 개발 도구 패키지 테스트의 합집합을 확인하며 root runner의 넓은 수집 범위만으로 누락이 없다고 추정하지 않는다.
패키지·타입·크기 검증은 fresh build 후 수행한다. `size-report.js`의 산출물 누락 성공 경로는 CI에서 허용하지 않는다.
필수 검사 이름은 고정하고 실패 로그·JUnit/HTML·trace·SHA를 보관한다.
branch protection/ruleset 활성화는 설정 작업으로 따로 기록하며 workflow 파일 추가만으로 강제 완료라고 쓰지 않는다.

Quality는 전체 fresh build, test:dual, 개발 도구 5개의 독립 runner, CI/pack 음성 fixture, 8개 패키지 소비자·Concurrent 산출물·size를 실행한다.
로그와 검증된 build/release artifact를 업로드하고 Browser의 세 job은 동일 SHA를 checkout해 bundle hash를 대조한 뒤 각 선택 엔진의 E2E를 실행한다.
검증 job에서 pipefail을 유지하고 실패해도 로그/trace를 수집한다. 마지막 job의 check 이름 CI를 required check로 안내하되 실제 저장소 설정은 별도다.
Phase 2·3 로컬 검증과 GitHub Actions의 실제 실행/필수 검사 활성화 상태는 구분해 기록한다.

Playwright는 `LITHENT_E2E_BROWSER=chromium|firefox|webkit`으로 해당 desktop 장치와 browserName을 함께 고른다.
알 수 없는 값과 빈 값은 실패하며, 로컬 미설정 기본값은 Chromium이다.
각 job은 프로젝트 이름 `base`/`concurrent`, 서버 포트, core 식별 단언을 유지한다.
job마다 독립 runner에서 실행해 `.e2e-work`와 포트가 충돌하지 않게 한다.
입력 후 동일 노드의 renew와 다른 keyed 행 재정렬에서 focus/selection을 유지하는지, Tab 이동·native 이벤트 순서·cleanup 후 이벤트가 맞는지 검증한다.
실제 focused DOM을 이동시키는 native 연산의 focus 효과는 새 보존 API를 약속하지 않고 별도 관찰·근거로 구분한다.
실제 IME·Safari/OS 조합은 수동 항목으로 남기며 fill 호출을 실제 IME 검증이라고 부르지 않는다.

## 선택적 npm 발행: 제안 계약

U-9에 따라 후보 계산/검증부터 구현했고 U-10으로 main 전체 검증 후 발행 시점 DC-7을 확정했다. 실제 외부 활성화와 코드 구현을 구분한다.
`.github/release-policy.json`의 초기 기준은 REQUIREMENTS의 registry 존재 기준 표이며 준비 버전 7개를 기준으로 올려 누락시키지 않는다.
[npm Trusted Publishers 공식 문서](https://docs.npmjs.com/trusted-publishers)에 따르면 Node >=22.14.0, npm CLI >=11.5.1과 GitHub-hosted runner가 필요하다.
현재 로컬 Node 24.22.1/npm 11.9.0은 CLI 요건을 만족한다. 패키지별 등록/권한은 별도 미확인이다.
2026년 신규 publisher 설정에는 직접 `npm publish` 허용 action을 선택해야 하므로 workflow filename/owner/repo와 함께 운영 체크리스트에 기록한다.

- [x] DC-19: 첫 구현은 read-only 후보 계산이다. `.github/release-policy.json` 한 곳에 8개 이름/경로/초기 발행 기준을 두고 pack 검사도 이 목록을 재사용한다. 현재 버전이 기준과 같으면 bootstrap 보류, 높은 stable 버전만 registry 대조한다. private/미등록 패키지는 자동 가입하지 않으며 invalid/downgrade는 실패한다. prerelease는 별도 dist-tag 결정 전 보류한다. U-4 범위 안의 구현 판단이며 실제 npm 권한 등록은 별도다. 검증: M-6, M-7, 후보 0/1/복수 fixture·현재 registry dry-run.
- [x] DC-20: registry는 공개 npm HTTPS endpoint만 사용하고 bounded timeout으로 조회한다. HTTP 404인 정확한 버전과 401/403/429/5xx·timeout·잘못된 metadata를 구분한다. 등록된 패키지 자체가 사라진 경우 새 패키지 발행으로 해석하지 않는다. SemVer/range는 기존 lockfile에 있는 semver 7.6.2를 root 직접 devDependency로 고정해 검사한다. 검증: registry mock·M-7·frozen install.
- [x] DC-21: pack manifest의 실제 runtime/optional/필수 peer 의존성에서 발행 순서를 구하고, 선택되지 않은 내부 의존 버전은 registry의 실제 가용성을 검증한다. 현재 workspace tarball 전체를 설치한 Phase 2 검사 외에, 발행 후보 소비자는 선택 tarball과 실제 배포될 registry 의존성을 사용해 검증한다. unversioned dependency 변경을 자동 bump하거나 로컬 override로 숨기지 않는다. 검증: M-6, M-8, 후보별 소비자와 누락 의존/peer/순환 fixture.
- [x] DC-22: 후보 소비자가 같은 TypeScript 프로그램에서 ESM/CJS를 함께 읽을 때 나타난 JSX 전역 index signature 중복을 수정한다. 두 코어의 IntrinsicElements를 같은 Record<string | number, Props> base로 선언해 병합하며 기존 key/value 타입을 보존한다. 복사한 실제 tarball에서 수정 전 TS2374, 수정 후 strict 통과와 key/value 타입 동등성을 확인했다. 기존 skipLibCheck:false를 유지하고 양 코어·양 형식의 혼합 프로그램도 검사한다. 런타임 변경 없이 기존 준비 버전 root 1.25.6/Concurrent 0.2.5에 포함한다. 검증: M-8, 후보 소비자·verify:release·fresh build/size/hash.
- [x] DC-23: 발행 이벤트 결정과 독립적으로 주입형 실행기를 먼저 검증한다. 실제 npm CLI를 기본값으로 두지 않고 검증한 archive/후보 소비자 증거를 요구한다. 매 발행 직전 registry를 새로 조회하고 stable 최신 버전·의존 범위를 확인한다. 순서대로 실행하고 각 결과를 저장하며 첫 실패에서 중단한다. 정확한 버전의 registry integrity가 검증한 tarball과 일치해야 성공이다. CLI 오류 후에도 일치하는 발행이 확인되면 성공으로 복구한다. 오래된 후보의 동일 버전이 다른 내용이면 검증한 의존성을 바꿀 수 있어 실패시키며 재발행·tag 대상으로 삼지 않는다. 재시도는 registry에서 이미 존재하는 버전을 건너뛴다. 실제 발행·권한 활성화는 DC-7/DC-8이 정리된 뒤에만 연결한다. 검증: M-7, M-8, 주입형 partial failure·지연 가시성·integrity 충돌·downgrade fixture.
- [x] DC-24: PR/main의 Quality에 read-only 후보 계산과 후보 소비자를 연결한다. plan·consumer proof도 기존 same-run/SHA build bundle의 hash 목록에 넣고 브라우저 job에서 다시 대조한다. 후보·검증 실패 보고서는 별도 artifact로 남긴다. 소스 변경 안내는 PR base SHA 또는 push before SHA의 파일 diff와 catalog의 sourcePaths로 계산하며 선택 조건으로 쓰지 않는다. 공유 src 변경은 두 코어에 안내하고, 제외된 소유 패키지는 버전 검토 경고를 남긴다. 비교 기준이 없는 수동 실행은 미검사로 명시한다. 발행 job/권한은 DC-25로 분리한다. 검증: M-6, M-8, source ownership fixture·proof 변조 거부·실제 bundle 복원.
- [x] DC-25: 실제 publish는 같은 ci.yml의 quality/browser/gate 성공과 신뢰하는 main push 또는 main workflow_dispatch에 한정한다. 보호된 npm environment와 명시적 초기 활성화 변수, clean same-SHA artifact/proof, GitHub-hosted runner, OIDC 요청 변수, Node/npm 최소 버전을 검사한다. 검증한 archive 절대 경로를 npm publish --access public --tag latest --provenance --ignore-scripts에 넘긴다. 별도 빈 npm 설정/작업 경로를 사용하고 장기 토큰 fallback을 허용하지 않는다. PR만 cancel-in-progress=true, main과 저장소 전체 발행 concurrency는 false다. 검증: M-9, mock CLI guard·정확한 argv·실패 job/권한 fixture.
- [x] DC-26: quality가 만든 build artifact 이름을 job output으로 전달해 failed-jobs 재실행 시 run_attempt가 바뀌어도 원래 검증 묶음을 찾는다. 발행 결과는 원자적 파일 교체로 등록별 저장하고 always artifact로 남긴다. 별도 contents:write/actions:write job은 같은 workflow run/SHA의 모든 attempt receipt를 읽어 published 또는 DC-31의 미확정 시도를 registry integrity로 확인한 항목만 동일 SHA에 package-name@version 태그를 만든다. 기존 다른 SHA 태그는 덮어쓰지 않는다. root 성공은 docs.yml workflow_dispatch를 정확한 태그와 release_sha로 명시 호출하며 문서 배포 완료와 dispatch 접수를 구분한다. GitHub Release는 자동 생성하지 않는다. 검증: M-7, M-10, M-14, partial receipt·재실행·tag 충돌·dispatch 실패 fixture.

태그 복구는 원래 발행 run/SHA의 receipt를 사용한다. 다른 main push의 SHA에 과거 발행 버전을 붙이지 않는다.
원래 run의 tag/docs job만 재실행하거나 해당 run의 실패 job을 재실행한다. receipt artifact 보관은 30일이며 만료/유실 시 provenance와 원래 SHA를 확인하는 수동 복구가 필요하다.

### 1. 발행 단위와 초기화

명시적 설정 파일 `.github/release-policy.json`에 RQ-10의 8개 이름·manifest 경로·초기 기준 버전을 둔다.
이름 중복, 경로 탈출, private 패키지, 잘못된 semver, registry/repository 메타데이터 불일치는 실패한다.
발행 후보 archive의 repository는 공개 `https://github.com/<owner>/<repo>.git`(git+ prefix 허용)과 정책 저장소가 일치해야 한다.
기존 기준 버전으로 제외되는 generator의 과거 SSH 형식은 이번에 임의로 수정/버전업하지 않는다. 향후 발행 후보가 될 때 정렬한다.
현재 버전 표는 검증한 초기 기준이며 **등록된 패키지 전부를 첫 실행에 발행한다는 뜻이 아니다**.
첫 dry-run을 확인해 DC-6으로 기준을 고정했다. 새 패키지는 초기 발행 의사와 기준을 명시한 별도 등록이 필요하다.

개별 서브패스 소스 변경은 소유 공개 패키지의 버전업으로 표현한다.
예를 들어 `element/src` 변경은 root `lithent` 버전업, Concurrent helper 변경은 `lithent-concurrent` 버전업에 해당한다.
발행할 코드가 바뀌었는데 버전이 그대로면 발행하지 않고 후보 보고서에 그 사실을 보인다.

### 2. 후보 선택과 registry 조회

대상은 검증한 main 커밋 SHA다. 후보 계산 결과에는 모든 허용 패키지의 선택/제외 이유를 기록한다.
직전 두 커밋의 manifest diff만을 기준으로 삼지 않는다. 직전 발행 실패 뒤 버전 변경 없는 재실행도 복구해야 하기 때문이다.

| 상태                                                    | 결과                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| private 또는 허용 목록 밖                               | 제외                                                                |
| 초기 기준 버전과 같으며 이번 자동화의 발행 기록이 없음  | 초기 기존 상태로 제외; 도입만으로 발행하지 않음                     |
| 유효한 버전 증가이며 npm의 정확한 `name@version`이 없음 | 미발행 후보                                                         |
| 정확한 `name@version`이 이미 존재                       | 이미 발행됨으로 제외; 재실행에서 성공한 패키지를 다시 발행하지 않음 |
| 후보 버전이 기준/허용한 현재 릴리스보다 낮음            | downgrade 오류                                                      |
| registry 요청이 인증·네트워크·5xx로 실패                | 미발행으로 간주하지 않고 실패                                       |
| prerelease 또는 신규 패키지                             | DC-6/DC-7의 별도 정책이 확정되기 전 발행 보류                       |

후보 버전과 registry 결과를 결합하고 각 단계의 버전 기준을 구현 시 fixture로 고정한다.
registry의 `latest` 하나만으로 다른 dist-tag의 동일 버전 존재를 판정하지 않는다.
이미 발행한 버전과 다른 내용을 덮어쓰려는 요청은 허용하지 않는다.
실행 중 발행한 패키지는 tarball integrity와 결과를 기록해 부분 실패 재시도를 검증한다.

### 3. 의존 그래프와 pack 검증

내부 runtime dependencies/optionalDependencies와 필요한 peer 범위를 확인한다.
동시에 발행하는 새 버전에 의존하면 의존 패키지를 먼저 발행하고 registry 가용성을 확인한다.
순환 관계·존재하지 않는 의존 버전·불충족 peer는 실패시킨다. CI가 종속 패키지 버전을 임의로 올리지 않는다.

특히 pnpm의 `workspace:*`는 pack 과정에서 현재 workspace 버전으로 바뀐다.
의존 패키지 버전만 올리고 그 새 버전을 채택할 소비자 버전을 올리지 않으면,
소비자는 기존 npm 패키지에 기록된 범위를 계속 사용한다. 소비자도 새 범위를 배포해야 할 때는 작업자가 그 버전도 올린다.

Phase 2의 `scripts/verify-release.mjs`는 8개 패키지의 manifest/exports/bin/files/workspace 치환과 실제 설치 소비자를 검증한다.
각 패키지가 실제로 선언한 형식과 공개 진입점을 검사한다. ESM-only 패키지에 CJS 지원을 새로 강제하지 않는다.
모든 패키지의 pack 검증을 통과했다고 모든 패키지를 발행하지 않으며, 발행 목록은 버전 선택 결과로 제한한다.

### 4. 실행·인증·재시도

PR에서는 read-only 후보 미리보기와 local pack dry-run만 한다. fork PR의 registry 인증 접근이 필요하면
secret 없는 manifest 비교 결과와 registry 확인 필요 상태를 분리한다. PR 코드에 발행 권한을 주지 않는다.
main push에서는 동일 SHA의 quality·browser·artifact 검증 성공 뒤에만 발행 job을 허용한다.
같은 ci.yml의 quality·browser·gate 뒤에 publish를 연결한다. 수동 main 실행도 같은 검증을 거쳐 복구에 사용할 수 있다.

publish는 검증한 tarball을 지원되는 npm CLI의 Trusted Publishing/OIDC로 발행한다.
지원 CLI/runner는 확인했으며 패키지별 trusted publisher 매핑·보호 환경·초기 활성화는 운영 미완료 상태다.
`id-token: write`는 발행 job, tag 기록의 `contents: write`는 후속 job으로 한정한다.
발행 concurrency는 저장소 전체 한 그룹이며 `cancel-in-progress: false`로 진행 중 발행을 취소하지 않는다.
직전 registry 상태를 다시 확인해 오래된 실행이 `latest`를 낮추지 않게 한다.

패키지별 성공/제외/실패와 registry 확인 결과를 남긴다. 실패한 job은 성공으로 끝내지 않는다.
다음 실행은 이미 성공한 버전을 제외하고 미발행 버전만 처리한다.
권한 오류를 새 토큰 발급이나 실제 npm publish로 시험하지 않고 설정 단계의 미완료로 보고한다.

### 5. 태그·기존 문서 배포 연계

태그는 해당 패키지의 npm 발행을 확인한 뒤 같은 SHA에 생성한다. root는 기존 `lithent@<version>` 규칙을 보존한다.
다른 공개 패키지도 `<package-name>@<version>`을 사용하며 scoped 이름의 slash를 유지한다. GitHub Release는 자동 생성하지 않는다.
기존 수동 순서와 새 main 기반 자동 순서를 섞지 않도록 DC-9에서 기존 안내를 정렬한다.

`GITHUB_TOKEN`으로 만든 tag push는 일반적으로 다른 push workflow를 연쇄 실행하지 않는다.
따라서 root 발행 후 해당 태그와 release_sha를 담은 docs.yml workflow_dispatch를 명시 호출한다.
필요한 actions:write는 후속 기록 job에만 둔다. docs는 checkout SHA와 요청된 release_sha를 대조한다.
문서 사이트 성공과 npm 발행 성공은 각각 기록한다.

## 테스트 하드닝

- [x] DC-27: Phase 5는 정상 기준선 통과 뒤 격리한 소스 사본에 한 번에 하나의 결함을 주입한다. 사용자 작업 트리/빌드와 실제 npm/GitHub 서비스는 변경하지 않는다. cleanup은 두 코어의 공개 teardown 회귀로 격리·큐 선비우기·비동기 보고·원래 오류 fallback을 검사한다. 배포는 기존 Node fixture로 private/초기 기준/버전·404/오류/timeout·SHA/integrity/경로 경계·event/ref·부분 실패/재시도·태그/CI 조건을 검사한다. 정상 테스트 수·skip 0과 특정 기대 테스트의 assertion 실패를 요구하며 파싱/컴파일/수집/spawn/timeout 오류를 검출 성공으로 세지 않는다. surviving mutation은 테스트 빈틈으로 기록하고 보강 후 다시 검증한다. 검사 도구는 CI Quality에 연결하고 JSON 보고서/로그를 남긴다. 검증: Phase 5, M-12, RQ-1, RQ-4, RQ-7, RQ-10, RQ-12, RQ-13, RQ-14.

재진입 행위자는 한 번만 다시 진입하도록 제한해 결함 주입 시 무한 재귀/worker crash가 assertion 검증을 대신하지 않게 한다.
공개 DOM/cleanup 호출·오류 동일성, 실제 archive 소비자, registry 응답·발행 호출·태그 요청 등 관측 가능한 동작을 검사한다.
이 단계의 결함 주입은 Phase 6 최종 전체 빌드/브라우저 통합을 대신하지 않는다.

- [x] DC-28: 첫 29개 변이 중 26개 검출/3개 생존을 확인했다. artifact 경로 경계 제거는 테스트의 외부 파일이 실제로 없어서 다른 ENOENT로 가려졌고, publish event/ref 제거는 뒤의 readInputs mock 오류를 정상 거부로 받아들였다. 기존 제품 보호는 유지하고 실제 존재하는 격리 외부 파일·symlink를 검사하며 발행 거부 시 입력 읽기/명령 호출이 모두 0임을 단언한다. 실행 오류·수집 누락·skip을 결함 검출로 오인하지 않는 하네스 자체도 검사한다. 검증: M-12, 첫 보고서 `run-yYYGM6/summary.json`, 보강 후 동일 29개 변이 재실행·정상 CI fixture.

## 최종 통합 검증

- [x] DC-29: Phase 6은 현재 프로젝트 파일을 별도 경로에 복사해 검증용 로컬 commit을 만들고 frozen install부터 모든 실제 build/consumer/E2E를 같은 clean SHA로 실행한다. 기존 dist/node_modules는 복사하지 않는다. 사용자 브랜치/HEAD는 커밋하거나 push하지 않으며, 검증 이후 정본의 결과 기록과 코드 입력의 hash 차이를 따로 기록한다. 합성 통합 테스트의 줄바꿈만 후속 정리한 경우에는 위치 정보를 제외한 AST 동일성과 해당 테스트 재실행을 추가 근거로 남긴다. 제품·빌드·CI 입력의 byte 동일성과 이 예외를 구분하고 검증 snapshot SHA를 바꾸지 않는다. local clean 검증과 실제 GitHub main/OIDC 실행 성공은 구분한다. 검증: M-13, source/code manifest·clean bundle 복원·전체 검사·format equivalence.
- [x] DC-30: 배포 통합 fixture는 8개 catalog의 합성 tarball/실제 설치 소비자를 사용해 단일/복수 버전업부터 planner→clean artifact/proof 검사→production publish adapter→부분 성공 receipt→원래 SHA tag/docs 요청→재계산/재실행까지 연결한다. 내부 registry는 localhost에서 합성 archive를 제공하고 npm 명령/GitHub 쓰기는 주입형 모의 응답으로 제한한다. 실제 Lithent의 8개 배포 archive·7개 후보 소비자 검증은 별도로 실행하며 합성 fixture를 그 검증으로 주장하지 않는다. 검증: M-6, M-7, M-8, M-13, release integration fixture.

## 최종 리뷰의 발행 복구 수정

- [x] DC-31: U-13의 최종 리뷰에서 업로드 성공 뒤 확인 HTTP 오류→failed receipt→동일 버전 skipped→기록 0개 성공을 재현했고 U-14로 수정한다. publish 호출 뒤 registry 확인 오류/가시성 기한 소진은 패키지 `unconfirmed`, 실행 전체 `failed`로 저장한다. 업로드 전 검증/조회 오류와 확인된 integrity 충돌은 `failed`를 유지한다. 기록 job은 같은 repository/run/clean SHA의 이전 attempt를 모아 `published`와 `unconfirmed`만 대상으로 삼고, 허용 패키지·기준 초과 stable 버전·원래 archive 이름/size/SHA-256/SRI를 먼저 대조한다. 이어 registry에서 정확한 버전/SRI가 일치해야 원래 SHA에 tag/docs를 기록한다. 원래 검증 archive와 발행 시도 receipt가 원본 증거이며 이는 기존 CLI 오류 후 SRI 확인 복구와 같은 경계다. 다른 run/SHA나 `skipped`만으로 과거 발행을 인수하지 않는다. 같은 패키지의 published receipt가 있으면 우선 사용한다. 미확정 대상이 404/오류/다른 SRI이면 명시 실패로 남기고, 독립적으로 확인된 다른 패키지의 기록은 계속한다. 원래 receipt가 없는 경우의 provenance 기반 수동 복구는 유지한다. 검증: RQ-11, RQ-12, RQ-14, RQ-16, M-14, executor·record·production adapter 합성 통합·결함 주입.

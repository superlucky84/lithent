# 릴리스 절차

## lithent 1.25.11 릴리스

2026-11-13 사용자 요청으로 `lithent/ssr`의 hydration 불일치 수정을 `lithent` 패치로 배포한다.
대상은 **`lithent` 1.25.10 → 1.25.11 하나**이며 `lithent-concurrent`는 0.2.7을 유지한다.
바뀐 곳은 `ssr/src/hydration.ts`뿐이고 코어와 공개 API가 같아 패치 버전을 사용한다.
`lithent-concurrent`의 sourcePaths에는 `ssr/`가 없어 함께 올리지 않는다. 변경 내용은 [CHANGELOG](./CHANGELOG.md#2026-11-13)에 기록한다.
생성 템플릿은 `lithent ^1.25.10`을 요구하므로 새 프로젝트는 발행 뒤 1.25.11을 받는다.

**발행 기록 (2026-11-14)**: main `53b1f7f`에서 Validate run [43522306787](https://github.com/superlucky84/lithent/actions/runs/43522306787)로 발행했다.
모든 잡(Quality, Chromium·Firefox·WebKit, 발행, 기록)이 첫 시도에 통과했다. npm `lithent` 1.25.11(`latest`)과
registry integrity, 태그 `lithent@1.25.11`(`53b1f7f`), 문서 배포 run [43523841604](https://github.com/superlucky84/lithent/actions/runs/43523841604)를 확인했다.
발행된 archive의 `ssr/dist`에 hydration 수정이, `ssr/README.md`(#122)가 처음으로 들어 있음을 확인했다.

PR 검사가 통과하면 merge commit으로 main에 병합하고, 아래 **CI 발행 절차**에 따라 main을 대상으로 Validate를 수동 실행한다.
npm의 1.25.11·registry integrity·동일 발행 SHA의 태그와 문서 배포를 확인해야 발행 완료로 기록한다. 이 절은 배포 계획이며 완료 기록이 아니다.

## lithent 1.25.10 / lithent-concurrent 0.2.7 릴리스

2026-11-13 사용자 요청(템플릿 후속 과제)으로 JSX 타입 수정([docs/jsx-types](./docs/jsx-types/REQUIREMENTS.md))을 배포한다.
대상은 **`lithent` 1.25.9 → 1.25.10, `lithent-concurrent` 0.2.6 → 0.2.7**이다.
두 코어가 같은 `declare global { namespace JSX }` 블록과 `src/types`를 쓰므로 함께 올린다.
타입만 넓어지고 런타임과 크기가 같아 패치 버전을 사용한다. 변경 내용은 [CHANGELOG](./CHANGELOG.md#2026-11-13)에 기록한다.
Concurrent에는 1.25.9 때 공유 모듈 정리(6,696 → 6,667B)도 함께 들어간다.

**발행 기록 (2026-11-13)**: main `24af1c4`에서 Validate run [43385051585](https://github.com/superlucky84/lithent/actions/runs/43385051585)로 발행했다.

- 1차 시도: Browser (webkit)의 `e2e/parent-retention.spec.ts`(concurrent, GC 뒤 `WeakRef` 회수 수)가 실패해 발행이 막혔다. 실패 잡 재실행에서 통과했다.
- 2차 시도: `lithent` 업로드 뒤 registry 확인 시간이 지나 unconfirmed로 끝났고, `lithent-concurrent` 전에 멈췄다. 기록 job이 `lithent@1.25.10` 태그를 복구했다.
- 3차 시도: 아래 복구 절차대로 실패 잡을 재실행하자 `lithent-concurrent` 0.2.7이 발행됐다.
- 결과: npm `lithent` 1.25.10, `lithent-concurrent` 0.2.7이 올라갔고, 두 태그 모두 `24af1c4`에 있다.

PR 검사가 통과하면 merge commit으로 main에 병합하고, 아래 **CI 발행 절차**에 따라 main을 대상으로 Validate를 수동 실행한다.
npm의 두 버전·registry integrity·동일 발행 SHA의 태그와 문서 배포를 확인해야 발행 완료로 기록한다. 이 절은 배포 계획이며 완료 기록이 아니다.

## create-lithent 0.4.1 릴리스

2026-11-13 사용자 요청으로 생성 템플릿 교체([docs/create-lithent-templates](./docs/create-lithent-templates/REQUIREMENTS.md))를
`create-lithent` 패치로 배포한다. 대상은 **`create-lithent` 0.4.0 → 0.4.1 하나**다.
CLI 코드는 그대로이고 패키지에는 README만 바뀌어 패치 버전을 사용한다. 변경 내용은 [CHANGELOG](./CHANGELOG.md#2026-11-13)에 기록한다.

**발행 기록 (2026-11-13)**: main `ce4392f`에서 Validate run [43377989485](https://github.com/superlucky84/lithent/actions/runs/43377989485)로 발행했다.
npm `create-lithent` 0.4.1, 태그 `create-lithent@0.4.1`(`ce4392f`)을 확인했다.

생성기는 템플릿을 `main`에서 내려받으므로 템플릿 변경은 이 PR([#116](https://github.com/superlucky84/lithent/pull/116))의
병합만으로 0.4.0 사용자에게도 반영된다. 이 릴리스는 npm 페이지의 README와 버전 기록을 맞추기 위한 것이다.
PR 검사가 통과하면 merge commit으로 main에 병합하고, 아래 **CI 발행 절차**에 따라 main을 대상으로 Validate를 수동 실행한다.
npm의 0.4.1·registry integrity·동일 발행 SHA의 태그를 확인해야 발행 완료로 기록한다. 이 절은 배포 계획이며 완료 기록이 아니다.

## 1.25.9 릴리스

2026-11-11 사용자 요청으로 base 코어 크기 축소([docs/bundle-size](./docs/bundle-size/REQUIREMENTS.md))를 `lithent` 패치로 배포한다.
대상은 **`lithent` 1.25.8 → 1.25.9 하나**이며 `lithent-concurrent`는 0.2.6을 유지한다.
동작과 공개 API가 같아 패치 버전을 사용한다. 변경 내용과 측정 한계는 [CHANGELOG](./CHANGELOG.md#2026-11-11)에 기록한다.

Concurrent는 자기 `wDom`·`diff`·`render`·`redraw`를 쓰지만 `src/utils`·`src/hook`의 공유 모듈은 같이 쓴다.
이번 정리 중 공유 모듈에 들어간 것(DESIGN의 DC-7)은 Concurrent를 다시 빌드하면 6,696 → 6,667B로 반영되고 동작은 같다.
사용자 요청이 코어 버전이므로 Concurrent는 올리지 않았다. 다음 Concurrent 릴리스에 함께 들어간다.
release plan은 이 경우 "Source paths changed but this version will not be published" 경고를 낸다.

`perf/core-size` 브랜치의 PR에 버전과 릴리스 기록을 넣었다. PR 검사가 통과하면 merge commit으로 main에 병합하고,
아래 **CI 발행 절차**에 따라 main을 대상으로 Validate를 수동 실행한다. npm의 1.25.9·registry integrity·동일 발행 SHA의
태그와 문서 배포를 확인해야 발행 완료로 기록한다. 이 절은 배포 계획이며 완료 기록이 아니다.

## 1.25.8 릴리스

2026-11-10 사용자 요청으로 DC-29의 코어 개선과 코드 정리를 `lithent` 패치로 배포한다.
대상은 **`lithent` 1.25.7 → 1.25.8 하나**이며 `lithent-concurrent`는 0.2.6을 유지한다.
새 공개 API가 없어 패치 버전을 사용한다. `memo`와 upstream 앱 교체는 보류한 상태다.
변경 내용과 측정 한계는 [CHANGELOG](./CHANGELOG.md#2026-11-10)에 기록한다.

기존 PR [#109](https://github.com/superlucky84/lithent/pull/109)에 버전과 릴리스 기록을 추가한다.
최종 후보를 빌드하고 tarball·선택 발행 계획·소비자를 검증한 뒤 PR 검사가 통과하면
merge commit으로 main에 병합한다. 그다음 아래 **CI 발행 절차**에 따라 main을 대상으로
Validate를 수동 실행한다. npm의 1.25.8·registry integrity·동일 발행 SHA의 태그와
문서 배포를 확인해야 발행 완료로 기록한다. 이 절은 현재 배포 계획이며 완료 기록이 아니다.

앞서 기록한 concurrent element cleanup 테스트 4개 실패는 현재 재현되지 않는다.
`08dc1f0`에서 전체 재빌드 후 `pnpm test:dual`이 1,206개 통과·3개 제외였고,
해당 커밋의 [Validate](https://github.com/superlucky84/lithent/actions/runs/42776662776)도
Quality와 세 브라우저를 모두 통과했다. 당시 로컬 실패 원인은 미확정이며,
릴리스 버전이 들어간 최종 후보는 새 CI에서 다시 검증한다.

## Vite 8 릴리스 준비

`chore/vite8-migration`은 최신 main `933400d`의 cleanup 수정과 공개 패키지
ESM/CJS 경로를 유지하면서 다음 **8개 패키지**를 다음 릴리스 후보로 올린다.
이 절은 배포 준비 기록이며 npm 발행 완료 기록이 아니다.

| 패키지                             | 현재 배포 버전 → 후보 | 변경                                   |
| ---------------------------------- | --------------------- | -------------------------------------- |
| `lithent`                          | 1.25.6 → 1.25.7       | Vite 8로 코어와 포함된 서브패스 재빌드 |
| `lithent-concurrent`               | 0.2.5 → 0.2.6         | Vite 8로 Concurrent 재빌드             |
| `@lithent/hmr-parser`              | 0.2.4 → 0.2.5         | 새 도구로 파서 재빌드                  |
| `@lithent/lithent-template-parser` | 0.1.2 → 0.1.3         | 새 도구로 파서 재빌드                  |
| `@lithent/lithent-template-vite`   | 0.1.2 → 0.2.0         | Vite 8 peer, Oxc 변환과 의존성 스캔    |
| `@lithent/lithent-vite`            | 0.3.5 → 0.4.0         | Vite 8 peer, 혼합 JSX/템플릿 지원      |
| `@lithent/lithent-mdx`             | 0.2.7 → 0.3.0         | Vite 8 peer와 빌드 전환                |
| `create-lithent`                   | 0.3.4 → 0.4.0         | Vite 8 템플릿과 Node 요건 갱신         |

코어 API는 그대로라 패치 버전을 사용한다. Vite 플러그인 3종은 Vite 5 지원을
중단하므로 현재 0.x 정책에서 minor를 올린다. 생성기도 기본 템플릿의 Vite/Node
요건이 바뀌므로 minor를 올린다. private workspace와 root에 포함되는 서브패스는
독립 발행하지 않는다. 기존 런타임 peer 범위는 그대로 호환된다.

두 생성 템플릿은 `lithent ^1.25.7`과 `@lithent/lithent-vite ^0.4.0`을 참조하며,
SSR은 `@lithent/lithent-mdx ^0.3.0`도 사용한다. 내부 `workspace:*` 참조는 pack에서
후보 버전으로 변환된다. release plan의 의존 순서를 따라 파서를 템플릿 플러그인보다,
템플릿 플러그인을 HMR 플러그인보다 먼저 발행한다.

생성기는 main의 템플릿을 내려받는다. 아래 CI 절차의 모든 후보가 registry에 보이는지
확인한 뒤 새 템플릿을 사용할 수 있다. `create-lithent`도 처음 자동 발행하는 후보에
포함되므로 이 패키지의 Trusted Publisher 구성을 배포 전에 확인한다. 이 준비 작업은
PR 생성까지이며, 병합·npm 발행·태그 생성은 수행하지 않는다.

검증과 크기 비교는 [Vite 8 보고서](./docs/benchmark/VITE8_MIGRATION_RESULTS.md),
공개 변경 사항은 [CHANGELOG](./CHANGELOG.md#unreleased--vite-8)에 기록한다.

## CI 발행 절차

사용자 U-17(2026-11-08)에 따라 버전업된 패키지는 **main을 대상으로 Validate를 수동 실행할 때만** 발행한다.
그 run의 Quality·세 브라우저·CI가 모두 성공해야 발행한다(U-10의 검증 조건 유지). main 병합(push)은 같은 검증만 하고 발행·태그 job을 건너뛴다.
발행하려면 Actions → **Validate** → **Run workflow** → Branch **main**을 실행한다.
후보 계산·실제 tarball/소비자 검증·OIDC 발행 job·성공 태그·root 문서 dispatch를 구현했다.
아래 외부 초기 설정은 아직 적용하지 않았고 이 작업에서 실제 npm 발행도 수행하지 않았다.
정본은 [설계](./docs/reliability/DESIGN.md), 진행/근거는 [IMPLEMENT](./docs/reliability/IMPLEMENT.md)다.

배포할 독립 공개 패키지의 `package.json.version`만 작업자가 올린다.
helper·JSX·SSR·element 등 root 서브패스 변경은 `lithent`, 공유 코어 변경은 root와 Concurrent의 버전을 각각 검토한다.
private workspace와 새로 추가된 공개 패키지는 자동 발행 목록에 들어가지 않는다.
허용 목록과 도입 기준은 [.github/release-policy.json](./.github/release-policy.json)에 있다.
기준과 같은 버전은 도입만으로 발행하지 않고, 더 높은 stable 버전 중 npm에 없는 정확한 버전만 선택한다.
이미 발행된 버전은 제외하며 부분 실패 뒤에도 남은 버전을 찾는다. prerelease는 보류한다.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify:release --output-dir artifacts/release
pnpm release:plan
node scripts/verify-plan-consumers.mjs
```

모든 CI 검사도 통과해야 한다. 전체 명령은 [CONTRIBUTING](./CONTRIBUTING.md#pull-request-checks)에 있다.
pack 출력 디렉터리는 비어 있어야 한다. 기존 결과를 확인한 뒤 별도 위치로 옮기고 새로 실행한다.
plan의 선택/제외 사유·의존 순서·소스 소유 경고를 확인한다. 후보 소비자는 선택 archive와 실제 npm 의존성을 설치한다.
`--allow-dirty`는 로컬 후보 계산/소비자 검사에만 쓰며 dirty 결과로 발행할 수 없다.
CI는 같은 run/SHA의 archive·plan·proof를 hash로 묶어 브라우저 job에서 다시 확인한다.

npm Trusted Publishing 운영 준비(미완료):

- 저장소 관리자가 main의 필수 검사 **CI**를 ruleset/branch protection에 등록한다. 발행 CLI는 보호된 main ref를 요구한다.
- GitHub environment **npm**을 만들고 deployment branches를 **main만** 허용한다. 수동 실행 자체가 발행 결정이므로 environment 승인 대기는 추가하지 않는다.
- 발행할 패키지의 소유자가 npm Trusted Publisher를 설정한다: GitHub owner **superlucky84**, repository **lithent**, workflow filename **ci.yml**, environment **npm**. 값은 대소문자까지 일치시킨다.
- Node >=22.14.0, npm CLI >=11.5.1, GitHub-hosted runner를 사용한다. 현재 고정 Node 24.22.1의 npm 11.9.0은 버전 요건을 만족한다.
- 새 publisher에는 직접 `npm publish` action을 허용한다. repository 메타데이터와 provenance의 공개 저장소 주소도 대조한다.
- 신규 Trusted Publisher는 생성 후 2일 이내 첫 발행이 필요하다. 현재 후보 7개부터 설정하며 baseline으로 제외된 `create-lithent`는 실제 버전업/발행 직전에 설정한다. 만료된 연결은 npm에서 다시 등록한다.
- `id-token: write`는 실제 발행 job, 태그/문서에 필요한 쓰기 권한은 별도 후속 job으로 제한한다. 장기 npm 토큰은 추가하지 않는다.
- 발행·기록 job은 의존성 설치 script를 실행하지 않는다. GitHub 쓰기 토큰은 태그/dispatch step에서만 전달한다.
- read-only CI와 위 설정을 확인한 뒤 저장소 Actions variable **NPM_PUBLISH_ENABLED=true**로 최초 활성화한다. 변수가 없거나 false이면 발행/태그 job은 생략하고 검증은 그대로 수행한다. 비활성화하려면 이 값을 false로 바꾼다.
- 변수 활성화 자체는 workflow를 시작하지 않는다. main 대상으로 Validate를 수동 실행하면 모든 검증 뒤 발행한다. main push·PR/fork/다른 ref는 발행할 수 없다.
- 검증한 tarball을 그대로 발행하고 registry integrity로 성공을 확인한다. 실패했다고 이미 발행한 버전을 삭제하거나 덮어쓰지 않는다.
- 성공한 패키지만 해당 발행 SHA에 `<package-name>@<version>` 태그를 만든다. root의 기존 `lithent@<version>` 표기를 유지하며 scoped 이름도 포함한다. 기존 다른 SHA 태그는 덮어쓰지 않는다. GitHub Release는 자동 생성하지 않는다.
- root 성공 뒤 docs.yml을 해당 태그와 release_sha로 명시 dispatch한다. `GITHUB_TOKEN`의 tag push만으로 연쇄 실행되지 않는 제한을 처리한다. dispatch 접수와 실제 사이트 배포 성공은 별도로 확인한다. 기존 docs의 main/tag/수동 trigger는 유지한다.
  root `package.json`을 바꾼 main 병합은 발행 전에 docs.yml을 먼저 실행할 수 있다. 수동 발행 run의 root 성공 뒤 dispatch가 다시 배포한다.

실행·실패 복구:

- Quality·Chromium/Firefox/WebKit·CI가 모두 성공해야 publish를 시작한다. PR의 진행 중 검증은 새 커밋으로 취소할 수 있지만 main 발행은 자동 취소하지 않는다.
- 후보가 0개면 정상 종료한다. A 발행 확인 후 B가 실패하면 실패 상태와 A의 성공을 receipt에 저장하고, 후속 job은 A의 태그를 기록한다. 다음 실행은 registry에 있는 A를 다시 발행하지 않는다.
- GitHub Actions에서 **원래 main run의 실패 job을 재실행**하면 원래 Quality artifact output을 사용한다. run_attempt가 달라져도 올바른 build를 찾고, 같은 run/SHA의 이전 attempt receipt도 합쳐 성공 태그를 복구한다.
- npm은 업로드를 받은 뒤 1분 넘게 지나서야 새 버전을 보여줄 수 있다(lithent 1.25.6은 약 75초). 발행·기록 job은 버전이 보이지 않으면 10초 간격으로 최대 5분 기다린다. registry 오류는 기다리지 않고 바로 실패로 처리한다.
- 업로드 시도 뒤 registry 확인이 오류/timeout/가시성 기한 소진으로 끝나면 패키지는 **unconfirmed**, 발행 job은 실패다. 후속 기록 job은 원래 run/clean SHA와 archive 이름·size·SHA-256·SRI가 같은 receipt를 registry에서 재확인한다. 일치하면 태그와 root 문서 요청을 복구하며 `recoveredUnconfirmed: true`를 기록한다. 계속 404/오류/다른 SRI이면 기록 job도 실패하므로 빈 성공으로 취급하지 않는다.
- 위 미확정 receipt가 남아 있으면 발행 job이 같은 버전을 skipped로 처리하거나, 같은 commit의 Quality 재실행에서 후보가 0개가 되어도 원래 run의 기록 job이 복구한다. 업로드 전 실패·pending·skipped·중단된 publishing 상태만으로는 과거 발행을 인수하지 않는다. 다른 run/SHA에 있는 발행도 자동 복구하지 않는다.
- 태그/문서 기록만 실패했으면 원래 run의 **Record release tags and dispatch docs** job을 재실행한다. 기존 동일 SHA 태그는 유지하며 docs dispatch를 재시도한다.
- build·발행 receipt·발행/태그 기록은 30일 보관한다. 일반 Quality/브라우저 로그와 preview는 7일이다. 다른 main run에서 과거 버전을 찾았다는 이유로 새 SHA에 태그하지 않는다.
- receipt/원래 build가 만료·유실되거나 발행 직후 runner가 강제 종료되었다면 npm provenance·실제 버전/integrity·원래 발행 SHA를 확인해 수동 복구한다. 버전을 삭제/덮어쓰기하거나 새 main SHA로 과거 발행을 대신 기록하지 않는다.

GitHub required check `CI`의 ruleset 설정과 실제 PR/main 실행도 별도 미완료다.
자동화가 활성화되기 전 수동 발행은 아래 과거 절차의 **실제 발행할 버전/SHA**로 바꿔 수행한다.
이 작업에서는 push·npm 발행·태그·GitHub Release 생성·저장소 설정 변경을 수행하지 않았다.

## 1.25.5 릴리스 준비 이력

아래 수치와 명령은 1.25.5 준비 당시의 이력이다. 현재 자동화 상태는 위 절차를 따른다.

이번 PR은 base 코어의 keyed 목록·캐시 경로 최적화와 릴리스 준비를 포함한다.
main에 merge commit으로 병합한 뒤 이 문서의 발행 절차를 실행한다.

| 패키지    | 이전 → 배포 버전 | 내용                                                                                                 |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `lithent` | 1.25.4 → 1.25.5  | keyed 위치 매칭, 순서가 유지된 목록의 DOM 배치 생략, 동일 VDOM 조기 반환, 일반 태그 속성 처리 최적화 |

이번 npm 발행 대상은 **`lithent` 하나**다. Concurrent 런타임은 바뀌지 않아
`lithent-concurrent`는 0.2.4를 유지한다. 기존 peer 범위 `^1.25.0`은 1.25.5를 허용한다.
helper·devHelper·JSX runtime·SSR·tag·ftags·element는 root tarball에 포함된다.
private workspace와 HMR/parser/template/Vite/MDX 플러그인, `create-lithent`는 별도 발행하지 않는다.

## 1. main·버전·릴리스 기록 확인

```sh
git switch main
git pull --ff-only origin main
git status --short --branch
node -p "require('./package.json').version"
node -p "require('./lithentConcurrent/package.json').version"
```

root는 `1.25.5`, Concurrent는 `0.2.4`여야 한다. `CHANGELOG.md`의 2026-11-02 절에
성능 결과와 호환성 변경, base Brotli 4,925B를 기록했다.
기존 VDOM을 그대로 반환할 때 getter를 다시 읽지 않는 변경과, reconciliation 도중
기존 키를 직접 수정하는 사용법을 지원하지 않는다는 점을 확인한다.

Node는 `mise.toml`과 root `devEngines.runtime`의 24.22.1,
pnpm은 `packageManager`의 12.15.0을 사용한다. CI는 같은 버전을 담은 `.nvmrc`를 읽는다.

```sh
mise install
mise exec -- node --version
pnpm --version
```

Node 버전이 다르면 `devEngines.runtime.onFail: error` 정책에 따라 개발 도구의
실행이 실패한다. 프로젝트 디렉터리에서 mise가 선택한 Node를 사용한다.

## 2. 설치·빌드·검증

pnpm 12는 스크립트 실행 전에 의존성을 검증하고 필요하면 자동 설치한다.
설치는 네트워크에 접근할 수 있는 환경에서 먼저 완료한다. 제한된 환경에서 자동
설치가 실패하면 node_modules 구성이 중단될 수 있으므로, 같은 환경에서 재시도하지 않는다.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test:dual
pnpm verify:concurrent
pnpm verify:release
pnpm size
pnpm exec playwright install chromium
pnpm test:e2e
```

`build`는 공개 하위 경로와 toolchain, examples, 문서 사이트도 준비한다.
`test:dual`은 두 코어와 양쪽 satellite 테스트를 실행한다. `verify:release`는 실제
tarball을 격리 설치해 ESM/CJS·Node16/NodeNext strict 타입 소비자를 검사한다.
이 검사에서 Concurrent와 `create-lithent` pack도 준비하지만 실제 발행 대상은 root뿐이다.

이번 버전의 manifest로 빌드·검증한 산출물을 사용한다. 이전 버전의 tarball이나
빌드 전 dist를 재사용하지 않는다. root 버전은 pnpm lockfile에 별도로 저장되지 않아
버전 변경만으로 `pnpm-lock.yaml`을 수정할 필요는 없다.

## 3. 최종 커밋·원격 동기화 확인

이 PR은 코드·검증 자료·릴리스 파일을 포함한다. 추가 수정 없이 병합했다면
같은 내용을 다시 커밋하지 않는다. 발행할 main이 원격과 동기화되고 작업 트리가
깨끗한지 확인한다.

```sh
git diff --check
git status --short --branch
git log -1 --oneline
```

병합은 merge commit을 사용해 벤치마크 문서가 인용하는 커밋을 유지한다.
PR 생성·병합과 npm 발행은 별도 단계다.

## 4. 로그인·발행 미리보기

```sh
npm whoami
pnpm publish --dry-run --access public --publish-branch main
```

필요하면 `npm login`으로 인증한다. pnpm은 작업 트리와 원격 동기화 상태를 검사한다.
미리보기의 패키지명·버전이 `lithent@1.25.5`인지, 공개 하위 경로와 선언 파일이
포함되는지 확인한다.

## 5. npm 발행

```sh
pnpm publish --access public --publish-branch main
npm view lithent@1.25.5 version
```

registry에서 `1.25.5`를 확인한 뒤 태그 단계로 진행한다. pnpm 11부터 publish는
npm CLI를 거치지 않으며, OTP가 필요하면 pnpm이 직접 묻는다.
인증은 기존 `~/.npmrc` 설정을 사용한다.

## 6. 태그·GitHub 릴리스·문서 사이트

npm 발행에 사용한 동일 커밋에 base 태그만 만든다.

```sh
git tag lithent@1.25.5
git push origin lithent@1.25.5
gh release create lithent@1.25.5 --title lithent@1.25.5 --notes-file <노트 파일>
gh run list --workflow docs.yml --limit 5
```

Concurrent 태그나 npm 발행은 이번 릴리스에 포함하지 않는다.
`.github/workflows/docs.yml`은 `lithent@*` 태그를 받아 전체 workspace를 빌드하고
`gh-pages`를 배포한다. root manifest 변경을 포함하는 main push도 문서 배포를 시작한다.
최종 사이트는 https://superlucky84.github.io/lithent/ 이다.

필요하면 발행 완료 후 수동으로 문서를 배포한다.

```sh
gh workflow run docs.yml --ref main
```

## 검증 근거와 현재 단계

- [코어 변경과 기존 검증](./docs/benchmark/POSITIONAL_KEYS_RESULTS.md).
- [Mac 공식 러너 9항목 양순서 측정](./docs/benchmark/POSITIONAL_KEYS_OFFICIAL_RESULTS.md):
  580표본, 중앙값 기준 가중 전체 −2.59%, JS −6.84%, 평균 기준 가중 전체 −1.88%.
- 배포 전 검토에서 전체 빌드, `test:dual` 1,176통과·3제외, E2E 78개,
  `verify:concurrent`, `verify:release`, 타입·린트·크기 검사를 통과했다.
- 갱신 도중 다른 행의 기존 키를 직접 수정하는 사례는 main과 관찰 차이가 있지만,
  사용자와 지원 범위를 확인해 배포 차단 회귀에서 제외했다. 일반적인 키 유지·변경
  계약과 구분하며, 공개 릴리스 노트에 이 사용법의 지원 범위를 명시했다.

이 기록은 검증과 릴리스 준비에 대한 것이다. npm 발행 완료 기록은 별도다.

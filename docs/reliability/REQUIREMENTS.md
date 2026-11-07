# REQUIREMENTS — 오류 복구·검증·선택적 npm 배포

- 작성일: 2026-11-06
- 브랜치: `review/cleanup-ci-browser`
- 기준 커밋: `d594983897bab460b469cea8c6e73dfd354f1fd2`
- 상태: 최종 리뷰의 복구 결함을 수정하고 U-15 재리뷰 APPROVE를 받았다. Phase 7의 CI fixture 47 PASS·결함 주입 33/33 검출과 재리뷰의 빠른 검사 41 PASS를 확인했다. U-16의 7개 patch 정렬은 구현 커밋 `4dbed338c808c93d7c198f6066891eb8087aecf6`과 [PR #104](https://github.com/superlucky84/lithent/pull/104)로 인계했다. PR CI는 실행을 시작했으며 최종 결과와 main CI/발행·외부 초기 설정은 별도 미완료다. Phase 6의 전체 검사/3엔진 270 PASS는 제품 입력이 같은 수정 전 이력이다.
- 적용 절차: ctxbin의 `doc-driven-designer-v1` 스킬 1.3.0과 동명 agent rule.
- 정본: 이 문서, [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).

## 사용자 요청과 문서 소유 범위

이번 작업은 cleanup 예외 격리, PR 검증 자동화, Firefox/WebKit 검증 확대와 npm 배포 자동화를 다룬다.
기존 `docs/element/`는 element 기능, `docs/concurrent-rendering/`는 Concurrent 기능,
`docs/closure-lifecycle/`는 helper 기능의 정본이다. 이번 작업 전체를 소유하는 기존 정본은 없으며,
element 설계도 코어 cleanup 예외 격리를 별도 작업으로 남겼다.
따라서 공통 책임을 갖는 `docs/reliability/`에 네 문서를 새로 작성한다.

관련 코드는 `src/utils/universalRef.ts`, 공유 unmount 훅, 양쪽 render/diff,
`element/src/index.ts`, `e2e/`, `playwright.config.ts`, `.github/workflows/`,
검증·배포 스크립트와 공개 패키지 manifest다. 기존 기능별 정본의 계약은 복제하지 않는다.
기존 문서를 작업 정본으로 전환하거나 수정할 때는 사용자가 요청한 사전 확인을 받는다.
`RELEASING.md`와 `CONTRIBUTING.md`의 연결·갱신은 U-5로 확인받았다.

사용자가 확정한 방향:

- U-1: ctxbin으로 불러온 문서 주도 설계 규칙을 적용한다.
- U-2: 적합한 기존 문서가 없으면 새 문서를 만든다. 기존 문서를 사용할 때는 먼저 확인한다.
- U-3: npm 배포 자동화를 범위에 포함한다.
- U-4: 작업자가 해당 공개 패키지의 `package.json.version`을 올리면 그 패키지만 자동 배포한다.
  모든 하위 패키지의 일괄 버전업·일괄 발행을 피하려는 의도다. 세부 정책은 문서를 구체화하며 결정한다.
- U-5: 기존 `RELEASING.md`·`CONTRIBUTING.md`도 새 정본에 연결하고 자동화 구현 후 절차를 갱신한다.
  2026-11-06 사용자 확인. 이전 1.25.5 릴리스 이력을 보존하면서 안내의 불일치를 막기 위한 결정이다.
- U-6: 2026-11-06 사용자가 reportError 지원 범위와 fallback 설명을 확인한 뒤 이 정책으로 구현 진행을 승인했다.
  cleanup 오류를 전역 보고하고 정리를 계속하며, reportError가 없으면 microtask에서 원래 오류를 던진다.
- U-7: 2026-11-06 Phase 1의 read-only 리뷰가 APPROVE였고 사용자가 다음 Phase 2 진행을 요청했다. CI와 패키지 검증 확장을 구현한다.
- U-8: 2026-11-06 사용자가 Phase 2 완료 후 다음 Phase 3 진행을 선택했다. Phase 2를 리뷰 승인으로 표시하지 않고 세 브라우저 검증을 진행한다.
- U-9: 2026-11-06 세 엔진의 각 90 PASS를 확인한 시점에 사용자가 계속 진행을 지시했다. Phase 3 리뷰 선택을 다시 묻지 않고 Phase 4의 선택적 npm 배포 설계·후보 검증으로 이어간다. 실제 발행 활성화와 운영 TBD는 구현/검증과 구분한다.
- U-10: 2026-11-07 사용자가 main의 모든 필수 검사가 성공한 뒤 자동 발행하는 시점을 확정했다. DC-7을 재질문하지 않고 동일 run/SHA의 성공한 검증에 발행 job을 연결한다.
- U-11: 2026-11-07 사용자가 Phase 4 완료 후 다음 단계 진행을 선택했다. Phase 4를 리뷰 승인으로 표시하지 않고 Phase 5에서 결함 주입으로 기존 검사의 검출력을 확인한다.
- U-12: 2026-11-07 사용자가 Phase 5 완료 후 다음 진행을 선택했다. Phase 5를 리뷰 승인으로 표시하지 않고 Phase 6의 동일 소스 전체 통합 검증으로 이어간다.
- U-13: 2026-11-07 사용자가 전체 변경 최종 리뷰를 요청했다. 71파일을 검토하고 업로드 성공 뒤 registry 확인 실패→재실행 skipped→태그/문서 0개 성공의 결함 1건으로 REQUEST_CHANGES를 기록했다.
- U-14: 2026-11-07 사용자가 해당 결함 수정을 요청했다. 원래 run/SHA의 미확정 발행을 검증한 archive와 registry로 재확인하고, 확인 불가를 빈 성공으로 처리하지 않는 복구와 회귀 검사를 보강한다.
- U-15: 2026-11-07 사용자가 수정분 재리뷰를 요청했다. Phase 7의 12파일 재리뷰는 Critical/Warning/Suggestion 0으로 APPROVE였고, 빠른 검사 41개와 이전 오류 경로의 중복 upload 없는 원래 SHA tag/docs 복구를 직접 확인했다.
- U-16: 2026-11-07 사용자가 커밋·PR 생성과 배포가 필요한 부분의 버전업 정렬을 요청했다. npm 재조회에서 준비한 7개 patch는 모두 미발행이고 각 최신 stable보다 높았다. 기존 버전업을 유지하며 미변경 create-lithent 0.3.4는 제외한다. 실제 npm 발행·main 병합은 이 요청에 포함하지 않는다.

## 기능 요구사항

| ID    | 요구사항                                                                                                                                                                | 확인 방법                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| RQ-1  | 한 cleanup의 동기 예외가 동일 컴포넌트·자식·형제의 나머지 cleanup을 막지 않는다.                                                                                        | 양 코어 실패 주입 회귀, M-1                |
| RQ-2  | cleanup 오류가 있어도 제거 대상의 DOM과 자동 관리 componentMap 항목을 정리한다. 수동 관리 계약은 보존한다.                                                              | destroy·keyed 제거·수동 모드 회귀, M-1     |
| RQ-3  | 각 cleanup 등록을 한 번만 실행하며 재시도·재진입이 이전 cleanup 큐를 다시 실행하지 않게 한다.                                                                           | 복수 등록·재진입·재시도 회귀               |
| RQ-4  | cleanup 오류를 정리 완료 후 전역 보고한다. reportError가 없거나 보고 자체가 실패하면 microtask에서 원래 오류를 던진다(U-6, DC-1).                                       | reporter·fallback 검증, M-2                |
| RQ-5  | element의 실제 분리 후 재연결은 정상 마운트되고 같은 태스크의 이동은 기존 상태를 유지한다.                                                                              | 두 코어 element·브라우저 회귀, M-3         |
| RQ-6  | PR와 main 변경마다 고정 런타임에서 빌드·단위/양 코어·공개 패키지 검증·크기·E2E를 실행한다.                                                                              | CI 성공/실패 검증, M-4                     |
| RQ-7  | 검증 누락·산출물 누락·실패를 성공으로 처리하지 않는다. 필수 검사 이름과 저장소 설정 절차를 남긴다.                                                                      | 음성 fixture·필수 검사 확인, M-4           |
| RQ-8  | Chromium·Firefox·WebKit에서 base/concurrent를 검증하고 입력·포커스·선택·이벤트 계약을 관찰한다.                                                                         | 브라우저 행렬, M-5                         |
| RQ-9  | 실패 로그·보고서·trace와 대상 SHA를 남긴다. WebKit 결과와 실제 Safari 결과를 구분한다.                                                                                  | artifact·수동 Safari 확인, M-5             |
| RQ-10 | 명시한 독립 공개 패키지 중 버전이 올라간 패키지만 npm 발행 후보가 된다. private workspace는 제외한다.                                                                   | 후보 manifest fixture, M-6                 |
| RQ-11 | 같은 이름·버전이 이미 발행됐으면 다시 발행하지 않는다. 이전 실패 뒤 미발행 후보는 다음 실행에서도 복구할 수 있다.                                                       | registry fixture·재실행 검증, M-7          |
| RQ-12 | 테스트·패키지 소비자 검증을 통과한 동일 SHA·동일 tarball만 발행한다. 의존 패키지를 먼저 발행한다.                                                                       | SHA·integrity·의존 그래프 검증, M-8        |
| RQ-13 | PR에서는 후보 계산과 dry-run만 허용하고 실제 발행은 신뢰하는 main의 성공한 검증 뒤에 실행한다.                                                                          | event/ref/권한 검증, M-9                   |
| RQ-14 | 일부 패키지 발행 후 실패해도 성공/실패를 개별 기록하고 남은 패키지만 재실행한다.                                                                                        | 부분 실패 fixture, M-7                     |
| RQ-15 | npm 인증·초기 설정·버전 비교·릴리스 태그·문서 배포 연계를 설명한다. 실제 활성화 여부를 구현 완료와 구분한다.                                                            | 운영 체크리스트, M-9, M-10                 |
| RQ-16 | 업로드 시도 뒤 확인 실패를 미확정 상태로 보존한다. 원래 run/SHA와 같은 archive의 실제 발행을 재확인해 태그/문서를 복구하며, 미확정 결과가 남으면 기록 job을 실패시킨다. | 확인 오류·재실행·무단 복구 음성 회귀, M-14 |

## 독립 발행 단위

기준 커밋 manifest의 이름·private 여부와 배포 구성을 조사한 결과다. 자동 발행 허용 목록은 이 8개를 제안한다.
신규 패키지는 `private: false`만으로 자동 가입시키지 않고 허용 목록과 초기 기준 버전을 명시한다(DC-6).
아래 버전은 registry에 존재하는 초기 기준이며, Phase 1의 준비 버전은 root 1.25.6·Concurrent 0.2.5다.
Phase 2의 개발 도구 5개 patch 준비 버전과 검증 결과는 IMPLEMENT에 기록한다. 실제 npm 발행은 수행하지 않는다.

| manifest                                      | 독립 npm 패키지                    | 기준 버전 |
| --------------------------------------------- | ---------------------------------- | --------- |
| `package.json`                                | `lithent`                          | 1.25.5    |
| `lithentConcurrent/package.json`              | `lithent-concurrent`               | 0.2.4     |
| `createLithent/package.json`                  | `create-lithent`                   | 0.3.4     |
| `packages/hmrParser/package.json`             | `@lithent/hmr-parser`              | 0.2.3     |
| `packages/lithentMdx/package.json`            | `@lithent/lithent-mdx`             | 0.2.6     |
| `packages/lithentTemplateParser/package.json` | `@lithent/lithent-template-parser` | 0.1.1     |
| `packages/lithentTemplateVite/package.json`   | `@lithent/lithent-template-vite`   | 0.1.1     |
| `packages/lithentVite/package.json`           | `@lithent/lithent-vite`            | 0.3.4     |

helper・devHelper・JSX runtime・SSR・tag・ftags・element는 root tarball의 서브패스다.
그 코드를 바꾸어 배포하려면 root `lithent` 버전을 올린다. 내부 폴더의 버전만 올려도 별도 npm 발행은 하지 않는다.
Concurrent helper는 `lithent-concurrent`에 포함된다. docs·examples·consumer·scaffold template도 별도 발행하지 않는다.
공유 `src/` 변경이 두 코어 산출물에 영향을 주면 두 공개 패키지의 버전업을 각각 검토한다.

## 제약과 비목표

- 기존 공개 API·클로저 모델·정상 cleanup 순서를 유지한다. 비동기 cleanup 완료를 기다리는 기능은 추가하지 않는다.
- 기준 크기 예산은 base 4,925B, Concurrent 9,000B, element 1,000B Brotli다. DC-10은 cleanup 복구 실측 증가 28B를 별도 항목으로 더해 base를 4,953B로 정한다. 추가 증가는 측정·대안을 기록하고 별도 결정한다.
- CI는 `.nvmrc`/`devEngines.runtime`의 Node 24.22.1, `packageManager`의 pnpm 12.15.0을 사용한다.
- 버전은 작업자가 올린다. 자동 semver 결정·모든 종속 패키지 자동 bump·범위 밖 기능 변경은 하지 않는다.
- npm의 여러 패키지 발행은 원자적이지 않다. 이미 발행한 버전을 삭제해서 되돌리는 절차는 만들지 않는다.
- 초기 자동화 도입만으로 기존 미발행 버전이나 새 패키지를 일괄 발행하지 않는다.
- 실제 npm 발행·브랜치 보호·npm Trusted Publisher 설정·main 병합은 이번 문서 작성으로 실행되지 않는다.
- 기존 `RELEASING.md`와 `CONTRIBUTING.md`는 U-5 승인 범위에서 연결·갱신한다. 자동화 구현·활성화 전까지 기존 수동 절차의 유효 상태를 명시한다(DC-9).

## 검토 근거와 성공 판정

기준 SHA에서 선택 실행한 root Vitest는 73파일 462개, Concurrent runner는 73파일 365개 통과했다.
4개 cleanup 실패 시나리오를 두 코어에서 재현했다. 이는 결함 관찰이며 수정 완료가 아니다.
기존 Playwright discovery는 12파일 78개다. 앞선 실행은 sandbox의 localhost listen EPERM으로 시작하지 못했다.
이 결과는 제공된 Node 24.19.0에서 얻었으므로 고정 런타임의 전체 릴리스 검증으로 취급하지 않는다.

성공은 RQ-1~RQ-15를 검증 근거에 연결하고 Test Hardening·Integration Test를 끝낸 상태다.
파일 구현, CI 실행 성공, npm 설정 활성화, 실제 발행 완료를 각각 다른 상태로 기록한다.

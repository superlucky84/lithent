# MANUAL_TEST_CHECKLIST — 오류 복구·검증·선택적 npm 배포

- 상태: M-14/Phase 7 수정·검증과 U-15 재리뷰 APPROVE를 완료했다. U-16의 7개 patch 정렬은 구현 커밋 `4dbed338c808c93d7c198f6066891eb8087aecf6`과 [PR #104](https://github.com/superlucky84/lithent/pull/104)에 반영했다. PR의 최초 Validate 기동/frozen install 성공을 확인했으며 최종 PR/main CI와 M-4/M-9/M-10의 외부 설정/발행·실제 Safari/OS IME는 미완료다. M-13의 전체 통합은 수정 전 이력이다.
- 연결: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 각 실행에는 커밋 SHA, 도구/브라우저 버전, 명령, 기대/실제 결과, 근거 경로, 미실행 사유를 적는다.
- 단위·fixture로 자동화한 항목은 자동 검증 근거를 연결할 수 있다. 실제 서비스 설정과 실제 발행 여부는 별도 기록한다.
- U-5(2026-11-06)로 기존 `RELEASING.md`·`CONTRIBUTING.md` 연결·갱신을 승인받았다. 정본 링크는 연결했으며 M-10의 실제 운영 연계 검증은 아직 미완료다.
- U-6(2026-11-06)로 DC-1의 reportError와 비동기 throw fallback 정책이 확정됐다. M-2는 이 계약을 검사한다.
- U-7(2026-11-06)로 Phase 1 APPROVE 후 Phase 2 CI·패키지 검증 확장에 착수한다. 실제 GitHub/npm 설정은 완료로 표시하지 않는다.
- U-8(2026-11-06)로 Phase 2 리뷰를 실행하지 않고 Phase 3을 진행한다. 기존 M-5를 세 엔진 config/discovery·입력/포커스·기존 전체 suite의 근거로 보강한다.
- U-9(2026-11-06)의 계속 진행 지시에 따라 Phase 3 리뷰 선택을 다시 묻지 않고 Phase 4 운영안을 구체화한다. 실제 발행과 외부 설정 완료로 간주하지 않는다.
- U-10(2026-11-07)으로 main의 모든 필수 검사 성공 후 자동 발행을 확정했다. 실제 Trusted Publisher·환경·활성화 변수 설정 완료와는 구분한다.
- U-11(2026-11-07)로 Phase 4 리뷰를 실행하지 않고 Phase 5 하드닝을 진행한다.
- U-12(2026-11-07)로 Phase 5 리뷰 없이 Phase 6 동일 소스 전체 통합을 진행한다.
- U-13/U-14(2026-11-07)로 전체 최종 리뷰의 REQUEST_CHANGES 1건을 수정한다. 업로드 뒤 확인 실패의 원래 run/SHA 복구와 미확정 기록의 명시 실패를 M-14에서 검사한다.
- U-15/U-16(2026-11-07): 수정분 재리뷰 APPROVE 뒤 사용자가 커밋·PR 생성과 배포 대상 버전업 정렬을 요청했다. npm 재조회는 준비한 7개 patch의 미발행/최신 stable 초과와 미변경 create-lithent 0.3.4 제외를 확인했으며 기존 manifest를 추가 bump하지 않는다. 실제 발행 성공으로 표시하지 않는다.
- U-17(2026-11-08): 발행은 main 대상 Validate 수동 실행에서만 한다. main push는 검증만 하며 M-9에서 확인한다.

## cleanup·element

- [x] M-1 — RQ-1/RQ-2/RQ-3, DC-1/DC-2/IC-1: 두 코어에서 첫 cleanup이 실패해도 동일 컴포넌트의 나머지 등록·자식·형제 정리와 DOM 제거를 완료한다. destroy/교체/keyed/portal, 수동 map 관리, 동일 함수 중복 등록과 재진입·재시도를 포함한다. 실패: cleanup 누락·중복 실행·잔여 DOM·부적절한 map 삭제. 근거: `core-cleanupErrors.test.ts` 11개 × 2코어 PASS.
- [x] M-2 — RQ-4, DC-1: `reportError` 지원/미지원에서 원래 오류를 관측하고 정리를 완료한다. 보고 함수가 실패하는 경우도 확인한다. 실패: 오류 유실·후속 cleanup 중단·예상 밖 동기 예외. 원래 오류의 동일성과 보고 시점의 DOM 제거 완료를 확인한다. 근거: 양 코어 core 회귀와 Chromium `cleanup.spec.ts`의 native/fallback 4개 PASS.
- [x] M-3 — RQ-5, IC-1: 두 코어의 Custom Element를 실제 제거하고 microtask 뒤 재연결하면 새 인스턴스로 렌더한다. 같은 태스크 이동은 상태를 보존한다. 실패: 재마운트 생략·오래된 renew 작동·이동 중 중복 생성. 근거: `element-cleanupErrors.test.ts` shadow/light 4개 × 2코어 PASS.

## PR 검증·브라우저

- [ ] M-4 — RQ-6/RQ-7/RQ-9, DC-3: PR와 main에서 기대한 빌드·테스트·package·size·E2E 검사가 모두 실행된다. 의도적 실패·산출물 누락·검사 0개를 fixture에서 검출한다. 고정 check 이름을 branch protection/ruleset에 연결했는지 별도로 확인한다. 실패: 누락/실패의 성공 처리·필수 검사 없이 강제 완료 주장. 로컬 근거는 IMPLEMENT Phase 2의 1,206 dual·172 toolchain·5 fixture·8 pack·복원 Chromium 82 PASS다. 실제 GitHub 실행과 required check CI 설정은 미완료라 본 항목은 열어 둔다.
- [x] M-5 — RQ-8/RQ-9, DC-4/DC-15/DC-16/DC-17/DC-18: Chromium/Firefox/WebKit 각각 두 코어에서 실제 keyboard 입력·동일 노드 renew/다른 keyed 행 재정렬의 focus/selection·Tab/Space·checked·native 이벤트·cleanup을 확인한다. 선택값 오류·빈 값은 실패하고 같은 build hash를 소비한다. 기존 CDP GC 검사는 공통 API로 실행하며 엔진 기능 차이/환경 실패를 skip으로 숨기지 않는다. 근거: Chromium 153.0.8010.12·Firefox 155.0·WebKit 26.6 각각 base 44/Concurrent 46 = 90 PASS, 총 270; 세 report의 skipped/flaky/unexpected 0, discovery 이름 일치, 433파일 hash PASS. favicon·병렬 부하 실패와 최종 단독 실행은 IMPLEMENT Phase 3에 구분해 보존했다. 실제 Safari와 OS IME는 미검증이다.

## 선택적 npm 발행

- [x] M-6 — RQ-10/RQ-11, DC-5/DC-6/DC-24: 아래 후보 선택 표를 fixture와 로컬 read-only 보고서로 확인했다. 실패: 선택 외 패키지 발행·private 등록·초기 미발행 버전의 일괄 발행. 근거: 실제 registry 7 후보/1 baseline 제외와 후보 0/1/복수·private/신규/공유 src 소유 경고 fixture PASS. PR workflow 연결은 구현했으며 실제 GitHub 실행은 미완료다.

| 입력                                           | 기대 발행 계획                                        |
| ---------------------------------------------- | ----------------------------------------------------- |
| 공개 패키지 버전 변경 없음                     | 0개, 정상 종료와 이유 보고                            |
| root `lithent`만 버전업                        | root만 후보                                           |
| `@lithent/lithent-vite`만 버전업               | 해당 플러그인만 후보; 의존성은 검증                   |
| 공개 패키지 여러 개 버전업                     | 해당 패키지만 의존 순서로 후보                        |
| private workspace만 버전업                     | 0개                                                   |
| element 내부 manifest만 버전업                 | 별도 element 발행 없음; root 소유 관계 안내           |
| root와 Concurrent에 영향을 주는 공유 소스 변경 | 작업자가 올린 공개 버전만 후보; 영향/누락 가능성 보고 |
| 도입 시 현재 버전이 registry에 없음            | bootstrap 기준에 따라 보류, 자동 일괄 발행 없음       |
| 새 public manifest가 추가됨                    | 허용 목록과 초기 발행 정책 확정 전 제외/보류          |
| 버전 감소·잘못된 semver                        | 실패, 발행 없음                                       |

- [x] M-7 — RQ-11/RQ-14, DC-6/DC-20/DC-23: A 성공 후 B 실패를 주입형 실행기로 재현했고 A의 성공을 저장·B에서 중단했다. 재실행은 A를 건너뛰고 B만 처리했다. version diff 없이 재계산하는 planner, 404/401/403/429/5xx·실제 abort deadline·CLI 오류 뒤 지연 확인·잘못된 integrity 거부 fixture PASS. 실제 발행 없음. 실패: 중복 발행·B 영구 누락·부분 성공을 전체 성공으로 보고.
- [x] M-8 — RQ-12, DC-21/DC-22/DC-23/DC-24, IC-2: 8개 fresh archive와 7개 실제 후보 소비자를 통과했다. 혼합 ESM/CJS·두 코어 strict 타입, 실제 Vite/MDX/template 변환과 로컬 registry의 비선택 의존성이 관측됐다. tarball/plan/proof/source/policy 불일치·dirty 발행 증거와 잘못된 발행 bytes를 fixture에서 거부했다. 436파일 bundle 생성/대조 PASS. 실제 CLI 발행 입력/원격 CI 검증은 아직 미완료다. 실패: 검증 후 repack·다른 SHA artifact·미발행 의존 버전·지원하지 않는 export 진입점.
- [ ] M-9 — RQ-13/RQ-15, DC-3/DC-7/DC-8: PR/fork/실패한 main/부적절한 ref에서는 발행이 실행되지 않는다. 신뢰하는 main 수동 실행의 필수 검사 성공 후에만 OIDC 발행을 허용하고 main push는 발행하지 않는다(U-17). 패키지별 Trusted Publisher·repository 메타데이터·runner/CLI·권한을 확인한다. 초기 검증은 mock/dry-run으로 하며 실제 발행은 활성화 후 별도 운영 근거를 남긴다.
- [ ] M-10 — RQ-15, DC-9: 허락받은 기존 문서에 새 절차와 실패 복구 경로가 연결된다. 실제 발행된 패키지만 동일 SHA에 tag를 남기고 root 발행 후 docs workflow 연계가 작동한다. GITHUB_TOKEN tag push만으로 연쇄 실행된다고 추정하지 않는다. npm 발행·GitHub Release·문서 사이트 결과를 구분한다.

M-9/M-10 코드 검증: production adapter·실제 workflow 조건·부분 성공 receipt·원래 attempt artifact·다른 SHA/tag 충돌·root docs dispatch를 포함해 최종 CI fixture 35 PASS.
Phase 8(2026-11-08): main push 거부·수동 실행 허용의 워크플로 조건과 발행 가드 회귀, 결함 주입 2개를 추가했다. `pnpm test:ci` 49 PASS, 결함 주입 36/36 검출.
로컬 production CLI와 --allow-dirty는 발행 전에 거부했다. 원격 npm/GitHub 쓰기는 mock으로 대체했다.
운영 체크는 실제 main CI·환경 보호·ci.yml/npm Trusted Publisher·NPM_PUBLISH_ENABLED 설정과 최초 발행/tag/docs run을 확인할 때 완료로 바꾼다.
필요한 담당/설정/재시도 절차는 RELEASING에 있고, 신규 Trusted Publisher의 첫 발행 2일 기한도 포함한다.

## 운영 활성화 기록

- [x] M-14 — RQ-11/RQ-12/RQ-14/RQ-16, DC-31: 업로드 후 HTTP 오류/timeout/404 기한 소진을 unconfirmed로 저장한다. 같은 run/SHA의 재실행이 이미 발행된 동일 archive를 건너뛰어도 원래 미확정 receipt를 registry에서 다시 확인해 tag/docs를 복구했다. production adapter 합성 통합에서 publish 재실행·record만 재실행·같은 commit 후보 0 재계산을 통과했다. 계속 404/오류/다른 SRI이면 기록 실패와 대상 tag/docs 0개를 확인했고 다른 성공 패키지는 기록됐다. 다른 run/SHA/archive·skipped/pending/업로드 전 실패의 무단 복구도 거부했다. 새 회귀 4개의 수정 전 assertion 실패, 수정 후 전체 fixture 47 PASS와 기존 29+새 4 = 33/33 결함 검출·정상 baseline 58 PASS를 확인했다. 실제 npm/GitHub 쓰기는 mock으로 제한했다. 근거: IMPLEMENT Phase 7, `/workspace/work/lithent-phase7/{verification,hardening-summary}.json` 및 로그.

- [x] M-13 — RQ-1/RQ-6/RQ-7/RQ-8/RQ-10/RQ-12/RQ-14/RQ-15, DC-29/DC-30: clean snapshot `0f7c8f2af837d128ebe2f284f4b33731b6cb3a04`의 fresh build·dual 1,206/기존 skip 3·toolchain 172·CI fixture 41·mutation 29·실제 8 pack/7 후보·size를 통과했다. 새 checkout에 417파일 bundle을 복원해 Chromium 153.0.8010.12/Firefox 155.0/WebKit 26.6 각각 90 PASS, 총 270개를 첫 실행에 통과했다. 모든 결과 passed 1회/skip 0·동일 case 집합을 확인했고 E2E 후 hash/clean 상태도 같았다. 합성 단일/복수 버전업·부분 실패/재실행·tag/docs는 모의 응답으로 별도 검증했다. Phase 6 종료 때 입력 1,407개는 같은 byte hash였고 합성 통합 테스트 1개는 줄바꿈/AST 동일성·2개 재통과를 확인했다. 이후 배포 도구 수정은 M-14/Phase 7로 구분한다. 실제 npm/GitHub 쓰기는 없다. 근거: `/workspace/work/lithent-phase6/`의 manifests/summary/logs/reports, `test-format-equivalence.json` 및 IMPLEMENT Phase 6.

운영 미완료 항목: 저장소 관리자의 required CI·npm 환경 main 제한·NPM_PUBLISH_ENABLED 활성화, 패키지 소유자의 ci.yml/npm Trusted Publisher/direct publish 등록과 최초 실제 main run/발행/tag/docs 성공 근거다.
M-4/M-9/M-10은 그 외부 근거가 생길 때 완료로 바꾼다. 구현/로컬 검증 완료를 서비스 활성화 완료로 표시하지 않는다.

- [x] M-12 — RQ-1/RQ-4/RQ-7/RQ-10/RQ-12/RQ-13/RQ-14, DC-27/DC-28: 첫 26/29 검출 뒤 경로 경계·event/ref 검사 3개를 보강했다. 최종 같은 29개 전부에서 기대한 assertion 실패를 관측했고 정상 cleanup/Node baseline 53·CI fixture 39·실제 element 8개는 모두 통과했다. 수집/skip/spawn/worker 오류는 검출로 세지 않는 하네스 검사도 통과했다. 보고서 `artifacts/hardening/run-2T2E8a/summary.json`의 작업 트리 참여 소스 불변을 확인했고 CI Quality에 연결했다. 실제 npm/GitHub 쓰기는 없다. 실패: 살아남은 결함을 성공 처리·실행 오류를 검출로 계산·사용자 작업 트리 변조.

- [x] M-11 — RQ-7/RQ-12, DC-11/DC-12/DC-14: CI gate의 success/failure/skipped/cancelled와 검사 0개를 구분한다. 누락 exports/bin·workspace 잔여·artifact 변조·SHA 불일치·dirty 거부를 fixture에서 실패시킨다. 동일 SHA의 정상 bundle만 통과한다. 실패: 검사 누락의 성공 처리·다른 tarball/빌드 소비. 근거: `test:ci` 5개 PASS, production CLI의 dirty/기존 출력 거부 PASS, 별도 checkout의 433파일 bundle hash 대조 PASS. 로컬 검증은 dirty=true로 기록하며 clean GitHub 실행·발행 근거로 쓰지 않는다.

Phase 4 보강: CI fixture 25 PASS, plan/proof를 포함한 436파일 bundle의 별도 checkout 복원/대조 PASS.
동일 복원 checkout에서 실패한 consumer proof·같은 크기의 tarball 변조·dirty CI 증거를 production CLI가 거부했고 원본 복원 후 통과했다.
근거는 `/workspace/work/lithent-phase4/{ci-fixtures-complete,restored-artifacts,restored-guards}.log`다.

| 항목                                 | 현재 상태             | 완료 근거                        |
| ------------------------------------ | --------------------- | -------------------------------- |
| 네 문서 설계                         | 최종 인계 정렬 완료   | Phase 6, 본 문서 세트            |
| cleanup 런타임·회귀                  | Phase 1 완료          | M-1~M-3, IMPLEMENT               |
| PR/main CI·8개 패키지 검증 코드      | 최종 로컬 재검증 완료 | M-11/M-13                        |
| 3개 브라우저 행렬·회귀               | 최종 270 PASS         | M-5/M-13                         |
| 선택적 npm 후보/소비자·주입형 실행기 | 로컬 검증 완료        | M-6~M-8, DC-19~DC-24             |
| 실제 발행 job·tag/docs 연계          | 구현·모의 통합 완료   | 47 fixture; 운영 M-9/M-10 미완료 |
| 미확정 발행의 원래 run/SHA 복구      | 수정·로컬 검증 완료   | M-14, 47 fixture·33 mutation     |
| 결함 주입/검출력 하드닝              | Phase 5 로컬 완료     | M-12, 29/29 검출·39 fixture      |
| GitHub required checks               | 설정 미변경           | —                                |
| 배포 catalog/초기 기준               | read-only 검증 완료   | DC-6                             |
| npm Trusted Publisher·패키지 권한    | 미확인                | —                                |
| 실제 npm 발행                        | 미실행                | —                                |
| 실제 Safari/IME                      | 미실행                | —                                |

## 결과 기록 양식

```text
ID / SHA / 도구·브라우저·코어 / 명령 또는 설정:
기대 결과:
실제 결과 / PASS·FAIL·미실행:
근거 / 남은 항목 / 담당:
```

# IMPLEMENT — 홍보 전 저장소 정비 (repo-polish)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 규칙: 커밋하지 않는다(REQUIREMENTS §3-3). GitHub 공개 설정은 DESIGN 초안을 사용자가 확인한 뒤 반영한다.

## 진행 현황

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 | done |
| 1 | npm 메타데이터 | done |
| 2 | 커뮤니티 파일 | done |
| 3 | 루트 정리·크기 표기 통일 | done |
| 4 | 소셜 미리보기 이미지·문서 사이트 OG | done |
| 5 | README 첫 화면 | done (M-6 대기) |
| 6 | GitHub 설정·이슈 정리 | done |
| 7 | Test Hardening | done |
| 8 | Integration Test | done (푸시 후 수동 항목 남음) |

## Phase 0 — 문서 작성: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, DC-1, DC-3, DC-4, DC-5, DC-6, DC-7

- [x] 출발 상태 조사 (GitHub 메타데이터, 커뮤니티 점수, npm 필드, 루트 참조)
- [x] Preact·React 크기 실측 (DESIGN §1)
- [x] 사용자 결정 반영 (DC-1, DC-3, DC-4, DC-5)
- [x] REQUIREMENTS, DESIGN, IMPLEMENT, MANUAL_TEST_CHECKLIST 작성

Files:
- `docs/repo-polish/REQUIREMENTS.md` (added)
- `docs/repo-polish/DESIGN.md` (added)
- `docs/repo-polish/IMPLEMENT.md` (added)
- `docs/repo-polish/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — npm 메타데이터: done

Refs: RQ-1, RQ-2

- 진입 조건: Phase 0 완료
- [x] `package.json`의 `description`, `keywords`, `homepage`, `bugs`를 DESIGN §2대로 수정
- 기본 테스트: `node -e 'require("./package.json")'`, `pnpm pack --dry-run`이 성공
- 종료 조건: 네 필드가 DESIGN §2와 일치
- 결과 (2026-11-13): JSON 로드 OK(keywords 17개), `pnpm pack --dry-run` 성공, prettier 통과.
  `package.json`은 release-policy의 `lithent` sourcePaths에 들어 있어 다음 릴리스 계획에 변경으로 잡힌다(의도한 동작).

Files:
- `package.json` (modified)

## Phase 2 — 커뮤니티 파일: done

Refs: RQ-6, DC-7

- 진입 조건: Phase 0 완료
- [x] `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, GitHub 경로로 신고 안내)
- [x] `.github/ISSUE_TEMPLATE/bug_report.yml`
- [x] `.github/ISSUE_TEMPLATE/feature_request.yml`
- [x] `.github/ISSUE_TEMPLATE/config.yml`
- [x] `.github/pull_request_template.md`
- [x] `CONTRIBUTING.md`에 CoC 링크 한 줄 추가
- 기본 테스트: YAML 템플릿 파싱 성공, 템플릿 속 링크가 실제 경로/URL과 일치
- 종료 조건: GitHub 커뮤니티 프로필이 요구하는 파일이 모두 존재
- 결과 (2026-11-13): `yaml@2.4.2`로 세 YAML 파싱 OK, issue form 필수 키(`name`, `description`, `body`)와 id 중복 없음 확인, prettier 통과.
  PR 템플릿 체크 항목은 CONTRIBUTING의 로컬 검사 명령(`pnpm build`, `pnpm test:dual`, `pnpm size`)에서 골랐다.

Files:
- `CODE_OF_CONDUCT.md` (added)
- `.github/ISSUE_TEMPLATE/bug_report.yml` (added)
- `.github/ISSUE_TEMPLATE/feature_request.yml` (added)
- `.github/ISSUE_TEMPLATE/config.yml` (added)
- `.github/pull_request_template.md` (added)
- `CONTRIBUTING.md` (modified)

## Phase 3 — 루트 정리·크기 표기 통일: done

Refs: RQ-1, RQ-10, DC-5, DC-6

- 진입 조건: Phase 0 완료
- [x] `sample.ts` 삭제
- [x] `MANUAL.md`의 "zip 3kb" 수정 → "코어 약 4.8KB, brotli"
- [x] 저장소 공개 문서에서 "4KB"·"3kb" 같은 옛 수치 검색 후 수정 (CHANGELOG·`docs/` 기록은 역사이므로 제외)
  - 남은 것은 `lithentDocs/index.html` 메타 3곳뿐이라 Phase 4에서 함께 고친다.
- 기본 테스트: `pnpm build:core`, `pnpm test:core` 통과
- 종료 조건: 공개 문서에 옛 수치 없음(문서 사이트 메타는 Phase 4), 빌드·테스트 통과
- 결과 (2026-11-13): `pnpm build:core` 성공, `pnpm test:core` 76 files / 487 tests 통과.
  `tsconfig.json`의 `include`가 `["src"]`라 `sample.ts` 삭제가 타입 검사에 영향 없음.

Files:
- `sample.ts` (deleted)
- `MANUAL.md` (modified)

## Phase 4 — 소셜 미리보기 이미지·문서 사이트 OG: done

Refs: RQ-1, RQ-4

- 진입 조건: Phase 0 완료
- [x] `docs/repo-polish/social-preview.html` 원본 작성
- [x] Playwright로 1280×640 `lithentDocs/public/social-preview.png` 생성 (<1MB)
  - 재생성: `node docs/repo-polish/render-social-preview.mjs`
- [x] `lithentDocs/index.html` OG/Twitter 이미지·크기·설명 수정
- 기본 테스트: PNG 크기·용량 확인, `pnpm build:docs` 성공
- 종료 조건: 이미지가 DESIGN §4 구성대로 나오고 문서 사이트 메타가 그 이미지를 가리킴
- 결과 (2026-11-13): PNG 1280×640, 253,099B. `pnpm build:docs` 성공, `lithentDocs/dist/social-preview.png` 포함.
  빌드 경고(DEP0190, chunk size)는 변경 전 빌드에도 똑같이 나온다.
  favicon(`/lithent.png`)은 그대로 둔다.

Files:
- `docs/repo-polish/social-preview.html` (added)
- `docs/repo-polish/render-social-preview.mjs` (added)
- `lithentDocs/public/social-preview.png` (added)
- `lithentDocs/index.html` (modified)

## Phase 5 — README 첫 화면: done (M-6 대기)

Refs: RQ-1, RQ-5, DC-1, DC-2, DC-6

- 진입 조건: Phase 1, 3 완료(수치 표기 확정)
- [x] CI 배지 추가
- [x] Try it online 링크 추가 (DC-2: M-6 실패 시 제거)
- [x] 비교표 추가 (DESIGN §5, 측정 버전·방법 각주)
- [x] 기존 사용자용 세부 안내 3곳을 링크 한 줄로 축소
- 기본 테스트: README 상대 링크가 모두 존재, `prettier --check README.md`
- 종료 조건: DESIGN §5 구조와 일치
- 결과 (2026-11-13): 상대 링크 35개 모두 존재, prettier 통과.
  새 외부 링크(CI 배지, StackBlitz, CoC 출처 5개, Discussions)는 모두 HTTP 200이고, CI 배지는 `passing`이다.
  StackBlitz 페이지는 열리지만 그 안에서 앱이 실제로 실행되는지는 확인하지 못했다(M-6).
  README 내용을 검사하는 스크립트나 테스트는 없다(`scripts/`, `.github/` 검색).

Files:
- `README.md` (modified)

## Phase 6 — GitHub 설정·이슈 정리: done

Refs: RQ-3, RQ-7, RQ-8, RQ-9, DC-3, DC-4

- 진입 조건: **사용자가 DESIGN §3, §7 초안을 확인**
- [x] good first issue 후보 본문 초안 작성 → DESIGN §7에 기록
- [x] 사용자 확인 (DESIGN §3 설명·토픽, §7 닫기 코멘트·이슈 3건) — "전부 반영" (2026-11-13)
- [x] `gh repo edit`로 설명·토픽·Wiki 반영
- [x] #66, #67 코멘트 후 닫기 (reason: not planned)
- [x] good first issue 등록 (`good first issue`, `documentation` 라벨) — #112 ssr, #113 ftags, #114 tag
- 기본 테스트: `gh repo view --json description,repositoryTopics,hasWikiEnabled`, `gh issue list`
- 종료 조건: 조회 결과가 DESIGN §3, §7과 일치
- 결과 (2026-11-13): 설명이 DESIGN §3과 같고 토픽 20개, `hasWikiEnabled: false`.
  열린 이슈는 `good first issue` 3건뿐이다.
  등록 뒤 확인하다가 #112 본문의 참고 자료가 틀린 것을 발견했다. 문서 사이트 Example 12는 SSR 예제가 아니라 Mixed DOM이고, 문서 사이트에는 SSR 가이드가 없다.
  그래서 `createLithent/express` 템플릿(`lithent/ssr` 사용 확인)과 `ssr/src/tests`로 고쳤다.
  #113, #114의 문서 링크(`#/guide/ftags`, `#/guide/htm-tags`)는 `Sidebar.tsx` 라우트로 확인했다.

Files: none (GitHub 저장소 설정과 이슈만 바꿨다)

## Phase 7 — Test Hardening: done

Refs: RQ-1, RQ-5, RQ-6, RQ-10

- 진입 조건: Phase 1~5 완료
- [x] 변경된 모든 Markdown 파일의 상대 링크 존재 검사 (스크립트로 일괄)
- [x] 공개 문서 전체에서 크기 수치 grep → DESIGN §1과 일치
- [x] 이슈 템플릿 YAML을 GitHub issue forms 스키마 필수 키(`name`, `description`, `body`) 기준으로 확인
- [x] 변경 파일 prettier 검사 (루트에 `lint` 스크립트가 없고 CI도 lint 단계가 없음)
- 종료 조건: 위 검사 모두 통과, 결과를 이 Phase에 기록
- 결과 (2026-11-13):
  - 상대 링크: README 35, CONTRIBUTING 8, CODE_OF_CONDUCT 7, MANUAL 10, `docs/repo-polish/*.md` 14개 모두 존재.
  - 크기 수치: README, MANUAL.md, `package.json`, `lithentDocs/index.html`, `skills/lithent/SKILL.md`가 모두 "~4.8KB"이고 "4KB"·"3kb"는 없다.
    `size-report.js` base는 4,763B / 4,800B.
  - YAML: Phase 2 결과와 같다.
  - prettier: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `package.json`, `.github/`는 통과했다.
    `docs/repo-polish/*.md`와 `social-preview.html`은 적용하지 않았다. 기존 설계 문서(`docs/element/*.md` 등)도 Prettier를 적용하지 않는 관례를 따랐다.
    HTML은 코드 블록이 `white-space: pre`라 Prettier가 줄바꿈을 바꾸면 이미지가 달라진다.

Files: none

## Phase 8 — Integration Test: done (푸시 후 수동 항목 남음)

Refs: RQ-1, RQ-2, RQ-4, RQ-5, RQ-6

- 진입 조건: Phase 7 완료
- [x] CI Quality 단계 중 이번 변경과 관련된 명령 실행 (아래 범위 참고)
- [x] 패킹된 `lithent-1.25.9.tgz`로 npm 메타데이터·포함 파일 확인 (`sample.ts` 삭제 영향 없음)
- [x] `pnpm build:docs` 결과물에 `social-preview.png` 포함 확인 (Phase 4)
- [x] MANUAL_TEST_CHECKLIST 중 푸시 전 가능한 항목 수행, 푸시 후 항목은 사용자에게 넘김
- 종료 조건: 자동 검증 통과, 수동 항목 상태 기록
- 결과 (2026-11-13):
  - 통과: `pnpm build`, `pnpm test:core`(Phase 3, 487 tests), `pnpm test:ci` 49/49, `pnpm verify:release` ALL PASS(패키지 8개, 게시 없음).
  - 로컬 실행 주의: 첫 실행에서 `test:ci`(5 fail)와 `verify:release`가 `Artifact target escapes package or is not a file`로 실패했다.
    macOS의 `$TMPDIR`(`/var/folders/...`)가 `/private/var`의 심볼릭 링크라서 `scripts/artifact-utils.mjs`의 `safeFile` realpath 검사에 걸린 것이다.
    `TMPDIR=$(cd "$TMPDIR" && pwd -P)`로 다시 돌리니 모두 통과했다. 이번 변경과는 관계없는 로컬 환경 문제다(CI는 Linux).
  - 패킹 결과: `homepage`가 문서 사이트, `bugs`가 있고, `keywords` 17개, 새 description, 파일 560개. `sample.ts`·`social-preview`는 포함되지 않는다.
  - 로컬에서 돌리지 않음: `test:dual`의 concurrent·satellite 부분, `test:toolchain`, 신뢰성 mutation, 3개 브라우저 E2E.
    코드(`src/` 등)를 바꾸지 않았으므로 PR CI에 맡긴다.

Files: none

- 완료: Phase 0~8. 저장소 파일 변경은 미커밋 상태다. GitHub 설정과 이슈는 반영을 마쳤다.
- 다음 (사용자):
  1. 변경분 커밋 → PR → main 병합 (요청 시 진행)
  2. GitHub Settings → Social preview에 `lithentDocs/public/social-preview.png` 업로드 (M-4)
  3. 병합 후 MANUAL_TEST_CHECKLIST의 M-4~M-7 확인. M-6(StackBlitz)이 실패하면 README 링크를 빼고 DC-2를 닫는다.
  4. npm 메타데이터는 다음 `lithent` 릴리스 때 나간다(M-2 후반).
- 블로커: 없음
- 브랜치 `chore/repo-polish`, 최신 커밋 `9bbfb65` (작업분 미커밋)

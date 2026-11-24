# REQUIREMENTS — 홍보 전 저장소 정비 (repo-polish)

- 브랜치: `chore/repo-polish` / 기준 커밋 `9bbfb65`
- 작성일: 2026-11-13
- 상태: **계획 확정, 구현 진행 중** — 진행 상황은 [IMPLEMENT.md](./IMPLEMENT.md)의 Handoff 블록 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 문서 위치: `docs/repo-polish/` — 특정 패키지 소속이 아니라 저장소 전체(README, 메타데이터, GitHub 설정)에 걸친 작업이라 저장소 수준 `docs/` 아래에 둔다.
- 코드 범위: `README.md`, `package.json`, `.github/`, `CODE_OF_CONDUCT.md`, `sample.ts`, `MANUAL.md`, `lithentDocs/index.html`, `lithentDocs/public/`, GitHub 저장소 설정(설명·토픽·Wiki·이슈)

## 1. 배경 및 목적

홍보 링크를 눌러 처음 들어온 사람이 **30초 안에 "써볼 만하다"고 판단할 수 있는 저장소**를 만든다.
처음 온 사람은 GitHub 설명·토픽, 소셜 미리보기 카드, README 첫 화면, 루트 파일 목록만 보고 떠날지 정한다.

### 1.1 출발 상태 (2026-11-13 확인)

| 항목 | 상태 |
|---|---|
| GitHub 설명 | "4KB core" — 실제 base 코어는 4,763B brotli(`scripts/size-report.js`), README는 "~4.8KB" |
| GitHub 토픽 | 11개. `generators`(의미 불명확), `lithentjs`(중복) 포함. `typescript`, `ssr`, `web-components` 등 없음 |
| 소셜 미리보기 | 커스텀 이미지 없음(GitHub 기본 카드) |
| 문서 사이트 OG | `og:image`가 1024×1024 로고인데 메타는 1200×630으로 선언, 설명은 "4KB" |
| npm `keywords` | `["lithent"]` 하나 — npm 검색 노출 거의 없음 |
| npm `homepage` | GitHub 주소. `bugs` 없음 |
| README | 첫 화면 구성은 양호. 기존 사용자용 세부 안내(props 얕은 복사, 이벤트 계약, concurrent alias)가 섞여 있음. 비교 근거·플레이그라운드·CI 배지 없음 |
| 커뮤니티 점수 | 71% — CODE_OF_CONDUCT, 이슈 템플릿, PR 템플릿 없음 |
| 이슈 | 열린 이슈 2개(#66, #67)가 2024-10에 본문 없이 열린 채 방치 |
| Wiki | 켜져 있으나 사용 안 함 |
| 루트 | `sample.ts`(수동 동기화 스냅샷, 2025-10 이후 미갱신, 참조 없음), `MANUAL.md`의 "zip 3kb" 문구 |

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 크기 수치는 `scripts/size-report.js` 실측값과 일치해야 한다. GitHub 설명, README, 문서 사이트 메타, npm 설명, MANUAL.md가 같은 수치를 쓴다 | M-1, Phase 7 grep |
| RQ-2 | npm 검색에 걸리도록 `package.json`에 `keywords`, `homepage`(문서 사이트), `bugs`를 채운다 | M-2 |
| RQ-3 | GitHub 설명·토픽을 실제 기능에 맞게 고친다. 토픽은 20개 이하 | M-3 |
| RQ-4 | 1280×640 소셜 미리보기 이미지를 만들고 GitHub와 문서 사이트 OG에 같은 이미지를 쓴다 | M-4 |
| RQ-5 | README 첫 화면에 React/Preact 대비 사실 비교표, 바로 실행 링크, CI 배지를 넣고, 기존 사용자용 세부 안내는 문서 링크로 옮긴다 | M-5, M-6 |
| RQ-6 | 커뮤니티 파일(CODE_OF_CONDUCT, 이슈 템플릿, PR 템플릿)을 추가해 커뮤니티 점수 100%에 도달한다 | M-7 |
| RQ-7 | 방치 이슈 #66, #67을 정리 코멘트와 함께 닫는다 | M-8 |
| RQ-8 | 새 기여자용 `good first issue`를 3~5개 등록한다 | M-8 |
| RQ-9 | 쓰지 않는 Wiki를 끈다 | M-3 |
| RQ-10 | 참조 없는 오래된 루트 파일만 정리한다(`sample.ts` 삭제, `MANUAL.md` 오래된 수치 수정) | Phase 7 빌드·테스트 |

## 3. 제약

1. **사실만 쓴다.** 비교표의 크기는 같은 방법(minified 파일의 gzip/brotli)으로 실측한 값만 쓴다. "더 빠르다"처럼 벤치마크 근거가 README에 함께 있지 않은 주장은 넣지 않는다.
2. **GitHub 공개 설정은 초안 확인 후 반영한다.** 설명·토픽·Wiki·이슈 닫기·이슈 등록은 DESIGN.md에 문구 초안을 적고 사용자 OK 후 `gh`로 반영한다(사용자 결정 2026-11-13).
3. **커밋하지 않는다.** 작업은 커밋하지 않은 상태로 남기고, 커밋·푸시는 사용자가 요청할 때만 한다.
4. **코어·패키지 동작 무변경.** `src/` 등 라이브러리 코드는 건드리지 않는다. npm 메타데이터 변경은 다음 릴리스에 함께 나간다.
5. **빌드가 참조하는 루트 항목은 옮기지 않는다.** `experiments/`, `html/`, `lithent-agent-addon.md`(dist로 복사됨, 문서 사이트가 경로를 안내함)는 유지한다(사용자 결정 2026-11-13, "오래된 것만 정리").

## 4. 비목표

- 실제 홍보 글 작성·게시(HN, Reddit, X 등)
- 문서 사이트 디자인 개편
- 루트 폴더 구조 재편(`experiments/`, `html/` 이동)
- 새 기능 개발이나 벤치마크 재측정

## 5. 사용자가 직접 해야 하는 일

- GitHub **Settings → Social preview**에 이미지 업로드 (공개 API 없음)
- 커뮤니티 점수, README 렌더링, 소셜 카드 확인은 **푸시 후** 가능

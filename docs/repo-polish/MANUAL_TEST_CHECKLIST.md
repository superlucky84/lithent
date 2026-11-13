# MANUAL TEST CHECKLIST — 홍보 전 저장소 정비 (repo-polish)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)
- **푸시 후** 표시 항목은 브랜치가 GitHub에 올라가거나 main에 병합된 뒤에만 확인할 수 있다.

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 크기 표기 일관성 | GitHub 설명, README, 문서 사이트 메타, npm 설명, MANUAL.md 모두 "~4.8KB"이고 `node scripts/size-report.js --report`의 base brotli가 4,800B 이하 | 푸시 전 + GitHub 반영 후 | 2026-11-13 일부 통과: 저장소 파일과 GitHub 설명은 ~4.8KB, base 4,763B. 문서 사이트 메타는 배포 후 확인 |
| M-2 | npm 메타데이터 | `pnpm pack --dry-run` 결과 `package.json`에 keywords 17개, homepage가 문서 사이트, bugs 존재. 릴리스 후 npmjs.com 페이지 사이드바에 Homepage·Issues 링크 표시 | 푸시 전 / 릴리스 후 | 2026-11-13 푸시 전 통과(패킹된 tgz 확인). npmjs.com 확인은 릴리스 후 |
| M-3 | GitHub 설명·토픽·Wiki | 저장소 첫 화면 About에 새 설명과 토픽 20개, 상단 탭에 Wiki 없음 | GitHub 반영 후 | 2026-11-13 API로 통과(설명 일치, 토픽 20, Wiki off). 화면 확인 남음 |
| M-4 | 소셜 미리보기 | Settings → Social preview 업로드 후, 저장소 URL을 X·Slack·Discord 중 하나에 붙였을 때 새 카드(로고·문구·코드)가 잘리지 않고 표시. 문서 사이트 URL도 같은 카드 | 업로드 후 / 문서 배포 후 | 미확인: 업로드 대기 |
| M-5 | README 첫 화면 | GitHub에서 README를 열었을 때 첫 화면(스크롤 없이)에 로고·배지·한 줄 소개·링크 줄이 보이고, 비교표가 깨지지 않으며, 모든 링크가 404 없이 열림. CI 배지가 passing | 푸시 후 | 미확인: 푸시 대기. 링크 상태·CI 배지 passing은 로컬에서 확인 |
| M-6 | Try it online | StackBlitz 링크가 열리고 `npm install && npm run dev`가 끝나 페이지가 렌더링됨. 실패하면 DC-2에 기록하고 링크 제거 | 푸시 후 (main 경로 기준) | 미확인: StackBlitz URL은 HTTP 200, 앱 실행 여부는 확인 못 함 |
| M-7 | 커뮤니티 프로필 | Insights → Community Standards에서 모든 항목 체크(100%). New issue 화면에 Bug report / Feature request / Discussions·Security 링크가 보임. 새 PR 본문에 템플릿이 채워짐 | main 병합 후 | 미확인: main 병합 대기 |
| M-8 | 이슈 정리 | #66·#67이 코멘트와 함께 closed. `good first issue` 라벨 이슈가 3개 이상 열려 있고 각 본문에 완료 조건이 있음 | GitHub 반영 후 | 2026-11-13 통과: #66·#67 closed, GFI #112~#114 open |

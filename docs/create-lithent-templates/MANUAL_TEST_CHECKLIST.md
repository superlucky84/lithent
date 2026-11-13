# MANUAL TEST CHECKLIST — create-lithent 기본 앱 교체

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)
- **병합 후** 항목은 main 병합 뒤에만 확인할 수 있다(CLI와 StackBlitz가 main을 받는다).

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | basic 브라우저 확인 | `pnpm dev`로 연 앱에서 홈 카운터 2개 동작, 카테고리 검색·정렬, 상세 인분 조절, 즐겨찾기 → 헤더 배지 반영 → 새로고침 후 유지, 뒤로/앞으로 가기, 링크 가운데 클릭 시 새 탭, `/nope` Not Found, 콘솔 에러 없음 | 병합 전 | 2026-11-13 자동 스모크 통과(dev·preview, 21/21, 가운데 클릭 제외: href 값으로 확인). 사람 확인 남음 |
| M-2 | express 브라우저 확인 | `pnpm dev`와 `pnpm build && pnpm start` 둘 다 M-1과 같은 동작. 상세 페이지 새로고침 시 서버가 렌더한 내용이 바로 보임 | 병합 전 | 2026-11-13 자동 스모크 통과(dev·운영 21/21, SSR HTML에 본문 확인). 사람 확인 남음 |
| M-3 | 하이드레이션 | express 상세 페이지에서 즐겨찾기를 켠 뒤 새로고침해도 콘솔에 하이드레이션 경고·에러가 없고 배지가 마운트 직후 갱신됨 | 병합 전 | 2026-11-13 자동: 즐겨찾기 후 새로고침해도 콘솔 에러 없음, 배지 갱신 확인 |
| M-4 | XSS 차단 | express 운영 서버 `/?q=</script><script>alert(1)</script>` 접속 시 경고창 없음, 응답 소스에 `</script><script>alert(1)` 없음 | 병합 전 | 2026-11-13 자동: 운영·개발 서버 응답에 주입 문자열 0회 |
| M-5 | 오프라인 | 네트워크를 끈 상태에서 두 템플릿 `pnpm dev` 첫 화면이 정상 | 병합 전 | 미확인 (src에 외부 호출 없음은 grep으로 확인) |
| M-6 | 모바일 폭 | 브라우저 폭 375px에서 가로 스크롤 없음, 카드 1열 | 병합 전 | 2026-11-13 자동: 375px에서 가로 넘침 0px (두 템플릿) |
| M-7 | `npx create-lithent` | 새 폴더에서 SPA·SSR 각각 생성 → `npm install` → `npm run dev`가 README 안내대로 동작 | 병합 후 | 2026-11-13 1차 실패: 새 설치(TS 5.9.3, Prettier 3.10.1)에서 빌드 실패 → Phase 8 수정. 수정본을 생성 프로젝트에 넣어 build·스모크 통과. 수정 PR 병합 후 재확인 필요 |
| M-8 | StackBlitz | 루트 README의 "Try it online"이 새 데모로 열림 | 병합 후 | |

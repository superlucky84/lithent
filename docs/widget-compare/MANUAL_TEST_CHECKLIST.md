# MANUAL TEST CHECKLIST — 같은 위젯, 네 프레임워크

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 공개 페이지 화면 | `dist/index.html`을 열면 크기·로딩 표와 네 데모가 보이고, 데모마다 별점·보내기가 동작한다. 좁은 화면(390px)에서 가로 스크롤이 없다 | 병합 전 | 2026-11-20 Chromium, 1280px 라이트·390px 다크(한국어) 스크린샷, 가로 넘침 0px. HTTP로 띄운 네 iframe에서 별점 → `feedback-rate`, 입력 동작 — **통과** |
| M-2 | 데모의 페이지 컨트롤 | 각 데모의 "다음 페이지", "한국어", "다크", "다음 보내기 거절"이 템플릿 데모와 같게 동작한다 | 병합 전 | 2026-11-20 데모는 E2E가 확인하는 호스트 페이지 그대로다. `widget-compare.spec.ts`가 네 버전에서 네 컨트롤을 모두 누른다 — **통과** |
| M-3 | 측정 재현 | 같은 기계에서 `measure`를 다시 돌리면 순위가 같고 중앙값이 비슷하다 | 병합 전 | 2026-11-20 두 번째 실행: 모바일 표시 389/698/397/398ms(첫 실행 391/694/395/400), 스크립트 22/72/27/30ms(22/66/27/33). 순위 같음 — **통과** |
| M-4 | 배포 | 병합 뒤 `https://superlucky84.github.io/lithent/widget-compare/`가 열리고 데모 iframe이 로드된다. 문서 사이트의 링크가 그 페이지로 간다 | 병합 후 | 2026-11-20 PR #131 병합(`2b8bbd4`), Deploy docs run 44737300256. 병합 약 2분 15초 뒤 200. 실제 사이트에서 가이드 링크가 영어 → `/lithent/widget-compare/`, 한국어 → `index.ko.html`로 간다. 네 iframe 모두 별점 → 같은 `feedback-rate`, 페이지 오류 없음. "번들이 바뀌었다" 안내 없음: CI 빌드 번들의 sha256이 측정한 번들과 같다 — **통과** |
| M-5 | CI 3개 브라우저 | PR CI의 Chromium·Firefox·WebKit에서 `widget-compare.spec.ts`가 통과한다 | PR | 2026-11-20 PR #131 CI run 44735563639(`98081f3`), Quality와 Browser 세 잡 모두 성공 — **통과** |

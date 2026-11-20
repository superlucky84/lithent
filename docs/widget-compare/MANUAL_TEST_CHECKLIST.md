# MANUAL TEST CHECKLIST — 같은 위젯, 네 프레임워크

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 공개 페이지 화면 | `dist/index.html`을 열면 크기·로딩 표와 네 데모가 보이고, 데모마다 별점·보내기가 동작한다. 좁은 화면(390px)에서 가로 스크롤이 없다 | 병합 전 | |
| M-2 | 데모의 페이지 컨트롤 | 각 데모의 "다음 페이지", "한국어", "다크", "다음 보내기 거절"이 템플릿 데모와 같게 동작한다 | 병합 전 | |
| M-3 | 측정 재현 | 같은 기계에서 `measure`를 다시 돌리면 순위가 같고 중앙값이 비슷하다 | 병합 전 | |
| M-4 | 배포 | 병합 뒤 `https://superlucky84.github.io/lithent/widget-compare/`가 열리고 데모 iframe이 로드된다. 문서 사이트의 링크가 그 페이지로 간다 | 병합 후 | |
| M-5 | CI 3개 브라우저 | PR CI의 Chromium·Firefox·WebKit에서 `widget-compare.spec.ts`가 통과한다 | PR | |

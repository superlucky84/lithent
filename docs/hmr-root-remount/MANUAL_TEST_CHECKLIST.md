# MANUAL TEST CHECKLIST — `<html>` 루트 컴포넌트의 반복 교체

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | SSR 템플릿 Layout | 개발 서버에서 `src/layout.tsx`를 세 번 고쳐도 매번 `header`·`main`·`h1`이 보이고 새로고침이 없다 | 병합 전 | 2026-11-20 Chromium, `node_modules/.vite` 삭제 후 3회 모두 유지 — **통과** (수정 전: 2회째부터 사라짐) |
| M-2 | SSR 템플릿 store | `src/favorites.ts`를 두 번 고친 뒤 `src/layout.tsx`를 고쳐도 본문이 유지된다 | 병합 전 | 2026-11-20 3단계 모두 유지 — **통과** |
| M-3 | 새 프로젝트 | 발행 후 `npx create-lithent`로 만든 SSR 프로젝트에서 M-1이 통과한다 | 발행 후 | |

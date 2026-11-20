# MANUAL TEST CHECKLIST — 컴포넌트 없는 모듈의 HMR 전파

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | SPA 템플릿 store | `pnpm dev`(워크스페이스 플러그인)에서 `src/favorites.ts`를 고치면 서버 로그가 importer 컴포넌트까지 전파되고, 화면이 새로고침 없이 갱신된다 | 병합 전 | 2026-11-20 `hmr update /src/App.tsx, /src/components/Header.tsx, /src/pages/Category.tsx, /src/pages/RecipeDetail.tsx`, 새로고침 없음, 페이지 오류 없음. 수정 전에는 `hmr update /src/favorites.ts`에서 멈췄다 — **통과** |
| M-2 | SPA 템플릿 진입점 | `src/index.tsx`를 고치면 페이지가 한 번 새로고침된다 | 병합 전 | 2026-11-20 `page reload src/index.tsx`, 앱 하나. 수정 전에는 무시됐다 — **통과** |
| M-3 | 위젯 템플릿 | `include` 우회를 뺀 상태에서 `main.ts`·CSS 수정은 새로고침, 컴포넌트 수정은 새로고침 없이 반영 | 병합 전 | 2026-11-20 컴포넌트 `hmr update /src/FeedbackWidget.tsx`(새 라벨, 새로고침 없음), CSS·`main.ts` `page reload`. 확인 후 우회는 되돌림(DC-4) — **통과** |
| M-4 | 새 프로젝트 | 발행 후 `npx create-lithent`로 만든 SPA에서 M-1·M-2가 통과한다 | 발행 후 | |

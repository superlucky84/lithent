# MANUAL TEST CHECKLIST — JSX 타입: 컴포넌트 children과 key

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 에디터 | VS Code(TS 5.8+)에서 children을 받는 컴포넌트와 리스트 key에 빨간 줄이 없고, 잘못된 props에는 빨간 줄이 있다 | 발행 후 | |
| M-2 | 새 프로젝트 | 발행 후 `npx create-lithent`로 만든 SPA에서 `Link` 우회 코드를 지워도 `npm run type-check`가 통과한다 | 발행 후 | |

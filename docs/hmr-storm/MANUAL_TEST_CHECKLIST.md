# MANUAL TEST CHECKLIST — HMR 반복 감지 E2E

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | CI 3개 브라우저 | PR CI의 Chromium·Firefox·WebKit E2E 잡에서 `hmr-storm.spec.ts` 6개가 통과하고 흔들리지 않는다 | PR | |
| M-2 | 실제 재현 조건 | 메인테이너가 겪은 반복 조건(템플릿, 파일 종류, 에디터 저장 방식)을 알게 되면 시나리오로 추가한다 | 수시 | |

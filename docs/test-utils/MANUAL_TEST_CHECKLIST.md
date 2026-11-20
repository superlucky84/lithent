# MANUAL TEST CHECKLIST — 컴포넌트 테스트 유틸 (`lithent/test`)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 새 프로젝트에서 쓰기 | create-lithent SPA 프로젝트에 packed `lithent`(이 브랜치)·Vitest·jsdom·`@testing-library/dom`을 설치하고, 문서의 예시대로 기존 컴포넌트 테스트를 써서 통과한다 | 병합 전 | 2026-11-20 처음에는 문서의 `npm install --save-dev vitest …`가 ERESOLVE(Vitest 5.1.1이 `@types/node` 22+ 요구, 템플릿은 20) → DESIGN DC-8로 템플릿 수정. 수정한 템플릿 사본에서 문서 명령 그대로 설치(vitest 5.1.1, jsdom 31.0.1), `Counters`의 `mount`·`lmount` 카운터 테스트 2개(`fireEvent`, `user-event`) 통과, `tsc --noEmit` 통과 — **통과** |
| M-2 | 전역 없는 Vitest | `globals: false`(기본)에서 문서대로 `afterEach(cleanup)`을 두면 테스트 사이에 DOM이 남지 않는다 | 병합 전 | 2026-11-20 M-1 프로젝트에서 두 번째 테스트가 버튼 1개만 본다. `globals: true`이면 `afterEach` 없이도 같고, 둘 다 없으면 두 번째 테스트가 버튼 2개로 실패(의도대로) — **통과** |
| M-3 | 문서 사이트 | Testing 페이지(영어·한국어)가 사이드바에서 열리고 예시 코드가 위 M-1과 같다 | 병합 전 | 2026-11-20 문서 빌드를 배포 구조로 띄워 사이드바 Testing › Component Tests → `#/guide/testing`, KO 전환 → `#/ko/guide/testing`, 페이지 오류 없음, 390px 가로 넘침 0. 예시(Counter, user-event)는 `test-interop.test.tsx`와 같은 코드 — **통과** |
| M-4 | 발행 뒤 | npm의 새 `lithent`로 M-1을 다시 통과한다 | 발행 후 | |

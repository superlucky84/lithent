# MANUAL TEST CHECKLIST — 공식 라우터 (`@lithent/router`)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md)
- 대상: 별도 표기가 없으면 Phase 9의 express 템플릿 사본(packed `@lithent/router`와 이 브랜치의 `lithent`), Chromium

| ID | 확인 | 통과 기준 | 시점 | 결과 |
|---|---|---|---|---|
| M-1 | 이동 중 화면 | 카테고리 loader에 1초 지연을 넣고 홈 → 카테고리를 누르면, 1초 동안 홈 화면이 그대로 있고 이동 표시기가 보인다. URL은 새 화면이 나올 때 바뀐다. 지연 중 다른 카테고리를 누르면 마지막 것만 나온다. 같은 라우트에서 params만 바꾸면(`/pasta` → `/soups`) 인스턴스가 유지되고 새 데이터가 보이며, keyed 자식으로 옮긴 상태(정렬 선택)만 초기화된다(DC-7) | 병합 전 | |
| M-2 | 뒤로·앞으로·스크롤·링크 | 레시피까지 들어간 뒤 뒤로·앞으로가 맞는 화면과 스크롤 위치(DC-18)를 보여 준다. 새 이동은 맨 위에서 시작한다. Cmd/Ctrl+클릭과 가운데 클릭은 새 탭을 연다. `NavLink`는 현재 위치에서 `aria-current="page"`를 가진다 | 병합 전 | |
| M-3 | SSR·hydration | 페이지 소스에 loader 데이터로 그린 마크업과 직렬화된 상태가 있다. 첫 로드 때 loader가 브라우저에서 다시 돌지 않는다(loader에 `console.log`). 없는 경로·없는 카테고리는 HTTP 404, loader throw는 500. 쿼리 `?q=</script><script>alert(1)</script>`의 응답 HTML에 `</script><script>alert(1)`이 없다 | 병합 전 | |
| M-4 | concurrent 코어 | 템플릿 사본에서 `lithent`를 `lithent-concurrent`로 alias한다. 행 수천 개를 그리는 라우트로 이동하는 동안 헤더 입력란에 입력한 글자가 끊기지 않고 나온다. base 코어 사본에서도 같은 최종 화면이 나온다 | 병합 전 | |
| M-5 | 개발 서버 | 라우트 컴포넌트를 고치면 HMR로 바뀐다. `routes.ts`에 라우트를 추가하면 새로고침 뒤 새 URL이 열린다. 운영 빌드에서 라우트마다 chunk가 따로 있고 처음 로드에는 매치된 라우트 chunk만 받는다(Network 탭) | 병합 전 | |
| M-6 | `flatRoutes()` | RR 문서의 flat routes 예시 파일 구조를 그대로 만든 사본에서 `routes.ts`를 `flatRoutes()`로 바꾸면 문서 표의 URL이 모두 열린다. 직접 만든 디렉토리 규칙 함수(문서 예제)를 섞어도 함께 동작한다 | 병합 전 | |
| M-7 | 문서 사이트 | 라우터 가이드(영어·한국어)가 사이드바에서 열리고, 예시 코드가 템플릿 코드와 같으며, 390px에서 가로 넘침이 없다 | 병합 전 | |
| M-8 | 발행 뒤 | `npx create-lithent`로 만든 새 express 프로젝트가 npm의 `@lithent/router`로 설치·빌드·실행되고 M-1·M-3을 다시 통과한다 | 발행 후 | |

# MANUAL_TEST_CHECKLIST — `lithent/element`

- 작성일: 2026-10-06
- 상태: **미실행. Phase 9 완료 후 수행.**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md), [IMPLEMENT.md](./IMPLEMENT.md)

## 실행 규칙

- 브라우저: Chrome 최신, Safari 최신, Firefox 최신. 각 항목에 브라우저별 결과를 적는다.
- 결과 표기: `PASS` / `FAIL` / `N/A`, 날짜, 확인한 커밋 SHA, 증거(스크린샷 경로 또는 콘솔 출력).
- FAIL이면 IMPLEMENT에 이슈를 추가하고 출하하지 않는다.
- **Chromium 자동화 현황 (Phase 9):** MT-1, MT-2, MT-3, MT-5와 MT-6의 "lithent 2벌 공존"은 `e2e/element.spec.ts`가
  Chromium에서 자동 검증한다. 수동 확인은 **Safari·Firefox**, MT-4(React 호스트), MT-5의 메모리(detached 노드),
  MT-6의 "같은 스크립트 2회 로드"에 집중한다.

## 항목

### MT-1. 빌드 없이 CDN으로 사용 (RC-6)

절차: 빈 HTML 파일에 `lithent.umd.js`, `lithentElement.umd.js` `<script>`만 넣고
인라인 스크립트로 `ftags` 또는 `h`를 써서 컴포넌트 정의 → `defineElement` → 본문에 태그 배치.
합격: 빌드 도구 없이 렌더됨. 콘솔 에러 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

### MT-2. CSS 양방향 격리 (FR-6)

절차: 호스트 페이지에 `button { background: red }`, 위젯 `styles`에 `button { background: blue }`.
호스트 버튼 1개와 위젯 1개를 나란히 둔다.
합격: 호스트 버튼은 빨강, 위젯 내부 버튼은 파랑. DevTools에서 위젯 버튼에 호스트 규칙이 적용되지 않음.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

### MT-3. 속성·프로퍼티 갱신 (FR-3, FR-4)

절차: DevTools 콘솔에서 `el.setAttribute('amount', '2000')`, `el.options = { a: 1 }`,
`el.removeAttribute('disabled')` 순으로 실행.
합격: 각 단계에서 화면이 즉시 갱신되고 내부 입력값 등 다른 상태는 유지.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

### MT-4. React 호스트 안에서 동작 (REQUIREMENTS §1.2)

절차: Vite React 앱에서 `<pay-button amount={n}>`를 렌더하고 `useEffect`로 `pay` 이벤트 구독.
React state로 `n` 변경.
합격: 위젯이 갱신되고 이벤트의 `detail`이 React 쪽에 도착. React 콘솔 경고 0건.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

### MT-5. 생명주기 — 이동·제거 (FR-2, DC-4)

절차: 위젯 내부 카운터를 3으로 올린 뒤 (a) 다른 부모로 `appendChild` 이동,
(b) 제거, (c) 다시 추가.
합격: (a) 카운터 3 유지, (b) 언마운트 로그 1회, (c) 카운터 0에서 새로 시작.
Memory 탭에서 (b) 후 detached 노드가 GC 후 남지 않음.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

### MT-6. 중복 로드와 lithent 2벌 공존 (FR-1, R-1)

절차: 같은 위젯 스크립트를 `<script>` 두 번 로드. 별도로, 페이지 자체가 다른 버전의
lithent로 렌더하는 앱을 가진 상태에서 위젯 UMD 추가.
합격: 예외 0건, 위젯 정상 동작, 호스트 앱도 정상 동작.

| Chrome | Safari | Firefox | 커밋 | 증거 |
|---|---|---|---|---|
| | | | | |

## 출하 판정

- [ ] MT-1~MT-6 전 브라우저 PASS
- [ ] REQUIREMENTS RC-1~RC-7 충족 기록이 IMPLEMENT에 있음

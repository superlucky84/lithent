# MANUAL_TEST_CHECKLIST — 공개 helper 출시 확인

현재 계약은 [DESIGN](./DESIGN.md), 자동 결과·인계는 [IMPLEMENT](./IMPLEMENT.md)를 따른다.
MT-1~5는 공개 import 자동 Chromium 32개에서 확인했다. MT-6은 빌드 페이지 네 화면 조합의 조작·hit area 검사와 스크린샷 육안 확인으로 완료했다.
로컬 타이머 모의 요청으로 실제 서버·다른 브라우저 통과를 주장하지 않는다.

## 공개 import 시연 / Chromium

- [x] MT-1: 두 코어·일반/element host에서 draft·undo·DOM identity가 hide/show 후 유지된다. 실패: 초기화 증가 또는 내용 소실.
- [x] MT-2: 느린 검색 A 다음 B와 다음 활동 세대에서 B만 결과·오류·pending에 반영된다. 실패: 오래된 응답 표시.
- [x] MT-3: 반복 hide/show의 polling·subscription이 0/1, 숨김 중 instance 저장은 한 번 완료된다. 실패: 중복 자원·저장 재실행.
- [x] MT-4: base native child renew는 계속, Concurrent freeze는 중단 후 최신 값으로 재개한다. 실패: 지원 범위 혼동·재개 누락.
- [x] MT-5: element 같은 태스크 이동은 유지, 최종 제거는 정리, 재연결은 새 인스턴스다. 실패: 제거 후 응답·DOM 부활·누수.
- [x] MT-6: 빌드한 두 시연을 데스크톱/390 px에서 조작하고 콘솔 오류·가려진 버튼·겹침이 없다.

## 제품 출시 전에 별도 확인

- [ ] MT-7: 실제 서비스의 Chromium·Firefox·Safari에서 MT-1~5를 실행한다. 통과: 같은 수명·상태 계약, 콘솔 오류 없음.
- [ ] MT-8: 실제 편집기 키보드·포커스·선택·스크린리더 상태를 확인한다. 제품 규칙대로 복원한다. 자동 복원은 없다.
- [ ] MT-9: 실제 저장 API의 순서·실패·취소·재시도를 확인한다. abort를 rollback으로 해석하지 않고 중복 저장 방지를 검증한다.
- [ ] MT-10: 영상·iframe·portal 작업을 필요한 onActive cleanup에 연결한다. 통과: 제품에서 중단하기로 한 작업이 중단된다.
- [ ] MT-11: 제품 CSP에서 코어·helper UMD 또는 ESM을 로드한다. 통과: 정책 위반 없이 공개 API 동작.
- [ ] MT-12: 실제 앱의 미사용/기존 helper/lifecycle 사용 번들을 비교한다. 통과: 미사용 lifecycle 제거·예산 내 비용·보존 수/폐기 정책.

## 이전 검증 범위

3단계 Chromium에서 두 코어·두 host의 상태/DOM, stale, 저장, 자원 수, element 이동·제거를 확인했고 base 빌드를 데스크톱·390 px에서 수동 확인했다.
7단계까지 native child freeze·adapter 회귀를 추가했다. 이번 공개 import로 재확인한다.
다른 브라우저·실제 서버·편집기 포커스·접근성·CSP는 아직 통과 표시하지 않는다.

## 사이트 문서 확인

- [x] WEB-MT-1: 영어/한국어 Home·Sidebar·관련 가이드에서 lifecycle 문서와 예제 링크를 연다. 통과: 새 경로·올바른 언어·명확한 지원 조건.
- [x] WEB-MT-2: 두 언어·light/dark·desktop/390 px에서 본문·API 표·코드·버튼을 확인한다. 통과: 본문 가로 넘침/가려진 버튼/콘솔 오류 없음.
- [x] WEB-MT-3: 실행 예제에서 draft/undo·느린 A 후 빠른 B·hide 중 저장·polling 중단/재개·제거/재생성을 확인한다. 통과: 정본 수명 계약과 일치.
- [x] WEB-MT-4: 라우트·언어를 바꾸며 예제를 제거한다. 통과: 예제 타이머 정리·늦은 응답 DOM 부활 없음·재진입은 새 인스턴스.

사이트 WEB-MT-1~4는 Chromium 자동 회귀·production preview의 8화면 조합과 스크린샷 육안 확인으로 완료했다.
공개 사이트는 아직 배포하지 않았다. 실제 배포 후 URL 확인·npm 릴리스 시 preview 안내 갱신은 다음 단계다.

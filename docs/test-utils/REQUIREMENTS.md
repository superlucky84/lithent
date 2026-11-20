# REQUIREMENTS — 컴포넌트 테스트 유틸 (`lithent/test`)

- 브랜치: `ccr-3e48bc24-eapswq` / 기준 커밋 `b961084`
- 작성일: 2026-11-20
- 상태: **main 병합(#133), `lithent` 1.26.0 릴리스 준비 완료 — 발행 대기** — [IMPLEMENT.md](./IMPLEMENT.md), [RELEASING](../../RELEASING.md) 첫 절
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 출처: [../adoption/README.md](../adoption/README.md) "테스트" 항목, [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.2
- 코드 범위: `test/` (새 workspace 패키지), 루트 `package.json` exports·files, 빌드·테스트·릴리스 검사 연결, 문서 사이트

## 1. 배경

도입 심사에서 "이걸로 만든 컴포넌트를 어떻게 테스트하나"를 묻는다. 지금 답은 "직접 짜라"다.
lithent 저장소의 테스트도 파일마다 컨테이너를 만들고, `renew()` 반영을 기다리는 `flush`를
`setTimeout` 반복으로 직접 짜고, 끝에 정리한다. 사용자가 막히는 곳은 셋이다.

1. **언제 기다리나.** 기본 코어는 `renew()`를 마이크로태스크로 모아 반영한다. concurrent 코어는 낮은 우선순위
   작업(`deferRender`)을 MessageChannel 태스크로 나눠 처리한다. 어느 쪽인지, 얼마나 기다려야 하는지 사용자가 알아야 한다.
2. **정리.** 테스트마다 마운트한 트리를 해제하고 컨테이너를 지워야 다음 테스트에 남지 않는다.
3. **요소 찾기와 이벤트.** 사용자 관점의 쿼리(`getByRole` 등)는 `@testing-library/dom`이 표준이다.
   lithent는 실제 DOM을 그리므로 그대로 쓸 수 있는데, 그 사실과 연결 방법이 안내돼 있지 않다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | `render(ui)`가 컴포넌트를 문서에 붙은 컨테이너에 그리고 `{ container, baseElement, unmount }`를 돌려준다 | 단위 테스트 |
| RQ-2 | `await act(fn)`이 `fn`(동기·비동기)을 실행하고, lithent가 그 결과를 화면에 다 반영할 때까지 기다린다. 인자 없이 부르면 기다리기만 한다 | 두 코어에서 `renew`, `mountCallback` 안의 `renew` 연쇄, `lithent/helper` store, concurrent `deferRender`(시간 분할로 여러 태스크에 걸치는 경우 포함) |
| RQ-3 | 가짜 타이머(`vi.useFakeTimers()`)를 켠 테스트에서도 `act`가 멈추지 않는다 | 단위 테스트 |
| RQ-4 | `cleanup()`이 `render`로 그린 트리를 모두 해제하고(언마운트 콜백 실행) 만든 컨테이너를 지운다. 테스트 러너의 전역 `afterEach`가 있으면 자동으로 등록된다 | 단위 테스트 (전역 있음·없음) |
| RQ-5 | `@testing-library/dom`의 `screen`·`within`·`fireEvent`와 `@testing-library/user-event`가 그대로 동작한다. 의존성으로 요구하지 않는다 | 연동 테스트, 패키지 `dependencies`·`peerDependencies` 없음 |
| RQ-6 | 두 코어 모두에서 같은 API로 동작한다. 사용자가 `lithent`를 `lithent-concurrent`로 alias하면 concurrent에 맞게 기다린다 | `test:satellites`, `test:satellites:concurrent` |
| RQ-7 | 코어 크기·API를 바꾸지 않는다 (base 예산 여유 26B) | `pnpm size`, 코어 소스 diff 없음 |
| RQ-8 | 배포 형태: `lithent/test` 하위 경로, ESM·CommonJS, `.d.ts`·`.d.cts` | `verify:release`의 설치 소비자 검사(ESM·CJS·Node16·NodeNext 타입) |
| RQ-9 | 문서 사이트에 사용법(영어·한국어)과 패키지 README | 문서 빌드, 수동 확인 |

## 3. 비목표

- 자체 쿼리(`getByRole` 등)·이벤트 함수 구현 — `@testing-library/dom`이 표준이고, 접근성 이름 계산을 다시 만들 이유가 없다 (DESIGN DC-2)
- 별도 npm 패키지(`@lithent/testing-library`) — 새 패키지는 npm 신뢰 발행 설정을 따로 해야 하고, 하위 경로로 충분하다 (DC-1)
- 컴포넌트 없이 helper·store만 시험하는 `renderHook` 류
- SSR(`renderToString`)·hydration 전용 도우미
- 템플릿(create-lithent)에 테스트 설정 넣기 — 후속 후보

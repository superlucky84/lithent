# DESIGN — 공개 lifecycle helper 계약

이 문서는 현재 계약의 정본이다. [요구사항](./REQUIREMENTS.md), [구현 계획](./IMPLEMENT.md)을 함께 적용한다.
PHASE2~7과 [API 검토안](./API_REVIEW.md)은 역사 기록이다.

## 결정 체크리스트

- [x] DC-1: 구현 정본은 helper 내부, 공개 entry는 기존 `lithent/helper`, 실험 entry는 shim. 검증: 공개 import 회귀·패키지 export.
- [x] DC-2: 두 코어를 7단계 그대로 유지한다. 새 코어 빌드는 없다. 검증: 소스 diff·6개 해시.
- [x] DC-3: freezeChildren 기본 false, 지원하는 Concurrent만 true. 검증: support·early failure·두 코어 브라우저.
- [x] DC-4: 함수 이름·인자 순서·기본값을 유지하고 명시적 핸들 타입을 제공한다. 검증: 엄격한 TS 소비자.
- [x] DC-5: lithent 의존성은 external, alias는 `/^lithent$/`만 교체한다. 검증: helper subpath·같은 코어 연결.
- [x] IC-1: 테스트·시연은 빌드한 공개 helper를 사용한다. 과거 standalone 측정 entry는 canonical lifecycle entry를 직접 빌드한다. 검증: 실험 빌드·브라우저·중복 구현 없음.
- [x] IC-2: 내부 protocol은 공개하지 않는다. ESM 미사용 컬렉션이 남으면 순수 생성 annotation을 적용한다. 검증: 이전 helper와 state 전용 번들 비교.
- [x] IC-3: cleanup·재진입·parked render 정책은 이동 중 바꾸지 않는다. 검증: owner/latest/activity/boundary 회귀.

- [x] IC-4: RetainedHostProps는 record-shaped h 인자와 호환되는 객체 타입 별칭으로 제공한다. active 타입 검증은 Host 호출에서 수행하며 기존 h의 타입 계약은 바꾸지 않는다. 검증: 엄격한 TS 소비자의 h(Host, props)·잘못된 active 거부.

## 공개 API

| 함수                                                          | 반환 / 기본값                                             | 지원                         |
| ------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| createOwnerScope()                                            | OwnerScope                                                | 두 코어                      |
| useOwnerScope(reportCleanupError?)                            | OwnerScope, reporter 기본 console.error                   | 두 코어, mounter             |
| createLatestTask(scope)                                       | LatestTask                                                | 두 코어                      |
| createActivityScope()                                         | ActivityScope, 처음 비활성                                | 두 코어                      |
| createScopedTask(scope, lifetime?)                            | LatestTask, lifetime 기본 activity                        | 두 코어                      |
| createRetainedView(host, initialize, options?)                | RetainedView, 처음 숨김, freeze 기본 false                | 두 코어, DOM 필요            |
| createRetainedHost(initialize, reportCleanupError?, options?) | 보존 host 컴포넌트 (RetainedHostProps), active 기본 false | 두 코어                      |
| useRenderBoundary(initialActive?)                             | RenderBoundary, 초기 활성 기본 true                       | 지원하는 Concurrent, mounter |
| supportsRenderBoundary()                                      | boolean                                                   | 두 코어                      |

공개 타입: Cleanup, CleanupErrorReporter, OwnerScope, Activity, ActivityScope, TaskWork<T>,
LatestTask, TaskHandlers<T>, TaskOutcome<T>, TaskLifetime, RetainedViewInitializer,
RetainedView, RetainedViewOptions, RetainedHostProps, RenderBoundary.
LatestTask.run<T>(work, handlers?)는 Promise<TaskOutcome<T>>, cancel은 void다.
RetainedView는 readonly scope와 show/hide/dispose를 제공한다. 내부 capability·scheduler는 export하지 않는다.

## 소유권·최신 작업

own은 등록마다 한 번 정리한다. 같은 함수를 두 번 등록하면 두 등록이다. 수동 release는 목록에서 먼저 제거한다.
dispose는 먼저 폐기 표시·목록 비우기를 하고 모든 cleanup을 시도한 뒤 실패를 AggregateError로 전달한다.
폐기 뒤 등록은 즉시 정리하며 실패는 호출자에게 전달한다. 컴포넌트 어댑터는 reporter로 오류를 보고한다.
reporter는 던지지 않아야 하며 비동기 cleanup 완료를 기다리지 않는다.

새 controller를 먼저 게시한 뒤 이전 실행을 abort한다. observer 전에 현재 실행·owner 폐기를 확인한다.
abort/pending observer 재진입으로 생긴 새 실행을 이전 finally가 덮지 않는다.
현재 work 실패는 error outcome·observer에 전달하고 observer 실패는 run Promise를 reject한다.
취소·폐기된 실행은 stale이며 cancel은 pending=false를 발행하지 않는다. 독립 작업에는 별도 그룹을 만든다.
work 내부 상태 쓰기·서버 저장·취소를 무시하는 Promise 자체를 되돌리거나 강제 종료하지 않는다.

## 활동·보존·SSR

ActivityScope는 처음 비활성이며 각 활성화에 새 Activity/AbortSignal을 만든다.
instance own은 최종 폐기까지, onActive 자원은 활성 세대까지 유지한다.
deactivate는 먼저 활동을 해제하고 abort·cleanup한다. 재진입 activation은 이전 정리 뒤 시작한다.
활동 작업은 새 세대마다 새 그룹이며 비활성 run은 work를 실행하지 않고 stale을 반환한다.
instance 작업은 숨김 중 계속되지만 다음 instance 실행은 이전 작업을 대체한다.

view는 숨긴 독립 루트를 만든다. 제공한 renew는 숨김 중 dirty를 모으고 활성 시 microtask로 갱신한다.
host의 committed 외부 컴포넌트가 독립 루트를 소유한다. nested render는 mount queue 뒤 microtask에서 시작하며 제거 여부를 재확인한다.
show는 활동·DOM 표시·최신 모델 갱신·boundary 재개, hide는 boundary pause·활동 정리·DOM 숨김을 연결한다.
최종 dispose는 실패가 있어도 자원·독립 렌더·컨테이너를 정리한다. 숨김은 폐기가 아니다.
같은 태스크의 element 이동은 유지하며 실제 제거 후 재연결은 새 인스턴스다.

scope 생성·import·SSR 자체는 외부 작업을 시작하지 않는다. 외부 작업은 committed mountCallback 또는 이벤트에서 시작한다.
SSR host는 shell만 렌더한다. view 생성은 DOM이 필요하다. mounter에서 사용자가 직접 외부 작업을 시작하는 코드는 자동 차단하지 않는다.

## Concurrent 경계

freeze=false는 관리된 renew만 모으며 native child renew는 계속될 수 있다.
freeze=true는 미지원 코어에서 initialize·DOM 삽입 전에 실패한다.
boundary는 mounter당 한 개, 첫 구성은 비활성이어도 허용, 등록은 mount commit 이후다.
pause는 렌더 함수 밖에서 호출한다. 자체적으로 DOM을 숨기거나 요청을 취소하지 않는다.
차단한 갱신은 dirty로 기록하고 resume에 최신 모델을 반영한다.

안쪽·바깥쪽 경계 모두를 검사하며 안정된 component key로 소속을 캐시한다. 재부모화 때 캐시를 비운다.
중단 경계가 없으면 blocks/reparent callback을 제거한다. 활성 경계가 남으면 adapter 예약을 유지해 다른 사본과의 충돌을 막는다.
마지막 경계 폐기는 예약도 해제한다. 서로 다른 adapter 사본을 하나의 코어에 혼합하지 않는다.
관련 없는 parked render는 low lane에 남긴다. 관련 순수 작업은 버리고 이미 effect·초기화를 실행한 관련 작업은 활성 상태에서 동기 완료 후 pause한다.
pause가 한 프레임 이내라는 보장은 없다. 6·7단계 정책을 유지한다.

## 비용과 제품 적용

코어 크기·런타임은 이번 이동으로 변하지 않는다. 전체 helper UMD는 새 API를 포함해 늘어난다.
ESM 미사용·state 전용 앱은 이전 helper와 비교하고 전체 UMD와 최종 번들 비용을 따로 기록한다.
기존 성능은 [PERFORMANCE_FINAL](./PERFORMANCE_FINAL.md)의 조건·한계가 적용된다.
포커스·접근성·portal·영상·iframe·실제 서버·다른 브라우저는 [출시 체크리스트](./MANUAL_TEST_CHECKLIST.md)에 남긴다.

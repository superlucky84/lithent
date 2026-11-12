# TODO — lifecycle helper 사용성 재검토

- 작성일: 2026-11-12
- 기준: `lithent` 1.25.9, `helper/src/lifecycle/`
- 상태: **검토 대기.** 공개 가이드(`/ko/guide/lifecycle`)를 읽고 사용법을 논의하면서 헷갈렸던 지점을 모은 목록이다. 결정된 것은 없다.
- 관련: [계약](./DESIGN.md), [API 검토안](./API_REVIEW.md), [아이디어](../ideas/CLOSURE_LIFECYCLE.md)

## 1. 가이드만 읽어서는 왜 필요한지 알 수 없다

헷갈린 점: 가이드가 계약(기본값, 취소 시점, 예외 처리)을 압축해서 나열한다. 어떤 문제를 푸는 도구인지, 언제 무엇을 골라야 하는지가 드러나지 않는다.

현재: 동기가 되는 문제는 [아이디어 문서 §2](../ideas/CLOSURE_LIFECYCLE.md)에만 있다.

- 늦게 도착한 응답이 최신 결과를 덮는다.
- 나중에 생긴 구독·타이머를 `mountCallback` 반환 함수로 정리하기 어렵다.
- 탭이나 편집기를 숨길 때 "언마운트(상태 손실)"와 "CSS 숨김(polling 계속)" 둘 중 하나만 고를 수 있다.

검토할 것:

- 가이드 앞부분에 문제 → 해결 흐름을 넣을지.
- 수명 세 종류(인스턴스 / 활동 / 최신 작업)를 먼저 설명하고 API를 그 아래에 배치할지.
- "일반 컴포넌트 → 보존 화면 → Concurrent freeze" 순서로 단계를 나누고, 상황별 선택표를 둘지.

## 2. `createScopedTask`는 만들기만 해서는 아무 일도 하지 않는다

헷갈린 점: `const poll = createScopedTask(scope)`처럼 이름을 붙이면 polling 같은 동작이 시작되는 것처럼 보인다. 실제로는 취소 규칙만 정한 빈 실행 창구이고, 할 일은 나중에 `run(work)`에 넘긴다.

현재:

- 가이드에 `createScopedTask(...).run(...)` 예제가 없다. 보존 화면 예제는 `onActive` + `setInterval`만 보여 준다.
- 창구를 작업마다 나눠야 하는 이유도 설명하지 않는다. 같은 창구에서 새로 `run`하면 이전 실행이 abort된다. 그래서 검색과 저장이 한 창구를 쓰면 검색하는 순간 저장이 취소된다.

검토할 것:

- 이름이 "작업"이 아니라 "실행 창구 / 작업 그룹"으로 읽히게 바꿀지 (`createTaskLane`, `createLatestRunner` 등).
- 가이드에 activity와 instance를 한 화면에서 비교하는 run 예제를 넣을지 (검색은 숨기면 취소, 저장은 숨겨도 완료).

## 3. `createLatestTask`와 `createScopedTask`의 관계

헷갈린 점: 이름이 다른 두 함수가 모두 "task"를 만든다. 차이가 무엇인지, 어느 것을 써야 하는지 알기 어렵다.

현재:

- 두 함수 모두 `LatestTask`(`run` / `cancel`)를 반환한다. 차이는 붙는 scope와 취소 시점뿐이다.
- 같은 결과를 내는 방법이 세 가지다. `createLatestTask(owner)`, `createLatestTask(activityScope)`, `createScopedTask(scope, 'instance')`. 세 번째는 내부에서 두 번째를 그대로 반환한다 (`helper/src/lifecycle/scopedTask.ts:12`).
- `createScopedTask`가 따로 필요한 이유는 activity 모드뿐이다. activity 모드는 활성화마다 새 작업 그룹을 만들고, 숨길 때 버린다.

검토할 것:

- `createLatestTask(scope, { lifetime: 'activity' | 'instance' })` 하나로 합칠지.
- 합친다면 `createScopedTask`는 deprecated alias로 남길지, 몇 버전 뒤에 제거할지 (1.25.x로 이미 공개됨).
- 합치지 않는다면 "일반 컴포넌트는 `createLatestTask(owner)`, 보존 화면 안은 `createScopedTask(scope)`" 규칙을 가이드에 명시할지.

## 4. `createRetainedHost`는 `active` 외의 props를 받지 못한다

헷갈린 점: `mount(renew, props)`에 익숙하면 `initialize`의 두 번째 인자를 props로 기대한다. 실제 두 번째 인자는 `ActivityScope`다.

현재 (`helper/src/lifecycle/host.ts`):

- host는 `props.active`만 읽는다. 그 뒤 빈 `<div>`를 렌더하고, 그 안에 독립 루트를 한 번만 만든다.
- 부모가 다시 렌더해도 안쪽 화면에는 show/hide만 전달된다. 다른 값은 클로저(팩토리 / 부모 mounter 안에서 host 생성)나 공유 store로만 넘길 수 있다.
- 가이드에 이 제약과 우회 방법이 없다.

검토할 것:

- `initialize(renew, scope, getProps)`처럼 최신 props를 읽는 함수를 넘기고, props가 바뀌면 안쪽을 `renew`할지.
- props가 바뀌었는데 화면이 숨겨져 있으면 어떻게 할지. 지금의 managed renew처럼 모아 두었다가 다시 보일 때 반영하는 규칙과 맞추는 방안.
- 확장하지 않는다면 "편집기가 상태를 소유하고 바깥은 켜고 끄기만 한다"는 전제와 클로저 / store 패턴을 가이드에 명시할지.

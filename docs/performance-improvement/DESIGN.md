# DESIGN — 변경 범위의 근거를 보존하는 코어 최적화

- 기준일: 2026-10-22. 상태: **Phase 3 C3 base 한정 구현·검증 완료. 기본 채택 보류·baseline 복원**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 과거 Map/LIS 설계는 [역사 문서](./history/2026-07-map-lis/DESIGN.md)다. 현재 코어에 이미 있는 Map/LIS를 새 최적화로 제안하지 않는다.

## 1. 실제 경로와 정보의 한계

원래 앱의 선택·부분 갱신은 Table의 `renew` → `rows.map(row.view)` → `cacheUpdate` 의존 배열 검사 → `diffLoopChildren`의 이전 key Map/전체 매칭/미사용 삭제 검사 → `updateChildren`의 목록 처리로 흐른다. 캐시 적중이 하위 재귀를 줄여도 행별 입구와 목록 처리가 남는다.

행별 `renew`는 Table 전체 재실행을 피하지만 [replaceWDom](../../src/wDom.ts)의 부모 `children.indexOf(originalWDom)`와 `syncAncestorComponentChildren`의 조상 slot 배열 `indexOf`를 수행한다. 따라서 현재 행 선택을 엄밀한 O(1)로 설명할 수 없다. 행 컴포넌트 수만큼 wrapper·hook 상태·갱신 함수·수명 정리도 생긴다.

코어가 새 children 배열을 받는 일반 경로에서 변경 범위는 알려져 있지 않다. 동일 길이·같은 props 참조·같은 VDOM 객체만으로 전체 처리를 안전하게 생략할 수 없다. 기존 empty 전환, 다른 위치 재사용, mutable props, slots, update callback과 자식 자체 갱신 계약을 먼저 적용해야 한다.

## 2. 후보 묶음과 우선순위

Phase 1에서 선택했던 C1과 후속 C3 base 한정 프로토타입은 검증 후 기본 채택을 보류했다. **현재는 C3의 기능 격리/고정 비용 절감을 검토할 단계**다. C2는 미구현 보류, C4는 조건부 연구다. 네 후보를 모두 구현하는 계획이 아니며, 한 번에 하나씩 기준선과 비교한다.

| 후보                                               | 줄이려는 작업                                                    | 필요한 정보                                                  | 한계와 진입 조건                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **C1. 컴포넌트의 부모 위치 연결 개선**             | 자체 renew마다 부모/조상 배열에서 이전 노드를 찾는 비용          | 현재 live component, 소유 부모, 검증 가능한 위치             | 원래 Table-only 앱의 주요 비용을 해결하지 않음. 행별/일반 자식 갱신에서 검색 작업량이 확인될 때 구현             |
| **C2. 순서 유지 keyed 목록의 대조·배치 경로**      | Map get/delete, used 배열/삭제 filter, 불필요한 위치 계획의 중복 | 같은 구성·순서이며 기존 key 소비 규칙과 같은 매칭이라는 증명 | 진입 검사 자체는 O(n). 1,000행 방문 제거라고 주장하지 않음. 기존 ordered 할당 실험과 달라지는 작업을 먼저 수치화 |
| **C3. 명시적 컴포넌트 부모 갱신 생략 계약**        | 부모 구조 갱신 때 이미 유지되는 자식 updater 재실행              | incoming props로 평가한 선언 의존성/스냅샷과 현재 인스턴스   | base의 새 setup hook으로 한정 설계. nonempty slots는 fallback. 행 컴포넌트 생성·메모리 비용이 남음               |
| **C4. 구조 변경과 항목 변경을 분리하는 목록 계약** | 리스트가 불변일 때 전체 key 대조·변경 행 탐색                    | 모든 구조 변경을 포착하는 소유권과 명시적 변경 항목          | 가장 큰 구조 변경. 임의 mutable 배열에 자동 적용 불가. C1~C3의 한계와 일반 사용 사례가 입증된 경우에만 구체화    |

[Phase 1 보고서](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)의 분기 근거:

- C1: targeted의 n=10,000·k=1,000 자체 갱신에서 부모 검색 방문 추정 4,996,000회, 일반 nested 예제에서 부모 4,996,000회·slot 4,997,000회였다. nested 말미 한 항목 갱신은 diff 5회에 부모 n·slot n+1회다. 첫 위치 위주의 선택만으로 일반 갱신을 O(1)이라 설명할 수 없다. 일반 예제에서 같은 검색 경로를 확인했으므로 한정 프로토타입의 근거가 있다. 이는 검색 시간 비중이나 공식 속도 이득의 증명이 아니다.
- C2: 원래 same-order 목록의 Map set/get/delete·미사용 검사·위치 계획·콘텐츠 방문은 각각 n회이며, 별도 uniqueness shadow 검사도 n쌍 방문·2n key 읽기·Set has/add 각 n회다. 제거 가능한 중복 작업은 있지만 진입 검사 후에도 O(n)이 남는다. 실제 대체 구현의 시간 비용을 재지 않았으므로 시간상 기각하지 않고 우선 보류한다.
- C3: targeted의 변경 없는 parent-refresh에서 n=1,000/10,000에 updater 1,001/10,001회였다. 부모 기인 재실행 생략의 필요 근거로 보존하며, C1의 효과와 섞지 않고 DC-4에서 별도 계약을 연구한다.

### C1 — 검증 가능한 부모 위치

대상은 `src/wDom.ts`의 `replaceWDom`/조상 동기화, 부모 연결을 만드는 `src/diff.ts`·`src/wDom.ts`, 대응 `lithentConcurrent/src/wDom.ts`다.

- 소유 부모와 위치를 컴포넌트 메타데이터 또는 별도 연결에 저장하는 안을 비교한다. 모든 WDom에 무조건 필드를 추가하는 안과 컴포넌트에만 추가하는 안의 생성·메모리·번들 비용을 먼저 산정한다.
- Phase 1 이후에는 **컴포넌트 소유의 위치 hint**를 우선 검토한다. 부모 children과 각 조상 compChild의 현재 배열 참조·index를 독립적으로 검증하는 모델이다. 정확한 저장 위치와 field/sidecar 선택, 최초 생성·구조 변경 때 유지 비용, concurrent publication은 DC-6을 닫기 전에 산정한다. 모든 WDom의 고정 비용을 먼저 늘리거나 전체 목록 hint 재작성 비용을 감추지 않는다.
- 위치는 반드시 `parent.children[index] === originalWDom`으로 확인한다. 맞지 않으면 기존 검색으로 돌아가고 위치를 갱신한다. 키만으로 위치를 인정하지 않는다. 삭제·교환·prepend·reparent 후 낡은 위치가 다른 노드를 덮어쓰면 안 된다.
- 조상 `compChild`는 부모 `children`과 별도 배열이다. 하나의 인덱스로 둘을 대체하지 않는다. 각 참조 안정성과 슬롯 전달을 보존한다.
- concurrent에서는 미완료 work-in-progress가 현재 연결을 바꾸지 않는다. 연결 publication 시점은 commit 또는 기존 안전한 동기화 지점이어야 한다. 폐기 작업은 새 연결을 남기지 않는다.
- **가설:** 갱신 위치가 안정적인 컴포넌트 목록에서 반복 검색을 줄일 수 있다. 조상 탐색·배열 이동·인덱스 유지 비용이 남으므로 전체 갱신 O(1)은 약속하지 않는다.

#### Phase 2 첫 후보 — base의 부모 children 검색만

DC-6에서 확정해 구현·검증한 한정 후보는 다음과 같다. [실측](../benchmark/PARENT_POSITION_RESULTS.md) 후 기본 코어 채택은 보류했고 후보는 별도 패치·증거에 보존했다.

- 저장: base `wDom.ts`의 module sidecar `WeakMap<CompKey, WeakMap<WDom[], number>>`를 사용한다. 외부 key는 현재 컴포넌트의 `originalWDom.compKey`, 내부 key는 실제 부모 children 배열이다. 컴포넌트가 비root 자체 갱신에서 위치를 조회할 때 lazy 생성하고 성공 위치만 기록한다. 모든 WDom/ComponentInfo의 필드·public API·컴포넌트당 최초 생성 closure를 늘리지 않는다.
- 조회: index 0과 미저장을 구분하며 현재 배열의 `array[index] === originalWDom`을 확인한다. 실패 시 기존 native `indexOf`로 돌아간 뒤 성공 위치를 저장한다. 음수 검색 결과를 다음 갱신을 생략하는 negative cache로 쓰지 않는다. compKey가 없는 직접 `replaceWDom` 호출은 기존 검색을 사용한다. 기존 `splice`와 `il` 조기 반환·예약 시점·callback·예외 동작을 유지한다.
- 정합성 경계: hint hit의 충분조건은 정규화된 parent.children에서 live 인스턴스가 분리·단일 소비된다는 전제다. cached/중복 same-WDom의 다중 위치 재사용·hydration·직접 `replaceWDom`의 baseline 대조를 먼저 검증한다. identity가 같은 뒤 위치를 찾았다는 사실만으로 첫 등장 의미가 증명되지 않는 배열은 최적화 대상으로 확대하지 않는다.
- slot: `compChild`는 raw 설명·공유 배열을 in-place splice하며 같은 WDom alias가 있을 수 있다. cached 뒤 위치도 identity가 같으면서 앞에 같은 참조가 추가되면 native `indexOf`의 첫 등장 결과와 달라질 수 있으므로 **이번 후보는 조상 slot의 기존 검색을 유지한다**. 부모/slot에 같은 helper를 무조건 적용하지 않는다.
- 수명·유지: 두 WeakMap의 key가 컴포넌트와 배열을 강하게 보유하지 않으며 값은 숫자뿐이다. 배열→index의 강한 Map이나 컴포넌트→단일 강한 array/index 레코드는 이전 부모 배열·형제 subtree를 잡을 수 있어 이번에는 사용하지 않는다. 구조 diff마다 전체 hint를 재작성하지 않고 현재 배열·노드 검증으로 stale을 처리한다. GC 진단은 반복 부모 갱신·이동·삭제·dispose 이후의 이전 배열/VDOM 회수를 확인한다.
- concurrent: 이번에는 수정하지 않는다. concurrent는 `addComponentProps`에서 redraw/live 노드를 commit effects로 publish하고 매번 closure를 새로 연결하므로 base의 bind-once closure나 검색 시 cache 갱신을 그대로 이식할 수 없다. 별도 후보를 만들 때 live 소유와 commit/abandon 시 cache publication을 결정한다. 공통 타입/helper·계약 검증은 이번에도 양쪽에 수행한다.
- 비용: 최상위 WeakMap, 첫 실제 자체 갱신의 내부 WeakMap, 매 검색의 get/set·identity 검사와 warm hit·cold/stale fallback을 분리한다. original/Table의 한 요소 검색에는 추가 비용만 생길 수 있으며, nested 입력의 slot 검색과 render 앵커 검색은 남는다. 전체 시간·생성/삭제·메모리·raw/gzip/br를 함께 기록하고 4,800B를 넘으면 미채택 실험으로 보존한다.

검증: M-3·M-4·M-6, `core-parentChildSync`, `core-mixedComponentUpdate`, `core-composedRenew`, `core-removedRedraw`, `core-cachedIdentity` 및 concurrent 폐기/commit 동등성 테스트. 별도의 비벤치마크 예제로 nested slots 안의 여러 입력 필드를 갱신한다.

### C2 — 순서 유지의 증명과 fallback

대상은 `src/diff.ts:diffLoopChildren`, `src/render.ts:updateChildren`, 대응 concurrent diff/render다. 배열 할당 시점만 미루던 ordered 후보와 달리 **대조 결과를 다음 단계가 재검사하지 않도록 전달할 수 있는지** 검토한다.

1. fast path 판정이 실패해도 아직 lifecycle·DOM·원본 메타데이터를 변경하지 않은 상태여야 한다. 안전한 사전 검사 후 기존 일반 경로로 fallback한다.
2. 길이와 위치별 키 동일성만으로는 중복 키의 첫 등장 소비를 보장하지 못한다. unique keyed 전용 진입을 선택한다면 uniqueness를 어떻게 증명할지 명시한다. 매번 Set으로 검사하는 비용과 이전 commit에서 유지한 정보의 검증/무효화 비용을 비교한다.
3. 비교는 현재 Map의 SameValueZero 의미(NaN 포함), falsy·Symbol·object 키를 유지한다. unkeyed/null/중복/키 변경 또는 증명할 수 없는 재사용은 일반 경로로 보낸다. 관측 가능한 키 접근을 추가하는 경우도 기존 동작과 대조한다.
4. same key여도 tag/type·empty·component resolver가 바뀌면 기존 diff와 생명주기를 수행한다. 같은 행 위치가 하위 DOM 불변을 뜻하지 않는다.
5. 위치 메타데이터 생략 여부는 render의 Fragment/portal/신규·교체 앵커 계약까지 증명한 뒤 정한다. 콘텐츠는 기존 좌→우 순서로 처리한다. 구조가 바뀌면 현행 LIS/배치 경로를 사용한다.

**가설:** 목록 전체의 O(n) 검사는 남지만 중복 처리·할당을 줄일 수 있다. Set/버전 관리가 더 비쌀 수도 있다. 진입 검증과 실패 경로를 포함한 카운터·공식 전체 시간이 개선되어야 의미가 있다.

검증: M-3·M-5, `core-keyedConsumption`, `core-loopMoveOrder`, `core-loopLifecycleOrder`, `core-structuralRegressions`, `core-renderFuzz`, cache identity. 같은 순서의 중복 키와 첫 위치만 바뀐 목록을 별도 회귀 사례로 추가한다.

### C3 — 부모 갱신과 자식 자체 갱신의 분리

retained-row 앱은 `getComponentSubInfo(key, 'vd')`로 live VDOM을 읽는다. 기존 `cacheUpdate`는 컴포넌트의 callback·updater 진입 뒤에 실행되고, 자체 갱신과 부모 갱신을 구분하지 못한다. helper에서 설명 VDOM을 보관하는 방식도 자체 갱신 뒤의 live wrapper를 대신할 수 없다. 따라서 첫 후보는 **부모 resolver를 처리하는 코어 경계의 새 명시적 옵트인**으로 정한다. 전역 identity 조기 반환이나 기본 props memo는 추가하지 않는다.

#### DC-4의 한정 API와 의존성

실험 후보의 API는 base `src/hook/useParentMemo.ts`에서 base root export로 제공한 `useParentMemo<P extends object = Props>(dependencies: (nextProps: Readonly<P>) => readonly unknown[]): void`다. setup 중 인스턴스당 한 번 호출하고 setup 밖 호출·중복 등록은 명시적 오류로 처리한다. **구현·검증 후 후보 패치에 보존했고 현재 기본 패키지에는 없다.**

```tsx
type FieldProps = {
  field: { label: string; version: number };
  disabled: boolean;
};
const Field = mount<FieldProps>((renew, props) => {
  useParentMemo<FieldProps>(next => [
    next.field.label,
    next.field.version,
    next.disabled,
  ]);
  let draft = '';
  return () => (
    <input
      aria-label={props.field.label}
      disabled={props.disabled}
      value={draft}
      onInput={(event: Event) => {
        draft = (event.target as HTMLInputElement).value;
        renew();
      }}
    />
  );
});
```

- selector는 **아직 동기화하지 않은 incoming props**를 인자로 받는다. setup에서 캡처한 `props`를 대신 읽어 old/new를 판정하지 않는다. 외부 상태를 읽는다면 그 값/버전도 반환한다. selector는 동기·순수 함수이며 hooks·DOM 쓰기·`renew`를 호출하지 않는다. updater 실행 도중 선언 의존성을 변경하는 사용은 지원하지 않는다.
- 코어는 반환 배열을 복사한다. 길이와 각 항목의 `Object.is`로 비교한다. 배열을 재사용해 in-place 수정해도 이전 스냅샷은 보존한다. `NaN`은 같고 `-0/+0`은 다르다. 이는 새 API의 규칙이며 기존 helper의 `===` 비교는 바꾸지 않는다.
- 부모 hit 판정은 props 동기화 이전에 수행한다. props의 enumerable own string key 집합이 추가/삭제되면 반드시 miss다. 값 변경은 선언 의존성으로 판정하므로 callback prop/이벤트 핸들러도 출력 의존성에 포함해야 한다. 누락한 값의 변경은 감지하지 못한다. mutable 중첩 객체는 필요한 scalar 값 또는 변경 토큰을 반환한다.
- 첫 후보의 생략 대상 props는 일반 객체의 own string data property다. accessor·enumerable symbol·특수 prototype·동기화할 수 없는 frozen/sealed props는 memo 검사를 생략하고 기존 경로로 보낸다. 이는 기존 경로가 해당 입력을 모두 지원한다는 보장이 아니다. accessor를 새로 읽는 부작용이나 기존 symbol 동기화 의미를 몰래 추가하지 않는다.
- old/new `compChild` 중 하나라도 nonempty이면 항상 miss다. 같은 배열/같은 VDOM도 slots의 내부 변경을 증명하지 못한다. empty→nonempty, nonempty→empty도 miss다. nonempty slots 지원은 deep VDOM 스냅샷을 추가하는 대신 별도 소유권 계약이 필요할 때 재검토한다.

#### 갱신 경계와 callback

| 경로                            | 후보가 수행할 일                                                                             | 보존할 관찰                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 초기 생성/ctor·key 불일치       | 기존 인스턴스 생성·삭제. 성공한 최초 출력 뒤에만 스냅샷을 유효화                             | 독립 mount/unmount·다른 위치의 같은 설명은 별도 인스턴스                                                      |
| 부모 hit                        | props를 기존 객체에 동기화한 뒤 **현재 live wrapper**를 반환. wrapper를 retire/교체하지 않음 | 해당 자식의 updater·`updateCallback` 본문/반환 callback·하위 diff 모두 생략. 부모 keyed 매칭·이동은 계속 수행 |
| 부모 miss/미등록                | 기존 props/slot 동기화 → pre update callback → updater → 하위 diff/DOM → post callback       | 기존 실행 순서. 실패 시 성공 스냅샷으로 게시하지 않음                                                         |
| 자체 `renew`/공개 `replaceWDom` | 명시적인 self 경로로 memo hit 판정을 우회                                                    | props 참조 동일성을 self 신호로 사용하지 않음. 실제 실행한 출력의 스냅샷은 성공 후 갱신                       |
| unmount/삭제된 노드의 예약 갱신 | 기존 삭제·큐 규칙 + memo/pending 상태 정리                                                   | 부활 없음. 폐기한 wrapper/리스너를 memo가 보유하지 않음                                                       |

부모의 hit 판정은 `src/diff.ts:runUpdate`의 props 동기화 앞, 자체 갱신 구분은 `src/wDom.ts:replaceWDom`의 루트 경계에 둔다. 재귀 자식은 부모 경로다. 같은 props 참조 여부, 전역 dirty flag, 앱이 읽어 온 VDOM을 신뢰 신호로 쓰지 않는다. hit여도 `makeNewWDomTree`의 keyed 소비·배치 처리를 유지하며 parent pointer는 새 부모에 연결한다.

기준선의 배칭은 코어별로 다르다. [기존 update-path 회귀](../../src/tests/core-updatePaths.test.tsx)는 parent→child 예약에서 base가 retired wrapper의 자식 작업을 생략하고 concurrent는 최신 live 노드에서 한 번 더 실행함을 이미 명시한다. 새 [기준 회귀](../../src/tests/core-parentUpdateContract.test.tsx)에서 callback/DOM 관찰까지 고정했다. 초기 mount를 제외한 실행 수는 다음과 같고, C3 열은 후보 전용 회귀에서 확인한 결과다.

| 같은 task의 예약  | baseline base | baseline concurrent | C3 base hit |                            C3 base miss |
| ----------------- | ------------: | ------------------: | ----------: | --------------------------------------: |
| parent만          |             1 |                   1 |           0 |                                       1 |
| parent→child      |             1 |                   2 |    1 (자체) | 1 (부모가 실행, 기존 retired 작업 생략) |
| child→parent      |             2 |                   2 |    1 (자체) |                                       2 |
| parent 삭제→child |             0 |                   0 |  N/A (삭제) |                                       0 |

miss 때 기존 배칭을 재설계하지 않는다. hit는 자체 요청을 소비하지 않으므로 parent→child에서도 예약된 wrapper가 live로 남아 자체 갱신이 실행되어야 한다. child→parent에서는 먼저 만든 자식 출력을 hit가 보존해야 한다. `updateCallback` 본문은 updater 전, 반환 함수는 해당 DOM 갱신 후다. 부모/자식의 pre는 부모→자식, post는 자식→부모이며, 해당 자식을 생략한 경우 그 자식의 두 단계만 없다. callback에서 같은 인스턴스의 `renew`를 다시 예약하는 기존 재진입도 보존한다.

#### 상태 소유·실패·지원 범위

- memo 상태는 opt-in한 **현재 ComponentInfo**를 weak key로 하는 sidecar에 둔다. 전 컴포넌트/WDom의 고정 필드를 늘리지 않는다. 스냅샷은 deps·props key 정보뿐이며 별도 subtree/live VDOM을 보관하지 않는다. key가 외부에 남아도 component entry 제거 뒤 sidecar가 subtree를 붙잡지 않아야 한다.
- 상태 전이는 미게시 → 유효, 유효 → hit 또는 갱신 중 → 성공 시 유효/실패 시 미게시, unmount → 제거다. 성공 스냅샷은 해당 출력의 DOM·post callback 처리가 끝난 뒤 게시한다. 초기 `h()`의 eager 생성만으로 유효해지지 않는다. pre callback/selector/updater/하위 diff/DOM/post callback 중 throw가 나면 pending을 폐기하고 다음 부모 갱신은 miss다. 기존 base 전체 트리를 transaction rollback하는 기능은 추가하지 않는다.
- selector는 hit 판정 때 읽고, 실제 updater 실행 때 pre callback 뒤의 입력으로 pending 스냅샷을 만든다. 이후 성공 경계에서만 게시한다. 같은 task에 재진입한 갱신은 실행 세대와 현재 인스턴스가 맞는 pending만 게시해 이전 실행이 새 스냅샷을 덮지 못하게 한다. unmount/초기화 실패에서도 pending·등록을 제거한다.
- **첫 후보는 base만 지원한다.** concurrent root는 hook을 export하지 않으며 alias한 consumer의 새 API import/type 검사가 명시적으로 실패해야 한다. helper 공통 export로 우회하지 않는다. concurrent 지원은 별도 **DC-11**에서 pending을 work-in-progress에 소유시키고 commit에서 게시, abandon에서 폐기하는 계약을 구현하기 전에는 추가하지 않는다. 기존 concurrent 경로·boundary 동작은 그대로 회귀한다.
- lookup·selector·배열 복사·key shape 검사·실패 정리의 비용은 별도 기록한다. 비사용자도 parent 경계의 분기 비용이 생길 수 있으므로 원래 앱의 core-only 대조와 같은 행 구조의 opt-in 대조가 모두 필요하다. 전체 keyed O(n), 컴포넌트 생성/메모리, C1의 부모 검색은 남는다. 크기 게이트를 넘으면 후보를 미채택 증거로 보존한다.

구현 경계(2026-10-22 착수): base에만 setup scope와 memo work scope를 둔다. `createComponentResolver`는 setup 등록 범위를 제한하고 초기화 실패를 정리한다. `replaceWDom`과 `render`는 하위 diff/DOM/mount/post를 포함한 작업의 성공/실패를 한 번에 memo 상태에 알린다. pending은 출력 노드를 weak key로 연결하며, DOM renderer에서 실제로 방문한 출력만 최외곽 성공 경계에서 게시한다. 중첩 작업은 상위 scope로 합치고 실행 세대·현재 ComponentInfo/live wrapper를 검증한다. eager `h()`만 끝난 출력은 아직 유효하지 않다. 이는 memo 상태의 성공 경계이며 기존 DOM/props 전체의 transaction rollback은 아니다. 공통 hook/ComponentInfo와 concurrent 런타임은 수정하지 않는다. unmount 정리는 등록 시 첫 cleanup으로 넣어 사용자 cleanup이 throw해도 먼저 해제되게 한다.

구현 결과: [C3 보고서](../benchmark/PARENT_MEMO_RESULTS.md)의 전용 **33회귀**·기존 dual **1,070 passed/3 skipped**·실제 패키지 타입/exports·B3를 통과했다. 동일 입력 UI의 3조건×3context에서 부모 refresh 자식 updater 1,000→0회, 한 props 변경 1,000→1회를 확인했다. key 1,000개 유지 후 dispose/GC에서 등록·관찰한 VDOM/host 잔류 0개였다. 공식 시간은 측정하지 않았다. 후보 br **5,691B**는 한도 +891B여서 기본 채택을 보류하고 runtime을 복원했다. 비사용자의 setup/work/DOM 경계 비용도 미측정이며 다음 결정은 DC-12다.

오류 검증의 한계: memo 스냅샷 무효화와 base의 전체 실패 복구는 별개다. 실패한 부모 diff는 live pointer를, updater throw는 hook cursor/대기 callback을 자동 롤백하지 않는 기존 동작을 확인했다. 기준 동작을 보존하며 parent selector 오류 뒤의 명시적 재시도에는 이전 unretired tree를 사용했다. 이를 자동 재시도/전체 rollback 지원으로 설명하지 않는다.

기존 [createRetainedView](../../helper/src/lifecycle/retainedView.ts)는 독립 host의 show/hide/dispose, [useRenderBoundary](../../helper/src/lifecycle/renderBoundary.ts)는 concurrent 자식 갱신 pause/resume를 제공한다. 둘은 행의 부모 재실행 memo와 목적이 다르다. 이름을 재사용하거나 숨김/freeze 의미를 암묵적으로 바꾸지 않는다. 수명 정리·capability 연결의 검증 사례는 참고하되 그대로 대체 API로 채택하지 않는다.

검증: **C3-T1** setup/타입/미지원 import, **T2** mutable deps·길이·NaN/−0·props key 변화, **T3** slot/특수 props fallback, **T4** 위 배칭 표·두 단계 callback·재진입, **T5** keyed 이동/독립 수명·삭제/실패·회수, **T6** 일반 입력 UI와 같은 행 구조의 대조·후보 helper 해시, **T7** 비사용자 core-only·번들 비용. 각 항목은 IMPLEMENT Phase 3과 M-4·M-6·M-8·M-9에 연결한다. concurrent 새 기능 검증은 DC-11에서 열며 기존 boundary 회귀는 계속 수행한다.

2026-10-22 기준 검증: 새 `core-parentUpdateContract` **10개씩**이 두 코어에서 통과했다. parent→child의 base 1회/concurrent 2회, child→parent의 양쪽 2회, 변경 없는 부모 갱신·props 변경·post callback 재예약·삭제·자체 출력 보존을 DOM identity와 함께 확인했다. 전체 `pnpm test:dual`은 **1,070 passed·3 skipped**(13개 suite 집계, base runner 409/concurrent runner 312 포함), `pnpm exec tsc --noEmit`도 통과했다. 이 수치는 **baseline 회귀 결과**이고 C3-T1~T7이나 성능 개선 결과가 아니다.

### C4 — 목록의 변경 정보가 필요한 경우

부모가 재생성한 불투명 배열만으로 전체 순회를 없앨 수 없다는 한계가 남으면, 항목 identity와 구조 version/변경 항목을 함께 소유하는 계약을 검토한다. 이는 아직 API 제안 초안 이전의 설계 분기다.

- 일반 항목 변경과 삽입·삭제·정렬을 구분하는 정보 생산자를 정한다. 외부 배열 mutation을 모두 가로채지 못하면 구조 불변을 보장한다고 말하지 않는다.
- 구조가 그대로라면 알려진 변경 항목에만 갱신을 전달하고, 구조 변경 시 일반 keyed reconciliation으로 돌아가는 모델을 검토한다. 변경 item을 찾는 자체 비용도 포함한다.
- 경계/항목당 메타데이터가 행별 컴포넌트보다 실제로 가벼운지 측정한다. API를 쓰지 않는 앱에 고정 비용을 부과하지 않는 방식을 우선 검토한다.
- 일반적인 편집 목록·대시보드 등 별도 예제로 유용성을 입증한다. benchmark 특유의 store를 라이브러리에 숨겨 이득을 만들지 않는다.

진입 전에 DC-5로 소유권, 무효화 누락의 처리, fallback, disposal, concurrent publication, API/크기 비용을 구체화한다. 정의가 불완전하면 C4는 계속 연구 후보이며 구현 완료 체크를 하지 않는다.

## 3. 모듈 책임과 경계

| 모듈                                                                           | 역할                                         | 변경 시 검증                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `src/diff.ts`, `src/render.ts`                                                 | keyed 매칭, 변경 판정, DOM 배치와 수명 순서  | C2, 중복 키·empty·Fragment·portal·정체성                                    |
| `src/wDom.ts`, `src/utils/redraw.ts`                                           | live 노드 교체, 부모/slot 참조, 갱신 큐      | C1/C3, stale renew·같은 task 순서·예외 복구                                 |
| `src/utils/universalRef.ts`, `src/types/index.ts`, `src/index.ts`              | 컴포넌트 상태·타입·공개 export               | 새 상태 크기/회수, 기존 타입/exports 호환                                   |
| `lithentConcurrent/src/{diff,render,wDom}.ts`, `scheduler.ts`, `renderGate.ts` | 재개 가능한 작업, commit, priority, boundary | 동작 공유 검증 + 폐기/중단/재시작. base 알고리즘을 기계적으로 이식하지 않음 |
| `helper/src/hook/cacheUpdate.ts`, `helper/src/lifecycle/*`                     | 기존 캐시·수명 기능                          | 필요성을 입증한 경우만 수정, 기존 helper 계약과 이름 보존                   |
| `src/tests`, `lithentConcurrent/src/tests`, `e2e`                              | 공통 정합성과 브라우저 수명 검증             | 공유 core spec를 두 코어로 실행, browser에서 실제 DOM identity/잔류 확인    |
| `docs/benchmark`의 러너·새 실험 폴더                                           | 독립 staging, 공식 측정·증거                 | 원본 수정 금지, manifest·표본·실패 배치 보존                                |

## 4. 성능 증명과 상쇄 비용

계측 build와 production build를 분리한다. 진단 카운터는 row/cache 검사, key Map/Set 작업, diff 호출, 컴포넌트 updater, 부모·slot 검색 방문 수, 위치 계획, DOM mutation을 분리한다. 1k/10k 및 변경 행 수를 바꿔 **n 전체 탐색인지 k 변경 범위인지** 확인하되 진단 시간을 공식 점수로 사용하지 않는다.

Phase 1에서는 다음 기준으로 카운터의 의미와 시나리오를 기록한다. 현재 제거 가능한 작업과 후보가 추가할 작업을 구분하며, 아직 구현하지 않은 후보의 예상 비용을 실측으로 표시하지 않는다.

| 측정 경계                | 기록할 작업                                                                                    | 진입 판단에 사용하는 근거                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 원래 Table 갱신          | Table/행 updater, row view, cache 호출·deps 검사·hit/miss, diff 호출                           | 전체 n개 방문과 실제 변경 k개의 분리                               |
| keyed 대조·배치          | 이전 key Map 생성·set/get/delete, 매칭·미사용 검사, 위치 계획·LIS·배치 방문, 실제 DOM mutation | C2가 기존 ordered/keymatch와 달리 없앨 중복 작업 및 남는 O(n) 검증 |
| 행별·중첩 자식 자체 갱신 | 부모 children과 조상 compChild 검색을 따로 기록: 호출, 배열 길이, 성공 위치/실패, 방문 합계    | C1의 검색 비용과 위치 저장·검증·유지 비용의 비교                   |

검색 방문 수가 `indexOf` 반환 위치와 배열 길이로 계산한 값이면 산출 방식과 dense 배열이라는 적용 범위를 명시하며 시간 비중으로 해석하지 않는다. 해당 앱에서 slot 검색 방문 추정이 0회여도 일반적인 slot 경로가 없다고 결론 내리지 않고 중첩 예제로 확인한다. 1k/10k에서 첫 선택·선택 이동·말미 선택, 변경 행 수가 다른 label 갱신과 구조 갱신을 구별한다. 공식 runner에 없는 10k 부분 갱신이나 일반 중첩 예제는 별도 진단이며 공식 CPU 항목으로 표시하지 않는다. 계측한 진단 시나리오·변경 위치·k·실제 DOM 변경 수를 함께 보존한다. C2의 same-order uniqueness shadow 검사는 기존 목록에서 가상 진입 검증의 방문/lookup을 관찰하는 계측이며, 구현·공식 성능 개선 증거가 아니다.

코어-only 대조는 동일한 원래 앱·helper를 사용한다. C1/C3/C4처럼 사용 패턴이 필요한 후보는 동일한 행별/일반 예제 구조에서 구기능과 새 기능도 비교하고, 원래 앱 대비 최종 결과는 따로 표시한다. 비용 attribution이 불가능한 조합은 그 한계를 적는다.

가중 전체 개선과 개별 상대 성능을 함께 본다. 생성·clear가 느려지거나 메모리가 늘어도 자동 탈락시키지 않는다. 기존 4,800B 게이트를 넘으면 별도 파일/선택적 export, 기존 비용 제거, 명시적 예산 재검토 중 어떤 대안이 가능한지 수치와 함께 기록한다. 무관한 코드 골프로 성능·계약을 흐리지 않는다.

## 5. 설계 결정 대장

체크는 **결정이 닫혔음**을 뜻하며 구현·검증 완료가 아니다.

- [x] **DC-1 확정:** C1/C2 내부 후보와 C3/C4 추가 정보 후보를 분리한다. C1과 C3 base 한정 후보는 각각 독립 검증 후 기본 채택 보류, C2는 미구현 보류다. 현재는 C3 기능 격리/비용 절감을 검토한다. 근거: 원래 앱과 row-renew의 비용 발생 지점이 다름. → Phase 1~3, M-2.
- [x] **DC-2 확정:** 기본 동작의 불명확한 identity/props 생략 금지, 증명 불가 시 기존 경로 사용. 근거: cached identity·keyed 소비 테스트. → Phase 2·5, M-3~M-5.
- [x] **DC-3 확정:** base와 concurrent의 관찰 가능한 계약을 각각 검증한다. 성능 측정은 우선 base이며 concurrent 개선을 추론하지 않는다. → Phase 2~6, M-6.
- [x] **DC-4 한정 후보 확정:** base root의 새 setup hook `useParentMemo`로 부모 기인 갱신만 생략한다. 복사 deps·무효화/fallback·self 우회·hit/miss callback/배칭·성공 게시·실패/삭제 소유 계약은 위 C3 절이 정본이다. 기존 helper로는 pre callback/updater 진입을 막거나 self를 구분할 수 없어 새 코어 경계를 택했다. **한정 구현·동작/회수·B1/B3 검증은 완료했고 크기 초과로 기본 채택 보류, 공식 시간과 API 배포는 미완료다.** → C3-T1~T7, M-4·M-6·M-8·M-9.
- [ ] **DC-5 TBD:** C4의 목록 소유권/변경 정보/무효화·fallback 계약. C3까지로 목표에 접근 가능한지 본 뒤 분기. → Phase 3, M-4·M-9.
- [x] **DC-6 C1 한정 후보 확정:** base의 정규화된 parent.children만 lazy `WeakMap<CompKey, WeakMap<WDom[], number>>` sidecar로 조회한다. 현재 배열·original identity 검증 뒤 성공 위치만 저장하고 stale/compKey 없음은 native fallback이다. slot은 alias의 첫 등장 증명 부족으로 기존 검색, concurrent는 commit 소유 경계가 달라 미수정이다. 고정 WDom/ComponentInfo/public API 변경·전체 hint 재작성 없이 cold/warm/stale·추가 WeakMap·크기/회수를 검증한다. 근거는 위 한정 후보 계약과 Phase 1 작업량이다. **C1 한정 구현·검증은 완료했고 기본 채택은 보류했다. [실측](../benchmark/PARENT_POSITION_RESULTS.md)을 참조한다.** → Phase 2, M-2·M-3·M-8.
- [x] **DC-7 확정:** 기존 retainedView/renderBoundary와 새 memo 의미를 구분하며 benchmark 주석 회피를 설계 동기로 삼지 않는다. → Phase 3·6, M-6·M-9.
- [ ] **DC-8 조건부 TBD:** C1 slot 검색 확장의 첫 등장/alias 불변식과 invalidation. 이번 부모 전용 후보에는 포함하지 않으며 재개 시 구현 전에 확정한다. → M-3·M-4.
- [ ] **DC-9 조건부 TBD:** C1 concurrent 이식의 live 소유, commit publication·abandon 및 메모리 비용. 이번에는 기존 경로를 유지한다. → M-6·M-8.
- [ ] **DC-10 조건부 TBD:** 보류한 C2의 uniqueness/순서 진입 증명 방식과 실제 제거 작업·추가 비용. 재개 시 별도 후보로 확정한다. → Phase 2, M-2·M-3.
- [ ] **DC-11 조건부 TBD:** C3 concurrent 지원의 work-in-progress snapshot 소유·commit 게시·abandon 폐기·boundary 상호작용. 첫 base 후보에는 포함하지 않으며 concurrent는 새 hook을 export하지 않는다. 재개 시 기준선의 두 번 실행·callback 불가역 부작용까지 별도 결정한다. → C3-T1·T4·T5, M-6·M-8.
- [ ] **DC-12 검토 대기:** C3의 선택적 진입점/기능 격리와 비사용자 setup/work/DOM 경계 비용 절감. 한정 후보 br +893B(한도 +891B)를 근거로 삼되, 예산 상향이나 새 subpath 채택을 미리 확정하지 않는다. 보존한 계약·실패 경계·props/slot fallback을 유지할 설계를 정한 뒤 새 후보를 만든다. → C3-T7, IC-3, M-8·M-9.

## 상태 / 핸드오프

- done: C3 한정 구현·33회귀·dual·실제 패키지/B3·9개 일반 context 검증과 증거 보존. 한도 +891B로 기본 채택 보류·baseline 복원, 공식 속도 개선 판정 없음.
- next: DC-12의 기능 격리/고정 비용 절감과 C3-T7 비사용자 비용 검증. C1/C2/C4는 결합하지 않는다.
- blockers: 현재 사용자 결정 블로커 없음. DC-12는 새 C3 후보 구현 전 결정하며 DC-5·DC-8~DC-11은 별도 조건부 연구다.
- commit: 최신 `ddd545e5b8c3878cfd5a6340464106e4c417da4f`(C3 계약·기준 회귀). 이번 후보 증거·보고서는 미커밋. C1 `b4eef39afa5fcc49937cb2ac168099f664b51fbe`, 런타임 기준 `085137b0447a8bbe7d28d3bf55c0a997779132b2`.

# LIS 다음에는 무엇을 최적화했을까: Lithent 렌더러에서 반복되는 일을 줄인 기록

> 작성 기준: 2026-11-03, 저장소 `d594983`, Lithent 1.25.5.
> 코드와 커밋 이력, 저장된 측정 보고서를 대조해 작성했다. 이 글을 작성하면서 성능을 새로 측정하지는 않았다.
> 아래의 변경 전후 코드는 원리를 설명하기 위한 축약 예제다. 실제 구현의 예외 처리와 세부 동작은 연결한 소스에서 확인할 수 있다.

Lithent에 LIS를 적용한 뒤에도 성능 최적화는 계속됐다. AI의 도움으로 작업을 진행하다 보니, 변경이 쌓인 뒤에는 어떤 수정이 왜 효과가 있었는지 다시 이해할 필요가 생겼다. 이 글은 그 과정을 코드와 측정 기록으로 되짚어 본 기록이다.

처음에는 리스트의 짝을 찾고 DOM을 옮기는 알고리즘이 큰 문제였다. Map과 LIS를 적용한 뒤에는 다른 비용들이 보이기 시작했다. 바뀌지 않은 행에서도 컴포넌트 갱신을 준비했고, 매번 객체의 속성을 삭제했다가 다시 만들었으며, 필요 없는 배열과 클로저를 생성했다. 삭제를 빠르게 하려고 넣은 검사 자체가 반복 순회를 만들기도 했다.

이후 최적화의 중심에는 **이미 알고 있는 사실을 활용해 반복 작업을 줄이는 것**이 있었다. 이전 노드가 없다는 사실, 키가 유일하다는 사실, 행의 순서가 유지된다는 사실, 캐시가 같은 객체를 반환했다는 사실을 각 단계에서 활용했다.

글은 기본 코어의 처리량 개선을 중심으로 설명한다. 일부 수정은 concurrent 코어에도 들어갔지만, 최근의 모든 최적화가 양쪽에 동일하게 들어간 것은 아니다. 적용 범위가 다른 부분은 따로 표시했다.

## 1. 먼저 렌더링 경로를 이해하자

Lithent는 화면을 곧바로 DOM에 쓰기 전에 WDom이라는 가상 노드로 표현한다. JSX도 최종적으로는 `h()`를 통해 이 노드 또는 컴포넌트 resolver를 만든다.

일반적인 갱신의 흐름은 다음과 같다.

```text
상태 변경 → renew() → 마이크로태스크에서 갱신 실행
                         ↓
               컴포넌트의 다음 출력 생성
                         ↓
          diff: 새 WDom과 이전 WDom을 비교
                         ↓
             필요한 작업을 nr 등에 기록
                         ↓
       render: 속성·텍스트 변경, DOM 생성·삭제·배치
```

이 흐름은 작업을 이해하기 위한 구분이다. 기본 코어에서 모든 부작용이 마지막 단계까지 미뤄지는 것은 아니다. 예를 들어 사용하지 않는 keyed 자식의 정리는 diff 도중 호출될 수 있다. concurrent 코어는 중단과 재개를 위해 별도의 build/commit 구조를 갖는다.

코드를 읽을 때 자주 보이는 필드는 다음과 같다.

| 필드        | 의미                                | 사용 예                                                |
| ----------- | ----------------------------------- | ------------------------------------------------------ |
| `type`      | 노드 종류                           | `e`: element, `t`: text, `f`: Fragment, `l`: 배열 목록 |
| `el`        | 연결된 DOM                          | element/text 또는 Fragment 표현 등에 사용              |
| `nr`        | 이번 렌더에서 할 작업               | `A`: 추가, `D`: 삭제, `U`: 갱신, `N`: 작업 없음        |
| `oi`        | 매칭된 노드의 이전 인덱스           | LIS와 순서 확인에 사용                                 |
| `op`        | 이전 DOM props                      | 속성 갱신에 사용                                       |
| `oc`        | 교체·삭제 과정에서 필요한 이전 자식 | 기존 DOM 제거에 사용                                   |
| `getParent` | 가상 부모를 얻는 함수               | 실제 DOM 부모와 삽입 위치 탐색에 사용                  |
| `il`        | 은퇴한 노드 표시                    | 오래된 갱신 요청으로 다시 그리지 않도록 검사           |

여기서 세 가지를 구분하면 이후 설명이 쉬워진다.

- **같은 key**는 목록에서 같은 항목을 찾기 위한 식별 정보다.
- **같은 WDom 객체**는 JavaScript의 `===`로 동일한 객체라는 뜻이다.
- **같은 DOM**은 이미 만들어진 실제 element나 text를 계속 사용하는 것이다.

새 WDom 객체를 만들더라도 key가 같으면 이전 항목과 매칭해 같은 DOM을 유지할 수 있다. 반대로 같은 WDom 객체를 두 위치에 사용하면, 위치별 DOM과 상태를 위해 복사가 필요할 수 있다.

읽을 코드: [diff.ts](../../src/diff.ts), [render.ts](../../src/render.ts), [wDom.ts](../../src/wDom.ts).

## 2. 출발점: Map과 LIS가 해결한 비용

LIS 이후의 최적화를 이해하려면 먼저 LIS가 해결한 범위를 알아야 한다. 2026-08-03의 `f185dd2`에는 Map 매칭과 LIS뿐 아니라 앵커 재사용, 일부 할당 감소도 함께 들어갔다.

### 2.1 같은 key를 찾는 반복 탐색을 Map으로 바꿨다

이전 방식은 새 자식마다 이전 자식 배열에서 같은 key를 찾았다. 사용한 항목을 배열에서 제거하는 작업까지 포함하면 긴 목록에서 반복 탐색과 배열 이동이 쌓인다.

```ts
// 변경 전의 원리
for (const child of nextChildren) {
  const old = oldChildren.find(item => keyOf(item) === keyOf(child));
  // old를 사용한 뒤 배열에서 제거하는 작업도 필요
}

// Map 도입 후의 원리
const byKey = new Map(oldChildren.map((node, index) => [keyOf(node), index]));
for (const child of nextChildren) {
  const oldIndex = byKey.get(keyOf(child));
  // 이전 노드와 비교
}
```

실제 구현은 중복 key에서 첫 원본을 우선하는 처리와 key 없는 항목의 매칭도 고려한다. 위의 `new Map(...)`은 원리만 보여 준다.

중복 탐색의 최악 비용 O(n²)을, 일반적인 Map 조회 비용을 가정한 선형 매칭으로 바꾼 것이다.

### 2.2 순서가 바뀌어도 필요한 노드만 옮겼다

다음과 같이 순서가 바뀌었다고 하자.

```text
이전 key:       A B C D E
새로운 key:     A D C B E
이전 인덱스:    0 3 2 1 4
```

`0, 2, 4`는 증가하는 부분 수열이다. 여기에 해당하는 A, C, E는 서로의 상대 순서가 이미 맞는다. 나머지 D와 B를 적절한 위치로 옮기면 된다.

LIS는 가장 긴 증가 부분 수열을 찾아 그대로 둘 항목을 최대화한다. 단일 DOM으로 표현된 매칭 항목들의 재정렬에서는 그만큼 이동할 항목 수를 줄일 수 있다. Fragment나 다중 루트 항목은 한 항목 이동이 여러 DOM 작업으로 이어질 수 있으므로, 항목 이동 수와 실제 DOM 호출 수는 구분해야 한다.

내용 갱신은 왼쪽에서 오른쪽으로 진행해 생명주기 순서를 유지하고, 필요한 DOM 배치는 오른쪽에서 왼쪽으로 진행한다. 오른쪽 항목의 위치가 정해져 있으면 그 DOM을 다음 삽입의 기준점인 `anchor`로 쓸 수 있기 때문이다.

LIS 계산의 일반적인 복잡도는 O(n log n)이다. **LIS를 사용한다고 전체 렌더링 비용이 사라지는 것은 아니다.** 매칭, WDom 생성, 속성 처리, 컴포넌트 실행, 브라우저 렌더링은 여전히 남는다.

### 2.3 LIS 작업 때 함께 줄인 할당도 있었다

형제마다 만들던 `getParent` 함수를 부모당 하나로 공유했다. 초기 DOM 구성에서는 부모마다 중간 `DocumentFragment`를 추가로 만드는 대신 부모에 자식을 직접 붙이도록 바꿨다. 일반 element의 새 서브트리는 아직 문서에 붙기 전이므로, 중간 컨테이너를 추가로 둘 필요가 없었다. Fragment 표현 자체를 없앤 변경은 아니다.

props 순회에서 `Object.entries()`가 만드는 배열과 각 `[key, value]` 배열을 줄이고, 이벤트 이름 판별을 정규식 대신 문자 비교로 처리하는 변경도 있었다. 현재 accessor 조회는 prototype과 prop 이름을 기준으로 캐시한다. 이 캐시는 이후 custom element가 upgrade되어 prototype이 바뀌는 경우를 구분하도록 보완됐다.

이 변경들은 LIS **이후에 새로 추가한 성과로 다시 세면 안 된다.** LIS 도입 커밋에 포함된 출발점이다.

당시 1만 행 jsdom 기록은 교환 2,719ms → 약 90ms, 추가 3,031ms → 약 100ms였다. 이는 당시 환경에서 알고리즘과 함께 적용한 변경의 결과이며, 실제 브라우저의 현재 속도로 환산할 수 없다.

근거: [당시 코드 해설](./CODE_WALKTHROUGH.md), [역사 기록](./history/2026-07-map-lis/README.md). 현재 `updateChildren`, `getLisPositions`, `wDomChildrenToDom`을 함께 보면 이후 변화도 비교할 수 있다.

## 3. 바뀌지 않은 행의 가상 DOM을 매번 만들지 않도록 했다

LIS가 DOM 이동을 줄여도, 행 하나를 선택할 때 1,000행의 가상 DOM을 전부 다시 만들면 비용이 크다.

초기 벤치마크 앱은 부모 갱신 때마다 모든 행 컴포넌트를 실행하고, 행의 이벤트 함수와 하위 WDom도 새로 만들었다. 같은 DOM을 유지하는 것과 JavaScript 작업을 생략하는 것은 별개의 문제였다.

여기에는 기존 helper인 `cacheUpdate`를 활용했다. `cacheUpdate` 자체를 이때 처음 발명한 것은 아니다. 의존 값이 그대로라면 이전에 만든 WDom 객체를 반환하는 helper를 앱의 행 렌더에 적용한 것이다.

```ts
// 설명용 예제: 각 행의 캐시는 행이 살아 있는 동안 유지한다.
const renderRow = cacheUpdate(
  () => [row.label, selectedId === row.id],
  () => h('tr', { key: row.id } /* 행 내용 */)
);
```

의존 값이 같으면 updater를 실행하지 않고 이전 객체를 반환한다. 선택이 A행에서 B행으로 이동하면 대부분의 행은 여전히 선택되지 않은 상태다. 이 행들은 WDom을 다시 만들 필요가 없다.

여기서 의존 값의 선택이 중요하다. `row` 객체를 직접 수정하면서 의존성에 `row`만 넣으면 객체 참조가 같아 변경을 놓칠 수 있다. 실제 개선 앱은 `row.label`과 해당 행의 선택 여부를 비교했다.

이벤트 핸들러도 행마다 한 번 만들어 재사용했다. 함수 본문이 같아도 다음 두 함수는 다른 객체다.

```ts
(() => select(id)) === (() => select(id)); // false
```

매 렌더마다 함수를 새로 만들면 기존 핸들러와 다른 값으로 보인다. 안정적인 함수 참조는 캐시 검사와 native listener 교체 비용을 줄이는 데 도움이 된다.

다만 `cacheUpdate`는 컴포넌트 갱신 입구 전체를 막는 API가 아니다. 행을 컴포넌트로 구성하면 props 동기화와 컴포넌트 갱신 준비를 거친 뒤 updater의 캐시에 도달한다. **출력 캐시가 생략하는 범위와 컴포넌트 전체 메모이제이션의 범위는 다르다.**

관련 구현: [cacheUpdate.ts](../../helper/src/hook/cacheUpdate.ts), `runUpdate`와 `syncResolverProps`는 [diff.ts](../../src/diff.ts).

## 4. 벤치마크 앱에서 행마다 두었던 컴포넌트 경계를 줄였다

앞의 캐시를 적용해도 행마다 컴포넌트가 있으면 준비 비용이 남았다. 1,000행에서 선택 상태를 바꾸는 진단에서는 `runUpdate`, props 동기화, 래퍼 생성이 각각 1,001회 발생했다. 실제 내용 변경이 두 행뿐이어도 부모와 모든 행의 갱신 입구를 지나간 것이다.

후속 앱은 행마다 `mount` 컴포넌트를 만드는 대신, Table 컴포넌트 안에서 행별 캐시를 관리하고 keyed `tr`를 반환하도록 바꿨다.

```text
변경 전
Table → Row 컴포넌트 × 1,000 → 각 행의 캐시 → tr

변경 후
Table → 행별 캐시 × 1,000 → tr
```

이 구조는 행별 컴포넌트 props 동기화, 훅 문맥 처리, 출력 Fragment와 메타데이터 비용을 줄인다. 캐시와 핸들러를 보관하는 자료구조는 남으며, 모든 행을 순회하는 비용까지 제거한 것은 아니다.

이는 **벤치마크 앱의 구성 변경**이다. 코어가 자동으로 모든 앱의 컴포넌트 경계를 제거한 기능으로 설명하면 안 된다. 독립적인 상태나 생명주기가 필요한 행에서는 컴포넌트 경계가 유용하고, 경계를 없애면 그 책임을 상위 코드가 맡아야 한다.

같은 코어와 helper를 사용한 2026-10-08 앱 전후 비교에서 다음 결과를 얻었다. 전체 시간 중앙값이며 단위는 ms다.

| 동작      | 변경 전 | 변경 후 | 시간 감소 |
| --------- | ------: | ------: | --------: |
| 부분 갱신 |  22.100 |  17.592 |     20.4% |
| 행 선택   |  10.136 |   7.460 |     26.4% |
| 행 교환   |  21.358 |  16.169 |     24.3% |
| 전체 삭제 |  18.713 |  10.996 |     41.2% |

이 앱 변경 묶음의 가중 지표는 1.609 → 1.388로 약 13.8% 감소했다. 행 경계 제거 하나만의 독립 효과를 분리한 수치는 아니다. 같은 측정에서 1만 행 보유 메모리는 35.065 → 28.262MB로 줄었다.

후속으로 helper의 의존 배열 **길이**도 비교하도록 고쳤다. `[1] → [1, 2]`를 앞의 값만 보고 같은 의존성으로 판단하지 않게 한 정확성 수정이다. 기존 앱의 고정 길이 캐시가 잘못 작동하던 것을 고쳐서 위 성능 이득을 얻은 것은 아니다.

근거: [PRODUCTION_RESULTS](../benchmark/PRODUCTION_RESULTS.md), [기존 앱 소스](../benchmark/adapter-baseline/main.tsx), [행 경계 비용 분석](../benchmark/CORE_ANALYSIS.md).

## 5. 빠른 삭제를 위한 검사가 O(n²)이 되던 문제를 고쳤다

LIS 도입 때 전체 삭제를 한 번의 `textContent = ''`로 처리하는 빠른 경로가 생겼다. 그러려면 부모가 삭제할 자식들만 갖고 있는지 확인해야 한다.

초기 구현은 이 판단을 위해 부모의 전체 자식을 셌다. 그런데 목록의 각 행이 컴포넌트이면, 행의 Fragment를 삭제하면서 이 함수에 반복해서 들어왔다.

```text
첫 번째 행 삭제: 부모의 자식 n개 확인
두 번째 행 삭제: 부모의 자식 n-1개 확인
세 번째 행 삭제: 부모의 자식 n-2개 확인
...
```

전체 확인 횟수는 대략 `n + (n - 1) + ... + 1`이다. 삭제를 빠르게 하기 위한 검사가 O(n²) 비용을 만든 셈이다.

2026-10-07에는 우선 일괄 삭제 후보가 되는 경우에만 검사를 하고, 후보 수보다 하나 더 확인했으면 중단하도록 바꿨다.

```ts
// 당시 수정의 원리
if (canBeBulkRemoval(items)) {
  let count = 0;
  for (
    let node = parent.firstChild;
    node && count <= items.length;
    node = node.nextSibling
  ) {
    count++;
  }
  // 후보 수보다 많으면 전체를 셀 필요 없이 일괄 삭제 불가
}
```

두 DOM을 반환하는 컴포넌트가 긴 목록에 섞여 있어도, 한 컴포넌트의 삭제 여부를 판단하기 위해 부모의 수천 형제를 끝까지 세지 않는다. 확인한 노드 수만으로 이미 빠른 경로를 사용할 수 없다는 결론이 나면 멈춘다.

같은 작업에서는 사용하지 않는 keyed 항목들을 지울 때 실제 DOM 부모를 목록 기준으로 한 번 구하는 처리도 정리됐다. 개별 항목의 부모 링크가 다른 재사용 위치로 바뀌었더라도 삭제할 목록의 실제 부모를 기준으로 처리한다.

이 부분은 이후 20절의 DOM 정체성 검사로 다시 개선됐다. 현재 소스에는 위의 개수 세기 루프 대신 정체성 비교가 들어 있다.

관련 커밋: `7f14950`. 근거: [초기 병목과 수정](../benchmark/STATUS.md), [다중 루트 진단](../benchmark/CORE_ANALYSIS.md). 현재 구현은 [render.ts](../../src/render.ts)의 `findChildWithRemoveElement`, `typeDeleteUnused`.

## 6. 내부 메타데이터를 delete하지 않고 값을 비웠다

각 노드는 렌더 중 `oi`, `op`, `oc` 같은 임시 정보를 갖는다. 이전 코드는 사용이 끝나면 속성을 삭제했다.

```ts
// 변경 전
delete node.oi;
delete node.op;
delete node.oc;

// 현재 방식
node.oi = node.op = node.oc = undefined;
node.nr = 'N';
```

`delete`는 객체에서 속성 자체를 없앤다. `undefined` 대입은 속성을 유지하면서 값을 바꾼다. 따라서 `Object.keys()`나 `in`으로 관찰하면 둘은 다르다.

JavaScript 엔진은 객체의 속성 구성을 바탕으로 속성 접근을 최적화한다. 렌더마다 필드를 추가하고 지우면 그 구성이 반복해서 바뀔 수 있다. 내부 필드의 자리를 유지하면 이런 변화를 줄일 수 있다.

또한 값이 참조라면 `undefined`로 바꾸는 것만으로도 이전 객체와의 연결을 끊을 수 있다. 이전 props나 자식을 놓아 주기 위해 반드시 속성 자체를 삭제해야 하는 것은 아니다.

다만 이를 “delete 한 번이면 무조건 dictionary mode가 되어 느려진다”라고 설명하면 부정확하다. 이후 V8 진단에서는 기존 노드들도 fast properties를 유지했고 dictionary object는 관찰되지 않았다. 이 작업의 근거는 실제 A/B 개선 신호와 객체 구성 변화 감소이며, 엔진 내부 원인을 한 문장으로 확정한 것은 아니다.

2026-10-07의 진단에서는 메타데이터 정리 후보만으로 선택 약 24%, 부분 갱신 약 20%의 시간 감소 신호가 있었다. 이 숫자는 페인트를 제외한 당시 진단값이다. 최종 채택은 props 동기화 등 다른 수정과 함께 검증했으므로, 전체 사용자 화면이 같은 비율로 빨라졌다고 해석하지 않는다.

`nr`는 이후 “이미 그린 노드” 표시까지 맡으면서 현재는 정리 후 `'N'`이 된다. 이 역할은 13절에서 다시 설명한다.

관련 코드: [render.ts](../../src/render.ts)의 `clearDiffMeta`. 근거: [CORE_ANALYSIS](../benchmark/CORE_ANALYSIS.md), [NODE_SHAPE_RESULTS](../benchmark/NODE_SHAPE_RESULTS.md).

## 7. props 갱신에서 전체 삭제와 불필요한 객체 변경을 줄였다

이 작업에는 서로 다른 두 props 경로가 있다. DOM에 적용할 props와 컴포넌트가 계속 참조하는 props다.

### 7.1 DOM 속성을 비교하려고 이전 props 객체를 훼손하지 않는다

이전 `updateProps`는 새 props에서 처리한 key를 이전 props 객체에서 지웠다. 마지막에 남은 key를 “제거할 속성”으로 쓰기 위해서였다.

```ts
// 변경 전의 원리
for (const key in nextProps) {
  applyIfChanged(key, nextProps[key], oldProps[key]);
  delete oldProps[key];
}
for (const key in oldProps) {
  removeProp(key);
}
```

이전 props가 사용자가 보관하던 객체라면 렌더러가 그 객체를 비워 버린다. 같은 props 객체를 다시 쓰는 경우에도 문제가 생긴다.

현재는 새 props를 비교·적용한 뒤, 이전 props를 순회하면서 새 props에 없는 key만 DOM에서 제거한다. 비교용 객체를 파괴하지 않아도 같은 결론을 얻을 수 있다.

```ts
// 현재 방식의 원리: 열거 가능 여부의 세부 처리는 생략
for (const key in nextProps) {
  applyIfChanged(key, nextProps[key], oldProps[key]);
}
for (const key in oldProps) {
  if (!existsInNextProps(key)) removeProp(key);
}
```

현재 `hasEnumerableProp`은 상속된 enumerable 속성과 숨겨진 own 속성의 관계도 처리한다. `key in props`만으로 실제 `for...in` 순회 의미를 완전히 대체할 수 없어 보완한 부분이다.

### 7.2 컴포넌트 props는 같은 객체를 유지하면서 바뀐 내용을 반영한다

컴포넌트의 setup에서 받은 props는 클로저가 계속 참조한다. 이를 통째로 새 객체로 바꾸면 기존 클로저가 이전 객체를 볼 수 있다. 그래서 객체 참조를 유지해야 한다.

이전에는 기존 key를 전부 지운 뒤 새 값을 다시 복사했다. 현재는 **사라진 key만 삭제하고 나머지 값을 대입**한다.

```ts
// 원리만 표현한 축약 예제
for (const key of Object.keys(heldProps)) {
  if (!isEnumerableOwnProp(incomingProps, key)) delete heldProps[key];
}
for (const key of Object.keys(incomingProps)) {
  heldProps[key] = incomingProps[key];
}
```

내용이 거의 같은 props에서도 모든 속성을 지웠다가 다시 추가하던 비용이 줄었다. 공유 children 배열 역시 필요한 경우 `splice()`로 내용을 동기화해 참조를 유지한다.

이 최적화는 여전히 props의 key들을 순회하며 값을 복사한다. “변경된 prop 하나만 찾아서 O(1)에 갱신한다”는 구현은 아니다.

관련 커밋: `7f14950`, 후속 정확성 보완 `6a54bdf`. 코드: [diff.ts](../../src/diff.ts)의 `syncResolverProps`, `runUpdate`, [render.ts](../../src/render.ts)의 `updateProps`, [utils/index.ts](../../src/utils/index.ts)의 `hasEnumerableProp`.

## 8. 컴포넌트를 갱신할 때마다 redraw 함수를 다시 등록하지 않는다

이전에는 컴포넌트가 새 출력을 만들 때마다 메타데이터와 redraw 함수를 다시 설정했다. 많은 행 컴포넌트가 갱신되면 실제 UI 변경이 적어도 클로저와 임시 객체가 반복해서 생겼다.

현재 기본 코어는 `bindRedraw()`를 컴포넌트 생성 시 한 번 호출한다. 갱신 때마다 바뀌는 것은 해당 컴포넌트의 현재 WDom 포인터다.

```ts
// 현재 bindRedraw의 핵심
comp.up = () => {
  const wDom = comp.vd.value;
  schedule(compKey, () => exec(wDom));
};
```

이렇게 하면 부모에 의해 반복해서 갱신되는 모든 행에 redraw 등록용 함수를 매번 다시 만들 필요가 없다. 컴포넌트 메타데이터도 임시 객체를 만들어 `Object.assign`하는 대신 각 필드에 직접 대입하도록 바꿨다.

주의할 점은 위 코드에도 `renew()` 시점의 큐 작업 함수는 만들어진다는 것이다. 모든 함수 할당을 없앤 변경은 아니다. **등록의 수명을 컴포넌트 수명으로 늘린 것**이다.

현재 WDom은 큐를 실행할 때가 아니라 `renew()`가 불린 시점에 잡는다. 그 사이 부모가 해당 노드를 이미 갱신해 은퇴시켰다면 오래된 노드의 `il` 검사를 통해 중복 갱신을 피한다. 함수 재사용을 위해 이 시점을 바꾸면 기존 갱신 의미가 달라질 수 있다.

이 변경은 기본 코어에 적용됐다. concurrent는 redraw 게시를 commit까지 미루는 구조이므로 동일한 수정을 그대로 옮기지 않았다.

관련 커밋: `7f14950`. 코드: [redraw.ts](../../src/utils/redraw.ts)의 `bindRedraw`, [wDom.ts](../../src/wDom.ts)의 `makeCustomNode`, `addComponentProps`. 계약 테스트: [core-updatePaths.test.tsx](../../src/tests/core-updatePaths.test.tsx).

## 9. 버려지는 DOM의 이벤트를 하나씩 해제하던 작업을 줄였다

과거에는 DOM을 삭제하기 전에 하위 노드들을 순회하면서 이벤트 리스너를 하나씩 해제했다. 삭제할 행에 이벤트가 두 개씩 있으면 1,000행에서 수천 번의 해제 호출이 추가된다.

현재는 **버려지는 일반 DOM의 리스너를 그대로 두고 DOM을 제거**한다. DOM과 리스너를 포함한 객체들이 다른 곳에서 도달 불가능해지면 함께 GC 대상이 될 수 있기 때문이다.

여기서 “DOM에서 떼면 무조건 메모리가 회수된다”는 설명은 피해야 한다. 사용자가 제거한 element를 계속 보관하거나, 다른 참조가 살아 있으면 DOM과 핸들러도 남을 수 있다. 현재 동작에서는 보관한 detached DOM에 이벤트를 보내면 핸들러가 실행될 수도 있다.

작업을 줄인 범위도 한정되어 있다.

- 살아 있는 DOM에서 handler prop이 바뀌면 이전 listener를 해제하고 새 listener를 등록한다.
- handler prop 자체가 없어져도 기존 listener를 해제한다.
- unmount 콜백과 컴포넌트 정리는 계속 실행한다.
- portal target처럼 사용자가 제공하고 계속 살아 있는 DOM의 listener는 별도로 정리한다.

마지막 예외가 중요하다. 일반 행 DOM은 버려지지만 portal target은 사용자의 컨테이너다. 같은 수명 정책을 적용할 수 없다. 최초 삭제 최적화 뒤 portal listener 정리가 후속으로 보완됐다.

당시 새 페이지 12개를 사용한 전체 삭제 진단은 9.6 → 8.2ms였다. 이는 진단용 시간이며, 서로 다른 차수의 공식 전체 시간을 가져와 이 변경 하나의 효과로 계산하지 않는다.

관련 커밋: `71e54c1`, portal 보완 `6a54bdf`. 코드: [render.ts](../../src/render.ts)의 `updateEvent`, [unmount.ts](../../src/hook/internal/unmount.ts)의 `recursiveRunUnmount`. 테스트: [core-discardedListeners.test.tsx](../../src/tests/core-discardedListeners.test.tsx).

## 10. 부모 getter의 스코프를 분리해 이전 VDOM이 남는 문제를 해결했다

이 변경은 코드가 특히 작다. 하지만 반복 갱신의 메모리 사용에는 큰 영향을 줬다.

```ts
// 변경 전의 구조
function updateChildren(newParent, oldParent) {
  const oldChildren = oldParent.children;
  const getParent = () => newParent;
  return newParent.children.map((child, index) => {
    // oldChildren을 사용하는 비교
    return reconcile(child, oldChildren[index], getParent);
  });
}

// 변경 후: 부모 링크 생성의 스코프를 별도로 분리
const makeParentGetter = parent => () => parent;

function updateChildren(newParent, oldParent) {
  const oldChildren = oldParent.children;
  const getParent = makeParentGetter(newParent);
  return newParent.children.map((child, index) => {
    return reconcile(child, oldChildren[index], getParent);
  });
}
```

겉으로는 어느 쪽도 `newParent`만 반환한다. 하지만 이전 구현에서는 장기간 살아 있는 부모 getter와 이전 자식을 사용하는 map 콜백이 같은 함수 스코프 안에서 만들어졌다.

관찰한 엔진과 빌드에서는 이 환경이 이전 자식 배열을 계속 도달 가능하게 만드는 보유 경로와 연결됐다. getter를 부모 인자 하나만 받는 별도 함수에서 생성해 불필요한 환경과 분리하자 이전 VDOM이 회수됐다.

이를 JavaScript의 일반 규칙으로 “클로저는 스코프의 모든 변수를 항상 붙잡는다”라고 설명하면 틀리다. 캡처 환경의 구성과 최적화는 엔진 및 빌드에 영향을 받는다. 이 프로젝트에서는 실제 보유 현상과 수정 전후 회수 검증이 근거다.

같은 앱에서 1,000행을 유지하며 부분 갱신을 반복한 뒤 강제 GC한 JS heap 중앙값은 다음과 같았다.

| 부분 갱신 횟수 |  수정 전 | 수정 후 |
| -------------- | -------: | ------: |
| 0              |  3.886MB | 3.781MB |
| 5              |  4.593MB | 3.818MB |
| 25             |  7.399MB | 3.882MB |
| 100            | 17.769MB | 4.026MB |

갱신마다 라벨 문자열도 길어지므로 수정 후 메모리가 완전히 고정될 필요는 없다. 중요한 것은 이전처럼 회당 약 0.14MB의 이전 VDOM이 계속 쌓이지 않는다는 점이다.

WeakRef 브라우저 회귀 테스트도 추가했다. 수정 전에는 50회 갱신 뒤 이전 노드까지 51개가 남았고, 수정 후에는 현재 노드 1개만 남았다. base와 concurrent 양쪽의 관련 경로에서 확인했다.

이 변경은 CPU 속도 개선으로 포장할 성과는 아니다. 별도의 공식 CPU 비교에서 가중 시간은 약 0.6% 증가했고 환경 변동도 있었다. **주요 성과는 이전 VDOM의 회수 오류를 고친 것**이다.

관련 커밋: `183fec7`. 코드: [utils/index.ts](../../src/utils/index.ts)의 `makeParentGetter`, [diff.ts](../../src/diff.ts)의 세 사용 지점. 근거: [PRODUCTION_RESULTS의 부모 getter 수정](../benchmark/PRODUCTION_RESULTS.md), [parent-retention.spec.ts](../../e2e/parent-retention.spec.ts).

## 11. 새로 추가하는 노드는 이전 노드와 타입을 비교하지 않는다

새 노드만 있고 이전 노드가 없으면 두 노드의 타입이 같은지 검사할 이유가 없다.

```ts
// 현재 makeNewWDomTree의 핵심
const sameType =
  !!originalWDom &&
  checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom);
```

추가한 것은 `!!originalWDom &&`라는 짧은 조건이다. 이전 노드가 없으면 `getWDomType`과 타입별 비교 함수 호출을 건너뛴다.

한 번의 검사 비용은 작지만 노드 수가 많다. 당시 1만 행 생성에서는 추가 자식 diff 준비가 100,001회 발생했다. 거의 10만 번 실행되는 경로라면 작은 불필요 작업도 측정할 가치가 있다.

이전 노드가 있는 갱신과 교체는 기존 비교를 계속한다. empty 노드의 삭제 판정도 유지한다. 새 서브트리 생성 전체를 생략하는 기능은 아니다.

같은 앱·helper를 고정한 공식 러너 비교에서 1,000행 생성의 JS 시간은 9.564 → 9.128ms로 약 4.5% 줄었다. 전체 시간은 28.673 → 28.380ms로 약 1.0% 줄었다.

JS 최적화 비율과 화면 전체 시간의 비율이 다른 이유는 DOM과 브라우저 렌더링 비용이 함께 남기 때문이다.

관련 커밋: `4356120`. base와 concurrent에 적용됐다. 코드: [diff.ts](../../src/diff.ts)의 `makeNewWDomTree`. 근거: [CREATION_PROFILE](../benchmark/CREATION_PROFILE.md). 테스트: [core-addedSubtrees.test.tsx](../../src/tests/core-addedSubtrees.test.tsx).

## 12. 순서가 그대로인 목록은 LIS 계산을 건너뛰고, 이동 정보도 더 작게 유지했다

LIS를 도입한 초기에는 선택이나 텍스트 변경에도 기존 인덱스 수열을 만들고 LIS를 계산했다. 하지만 다음 수열에는 재배치할 항목이 없다.

```text
이전 인덱스 수열: 0, 1, 2, 3, 4, ...
```

2026-10-15에는 매칭된 인덱스가 계속 증가하는지 확인하고, 순서가 유지되면 `getLisPositions()`를 호출하지 않도록 했다. 정렬된 입력에서 기존 LIS도 사실상 선형으로 처리됐으므로, O(n²)을 O(n)으로 바꾼 성과와는 다르다. 이미 O(n)에 가까웠던 작업의 배열·결과 계산을 줄인 것이다.

이동 여부 표현도 정리했다. 처음에는 LIS 결과를 `Set`에 보관하고 각 항목의 이전 인덱스를 별도 배열에 복사했다. 후속 구현은 `keep` 배열에서 세 상태를 구분했다.

| `keep[i]` | 의미                              |
| --------- | --------------------------------- |
| `true`    | 매칭된 기존 항목이며 그대로 둔다  |
| `false`   | 매칭된 기존 항목이며 옮긴다       |
| 값 없음   | 그 이동 판단에 포함되지 않은 항목 |

이제 배치 단계에서는 `keep[i] === false`를 확인하면 된다. “기존 항목인지, 새 항목인지, LIS에 있는지”를 판단하려고 모든 `oi`를 별도 복사해 둘 필요가 줄었다. `matchedIndexes`와 `oiSeq`까지 모두 없어진 것은 아니다.

여기에는 중요한 정확성 조건이 있다. 내용 갱신 도중 `oi`가 정리될 수 있어서, 이동 계획에 필요한 정보는 내용 갱신 전에 확보해야 한다. 배열을 없애는 것만 보고 읽는 시점을 뒤로 옮기면 매칭 정보를 잃을 수 있다.

관련 커밋: `45fe5da`, `39921f7`. 코드: [render.ts](../../src/render.ts)의 `updateChildren`, `ordered`, `keep`. 근거: [EDGE_FIX_PERFORMANCE](../benchmark/EDGE_FIX_PERFORMANCE.md).

## 13. 정확성을 위한 표시도 모든 노드에 새 필드로 붙이지 않았다

공유 WDom, 빈 자식, 재정렬 도중 자식의 자체 갱신 등을 올바르게 처리하려면 추가 정보가 필요했다. 하지만 그 정보를 표현하는 방법에 따라서 갱신 비용이 달라졌다.

### 13.1 이동 중인 항목은 별도 Set에서 관리한다

DOM 배치를 나중에 수행하면 내용 갱신 중에는 이동 대상의 DOM이 아직 옛 위치에 있다. 그런 노드를 새 내용의 삽입 기준점으로 쓰면 위치가 잘못될 수 있다.

이동 예정 항목을 알아야 하지만, 모든 노드에 `mv` 같은 속성을 추가하면 또 다른 객체 구성이 생긴다. 현재는 모듈의 `moving` Set에 필요한 항목만 넣고, 앵커 탐색에서 제외한다.

```ts
movers.forEach(item => moving.add(item));
try {
  updateContents();
} finally {
  movers.forEach(item => moving.delete(item));
}
```

`finally`는 성능과 정확성 양쪽에 중요하다. 갱신이 실패해도 Set이 노드를 계속 보유하거나 다음 렌더에서 잘못된 앵커 제외 상태를 만들지 않게 한다.

새로 추가하는 `A` 항목은 내용 순회가 해당 항목에 도달하기 전 DOM이 없고, 앵커는 현재 항목 이후에서 찾는다. 이 조건을 이용해 추가 항목을 불필요하게 Set에 넣는 작업도 줄였다. 교체 `S`와 실제 이동할 기존 항목은 여전히 관리한다.

### 13.2 이미 그렸다는 표시는 nr을 재사용한다

같은 WDom이 다른 위치에도 사용되면 위치별 복사가 필요하다. 이를 알아보려고 새 `u` 필드를 추가하는 대신, 렌더 작업 필드인 `nr`를 활용했다.

현재 생성 직후에는 `nr`가 `undefined`이고, 이미 그렸거나 diff가 맡은 노드는 `nr`를 갖는다. 렌더 후에는 `'N'`으로 남긴다. 다른 위치에 쓰려는 노드가 이런 표시를 가지면 필요한 복사 경로를 탄다.

그 결과 표시용 필드를 하나 더 늘리지 않아도 된다. 다만 아직 그리지 않은 컴포넌트까지 무조건 복사하면 인스턴스가 두 번 생성될 수 있다. 실제로 이 경계의 오류를 고치면서 setup·HMR 등록만 되고 그려지지 않는 인스턴스 문제도 수정했다.

### 13.3 자기 자신만 갱신하는 keyed 행은 다시 삽입하지 않는다

현재 `renderHandlers.T`는 `typeUpdate`를 사용한다. keyed 행의 자체 `renew()`는 그 행의 순서를 바꾸는 작업이 아니므로 DOM을 떼었다가 다시 넣을 필요가 없다. 불필요한 재삽입을 피하면 input focus나 iframe 상태를 흔들 가능성도 줄인다.

목록 전체 갱신에서 필요한 이동은 여전히 상위 `updateChildren`이 결정한다. 내용 갱신과 위치 변경의 책임을 구분한 것이다.

이 일련의 수정은 정확성 변경의 비용을 줄이는 과정이었다. 당시 진단에서는 `mv` 필드 대신 Set을 쓰는 변경이 교환의 프레임워크 명령어 수를 약 5~12% 줄였다. 명령어 수 감소율을 공식 화면 시간 감소율로 쓰면 안 된다.

관련 커밋: `a533dd0`, `8aa2734`, `d2d01c3`, `982e4ae`, 구조 수정 `4b4bff2`. 코드: [diff.ts](../../src/diff.ts), [render.ts](../../src/render.ts)의 `moving`, `clearDiffMeta`, `renderHandlers`. 근거: [EDGE_FIX_PERFORMANCE](../benchmark/EDGE_FIX_PERFORMANCE.md).

## 14. 은퇴한 컴포넌트가 이전 출력 트리를 빨리 놓아 주도록 했다

GC는 앞으로 쓰지 않을 객체를 예측해서 버리지 않는다. 현재 살아 있는 객체에서 도달할 수 있는지를 기준으로 회수 가능성을 판단한다.

목록을 갱신하는 도중에도 이전 목록 배열은 잠시 살아 있을 수 있다. 은퇴한 컴포넌트 노드가 `children`으로 이전 출력 전체를 붙잡고 있으면, 이미 새 행을 그렸더라도 옛 하위 트리는 갱신이 끝날 때까지 도달 가능하다.

현재 diff는 은퇴한 원본이 컴포넌트일 때 이전 출력 연결을 끊는다.

```ts
if (!isNothing && originalWDom) {
  originalWDom.il = true;
  if (originalWDom.ctor) {
    originalWDom.children = undefined;
  }
}
```

컴포넌트를 나중에 다른 위치에 복제할 때는 `cloneWDom`이 보관한 컴포넌트 설명을 이용해 새 인스턴스를 만들 수 있다. 그래서 은퇴한 출력 트리를 계속 붙잡을 필요가 없다.

일반 element는 다르다. 사용자가 상수로 보관한 WDom을 나중에 다시 렌더할 수 있으므로 자식 설명이 필요하다. 모든 노드의 `children`을 지우는 방식으로 일반화하지 않았다.

당시 갱신 중간의 진단에서는 이전 행 출력 200개가 모두 살아 있던 상태가 1개로 줄었다. 수명이 짧아지면 GC가 곧 버릴 객체를 복사·승격할 부담도 줄일 수 있다.

이것은 10절의 부모 getter 문제와 다른 수정이다. 10절은 이전 세대가 계속 남는 보유 경로를 고쳤고, 여기서는 한 번의 큰 갱신 도중 불필요하게 길어진 생존 시간을 줄였다.

관련 커밋: `a533dd0`. 코드: [diff.ts](../../src/diff.ts)의 `remakeNewWDom`, [wDom.ts](../../src/wDom.ts)의 `cloneWDom`. 근거: [EDGE_FIX_PERFORMANCE](../benchmark/EDGE_FIX_PERFORMANCE.md).

## 15. WDom 생성 모양을 공통 팩토리로 정리했다

메타데이터를 삭제하지 않는 것에서 한 단계 더 나아간 변경이다. element, text, Fragment, 배열, empty, clone을 서로 다른 객체 리터럴로 만들면 공통 필드를 읽는 코드도 여러 객체 구성을 만나게 된다.

현재 기본 코어는 공통 팩토리 `createWDom()`을 사용한다.

```ts
// 실제 팩토리의 필드 구성
({
  type,
  nr: undefined,
  tag,
  props,
  text,
  children,
  getParent,
  el: undefined,
  oi: undefined,
  oc: undefined,
  op: undefined,
  il: undefined,
  [wdomSymbol]: true,
});
```

핫 경로에서 자주 쓰는 13개 own 필드를 같은 순서로 만든다. 지금 당장 필요 없는 값도 자리는 유지한다. 컴포넌트와 root에서만 쓰는 드문 필드 9개는 모든 노드에 미리 넣지 않는다.

엔진은 객체 구성에 따라 속성 위치를 최적화하고, 접근 지점에서 이전에 보았던 구성을 활용한다. 여러 구성을 계속 만나는 것보다 공통 구성이 적은 편이 유리할 수 있다.

진단용 소스 probe에서 부분 갱신 후 살아 있는 map 그룹은 기존 13개에서 선택한 compact13의 3개로 줄었다. 이 숫자가 inline cache의 상태 수와 같은 뜻은 아니고, 전체 런타임의 모든 객체가 정확히 세 종류라는 뜻도 아니다. 별도의 V8 로그에서도 raw `N` 전이와 wrong-map deopt 기록이 줄어드는 신호를 확인했다.

채택 근거의 중심은 엔진 설명만이 아니라 별도로 측정한 실제 CPU 결과였다.

| 지표                 | compact13의 당시 기준선 대비 변화 |
| -------------------- | --------------------------------: |
| 9항목 가중 전체 시간 |                            −5.89% |
| 가중 JS 시간         |                           −14.42% |
| 1만 행 공식 메모리   |                 +0.6801MB, +2.47% |
| UMD Brotli           |                              +26B |

메모리와 번들 비용을 지불하고 JS 처리 비용을 줄인 선택이다. 모든 필드 22개를 초기화한 별도 후보도 있었지만 1만 행 메모리가 약 14.95% 늘어 기본안으로 선택하지 않았다. 두 후보는 각자 기준선과 별도로 비교했으므로 raw 표본을 합쳐 직접 대결 결과로 만들지는 않는다.

이 변경 이후에는 unused 필드도 own property로 존재할 수 있다. 따라서 WDom 내부를 `Object.keys()`나 `in`으로 관찰하는 코드에는 차이가 보인다. 현재 릴리스 노트에도 이 점을 기록했다.

이 공통 팩토리는 **기본 코어에 적용된 최적화**다. concurrent에도 같은 성능 개선율이 생겼다고 주장할 수 없다.

관련 커밋: `ff8b80a`. 코드: [createWDom.ts](../../src/utils/createWDom.ts), [wDom.ts](../../src/wDom.ts). 근거: [NODE_SHAPE_RESULTS](../benchmark/NODE_SHAPE_RESULTS.md).

## 16. 키가 유일하다고 확인한 목록에서는 Map 생성을 미뤘다

초기 Map 최적화는 반복 `find()`를 없앴지만, 선택이나 부분 갱신에서도 매번 Map을 만들었다. 이전과 다음 목록의 key가 같은 위치에 그대로 있다면 이 작업도 줄일 여지가 있다.

```text
이전: A B C D
새로: A B C D

각 위치의 key가 같고 key가 유일하다면
새 A의 짝은 이전 A라고 바로 알 수 있다.
```

문제는 “유일하다면”이라는 조건이다. 중복 key가 있으면 임의의 위치 매칭이 기존의 “첫 원본을 우선” 규칙과 달라질 수 있다.

현재 기본 코어는 유일성이 확인된 목록을 `WeakSet`에 기록한다. 기록되지 않은 목록은 기존처럼 Map을 먼저 만들며 중복 key도 확인한다. 유일한 원본에서 새 자식들이 모두 서로 다른 원본과 매칭됐다면, 새 목록에도 그 유일성 근거를 이어 줄 수 있다.

다음 diff에서는 같은 위치의 key를 먼저 비교한다. 처음 어긋나는 순간에만 아직 사용하지 않은 원본들로 Map을 만든다.

```text
이전: A B C D E
새로: A B D C E

A ↔ A: 위치로 매칭
B ↔ B: 위치로 매칭
D ↔ C: 불일치 → 남은 원본 C, D, E로 Map 생성
```

앞에서 처리한 A와 B를 다시 diff하지 않으면서 나머지는 key 조회로 이어 간다. 모든 원본이 사용됐다면 미사용 원본을 찾는 `filter()`도 생략한다.

`WeakSet`은 목록을 강하게 보유하지 않는다. 목록이 다른 곳에서 참조되지 않아 회수되면 유일성 기록 때문에 계속 살아 있는 구조를 피할 수 있다. 다만 WeakSet 기록과 조회의 메모리·실행 비용이 0이라는 뜻은 아니다. 최근 변경 묶음의 별도 메모리 측정은 하지 않았다.

경계 조건도 있다. 위치 비교는 `===`를 쓰므로 `NaN` key는 Map 경로로 돌아간다. Map의 key 비교 규칙을 무리하게 `===`로 대체하지 않는다. 또한 reconciliation 도중 기존 노드의 key를 콜백이나 getter로 바꾸는 사용은 지원 범위가 아니다. 식별자를 바꾸려면 새 key를 가진 새 노드를 렌더해야 한다.

이 최적화도 순서를 확인하는 O(n) 방문은 남는다. “목록 전체를 보지 않는다”가 아니라 **전체를 보면서 수행하던 Map 구축과 조회를 흔한 경우에 줄인다.**

관련 커밋: `9bb0fb3`. 코드: [diff.ts](../../src/diff.ts)의 `uniqueKeys`, `diffLoopChildren`. 테스트: [core-keyedPositional.test.tsx](../../src/tests/core-keyedPositional.test.tsx). 근거: [POSITIONAL_KEYS_RESULTS](../benchmark/POSITIONAL_KEYS_RESULTS.md).

## 17. 순서가 그대로인 목록에서는 배치용 배열을 만들기 전에 반환한다

12절의 최적화는 인덱스 배열을 만든 뒤 “순서가 그대로이니 LIS는 필요 없다”고 판단했다. 2026-10-31에는 그보다 앞에서 간단한 검사를 한다.

현재 `updateChildren()` 앞부분은 목록 자식에 추가 `A`나 교체 `S`가 없고, 매칭된 이전 인덱스가 증가하면 바로 각 자식을 현재 위치에서 갱신한다.

```ts
// 읽기 쉽게 풀어 쓴 핵심 조건
let last = -1;
const inOrder = children.every(({ nr, oi }) => {
  if (nr === 'A' || nr === 'S') return false;
  if (oi === undefined) return true;
  const previous = last;
  last = oi;
  return previous < oi;
});

if (inOrder) {
  children.forEach(child => {
    wDomUpdate(child);
    child.oi = undefined;
  });
  return;
}
```

예를 들어 `[0, 2, 3, 5]`처럼 중간 항목이 삭제되어 인덱스가 비연속이어도 남은 항목의 상대 순서는 맞다. 삭제 자체의 처리는 별도 경로에서 하고, 남은 노드들을 다시 배치할 필요는 없다.

이 경로에서는 아래쪽의 `matchedIndexes`, `oiSeq`, `movers`, `created` 배열을 만들지 않는다. 생략하는 것은 배치 준비다. 자식 내용이 바뀌었으면 `wDomUpdate()`는 여전히 실행한다.

순서가 바뀌거나 추가·교체가 있으면 기존 배치 경로로 돌아간다. 따라서 LIS를 없앤 변경이 아니라 **LIS와 배치 준비가 필요 없는 경우를 더 일찍 가려낸 변경**이다.

관련 커밋: `e0c0549`. 코드: [render.ts](../../src/render.ts)의 `updateChildren` 첫 분기. 12절의 10월 15일 변경과 이번 10월 31일 변경은 생략 시점과 범위가 다르다.

## 18. 같은 위치에 같은 가상 노드가 돌아오면 diff 입구에서 반환한다

캐시가 이전 WDom 객체를 그대로 반환하면 그 객체를 다시 자신과 비교할 필요가 없다. 초기에도 후반부에서 변경 없음으로 판정했지만, 그 판정까지 가는 준비 작업은 남아 있었다.

현재 기본 코어의 `makeNewWDomTree()`는 시작하자마자 검사한다.

```ts
if (newWDom === originalWDom && originalWDom.type) {
  originalWDom.nr = 'N';
  return originalWDom;
}
```

같은 위치의 같은 nonempty 노드는 타입 비교와 후속 diff 준비를 통과하지 않는다. 캐시 적중이 많은 목록에서 자주 실행되는 입구를 짧게 만든 것이다.

조건을 정확하게 읽는 것이 중요하다.

- 같은 **key**만으로 반환하지 않는다. 동일한 WDom 객체여야 한다.
- 다른 위치에 재사용한 같은 객체는 위치별 복사 판단이 필요하다.
- `type`이 없는 empty 노드는 기존 삭제 경로로 보낸다.
- 같은 객체 내부를 직접 바꾼 뒤 일반 diff가 변경을 찾아 줄 것이라고 기대할 수 없다.

이 변경 때문에 캐시된 동일 노드의 `children` getter를 다시 읽지 않는다. getter 부작용에 의존하던 코드는 관찰 차이를 볼 수 있고, 이 내용은 1.25.5 릴리스 노트에 기록됐다.

또한 행이 컴포넌트라면 그 출력 캐시에 도달하기 전의 컴포넌트 준비 비용은 남을 수 있다. 이 분기만으로 모든 컴포넌트가 자동 memo되는 것은 아니다.

유사한 동일 객체 조기 반환 후보는 10월 초에도 실험했지만 당시 부분 갱신의 공식 전체 시간이 늘어 되돌렸다. 현재 채택은 그때의 결과를 재활용한 것이 아니다. 이후 코어 상태에서 위치 매칭 등 네 변경을 함께 적용하고 새로 측정해 부분 갱신 개선을 확인했다.

관련 커밋: `b1fc8af`. 코드: [diff.ts](../../src/diff.ts)의 첫 분기. 근거: [과거 미채택 기록](../benchmark/PERFORMANCE_CLOSEOUT.md), [최신 공식 러너 비교](../benchmark/POSITIONAL_KEYS_OFFICIAL_RESULTS.md), [CHANGELOG](../../CHANGELOG.md).

## 19. 커스텀 엘리먼트가 될 수 없는 태그는 DOM 조회를 생략한다

custom element는 정의가 등록되기 전에 렌더될 수 있다. 이때 객체나 boolean prop의 실제 값을 보존했다가 upgrade된 인스턴스에 연결하는 처리가 필요하다.

이를 확인하려고 일반 HTML 속성을 설정할 때도 element의 `localName`을 읽어 이름에 `-`가 있는지 검사했다. 하지만 WDom에는 이미 태그 문자열이 있다.

```ts
const custom = !tag || tag === 'portal' || tag.includes('-');

// ...일반 속성 설정 경로에서...
if (custom && isPendingCustomElement(element)) {
  // upgrade 전 값을 보존하는 처리
}
```

`div`, `tr`, `td`, `span` 같은 태그는 문자열만으로 이 custom element 후보 경로를 제외할 수 있다. 결과적으로 각 속성 설정에서 불필요한 DOM getter 접근을 줄인다.

portal은 예외다. WDom의 tag는 `'portal'`이지만 실제 element는 외부 target이므로 DOM을 계속 확인한다. 태그 정보가 없는 경우도 기존 확인 경로를 유지한다.

현재 코드에서는 새 props 순회 전 후보 여부를 한 번 계산하고, 해당 속성 처리 분기에서 활용한다. 삭제된 prop을 정리하는 모든 custom element 검사까지 없앤 것은 아니다.

이 변경만의 보편적인 화면 개선율은 제시하지 않는다. 다음 절의 공식 수치는 위치 매칭, 배치 준비 생략, 동일 노드 반환, 이 태그 검사 변경을 함께 적용한 결과다.

관련 커밋: `197dcea`. 코드: [render.ts](../../src/render.ts)의 `updateProps`, [predicator.ts](../../src/utils/predicator.ts)의 `isPendingCustomElement`.

## 20. 컴포넌트와 Fragment 목록도 안전하게 한 번에 지운다

초기 일괄 삭제는 element/text가 직접 나열된 목록에서 주로 동작했다. 행이 컴포넌트나 Fragment로 감싸지면 직접 DOM 노드가 아니라 가상 래퍼를 만나 개별 삭제로 돌아갔다.

2026-10-30의 후속 구현은 래퍼 안으로 내려가 실제 삭제할 DOM root들을 순서대로 확인한다.

```text
가상 목록                      부모의 실제 DOM 자식
Component → Fragment → tr A   tr A
Component → Fragment → tr B   tr B
Component → Fragment → tr C   tr C
```

각 root가 `parent.firstChild`부터 이어지는 실제 자식과 **같은 DOM 객체**인지 비교한다. 하나라도 다르면 즉시 일괄 삭제를 포기한다. 끝까지 모두 같고 부모에 남는 자식도 없을 때만 `textContent = ''`를 실행한다.

이 방식은 두 가지를 함께 해결한다.

첫째, 컴포넌트 행 1,000개를 1,000번 `remove()`하는 대신 조건이 맞으면 부모를 한 번 비울 수 있다.

둘째, 자식 수만 같다고 외부 노드를 지우는 문제를 막는다. 외부 코드가 행 하나를 다른 DOM으로 바꿨더라도 개수는 같을 수 있다. 정체성을 비교하면 그 노드가 삭제 대상과 다르다는 것을 알 수 있다.

portal target과 `<html>`은 기존 개별 처리로 돌아간다. unmount 콜백은 이전처럼 DOM 제거 전에 실행한다. “DOM 한 번 삭제”가 “생명주기 정리도 한 번만 실행”을 뜻하지 않는다.

검사 자체도 첫 불일치에서 중단하므로, 긴 목록의 일부를 지우기 위해 남은 형제를 끝까지 확인하는 과거 문제를 피한다.

행마다 컴포넌트와 캐시를 둔 앱에서 전체 삭제 시간은 13.311 → 12.267ms, 약 7.84% 줄었다. JS는 약 10.40% 줄었다. 일반 element 행을 쓰는 공식 A 앱은 이미 일괄 삭제를 사용해서 가중 전체 변화가 −0.09%로 중립이었다.

DOM 호출을 1,000번에서 한 번으로 줄여도 브라우저는 하위 트리 자체를 해체해야 한다. 그래서 1,000배 빨라지지는 않는다. 이 최적화는 반복 호출 비용과 검사 비용을 줄인다.

관련 커밋: `b1ca5e3`. **base와 concurrent에 적용**됐다. 코드: [render.ts](../../src/render.ts)의 `findChildWithRemoveElement`. 테스트: [core-bulkRemoval.test.tsx](../../src/tests/core-bulkRemoval.test.tsx). 근거: [BULK_REMOVAL_V2_RESULTS](../benchmark/BULK_REMOVAL_V2_RESULTS.md).

## 21. 번들 압축에서도 메모리 수명에 필요한 함수 경계를 지켰다

실행 성능을 위해 필드나 빠른 경로를 추가하면 번들이 커질 수 있다. 반대로 코드를 더 작게 만드는 변환이 함수 스코프를 바꾸면, 10절에서 분리한 부모 getter의 환경에도 영향을 줄 수 있다.

현재 기본 코어의 UMD 후처리는 Terser의 전체 compress를 켜지 않고 제한된 구문 변환을 사용한다.

```ts
compress: {
  defaults: false,
  booleans: true,
  lhs_constants: true,
  if_return: true,
  join_vars: true,
}
```

목적은 identifier 축약과 제한된 구문 압축을 적용하면서 함수를 호출 위치로 옮기거나 인라인하는 변환을 피하는 것이다. 더 작은 출력 하나만 보고 메모리 수명에 필요한 구조를 다시 합치지 않도록 했다.

UMD/CJS export 객체의 `Symbol.toStringTag: 'Module'` 표시도 제거했다. named export는 유지되지만 `Object.prototype.toString.call(lithent)`의 관찰 결과는 바뀌므로 릴리스 노트에 기록했다.

당시 동일 코드 기준의 출력 실험에서 구문 4종과 Module 태그 제거를 합친 UMD Brotli 절감은 46B였다. 이후 portal 수정까지 포함한 실제 채택 빌드는 4,819B였다. 최신 1.25.5는 빠른 경로 네 변경을 더해 4,925B다.

여기의 KB는 **minified UMD의 Brotli 크기**다. raw, gzip, ESM 크기를 섞어 “모든 형식이 5KB 미만”이라고 말할 수 없다.

또한 benchmark 앱은 ESM을 사용한다. UMD 후처리로 줄인 바이트를 해당 앱의 CPU 성능 개선으로 계산하지 않는다.

관련 커밋: `866e745`, `de32bd9`. 코드: [vite.config.js](../../vite.config.js), [size-report.js](../../scripts/size-report.js). 근거: [BUNDLE_SIZE_RESULTS](../benchmark/BUNDLE_SIZE_RESULTS.md).

## 22. 최신 최적화 묶음은 얼마나 개선됐나

16~19절의 네 변경은 기본 코어에만 적용됐고, 같은 cached-row 앱에서 1.25.4와 비교했다. 2026-11-02 Mac의 공식 js-framework-benchmark 러너를 사용한 **로컬 비교**다. upstream에 게시된 순위가 아니다.

실행 순서를 뒤집은 두 차수, 총 580표본으로 측정했다. 아래는 각 항목에서 두 차수 표본을 합친 중앙값이다.

| 항목        | 이전 전체 시간 | 이후 전체 시간 | 전체 변화 | JS 변화 |
| ----------- | -------------: | -------------: | --------: | ------: |
| 1천 행 생성 |       26.565ms |       26.206ms |    −1.35% |  −3.80% |
| 1천 행 교체 |       28.878ms |       28.428ms |    −1.56% |  −3.47% |
| 부분 갱신   |       16.227ms |       14.732ms |    −9.21% | −11.06% |
| 행 선택     |        6.501ms |        5.662ms |   −12.91% | −28.85% |
| 행 교환     |       17.351ms |       16.823ms |    −3.04% | −12.26% |
| 1행 삭제    |       12.017ms |       12.014ms |    −0.02% | −10.39% |
| 1만 행 생성 |      272.742ms |      271.659ms |    −0.40% |  −1.70% |
| 1천 행 추가 |       30.413ms |       30.840ms |    +1.40% |  −2.47% |
| 전체 삭제   |       11.232ms |       10.928ms |    −2.71% |  −4.57% |

항목별 중앙값 비율에 결과표의 가중치를 적용한 전체 시간은 **2.59% 감소**, JS는 **6.84% 감소**했다. 평균값으로 집계한 가중 전체 시간도 1.88% 감소했다.

부분 갱신과 선택은 두 실행 순서 모두 개선됐다. 교환과 추가는 실행 순서에 따라 전체 시간 변화 방향이 바뀌었다. 따라서 추가의 +1.40%나 교환의 −3.04%를 안정적인 회귀·개선으로 단정하지 않는다. 1행 삭제의 전체 시간은 거의 같았다.

이 결과는 네 수정의 **결합 효과**다. 각 커밋의 독립적인 공식 개선율을 알아낸 실험은 아니다. 생성 레이아웃의 5.89%, 앱 변경의 13.8%, 이번 2.59%는 기준선과 환경이 다르므로 더하거나 곱해서 누적 개선율을 만들 수 없다.

근거: [POSITIONAL_KEYS_OFFICIAL_RESULTS](../benchmark/POSITIONAL_KEYS_OFFICIAL_RESULTS.md), [전체 표본 JSON](../benchmark/positional-keys-official-results.json), [1.25.5 릴리스 기록](../../CHANGELOG.md).

## 23. 실험했지만 현재 기본 구현에는 넣지 않은 것들

성능 관련 커밋이라고 해서 모두 현재 런타임에 들어간 것은 아니다. 실험 도구와 결과만 보존한 커밋도 많다.

| 실험                            | 줄이려던 작업                                   | 현재 기본 구현에 포함하지 않은 이유 또는 상태                                                          |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 부모 주도 memo                  | props 검사 뒤 컴포넌트 updater와 하위 diff 생략 | 동작은 확인했지만 크기·관리 비용이 있어 기본 채택 보류. `cacheUpdate`와 다른 실험 API다.               |
| 안정적인 event proxy            | inline handler 변경 시 native listener 재등록   | 일부 UI 이득은 있었지만 크기·메모리·native 연동을 함께 고려해 직접 listener 방식으로 복원했다.         |
| DC-25의 첫 같은 순서 keyed 후보 | Map·배치 준비 생략                              | 가중 전체 −0.171%로 안정적인 이득 근거가 부족했고 +268B 비용이 있었다. 최신 위치 매칭 구현과 구분한다. |
| C4 목록 경계와 owner            | 변경된 key의 내용만 방문                        | 별도 프로토타입에서 이득을 확인했으나 공개 API·concurrent·SSR/HMR 등 제품 통합은 미완료다.             |
| C4 key snapshot                 | key 추출과 Map 조회 감소                        | 저장·검사 비용을 포함한 비교에서 가중 전체와 JS가 증가했다.                                            |
| 수동 static/dynamic blueprint   | 정적 하위 트리의 생성·비교 감소                 | 부분 갱신은 개선됐지만 가중 전체는 중립이고 생성·메모리·크기 비용이 늘었다.                            |
| 모든 WDom 필드 22개 초기화      | 더 강한 객체 구성 통일                          | 메모리 증가가 커 공통 13필드 안을 선택했다.                                                            |

특히 event proxy는 실제로 잠시 통합됐다가 복원됐다. 현재 `updateEvent()`는 원래 callback을 `addEventListener`에 직접 등록한다. 과거 proxy의 inline UI 개선율을 현재 구현의 성과로 쓰면 안 된다.

반대로 과거에 비슷한 아이디어가 미채택이었다고 해서 최신 구현까지 미채택인 것도 아니다. 같은 객체 반환, 순서 확인, 일괄 삭제는 구현과 기준선, 새로운 측정 근거에 따라 다시 평가됐다. 이름이 비슷한 실험보다 **현재 소스와 최종 결정**을 함께 확인해야 한다.

근거: [PARENT_MEMO_RESULTS](../benchmark/PARENT_MEMO_RESULTS.md), [NATIVE_EVENTS_RESULTS](../benchmark/NATIVE_EVENTS_RESULTS.md), [DC25_KEYED_FAST_PATH_RESULTS](../benchmark/DC25_KEYED_FAST_PATH_RESULTS.md), [C4_OWNER_RESULTS](../benchmark/C4_OWNER_RESULTS.md), [C4_KEY_SNAPSHOT_RESULTS](../benchmark/C4_KEY_SNAPSHOT_RESULTS.md), [STATIC_DYNAMIC_RESULTS](../benchmark/STATIC_DYNAMIC_RESULTS.md).

## 24. 숫자를 읽을 때 처리량·화면 시간·메모리를 구분해야 한다

이 작업에서 측정은 여러 목적에 사용됐다. 서로 다른 숫자를 같은 개선율로 취급하면 잘못된 결론에 도달한다.

| 측정                          | 알려 주는 것                               | 곧바로 알 수 없는 것                     |
| ----------------------------- | ------------------------------------------ | ---------------------------------------- |
| jsdom 벤치마크                | 특정 구현과 알고리즘의 비용 변화           | 실제 브라우저 화면 시간                  |
| DOM 호출 카운터               | 생성·삽입·삭제 호출 횟수                   | 호출마다 드는 시간과 paint 비용          |
| callgrind 명령어 수           | 통제한 실행에서 프레임워크 작업량          | 실제 브라우저의 체감 개선율              |
| 클릭→렌더 마이크로태스크 완료 | 진단 앱의 스크립트 처리 시간               | 이후 스타일·레이아웃·화면 반영 완료 시간 |
| 공식 러너 전체 시간           | 러너가 정의한 클릭→렌더링 commit 측정 구간 | 공개 upstream 순위, 다른 기기에서의 보장 |
| GC 후 JS heap                 | 그 시점에 남은 JavaScript 메모리           | 전체 프로세스·브라우저 메모리            |
| 공식 UASM 메모리              | 공식 메모리 경로가 보고한 사용량           | JS heap만의 수치                         |

개념적으로 화면 처리에는 JS 작업, 브라우저 렌더링, 대기 등이 들어간다. 다만 보고서의 전체·JS·paint 중앙값은 각 분포에서 따로 구하므로 표의 중앙값들을 더해서 전체 시간을 재구성하면 안 된다.

프레임 대기도 실제로 해석을 어렵게 했다. 일부 select 측정은 앱의 JS보다 러너의 강제 GC가 끝나는 시점과 60Hz BeginFrame 위상에 영향을 받았다. 삭제 경로 변경인데 select만 느려진 결과가 나왔다면, 삭제 코드가 select의 CPU를 늘렸다고 곧바로 결론 내릴 수 없다. [프레임 대기 분석](../benchmark/SELECT_VSYNC_PHASE.md)은 trace에서 active와 wait를 구분해 이 문제를 확인한 기록이다.

개선이 작을수록 같은 앱과 helper를 고정하고, 코어만 바꾸고, 실행 순서를 뒤집고, 브라우저 버전과 실제 번들 해시를 남기는 일이 중요했다. 이전 실험 중에는 두 차수 사이 Chrome이 자동 업데이트되어 표본을 합치지 않은 경우도 있다.

현재 기록으로는 LIS 도입 전부터 1.25.5까지 같은 환경에서 한 번에 재측정한 누적 개선율은 제시할 수 없다. 대신 각 변경이 줄인 작업과 해당 변경을 평가한 비교 결과를 연결할 수 있다.

## 25. 별도의 성능 작업: concurrent는 입력 반응성을 다룬다

LIS 이후에는 `lithent-concurrent`도 만들어졌다. 이것은 기본 코어의 모든 작업을 더 적은 시간에 끝내는 최적화와는 평가 기준이 다르다.

큰 목록을 갱신하는 동안 메인 스레드를 오래 점유하면 키 입력을 처리하기 어렵다. concurrent는 낮은 우선순위의 build를 중단·재개하고, 뒤의 입력이 앞의 오래된 build를 대체할 수 있게 한다. 무거운 목록의 작업 사이에 긴급 입력을 처리할 기회를 주는 것이다.

기록된 2026-10-02 입력 지연 실험에서는 1만 행에서 입력 이벤트부터 다음 paint까지 p50이 base 275ms, concurrent `deferRender` 35ms였다. 입력과 목록을 서로 다른 컴포넌트에 두고, 목록만 미룬 조건이다.

하지만 commit은 원자적으로 실행되고, 총작업량이 자동으로 줄어드는 것도 아니다. 동기 갱신은 오히려 추가 관리 비용이 있을 수 있다. 따라서 이 숫자를 “1만 행 렌더링 시간이 275ms에서 35ms로 감소했다”라고 쓰면 안 된다. 측정한 것은 **입력 지연**이다.

이 글의 기본 코어 처리량 개선과는 별도의 글로 build/commit, 스케줄러, 중단 가능한 순회를 다룰 만한 주제다. 자세한 조건과 한계는 [concurrent README](../../lithentConcurrent/README.md), [설계](../concurrent-rendering/DESIGN.md), [입력 지연 원본](../concurrent-rendering/bench/input-latency-results.json)에 있다.

## 26. 실제 코드를 공부할 때 따라갈 순서

처음부터 모든 파일을 읽기보다, 하나의 사용자 동작이 어떤 경로를 지나는지 따라가면 이해하기 쉽다.

1. **행 선택:** `cacheUpdate` → `makeNewWDomTree`의 동일 객체 반환 → `diffLoopChildren`의 위치 매칭 → `updateChildren`의 순서 유지 경로를 연결한다. “DOM을 안 옮긴다”와 “행을 아예 방문하지 않는다”가 어떻게 다른지 확인한다.
2. **두 행 교환:** `oi` 수열을 적고 `getLisPositions`가 어떤 위치를 반환하는지 손으로 계산한다. `moving`이 왜 내용 갱신 전에 필요하고 배치는 왜 역순인지 확인한다.
3. **새 행 추가:** 이전 노드가 없을 때 타입 비교를 건너뛰는 조건부터 `wDomToDom`, 끝의 연속 신규 항목 삽입 경로까지 따라간다.
4. **컴포넌트 자체 renew:** `bindRedraw`가 어느 WDom을 잡는지, `replaceWDom`의 `il` 검사와 `T: typeUpdate`가 무슨 중복 작업을 막는지 확인한다.
5. **전체 삭제:** unmount 실행 → Fragment/component root 탐색 → 실제 DOM 정체성 비교 → 일괄 삭제 또는 개별 삭제를 따라간다.
6. **반복 갱신의 메모리:** `makeParentGetter`가 생성되는 스코프와 은퇴 컴포넌트의 `children` 연결을 그려 본다. “변수에 남아 있다”보다 “현재 root에서 어떤 경로로 도달 가능한가”를 생각한다.

커밋을 확인할 때는 현재 파일과 함께 변경 전후 diff를 보면 좋다.

```sh
git show 7f14950 -- src/diff.ts src/render.ts src/wDom.ts src/utils/redraw.ts
git show 183fec7 -- src/utils/index.ts src/diff.ts
git show a533dd0 -- src/diff.ts src/render.ts
git show ff8b80a -- src/utils/createWDom.ts src/wDom.ts
git show b1ca5e3 -- src/render.ts
git show 9bb0fb3 -- src/diff.ts
git show e0c0549 -- src/render.ts
git show b1fc8af -- src/diff.ts
git show 197dcea -- src/render.ts
```

정확성 회귀의 예제는 [updatePaths](../../src/tests/core-updatePaths.test.tsx), [cachedIdentity](../../src/tests/core-cachedIdentity.test.tsx), [keyedPositional](../../src/tests/core-keyedPositional.test.tsx), [bulkRemoval](../../src/tests/core-bulkRemoval.test.tsx), [renderMatrix](../../src/tests/core-renderMatrix.test.ts), [renderFuzz](../../src/tests/core-renderFuzz.test.ts)에 있다. 단순히 빨라진 코드를 보는 것보다 어떤 동작을 유지해야 했는지 함께 읽으면 각 조건문의 이유가 드러난다.

LIS 다음의 작업은 한 번 더 복잡한 알고리즘을 넣는 과정만은 아니었다. 반복해서 만들던 정보를 재사용하고, 결론이 난 검사를 일찍 끝내고, 필요 없는 참조를 놓고, 자주 실행되는 경로에서 할당과 준비 작업을 덜어 냈다. 성능 개선의 이유를 이해하려면 각 변경에서 **무슨 작업이 사라졌고, 그 작업을 생략할 수 있는 조건이 무엇인지**를 함께 읽어야 한다.

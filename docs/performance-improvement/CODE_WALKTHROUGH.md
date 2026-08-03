# CODE_WALKTHROUGH — diff.ts / render.ts 변경 상세 해설

- 기준: `e19ff29`(작업 전) → `cb0d26c`(현재), 브랜치 `feat/alterSpeed`
- 대상 독자: 이 브랜치의 코드 변경을 리뷰하거나 이어받을 사람
- 관련 문서: [BOTTLENECK_ANALYSIS.md](./BOTTLENECK_ANALYSIS.md)(왜 느렸나),
  [DESIGN.md](./DESIGN.md)(설계 결정), [IMPLEMENT.md](./IMPLEMENT.md)(측정 기록)

---

## 1. 한 장 요약

기존 keyed 리스트 처리에는 O(n²) 경로가 4개 있었다.

| 병목 | 위치(변경 전) | 증상 (10k행, jsdom) |
|---|---|---|
| 키 매칭이 `find`+`splice` 선형 탐색 | `diff.ts` `findSameKeyOriginalItem` | replace 879ms@4k |
| 순서 판정이 3중 중첩 순회 | `diff.ts` `chkDiffLoopOrder` | 부분갱신 700ms |
| 순서가 어긋나면 **전 행을 DOM에서 재삽입** | `render.ts` `typeSortedUpdate`(T 경로) | swap 2,719ms |
| 삽입 위치를 형제 전체 스캔으로 탐색 | `render.ts` `startFindNextBrotherElement` | append 3,031ms |

이번 변경의 골자는 **역할 재배치**다:

```
[변경 전]
diff 단계:   자식마다 선형 탐색으로 짝 찾기 (O(n²))
             리스트 순서가 같은지 별도로 3중 순회 검사 (O(n²)) → 'L' 마킹
render 단계: 'L'이면 제자리 갱신, 아니면 전 행 재삽입 (행마다 O(n) 앵커 탐색)

[변경 후]
diff 단계:   Map으로 짝 찾기 (O(n)) + 각 자식에 "이전 인덱스(oi)"만 기록
render 단계: updateChildren이 oi 수열로 LIS를 구해 (O(n log n))
             "제자리에 둘 자식"과 "이동할 자식"을 판별,
             이동/신규만 앵커 하나를 굴리며 역순으로 insertBefore (O(n))
```

순서 판정('L')과 이동 실행이 별개였던 구조를, "이동 최소화"라는 하나의 문제로
합쳐서 render 쪽 `updateChildren`에 몰아넣은 것이 핵심이다.
그 결과 `chkDiffLoopOrder`, `findSameKeyOriginalItem`, `'L'` RenderType이 통째로 사라졌다.

---

## 2. 새 파이프라인: diff와 render가 주고받는 것

diff와 render를 잇는 매개는 wDom 노드에 붙는 short-key 메타데이터다.
이번에 `oi` 하나가 추가됐다 (`types/index.ts`):

```ts
nr?: RenderType; // needRerender — 기존: A/D/R/U/S/T/N ('L'은 삭제됨)
oi?: number;     // originalIndex — [신규] keyed 매칭된 자식의 "이전 리스트에서의 위치"
```

흐름 전체:

```
renew()
  └─ makeNewWDomTree (diff.ts)
       └─ 리스트('l') 자식이 keyed면 diffLoopChildren
            ├─ 이전 자식들로 Map<key, index> 구축        …… O(n)
            ├─ 새 자식마다 Map 조회로 짝 찾기             …… O(1)씩
            ├─ 짝이 있으면 child.oi = 이전 인덱스 기록
            └─ 짝이 안 된 이전 자식들 → typeDeleteUnused (unmount/이벤트해제/DOM제거)
  └─ wDomUpdate (render.ts)
       └─ typeUpdate → updateChildren
            ├─ [판별] 자식 중 A/T/S 또는 oi 보유가 있나? 없으면 기존 그대로
            ├─ [콘텐츠 패스: 왼→오] T는 내용만 갱신, A/S는 엘리먼트 생성만(삽입 보류)
            ├─ [LIS] oi 수열의 최장 증가 부분 수열 = "제자리에 두어도 되는 자식들"
            ├─ [꼬리 fast-append] 끝에 연속된 신규 run은 순서대로 바로 삽입
            ├─ [배치 패스: 오→왼] 신규 + LIS 밖 자식만 anchor 앞에 insertBefore
            └─ [정리] oi/nr/oc/op 일괄 삭제, mount 콜백 일괄 실행
```

---

## 3. diff.ts 변경 상세

### 3.1 `diffLoopChildren` — 키 매칭 Map화 + oi 기록 (핵심)

**변경 전** — 새 자식마다 남은 이전 자식 배열을 `find`로 선형 탐색하고,
쓴 항목은 `splice`로 제거(배열 전체 shift 발생):

```ts
const origCh = [...(originalWDom.children || [])];
const remaked = (newWDom.children || []).map(item => {
  const orig = findSameKeyOriginalItem(item, origCh);   // O(n) 탐색
  const child = makeNewWDomTree(item, orig);
  if (orig) origCh.splice(origCh.indexOf(orig), 1);     // O(n) + O(n)
  child.getParent = () => newWDom;                      // 자식마다 클로저 할당
  return child;
});
return [remaked, origCh];  // 남은 것 = 삭제 대상
```

n개 자식 × 자식당 O(n) = **O(n²)**. replace-all(키 전부 miss)에서는 매번
전체를 헛스캔하고, 부분갱신(키 전부 hit)에서도 `splice(0,1)`이 매번 배열을
통째로 밀어서 O(n²)였다.

**변경 후** — 이전 자식들로 `Map<key, index>`를 한 번 만들고 O(1) 조회.
제거는 `keyMap.delete`(O(1))로 대체. 짝이 된 자식에는 `oi`(이전 인덱스)를 기록:

```ts
const origChildren = originalWDom.children || [];
const keyMap = new Map<unknown, number>();
origChildren.forEach((item, index) => {
  const key = getKey(item);
  if (!keyMap.has(key)) keyMap.set(key, index);   // 중복 key는 첫 등장만
});

const getParent = () => newWDom;                  // 클로저는 부모당 1개 공유
const remaked = (newWDom.children || []).map(item => {
  const origIndex = keyMap.get(getKey(item));
  const matched = origIndex !== undefined;
  if (matched) keyMap.delete(key);

  const child = makeNewWDomTree(item, matched ? origChildren[origIndex] : undefined);
  if (matched) child.oi = origIndex;              // ★ render의 LIS 입력
  child.getParent = getParent;
  return child;
});

return [remaked, [...keyMap.values()].map(index => origChildren[index])];
// Map에 남은 인덱스들 = 짝이 안 된(삭제될) 이전 자식들
```

주의할 동작 차이 하나: **중복 key**. 기존은 "남은 것 중 첫 매칭"이라 같은
key 2개가 각각 짝을 찾을 수 있었지만, Map은 첫 등장만 유지하므로 두 번째
중복은 삭제+재생성된다. 중복 key는 원래 금지된 사용이므로 허용 처리했다.

### 3.2 `chkDiffLoopOrder` 삭제 + `'L'` RenderType 폐기

**변경 전** — keyed 리스트가 갱신될 때마다 "공통 key들의 상대 순서가
같은가"를 검사했다. `filter` 안에 `find`가 중첩된 형태 ×2 + `every`:

```ts
const newChildren = [...].filter(item =>
  origChildren.find(newItem => getKey(item) === getKey(newItem)));  // O(n²)
const filteredChildren = origChildren.filter(item =>
  newChildren.find(newItem => getKey(item) === getKey(newItem)));   // O(n²)
isSame = filteredChildren.every((item, i) => getKey(item) === getKey(newChildren[i]));
```

순서가 같으면 리스트에 `'L'`을 마킹하고, render의 T 경로가 `parent.nr === 'L'`
이면 재삽입을 생략했다. 즉 **"전부 제자리" 아니면 "전부 재삽입"의 이분법**이었고,
swap처럼 딱 2개만 어긋나도 전 행이 재삽입됐다.

**변경 후** — 함수와 `'L'` 마킹 블록을 통째로 삭제:

```ts
return isSameType ? (isKeyChecked ? 'T' : 'U') : isKeyChecked ? 'S' : 'R';
```

"순서가 같은가?"라는 질문 자체가 필요 없어졌다. render의 LIS가
"순서가 같으면 이동 0개"라는 답을 자연스럽게 내놓기 때문이다
(oi 수열이 이미 증가 수열이면 전부 LIS에 포함 → 아무도 안 움직임).
`'L'`은 부여처가 사라졌으므로 타입 정의·핸들러 맵·render의 분기까지
연쇄적으로 제거했다 (§4.4).

### 3.3 `remakeChildrenForAdd` / `remakeChildrenForUpdate` — 클로저 공유

**변경 전**은 자식마다 `assign(child, { getParent: () => newWDom })`로
클로저 + 임시 객체를 새로 만들었다. 10k행 × 행당 노드 ~7개면 렌더 한 번에
클로저 수만 개다. **변경 후**는 부모당 클로저 1개를 만들어 자식들이 공유하고,
`assign` 호출 대신 프로퍼티 직접 대입으로 바꿨다:

```ts
const getParent = () => newWDom;   // 1회 생성
return (newWDom.children || []).map(item => {
  const child = makeNewWDomTree(item);
  child.getParent = getParent;     // 참조 공유
  return child;
});
```

`getParent()` 함수 인터페이스는 그대로라 호출부 변경이 없다 (DESIGN DC-2).
같은 패턴이 `wDom.ts`의 `remakeChildren`(h() 단계)에도 적용됐다.

### 3.4 unused 자식 정리를 `typeDeleteUnused`로 위임

기존에 diff 안에 인라인으로 있던 unmount → 이벤트 해제 → DOM 제거 3단계를
render.ts의 `typeDeleteUnused`로 옮겼다. 실행 내용과 순서는 동일하다.
(render로 옮긴 이유: DOM 제거 로직과 같은 파일에 두고, §4.5의 bulk 삭제와
결합할 여지를 남기기 위해서다.)

---

## 4. render.ts 변경 상세

### 4.1 `updateChildren` — 신규, 이번 변경의 심장

기존 `typeUpdate`는 자식을 그냥 순회했다:

```ts
(newWDom.children || []).forEach(childItem => wDomUpdate(childItem));
```

그러면 자식마다 render 핸들러가 **독립적으로** 실행된다. `A`(추가)는
자기 삽입 위치를 스스로 찾고(형제 전체 스캔 O(n) → 전체 O(n²)),
`T`(keyed 갱신)는 부모가 `'L'`이 아니면 무조건 자기를 재삽입했다.

새 `updateChildren`은 리스트 부모의 자식 배치를 **한 곳에서 전역으로** 결정한다.
5단계로 나눠 읽으면 된다:

**(1) 판별** — 배치가 필요 없는 평범한 경우는 기존 경로 그대로:

```ts
if (newWDom.type === 'l') {
  for (const item of children) {
    if ('ATS'.includes(item.nr as string) || item.oi !== undefined) {
      needPlace = true;
      break;
    }
  }
}
if (!needPlace) {
  children.forEach(childItem => wDomUpdate(childItem));  // 기존과 동일
  return;
}
```

리스트가 아니거나(fragment/element 부모), keyed 변화가 전혀 없으면
이 함수는 아무것도 새로 하지 않는다. **비 keyed 경로의 동작은 그대로**다.

**(2) 콘텐츠 패스 (왼→오)** — 라이프사이클 순서를 지키는 구간:

```ts
children.forEach((item, index) => {
  const nr = item.nr;
  if (nr === 'A' || nr === 'S') {
    if (nr === 'S') typeDelete(item);       // S = 같은 key인데 타입이 바뀜: 옛것 제거
    created[index] = wDomToDom(item);       // 엘리먼트 "생성만" — 삽입은 나중에
    createdCount++;
  } else if (nr === 'T') {
    typeUpdate(item);                       // 내용만 갱신 — 재삽입 없음 (★)
  } else {
    wDomUpdate(item);                       // U/R/D/N 등은 기존 핸들러 그대로
  }
  if (item.oi !== undefined && created[index] === undefined) {
    matchedIndexes.push(index);             // LIS 입력 수집
    oiSeq.push(item.oi);
  }
});
```

★가 기존과의 결정적 차이다. 예전 T 경로(`typeSortedUpdate`)는
"갱신 + 재삽입"이 한 몸이었는데, 여기서는 갱신만 하고 **이동 여부는
다음 단계의 LIS가 결정**한다. 왼→오 순회라서 update 콜백 순서가 기존과 같고,
신규 노드의 mount 콜백도 생성 시점에 왼→오로 큐잉된다.

**(3) LIS — 제자리에 둘 자식 선별**:

```ts
const stay = new Set(getLisPositions(oiSeq).map(pos => matchedIndexes[pos]));
```

`oiSeq`는 "새 순서로 나열했을 때 각 자식의 옛 위치" 수열이다.
이 수열의 **최장 증가 부분 수열(LIS)에 속한 자식들은 상대 순서가 이미
맞으므로 건드리지 않아도 된다**. 나머지만 이동하면 이동 횟수가 최소가 된다.

예: `[1,2,3,4,5]` → `[1,4,3,2,5]` (2와 4를 swap)
- oiSeq = `[0, 3, 2, 1, 4]` (새 위치별 옛 인덱스)
- LIS = `0, 2, 4` 또는 `0, 1, 4` (길이 3) → 예컨대 {1, 3, 5}는 제자리
- 이동은 4와 2, **딱 2개**. 기존 코드는 5개 전부 재삽입했다.

**(4) 꼬리 fast-append** — 가장 흔한 패턴(끝에 추가) 전용 지름길:

```ts
let tail = children.length;
while (tail > 0 && created[tail - 1] !== undefined) tail--;   // 끝의 연속 신규 run

for (let i = tail; i < children.length; i++) {
  const el = created[i];
  if (el && parentEl && children[i].tag !== 'portal') {
    parentEl.insertBefore(el, baseAnchor || null);   // null이면 appendChild와 동일
  }
}
```

`baseAnchor`는 "리스트 전체의 다음 형제 엘리먼트"다
(`<ul>{list}<li class="tail">` 같은 구조에서 `.tail`). 이것이 없으면 순수
append이고, 있으면 그 앞에 왼→오로 차례로 insertBefore 하면 순서가 맞는다.
이 run을 역순 배치 패스에서 빼는 이유는 두 가지다:
① 뒤에서부터 insertBefore를 걸면 jsdom에서 참조 노드의 인덱스를 매번
재계산해 O(위치)가 되는 측정 왜곡이 있고(실브라우저에서도 append가 더 싸다),
② append는 앵커 계산 자체가 필요 없다.

**(5) 배치 패스 (오→왼)** — 이동/신규 최소 삽입:

```ts
if (stay.size !== matchedIndexes.length ||          // 이동할 게 있거나
    createdCount > children.length - tail) {        // 꼬리 밖 신규가 있으면
  let anchor = findChildFragmentNextElement(children.slice(tail)) || baseAnchor;

  for (let i = tail - 1; i >= 0; i--) {
    const item = children[i];
    const isNew = created[i] !== undefined;
    const needMove = item.oi !== undefined && !isNew && !stay.has(i);

    if ((isNew || needMove) && parentEl && item.tag !== 'portal') {
      const el = isNew ? created[i] : getElementFromFragment(item);
      if (el) parentEl.insertBefore(el, anchor || null);
    }

    const first = findChildFragmentNextElement([item]);   // 이 자식의 첫 실제 el
    if (first) anchor = first;                            // 다음(왼쪽) 자식의 앵커가 됨
  }
}
```

오른쪽 끝에서 왼쪽으로 가며 `anchor`(= 지금 위치 기준 "내 오른쪽에 와야 할
첫 실제 엘리먼트")를 갱신한다. 각 자식은:
- **LIS에 속하면** 아무것도 안 하고 자기 el을 anchor로 넘겨준다.
- **이동 대상이면** `insertBefore(el, anchor)` 한 번으로 최종 위치에 꽂힌다.
- **신규면** 콘텐츠 패스에서 만들어둔 el을 같은 방식으로 꽂는다.
- Fragment 자식은 `getElementFromFragment`가 하위 실제 el들을 모아 이동시킨다.

역순이어야 하는 이유: 자식 i의 올바른 앵커는 "i+1 이후 자식들의 **최종**
위치"인데, 오→왼으로 진행하면 오른쪽은 항상 이미 확정돼 있다.

마지막으로 정리:

```ts
children.forEach(clearDiffMeta);   // oi/nr/oc/op 일괄 삭제
execMountedQueue();                // 신규 노드 mount 콜백 일괄 실행 (순서는 왼→오)
```

mount 콜백이 "삽입마다 즉시"에서 "전부 삽입 후 일괄"로 바뀌었다.
순서(왼→오)는 유지되며, 콜백 시점엔 형제가 모두 DOM에 있으므로
오히려 더 일관적이다. (`core-loopLifecycleOrder.tsx`가 이 순서를 고정)

### 4.2 `getLisPositions` — 신규 유틸

이진 탐색 기반 표준 LIS, O(n log n). `seq`에서 LIS를 이루는 **위치들**을 반환한다.

```
seq:      [0, 3, 2, 1, 4]
반환:     [0, 2, 4]        (값 0 < 2 < 4 — 하나의 유효한 LIS 위치 집합)
```

- `result`: "길이 k인 증가 수열의 최소 꼬리"가 있는 위치들 (이진 탐색 대상)
- `prev`: 역추적용 — 각 위치가 어느 위치 뒤에 붙었는지
- 말미의 `while (i--)` 루프가 `prev`를 따라 실제 LIS 위치를 복원

증가 수열이 이어지는 동안은 이진 탐색 없이 바로 push하는 fast path가 있어서,
정순 유지 케이스(부분갱신/append)는 사실상 O(n)으로 흐른다.

### 4.3 `typeSortedUpdate` / `typeAdd` — 'L' 분기 소멸로 단순화

`'L'`이 사라지면서 두 함수의 분기가 죽은 코드가 됐다:

```ts
// typeSortedUpdate: before — parent.nr !== 'L' 검사가 재삽입 여부를 갈랐음
// after — 항상 재삽입 (updateChildren이 T를 가로채므로, 여기로 오는 건
//         "리스트 자식 컴포넌트가 단독으로 renew된 경우"뿐이며 기존과 동일 동작)
const typeSortedUpdate = (newWDom: WDom) => {
  typeUpdate(newWDom);
  if (getParent(newWDom) || newWDom.isRoot) {
    typeAdd(newWDom, getElementFromFragment(newWDom));
  }
};
```

주의: `renderHandlers.T → typeSortedUpdate`는 여전히 살아 있다.
keyed 리스트 안의 컴포넌트 하나가 **자기 renew()로 단독 갱신**되면 diff 루트가
그 컴포넌트라서 updateChildren을 거치지 않고 T로 직행하는데, 이 경로는
변경 전에도 재삽입이었고 지금도 같다.

`typeAdd`는 앵커 삼항이 `insertBefore(el, nextEl || null)` 한 줄로 줄었다
(DOM 스펙상 참조가 null이면 append와 동일).

### 4.4 `findChildWithRemoveElement` — clear 일괄 삭제 (DC-4)

리스트 전체가 삭제될 때(전형적으로 clear rows) 타는 경로다.
빈 새 리스트는 keyed 경로 진입 조건(첫 자식 key 존재)을 못 넘기 때문에
리스트 노드 자체가 `R`(replace)로 판정되고, 옛 자식들(`oc`)이 여기서 지워진다.

**변경 전**: 행마다 `el.remove()` — 10k번의 개별 DOM 제거.
**변경 후**: 부모가 정확히 이 자식들만 담고 있으면 `parent.textContent = ''` 한 방:

```ts
let count = 0;
for (let node = parent.firstChild; node; node = node.nextSibling) count++;
// ⚠ parent.childNodes.length를 쓰면 안 됨: jsdom은 live NodeList를 만들어
//   이후 그 부모의 모든 삽입/삭제에 갱신 비용을 물린다 (벤치 3~10배 오염)

if (items.length > 1 && count === items.length &&
    items.every(item => /* 전부 element/text이고 HTML/portal 아님 */)) {
  parent.textContent = '';
  items.forEach(item => delete item.el);
  return;
}
// 조건 미충족 시 기존 per-item 루프 그대로 (동작 보존)
```

안전조건이 핵심이다: **부모의 실제 자식 수 == 삭제 대상 수**여야만 발동한다.
리스트 옆에 다른 형제가 있으면(count 불일치) 기존 경로로 떨어진다.
unmount 콜백/이벤트 해제는 이 함수에 오기 전에 기존 순서대로 이미 끝나 있다.

### 4.5 `wDomChildrenToDom` — 중간 DocumentFragment 제거

**변경 전**: 부모 노드마다 `DF()`를 만들어 자식들을 모았다가 부모에 붙였다.
10k행 create면 부모 수만큼(~4만 개) DocumentFragment가 생성·폐기된다.
**변경 후**: 이 함수는 초기 서브트리 구성 중에만 불리고 그 시점의 부모는
아직 문서 밖이므로, 자식을 부모에 **직접 append**해도 결과가 같다:

```ts
children.forEach((childItem: WDom) => {
  if (childItem.type) {
    const childElement = wDomToDom(childItem, isHydration);
    if (childItem.tag !== 'portal' && !isHydration && parentElement) {
      parentElement.appendChild(childElement);
    }
  }
});
```

create 10k가 433→~300ms로 내려간 주 요인 (GC 압박 감소).

### 4.6 `updateProps` / `removeEvent` / `updateStyle` — 상수비용 절감

핫루프에서 반복되던 세 가지 비용을 제거했다. 로직 분기는 동일하다.

| before | after | 이유 |
|---|---|---|
| `entries(props).forEach(([k,v]) => …)` | `for (const k in props)` | prop마다 `[k,v]` 배열 할당 제거 |
| `dataKey.match(/^on/)` (×3곳) | `dataKey[0]==='o' && dataKey[1]==='n'` | 정규식 매칭 → 문자 비교 |
| `keys(originalProps).forEach(...)` | `for (const k in originalProps)` | 배열 생성 제거 |

하나 지워진 비교가 있다: `if (dataKey === 'key' || dataValue === originalProps[dataKey])`
→ `if (dataKey === 'key')`. 뒤 조건은 **루프 첫머리에서 이미 같으면 `continue`로
빠졌고 그 사이에 값을 바꾸는 코드가 없어** 항상 false인 죽은 조건이었다.
("값이 같으면 스킵" 동작은 루프 첫머리에 그대로 있다.)

`wDomUpdate` 말미의 `delete nr/oc/op` 3연발은 `clearDiffMeta` 헬퍼 재사용으로 교체.

### 4.7 `typeDeleteUnused` — diff에서 넘어온 정리 루틴

```ts
export const typeDeleteUnused = (items: WDom[]) => {
  items.forEach(item => {
    runUnmountQueueFromWDom(item);   // 1. unmount 콜백
    recursiveRemoveEvent(item);      // 2. 이벤트 해제
    typeDelete(item);                // 3. DOM 제거
  });
};
```

diff.ts에 인라인으로 있던 것을 옮겼을 뿐, 항목당 실행 순서는 동일하다.

---

## 5. 함께 바뀐 보조 파일 (요약)

| 파일 | 변경 | 이유 |
|---|---|---|
| `types/index.ts` | `oi?: number` 추가, `'L'` RenderType 삭제 | §2, §3.2 |
| `wDom.ts` `remakeChildren` | getParent 클로저 부모당 1개 공유 | §3.3과 동일 패턴 (h() 단계) |
| `predicator.ts` `checkVirtualType` | `['f','l'].includes(type)` → `type==='f'\|\|type==='l'` | 호출마다 배열 할당 제거 (최다 빈도 호출부) |
| `predicator.ts` `hasAccessorMethods` | `getOwnPropertyDescriptor` 결과를 `nodeName+'\|'+key`로 캐시 | create 경로에서 attr마다 프로토타입 조회하던 것 제거. HTML nodeName은 대문자·SVG는 소문자라 키 충돌 없음 |

---

## 6. 성능 결과와 동작 차이

### 결과 (10k행, jsdom — IMPLEMENT.md에 단계별 기록)

| 시나리오 | before | after |
|---|---:|---:|
| swap 2행 | 2,719ms | ~83ms |
| append 1,000행 | 3,031ms | ~94ms |
| partial update (1/10) | 700ms | ~96ms |
| create 10k | 414ms | ~301ms |
| clear 10k | 90ms | ~65ms(정상상태) |
| min 번들 | gzip 4,510 / br 4,169B | gzip 5,133(+623) / br 4,734B(+565) |

### 의도된 동작 차이 (최종 DOM·API·콜백 순서는 동일)

1. **재정렬 시 이동하지 않는 행은 DOM에서 떼어지지 않는다** — 포커스·CSS
   트랜지션·iframe 상태가 보존된다 (기존엔 전 행 재삽입으로 전부 리셋).
2. **여러 행 추가 시 mount 콜백이 "전부 삽입 후 일괄" 실행** — 순서는 왼→오 유지.
3. **중복 key**는 첫 등장만 매칭 (금지된 사용, §3.1).
4. clear가 개별 제거 대신 일괄 제거라 MutationObserver 기록 단위가 다름 (외부 관찰자 한정).

### 회귀 안전망

- `src/tests/core-loopMoveOrder.tsx` — swap/역순/셔플/append/중간삽입/clear/재충전
  8케이스, 전 케이스에 "리스트 경계 형제 침범" 검증 포함
- `src/tests/core-loopLifecycleOrder.tsx` — mount 순서(초기·삽입), 이동 시 재마운트
  없음, unmount 순서 4케이스
- `docs/performance-improvement/bench/verify-order.mjs` — 무작위 셔플 포함 18케이스
- 기존 전체 스위트 195테스트 통과

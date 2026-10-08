# 성능 수정의 호환성 검토 — 2026-10-08

성능 작업의 종료 체크포인트 `4356120`에서 props 동기화의 회귀와 오래 살아 있는 portal 호스트의
리스너 누적을 실제 브라우저에서 재현했다. **후속 수정으로 두 문제를 해결했다.**
제거된 일반 DOM의 리스너를 남기는 정책은 유지한다.

사용자는 기존과 동작이 달라도 사용성·성능상 옳은 변경은 유지하겠다는 기준을 명확히 했다.
따라서 이전과 다른 결과가 있다는 사실만으로 변경을 되돌리지 않는다. 아래의 props 문제는
현재 입력과 맞지 않는 이전 값이 남는 오류이고, portal 문제는 살아 있는 외부 호스트에
핸들러가 누적되는 오류다. 일반 DOM을 버릴 때 리스너를 따로 해제하지 않는 정책과 구분한다.

초기 요청은 배포 전 위험성 확인이었고, 이후 사용자가 실제 props 오류와 이벤트 누적을 수정하도록
요청했다. 아래 초기 검토의 “현재”는 성능 종료본 `4356120`을 가리킨다. 초기 재현 결과와 후속
수정 결과는 별도 파일로 보존한다. 패키지 버전은 올리지 않았으며 커밋·푸시·배포하지 않았다.

## 후속 수정과 재검증

- 두 코어의 component props 갱신에서 삭제와 복사 모두 own enumerable string key를 기준으로
  처리한다. 사라지지 않은 키를 삭제하지 않는 최적화와 props 객체의 참조는 유지한다.
  `Object.assign`으로 추가됐던 symbol 복사는 제거하고 기존 string key 갱신 계약을 따른다.
- DOM props는 `for...in`과 같은 열거 범위로 삭제 여부를 판단한다. inherited enumerable prop은
  계속 반영하고, hidden own/inherited prop이나 non-enumerable shadow는 이전 값을 남기지 않는다.
- 기존 unmount 순회에서 portal 호스트의 event prop만 해제한다. 외부에서 등록한 별도 리스너와
  일반 DOM 및 portal 자식 DOM의 리스너는 유지한다. 반복 삭제·remount, keyed 제거·교체,
  element/component 루트의 destroy와 최신 핸들러 정리를 검사했다.
- 추가로 concurrent가 portal이 포함된 새 subtree를 미리 만들면서 외부 호스트의 내용과 리스너를
  build 단계에 적용하는 문제를 재현하고 수정했다. 해당 subtree의 DOM 생성은 commit까지 미룬다.
  중단된 build는 호스트를 건드리지 않고, store write로 재시도해도 내용과 핸들러가 한 번만 반영된다.
  portal이 없는 subtree의 사전 생성은 유지한다.
- 새 회귀 테스트는 shared **14개**, concurrent 전용 **4개**다. 초기 수정 전 shared 테스트의
  **12개 실패**와 portal 사전 생성의 **2개 실패**를 확인한 뒤 고쳤다. 이후 전체 검사를 실행했다.
  shared의 shadow fixture에는 hidden 속성을 명시하도록 보완했다.
- `pnpm test:dual`, `pnpm test`, base/concurrent 빌드, 양쪽 strict TypeScript와 변경 파일 ESLint 통과.
  dual의 base 테스트 구성 **255개**, concurrent **220개**가 통과했다.
- `pnpm verify:release`도 통과했다. 세 패키지 tarball의 manifest·exports·bin, 별도 설치 환경의
  공개 import 11개와 strict JSX/core/helper 타입을 검사했으며 실제 publish는 하지 않았다.
- Playwright **52개 통과**. 같은 Chrome 비교 도구도 다시 실행해 **36개 실행**을 보존했다.
  두 코어에서 component의 이전 own prop이 사라지고 DOM의 title은 `null`이 된다.
  portal을 세 번 제거한 뒤 호출 수는 **[0, 0, 0]**, root destroy 뒤에도 **0회**다.
  보관한 일반 DOM의 호출 **1회**와 destroy 중 버블링의 `child → unmount → parent`는 유지된다.
- [compatibility-fixed-results.json](./compatibility-fixed-results.json),
  [compatibility-fixed-evidence.json.gz](./compatibility-fixed-evidence.json.gz)에 후속 원본을 보존했다.
  당시 HEAD는 여전히 `4356120`이며 **미커밋 수정 소스**를 빌드했다. 실제 소스·재현 코드·번들·압축
  원본의 SHA-256을 확인했고 결과의 sourceHashes에는 shared unmount도 포함했다.
- 기존 크기 한도는 바꾸지 않았다. base brotli **4,855 / 4,800B**로 성능 종료본보다 **92B** 늘어
  `pnpm size`는 **55B 초과로 실패**한다. concurrent **6,385 / 9,000B**, element **998 / 1,000B**는
  한도 안이다. 배포 준비에서는 이 실제 크기 증가와 기존 한도를 별도로 판단해야 한다.
- 이 후속 검사는 동작 검증이었다. 이후 사용자 요청으로 공식 CPU 영향을 따로 측정했고,
  [COMPATIBILITY_PERFORMANCE.md](./COMPATIBILITY_PERFORMANCE.md)에 기록했다.
  320개 표본에서 종합 차이는 거의 없지만 전체 삭제는 두 순서에서 약 8~10% 느려졌다.
  이전 측정 결과는 해당 시점 번들에 대한 기록으로 유지하며 추가 런타임 후보는 적용하지 않았다.

## 범위와 방법

- 성능 수정 직전 `326a181`과 현재 `4356120`의 base/concurrent 코어를 비교했다.
  이 기준은 앞선 custom element 수정과 SSR escaping 수정을 이미 포함한다.
  `1.23.0` npm 배포본 전체와 비교한 결과로 해석하지 않는다.
- 검토 대상은 `7f14950`, `71e54c1`, `0746966`, `183fec7`, `4356120`의 실행 경로다.
  props 동기화·기존 props 보존, 삭제 형제 수 세기, 내부 메타데이터 초기화,
  base의 redraw 바인딩, 제거된 DOM의 이벤트, 캐시 의존 배열 길이, 부모 getter,
  새 노드의 타입 비교 생략을 확인했다.
- 같은 재현 코드를 네 코어 빌드에서 실행했다. 9개 시나리오 × 4개 빌드 = **36개 실행**이다.
  매번 새 페이지를 사용했고 시스템 Chrome **154.0.8037.98** headless에서 실행했다.
- 소스를 별도 IIFE로 묶은 동작 검사이며 성능 벤치마크가 아니다. Vite 5.4.21,
  ES2022, 최소화 없음, `import.meta.vitest` 제거를 사용했다.
- 기존 `pnpm test:dual`과 Playwright 전체 검사도 다시 실행했다.

## 1. P2 — 제거된 component prop이 남는 회귀

[base syncResolverProps](../../src/diff.ts),
[concurrent syncResolverProps](../../lithentConcurrent/src/diff.ts)의
`key in infoProps`는 새 props의 own enumerable key만 확인하지 않는다.
프로토타입에 있거나 열거되지 않는 속성도 존재한다고 판단한다. 반면 이어지는
`Object.assign`은 own enumerable key만 복사하므로, 기존 own prop이 삭제되지도 갱신되지도 않는다.

단순한 객체끼리도 재현한다. 첫 props가 `{ label: 'a', toString: 'owned' }`, 다음 props가
`{ label: 'b' }`이면 `toString`은 Object.prototype에 있기 때문에 이전 own 값이 남는다.

| 조건 | 성능 수정 전 | 현재 | base/concurrent |
| --- | --- | --- | --- |
| 새 plain props에서 own `toString` 제거 | own key는 `label`만 | `label,toString` | 둘 다 재현 |
| 새 props에 `value`가 상속 속성으로만 존재 | 이전 own `value` 제거, 출력 `undefined` | 이전 `owned` 출력 | 둘 다 재현 |
| 새 props의 own `value`가 non-enumerable | 이전 own `value` 제거, 출력 `undefined` | 이전 `owned` 출력 | 둘 다 재현 |

단순히 inherited value를 읽는 새 지원이 아니다. 최초에 받은 props 객체의 프로토타입은 그대로이고
이전 값이 남는다. JSX spread로 만든 평범한 props에서는 보통 나타나지 않지만, 공개 `h()`에
직접 props를 전달하거나 기본 프로토타입 이름의 prop을 사용하는 호출은 영향을 받는다.

**배포 전 수정 권고:** 사라진 키 판단과 복사 대상이 동일한 own enumerable string key
계약을 따르게 한다. 사라지지 않은 키를 매번 삭제하는 최적화 이전 방식으로 돌아갈 필요는 없다.
`Object.assign`은 이전 `Object.entries` 기반 복사와 달리 enumerable symbol도 복사하므로,
수정할 때 지원할 키 범위도 함께 일치시켜야 한다. symbol 차이는 정적 검토 사항이며 별도 재현하지 않았다.

## 2. P2 — DOM prop 제거 판단도 non-enumerable 속성에 막힘

[base updateProps](../../src/render.ts), [concurrent updateProps](../../lithentConcurrent/src/render.ts)의
사라진 props 루프도 `dataKey in props`로 제거를 생략한다. 앞의 갱신 루프는 `for...in`이므로
non-enumerable 속성은 처리하지 않는다. 새 props가 `title`을 non-enumerable 속성으로 상속하면,
현재 코어는 이전 `title="owned"`를 유지한다. 수정 전에는 해당 속성을 제거했다.

component prop 동기화와는 다른 함수이며, 원인은 같은 존재 여부/열거 범위 불일치다.
plain props의 일반 attribute·event 교체/제거 테스트는 통과한다.

**배포 전 수정 권고:** DOM 갱신에서 실제 방문하는 속성 범위와 삭제 판단을 일치시키는
회귀 테스트를 추가한다. `for...in`이 enumerable inherited key도 처리한다는 기존 계약을 고려해야
하므로, component props와 DOM props에 단순히 같은 own-key 조건을 적용하면 안 된다.

## 3. P2 — 오래 살아 있는 portal 호스트의 핸들러 누적

`h('portal', { portal: target, onClick: handler }, child)`를 켰다 껐다 하면 portal의 `el`은
외부 `target`이다. 이 호스트는 DOM 제거 뒤에도 살아 있으므로, 리스너가 DOM과 함께 수거된다는
삭제 최적화의 전제가 성립하지 않는다.

매 렌더 새 핸들러를 만들고 세 번 꺼 본 결과, 비어 있는 호스트에 이벤트를 한 번 보냈을 때
호출 수는 다음과 같았다. base/concurrent가 동일했다.

| 시점 | 성능 수정 전 | 현재 |
| --- | ---: | ---: |
| 첫 제거 후 | 0 | 1 |
| 두 번째 제거 후 | 0 | 2 |
| 세 번째 제거 후 | 0 | 3 |
| 다시 켠 뒤 root destroy 후 | 0 | 4 |

일반 공개 도우미 `portal(wDom, target)`는 호스트에 event prop을 전달하지 않으므로 이 조건에
해당하지 않는다. portal 내부의 보통 버튼 핸들러와도 구분한다. 다만 공개 `h()`가 처리하는
저수준 portal 경로에서는 실제 중복 호출과 외부 호스트의 리스너 보유가 재현된다.
기존 benchmark 문서에도 남아 있던 예외이며 이번에 브라우저로 확인했다.

원본의 `remaining: 1`은 root destroy 뒤 portal 내용이 남는 기존 동작으로 비교 전후가 같다.
이 검토의 회귀 판단은 내용 제거가 아니라 핸들러 누적에 근거한다.

**배포 전 수정 권고:** 외부에서 소유한 portal 호스트의 리스너는 제거·교체·destroy 때 정리한다.
버려지는 일반 DOM의 리스너 정책과 별도로 검토할 수 있는 문제다.

## 4. 유지 — 일반 DOM 삭제 시 개별 리스너 정리 생략

`71e54c1`은 의도적으로 채택하고 테스트로 고정한 정책 변경이며, 사용자 기준에 따라 유지한다.
앞선 검토의 개별 리스너 정리 복원 권고는 기존 동작 유지가 우선이라는 조건에 따른 것이었다.
현재 기준에서는 복원을 권하지 않는다. 아래 관찰값은 정책의 결과를 설명하는 자료다.

실제 브라우저에서 다음 차이를 양쪽 코어 모두 확인했다.

- 조건부 삭제 뒤 보관한 버튼에 이벤트를 보내면 수정 전 **0회**, 현재 **1회** 호출된다.
- root destroy 뒤 보관한 버튼에서도 수정 전 **0회**, 현재 **1회** 호출된다.
- 자식 click 안에서 동기적으로 root를 destroy하면 수정 전 실행 순서는
  `child → unmount`이고, 현재는 `child → unmount → parent`다.

따라서 `ref` 등으로 노드를 보관하는 통합 코드와 이벤트 중 앱을 파기하는 코드는 영향을 받는다.
unmount와 은퇴된 컴포넌트의 redraw 방지는 유지되지만, 사용자 이벤트 핸들러의 외부 부작용까지
없어지는 것은 아니다. 노드에 대한 외부 참조가 없다면 DOM/리스너를 함께 회수할 수 있다는
메모리 근거는 보관된 DOM에 대한 이벤트 계약을 대신하지 못한다.

[Preact 10.29.8의 unmount](https://github.com/preactjs/preact/blob/10.29.8/src/diff/index.js#L607)는
ref·component 생명주기를 정리하고 DOM을 제거하며, 제거되는 DOM의 리스너를 개별 해제하지 않는다.
[event prop 처리](https://github.com/preactjs/preact/blob/10.29.8/src/diff/props.js)는 남아 있는 DOM의
핸들러 prop이 사라지면 리스너를 해제한다. Lithent도 남아 있는 DOM의 핸들러 교체·제거를 처리한다.
Preact 확인은 공식 소스와 로컬 설치된 10.29.8 소스를 검토한 결과이며, 앞의 36개 브라우저 실행은
Lithent 두 코어의 변경 전후 비교다. 이전 성능 표의 Preact 10.27.1 수치와도 별개다.

**결정:** 일반 DOM 삭제의 개별 리스너 해제는 복원하지 않는다. unmount 콜백 실행과 은퇴한
컴포넌트의 redraw 방지를 유지하고, 남아 있는 DOM의 핸들러 변경·제거를 검증한다.
보관한 DOM의 이벤트 처리 차이는 릴리스 문서에 설명할 정책이며 그 자체로 배포 보류 사유로
취급하지 않는다. 실제 수정 대상은 최신 props의 반영 오류와 외부 portal 호스트의 핸들러 누적이다.

## 다른 변경의 검증 상태

- 새 노드 타입 비교 생략은 유효한 노드에서 이전 비교 결과가 false였던 경로만 생략한다.
  추가된 subtree의 mount·slot·key 이동·자식 renew·unmount 테스트가 두 코어에서 통과했다.
- 부모 getter 분리는 부모 반환 값을 바꾸지 않으며 이전 diff 스코프의 보유를 끊는다.
  실제 브라우저 WeakRef 회수 검사도 양쪽에서 통과했다.
- 내부 메타데이터를 `undefined`로 초기화한 뒤 코어의 사용처는 값으로 판단한다.
  내부 WDom을 `Object.keys` 등으로 관찰하면 속성 존재 차이는 있지만 렌더 회귀를 찾지는 못했다.
- 형제 수 세기 조기 종료는 후보 수보다 많으면 bulk 삭제를 하지 않는다. 다중 루트 component와
  앞뒤 이웃을 둔 목록 삭제·복원 테스트가 통과했다.
- base redraw 바인딩은 renew 호출 당시 현재 노드를 잡고 부모 갱신 뒤의 stale redraw를 건너뛴다.
  새 브라우저 비교에서 부모·자식 갱신 뒤 자식 renew 결과가 양쪽 코어와 기준 모두 `b:1`이었다.
  concurrent에는 이 바인딩 최적화를 적용하지 않았고 scheduler 동작 검사가 통과했다.
- `cacheUpdate` 의존 배열 길이 비교는 길이 변경을 무시하던 버그 수정이다.
  두 코어의 helper 테스트가 각각 51개 통과했다.
- 마지막 동일 VDOM 조기 반환 후보는 현재 코어에 없다.

이 부분은 검토와 검사 범위 안에서 새 회귀를 발견하지 못했다는 의미다.
모든 호출 형태와 모든 브라우저에서 위험이 없다는 보장은 아니다.

## 검사와 원본

- `pnpm test:dual` 통과: base 테스트 구성 241개, concurrent 202개,
  concurrent helper 8개와 양쪽 satellite 검사. base element의 concurrent 전용 3개는 원래 skip이며
  concurrent element에서 실행돼 통과했다.
- `pnpm exec playwright test`: **52개 통과**. built bundle의 DOM·keyed 정체성·생명주기·slots·portal,
  SSR/hydration·HMR·Custom Element·React 호스트·CSP·concurrent scheduler·VDOM 회수를 포함한다.
- 재현 코드 ESLint 통과. 코어는 변경하지 않았고 이전 빌드와 측정 수치를 다시 계산하지 않았다.
- [compatibility-results.json](./compatibility-results.json): 36개 실행의 실제 반환값, 당시 HEAD,
  현재 코어 소스·재현 코드·네 번들 해시.
- [compatibility-evidence.json.gz](./compatibility-evidence.json.gz): 실행한 재현 코드와 네 IIFE 번들.
  압축 파일 해시는 결과의 `evidenceSHA256`과 일치한다.
- [compatibility-cases.js](./compatibility-cases.js),
  [compatibility-review.mjs](./compatibility-review.mjs): 전후 동작 비교를 다시 실행하는 도구.

```sh
LITHENT_COMPAT_OUT=/tmp/lithent-compatibility-review-rerun \
  LITHENT_COMPAT_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node docs/benchmark/compatibility-review.mjs
```

현재 소스가 바뀌면 새 출력 경로로 실행하고 기존 결과를 덮어쓰지 않는다.
이 도구는 결과를 기록하는 비교 도구이며, 차이가 있어도 비정상 종료하지 않는다.
버그를 수정할 때는 기존 계약을 단언하는 회귀 테스트로 해당 조건을 추가해야 한다.

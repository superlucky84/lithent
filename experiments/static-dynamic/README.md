# Static/dynamic HTML block proof

DC-27의 수동 blueprint 실험이다. 자동 compiler 변환과 제품 API는 구현하지 않는다. 정본은 [요구사항 R101~R106](../../docs/performance-improvement/REQUIREMENTS.md#dc-27--정적-구조와-동적-필드-정보의-원리-검증), [설계](../../docs/performance-improvement/DESIGN.md#dc-27--수동-blueprint와-동적-slot), [실행 G0~G4](../../docs/performance-improvement/IMPLEMENT.md#dc-27--실행-g0g4), [검증 M-24](../../docs/performance-improvement/MANUAL_TEST_CHECKLIST.md#m-24-정적동적-blueprint--r101r106)다.

`defineBlock(schema)(values,key)`는 순수 값 tuple을 복사하는 불투명 description이다. static HTML 구조/props/slot 계획을 공유하되 각 instance는 독립 WDom/DOM을 소유한다. 최초 생성은 기존 createWDom layout으로 materialize하고 같은 blueprint/key 갱신은 정적 자식을 재생성·비교하지 않고 scalar text/attr/event slot을 기존 updater로 commit한다. 별도 clone은 해당 description snapshot에서 독립 tree를 만든다. 인스턴스별 metadata·값 배열/비교·binding refs·생성 비용도 측정에 포함한다.

일반 HTML 고정 arity만 지원한다. per-node hook/VDOM callback·component/portal/Fragment·동적 구조·ref/style/input/SVG/custom element·schema accessor·spread는 선언하지 않는다. 사전 WDom 내부 관찰/외부 subtree mutation·concurrent/SSR/HMR은 지원하지 않는다. 일반 h/getter는 그대로다. diff/DOM 오류의 transactional rollback은 약속하지 않으며 부분 commit fault 후에는 owner를 unmount/remount한다. 기존 중첩 portal BUG-3은 고치지 않았다.

세 조건은 stock(원래 A 앱/core), control(같은 A 앱/overlay), candidate(같은 map/cache와 row blueprint/overlay)다. C4의 알려진 변경 행 알림이나 행별 component를 추가하지 않는다. control/stock으로 전역 hook 비용, candidate/control로 같은 overlay의 정보 활용 효과, candidate/stock으로 실제 opt-in 앱의 총 차이를 본다. 최초 생성 방식도 달라지므로 단순 비교 생략만의 단독 효과로 표시하지 않는다. peer/Vue 비교는 없으며 과거 점수를 합산하지 않는다.

```sh
node experiments/static-dynamic/check.mjs /private/tmp/static-dynamic-check.json
node experiments/static-dynamic/prepare.mjs /private/tmp/lithent-static-dynamic-FRESH
node node_modules/typescript/bin/tsc --project /private/tmp/lithent-static-dynamic-FRESH/tsconfig.json
node node_modules/typescript/bin/tsc --project /private/tmp/lithent-static-dynamic-FRESH/tsconfig-stock.json
```

prepare는 보존한 P2 원래 A 앱과 P3 runner/dependency staging을 입력으로 사용한다. 원자료를 복원하고 installed inventory를 검증한 뒤 실행한다. 출력은 반드시 새 디렉터리다. 최종 실행은 `/private/tmp/lithent-static-dynamic-20261030-v2`이며 첫 타입 설정/회귀 탐색의 준비 실패는 `-setup`에 따로 보존했다. 타입/회귀 설정 수정 중 runtime과 번들은 같았다. 이후 V1 부분 CPU에서 동일 cached row의 불필요한 metadata 조회를 확인해, V2는 같은 객체의 block hook만 생략하고 일반 core 경로는 유지한다. V1 staging과 부분 표본은 보존하며 최종 V2와 섞지 않는다.

prepare가 생성한 Vitest 설정으로 일반 core 회귀를 실행하고 결과를 저장한다.

```sh
cp /private/tmp/static-dynamic-check.json /private/tmp/lithent-static-dynamic-FRESH/check.json
node node_modules/vitest/vitest.mjs run --config /private/tmp/lithent-static-dynamic-FRESH/vitest.config.mjs --reporter=json --outputFile=/private/tmp/lithent-static-dynamic-FRESH/core-regressions.json
node experiments/static-dynamic/identity-check.mjs /private/tmp/lithent-static-dynamic-FRESH /private/tmp/lithent-static-dynamic-20261030
```

check/identity-check JSON, 일반 core 회귀 결과 JSON과 격리 root의 Vitest 설정을 staging에 저장한다(실제 설정/결과는 archive). 이번에는 기존 core 26파일/186검사를 overlay에서 수행했다. 두 core를 같은 TypeScript program에 넣으면 JSX 전역이 중복되므로 타입은 분리한다. 회귀는 격리 core를 root로 잡아 저장소 전체 탐색을 피한다. 별도 `identity-check.mjs OUT V1_OUT`은 V1/V2의 변경 없는1k/10k행 WeakMap 조회를 비시간 계측해 2013/20013→13/13을 확인한다. 그 뒤 입력을 한 번 고정한다.

```sh
node experiments/static-dynamic/freeze.mjs /private/tmp/lithent-static-dynamic-FRESH
node experiments/static-dynamic/measure.mjs /private/tmp/lithent-static-dynamic-FRESH gate
node experiments/static-dynamic/browser.mjs /private/tmp/lithent-static-dynamic-FRESH
node experiments/static-dynamic/measure.mjs /private/tmp/lithent-static-dynamic-FRESH collection
node experiments/static-dynamic/analyze.mjs /private/tmp/lithent-static-dynamic-FRESH
python3 experiments/static-dynamic/audit.py /private/tmp/lithent-static-dynamic-FRESH
```

3앱×2순서 CPU870·공식 메모리90을 직렬 수집한다. 수집 중 build/test/profile/다른 benchmark를 돌리지 않는다. 입력이 바뀌면 성공 배치를 덮어쓰지 않는다. 중단 시 live process/complete/exit 파일을 확인하고 미완료 mode/order만 재개한다. `collection`을 완료된 staging에 다시 실행하지 않는다.

실제 결과를 판단해 `decision.json`에 summary/disposition/reasons(배열)/interpretation/next를 기록한 뒤 아래를 실행한다. 개발용 diagnostic counter는 공식 번들에서 제거하며 별도 작업량/Chrome 진단에만 쓴다. 원래 앱은 기존 A와 같은 바이트로 재현됐지만 timing은 이번 세션만 사용한다.

```sh
node experiments/static-dynamic/report.mjs /private/tmp/lithent-static-dynamic-FRESH
python3 experiments/static-dynamic/preserve.py /private/tmp/lithent-static-dynamic-FRESH
```

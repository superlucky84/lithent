# C4 P3 — scalar key snapshot

P2 owner 계약을 유지하며 `set`에서 key 배열을 함께 저장한다. 구조 view의 중복 `keyOf`와 위치 검증용 `Map.get`을 줄이는 한 변수 실험이다. 기본 runtime/public export는 바꾸지 않는다. 정본은 [REQUIREMENTS R96~R100](../../docs/performance-improvement/REQUIREMENTS.md#c4-p3--key-snapshot-검증-비용-축소), [DESIGN](../../docs/performance-improvement/DESIGN.md#dc-26-c4-p3--key-snapshot), [실행 F0~F4](../../docs/performance-improvement/IMPLEMENT.md#c4-p3--실행-f0f4)다.

기준선은 `7f4df5c:experiments/c4-owner/boundary.ts`다. 앱은 P2의 같은 owner 앱이며 선택 class·cache·core·빌드 설정을 유지한다. `describe`의 key mutation 검사를 유지하고 items/keys/indexes를 같은 세대로 게시한다. 순수 keyOf/view 계약 하의 읽기 축소이며, 일반 getter 호출 횟수를 바꾸는 core 최적화가 아니다. snapshot 배열 n개 쓰기/저장이 추가되고 일반 keyed reconciliation의 O(n) 작업은 남는다.

P2의 [지원 범위와 기존 한계](../c4-owner/README.md)를 따른다. 중첩 portal 삭제 BUG-3·owner 교대/clone·concurrent/SSR/HMR·제품 공개 지원은 완료하지 않았다. P2의 class pilot과 선택 trace를 다시 실행하지 않는다.

```sh
node experiments/c4-key-snapshot/check.mjs /private/tmp/c4-key-owner-check.json
node experiments/c4-key-snapshot/snapshot-check.mjs /private/tmp/c4-key-snapshot-check.json
node experiments/c4-key-snapshot/prepare.mjs /private/tmp/lithent-c4-key-snapshot-FRESH
```

prepare는 P2 raw staging의 앱/설치 의존성을 사용한다. 기존 staging이 없으면 P2/DC-25 증거를 복원하고 설치 inventory를 먼저 검증해야 한다. 출력 디렉터리는 반드시 새로 만든다. 설치 Chrome의 실행 파일과 **현재 framework**를 고정한다. 자동 업데이트로 해시가 바뀌면 기존 검증/실패를 보존한 별도 staging에서 다시 고정한다. 이번 실제 수집은 `/private/tmp/lithent-c4-key-snapshot-20261030-v2`다.

check/snapshot-check JSON과 strict type 설정·준비 메모를 staging에 저장한 뒤 커밋된 공유 도구로 실행한다. CPU/메모리 수집 중 빌드·테스트·profile·다른 benchmark를 함께 실행하지 않는다.

```sh
node experiments/c4-owner/measure.mjs /private/tmp/lithent-c4-key-snapshot-FRESH gate
node experiments/c4-owner/browser.mjs /private/tmp/lithent-c4-key-snapshot-FRESH
node experiments/c4-owner/measure.mjs /private/tmp/lithent-c4-key-snapshot-FRESH collection
node experiments/c4-key-snapshot/analyze.mjs /private/tmp/lithent-c4-key-snapshot-FRESH
python3 experiments/c4-owner/audit.py /private/tmp/lithent-c4-key-snapshot-FRESH
python3 experiments/c4-key-snapshot/integrity.py /private/tmp/lithent-c4-key-snapshot-FRESH
```

새 P2/P3/Preact class11 CPU870·공식 메모리90을 양순서로 비교한다. 원래 A 앱/과거 세션과 합산하거나 개선율을 곱하지 않는다. 공유 분석기의 가중치만 기존 정본에서 읽고 원자료는 이번 staging만 사용한다. 실제 결과를 검토해 staging의 `decision.json`에 summary/disposition/reasons(배열)/next/interpretation을 기록한 뒤 보고서/영구 증거를 생성한다. integrity 도구의 기존 unit 재사용 검사는 이번 실행의 preparation-notes에 기록한 원본 staging과 소스/결과 해시를 대조한다. 새 실행에서는 실제 검증/재사용 출처를 기록해야 한다.

```sh
node experiments/c4-key-snapshot/report.mjs /private/tmp/lithent-c4-key-snapshot-FRESH
python3 experiments/c4-key-snapshot/preserve.py /private/tmp/lithent-c4-key-snapshot-FRESH
```

archive는 기존 P1/P2 자료를 덮어쓰지 않는다. 실제 수집과 함께 중단 전 검증 및 브라우저 pin 수정 전 준비 자료도 별도 prefix로 보존한다. node_modules symlink는 제외하고 lock·설치 package inventory를 기록한다.

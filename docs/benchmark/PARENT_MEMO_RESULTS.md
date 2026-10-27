# C3 — explicit parent memo prototype

2026-10-22. 계약·기준 회귀 체크포인트
`ddd545e5b8c3878cfd5a6340464106e4c417da4f`에서 시작했다.

**base C3 한정 프로토타입을 구현·검증했고 기본 채택은 보류했다.**
일반 입력 목록에서 부모 기인 updater 재실행을 줄이는 동작을 확인했지만,
brotli가 기존 한도를 **891B 초과**했다. 후보를 패치·증거로 보존하고
기본 런타임을 baseline으로 복원했다. 공식 시간의 개선 판정은 없다.

[원본 결과](./parent-memo-results.json), [압축 증거](./parent-memo-evidence.json.gz),
[후보 패치](./parent-memo-candidate.patch),
[재현 도구·회귀](../../experiments/parent-memo/README.md),
[정본 계약](../performance-improvement/DESIGN.md).

## 구현과 적용 범위

- base root의 실험 API `useParentMemo<P>(nextProps => deps)`를 setup 중 한 번 등록한다.
  selector는 props 동기화 전 incoming 값을 읽고, 코어는 deps 배열을 복사해
  길이/`Object.is`로 비교한다. props key 변화·nonempty slots·특수 props는 fallback이다.
- 부모 hit는 held props를 동기화하고 live wrapper를 유지하면서 updater·pre/post callback·
  하위 diff를 생략한다. 자체 renew/public replace는 명시적 self 경로로 검사에서 제외한다.
- opt-in ComponentInfo의 WeakMap sidecar와 출력 노드의 WeakMap을 사용한다.
  setup/work scope에서 초기화·diff·DOM·mount/post 실패를 처리하고 실제 방문한 출력만
  최외곽 성공 경계에서 게시한다. 세대가 다른 출력·삭제된 등록은 게시하지 않는다.
- 초기화가 실패하면 하위에 새로 만든 memo 등록도 정리한다. cleanup은 사용자 cleanup
  이전에 실행한다. 모든 WDom/ComponentInfo에 고정 필드를 추가하지 않았다.
- concurrent 런타임·공통 hook/type·helper는 바꾸지 않았다. concurrent 새 API import는
  타입과 ESM에서 명시적으로 실패한다. export 동등성 회귀의 base-only 예외는 후보 패치에만 있다.
- 부모 keyed 전체 순회, 행 컴포넌트 생성/메모리, 자체 갱신의 부모/slot 검색은 남는다.
  C1/C2/C4는 결합하지 않았다. benchmark 전용 조건·DOM 쓰기 로직은 코어에 없다.

## 회귀와 패키지 검사

- 전용 **33개**: setup/중복/잘못된 시점, lmount, incoming props·배열 복사·길이·NaN/−0,
  mutable 값·key 추가/삭제·선언 누락, slot/특수 props fallback, hit/miss 양방향 배칭,
  callback 재예약, selector/pre/updater/post/DOM/mount 실패, 초기화 하위 정리,
  keyed 이동/생성자 교체·동일 설명의 독립 인스턴스를 검사했다.
- `pnpm test:dual` **1,070 passed·3 skipped**(13개 runner 집계).
  후보 전용 33개는 이 합계에 포함하지 않는다. 소스/실험 TypeScript와 ESLint도 통과했다.
- 실제 ESM/CommonJS API와 consumer declarations를 확인했다. concurrent alias의
  named import는 TypeScript TS2305와 ESM missing export로 실패했고 나머지 기존 경로는 통과했다.
- 같은 원래 앱·helper + baseline/후보 core의 B3 contracts와 공식 keyed·9동작·폰트 검사를
  통과했다. 이는 새 API를 쓰는 앱의 성능 측정이 아니다. helper는 수정하지 않았다.

오류 범위: base는 실패한 부모 diff에서 이미 게시한 live pointer나 hook cursor를
transaction으로 복구하지 않는다. 후보의 memo 스냅샷은 무효화되지만, 실패한 부모의
재시도에는 이전의 unretired tree를 명시적으로 전달해야 할 수 있다. updater throw 뒤의
pre callback 재실행 횟수도 baseline 대조로 확인해 그대로 보존했다. 최초 테스트의 두 실패는
자동 롤백/콜백 재생을 가정한 검사였고, 실제 baseline 계약을 대조한 뒤 검사를 수정했다.
전체 예외 복구를 새로 구현한 결과로 설명하지 않는다.

## 일반 입력 목록의 production 동작

고정 Chrome **155.0.8059.85**에서 baseline 일반 경로, 후보 일반 경로,
후보 opt-in 경로를 **3 context씩**, 총 9 context로 검사했다.
앱 소스는 세 조건에서 동일하고 helper를 사용하지 않는다.
다음은 해당 동작의 **자식 updater 실행 수**이며 부모 1회는 별도다.

| 동작                         | baseline | 후보 비사용 | 후보 opt-in |
| ---------------------------- | -------: | ----------: | ----------: |
| 1,000 입력 초기 생성         |    1,000 |       1,000 |       1,000 |
| 변경 없는 부모 refresh       |    1,000 |       1,000 |           0 |
| 입력 한 개 자체 갱신         |        1 |           1 |           1 |
| 부모 역순 갱신               |    1,000 |       1,000 |           0 |
| 한 입력의 label/version 변경 |    1,000 |       1,000 |           1 |

입력 값·DOM 정체성·refresh 뒤 focus, 이동 뒤 자체 상태, mutable label 변경,
한 개 삭제의 단일 unmount를 확인했다. 제거한 1개를 포함해 dispose 후 모든 1,000개가
한 번씩 unmount됐다. 외부에서 component key 1,000개를 유지하고 강제 GC 뒤
**등록 0개, 관찰한 live VDOM/host의 WeakRef 생존 0개**를 모든 context에서 확인했다.
공식 메모리 5항목이나 100회 churn은 수행하지 않았다. 시간/메모리 개선율로 환산하지 않는다.

## 크기와 판단

| UMD      |     raw |   gzip | brotli |
| -------- | ------: | -----: | -----: |
| baseline | 12,741B | 5,178B | 4,798B |
| C3 후보  | 15,481B | 6,169B | 5,691B |

gzip 표는 집계 도구의 Node **20.3.0**, zlib **1.2.13.1-motley**, level 9다.
`pnpm size`는 Node **22.13.0**/zlib **1.3.0.1-motley-82a5fec**에서 후보 gzip을
6,157B로 출력했다. raw/brotli는 같다. 서로 다른 압축기 수치를 숨겨 합치지 않는다.
base brotli는 baseline보다 **893B 증가**, 기존 4,800B 한도보다 **891B 초과**다.
concurrent **6,903B**, element **998B**는 그대로다. 한도를 수정하지 않았다.

행별 부모 재실행을 줄이는 근거는 확인했다. 다만 비사용자도 setup/work/DOM 경계 비용이
생기고 이를 공식 시간으로 측정하지 않았다. 따라서 속도가 빨라졌거나 전체 목표를
달성했다고 판단하지 않는다. 다음은 **기능 격리/고정 비용 절감의 설계와 비용 대조**다.
같은 구조의 opt-in 시간과 원래 앱의 core-only 시간을 분리해 검증해야 한다.
크기 상쇄/선택적 진입점 설계를 끝내기 전에 Phase 4 전체 실측으로 넘어가지 않는다.

## 보존과 복원

- 최종 후보 source/ESM/UMD/CJS/types, baseline, 일반 앱/원래 앱 두 빌드,
  raw 계약·회수·타입 결과, 도구와 로그를 SHA-256과 함께 압축 증거에 보존했다.
  앞선 screen-v1은 다른 후보 해시이며 최종 결과에 합산하지 않는다.
- 보존한 18개 후보 파일의 해시를 확인한 뒤 패치를 역적용해 자신의 코어/테스트 변경만
  복원했다. 생성한 hook 선언 파일도 정리했다. base 재빌드·기존 size 통과,
  복원 후 관련 회귀 base **21개**/concurrent **23개** 통과.
- 이전 복원 manifest의 소스/번들 **28개 SHA-256**과 일치한다. 실제 sibling 앱도 이전
  targeted 실험본의 해시를 유지한다. 새 API는 현재 기본 export에 없다.
- 공식 CPU/역순/React·Preact 전체 비교·공식 메모리/100회 churn·최종 B4/e2e는 미실행이다.
  새 채택·배포·최종 목표 달성 판정은 없다. 이번 구현·증거는 아직 미커밋이다.

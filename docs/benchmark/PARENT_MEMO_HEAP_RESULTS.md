# C3 production heap 귀속 — DC-14

2026-10-22 08:23:00~08:23:33 UTC. 기준 commit
`aa20ccc84f4252c46e5a89ce1abb9ead0c6ee387`.

**DC-13에서 보였던 5→25회 추가 heap의 주된 원인은 출력용 WeakMap의 내부
테이블 용량이었다.** 동일 production 번들의 별도 snapshot에서 테이블 self size가
65,556→262,164B, **+196,608B(192KiB)** 증가했다. 25/100/300회와 마지막 clear까지
같은 테이블 ID·크기를 유지했다. clear 뒤 슬롯은 Hole과 엔진 Map 메타데이터뿐이며,
실제 행 데이터·memo·snapshot·output 인스턴스는0개였다. 기본 코어 채택은 계속 보류다.

[raw 결과](./parent-memo-heap-results.json), [전체 증거](./parent-memo-heap-evidence.json.gz),
[재현 도구](../../experiments/parent-memo-heap/README.md)를 함께 읽는다.
이것은 heap 진단이며 공식 CPU/`measureUserAgentSpecificMemory()` 개선율이 아니다.

증거는150파일/14개 전체 snapshot이며 archive SHA-256은
`90bb8e4e7dafe732a63f0e1c3f1d913357d7680f58adc4c054f2c95926bc6782`다.

## 고정 조건

- DC-13의 앱/core/production JS/HTML 그대로다. 두 조건의 JS SHA-256은
  `e6782f64db2e0ed4bc2f215fb1af70dede7e28a144473456bd28a3b055e409b9`.
  HTML 시작 설정만 memo off/on이다. 계측용 diagnostic bundle을 사용하지 않았다.
- Chrome155.0.8059.85, 실행 파일
  `6e156f2271cef44afce9db36a5b920e94518857b94a4160f082696f8c3bd1c9d`, framework
  `b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7`.
- snapshot 없는3 fresh context/조건에서 생성1k/clear를300회까지 반복했다.
  checkpoint마다 두 번 GC 뒤 CDP JSHeapUsedSize·DOM·listener를 수집했다. 순서는 교대했다.
- 별도1 context/조건에서0/5/25/100/300회 clear, 추가1k live, 마지막 clear의
  **14개 전체 snapshot**을 수집했다. snapshot의 GC/최적화 영향 때문에 앞6context와 분리한다.
  App/Table·버튼은 계속 mount된 상태다. full root dispose 검사는 DC-13의 별도 증거다.
- 새로운 공식 시간/메모리 표본은0개다. 기존 same-hash251회귀/dual1,070·3skip/타입/B3를
  재사용했다. 기본28파일/package와 실제 sibling 앱은 전후 보존했다.

## snapshot 없는 GC 뒤 heap

단위는 bytes/1024²이며 세 context의 중앙값이다. 모든 checkpoint의 document/node/listener는
각각 **1/65/32**로 동일했다. 전체 raw에는 세 값과 실행 시각을 보존한다.

| create/clear 횟수 | memo off MB | memo on MB |
| ----------------- | ----------: | ---------: |
| 0                 |    1.822388 |   1.822388 |
| 5                 |    2.105339 |   2.190525 |
| 25                |    2.113644 |   2.376087 |
| 100               |    2.130531 |   2.391644 |
| 300               |    2.186794 |   2.446251 |

100→300회 중앙값 증가는 off58,996B/on57,260B였다. on 한 context는100회에2,772,600B,
300회에2,828,136B로 다른 둘보다 약0.25MB 높았다. 그 context에는 snapshot이 없으므로
추가분의 원인은 귀속하지 않는다. **전체 heap이 plateau하거나 모든 byte가 설명됐다는
결론은 아니다.**

## 테이블 보유 경로와 객체 회수

고정 JS의 `b=new WeakMap,Oe=new WeakMap`은 원본 `memos`/`outputs`에 대응한다.
`Oe.set`은 staged 출력, `Oe.get`은 renderer 방문 시 memo work에 출력을 넣는 코드다.
snapshot의 일반적인 강한 경로는 다음과 같다. 실제 node ID/edge 이름은 raw에 있다.
weak/ephemeron 조건부 edge와 DevTools console handle은 이 경로 검색에서 제외했다.

`NativeContext → Window → HTMLDocument → run 버튼 → 이벤트 callback → module context → Oe WeakMap → table`

| memo on 시점 | outputs table self bytes | table ID | clear 뒤 실제 row/memo/snapshot/output |
| ------------ | -----------------------: | -------: | -------------------------------------- |
| clear5       |                   65,556 |   101079 | 모두0                                  |
| clear25      |                  262,164 |   125591 | 모두0                                  |
| clear100     |                  262,164 |   125591 | 모두0                                  |
| clear300     |                  262,164 |   125591 | 모두0                                  |
| 마지막 clear |                  262,164 |   125591 | 모두0                                  |

off의 outputs table은52B다. on clear25의 테이블 edge 대상은 Hole19,000개와 Map1개이며
실제 이전 행/출력을 가리키지 않는다. 마지막 clear도 Hole1,000개와 Map1개뿐이다.
출력용 WeakMap은 소스에서 `set/get`하며 명시적 `delete`를 하지 않는다. 빈 용량의 잔류를
확인했지만, 더 오래 반복했을 때의 상한을 증명하지는 않았다.

처음 shape만 세면 clear 뒤 componentInfo3개, row1개와 on의 memo/snapshot/output 각1개가
나온다. raw 보유 경로를 보면 각각 함수 FeedbackVector의 **AllocationSite.transition_info
객체 생성 템플릿**이다. 이를 인스턴스와 분리하면 componentInfo는 살아 있는 App/Table2개,
row/memo/snapshot/output은0개다. live1k에서는 row1,000개와 on memo/snapshot/output 각1,000개가
검출되고 clear 뒤 모두 사라진다. live→clear 인스턴스 ID 교집합도 App/Table2개뿐이다.

## 나머지 증가와 한계

on snapshot5→25의 전체 self size 증가는190,136B다. 구성은 table array+196,608,
code−20,408, native+13,872, object shape+64B로 합계가 일치한다. 따라서 table이 주된 증가를
설명하지만, snapshot self size와 별도 시점의 CDP JSHeapUsedSize는 같은 수치가 아니다.

snapshot100→300의 증가는 off71,340B/on86,476B이며 각각 code51,264/61,824B와
native20,076/24,652B다. InstructionStream·TrustedByteArray 등 코드와 브라우저
ScriptTimingInfo/PerformanceScriptTiming 등의 증가가 관찰됐다. 일반 object/closure/array의
순 self size 변화는 이 구간 양쪽 모두0B였다. 이 관찰을 다른 브라우저·모든 사용 패턴·공식
메모리 API에 그대로 적용하지 않는다.

JavaScript parser는 schema 기반 node/edge 경계·전체 self size·분류 합계·인스턴스 ID를
확인했다. Python의 별도 구현이14개 원본의 hash, 합계, shape/템플릿, 모든 기록된 강한
WeakMap 경로를 재검증했다. retained size/dominator 분석·장기 누수 부재 판정은 하지 않았다.

## 다음 단계

[실제 캐시 앱 대조 계획](./PARENT_MEMO_CACHE_PLAN.md)의 다섯 조건을 같은 차수로 준비한다.
원래 cacheUpdate 앱과 비교하기 전에는 DC-13의−8.12%를 원래 앱의 개선율로 쓰지 않는다.
outputs의 성공 게시 후 명시적 삭제는 별도 개선 가설이다. 후보를 바꾸면 새 해시·회귀·메모리
검증이 필요하며, 이번 측정 대상에 그 수정을 적용한 것으로 쓰지 않는다.

- done:300회 churn6context·snapshot2context/14개·table/템플릿 귀속·독립 감사.
- next:DC-15 캐시 앱 조건의 빌드·타입/B3/작업량 검증 후 전체 공식 비교.
- blockers:실행 블로커 없음. 다른 heap 변동·공개 예산/concurrent/전체peer/최종 hardening은 미완료.
- commit:`aa20ccc84f4252c46e5a89ce1abb9ead0c6ee387`; 이번 DC-14 도구·문서·증거는 후속 작업 트리다.

# DESIGN — 변경 범위의 근거를 보존하는 코어 최적화

- 기준일: 2026-10-29. 상태: **C4 P2 owner/중첩 확장과 새 3앱 비교 완료. CPU870/메모리90 양순서에서 C4는 기존 앱 대비 가중 전체 −3.44%, Preact class 대비 +1.29%다. 해당 한 peer의1.10 범위7/9이며 선택/교환은 미달이다. 10k 메모리+0.262MB(+0.93%), 앱 Brotli+1,110B. 추가 class pilot100표본은 방향이 갈려 미채택이다. 기본 runtime/guard·공개 API는 유지하며 portal BUG-3·concurrent/SSR/HMR은 남아 있다.**
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 과거 Map/LIS 설계는 [역사 문서](./history/2026-07-map-lis/DESIGN.md)다. 현재 코어에 이미 있는 Map/LIS를 새 최적화로 제안하지 않는다.

## DC-26 — 남은 격차 진단과 후속 분기

요구사항 R80~R84, 계획 D0~D4, 검증 M-21. [진단 보고서](../benchmark/RENDER_GAP_DIAGNOSIS.md)와 [재현 결과](../benchmark/render-gap-diagnosis.json)가 근거다. 아래는 분석 결론과 제안이며 새 runtime 계약이 아니다.

- [x] **DC-26-1 비교 기준:** DC-25 baseline/Preact class pooled를 재계산했다. 전체 가중 +2.17%, 선택 +37.14%, 선택 JS 2.23배다. Vue 동시 측정은 없으므로 최신 배수를 제시하지 않는다. → M-21-1.
- [x] **DC-26-2 원인 범위:** 캐시 적중 뒤에도 전체 key 매칭·diff 메타데이터·render 방문이 남는다. 변경된 행은 정적 자식까지 재생성한다. Preact도 목록 순회하며 더 이른 SCU 생략을 제공하고, Vue는 memo/컴파일 정보를 사용한다. 정확한 비용 비중과 언어/아키텍처의 필연적 한계는 입증하지 않았다. → M-21-2.
- [x] **DC-26-3 반복 제외:** 보고서의 기시도 표를 따른다. 미세 최적화의 안정적인 전체 이득 부재를 C4/모든 내부 최적화의 불가능성으로 일반화하지 않는다. → M-21-3.
- [x] **DC-26-4 부모 연결:** 생성 시 부모 대입을 생략한 negative control에서 render 전과 부모 mountReady의 getParent 관찰이 달라졌다. 무조건 제거는 보류하며 일반 context 실패로 확대하지 않는다. → M-21-4.
- [x] **DC-26-5 후속 선택:** 우선 제안은 기존 C4의 소유권·구조 version·변경 항목 계약 구체화다. 행별 mount를 추가하지 않는 갱신 단위와 실제 변경 항목 탐색 비용까지 설계한다. 첫 격리 실험의 정보 생산자와 제한은 아래 DC-26-C4-P1로 정했다. 최종 제품 API/양코어 지원은 미결정이다. → D1, M-21-5.
- [ ] **DC-26-6 별도 compiler 경로 TBD:** 정적 구조와 동적 필드를 증명할 수 있는 경우만 metadata를 생성한다. spread/getter/임의 함수는 일반 경로를 유지한다. JSX/template 중 시작점, opt-in 형태, 런타임 크기·HMR/SSR/concurrent 지원을 먼저 정하며 C4와 동시에 구현하지 않는다. → D1, M-21-5.

기존 API만을 고수하는 경우에는 현재 production trace를 먼저 수집한다. 변경 없는 자식의 commit 방문/정리를 줄이는 가설은 추가 작업 큐와 관찰 보존 비용까지 포함해 평가할 수 있지만, 아직 시간 근거가 없으며 DC-25 반복을 바로 시작하지 않는다. 제품 구현을 선택할 때 이 절의 TBD를 확정한다.

### DC-26-C4-P1 — 첫 격리 프로토타입 계약 (2026-10-29)

사용자의 “한번 진행” 요청으로 D1/D2와 한정 검증을 진행한다. 공개 API 채택 결정과 구분한다.

- 첫 정보 생산자는 명시적 호출자다. boundary가 배열 snapshot·고유 key→현재 index를 소유하고, `set(items)`는 구조 변경, `invalidate(keys)`는 항목 변경을 알린다. 알리지 않은 외부 mutation은 지원하지 않는다. 선택은 이전/다음 key, 부분 갱신은 실제 수정 루프에서 모은 key를 전달하며 그 비용도 측정한다.
- item key는 고유한 number/string이며 수명 중 불변이다. 잘못된 중복/누락/변경 key는 명시적으로 거부한다. 일반 keyed runtime의 중복 key 계약을 바꾸지 않는다. 알려주지 않은 외부 쓰기·키 변경의 자동 감지는 약속하지 않는다. 구조 변경은 기존 `makeNewWDomTree`/`wDomUpdate`를 사용하고 index map을 다시 만든다.
- item은 한 개의 keyed element root이며 view는 컴포넌트/hook 없는 순수 VDOM 생성 또는 cacheUpdate다. 행별 mount/resolver를 추가하지 않는다. 한 boundary의 노드는 한 번 mount하고 부모가 재생성/clone하지 않는 소유 범위다. 잘못된 item root는 오류로 처리하며 하위 VDOM의 component/portal 부재는 호출자 계약으로 둔다.
- 항목 갱신은 기존 자식 배열의 정확한 slot에 기존 diff/render로 반영하고 현재 parent getter를 연결한다. DOM 직접 쓰기는 하지 않는다. 자체 microtask로 invalidation을 중복 제거하며 구조 변경은 pending 항목 갱신보다 우선한다. throw/동기 재진입은 명시적 reject와 복구 규칙을 검사한다.
- disposal은 pending 작업을 무효화하고 데이터/Map/Set/VDOM 참조를 해제한다. nested component·SSR/HMR·concurrent 지원은 첫 프로토타입 비범위이며 제품 채택의 D3/D4 완료로 표시하지 않는다. 원본 base/concurrent/public exports/guard와 sibling은 유지한다.
- 비교는 원래 A 앱 B와 같은 row cache/view를 사용하는 C4 앱 C다. 같은 source core/toolchain으로 각각 production 빌드한다. 9 CPU 항목 양순서 B/C, 공식 메모리와 별도 retention을 수집한다. 정보 전달 API를 채택한 앱의 효과이며 기존 앱 무수정 코어 이득으로 표현하지 않는다. Vue/네 peer 재검증은 이 원리 검증 이후 단계다.

첫 실험 판단: [C4 보고서](../benchmark/C4_LIST_BOUNDARY_RESULTS.md)에서 main/reverse 가중 전체 −4.97%/−4.21%, pooled −4.72%다. 선택/partial 이득이 반복됐고 10k 메모리는 +0.93%다. 다음 설계 분기로 유지하며 기본 채택하지 않는다. 제품 API의 알림 누락·owner 수명/부모 재렌더·예외 복구·양코어 지원과 고정 peer 재비교는 열린 결정이다.

### DC-26-C4-P2 — owner와 갱신 배치 계약

R89~R94, IMPLEMENT E0~E4, M-22. 첫 실험의 raw node 대신 `boundary.View`를 렌더한다. controller는 원하는 items/indexes/dirty를, mount 세션은 현재 content·owner compKey·세대를 보유한다. 부모 updater는 같은 content를 돌려줘 전체 item map을 피하고, 실제 owner wrapper는 componentMap의 최신 vd로 찾는다. cleanup은 세션을 종료하며 명시적 dispose는 controller를 영구 종료한다. controller의 동시 두 mount는 거부한다. 같은 component identity/위치의 부모 renew를 지원하며, 다른 부모 subtree로 교체해 기존 owner cleanup보다 새 setup이 앞서는 handover는 지원하지 않는다. 이 경우 별도 commit으로 먼저 unmount한 뒤 remount한다.

- [x] P2-1: base의 needDiffRef를 save/restore하는 문맥에서 view와 diff를 처리한다. root는 기존 getKey로 검증하며 element와 component resolver를 허용한다. Fragment 다중 root는 keyed component가 감싼 경우를 검증한다. 단순 행은 컴포넌트로 감싸지 않는다.
- [x] P2-2: flush가 현재 items/indexes/dirty 배치를 분리한다. 변경 item은 index로 정렬해 콘텐츠/콜백을 좌→우로 처리한다. 따라서 slot lookup/view 수는 k이지만 정렬 비용은 O(k log k)다. lifecycle에서 발생한 set/invalidate는 다음 배치로 보존하고, 순수 view에서 쓰기는 거부한다. 구조 변경은 해당 배치의 item 알림보다 우선한다. view 오류는 batch를 다시 pending에 합쳐 명시적으로 재시도한다. diff/commit 오류는 fault로 잠그고 unmount/remount 뒤에만 재개한다.
- [x] P2-3: edit는 소유 item을 key로 찾고 fn 실행 뒤 invalidate하며 key 변경/throw도 알린다. edit는 이미 발생한 mutation을 rollback하지 않는다. 이번 CPU 앱은 첫 실험과 동일하게 set/invalidate를 사용하고 edit 자체는 정합성/브라우저에서 검증한다. 외부 mutation 자동 감지는 지원하지 않는다. 직접 invalidate API와 함께 비용을 공개한다.
- [x] P2-4: 첫 범위는 base다. concurrent/SSR/HMR·동시 다중 owner·일반 DOM 예외 rollback은 지원하지 않는다. 이 한계를 공개한 격리 결과를 얻은 뒤 공개 제품 API를 결정한다.
- [x] P2-5: 새 baseline/C4 P2/Preact class11을 같은 browser/runner/환경에서 비교한다. raw source·lock·peer install inventory·실제 번들을 고정하고 CPU870/메모리90 양순서와 별도 수명을 수집한다. 첫 C4 세션과 합산하지 않는다.

P2 진단에서 기존 base의 중첩 portal 삭제 한계를 확인했다. 일반 element 안의 portal은 바깥 element를 삭제해도 target의 내용이 남을 수 있으며, 기존 일반 컴포넌트 경로에서도 같은 관찰이다. P2가 만든 회귀로 분류하지 않으며 portal teardown 지원 완료를 선언하지 않는다. 별도 BUG-3 정합성 후속으로 남기고 이번 성능 후보에는 기본 코어 수정을 섞지 않는다.

P2 공식 수집 후 class 표현의 한 변수 진단(R95)을 추가한다. 같은 P2 소스에서 tr class의 비선택 값을 undefined에서 빈 문자열로만 바꾸며 current/empty를 새 production 빌드와 별도 staging으로 비교한다. DOM에서 class 문자열을 먼저 확인하고 공식9동작/keyed/font 뒤 선택25×2앱×2차수=100표본을 수집한다. 기본 앱과 P2의870/90표본을 덮어쓰거나 합산하지 않는다. 초기1k행 class 속성 수/생성 비용이 달라질 수 있어 선택 pilot만으로 채택하지 않는다.

P2 최종 판단: [보고서](../benchmark/C4_OWNER_RESULTS.md). 기존 앱 대비 전체 가중은 main−1.17%/reverse−4.82%/pooled−3.44%이며 차수별 크기가 다르다. Preact class 단독 대비7/9이고 선택1.233배·교환1.142배는 남는다. 기능 확장한 후보는 보존하되 기본 채택하지 않는다. 다음 C4 후보는 구조 검증의 추가 n회 Map.get/중복 keyOf를 key snapshot 증명으로 대체하는 한정 가설이다. 이득과 snapshot 쓰기/메모리 비용은 미검증이며 기존 Map/LIS 실험을 자동 반복하지 않는다. 선택의 PrePaint 사이 미포함 구간은 원인 미귀속으로 남긴다.

추가 class pilot은 +14.20%/−13.99%로 전체 방향이 갈려 미채택이다. 다중 DOM root 교체 실패 진단은 owner 재마운트로 복구됐으나 일반 rollback 보장은 아니다. 제품 공개 전 BUG-3, owner handover/clone·동기 edit/외부 알림·concurrent/SSR/HMR 계약을 확장해야 한다.

## DC-25 — 같은 순서 keyed 빠른 경로

2026-10-27 사용자 요청으로 설계에 착수했다. 기준은 최신 main `14d47e8`이며 compact13·native 이벤트·1.25.3 portal 수정과 base 출력 정책을 유지한다. 아래 결정이 과거 C2/DC-17/DC-22의 실험 선택보다 우선한다. → R72~R79, IMPLEMENT P0~P5, MANUAL M-20.

### 가설과 적용 범위

- 과거 [최종 비교 pooled](../benchmark/comprehensive-final-results.json)는 목표 6/9, partial −1.9%·swap −1.5%·select −21.2%의 추가 감소 필요를 보였다. 이는 후보 선정의 역사 근거이며 portal 수정·새 toolchain이 포함된 main의 현재 격차로 사용하지 않는다. 새 기준선에서 다시 계산한다.
- 후보는 [base diff](../../src/diff.ts)의 `diffLoopChildren` 매칭과 [base render](../../src/render.ts)의 `updateChildren` 순서/배치 재분석 생략을 묶는다. 같은 VDOM 조기 반환은 별도 정합성·부분 갱신 대조를 통과할 때만 포함한다. 일반 경로와 fallback은 계속 O(n)이며 행 하나의 변경을 O(1)로 만들었다고 주장하지 않는다.
- 과거 [keymatch 진단](../benchmark/FOLLOWUP_ANALYSIS.md)은 고유 key를 전제했고 공식 측정이 아니었다. [동일 VDOM 실험](../benchmark/PERFORMANCE_CLOSEOUT.md)은 select/swap/삭제 JS가 줄었지만 부분 갱신 전체 +7~10%로 기각했다. DC-22 C2(K)도 JS 개선을 전체 이득으로 입증하지 못했다. 새 결합 후보의 효과와 비용은 현재 해시에서 다시 측정한다.

### 결정 대장

- [x] **DC-25-1 중복 key 유지:** 사용자 선택(2026-10-27). 첫 등장 소비와 SameValueZero를 보존한다. 중복이면 기존 경로로 전환할 수 있으며 위치 매칭/개발 경고로 계약을 바꾸지 않는다. → R74, P1/P2/P4, M-20-2.
- [x] **DC-25-2 초과 후보도 실측:** 사용자 선택(2026-10-27). 기존 base 4,824B·concurrent 9,000B·element 1,000B guard와 출력 정책을 유지하고 초과를 공개한다. 소폭 초과 후보도 CPU/메모리까지 평가한다. 최종 한도 변경/allowance는 결과 뒤 판단할 TBD이며 사전 숫자 여유를 만들지 않는다. 과거 4,819B/여유 5B는 P1에서 재확인한다. → R77, P1/P3/P5, M-20-5.
- [x] **DC-25-3 측정 계약:** 기존 RC-5 목표를 유지한다. 같은 새 환경의 baseline/candidate CPU 9항목×양순서·공식 메모리·retention, 이어 최종 후보/고정 네 peer 재비교를 수행한다. 계측 카운터는 시간 표본과 분리하고 원래 앱을 고정한다. → R72/R78, P1/P3, M-20-1/6.
- [x] **DC-25-4 첫 격리 후보 확정(2026-10-27):** 원본 key를 기존 순서로 한 번 읽어 index snapshot과 Set 유일성 검사를 만든다. dense·고유 key·동일 길이에서 새 key를 기존 callback 교차 순서로 비교하고, 중간 mismatch는 남은 snapshot으로 Map을 만들어 처리한 prefix를 재실행하지 않는다. 중복/혼합/길이 차이는 처음부터 일반 매칭이다. 새 원본 snapshot/Set의 생성·메모리 비용도 계수한다. 증명은 list의 희소 `so`(root frame)/`sc`(정확한 children) 두 필드에 두고 공통 factory는 확장하지 않는다. root frame은 ready/invalid만 보유해 다른 subtree를 강하게 붙잡지 않는다. 이전 WeakMap 방식의 생성/stage/get/delete 비용을 피하려는 선택이며 속도·메모리 우월성은 아직 미측정이다. 수명/shape 대조에 실패하면 보류한다. → R74/R75, P2/P4, M-20-2/3.
- [x] **DC-25-5 첫 후보에서 조기 반환 제외:** 동일 객체라도 기존 타입 비교가 children getter를 읽는다. 기준/후보의 관찰 회귀는 통과했으며, 비교 전 단순 반환을 넣은 negative control은 getter 읽기 0회로 실패했다. 이 shortcut은 R74를 위반하므로 시간 측정 후보에 넣지 않는다. 관찰을 보존하는 다른 반환 위치까지 불가능하다고 주장하지 않는다. → R73/R75, P2/P4, M-20-3.
- [x] **DC-25-6 첫 후보는 base만 최적화:** concurrent의 기존 프레임/매칭 경로는 유지한다. `so/sc`는 공유 factory에 추가하지 않고 새 utility는 concurrent에서 사용하지 않는다. 후보 shared 타입/유틸을 연결한 frozen concurrent 347회귀가 통과했다. 실제 통합 시 concurrent bundle hash 및 중단/commit/abandon을 P5에서 다시 확인한다. → R76, P4/P5, M-20-4.

- [x] **DC-25-7 첫 후보 미채택:** pooled 가중 전체 −0.171%, main +0.402%/reverse −1.260%로 방향이 다르고 baseline/candidate 목표 모두8/9다. partial/select JS는 줄었지만 select 전체는 pooled +2.775%였고 size는 +268B다. 개별 회귀/size만으로 탈락시킨 것이 아니라 전체 이득과 목표 개선 근거가 부족해 기본 runtime·guard를 유지했다. 구현·원자료·후보 patch와 full 검증은 [결과](../benchmark/DC25_KEYED_FAST_PATH_RESULTS.md)에 보존했다. → R77~R79, P3/P5, M-20-5~7.

### 매칭과 render 사이의 계약

1. **관찰 순서를 먼저 고정한다.** 현재 base는 원본 children의 key를 읽어 Map을 만든 다음 새 children을 읽고, 새 key 조회와 자식 diff/사용자 콜백을 좌→우로 교차 실행한다. concurrent의 기존 차이는 별도로 기록한다. 두 배열의 key를 미리 전부 읽는 preflight나 getter를 다시 읽는 Set 검사는 동등하다고 가정하지 않는다.
2. **중복과 mismatch를 안전하게 처리한다.** 기존 key 관찰에서 얻은 정보로 유일성과 위치를 증명할 수 있는지 검토한다. snapshot·Set·추가 배열이 필요하면 비용도 계수한다. 콜백이 뒤 key를 바꾸거나 중간 mismatch가 나면 처리한 prefix를 재실행하지 않고 기존 첫 등장 매칭/삭제 결과를 이어가야 한다. 이를 만족할 설계가 없으면 Map 생략은 보류한다.
3. **성공한 현재 결과에만 순서 증명을 붙인다.** 같은 길이·현재 매칭의 모든 `origIndex === index`, 직접 결과 `N/U/T`, 추가/삭제/교체/이동 없음과 직접 portal 제외를 첫 범위로 한다. 미사용 자식 정리와 root diff/부모 연결 게시까지 성공해야 render가 사용할 수 있다. 하위 컴포넌트의 출력 arity 변화는 기존 content 경로로 처리한다.
4. **수명을 제한한다.** 정확한 list node/children 및 갱신 세대에 연결하고 DOM setter/사용자 callback 실행 전에 한 번 소비한다. root 종료/throw·중첩 renew·삭제·clone·wrapper 교체·concurrent abandon에서 폐기한다. node metadata를 쓰면 모든 WDom의 shape를 넓히는 비용과 clone 전파 방지·in-place mutation의 검출 범위를 명시한다. 과거 DC-17의 root-scoped sidecar는 비교안이며 자동 채택하지 않는다.
5. **생략 범위를 제한한다.** 증명이 있으면 render의 `matchedIndexes`/`oiSeq`·movers/created·LIS/placement 재분석 중 불필요한 부분만 생략한다. 콘텐츠 좌→우 방문, 전체 자식 `clearDiffMeta`, 마지막 `execMountedQueue`와 하위 Fragment/portal/입력 갱신은 유지한다. 증명이 없으면 기존 render를 사용하며 이미 끝난 diff를 다시 실행하지 않는다.
6. **동일 VDOM 반환은 별도 증명한다.** baseline은 같은 객체에서도 `nr='N'`과 상속 metadata를 설정한다. 반환 위치를 앞당겨 이 처리를 누락하면 과거 `oi/nr`가 남을 수 있다. empty·같은 객체의 다른 위치 재사용·retired/hoisted node·자체 renew·mutable props/slots를 기준과 대조하고, 필요한 정리를 포함한 후보를 평가한다.

격리 후보의 증명 필드는 typeUpdate에서 props/DOM callback 전에 로컬로 옮기고 비운다. updateChildren은 기존 위치에서 children을 한 번 읽은 뒤 frame/배열을 재검증하므로 extra children getter를 만들지 않는다. 중첩 replace는 바깥 frame을 invalid로 만들고, root finally는 성공/실패 모두 현재 frame을 invalid로 만든 뒤 이전 frame을 복원한다. cloneWDom의 명시적 필드 복사는 `so/sc`를 복사하지 않는다. 미방문 list에 남은 무효 frame은 다른 노드나 root를 참조하지 않으며, 다음 render에서는 사용할 수 없다. filter 생략은 모든 위치를 매칭하고 원본 길이가 여전히 같을 때만 허용하며 빈 삭제 처리의 부모 탐색 시점은 유지한다.

### 검증·채택 경계

- 기준 회귀는 `core-keyedConsumption`, `core-placementProof`, `core-cachedIdentity`, loop move/lifecycle, structural/fuzz, `core-portalSiblings`를 양코어에 확보한다. 빠른 경로 hit/miss, 중복/falsy/NaN/±0/object/Symbol, mixed/empty, getter/throw·뒤 key mutation, focus/native events·좌→우 callback/cleanup, 자체 renew·reentry·실패 복구를 추가한다.
- 카운터로 Map/Set/snapshot·key 접근·diff/content 방문·배치 배열·proof 생성/소비/폐기와 fallback 비용을 귀속한다. 변경 수만큼만 방문한다고 추론하거나 개별 후보의 과거 개선율을 합산하지 않는다.
- 공식 baseline/candidate CPU는 2조건×양순서 총 580표본, 메모리는 60표본을 기본 계획으로 삼는다. 별도 retention은 조건별 3 fresh contexts다. 최종 baseline/candidate/네 peer는 6조건×양순서 CPU 1,740·메모리 180을 계획한다. 동일 해시/환경 표본의 재사용은 수집 전에 범위와 시간 간격을 manifest에 정하며, 그 외에는 새로 수집한다. 실제 러너 표본 수를 P1에서 대조한다.
- 항목별 전체·JS·paint, 순서별/pooled 중앙값과 분포, 메모리 절대 MB, raw/gzip/br를 공개한다. 9/9 목표와 후보 채택은 구분한다. 일부 손해는 공개 후 판단하고 정합성 실패는 채택을 막는다. 이득이 불확실하면 후보·증거를 보존하고 기존 경로를 유지한다.

## TODO — 미착수 후속 작업

DC-25 첫 후보는 위 정식 설계/측정 뒤 미채택으로 종료했다. 후속 구현 후보는 아직 선택하지 않았으며 DC-26에서 C4 계약 설계와 별도 compiler 조사를 제안했다. 아래 BUG-1/출력 절감은 완료 이력이며 1.25.3에 배포되어 있다.

### BUG-3 — 일반 element 아래 중첩 portal의 삭제 (미착수)

C4 P2의 별도 baseline 진단에서 일반 li 안의 portal button이 li 제거 뒤 target에 남았다. 변경 없는 일반 mount/renew 경로에서도 재현되므로 C4가 만든 회귀로 분류하지 않는다. 현재 증거는 `experiments/c4-owner/check.mjs`의 portal 관찰과 P2 보고서다. base를 먼저 재현했으며 concurrent의 동일 증상과 해결은 아직 검증하지 않았다. portal teardown 제품 지원과 별도 정합성 후속으로 추적하고 이번 성능 후보에 core 수정을 섞지 않는다.

### BUG-2 — concurrent의 실제 sparse array hole (미착수)

- 기존 dense keyed 배열과 길이가 같은 다음 배열에 실제 hole이 있으면 base는 대응 DOM을 삭제하지만 현재 concurrent frame은 undefined를 노드로 방문해 `undefined.type` TypeError를 던진다. null/undefined 값으로 채운 dense 배열과는 다르다.
- `src/tests/core-keyedFastPath.test.tsx`는 각 코어의 기존 관찰을 구분해 기록한다. 이 예외를 새로운 지원 계약으로 확정한 것이 아니며, 후속 수정에서는 기대값을 함께 갱신한다. DC-25 후보와 무관한 기존 경로라 이번에는 수정하지 않았다. → [한계/원자료](../benchmark/DC25_KEYED_FAST_PATH_RESULTS.md#관찰된-한계와-준비-실패).

### BUG-1 — portal 대상이 형제 DOM처럼 쓰이는 문제 (정합성, 수정함)

- 증상(처음 발견): 부모 children이 `[p, null, portal(...), em]`일 때 `null` 자리가 컴포넌트로 바뀌면 `insertBefore`가 `NotFoundError`를 던지고, 그다음 갱신에서 `p`, `em`이 DOM에서 사라진다. jsdom·Playwright Chromium에서 재현했고 배포판 `lithent@1.25.2`에도 있다.
- 원인: portal 노드의 `el`은 부모 안의 DOM이 아니라 **portal 대상 컨테이너**다. 렌더 코드 여러 곳이 이를 형제 DOM처럼 다뤘다. 회귀 테스트를 쓰며 같은 원인의 증상을 더 찾았다.

| 증상                                                                                   | base 수정 전 | concurrent 수정 전    |
| -------------------------------------------------------------------------------------- | ------------ | --------------------- |
| A. portal 앞에 새 노드를 넣을 때 portal 대상을 기준점으로 사용                         | 실패         | 통과(`parentEl` 검사) |
| B. portal을 품은 keyed 컴포넌트가 이동하면 portal 대상 컨테이너가 목록 안으로 옮겨짐   | 실패         | 실패                  |
| C. portal 삭제 시 자식 수가 같으면 부모의 다른 형제까지 일괄 삭제                      | 실패         | 실패                  |
| D. 같은 자리에서 portal ↔ 요소/컴포넌트 전환 시 새 노드가 그려지지 않음               | 실패         | 실패                  |
| E. portal을 품은 컴포넌트/keyed 행 삭제 시 portal 대상 컨테이너 자체가 문서에서 제거됨 | 실패         | 실패                  |

- 수정(양코어 동일):
  - 공용 `checkPortalElement`(`src/utils/predicator.ts`)를 추가했다. `el`이 그 노드를 만든 props(`props.portal`)나, 교체·삭제 중인 노드가 아직 들고 있는 이전 portal props(`op.portal`)의 대상과 같은지로 판정한다.
  - 기준점 탐색(`findChildFragmentNextElement`)과 이동(`getElementFromFragment`)에서 portal을 건너뛴다.
  - 삭제(`deleteRealDom`, `findChildWithRemoveElement`)는 portal의 자식을 portal 대상에서 지우고, 대상 자체는 남긴다. 일괄 삭제 판정도 portal 대상의 자식 수로 한다.
  - portal이 교체에 끼면 `typeReplace`가 삭제 후 추가로 처리한다.
  - diff가 portal을 대체하는 새 노드에 `tag='portal'`을 덮어쓰던 코드는 제거했다. 삭제 판정은 이제 `op`로 한다.
- [x] BUG-1-1 수정과 양코어 회귀 11개(`src/tests/core-portalSiblings.test.tsx`). 수정 전 base 10개, concurrent 6개가 실패했다. 1개는 대상의 다른 내용을 지우지 않는지 보는 안전장치다.
- [x] BUG-1-2 검증: 전체 build, `pnpm test` 996 passed / 기존 3 skipped(이전 974 + 신규 11 × 2코어), base SSR 15, concurrent satellites 172, Playwright 78 passed(retry 0), strict tsc(base/concurrent/e2e), 변경 파일 ESLint·Prettier, `pnpm verify:concurrent`. Chromium 재현 스크립트도 수정된 UMD에서 오류 없이 통과한다.
- [x] BUG-1-3 크기: 수정만으로는 base UMD Brotli 4,824→4,860B(+36B)로 guard를 넘었다. 사용자 결정으로 아래 출력 절감을 함께 채택해 4,819B다. concurrent는 6,903→6,935B(+32B)로 예산 안이다. 성능 측정은 하지 않았다. 바뀐 경로는 portal 판정 비교 몇 개뿐이다.
- portal 수정과 동작 변화(D·E)는 [CHANGELOG 1.25.3](../../CHANGELOG.md)에 반영되었다.

### 크기 후속 (채택함)

BUG-1 수정이 들어간 코드 기준 base UMD Brotli다. 출력 후보의 근거와 채택 전 검증 목록은 [재확인 결과](../benchmark/BUNDLE_SIZE_RESULTS.md#재확인--2026-10-26)에 있다.

| 선택                                            | Brotli | 4,824B guard                |
| ----------------------------------------------- | -----: | --------------------------- |
| 수정만                                          | 4,860B | 36B 초과                    |
| 수정 + 구문 4종 + Module 태그 제거              | 4,819B | 통과(여유 5B)               |
| 수정 + 구문 4종 + Module 태그 제거 + hidden map | 4,791B | 통과(4,800B reference 아래) |

- [x] 사용자 결정(2026-10-26): **수정 + 구문 4종 + Module 태그 제거**를 채택했다. `vite.config.js`의 UMD 후처리 compress를 `booleans`·`lhs_constants`·`if_return`·`join_vars`만 켜고, Rollup `output.generatedCode.symbols: false`로 UMD/CJS의 `Symbol.toStringTag: "Module"`을 뺐다. guard 4,824B는 그대로이며 여유는 5B다. hidden map은 쓰지 않아 소스맵 자동 연결이 유지된다. 검증은 IMPLEMENT S5.

## DC-24 — 번들 출력 후보 조사

- [x] DC-24-1. 현재 native 코드/compact13을 고정하고 source map 연결 주석, 안전한 identifier/reprint 옵션부터 비교한다. source map 파일 생성과 번들의 자동 연결을 구분한다.
- [x] DC-24-2. parent getter의 독립 scope를 유지한다. 전체 compress 기본값, closure inlining/collapse, 공개 property mangling은 안전한 절감으로 취급하지 않는다. 제한된 구문 압축은 별도 후보로만 측정한다.
- [x] DC-24-3. 실제 빌드12개·여섯 형식의 동일 실행 AST/map과 크기/대가를 확인했다. 기본 빌드는 유지하며 구문 후보는 정적 검사만 통과한 미채택 상태다. → M-18.

- [x] DC-24-4. 사용자 후속 결정으로 추가 번들 축소를 보류하고 현재 기본 빌드를 유지한다. hidden map/구문 압축은 미채택 조사 결과로만 보존한다.
- [x] DC-24-5. 사용자 요청으로 독립 재확인했다. Terser flag 29개를 하나씩 재서 구문 4종(−24B)을 찾았고, Rollup Module 태그 제거(−22B)를 추가 후보로 확인했다. 둘을 합치면 4,778B, hidden map까지 합치면 4,748B다. 함수·scope 구조는 그대로다. 전체 compress(−102B)는 함수 33개를 옮겨 제외했고, 소스 편집 3종은 모두 Brotli가 늘었다. → [재확인](../benchmark/BUNDLE_SIZE_RESULTS.md#재확인--2026-10-26).
- [x] DC-24-6. 사용자 결정으로 구문 4종 + Module 태그 제거를 기본 빌드에 채택했다(BUG-1 수정과 함께 4,819B). hidden map은 채택하지 않았다. → 위 TODO 크기 후속, IMPLEMENT S5, M-18.

## DC-23 — native 이벤트 복원

- [x] DC-23-1. 사용자 승인으로 compact13 유지 + proxy 제외를 확정했다. cached 공식 benchmark에 확실한 추가 이득이 없고 크기·heap·dispatch·native 연동 복잡성이 늘어난 점을 우선한다. inline UI partial/select의 과거 전체 −5.22%/−9.44% 이득은 포기하는 교환이다.
- [x] DC-23-2. `src/render.ts`, `lithentConcurrent/src/render.ts`, `src/hook/internal/unmount.ts`를 `fb481f3`와 정확히 일치시킨다. `src/utils/event.ts`만 제거한다. on\* 이름 소문자 정규화와 native add/remove, portal target의 원 callback 제거를 복원한다. compact13과 다른 실험은 건드리지 않는다.
- [x] DC-23-3. 원 함수/handleEvent 객체 identity·중복 등록·제거·교체 후 listener 순서를 native에 맡긴다. trusted target dispatch 도중 교체되면 그 클릭에서 새 callback이 실행되지 않을 수 있고, 다음 클릭에서 실행된다. ancestor에 도달하기 전 교체한 경우는 native propagation 규칙을 따른다. capture/passive/once는 기존 ref/mountCallback으로 설정한다.
- [x] DC-23-4. proxy 구현은 `experiments/comprehensive/event.ts`와 커밋 `95d6faf`에 보존한다. alias/trusted/error/portal/frozen Event 회귀는 유지하고 proxy 전용 기대값만 native 계약으로 바꾼다. 외부 remove/dedup 및 교체 후 순서 회귀를 추가한다.
- [x] DC-23-5. 고정 B source/ESM/UMD/CJS 일치·크기 감소·최종 검증을 보고서로 연결하고 native B의 기존 peer 목표 결과를 명시한다. → IMPLEMENT DC-23, MANUAL M-17.

이 결정이 아래 DC-22 기본 proxy 채택을 대체한다. DC-22 표와 이력은 당시의 유효한 측정·선택으로 보존한다.

## 1. 실제 경로와 정보의 한계

원래 앱의 선택·부분 갱신은 Table의 `renew` → `rows.map(row.view)` → `cacheUpdate` 의존 배열 검사 → `diffLoopChildren`의 이전 key Map/전체 매칭/미사용 삭제 검사 → `updateChildren`의 목록 처리로 흐른다. 캐시 적중이 하위 재귀를 줄여도 행별 입구와 목록 처리가 남는다.

행별 `renew`는 Table 전체 재실행을 피하지만 [replaceWDom](../../src/wDom.ts)의 부모 `children.indexOf(originalWDom)`와 `syncAncestorComponentChildren`의 조상 slot 배열 `indexOf`를 수행한다. 따라서 현재 행 선택을 엄밀한 O(1)로 설명할 수 없다. 행 컴포넌트 수만큼 wrapper·hook 상태·갱신 함수·수명 정리도 생긴다.

코어가 새 children 배열을 받는 일반 경로에서 변경 범위는 알려져 있지 않다. 동일 길이·같은 props 참조·같은 VDOM 객체만으로 전체 처리를 안전하게 생략할 수 없다. 기존 empty 전환, 다른 위치 재사용, mutable props, slots, update callback과 자식 자체 갱신 계약을 먼저 적용해야 한다.

## 2. 후보 묶음과 우선순위

아래 C1~C4는 기존 내부 후보의 설계와 이력이다. [DC-22](#dc-22--별도-브랜치를-포함한-종합-반영) 당시 우선순위는 flat 이벤트 수정 → compact13 위 C2 재평가 → 결합 비교였다. DC-25의 같은 순서 keyed 결합 후보는 미채택으로 종료했다. 현재 분석과 후속 제안은 위 DC-26을 따른다.

Phase 1에서 선택했던 C1과 후속 C3 base 한정 프로토타입은 검증 후 기본 채택을 보류했다. **DC-12의 별도 렌더러 격리와 비참여 비용 대조까지 완료했다**. DC-13의 같은 행 앱 기능 대조·DC-14의 heap 귀속·DC-15 실제 캐시 대조까지 완료했다. 현재 C3는 기존 앱 개선안으로 채택하지 않는다. DC-16 전체 peer 기준과 별도 진단 뒤 DC-17 C2의 root-scoped sidecar base 프로토타입을 격리 구현했다. shared229+수명4=233회귀·타입/빌드는 통과했지만 br4,952/4,800B여서 당시 프로토타입은 미채택이고 공식 성능은 미측정이다. C4는 조건부 연구다. 모든 후보를 무조건 구현하는 계획으로 해석하지 않는다.

| 후보                                               | 줄이려는 작업                                           | 필요한 정보                                                | 한계와 진입 조건                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **C1. 컴포넌트의 부모 위치 연결 개선**             | 자체 renew마다 부모/조상 배열에서 이전 노드를 찾는 비용 | 현재 live component, 소유 부모, 검증 가능한 위치           | 원래 Table-only 앱의 주요 비용을 해결하지 않음. 행별/일반 자식 갱신에서 검색 작업량이 확인될 때 구현          |
| **C2. 순서 유지 keyed 목록의 대조·배치 경로**      | DC-17에서는 render의 인덱스/임시 배열·배치 판정 중복만  | 현재 general diff 결과의 같은 길이/원래 인덱스·구조 유지   | Map/used/filter와 전체 content 방문은 남음. 1,000행 방문 제거라고 주장하지 않고 sidecar 유지비까지 검증       |
| **C3. 명시적 컴포넌트 부모 갱신 생략 계약**        | 부모 구조 갱신 때 이미 유지되는 자식 updater 재실행     | incoming props로 평가한 선언 의존성/스냅샷과 현재 인스턴스 | base의 새 setup hook으로 한정 설계. nonempty slots는 fallback. 행 컴포넌트 생성·메모리 비용이 남음            |
| **C4. 구조 변경과 항목 변경을 분리하는 목록 계약** | 리스트가 불변일 때 전체 key 대조·변경 행 탐색           | 모든 구조 변경을 포착하는 소유권과 명시적 변경 항목        | 가장 큰 구조 변경. 임의 mutable 배열에 자동 적용 불가. C1~C3의 한계와 일반 사용 사례가 입증된 경우에만 구체화 |

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
- 비용: 최상위 WeakMap, 첫 실제 자체 갱신의 내부 WeakMap, 매 검색의 get/set·identity 검사와 warm hit·cold/stale fallback을 분리한다. original/Table의 한 요소 검색에는 추가 비용만 생길 수 있으며, nested 입력의 slot 검색과 render 앵커 검색은 남는다. 이 C1 실행 당시에는 전체 시간·생성/삭제·메모리·raw/gzip/br를 기록하고4,800B 초과 후보를 미채택으로 보존했다. 현재 후속의 크기/평가 정책은 R11/R34다.

검증: M-3·M-4·M-6, `core-parentChildSync`, `core-mixedComponentUpdate`, `core-composedRenew`, `core-removedRedraw`, `core-cachedIdentity` 및 concurrent 폐기/commit 동등성 테스트. 별도의 비벤치마크 예제로 nested slots 안의 여러 입력 필드를 갱신한다.

### C2 — 순서 유지의 증명과 fallback

대상은 `src/diff.ts:diffLoopChildren`, `src/render.ts:updateChildren`와 수명을 감싸는 `src/wDom.ts:replaceWDom`다. 대응 concurrent는 기준 회귀를 먼저 확인하며 첫 후보에서는 수정하지 않는다. 배열 할당 시점만 미루던 ordered 후보와 달리 **현재 general diff의 대조 결과를 render가 재분석하지 않도록 전달할 수 있는지** 검토한다. 초기 DC-10의 uniqueness/사전검사 검토는 이력으로 보존하고, 현재 범위와 수명 계약은 DC-17로 대체한다.

1. 기존 general diff를 그대로 한 번 수행한다. 이 단계의 updater·pre callback·미사용 자식 unmount/DOM 삭제를 사전 검사 앞으로 옮기거나 되돌리지 않는다. 증명이 없을 때의 fallback은 같은 diff 결과를 기존 render에 보내는 것이며 general diff를 재실행하지 않는다.
2. 길이와 위치별 키 동일성만으로 중복 키의 첫 등장 소비를 보장하지 못한다. DC-17은 uniqueness Set/캐시를 만들지 않고 기존 Map이 결정한 각 `origIndex === index`를 누적한다. 키 Map 생성·get/delete·used/filter와 key 접근 순서/횟수는 유지한다.
3. Map의 SameValueZero 의미(NaN 포함), falsy·Symbol·object·혼합 키를 보존한다. 중복/키 변경은 기존 매칭 결과로 판단하며 별도 key preflight를 하지 않는다. 길이 차이, unmatched, 원래 인덱스 불일치 또는 구조 변화가 있으면 기존 render 경로를 사용한다.
4. 직접 자식의 결과는 `N/U/T`만 허용하고 `A/D/R/S`·직접 portal·증명하지 못한 구조는 제외한다. 같은 wrapper의 하위 출력 arity·Fragment 변화는 기존 content 갱신으로 처리하되 경계·focus·수명 회귀를 통과해야 한다. 같은 위치가 하위 DOM 불변을 뜻하지 않는다.
5. 콘텐츠는 기존 좌→우 순서로 처리하고, keyed 경로의 전체 자식 `clearDiffMeta`와 `execMountedQueue`를 같은 시점에 실행한다. 구조가 바뀌거나 증명이 무효화되면 현행 LIS/배치 경로를 사용한다. 기존 non-keyed 조기 return을 그대로 재사용하지 않는다.

**가설:** 목록 전체의 O(n) 검사는 남지만 render의 중복 처리·할당을 줄일 수 있다. root frame/WeakMap의 생성·조회·삭제와 fallback 비용이 더 클 수도 있다. 실제 생략량과 정합성/빌드·크기 비용 공개 뒤 공식 전체 시간을 확인하기 전에는 성능 이득을 주장하지 않는다. 기존 DC-17은 당시 size 종료 정책의 미측정 결과이며 현재는 R11/R34에 따라 필요하면 독립 재평가할 수 있다.

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

첫 구현 결과: [C3 보고서](../benchmark/PARENT_MEMO_RESULTS.md)의 전용 **33회귀**·기존 dual **1,070 passed/3 skipped**·실제 패키지 타입/exports·B3를 통과했다. 동일 입력 UI의 3조건×3context에서 부모 refresh 자식 updater 1,000→0회, 한 props 변경 1,000→1회를 확인했다. key 1,000개 유지 후 dispose/GC에서 등록·관찰한 VDOM/host 잔류 0개였다. 당시 공식 시간은 측정하지 않았다. 후보 br **5,691B**는 한도 +891B여서 기본 채택을 보류하고 runtime을 복원했다. 이후 비참여 앱 비용은 아래 DC-12에서 측정했으며 memo를 쓰는 통제 행 앱은 DC-13에서, 원래 캐시 앱과의 동차수 대조는 DC-15에서 측정했다. 기존 앱 대비 손해로 현재 C3는 미채택이다.

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

가중 전체 개선과 개별 상대 성능을 함께 본다. 생성·clear가 느려지거나 메모리가 늘어도 자동 탈락시키지 않는다. 사용자 후속 지시에 따라 렌더 성능을 우선하며4,800B 소폭 초과만으로 실제 CPU/메모리 평가를 중단하지 않는다. raw/gzip/br와 초과량을 공개하고 실제 이득·손해 뒤 최후에 크기 교환을 판단한다. 영구 새 숫자 예산은 미정이고 기존 script 결과를 통과로 바꾸지 않는다. 작다는 이유의 자동 채택이나 무관한 코드 골프도 허용하지 않는다.

## 5. 설계 결정 대장

체크는 **결정이 닫혔음**을 뜻하며 구현·검증 완료가 아니다.

- [x] **DC-1 확정:** C1/C2 내부 후보와 C3/C4 추가 정보 후보를 분리한다. C1과 C3 base 한정 후보는 각각 독립 검증 후 기본 채택 보류였다. 당시 미구현이던 C2는 이후 DC-17에서 root-scoped sidecar base 후보로 격리 구현했지만 size gate 실패로 이번 프로토타입을 미채택했다. C3 별도 렌더러 격리·비참여 비용과 DC-13 통제 앱의 기능 이득/비용을 검증했다. DC-15에서 원래 캐시 앱 대비 전체 손해를 확인했다. 근거: 원래 앱과 row-renew의 비용 발생 지점이 다름. → Phase 1~3, M-2.
- [x] **DC-2 확정:** 기본 동작의 불명확한 identity/props 생략 금지, 증명 불가 시 기존 경로 사용. 근거: cached identity·keyed 소비 테스트. → Phase 2·5, M-3~M-5.
- [x] **DC-3 확정:** base와 concurrent의 관찰 가능한 계약을 각각 검증한다. 성능 측정은 우선 base이며 concurrent 개선을 추론하지 않는다. → Phase 2~6, M-6.
- [x] **DC-4 한정 후보 확정:** base root의 새 setup hook `useParentMemo`로 부모 기인 갱신만 생략한다. 복사 deps·무효화/fallback·self 우회·hit/miss callback/배칭·성공 게시·실패/삭제 소유 계약은 위 C3 절이 정본이다. 기존 helper로는 pre callback/updater 진입을 막거나 self를 구분할 수 없어 새 코어 경계를 택했다. **한정 구현·동작/회수·B1/B3와 DC-12의 비참여 비용 검증은 완료했다. DC-13 통제 앱의 기능 시간을 측정했고 크기 초과로 기본 채택은 보류했다. DC-15 원래 앱 대조는 완료했고 종단 손해로 현재 C3는 미채택이다. API 배포는 미완료다.** → C3-T1~T7, M-4·M-6·M-8·M-9.
- [ ] **DC-5 TBD:** C4의 목록 소유권/변경 정보/무효화·fallback 계약. C3까지로 목표에 접근 가능한지 본 뒤 분기. → Phase 3, M-4·M-9.
- [x] **DC-6 C1 한정 후보 확정:** base의 정규화된 parent.children만 lazy `WeakMap<CompKey, WeakMap<WDom[], number>>` sidecar로 조회한다. 현재 배열·original identity 검증 뒤 성공 위치만 저장하고 stale/compKey 없음은 native fallback이다. slot은 alias의 첫 등장 증명 부족으로 기존 검색, concurrent는 commit 소유 경계가 달라 미수정이다. 고정 WDom/ComponentInfo/public API 변경·전체 hint 재작성 없이 cold/warm/stale·추가 WeakMap·크기/회수를 검증한다. 근거는 위 한정 후보 계약과 Phase 1 작업량이다. **C1 한정 구현·검증은 완료했고 기본 채택은 보류했다. [실측](../benchmark/PARENT_POSITION_RESULTS.md)을 참조한다.** → Phase 2, M-2·M-3·M-8.
- [x] **DC-7 확정:** 기존 retainedView/renderBoundary와 새 memo 의미를 구분하며 benchmark 주석 회피를 설계 동기로 삼지 않는다. → Phase 3·6, M-6·M-9.
- [ ] **DC-8 조건부 TBD:** C1 slot 검색 확장의 첫 등장/alias 불변식과 invalidation. 이번 부모 전용 후보에는 포함하지 않으며 재개 시 구현 전에 확정한다. → M-3·M-4.
- [ ] **DC-9 조건부 TBD:** C1 concurrent 이식의 live 소유, commit publication·abandon 및 메모리 비용. 이번에는 기존 경로를 유지한다. → M-6·M-8.
- [ ] **DC-10 역사적 조건부 TBD:** 초기 C2의 uniqueness/순서 사전 증명·제거 작업·추가 비용 연구다. 이 방식은 보류하며 현재 실행은 기존 general Map 결과만 사용하는 DC-17로 대체한다. DC-17 채택이 uniqueness 방식의 구현/검증 완료를 뜻하지 않는다. → Phase 2, M-2·M-3.
- [ ] **DC-11 조건부 TBD:** C3 concurrent 지원의 work-in-progress snapshot 소유·commit 게시·abandon 폐기·boundary 상호작용. 첫 base 후보에는 포함하지 않으며 concurrent는 새 hook을 export하지 않는다. 재개 시 기준선의 두 번 실행·callback 불가역 부작용까지 별도 결정한다. → C3-T1·T4·T5, M-6·M-8.
- [x] **DC-12 첫 격리 후보 확정:** 검증된 C3 source를 독립 staging에서 재빌드하는 별도 실험 렌더러를 선택한다. default source/bundle과 public exports는 보존하고, 선택한 렌더러 내부의 비참여 비용은 원래 앱 양순서 CPU 대조로 따로 측정한다. 아래 DC-12 절이 정본이다. 첫 격리 후보의 한정 검증은 완료했다. 새 subpath·예산 상향·최종 채택은 미정이다. → R18~R20, C3-T7, IC-3, M-1·M-6~M-9.
- [x] **DC-13 기능 대조 확정:** 동일 isolated renderer와 행 컴포넌트 앱의 memo on/off를 비교한다. HTML의 시작 설정만 다르고 production JS는 바이트 단위로 같아야 한다. 아래 DC-13 절과 R21/R22가 범위다. [통제 앱 실측](../benchmark/PARENT_MEMO_OPTIN_RESULTS.md)의 CPU580·공식 메모리60·100회 churn까지 완료했다. DC-13만으로 원래 앱 이득을 판정하지 않았고 후속 DC-15에서는 기존 앱 대비 손해를 확인했다. 기본 채택은 하지 않는다. → Phase4, M-4·M-7·M-8.

### DC-12 — 별도 렌더러로 기능을 격리하는 첫 후보

기본 코어에 optional dispatcher/capability 분기를 추가하는 안은 비사용자에게도 비용이 생기고 2B 여유 안에서 보존할 근거가 없다. compile-time flag로 기존 함수를 감싸는 안도 출력/호출 경로가 같아진다는 증명이 필요하다. 첫 대조는 **기본 코어를 수정하지 않는 별도 실험 렌더러 빌드**로 선택한다. 이는 opt-in 렌더러 내부의 비참여 컴포넌트 비용을 없앤다는 주장이 아니다.

- `experiments/parent-memo-isolated/build.mjs`가 이전 C3 압축 증거의 SHA-256을 검사하고 검증된 `candidate/src/` 17파일을 새 임시 source tree로 복원한다. 알고리즘/메타데이터/실패 의미는 첫 C3와 같다. 중복된 수동 fork를 repo에 두지 않고 원본 후보 해시를 manifest에 연결한다.
- staging source로 ESM/UMD/CommonJS와 declarations를 재빌드한다. default source/세 번들은 그대로 두며 기존 baseline 28파일의 전후 해시를 검사한다. 생성된 private package/명시적 bundler alias만 실험 진입점으로 사용하고 repo의 public exports는 바꾸지 않는다.
- 새 렌더러는 자체 componentMap·Fragment·queue를 가진다. 앱과 helper/JSX의 bare core import는 같은 렌더러로 alias해야 한다. default h/mount 안에서 isolated hook을 호출하는 혼용은 setup 오류로 드러나야 한다. 기존 `createRetainedView`/concurrent render boundary의 의미는 바꾸지 않는다.
- B1: 이전 C3 전용 33개를 staging alias로 재실행하고 공유 core suite·기존 dual도 확보한다. B2: 재빌드한 타입·package maps·일반 base의 size/hash와 별도 번들의 실제 전체 크기를 확인한다. B3: 같은 일반 입력 UI 9context 및 같은 원래 앱의 contracts/keyed/9동작/font를 확인한다.
- 비용 대조는 같은 원래 앱·helper의 default core/isolated core, 고정 Chrome로 전체 CPU 9항목 두 순서를 사용한다. 선택25/기타15씩 두 앱×두 차수 **580표본**을 기본 계획으로 한다. 첫 C3의 다른 코드/차수와 합산하지 않는다. 공식 메모리·peer·새 기능을 쓰는 행 앱의 대조는 별도 후속이다.
- 기본 base가 4,798B로 보존돼도 별도 렌더러가 4,800B 게이트를 통과한 것은 아니다. 전체 비용과 opt-in 앱의 이득을 얻기 전까지 package/subpath·예산·채택은 미정이다. 결과가 약해도 격리된 기본 경로의 바이트 보존과 opt-in 렌더러의 실행 비용을 각각 기록한다.

[DC-12 실측](../benchmark/PARENT_MEMO_ISOLATION_RESULTS.md): 세 번들 재현·28파일/package 보존·staging 251/dual 1,070·B3·9context 통과. 비참여 580표본의 가중 전체 +0.10%/JS +0.32%는 차수별 방향이 달라 불확실하다. 기본 byte/분기는 추가하지 않았지만 별도 렌더러 br 5,691B는 그대로다. 같은 행 앱 시간/공식 메모리는 후속 DC-13에서 측정했으며 최종 peer 검증은 남아 있다.

→ REQUIREMENTS R18~R20, IMPLEMENT DC-12 단계, M-1·M-6·M-7·M-8·M-9. Phase 5 Test Hardening과 Phase 6 Integration의 전체 종료 조건은 유지한다.

### DC-13 — 같은 행 앱에서 memo 기능을 비교

- 각 RowView는 부모로부터 `{ row, selected, key }`를 새 props로 받는다. on 조건만 setup에서 `useParentMemo(next => [next.row, next.row.id, next.row.label, next.selected])`를 등록한다. mutable label 변경과 selected 변화는 값 deps로 감지한다. 이벤트는 동기화된 props를 읽으며 모든 동작 뒤 부모 Table을 renew한다. row 자체 renew/store 캐시/helper 캐시를 결합하지 않는다.
- 행 view·키·버튼·스토어·이벤트 코드는 동일하다. HTML의 `window.__PARENT_MEMO__`를 최초 시작에 읽고 이후 변경하지 않는다. 두 production bundle의 core/app/JS 해시를 동일하게 고정한다. off는 **isolated renderer 내부의 기능 비사용**이며 기존 default 원래 앱을 뜻하지 않는다.
- 별도 diagnostic 빌드의 상수 flag로 updater/mount/unmount·key/VDOM 회수를 관찰한다. production은 해당 코드가 제거된 빌드이며 공식 CPU/메모리는 계측하지 않는다. no-change refresh n→0, 선택 n→1/2, label 변경 n→n/10, swap n→0의 실제 updater 수와 DOM 정체성·선택 유지·batched 갱신·삭제를 검사한다.
- 기존 C3 source/세 번들·251회귀/dual1070·기본 크기 증거는 해시가 일치할 때 재사용한다. 새 앱 타입·B3 contracts/공식 keyed·9동작/font와 diagnostic은 새로 실행한다. 기본28파일/package·sibling 앱은 계속 guard한다.
- 공식 CPU580·공식 메모리60표본을 양순서로 순차 실행하고, production retention의 생성/clear100회·partial100회/조건별3context와 별도 full dispose를 구분한다. per-item 전체/JS·분포·실패/부하, 공식 MB, DOM/listener/heap 잔류와 같은 JS의 전체 크기를 보고한다. 비교군 전체·공개 예산·채택·concurrent 지원 결정은 포함하지 않는다.
- 메모리 capability 사전 검사는 실제 exported 객체의 metadata/registry를 확인한다. 현재 upstream의 비활성23/26은 기존 metadata와 workload 객체를 프로세스 안에서만 등록한다. sibling 파일·workload/GC/측정 API는 바꾸지 않는다. 등록 오류와 유효 표본의 resume, CPU 당시 runner 버전은 따로 보존한다.

### DC-14 — production heap 보유 원인과 캐시 대조 준비

- [x] 동일 DC-13 production JS/HTML/core를 재사용한다. 기본28파일/package와 sibling source를 전후 확인한다. 공식 시간·메모리는 다시 측정하지 않는다.
- [x] snapshot 없는 off/on 각3 fresh context에서 GC2회 뒤0/5/25/100/300 create-clear의 heap/DOM/listener를 수집한다. 실행 순서는 교대한다.
- [x] 별도 off/on 각1 context에서 같은 checkpoint와 마지막1k live/clear의 CDP heap snapshot을 보존한다. snapshot 자체의 GC/최적화 영향을 별도 조건으로 공개한다.
- [x] V8 snapshot schema로 node type/name별 self size, 생존 ID, 객체 shape, WeakMap backing table와 강한 root 경로를 분석한다. 합계는 snapshot 전체 self size와 맞추며 retained size로 오인하지 않는다. 익명·엔진 객체의 미귀속은 남겨 둔다.
- [x] 원래 cacheUpdate 앱과 row helper/memo 대조의 제어 변수를 문서화한다. 과거 차수의 CPU를 새 결과와 합산하지 않는다.

→ R23/R24, Phase4 DC-14, M-8. 장기 누수 부재·최종 채택·공개 예산·전체peer 완료를 이 실험으로 선언하지 않는다.

[DC-14 결과](../benchmark/PARENT_MEMO_HEAP_RESULTS.md): 출력 WeakMap table의5→25회+196,608B를 귀속했다. 25→300회 테이블 ID/크기는 같았고 실제 row/memo/snapshot/output은 clear 뒤0개였다. AllocationSite 템플릿과 인스턴스를 분리하고14개 snapshot을 독립 감사했다. 전체 heap의 모든 변동을 설명하거나 장기 누수 부재를 확정한 결과는 아니다.

### DC-15 — 실제 캐시 앱 대조

- [x] [사전 조건](../benchmark/PARENT_MEMO_CACHE_PLAN.md)을 고정한다. 기존 monolithic cacheUpdate 앱의 default/isolated 두 조건과 같은 RowView 앱의 off/helper/memo 세 조건을 분리한다. 행 세 조건은 같은 production JS를 쓰며 E/A 종단 차이와 E/D 같은 구조의 memo/helper 차이를 구분한다.
- [x] 새 staging의 타입/B3·작업량/정체성·dispose gate 뒤 전체9항목 양순서 CPU1,450·공식 메모리150표본을 수집한다. 이전 차수와 합산하지 않는다. 기본28파일/package/sibling·후보 core hash를 보존한다.

→ R24, Phase4 DC-15, M-4·M-7·M-8. 원래 앱 대비 종단 손해가 양차수에서 반복됐으며 현재 후보를 기존 앱 개선안으로 채택하지 않는다.

[DC-15 결과](../benchmark/PARENT_MEMO_CACHE_RESULTS.md): 기존 앱 대비 가중 전체+21.08%/JS+70.27%, 같은 행 helper 대비 전체+3.75%, 캐시 없는 행 앱 대비−9.30%다. 기존 앱 대비 합산9항목이 모두 느렸고 양차수 전체도+22.50%/+20.03%였다. 10k 공식 메모리는27.474→36.438MB다. 한 항목 회귀나 메모리 증가만을 이유로 기각한 것이 아니라 실제 기존 앱의 전체/항목별 손해와 추가 크기를 함께 판단했다. C3의 범용 예제 이득은 별도 실험으로 보존하며 기본 runtime은 유지한다. 다음 코어 후보 선택 전에 전체peer 기준을 확보한다.

### DC-16 — 원래 앱과 고정 peer의 전체 비교

- [x] 비교군은 원래 monolithic Lithent/default와 upstream React hooks19.2.0/classes19.0.0, Preact hooks/classes11.0.0다. 실제 lock/source/production 설정을 보존하고 구현 간 버전을 임의로 맞추지 않는다. 이전 설치본은 source/lock·설치된 package 버전/의존성 트리와 일치할 때만 재사용해 새 staging에 빌드한다.
- [x] 목표는 사용자 선택대로 `Lithent pooled median(total)_i / min(four peer pooled median(total)_i) <= 1.10`을9항목 모두 만족하는 것이다. 양차수도 따로 공개하며 합산만 통과하고 차수별로 경계를 넘으면 일관성이 불확실하다고 기록한다. 항목별 최저 peer를 사전 정의한 정규화이며 나머지 구현을 표에서 제거하지 않는다.
- [x] 표는 CPU total 중앙값이 주 지표, script/paint·분포/비율·CPU 가중 기하평균은 보조다. upstream Common.ts의 연속 색상 함수/가중치를 보존한다. 시각화는 다섯 조건의 최소값으로 색상을 계산하고 사용자 목표는 네 peer 최소값으로 계산하는 차이를 명시한다. memory5항목은 MB·최저 peer 비율/절대 차이를 별도로 공개하고 CPU1.10 기준을 적용하지 않는다. size는 각 production의 실제 JS+HTML와 raw/gzip/br, startup은 이번 범위 제외다.
- [x] 새 staging에서 production 설정대로 재빌드하고 deps/소스/lock/hash를 고정한다. 원래 Lithent의 기존 same-hash 타입/회귀를 재사용하며 모든 앱의 keyed/9동작/font와 DOM 정체성을 확인한다. framework 간 bulk 제거 mutation 수를 동일하게 요구하지 않는다.
- [x] CPU9항목×5조건×두 순서(선택25/나머지15)1,450표본, 메모리5항목×3×5조건×두 순서150표본을 직렬 수집한다. 실패/trace/부하를 보존한다. 정상 trace는 전 hash/size와 선택 index0/조건/차수10개 내용을 보존한다.
- [x] 1.10 목표 대비 큰 격차를 보이는 최대 두 항목에 Lithent와 가장 빠른 peer의 별도 CDP CPU profile/trace 진단을 수행한다. 스코어를 바꾸지 않고 실행 함수·DOM/layout/paint 범위를 근거로 다음 후보를 고른다. 진단 결과가 불충분하면 원인을 미확정으로 남긴다.

→ R3/R4/R25/R26, IC-1, Phase4 DC-16, M-7~M-9. baseline 위치 확인이며 새 코어 구현/최종 hardening/integration 완료는 아니다.

[DC-16 결과](../benchmark/PEER_BASELINE_RESULTS.md): CPU1,450/메모리150·분포480/가중69개 감사, 합산5/9(첫5/반대6)로 목표 미달이다. 선택1.630×/부분 갱신1.269×이며 별도 source-map profile에 render의 인덱스 수집·diff와 VDOM 생성/text 갱신이 함께 관찰됐다. 첫 진단120개는 음수 간격41개로 전량 제외했고, 분리 수집은119/120개 유효·독립 trace4context/40구간이다. 원본·제외 이유·큰 시간 간격을 공개하며 함수 비중이나 개선율을 단정하지 않는다.

### DC-17 — C2의 diff 결과를 render에 전달하는 한정 후보

- [x] 다음 후보로 C2를 선택한다. 제거 대상은 `render.ts:updateChildren`의 같은 순서 matchedIndexes/oiSeq 수집·임시 배열·배치 판정 중복이다. 기존 ordered 후보의 배열 할당 지연이나 keymatch의 Map.delete 제거를 반복하지 않는다. Map 매칭·helper deps 검사·VDOM 생성 비용은 남으며 1.10 달성을 보장하지 않는다.
- [x] 첫 증명 범위는 현재 general diff 결과의 길이 동일·각 원래 인덱스 동일·추가/삭제/교체/이동 없음이다. 키를 미리 더 읽거나 uniqueness Set을 만들지 않는다. 중복/falsy/NaN/object/Symbol/혼합 키는 기존 매칭 결과가 먼저 결정한다. 증명되지 않거나 직접 portal 등 안전성을 확인하지 못한 경우 기존 render 경로로 보낸다.
- [x] 첫 metadata 저장은 root-scoped `WeakMap<WDom, WDom[]>` sidecar로 확정한다. 영구 WDom 필드는 모든 객체의 shape/생성 비용을 바꾸고 clone/폐기 정리를 넓히므로 첫 후보에서 제외한다. 배열만 저장하는 WeakSet은 node↔children 소유를 확인하지 못하므로 제외한다. 이 선택은 수명 경계를 단순화하기 위한 것이며 메모리/시간/크기 우월성은 미검증이다.
- [x] [공통 기준 회귀](../../src/tests/core-placementProof.test.tsx)는 초기10개를 기본 base/concurrent에 먼저 확보했고, 최종 children getter 읽기 순서1개를 추가해 세 코어(base/concurrent/candidate) 각각11개 통과했다. 특수/중복/혼합 키·empty/tag 교체·pre callback 후속 key mutation·출력 arity·Fragment/portal/외부 형제·focus·좌→우 callback/재예약·diff throw 뒤 live sibling 재개·동기 wrapper 교체를 확인했다. base/concurrent의 기존 key 매칭·children 읽기 순서 차이를 보존한다. 초기10회귀 시점의 full dual1,090/3과 최종11개 targeted 검증을 구분한다.
- [x] 독립 base 프로토타입과 기존 archive의 원래 앱/cacheUpdate를 JSDOM에서11동작씩 계측했다. 선택/선택 이동/partial의 render4배열·1,000인덱스 방문은0, 모든11동작의 Map/키 접근·content/cleanup 횟수는 동등했다. fallback 배열/방문은 유지되고 proof lookup/delete가 추가된다. DOM 정체성/내용을 확인했으며 공식 시간/보유 메모리/B3로 사용하지 않는다. 기본29파일은 전후 일치하고 외부 출현한 sibling은 미수정이다.
- [x] 이번 프로토타입은 shared229+수명4=233회귀·엄격 타입/빌드 뒤 UMD br4,952/4,800B로 size gate 실패했다. 후보와 실패 증거를 보존하고 기본29파일 일치로 종료했다. 기본 runtime을 수정하지 않아 복원이 필요하지 않았다. 공식 CPU580/메모리60·retention/B3는 미실행이다. gate 통과 뒤의 공식 비교·최종 후보/peer 목표·Phase5/6은 완료로 표시하지 않는다.

#### DC-17 메타데이터의 수명과 관측 순서

frame은 내부 `{ proofs: WeakMap<WDom, WDom[]>, ready: boolean, invalid: boolean }`다. 공개 API·WDom shape·clone 데이터에 새 필드를 추가하지 않는다.

1. `replaceWDom` 시작 시 이전 frame을 저장한다. 이전 frame이 있으면 먼저 `invalid = true`로 만들어 중첩 갱신이 끝나도 바깥 증명을 다시 사용하지 않는다. 새 frame을 `ready = false`, `invalid = false`로 설치한다. 이 scope는 diff, wrapper/부모 연결 게시, `wDomUpdate` 전체를 포함한다.
2. `diffLoopChildren`는 진입한 frame을 캡처한다. 기존 original key Map을 만든 다음에 `newWDom.children`을 읽어 base의 getter 관측 순서를 보존한다. 기존 general Map 루프 안에서 길이 동일·각 `origIndex === index`·결과 `nr`가 `N/U/T`·직접 portal 없음만 누적한다. key를 미리 더 읽거나 uniqueness/하위 DOM 사전 순회를 추가하지 않는다. 기존 `typeDeleteUnused`가 정상 종료하고 캡처한 frame이 invalid가 아닐 때 정확한 list node와 반환할 `remaked` 배열을 stage한다. 여기까지는 render 허용 상태가 아니다.
3. root diff와 기존 wrapper/부모 연결 게시가 모두 성공한 뒤에만 해당 frame을 `ready = true`로 바꾼다. 이미 invalid인 frame을 되살리지 않는다. diff 이후 throw나 중첩 재진입의 결과가 성공 증명으로 게시되지 않는다.
4. `typeUpdate`의 loop 진입에서 현재 frame의 node proof를 `get`한 뒤 `delete`한다. 삭제는 props 갱신·DOM setter·콜백보다 먼저여야 한다. `ready && !invalid`이며 저장한 배열이 정확히 `node.children`일 때에만 해당 `updateChildren` 호출에 증명을 전달한다. node/children 참조가 달라진 wrapper·배열 교체의 낡은 증명은 사용할 수 없다. 증명 부재/불일치/무효화는 기존 경로로 진행한다. 동일 배열 자체의 임의 in-place 변경까지 검출한다고 약속하지 않는다. 공통 `wDomUpdate` handler에 boolean 인자를 추가하는 방식은 `typeAdd`의 두 번째 Node 인자와 충돌하고 모든 노드에 분기를 더하므로 사용하지 않는다.
5. 증명을 받은 keyed render는 좌→우로 기존 `wDomUpdate`를 수행한 뒤 전체 자식의 `clearDiffMeta`, 마지막 `execMountedQueue` 순서를 유지한다. 이 순서가 맞아야 이후 형제 callback이 관찰하는 `oi/nr`와 mount queue가 baseline과 같다. updater/pre/post callback, 자체 renew 및 하위 arity 변화의 의미는 유지한다.
6. `replaceWDom`의 `finally`에서 이전 frame을 복원한다. 성공·diff/render/DOM/콜백 throw 모두 새 frame 전체를 버리므로 삭제되거나 아직 render하지 않은 descendant proof도 다음 root에 남지 않는다. 중첩 frame은 독립적이며 복원된 바깥 frame은 invalid 상태를 유지한다. clone에는 proof를 복사하지 않는다. 직접 portal·증명 부재/불일치·중첩 교체에 의한 무효화는 기존 경로로 fallback한다. 임의 콜백의 in-place VDOM 내부 구조 변경 일반 보장은 미검증이며 이번 프로토타입을 채택하지 않으므로 새 지원 계약을 선언하지 않는다.

이 폐기는 새 proof의 수명만 보장하며 기존 diff의 DOM·hook·부모 tree를 자동 롤백하는 새 계약이 아니다. [수명4회귀](../../experiments/keyed-placement/lifetime.test.tsx)는 stage/consume, 뒤 diff throw 시 미방문 proof 폐기, DOM throw, 동기 중첩 invalidation/복원을 확인했다. 공통11회귀는 base/concurrent/candidate 모두 최종 통과했다. frame/WeakMap 생성·stage/get/delete는 별도 구조계측으로 공개했으나 보유 바이트·GC/누수 부재·시간 이득을 증명하지 않는다. 공식 CPU580/메모리60·retention은 gate 실패로 미실행이다.

현재 결과: 격리 base 후보의 shared229+수명4=233회귀·엄격 타입/빌드와17모듈 declaration pair는 통과했다. UMD raw/gzip/br는 baseline12,741/5,178/4,798B → 후보13,210/5,348/4,952B로 br+154B, 기존 한도152B 초과다. size gate 실패 분기를 적용해 이번 프로토타입은 미채택이며 CPU580/메모리60·retention/B3는 미실행이다. 별도 JSDOM11동작에서 실제 제거/유지 작업을 구분하고 Python으로212개 archive entry·154counter 대조·size·29파일 guard와 패치 replay17source hash를 감사했다. [결과](../benchmark/KEYED_PLACEMENT_RESULTS.md)·[raw](../benchmark/keyed-placement-results.json)·[후보 패치](../benchmark/keyed-placement-candidate.patch)·[영구 증거](../benchmark/keyed-placement-evidence.json.gz)·[재현 도구](../../experiments/keyed-placement/README.md)를 보존해 실험을 종료했다. sidecar 한 후보의 크기 실패를 C2의 모든 대안 기각이나 공식 성능 손해로 확대하지 않는다.

→ R1/R6~R12/R27~R29, M-3~M-8/M-9, Phase4 DC-17. 계약·격리 구현·일부 검증과 size 탈락을 구분한다. 공식 성능 이득·다른 C2 전달비용 대안·최종 채택은 미확정이다.

후속 [Preact 원인 가설 검토](../benchmark/PREACT_CAUSE_REVIEW.md)는 객체 shape·wrapper/할당·event proxy·LIS·anchor 검색의 기존 반영/실험 여부를 구분한다. shape/proxy의 실제 병목 귀속은 미확정이며 새 후보 선정·구현·채택을 뜻하지 않는다.

### DC-18 — 엔진별 object-layout/IC/deopt 원인귀속 진단

- [x] [Preact 원인 가설 검토](../benchmark/PREACT_CAUSE_REVIEW.md) 뒤 엔진별 layout/IC/deopt 진단을 선정했다. 원래 앱·helper·Map/LIS/parent lookup·wrapper 수·event 경로를 고정했다. Chrome156/V8 15.6.75.19의 archived production 진단과 별도 source probe, fresh 실제 측정을 분리하고 Chrome155/이전 표본과 합산하지 않았다.
- [x] intrinsic/IC·Map/deopt smoke와 원래앱/일반 component probe를 완료했다. 표본 live 노드는 fast property이며 dictionary0이었다. 초기 baseline의 다양한 layout만으로 megamorphism을 단정하지 않고 source-mapped access site·property-case·function-level deopt 귀속을 구분했다. `H` 해석은 V8 main 참고이며 exact engine tag 미획득·누락/샘플링 한계를 보존했다.
- [x] full22는22필드·단일 allocation site, compact13은 hot13필드(`type,nr,tag,props,text,children,getParent,el,oi,oc,op,il,[wdomSymbol]`)만 초기 선언하고 희소9필드(`isRoot,we,ae,ctor,compKey,compProps,compChild,reRender,rs`)를 필요 시 추가한다. 필드 초기화 범위만 대조했고 각각229shared/17 declaration pair를 통과했다. full 수집 종료 뒤 compact를 별도 디렉터리에서 실행해 자료를 덮어쓰지 않았다.

각각의 fresh baseline 대비 기술 통계다. 두 후보 raw를 합산하거나 후보 간 차이를 무작위 직접 대조의 인과 추정으로 취급하지 않는다.

| 근거                  | full22(미채택 대안) | compact13(기본 반영) |
| --------------------- | ------------------: | -------------------: |
| 가중 total            |            −4.8664% |             −5.8917% |
| 가중 JS               |           −12.1886% |            −14.4232% |
| 공식10k 메모리        |             +14.95% |  +2.4747%(+0.6801MB) |
| UMD Brotli            |              4,854B |               4,824B |
| 비교용 IC ever-N/site |                   9 |                    9 |
| 비교용 wrong-map 기록 |                  12 |                   27 |
| probe live Map 그룹   |                   1 |                    3 |

- [x] compact의 main/reverse total은−6.6228%/−5.1433%,9항목 pooled total 중앙값은 모두 낮았다. 실행순서·부하/분포를 공개한다. remove는 반대순서에서 소폭 느린 항목도 있으므로 pooled 결과를 모든 차수/앱의 보편적 우위로 표현하지 않는다. 가중 paint 비율0.996298은 JS 개선과 구분한다.
- [x] compact 공식 메모리 MB는 ready0.629214→0.630699,1k3.507986→3.569926(+1.7657%),update5 3.588482→3.628592(+1.1177%),clear0.912617→0.906669,10k27.483558→28.163685(+2.4747%)다. 각각 CPU580/메모리60·retention6context를 수집하고 합계384분포/18가중값을 독립 Python1e-12로 검증했다. DOM/listener 증가0은 모든 heap retention/누수 부재의 증명이 아니다.
- [x] full은 실패/경고0이었다. compact는 baseline reverse CPU partial detached Frame1배치·baseline main memory ready Target closed1배치 후 자동 재시도했고 원자료를 분리 보존했다. CPU 경고0과 실패2배치를 혼동하지 않는다. 초기 sandbox smoke·wrapper 스키마 실패도 별도 보존했다.

**선정과 크기 정책:** 사용자 렌더 성능 우선 지시에 따라 actual CPU/메모리를 평가했고 compact의 이득·낮은 비용을 근거로 선택했다. [size guard](../../scripts/size-report.js)는4,800B reference+검증24B allowance=4,824B, 실제4,824B/추가 여유0이다. baseline4,798B 대비+26B이며 광범위한 영구 새 예산을 뜻하지 않는다. full4,854B/+54B의 당시 평가 허용과 최종 compact+24B를 구분한다. 압축 포맷/도구 버전별 gzip 차이는 [보고서](../benchmark/NODE_SHAPE_RESULTS.md)의 같은 조건 표를 사용한다.

**호환성과 기본 반영:** [WDom 타입](../../src/types/index.ts)에서 optional metadata의 필수 부재/고정 own-key 집합 약속을 찾지 못했다. 초기 자동 R6 실패 해석은 정정했고 [과거 검토](../benchmark/COMPATIBILITY_REVIEW.md#다른-변경의-검증-상태)처럼 관찰 차이를 공개한다. 값/참조·getter 순서·DOM/component 정체성·수명/배칭/복구·props 열거는 검증한 계약에서 유지된다. `in`/own-key·spread/병합·custom JSON replacer 소비자는 차이를 볼 수 있으며 전면 `Object.keys` 동등성을 주장하지 않는다. 새 public API나 별도 승인 요건을 만들지 않았다.

- [x] 측정/적용 직전29guard와 `before-adoption.json`을 통과한 뒤 [wDom](../../src/wDom.ts)·[새 factory](../../src/utils/createWDom.ts)의 측정 바이트를 적용했다. default ESM/UMD/CJS3개의 hash가 측정 후보와 일치한다. 최종79파일 manifest와 초기29 중6변경(wDom/baseJS3/concurrentJS2)을 구분하고 concurrent 소스는 미수정이다. generated concurrent2개는 초기 stale 산출물 재빌드다.
- [x] build:sequence·build:parallel(pnpm build의 두 단계), verify:concurrent ALL PASS, dual1,092 passed/3 existing skipped, strict core/concurrent/e2e 타입·변경원본 ESLint와 Playwright64/retry0을 통과했다. SSR/hydration·HMR·helper/context·예제/docs를 포함한 DC-18 한정 통합 결과다. 같은 검사의 불필요한 반복을 완료 조건으로 추가하지 않는다.
- [x] [결과](../benchmark/NODE_SHAPE_RESULTS.md)·[raw/적용 manifest](../benchmark/node-shape-results.json)·[선택 패치](../benchmark/node-shape-candidate.patch)·[full 대안](../benchmark/node-shape-full-candidate.patch)·[영구 증거](../benchmark/node-shape-evidence.json.gz)·[재현/감사](../../experiments/node-shape/README.md)를 보존했다. 최종1,367entries/33,532,074B·SHA-256 `86b390a2c9ed09503361cd474cd122dfe16677d5afc7405689b1d956024baaef`이며 독립 archive 감사 완료다.

→ R1/R6~R12/R30~R39, Phase4 DC-18, M-11. compact 기본 반영·한정 통합/보존 감사는 완료했다. 전체 fixed-peer9항목1.10 목표·다른 후보 연구·광범위 Phase5/6은 별도 미완료다. compact13 구현은 이후 `ff8b80a`에 커밋·푸시됐으며 패키지는 배포하지 않았다.

## DC-22 — 별도 브랜치를 포함한 종합 반영

### 실행 기준과 이식 경계

2026-10-25 사용자 방향은 별도 실험을 포함해 효과 있는 변경을 최종 코어에 반영하는 것이다. **flat 이벤트를 우선 후보로 선정했고 소폭 크기 증가를 수용 가능한 비용으로 평가한다.** [REQUIREMENTS §7](./REQUIREMENTS.md#7-별도-브랜치를-포함한-종합-반영--dc-22)의 전체 후보 목록을 이번 선정의 정본으로 삼는다. 과거 미채택은 원인과 검증 범위를 이어받는 출발점이다.

- 기준 B는 `fb481f3`의 compact13 source다. 클라우드 보존점 `6993a93`의 runtime은 복원 상태이며 활성 flat source는 `7e838bc`, slot은 `189ddef`다. 현재 source와 개별 patch를 비교해 필요한 event utility/render/공유 unmount 및 회귀·도구를 이식한다. 브랜치 전체 merge로 복원 커밋·실험 설정·과거 문서를 함께 적용하지 않는다.
- flat은 DOM private Symbol의 정규화 event-name별 table과 shared proxy를 출발점으로 한다. callback이나 Event 객체에 영구 속성을 추가하는 설계는 frozen/object handler·외부 코드·중첩 dispatch 검토 없이 채택하지 않는다. HTMLElement 외 SVG, custom element, 공유 portal target도 포함한다.
- 첫 대상은 base의 event 갱신과 공유 teardown이다. concurrent 직접 등록에는 native fallback을 유지한 채 portal commit/abandon을 검증한다. concurrent proxy 지원은 별도 이식·검증 결정이며 shared utility 변경을 concurrent artifact 무변경으로 표현하지 않는다.
- C2는 현재 compact13에 보존 patch를 rebase한다. DC-17의 general Map·키 읽기·첫 소비·root-scoped proof 게시/한 번 소비/finally 폐기/재진입 무효화 계약을 유지한다. 크기 축소와 이벤트 최적화를 한 후보에 먼저 섞어 원인을 잃지 않는다.

### 이벤트 수정과 호환성 판단

**DC-21-S1 구현 버그:** 먼저 등록된 custom-element native listener가 trusted click 중 renew하여 `onclick=B`를 추가하고 기존 `onClick=A`를 유지할 때, flat이 현재 listener snapshot에서 proxy를 제거해 A까지 누락한다. baseline/slot의 첫 클릭 A, 다음 클릭 A/B가 이번 회귀의 기대값이다. 기존 probe는 flat의 빈 배열을 기대하고 `knownFlatRegressionReproduced=true`를 기록하므로 수정본 검사는 기대값을 바꾸고 버그가 남으면 실패해야 한다.

rare alias 처리의 출발 대안은 현재 proxy/handler를 유지하는 전환 모델과 native 직접 등록 fallback 모델이다. dispatch 도중·바깥의 전환, nested dispatch, 삭제/재등록, alias dedup, `stopImmediatePropagation`, props 순서와 예외 복구를 대조한 뒤 상태/정리 시점을 확정한다. 특정 microtask 지연이나 event-clock을 도입하면 동기 등록·같은 이벤트 재dispatch·다른 target 전파에 주는 영향도 검증한다. event-clock 추가만으로 외부 callback identity 문제가 해결됐다고 취급하지 않는다.

DC-22-1 첫 검증 후보는 기존 proxy와 A를 유지하고 새 alias B만 native 등록하는 모델이다. table의 private Symbol에 충돌한 event-name의 Set을 lazy 생성한다. 이 event-name은 이후 native 경로를 유지하되, 남아 있는 proxy의 handler와 같은 callback은 다시 등록하지 않는다. 원 proxy의 handler가 실제 제거/교체될 때 proxy를 해제한다. 일반 단일 handler의 flat 저장/dispatch는 유지하고 추가 Set은 alias 충돌 노드에만 존재한다. microtask 지연·callback/Event stamping은 추가하지 않는다. 격리 prototype `experiments/comprehensive/event.ts`와 같은 코드를 `src/utils/event.ts`에 반영했다. native 외부 identity/order 계약은 DC-22-2와 공개 events 문서에서 확정했다.

**외부 native 연동 계약:** 기존 proxy 관찰에서는 교체 후 listener 상대 순서, 원 callback의 외부 remove/dedup, 진행 중 dispatch의 교체가 직접 등록과 달랐다. 이 차이와 A 누락 버그를 별도로 판단한다.

| 적용 대안                               | 확인할 조건과 비용                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 기본 event 경로 개선                    | 기존 공개 계약/소비자에 필요한 동작을 보존하거나 호환 경로로 해결할 수 있는지 확인한다. 불가능한 identity/order 동등성을 구현했다고 주장하지 않는다.   |
| native 호환 경로와 proxy 사용 경계 구분 | 어느 event/target/등록 방식에 적용되는지 검출·소유할 수 있어야 한다. 외부 listener가 있다는 사실을 DOM에서 자동으로 모두 알 수 있다고 가정하지 않는다. |
| 명시적 event opt-in                     | 필수 native 연동을 기본 경로에 남길 때의 대안이다. API·문서·비사용자 비용과 같은 앱/같은 JS의 on/off 검증이 필요하며 API는 아직 확정하지 않는다.       |

기존 이벤트 문서와 실제 ref/custom-element/native listener 사용을 조사한 후 위 대안 중 기본 적용 경계를 결정한다. 소폭 크기 증가 수용은 이벤트 동작 변경의 포괄 승인으로 해석하지 않는다. 반대로 완전한 native 동등성의 어려움만을 이유로 이미 확인한 inline 이득을 종합 계획에서 제외하지 않는다.

**DC-22-2 사용자 선택 확정 — 2026-10-25:** 위 대안 중 기본 proxy와 직접 native 사용 경계를 선택했다. Preact11도 노드별 handler table·공유 proxy를 사용하며 handler 교체 시 native 재등록을 피한다([고정11.0.0 source](https://github.com/preactjs/preact/blob/11.0.0/src/diff/props.js)). 따라서 native Event 객체 사용과 원 callback의 native 등록 identity 동등성은 별개다. Lithent의 on\*는 props로 관리하고 엄격한 native 연동은 기존 ref/mountCallback에서 직접 등록·cleanup한다. 별도 opt-in/전역 switch를 추가하지 않는다. 변경된 외부 remove/dedup/상대 순서는 마이그레이션 문서·실브라우저 관찰로 명시한다.

Preact11의 logical clock은 callback/Event에 Symbol stamp를 붙여 전파 중 새 handler의 실행을 제한한다. 이번 후보는 frozen 함수/객체·같은 Event 재사용과 기존 alias 의미를 유지하므로 이 부가 계약을 그대로 이식하지 않는다. 신규 native listener의 실행은 native 전파/등록 시점에 따르고 이미 등록된 proxy는 호출 시점의 최신 handler를 읽는다. 이 경계를 별도 trusted/synthetic·ancestor 갱신·Event 재사용 회귀로 검증한다. Preact의 alias/receiver/지원 API 전체를 복제하는 작업은 아니다.

### 독립 이득과 결합 효과의 비교

| 조건 | 내용                                 | 분리해서 판단할 차이                                           |
| ---- | ------------------------------------ | -------------------------------------------------------------- |
| B    | 현재 compact13                       | 새 동일 환경의 기준선                                          |
| E    | B + flat 수정본과 확정된 이벤트 계약 | E/B: 일반 inline 앱의 이득과 stable/noevent·dispatch·보유 비용 |
| K    | B + C2 재평가본                      | K/B: 원래 앱의 render 중복 분석 제거 이득과 proof 관리 비용    |
| EK   | B + E + K                            | EK/E, EK/K, EK/B: 상호작용·추가 이득·전체 비용                 |

4조건은 동일 앱·helper·빌드 도구·고정 브라우저/엔진을 사용한다. 공식 원래 앱의 구조/캐시를 바꾸지 않는다. opt-in 대안을 택하면 기능 on/off는 동일 앱/동일 production JS로 별도 검증하고 원래 benchmark는 기존 API 경로를 유지한다. 개선율을 과거 DC-18/DC-21/C2 계수로 합성하지 않는다.

이벤트 전용 대조는 inline-only/inline-text/stable-text/noevent-text와 실제 앱형 폼/목록 화면을 포함한다. 전용 화면은 수집 전 계획을 B/E/K/EK의4조건으로 확장했다. C2가 이벤트 UI에 주는 추가 비용도 확인하기 위해2순서×4round×4workload×4조건=128fresh pages를 사용하며 모든 시작 위치를 순환/반전한다. page당10warmup/30retained×5updates, 별도 GC3context×4workload×4조건=48context다. slot은 기존 trusted 재현/보존 보고서의 대조로 유지한다. mount/dispatch도 기록하고 페이지 내 반복을 독립 fresh sample로 세지 않는다. 실제 앱형 화면의 trusted input→최종 paint는 별도 프로토콜/trace로 측정하며 update→nextTick이나 두 rAF를 같은 지표로 표시하지 않는다.

공식4조건 비교는9항목 합계145표본/조건/순서(선택25·나머지8항목각15)×4조건×2순서=1,160CPU, 메모리5항목×3반복×4조건×2순서=120표본을 기본 계획으로 한다. 생성/clear100회·partial100회/조건별3fresh context의 retention과 최종 dispose를 분리한다. 예비 gate에서 정합성 실패한 후보는 수정 후 진입하며, 시간/메모리 손해나 기존 size guard 초과만으로 결과 수집을 끊지 않는다. 각 순서의 조건 실행 순서는 시작 전에 균형 배치로 고정하고 보고한다.

최종 선택 후 B+선택 후보+기존 네 fixed peer를 새 동일 환경에서 비교한다. 기본 계획은6앱×145×2=1,740CPU,6앱×5×3×2=180공식 메모리다. 중복 조건 제거 또는 동일 해시 증거 재사용은 수집 전에 이유/시간 간격/범위를 manifest에 확정한다. pooled와 차수별 수치, 실패/재시도, JS/paint, 네 peer 최저 대비9항목1.10 판정을 모두 보존한다. 이벤트 화면의 이득과 원래 benchmark의 미달은 각각 보고한다.

### 채택과 남은 결정

DC-19/19B Fragment는 이미 읽기 관찰/시간 한계를 검토했다. 새 최종 trace가 같은 앵커 비용을 보이고 snapshot 계약을 보존하는 수정 가설이 생기면 추가 조건으로 재개한다. C1은 자체 갱신 검색 비용이 남을 때, C3는 실제 캐시 앱 손해와 다른 사용 사례가 있을 때, C4는 앞선 내부 후보로 해소되지 않는 구조 비용이 확인될 때 연다. 재개하지 않는 이유도 최종 검토표에 남기며 과거 보존 결과를 삭제하지 않는다.

- [x] **DC-22-0 우선순위 확정:** flat 이벤트 수정·반영 검토 → C2 재평가 → 결합 → 전체 peer·통합 → 채택본 반영. 근거: 사용자2026-10-25 방향과 DC-21의 반복 inline 이득. → R52~R54, Phase4A~4E, M-12~M-16.
- [x] **DC-22-1 격리 구현/한정 검증 완료:** 기존 proxy 보존 + 충돌 event-name의 lazy Set/native alias 경로를 선택했다. Chrome156 production trusted 클릭에서 기존 flat의 첫 A 누락과 E의 첫 A/다음 A,B·중첩 A2회를 확인했다. baseline/E242core·K/EK246core를 통과했다. 최종 hardening/채택도 완료했으며 해당 실제 source/산출물은 종합 보고서에 연결한다. → R55/R61, Phase4B, M-15-S1.
- [x] **DC-22-2 사용자 선택 확정:** 기본 proxy + 기존 ref/mountCallback의 직접 native 등록 경로. on\*의 외부 순서/remove/dedup 차이를 문서화하고 alias·frozen/object·Event 재사용은 보존한다. 최종 코드/검증은 종합 보고서에 연결한다. → R56/R61, Phase4B, M-14·M-15.
- [x] **DC-22-3 비교 구조 확정:** compact13 B/E/K/EK와 최종 B/선택 후보/네 peer의 대조. 소폭 초과는 평가 중단 조건이 아니며 해시/환경을 고정한다. → R53/R57/R58, Phase4C~4E, M-16.
- [x] **DC-22-4 이식 범위 확정:** E/EK의 concurrent branched render에도 같은 proxy utility를 연결한다. 공유 teardown과 native 직접 등록 fallback을 유지한다. 격리 E의 공통/전용 concurrent329회귀가 통과했으며 실제 concurrent 산출물/consumer·portal publication 통합도 Phase6에서 완료했다. C2 proof는 base만 지원하고 concurrent 성능 이득을 추론하지 않는다. → R60, Phase4B·5·6, M-6·M-15.
- [x] **DC-22-5 최종 선택 완료:** E 단독을 선택해 기본 반영했다. E의 일반 UI partial/select 전체−5.22%/−9.44% 대비 EK의 추가 이득은 partial−1.94%·select+1.04%로 엇갈리고 원래 앱 가중 전체는 거의 같다. C2의 배열/방문 제거는 확인했으나 추가 proof 관리의 일관된 앱 이득이 부족해 이번에는 보류한다. heap/dispatch/br 비용을 공개하고 새 peer 비교의9항목 목표는 6/9로 미달이며 실제 비용과 일반 inline UI 이득을 구분해 채택했다. → R59, Phase4D~6, M-8·M-16.
- [x] **DC-22-6 비용 정책 확정:** 소폭 크기 증가를 수용 가능한 비용으로 실측 평가한다. 채택본 hash와 raw/gzip/br에 맞춰 guard/근거를 갱신하고 임의의 새 숫자 상한·추가 여유를 만들지 않는다. → R53, Phase6, M-16.

## 상태 / 핸드오프

현재 인계 정본은 [IMPLEMENT 상태 / 핸드오프](./IMPLEMENT.md#상태--핸드오프)다. DC-26 분석 완료와 후속 구현 미착수를 구분한다.

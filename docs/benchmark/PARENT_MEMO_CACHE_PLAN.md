# C3 실제 캐시 앱 대조 사전 조건 — DC-15

2026-10-22 사전 계획, 2026-10-23 완료 기록. **CPU1,450·메모리150·retention15context·dispose 완료.** [DC-14](./PARENT_MEMO_HEAP_RESULTS.md)
뒤의 다음 한정 단계다. 전체 React/Preact 비교·공개 예산·최종 채택을 대신하지 않는다.

## 조건과 비교 의미

| ID  | 앱                               | renderer                 | 목적                         |
| --- | -------------------------------- | ------------------------ | ---------------------------- |
| A   | 원래 monolithic cacheUpdate      | default baseline         | 실제 기존 앱 기준            |
| B   | A와 같은 source/helper           | isolated C3, memo 비사용 | 같은 차수의 renderer 비용    |
| C   | 부모 Table + RowView, 캐시 off   | isolated C3              | 행 구조 통제                 |
| D   | C와 같은 RowView + cacheUpdate   | isolated C3              | 기존 helper의 subtree 재사용 |
| E   | C와 같은 RowView + useParentMemo | isolated C3              | 부모 updater 진입 생략       |

C/D/E는 같은 production JS에서 시작 설정 `off/helper/memo`만 다르게 한다. helper는
`cacheUpdate(() => [props.row, props.row.id, props.row.label, props.selected], view)`를 setup에서
만들어 updater로 반환한다. memo는 동일 값을 incoming props에서 읽는다. 비교 대상 값에
NaN/−0은 없으며 helper의===와 memo의Object.is 차이를 일반 동등성 계약으로 확대하지 않는다.
이벤트/스토어/JSX/키/DOM은 공유한다. 모든 동작은 부모 Table renew이며 자체 row renew와
수동 VDOM 재사용·memo/helper 결합은 없다. helper hit도 updater 진입은 남는다.

B/A는 renderer 비용, E/C는 C3 기능, D/C는 helper 기능, E/D는 같은 행 구조에서의
memo/helper 비용, **E/A는 앱 구조까지 바뀐 종단 차이**다. E/A를 순수 코어 개선율로
표현하지 않는다. B/D는 monolithic/행 컴포넌트 구조 차이도 포함한다.

## 측정 전 gate

- 원래 앱은 보존된 `official-main.tsx`의 source SHA
  `4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632`로 고정한다.
  실제 sibling의 targeted source를 덮어쓰지 않는다.
- baseline ESM은 `3aff372ac9a7e8de09f73f5ddcde5c80ef27d7f6dee8bf2221c0e9cc8121a964`,
  C3는 `43b80396f380e345986581f59ce2a4cafc178946730179fde0450bda4d12d4f9`다.
  helper/JSX를 해당 renderer에 alias해 registry가 섞이지 않게 한다. 신규 row 앱의
  source·세 조건 JS 동일성·각 HTML·helper·lock·Chrome/엔진·runner hash를 manifest에 기록한다.
- 새 앱 타입, 다섯 production의 B3/keyed/9동작/font를 통과한다. 별도 diagnostic으로
  updater 진입과 JSX 생성/cache hit를 구분하고 selection/partial/swap/replace/remove·배칭·
  mutable label·key identity·dispose를 검증한다. production에서 계측 코드가 없어야 한다.
- 이전 core 회귀는 같은 hash일 때만 재사용한다. outputs table 정리 등 core를 고치면 이
  계획의 후보 hash와 재사용 gate를 먼저 갱신한다. 성능 표본을 보고 조건을 선택하지 않는다.

## 공식 실행과 보존

같은 immutable staging의 A/B/C/D/E를 기본 순서와 반대 순서로 두 차수 실행한다.
러너의 항목별 교대 순서도 command/raw에 기록한다. CPU는 전체9항목, 선택25/나머지15씩
**1,450표본**, 메모리는5항목×3개×5조건×2차수 **150표본**이다. 23/26 capability를 먼저
확인하고 기존 process-local registry/metadata 복원만 사용한다. 실패 배치·유효 prefix·
resume을 구분하고 정상 CPU 중 build/test를 병행하지 않는다.

각 조건3 fresh context의 create/clear300회·partial100회와 별도 full dispose를 확보한다.
공식 MB·CDP heap·DOM/listener·bundle raw/gzip/br를 나눠 기록한다. 항목별 total/JS/paint,
양차수/합산 분포·가중 전체·실패/부하를 보고하며 다른 과거 차수와 합산하지 않는다.
다섯 조건의 실행 간격/시간 흐름 한계와 손해 항목도 공개한다. trace는 전 hash/size와
선택 index0/조건/차수10개의 내용을, 실패 시도는 전체 내용을 영구 보존한다.

- [x] immutable staging/manifest와 타입/B3/diagnostic gate
- [x] CPU1,450·메모리150·retention15context·dispose
- [x] raw/증거 감사·전체 항목 교환 비용 보고·정본4문서/HANDOFF 갱신

[실측 결과](./PARENT_MEMO_CACHE_RESULTS.md): memo는 기존 앱 대비 전체+21.08%/같은 행 helper 대비+3.75%였다. 현재 C3를 기존 앱 개선안으로 채택하지 않으며 기본 runtime을 유지한다. 비교군 전체/최종 채택·hardening은 별도 미완료다.

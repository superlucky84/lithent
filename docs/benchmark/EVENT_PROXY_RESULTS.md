# DC-20 고정 이벤트 프록시 실험 결과

이 후보는 **기본 채택하지 않는다**. 단일 handler의 native 등록을 유지하면 기존 직접 등록과 외부 listener의 순서·callback identity·dispatch 중 교체 관찰이 달라진다. 공통 회귀 통과와 이 관찰 차이는 별도 결과다. 아래 시간/메모리는 같은 Linux Chromium의 synthetic 비교이며 C2/이전 Fragment/Mac/공식 9항목과 합산하지 않는다.

측정 UTC: `2026-10-23T23:36:26.707Z` → `2026-10-23T23:37:56.476Z`. Chromium `151.0.7922.173`, Node `v24.19.0`, `200000 100000` CPU quota / `8589934592` memory limit.

## 후보와 검증 경계

기준선 compact13 `8056e02`: WDom/Map/LIS/앱/공개 API를 유지하고 render의 직접 등록, 공유 portal teardown, 새 event utility만 변경했다. DOM의 private Symbol → event-name별 slot 배열 → EventListenerObject가 최신 callback을 호출한다. 단일 slot은 참조만 교체하고 다중 alias는 재등록으로 상대 순서를 보존한다. 함수 this/currentTarget·handleEvent receiver와 alias dedup/삭제를 확인했다. concurrent의 branched 렌더러는 직접 등록을 유지하고 공유 teardown은 native fallback을 쓴다. 공유 코드가 바뀌므로 후보 concurrent artifact의 바이트 동일성을 주장하지 않는다.

최종 후보 base/concurrent 각238 tests/55 files, baseline 전체237 및 최종event6 별도 검사, strict TypeScript/changed-source ESLint, concurrent portal commit4, CJS/UMD export/WDom smoke, actual ESM portal/retained DOM/최신 closure gates를 확인했다. 초기 shared teardown prototype의 concurrent portal5실패를 보존했으며 native fallback 수정 뒤 전체 재검증했다. 전체 monorepo dual/e2e·SSR integration을 재실행했다고 주장하지 않는다.

## 이벤트 관찰 차이

| 관찰 | 직접 등록 baseline | 고정 proxy 후보 |
|---|---|---|
| Lithent 등록 → external 등록 → Lithent 교체 | `["external", "new"]` | `["new", "external"]` |
| 원 callback으로 외부 remove 후 호출 수 | `0` | `1` |
| 외부에 같은 callback을 먼저 등록한 뒤 호출 수 | `1` | `2` |
| 같은 dispatch 앞선 listener에서 handler 교체 | `[]` | `["new"]` |
| 다음 dispatch까지 누적 호출 | `["new"]` | `["new", "new"]` |
| 서로 다른 alias 중 첫 callback 교체 | `["b", "c"]` | `["b", "c"]` |
| 동일 callback alias dedup/교체 | `["a", "b"]` | `["a", "b"]` |

external removal/dedup과 진행 중 dispatch 차이도 실제 browser helper에서 관찰했다. alias 상대 순서와 dedup은 맞췄지만 native listener와 완전한 동등성은 얻지 못했다. 이 차이를 허용하는 새 공개 계약/옵트인은 이번에 도입하지 않는다.

## 업데이트 시간

2,000 buttons. 두 순서×3 fresh pages×각 variant×4 workloads =48 pages. 페이지마다10 warmup/30 retained batches, batch당5updates →1,440 batches/7,200 timed updates. 아래는 batch/5의 중앙값(ms/update); 각각180 nested samples이며 독립표본180개로 해석하지 않는다. 최종 paint는 포함하지 않는다.

| workload | baseline ms | proxy ms | 변화 | 정순 변화 | 역순 변화 |
|---|---:|---:|---:|---:|---:|
| inline-only | 2.1600 | 1.4300 | -33.80% | -36.28% | -31.07% |
| inline-text | 2.8900 | 2.1200 | -26.64% | -19.78% | -32.67% |
| stable-text | 1.3400 | 1.2200 | -8.96% | -10.29% | -5.38% |
| noevent-text | 1.3600 | 1.6500 | +21.32% | +21.74% | +20.00% |

inline 두 workload의 업데이트 이득은 두 순서에서 반복됐지만, event가 없는 대조군도 약21% 느려졌다. 원인을 listener 재등록 제거만으로 귀속하거나 이벤트가 없는 앱에 비용이 없다고 결론 내리지 않는다. mount/dispatch/메모리와 호환성 차이까지 고려해 이번 slot 후보는 미채택이다.

양순서/페이지별 중앙값·p10/p90/min/max/mean은 JSON에 보존한다. 타이머 해상도·GC·공유 cloud CPU 변동과 페이지 내 상관이 있으며 유의성/보편적 개선은 주장하지 않는다. stable/noevent 대조군도 같이 읽는다.

## mount / dispatch 비용

mount는 fresh page당 최초1회, variant/workload당6값으로 표본 수가 적다. dispatch는 페이지당3 warmup+10 retained ×20,000 native events; 총480 retained batches/9,600,000 dispatches. 이벤트 생성은 제외하며 동일 순회·checksum·현재 callback 검증 비용은 포함한다.

| workload | mount baseline→proxy ms | 변화 | 20k dispatch baseline→proxy ms | 변화 |
|---|---:|---:|---:|---:|
| inline-only | 23.70 → 31.45 | +32.70% | 27.40 → 30.10 | +9.85% |
| inline-text | 27.20 → 42.95 | +57.90% | 27.10 → 30.45 | +12.36% |
| stable-text | 20.70 → 37.40 | +80.68% | 27.30 → 30.30 | +10.99% |
| noevent-text | 20.45 → 26.75 | +30.81% | 16.40 → 16.50 | +0.61% |

## 별도 native API 호출 계측

12 updates ×2,000 buttons의 inline 두 workload에서 baseline add/remove 각각24,000회, proxy는 각각0회였다. stable/noevent updates는 두 variant 모두0회다. eventful mount는 양쪽2,000 add, 일반 DOM dispose는 양쪽 native remove0이다. API 호출 감소는 V8 물리 allocation/GC 시간 감소의 증명이 아니다. 기존 cached benchmark의 select/partial도 원래 rebind0이므로 그 앱의 이득을 추론하지 않는다.

## 별도 GC 메모리

24 fresh contexts(variant/workload당3). empty 대비 JSHeapUsedSize 증가분 중앙값을 bytes로 기록한다. 100 updates 뒤와10mount/dispose churn 뒤를 분리한다. 공식 browser process/measureUserAgentSpecificMemory 수치가 아니다.

| workload | 100update baseline B | proxy B | 차이 B | 차이 % | churn 뒤 차이 B | dispose 뒤 차이 B |
|---|---:|---:|---:|---:|---:|---:|
| inline-only | 1209016 | 1643424 | +434408 | +35.93% | +459504 | -14920 |
| inline-text | 1237500 | 1681936 | +444436 | +35.91% | +470216 | +700488 |
| stable-text | 1122120 | 1574588 | +452468 | +40.32% | +479208 | -10504 |
| noevent-text | 1069368 | 1072104 | +2736 | +0.26% | +17832 | -104 |

초기 dispose 직후 추가 DOM이 남은 context는 baseline 2/12, proxy 4/12였다. 이 원자료를 삭제/교체하지 않았다. 별도24 fresh contexts에서 2rAF+100ms 뒤 2GC를 추가한 관찰은 baseline/proxy 모두 12/12 context의 추가 DOM/listener0이었다. 즉시 회수와 안정화 뒤 회수를 구분하며 전체 heap 누수 부재를 주장하지 않는다.

DOM/listener와 absolute heap의 모든 checkpoints/raw를 JSON에 보존한다. 측정한 churn에서의 회수 관찰을 장기/전체 heap 누수 부재로 확대하지 않는다. Symbol table/slot 배열/slot 객체의 비용은 실제 heap 차이로 판단하며 객체 수만으로 시간 귀속을 하지 않는다.

## bundle / 보존

| 형식 | baseline raw/gzip/br B | proxy raw/gzip/br B | br 차이 B |
|---|---:|---:|---:|
| lithent.mjs | 18868/6343/5802 | 19718/6628/6038 | +236 |
| lithent.umd.js | 12759/5187/4824 | 13347/5423/5018 | +194 |
| lithent.cjs | 12606/5234/4857 | 13190/5463/5067 | +210 |

기존4,824B guard는 변경하지 않았다. 크기 초과와 관계없이 성능/메모리 수집을 완료했다.

재현: [도구/조건](../../experiments/event-proxy/README.md). [독립 통계와 manifest](./event-proxy-results.json), [후보 패치](./event-proxy-candidate.patch), [압축 원자료/소스/도구](./event-proxy-evidence.json.gz). 최종 source commit·archive SHA·복원 검증은 [HANDOFF](./HANDOFF.md)의 DC-20에 기록한다. 기본 runtime은 compact13으로 복원하며 원래 checkout/C2는 수정하지 않는다.

남은 범위: 공식 four-peer/nine-action 성능 목표, 이 관찰 차이를 다루는 별도 API/설계, 다른 앱·브라우저·장기 메모리. 이번 후보를 기본 채택하지 않는 결정과 성능 실험 완료를 구분한다.

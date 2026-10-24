"""Generate a human-readable report from independently audited observations."""
import json
from pathlib import Path
import sys
out=Path(sys.argv[1]).resolve()
a=json.loads((out/'audit.json').read_text())
bench=Path(__file__).resolve().parents[2]/'docs/benchmark'
extra_saved=[a['memory'][k]['updated']['extraOverheadSavedPct'] for k in ['inline-only','inline-text','stable-text']]
inline_gain=[-a['timing'][k]['updateMs']['flatVsBaselinePct'] for k in ['inline-only','inline-text']]
lines=['# DC-21 flat 이벤트 테이블 메모리 후속','',f"이번 실행에서 flat 후보는 slot의 baseline 대비 추가 JS heap을 {min(extra_saved):.2f}~{max(extra_saved):.2f}% 줄였고, inline 갱신의 baseline 대비 {min(inline_gain):.2f}~{max(inline_gain):.2f}% 시간 감소를 유지했다. Native 관찰 차이가 남아 기본 채택은 하지 않았다.",'',
'이 실험은 native baseline/이전 slot proxy/새 flat proxy를 같은 새 실행에서 직접 비교한다. Preact식 flat table+shared function 구조의 비용을 확인하며 Preact 자체나 전체 이식 결과로 표현하지 않는다. 이전 DC-20 CPU/메모리 표본은 합산하지 않았다.','',
f"측정 UTC `{a['startedAt']}` → `{a['finishedAt']}`. Chromium `{a['environment']['browser']}`, Node `{a['environment']['node']}`, Linux `{a['environment']['cpuMax']}` quota / `{a['environment']['memoryMax']}` memory limit.",'',
'## 구현과 검증 범위','',
'Baseline은 compact13 `8056e02`, slot은 `189ddef82e20959ea1267ab2eb8b2f5007c4ba9a`다. Slot/flat의 render와 shared unmount를 포함한 다른17 source는 같고, **event utility 하나만 다르다**. Flat은 DOM private Symbol→plain table→callback과 shared native function proxy를 사용해 event별 array/slot 객체를 없앤다. Slot도 함수는 이미 공유했다. 테이블 표현과 native EventListenerObject→function도 함께 바뀐 module 수준 후보이므로 물리 allocation 수나 특정 객체만의 시간 귀속을 주장하지 않는다.','',
'같은 event-name에 다른 alias callback이 추가되면 기존/새 callback을 native 등록하고 해당 name은 노드 수명 동안 직접 등록 fallback을 유지한다. boolean sentinel만 저장하며 alias bookkeeping array는 만들지 않는다. this/currentTarget, handleEvent object, frozen callbacks, 독립 event types, alias dedup/순서/동적 전환, portal teardown와 retained ordinary DOM을 검증했다. Preact event-clock/capture API/callback stamp는 이식하지 않았다.','',
'Flat 후보의 base·concurrent 각각240tests/55files, baseline/slot 새 event8개씩, concurrent portal commit4, strict TypeScript/ESLint를 통과했다. CJS/UMD construction/export smoke와 실제 production ESM event lifecycle, native6관찰/variant 및 등록 진단12조건을 검증했다. Full monorepo dual/e2e/공식 peer 비교는 범위 밖이다.','',
'## 메모리: 같은 실행의 3-way 비교','',
'각 workload/variant마다3 fresh contexts, empty/mount/100updates/10mount-dispose churn/dispose 직후/settled checkpoint에2GC를 수행했다. 아래는100updates 뒤 **각 페이지 empty 대비 JSHeapUsedSize 증가분의 중앙값(bytes)**이다. 전체 browser process 메모리나 공식 measureUserAgentSpecificMemory가 아니다.','',
'| workload | baseline B | slot B | flat B | slot 추가분 B | flat 추가분 B | 추가분 절감 | flat vs baseline |','|---|---:|---:|---:|---:|---:|---:|---:|']
for k,m in a['memory'].items():
    x=m['updated'];save=f"{x['extraOverheadSavedPct']:.2f}%" if k!='noevent-text' else '해석 제외'
    lines.append(f"| {k} | {x['baseline']['heap']['median']:.0f} | {x['slot']['heap']['median']:.0f} | {x['flat']['heap']['median']:.0f} | {x['slotExtraBytes']:+.0f} | {x['flatExtraBytes']:+.0f} | {save} | {x['flatVsBaselinePct']:+.2f}% |")
lines+=['',
'추가분 절감률은 `1−(flat−baseline)/(slot−baseline)`이다. 전체 live heap 증가분 감소율 `flat/slot−1`과 구분한다. Noevent의 작은 추가분은 잡음 대비 분모가 작으므로 절감률로 해석하지 않는다. Absolute heaps·page별 values·mounted/churned/disposed/settled 분포도 JSON/raw에 보존했다.','',
'## 갱신 시간','',
'2,000buttons, 각 round에서 baseline/slot/flat을 회전하고 다음 order에서 역전한다.72fresh pages=2orders×3rounds×4workloads×3variants;10warmup+30retained batches/page,5updates/batch→2,160batches/10,800actual updates. 표는 batch/5의 pooled 중앙값(ms/update). 같은 페이지의 반복은 상관이 있으며 독립표본180개/variant/workload로 해석하지 않는다. 최종 paint는 측정하지 않았다.','',
'| workload | baseline ms | slot ms | flat ms | flat vs baseline | flat vs slot | 정순/역순 flat vs baseline |','|---|---:|---:|---:|---:|---:|---:|']
for k,t in a['timing'].items():
    x=t['updateMs'];v=x['pooled'];o=x['orders']
    lines.append(f"| {k} | {v['baseline']['median']:.4f} | {v['slot']['median']:.4f} | {v['flat']['median']:.4f} | {x['flatVsBaselinePct']:+.2f}% | {x['flatVsSlotPct']:+.2f}% | {o[0]['flatVsBaselinePct']:+.2f}% / {o[1]['flatVsBaselinePct']:+.2f}% |")
lines+=['','이전 DC-20의 slot/noevent +21%는 이번 balanced fresh 실행에서는 재현되지 않았다(slot baseline과 pooled 중앙값 동일). Flat/noevent는 이번 비교에서+3.38%다. 이전 실행과 평균을 내거나 차이를 모두 저장 구조의 효과로 귀속하지 않는다.', '', 'Stable/noevent controls도 같은 비교에 포함한다. Page medians/min/max/p10/p90/mean과 양순서 결과는 JSON에 보존하며, timer grid/GC/JIT/cloud 변동을 제외한 통계적 유의성이나 모든 UI의 성능을 주장하지 않는다.','',
'## mount / native dispatch','',
'Mount는 최초1회/page, variant/workload당6값으로 표본 수가 적다. Dispatch는3warmup+10retained×20,000events/page→720retained batches/14,400,000events. Event 생성은 제외하고 동일 순회/checksum 비용은 포함한다.','',
'| workload | mount baseline / slot / flat ms | flat vs baseline | dispatch20k baseline / slot / flat ms | flat vs baseline | flat vs slot |','|---|---:|---:|---:|---:|---:|']
for k,t in a['timing'].items():
    m=t['mountMs'];d=t['dispatch20kMs'];mt=' / '.join(f"{m['pooled'][v]['median']:.2f}" for v in ['baseline','slot','flat']);dt=' / '.join(f"{d['pooled'][v]['median']:.2f}" for v in ['baseline','slot','flat'])
    lines.append(f"| {k} | {mt} | {m['flatVsBaselinePct']:+.2f}% | {dt} | {d['flatVsBaselinePct']:+.2f}% | {d['flatVsSlotPct']:+.2f}% |")
lines+=['','별도 native API 계측'+': 12updates×2,000buttons의 inline 두 경우에서 baseline add/remove각24,000회, slot/flat각0회다. Stable/noevent 갱신은 모두0회이고 eventful mount는 모두2,000add, ordinary dispose는 모두0remove다. 호출 감소를 V8 allocation/GC 시간 감소로 동일시하지 않는다. 기존 cached benchmark의 select/partial도 원래 rebind0이므로 이득을 추론하지 않는다.','',
'초기 mount는6fresh values/variant/workload이고 noevent에서도 variant별 차이가 커서 일반적인 초기 렌더 개선의 확정 근거로 삼지 않는다. 모든 개별 값/순서를 보존했다.', '', '## 회수와 관찰 차이','',
'36memory contexts에서 즉시 dispose와2rAF+100ms+2GC 뒤 결과를 모두 보존한다.','',
'| variant | 즉시 추가 DOM/listener context 수 /12 | settled 추가 DOM/listener context 수 /12 |','|---|---:|---:|']
for v,d in a['disposal'].items():
    i=d['disposed'];s=d['settled'];lines.append(f"| {v} | {i['extraDOM']} / {i['extraListeners']} | {s['extraDOM']} / {s['extraListeners']} |")
lines+=['','이 관찰은 제한된 settled disposal 증거이며 장기/모든 heap 누수 부재의 증명이 아니다.','',
'단일 proxy의 native 관찰은 slot/flat 모두 기존 직접 등록과 다르다. 외부 listener와의 상대 순서가 유지되고, 원래 callback을 통한 외부 remove가 proxy를 해제하지 못하며, 외부 동일 callback 등록과 native dedup하지 못한다. Dispatch 진행 중 교체도 다르다. Alias 내부 순서/중복 제거를 맞춘 공통 회귀 통과와 이 외부 차이를 구분한다. **이번 flat 후보도 기본 채택하지 않고 보존하며 compact13으로 복원한다.**','',
'## bundle / 재현','',
'| 형식 | baseline raw/gzip/br B | slot raw/gzip/br B | flat raw/gzip/br B | flat br vs baseline / slot |','|---|---:|---:|---:|---:|']
for name in ['lithent.mjs','lithent.umd.js','lithent.cjs']:
    vals=[a['size'][v+'/production'][name] for v in ['baseline','slot','flat']]
    texts=['/'.join(str(x[z]) for z in ['raw','gzip','br']) for x in vals]
    lines.append(f"| {name} | {' | '.join(texts)} | {vals[2]['br']-vals[0]['br']:+} / {vals[2]['br']-vals[1]['br']:+} |")
lines+=['','기존4,824B guard는 유지했고 크기 초과와 무관하게 CPU/memory 측정을 완료했다. 원래 checkout·C2·concurrent branched source는 미수정이며 shared teardown을 포함한 후보 concurrent artifact의 바이트 동일성을 주장하지 않는다.','',
'[재현 도구/조건](../../experiments/event-proxy-flat/README.md), [독립 통계/manifest](./event-proxy-flat-results.json), [flat 후보 patch](./event-proxy-flat-candidate.patch), [압축 source/raw/tools](./event-proxy-flat-evidence.json.gz). flat source commit `7e838bcd723261cb3840388f4f0ce1dd8c13e7ec`. Runtime17 source baseline 일치·복원33회귀/strict/lint·9production bundle/53source hash 재현을 확인했다. archive hash·복원/재현 검증은 [HANDOFF](./HANDOFF.md)에 기록한다.','',
'미검증: Preact 자체 성능, event-clock/캡처 API/새 native 호환 계약, 공식 fixed four-peer/nine-action 목표, full monorepo/e2e 및 다른 UI/브라우저/장기 retention.','']
supplement=bench/'event-proxy-flat-alias-dispatch.json'
if supplement.exists():
    lines += ['## 추가 정확성 검토 — 이벤트 처리 중 alias 전환 누락', '',
    '성능 수집 종료 뒤 같은 frozen source/bundle의 Chromium151 보충 검사에서 flat 전용 회귀를 확인했다. Custom element 생성자가 먼저 등록한 native listener가 실제 trusted click 중 renew()로 onclick B를 추가한다. 기존 onClick A는 그대로다. Baseline/slot은 그 클릭에 A를 실행하지만 flat은 아무 callback도 실행하지 않는다. 다음 클릭은 모두 A,B를 실행한다.', '',
    '원인: flat→native fallback 전환이 기존 proxy를 제거하고 A/B를 새로 등록한다. 진행 중인 같은 target의 listener snapshot에서는 제거된 proxy가 건너뛰어지고 새 listener도 실행되지 않아 변경되지 않은 A가 누락된다. 일반적인 alias 변경8회귀 통과와 active-dispatch 전환의 정합성은 별개다. 공개 h/mount/render/renew와 실제 mouse click(isTrusted=true)으로 재현했고 standalone source helper에서도 같았다.', '',
    '**이 누락은 수정되지 않았다.** 기존 native identity/order 선택 문제와 별도로 alias 전환 구현을 안정화해야 한다. 현재 runtime은 이미 baseline으로 복원돼 있다. 이 추가 관찰은 원래 performance raw/통계/117entry archive를 변경하지 않으며 별도 evidence로 보존한다.', '',
    '[추가 관찰 원자료](./event-proxy-flat-alias-dispatch.json), 재현 명령은 experiments/event-proxy-flat/README.md의 supplemental correctness 절을 확인한다.', '']
(bench/'EVENT_PROXY_FLAT_RESULTS.md').write_text('\n'.join(lines))
(bench/'event-proxy-flat-results.json').write_text(json.dumps(a,indent=2)+'\n')
print('Wrote DC-21 human report and independent JSON')

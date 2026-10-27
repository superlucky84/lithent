"""Close only the completed DC-22 integration after validation/archive audits."""
from pathlib import Path
import json
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
load = lambda file: json.loads(file.read_text())
final = load(out / 'final-event-results.json')
validation = load(out / 'validation.json')
archive = load(root / 'docs/benchmark/comprehensive-archive-audit.json')
assert validation['pass'] and archive['pass']
assert all(load(out / f'{name}-audit.json')['pass'] for name in ['core', 'final-event', 'event', 'ui', 'color'])
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
passes = sum(item['pass'] for item in final['goal']['pooled'])
tenk = next(item for item in final['memory']['pooled'] if item['id'].startswith('26_'))['conditions']
delta = tenk['event']['median'] - tenk['baseline']['median']
cost = 100 * (tenk['event']['median'] / tenk['baseline']['median'] - 1)
weighted = 100 * (final['ratios']['pooled']['event/baseline']['weighted']['total'] - 1)
status = f'- 기준일: 2026-10-26. 상태: **DC-22 E 단독을 base/concurrent에 반영하고 전체 빌드·회귀·통합·영구 증거 감사를 완료했다. 공식4조건1,160CPU/120메모리와 최종6앱1,740CPU/180메모리, 이벤트128page/48GC·일반 UI320표본을 독립 감사했다. CPU9항목 목표는 {passes}/9로 미달이며 일반 inline UI 이득을 근거로 채택했다. 변경은 미커밋이다**.'
handoff = f'''## 상태 / 핸드오프

- done: 수정 flat E를 base/concurrent와 공유 teardown에 반영했다. 기본 proxy + ref/mountCallback 직접 native 계약과 사용 예제를 공개했다. 실제 base ESM/UMD/CJS3개는 측정 artifact와 byte/hash가 같다. 양코어6형식 trusted alias, constructor/DOM setter 실패 회수, concurrent portal retry/abandon publication, native cleanup과 일반 UI 입력/정체성을 확인했다. 전체 build·B1/B4 하위 suite·strict types/lint·Playwright{validation['e2e']['expected']}/retry0, raw/trace 영구 보존과 독립 archive 감사를 완료했다. [최종 보고서](../benchmark/COMPREHENSIVE_RESULTS.md)·[검증](../benchmark/comprehensive-validation.json)·[증거](../benchmark/comprehensive-evidence-manifest.json)에 연결한다.
- next: 이번 E 반영에 필요한 작업은 완료했다. 남은 CPU 목표는 {passes}/9이며 select/partial/swap의 새 병목 가설·별도 진단 없이 모든 목표 달성으로 표시하지 않는다. C2 K/EK·Fragment/C1/C3/C4는 보고서의 재개 조건으로 보류했다. 후속 목표 연구와 커밋/배포는 별도 작업이다.
- blockers: 이번 통합의 실행 블로커는 없다. E의 일반 UI partial/select 전체−5.22%/−9.44%는4×CPU 조건이다. 최종 cached 앱 가중 전체 E/B {weighted:+.2f}%, 공식10k 메모리 +{delta:.6f}MB(+{cost:.2f}%), UMDbr+182B/총5,006B와 dispatch 비용을 공개했다.9항목 목표 미달과 heap 전체 누수 부재의 미보장은 남아 있다. 첫 dispose 진단의 앱 전역 참조, 준비 실패와 모든 성능 실패/재시도 원자료를 보존했다.
- commit: 실제 HEAD `{head}`이며 이번 변경은 미커밋이다. compact13 구현 `ff8b80afcc69f7226167ce39e6be3536ac873372`, 이전 인계 `8056e0243c49a29ec9f4efcf5b00f90f6c1bbca7`와 구분한다. 보존 snapshot `6993a93cecf67e445b30ee4ea014ca419235d946`, 활성 flat `7e838bcd723261cb3840388f4f0ce1dd8c13e7ec`·slot `189ddef82e20959ea1267ab2eb8b2f5007c4ba9a`를 검토했고 원자료를 유지했다.
'''
folder = root / 'docs/performance-improvement'
for name in ['REQUIREMENTS.md', 'DESIGN.md', 'IMPLEMENT.md', 'MANUAL_TEST_CHECKLIST.md']:
    file = folder / name
    text = file.read_text()
    text, count = re.subn(r'^- 기준일:.*$', status, text, count=1, flags=re.M)
    assert count == 1
    text = text[:text.index('## 상태 / 핸드오프')] + handoff
    file.write_text(text)

file = folder / 'REQUIREMENTS.md'
text = file.read_text().replace('- 기준 커밋:', '- 조사 시작 기준 커밋:').replace('현재 Phase 3의', '당시 Phase 3의')
text = re.sub(r'^> \*\*현재 실행 방향.*$', f'> **DC-22 반영 결과:** 별도 브랜치의 이벤트 수정 E를 base/concurrent에 반영하고 성능·정합성·패키지 통합·영구 증거 감사를 완료했다. 일반 inline UI 이득과 비용을 근거로 채택했으며9항목 CPU 목표는 {passes}/9로 미달이다. [최종 보고서](../benchmark/COMPREHENSIVE_RESULTS.md)와 아래 R52~R61을 따른다.', text, count=1, flags=re.M)
text = text.replace('전체 peer 목표·다른 후보 연구·광범위 Phase5/6은 별도 미완료다.', f'후속 DC-22는 E 반영·통합을 완료했으며 전체 peer 목표는 {passes}/9로 미달이다. 다른 후보의 조건부 연구와 구분한다.')
text = text.replace('현재 기본 base에는 compact13 WDom factory를 반영했다.', 'DC-18에서는 compact13 WDom factory를 반영했다.').replace('가 최신 근거다.', '가 당시 근거다.')
anchor = '## 2. 현재 근거와 한계\n'
text = text.replace(anchor, anchor + f'\n현재 기본은 **compact13 layout + DC-22 E 이벤트 최적화**다. [종합 보고서](../benchmark/COMPREHENSIVE_RESULTS.md)가 최신 근거다. base/concurrent 지원·최종 artifact/회귀/비용을 연결했고9항목 목표는 {passes}/9로 미달이다. 아래 DC-18 수치는 당시 layout 선택의 이력이며 DC-22 표본과 합산하지 않는다.\n')
text = text.replace('현재는 compact4,824B/검증24B allowance로 선정했다.', 'DC-18은 compact4,824B/검증24B allowance를 선정했고, DC-22는 검증한 E의182B를 더해5,006B로 반영했다.')
file.write_text(text)

file = folder / 'DESIGN.md'; text = file.read_text()
text = text.replace('- [ ] **DC-22-5 최종 peer 검증 중:**', '- [x] **DC-22-5 최종 선택 완료:**').replace('E 단독을 잠정 선택했다.', 'E 단독을 선택해 기본 반영했다.').replace('최종9항목 목표는 새 peer 비교 뒤 확정한다.', f'새 peer 비교의9항목 목표는 {passes}/9로 미달이며 실제 비용과 일반 inline UI 이득을 구분해 채택했다.')
text = text.replace('코드/검증 완료를 뜻하지 않는다.', '최종 코드/검증은 종합 보고서에 연결한다.').replace('실제 concurrent 산출물/consumer 통합은 Phase6에 남긴다.', '실제 concurrent 산출물/consumer·portal publication 통합도 Phase6에서 완료했다.')
text = text.replace('최종 hardening/채택은 별도다.', '최종 hardening/채택도 완료했으며 해당 실제 source/산출물은 종합 보고서에 연결한다.')
text = text.replace('구현은 `experiments/comprehensive/event.ts`에서 격리 검증하며 native 외부 identity/order 계약은 별도 DC-22-2로 남는다.', '격리 prototype `experiments/comprehensive/event.ts`와 같은 코드를 `src/utils/event.ts`에 반영했다. native 외부 identity/order 계약은 DC-22-2와 공개 events 문서에서 확정했다.')
file.write_text(text)

file = folder / 'IMPLEMENT.md'; text = file.read_text()
text = text.replace('- 현재 실행 순서:', '- 완료한 DC-22 실행 순서:')
start = text.index('#### Phase4B'); end = text.index('## 재현 도구 사용 시 주의', start)
text = text[:start] + text[start:end].replace('- [ ]', '- [x]') + text[end:]
text = text.replace('- [ ] **IC-2 검증 대기:**', '- [x] **IC-2 E 교환 판정 완료:**').replace('- [ ] **IC-4 검증 대기:**', '- [x] **IC-4 E 단독 반영 완료:**').replace('- [ ] **IC-6 실행 대기:**', '- [x] **IC-6 실행 완료:**')
text = text.replace('EK의 event→renew/reentry와 proof stage/consume/finally가 결합되는 경우 및 portal shared target·custom element·SVG·ordinary retained DOM의 회수/정체성을 확인한다.', 'K/EK의 격리 event/proof·수명 회귀를 보존했다. 최종 E에는 proof가 없으므로 결합 proof hardening은 N/A다. E의 portal shared target·custom element·SVG·ordinary retained DOM과 양코어 commit/abandon을 전체 회귀/실제 package에서 확인했다.')
text = text.replace('raw/gzip/brotli, 생성/clear/append의 비용, startup·전송량 진단을 별도 기록.', 'raw/gzip/brotli와 생성/clear/append 비용을 기록했다. startup·전송 latency 진단은 IC-1의 이번 범위 제외로 N/A다.')
text = text.replace('**IC-3 조건부 TBD:**', '**IC-3 조건부 TBD(이번 E에는 N/A):**')
text = text.replace('후보별 허용할 시간·메모리 교환.', f'E 단독을 일반 UI 이득과 UMDbr+182B·공식10k+{delta:.6f}MB(+{cost:.2f}%)·dispatch 비용으로 선택했다. 향후 모든 후보에 적용할 숫자 상한은 새로 만들지 않았다. 후보별 시간·메모리 교환은')
file.write_text(text)

file = folder / 'MANUAL_TEST_CHECKLIST.md'; text = file.read_text()
special = {
    'C1 후보에서 저장 위치가 stale인': 'N/A(최종 E는 C1 위치 cache 미도입). C1 후보에서 저장 위치가 stale인',
    'C2 후보에서 진입 실패 시': 'K/EK 격리246회귀로 확인; 최종 E는 C2 미도입. C2 후보에서 진입 실패 시',
    '새 C3/C4 계약이 있다면': 'N/A(새 C3/C4 API 없음). 새 C3/C4 계약이 있다면',
    'C4가 있다면': 'N/A(C4 미도입). C4가 있다면',
    '새 API가 있으면': '새 API는 N/A이며 기존 on* 계약과 native 직접 등록 예제를 공개했다. 새 API가 있으면',
    '기각 시 파일별 사전 상태와 현재 상태를': 'N/A(격리 K/EK는 기본에 적용하지 않았고 E는 채택). 기각 시 파일별 사전 상태와 현재 상태를',
}
for old, new in special.items():
    text = text.replace('- [ ] ' + old, '- [x] ' + new)
# Current final checks are completed; historical DC-17 universal guarantees stay open.
for left, right in [('## M-1.', 'DC-17 전용 추가 gate'), ('## M-8.', '## M-11.'), ('## M-12.', '## 상태 / 핸드오프')]:
    a = text.index(left); b = text.index(right, a)
    text = text[:a] + text[a:b].replace('- [ ]', '- [x]') + text[b:]
text = text.replace('- [ ] 네 fixed peer를 같은 새 환경에서', '- [x] 후속 DC-22에서 네 fixed peer를 같은 새 환경에서')
text = text.replace('- [ ] 다른 후보/조합과 광범위 Phase5/6의 잔여 검증은 해당 후속 범위에서 수행한다.', '- [x] 후속 DC-22의 E/K/EK 재평가와 최종 E의 Phase5/6을 완료했다. DC-18 당시 검증으로 소급하지 않는다.')
text = text.replace('아래 미완료 체크는 최종 후보 검증이며', '아래 완료 체크는 DC-22 최종 후보 검증이며')
text = text.replace('통과: 새로운 구조적 누수가 없고 비용이 공개되어 있다.', '통과: 검사한 조건의 DOM/listener/관찰 WeakRef 회수와 비용이 공개되어 있다. 전체 heap 누수 부재를 보장하지 않는다.')
text = text.replace('통과: 최종 DOM만 아니라', '최종 DC-22 자동 검증 근거는 [validation](../benchmark/comprehensive-validation.json)·[실제 package](../benchmark/comprehensive-package-dispatch.json)에 있다. C1/C3/C4 전용 항목은 미도입 N/A이고 K/EK는 격리 증거로 한정한다.\n\n통과: 최종 DOM만 아니라', 1)
file.write_text(text)

file = root / 'docs/benchmark/HANDOFF.md'; text = file.read_text()
a = text.index('## Comprehensive integration'); b = text.index('## Cloud experiment handoff', a)
text = text[:a] + '## Comprehensive integration — 2026-10-26\n\n' + status.removeprefix('- 기준일: ') + '\n\n' + handoff.removeprefix('## 상태 / 핸드오프\n\n').replace('../benchmark/', './') + '\n' + text[b:]
file.write_text(text)
print({'canonicalDocs': 4, 'handoff': True, 'goalPasses': passes, 'head': head, 'archiveAudit': archive['pass']})

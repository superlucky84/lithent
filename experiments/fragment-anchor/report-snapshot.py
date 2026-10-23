"""Preserve DC-19B separately from the first range experiment."""
import base64
import gzip
import hashlib
import json
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
s = json.loads((out / 'summary.json').read_text())
r = json.loads((out / 'raw.json').read_text())
b = json.loads((out / 'build.json').read_text())
assert b['candidateKind'] == 'snapshot-loop' and r['complete'] and not r['failures']
assert s['boundary']['observationallyEquivalent'] is True
assert (out / 'bundle-integration.json').exists()
validation = out / 'validation'
validation.mkdir(exist_ok=True)
logs = Path('/workspace/work/cloud-regression')
for file in list(logs.glob('anchor-snapshot-*.log')) + [logs / 'anchor-concurrent-pass.log', logs / 'anchor-baseline-staged-final.log']:
    shutil.copy2(file, validation / file.name)
entries = []
def add(file, name):
    data = file.read_bytes()
    entries.append(dict(path=name, encoding='base64', bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), content=base64.b64encode(data).decode()))
for file in sorted(out.rglob('*')):
    if file.is_file(): add(file, 'run/' + file.relative_to(out).as_posix())
for file in sorted(Path(__file__).parent.iterdir()):
    if file.is_file(): add(file, 'tools/' + file.name)
for name in ['package.json', 'pnpm-lock.yaml', 'vite.config.js', 'tsconfig.json', 'src/tests/core-anchorRange.test.ts']:
    add(root / name, 'inputs/' + name)
assert len({item['path'] for item in entries}) == len(entries)
packed = gzip.compress(json.dumps(dict(version=1, scope=s['scope'], entries=entries), separators=(',', ':')).encode(), mtime=0)
bench = root / 'docs/benchmark'
prefix = 'fragment-anchor-snapshot'
archive = bench / f'{prefix}-evidence.json.gz'
archive.write_bytes(packed)
evidence = dict(file=archive.name, sha256=hashlib.sha256(packed).hexdigest(), bytes=len(packed), entries=len(entries))
result = dict(s, baseCommit=b['base'], branch='experiment/fragment-anchor-cloud', environment=r['environment'], startedAt=r['startedAt'], finishedAt=r['finishedAt'], protocol=r['protocol'], failures=r['failures'], evidence=evidence)
result['adoption'] = 'not adopted: no demonstrated timing benefit; preserve candidate and restore compact13 runtime'
(bench / f'{prefix}-results.json').write_text(json.dumps(result, indent=2) + '\n')
shutil.copy2(out / 'candidate.patch', bench / f'{prefix}-candidate.patch')

lines = ['# DC-19B: snapshot을 보존한 앵커 loop 실험', '',
         '2026-10-24, `experiment/fragment-anchor-cloud`, 기준 compact13 `8056e02`.',
         '**미채택.** 첫 range 후보의 getter 차이를 해결했지만 이 환경/전용 화면에서 시간 이득을 입증하지 못했다. 후보는 patch/증거/구현 커밋에 보존하고 실행 소스는 compact13으로 복원한다.', '',
         '## 변경과 관찰 계약', '',
         '- suffix slice는 원래 위치에 남겨 snapshot을 유지했다. 배열 helper의 길이 고정·빈 슬롯 검사·값 읽기 순서를 명시적 for로 옮겼다. 앵커를 찾은 뒤에도 남은 index getter는 읽으며 해당 WDom 탐색만 생략한다.',
         '- 단일 노드 helper를 분리해 placement의 `[item]`을 없앴다. 이미 캡처한 item을 넘기며 원본 children[i]를 다시 읽지 않는다. Map/LIS/C2 proof·factory·events·wrapper는 그대로다.',
         '- exact source helper의 sparse/moving·getter 후속 원소 변이·사용되지 않는 index getter·직접 재귀 배열의 뒤 getter/throw·길이 snapshot 관찰은 baseline과 같았다. stub nodeType 기반 검사이며 전체 JavaScript prototype monkeypatch 동등성 증명은 아니다.', '',
         '## 새 독립 A/B', '',
         f"- 수집 UTC `{r['startedAt']}` ~ `{r['finishedAt']}`. Linux/Node {r['environment']['node']}, Chromium {r['environment']['browser']} headless, CPU quota {r['environment']['cpuMax']},8GiB. executable/protocol/source/fixture hash를 전후 고정했다.",
         '- 세 화면×두 조건×두 순서×3 fresh page×30 retained=1,080표본. page별 warmup10, variant 순서를 round별 교대하고 다음 order에서 반전했다. 실패0이며 측정 중 build/test를 병행하지 않았다.',
         '- 첫 후보와 시간 간격이 크다. 같은 8056 baseline으로 새로 수집했고 이전 range/Mac 표본과 합산하거나 후보 간 무작위 직접 비교로 해석하지 않는다.', '',
         '| 화면 | pooled update ms 기준→후보 | 첫 순서 | 반대 순서 | pooled 두 rAF ms |',
         '| --- | ---: | ---: | ---: | ---: |']
labels = {'reveal': '형제1,000개 앞 노출/숨김', 'reorder': '200행 다중 DOM 재정렬/교체', 'control': '같은 위치 텍스트 대조군'}
for kind, label in labels.items():
    cells = []
    for order in ['pooled', '0', '1']:
        row = s['cpu'][kind][order]['updateMs']
        cells.append(f"{row['baseline']['median']:.3f} → {row['candidate']['median']:.3f}")
    row = s['cpu'][kind]['pooled']['twoRafMs']
    cells.append(f"{row['baseline']['median']:.3f} → {row['candidate']['median']:.3f}")
    lines.append(f'| {label} | ' + ' | '.join(cells) + ' |')
lines += ['', 'update 값은0.1ms grid에 놓였고 세 pooled 중앙값은 표시 정밀도에서 같았다. 재정렬은 반대 순서3.2→3.4ms(+6.25%)였지만 첫 순서는 같았다. 작은 차이/부하를 확정 회귀로 해석하지 않는다. 두 rAF는 약33.3ms로 같았다. 이는 공식 클릭→최종 paint/peer 결과가 아니다.', '',
          '## 제거된 소스 수준 작업', '',
          '화면별12회 별도 진단이다. callback 횟수는 소스상 의미적 호출 수이며 V8 inline 여부나 물리적 allocation/time share를 직접 측정한 값이 아니다.', '',
          '| 화면 | suffix 배열 | 복사 원소 | singleton 배열 | helper 방문 | reduce callback | 노드 읽기 |',
          '| --- | ---: | ---: | ---: | ---: | ---: | ---: |']
for kind,label in labels.items():
    pair = {row['variant']: row for row in s['diagnostics'] if row['kind'] == kind}
    values = [f"{pair['baseline'][metric]} → {pair['candidate'][metric]}" for metric in ['slices','copied','singleton','visits','callbacks','nodeReads']]
    lines.append(f'| {label} | ' + ' | '.join(values) + ' |')
lines += ['', 'suffix 복사·전체 목록/diff 탐색·indexOf·실제 DOM 작업은 남는다. callback/singleton 제거만으로 사용자 체감 렌더링 향상을 약속하지 않는다.', '',
          '## 검증·별도 메모리·크기', '',
          '- 새 source의 공통 base core232개/54파일·strict TypeScript·ESLint/Prettier 통과. unchanged concurrent232와 frozen baseline의 새3회귀 증거는 같은 source/hash로 재사용했다. ESM 브라우저6gate/6진단·실제 CJS/UMD exports/생성 smoke 통과. full monorepo dual/64e2e 완료로 확대하지 않는다.',
          '- variant/화면별3 fresh context,100갱신 전/후와 dispose 뒤 각각2회 GC. CDP heap은 공식 메모리와 구분한다. 모든 context에서 갱신 후 DOM/listener 수는 초기와 같고 dispose 뒤 host는 비었다. heap 전체 누수 부재를 확정하지 않는다.', '',
          '| 화면 | 조건 | initial → after → disposed heap MiB | DOM nodes | listeners |',
          '| --- | --- | ---: | ---: | ---: |']
for kind,label in labels.items():
    for variant in ['baseline','candidate']:
        row=s['memory'][kind][variant]
        values=[' → '.join(f"{row[phase]['heapBytes']/1048576:.4f}" for phase in ['initial','after','disposed'])]
        values += [' → '.join(str(row[phase][key]) for phase in ['initial','after','disposed']) for key in ['nodes','jsEventListeners']]
        lines.append(f'| {label} | {variant} | ' + ' | '.join(values) + ' |')
lines += ['', '| 형식 | baseline raw/gzip/br B | candidate raw/gzip/br B |', '| --- | ---: | ---: |']
for name in ['lithent.mjs','lithent.umd.js','lithent.cjs']:
    values=['/'.join(str(s['sizes'][variant][name][key]) for key in ['raw','gzip','br']) for variant in ['baseline','candidate']]
    lines.append(f'| {name} | ' + ' | '.join(values) + ' |')
lines += ['', '동일 Node24/zlib 설정의 UMD Brotli4,824→4,845B(+21B), 현재 guard+21B다. guard를 변경하거나 초과를 통과로 표시하지 않았다. 크기만으로 중단하지 않고 실제 시간·메모리까지 평가한 결과 미채택이다.', '',
          '## 보존·판정·다음', '',
          '- [raw 요약/분포](./fragment-anchor-snapshot-results.json), [후보 patch](./fragment-anchor-snapshot-candidate.patch), [영구 증거](./fragment-anchor-snapshot-evidence.json.gz), [도구](../../experiments/fragment-anchor/README.md).',
          f"- evidence {evidence['entries']}entries/{evidence['bytes']}B, SHA-256 `{evidence['sha256']}`. raw·source17/실제 세 번들/maps·helper 관찰·검증 로그·도구·lock을 보존했다. Chromium/node_modules 전체는 미포함이다.",
          '- Python이 모든 분포/중앙값/비율·1,080표본/18memory context·source/hash·작업량/관찰을 독립 감사했다. render 외16source는 baseline과 같다.',
          '- done: 관찰 차이를 해결한 두 번째 한정 후보의 검증·새 A/B·비용·보존. 전체 peer 목표나 기본 채택은 달성하지 않았다.',
          '- next: 다른 비용 축을 선정할 때 새 문서/가설/대조군으로 시작한다. 원래 C2 작업과 자동 결합하지 않는다.',
          '- blockers: 이 전용 측정에서는 시간 이득이 없고 크기가 증가했다. prototype은 보존하고 현재 runtime은 compact13으로 복원한다. 실제 source/복원 커밋은 HANDOFF와 git log에서 확인한다.', '']
(bench/'FRAGMENT_ANCHOR_SNAPSHOT_RESULTS.md').write_text('\n'.join(lines))
print(json.dumps(evidence,indent=2))

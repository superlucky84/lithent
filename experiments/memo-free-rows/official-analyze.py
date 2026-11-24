"""Audit official CPU traces and summarize row variants over alternating rounds.

  python3 official-analyze.py OUT [candidate:baseline ...]

Every variant is compared with the first prepared one; extra pairs can be
named. Official total/script/paint are retained. Active is the union of
main-thread trace events in the official click-to-commit window; wait =
total - active. These extra diagnostics do not replace the official total.
"""
import hashlib
import json
import math
import random
import re
import statistics as st
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]).resolve()
ITEMS = ['01_run1k', '02_replace1k', '03_update10th1k_x16', '04_select1k',
         '05_swap1k', '06_remove-one-1k', '07_create10k',
         '08_create1k-after1k_x2', '09_clear1k_x8']
MEM = ['21_ready-memory', '22_run-memory', '23_update5-memory',
       '25_run-clear-memory', '26_run-10k-memory']
METRICS = ['total', 'script', 'paint', 'active', 'wait']


def read(file):
    return json.loads(Path(file).read_text())


def sha(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def trace_times(file):
    # Independent translation of the official timeline parser's click/commit
    # rule, as in experiments/positional-keys/official-analyze.py.
    events = read(file)['traceEvents']
    clicks = [e for e in events if e.get('name') == 'EventDispatch'
              and e.get('args', {}).get('data', {}).get('type') == 'click']
    assert len(clicks) == 1, file
    click = clicks[0]
    pid, start = click['pid'], click['ts']
    click_end = start + click['dur']
    logic = [click_end]
    for event in events:
        if event['pid'] != pid or event['ts'] <= click_end:
            continue
        name = event.get('name')
        if name in ('Layout', 'FunctionCall', 'FireAnimationFrame') and event.get('ph') == 'X':
            logic.append(event['ts'] + event.get('dur', 0))
        elif name == 'TimerFire' and event.get('ph') == 'X':
            logic.append(event['ts'])
    commits = [e for e in events if e['pid'] == pid and e.get('name') == 'Commit'
               and e.get('ph') == 'X' and e['ts'] > click_end]
    following = sorted((e for e in commits if e['ts'] > max(logic)), key=lambda e: e['ts'])
    commit = following[0] if following else sorted(commits, key=lambda e: e['ts'] + e['dur'])[-1]
    end = commit['ts'] + commit['dur']
    intervals = sorted((max(e['ts'], start), min(e['ts'] + e['dur'], end))
                       for e in events if e['pid'] == pid and e['tid'] == click['tid']
                       and e.get('ph') == 'X' and e.get('dur')
                       and e['ts'] < end and e['ts'] + e['dur'] > start)
    active, previous_end = 0, -math.inf
    for a, b in intervals:
        if b > previous_end:
            active += b - max(a, previous_end)
            previous_end = b
    return (end - start) / 1000, active / 1000


initial = read(OUT / 'initial.json')
for file, digest in initial['browser'].items():
    assert sha(file) == digest, file
for file, digest in initial['tools'].items():
    assert sha(ROOT / file) == digest, file
for directory, files in initial['runner'].items():
    for file, digest in files.items():
        assert sha(Path(initial['frozen']) / directory / file) == digest, file
manifest = read(OUT / 'build-manifest.json')
for name, app in manifest.items():
    for file, digest in app['files'].items():
        assert sha(OUT / 'apps' / name / file) == digest, file
NAMES = initial['names']
PAIRS = [(name, NAMES[0]) for name in NAMES[1:]] + [tuple(p.split(':')) for p in sys.argv[2:]]
assert all(name in NAMES for pair in PAIRS for name in pair), PAIRS

weight_source = Path(initial['bench']) / 'webdriver-ts-results/src/Common.ts'
text = weight_source.read_text()
weight_text = re.search(r'benchmarkWeights\s*=\s*\[([^]]+)\]', text).group(1)
weights = dict(zip(ITEMS, [float(v) for v in weight_text.split(',') if v.strip()]))
assert len(weights) == 9


def rounds(mode):
    found = sorted(int(p.name.split('-')[1]) for p in OUT.glob(mode + '-*') if p.is_dir())
    assert found == list(range(1, len(found) + 1)) and len(found) % 2 == 0, (mode, found)
    return [f'{mode}-{n}' for n in found]


CPU_ROUNDS, MEM_ROUNDS = rounds('cpu'), rounds('mem')
cpu, mem, runs, audited, chrome = {}, {}, {}, 0, set()
for stage_name in CPU_ROUNDS + MEM_ROUNDS:
    mode = stage_name.split('-')[0]
    stage = OUT / stage_name
    run = read(stage / f'production-{mode}.json')
    ids = ITEMS if mode == 'cpu' else MEM
    assert run['complete'] and len(run['samples']) == len(NAMES) * len(ids), stage_name
    assert not run.get('failedBatches'), run.get('failedBatches')
    assert not run.get('resumptions') and run['build'] == manifest
    assert read(stage / 'exit.json')['status'] == 0
    chrome.add(run['chrome'])
    runs[stage_name] = {k: run[k] for k in ['startedAt', 'finishedAt', 'chrome', 'machine', 'loadStart', 'loadEnd']}
    runs[stage_name]['order'] = read(stage / 'command.json')['args'][2]
    runs[stage_name]['batchLoad1m'] = [min(s['load'][0] for s in run['samples']),
                                       max(s['load'][0] for s in run['samples'])]
    groups = set()
    for sample in run['samples']:
        name, item = sample['name'], sample['id']
        assert name in NAMES and item in ids and (name, item) not in groups
        groups.add((name, item))
        assert not sample.get('error') and not sample.get('warnings'), sample
        if mode == 'mem':
            assert len(sample['result']) == 3
            mem.setdefault(name, {}).setdefault(item, {})[stage_name] = sample['result']
            continue
        assert len(sample['result']) == (25 if item.startswith('04_') else 15)
        rows = []
        for index, result in enumerate(sample['result']):
            trace = stage / 'traces' / f'{name}-production-keyed_{item}_{index}.json'
            total, active = trace_times(trace)
            assert abs(total - result['total']) < 1e-6, (trace, total, result['total'])
            assert 0 <= active <= total + 1e-6
            rows.append(dict(result, active=active, wait=total - active))
            audited += 1
        cpu.setdefault(name, {}).setdefault(item, {})[stage_name] = rows
assert len(chrome) == 1, chrome
assert audited == len(NAMES) * 145 * len(CPU_ROUNDS)


def values(name, item, metric, stage):
    stages = CPU_ROUNDS if stage == 'pooled' else [stage]
    return [r[metric] for s in stages for r in cpu[name][item][s]]


def bootstrap(pair, item, metric, n=4000):
    # Resample within each round so the pooled interval retains its balance.
    rng = random.Random(1)
    groups = [[values(name, item, metric, s) for s in CPU_ROUNDS] for name in pair]
    changes = []
    for _ in range(n):
        b, a = [st.median([v for group in side for v in rng.choices(group, k=len(group))])
                for side in groups]
        changes.append(b / a - 1)
    changes.sort()
    return [changes[int(.025 * n)], changes[int(.975 * n)]]


def weighted(ratios):
    return math.exp(sum(weights[item] * math.log(value) for item, value in ratios.items())
                    / sum(weights.values())) - 1


summary = {'names': NAMES, 'medians': {}, 'pairs': {}, 'memory': {}, 'runs': runs,
           'weights': weights, 'weightSourceSha256': sha(weight_source),
           'traceTotalsAudited': audited,
           'bootstrap': '4000 resamples, seed 1, independent samples within each round; excludes session-to-session/systematic uncertainty'}
for name in NAMES:
    summary['medians'][name] = {
        item: {stage: {metric: st.median(values(name, item, metric, stage)) for metric in METRICS}
               for stage in ['pooled'] + CPU_ROUNDS} for item in ITEMS}
    summary['memory'][name] = {
        item: dict({'pooled': st.median([v for s in MEM_ROUNDS for v in mem[name][item][s]])},
                   **{s: st.median(mem[name][item][s]) for s in MEM_ROUNDS}) for item in MEM}
for cand, base in PAIRS:
    pair = summary['pairs'][f'{cand}:{base}'] = {'items': {}, 'weighted': {}, 'weightedUsingMeans': {}, 'memory': {}}
    for item in ITEMS:
        pair['items'][item] = {
            'change': {stage: {metric: (summary['medians'][cand][item][stage][metric] /
                                        summary['medians'][base][item][stage][metric] - 1
                                        if summary['medians'][base][item][stage][metric] else None)
                               for metric in METRICS} for stage in ['pooled'] + CPU_ROUNDS},
            'ci95': {metric: bootstrap((cand, base), item, metric) for metric in ['total', 'script', 'active']}}
    for stage in ['pooled'] + CPU_ROUNDS:
        pair['weighted'][stage] = {
            metric: weighted({item: pair['items'][item]['change'][stage][metric] + 1 for item in ITEMS})
            for metric in ['total', 'script', 'active']}
        pair['weightedUsingMeans'][stage] = {
            metric: weighted({item: st.mean(values(cand, item, metric, stage)) /
                              st.mean(values(base, item, metric, stage)) for item in ITEMS})
            for metric in ['total', 'script', 'active']}
    for item in MEM:
        pair['memory'][item] = {stage: summary['memory'][cand][item][stage] / summary['memory'][base][item][stage] - 1
                                for stage in ['pooled'] + MEM_ROUNDS}

result = {'scope': __doc__.strip(), 'staging': str(OUT), 'summary': summary,
          'build': manifest, 'versions': read(OUT / 'versions.json'),
          'cpu': cpu, 'memory': mem, 'analysisSha256': sha(__file__)}
with (OUT / 'official-results.json').open('x') as file:
    json.dump(result, file, indent=2)

pct = lambda x: f'{100 * x:+.2f}%'
print('Audited traces:', audited, '| Chrome:', chrome.pop(), '| rounds:', CPU_ROUNDS, MEM_ROUNDS)
for key, pair in summary['pairs'].items():
    cand, base = key.split(':')
    print(f'\n== {cand} vs {base}')
    for stage, metrics in pair['weighted'].items():
        means = pair['weightedUsingMeans'][stage]
        print(f"{stage:7} weighted " + ' '.join(f'{m}={pct(v)}' for m, v in metrics.items())
              + ' | means ' + ' '.join(f'{m}={pct(v)}' for m, v in means.items()))
    print(f"{'item':24} {'base ms':>9} {'cand ms':>9} {'total':>8} {'JS':>8} {'active':>8} "
          + ' '.join(f'{s:>8}' for s in CPU_ROUNDS) + '  total 95% CI')
    for item in ITEMS:
        row = pair['items'][item]
        print(f"{item:24} {summary['medians'][base][item]['pooled']['total']:9.3f} "
              f"{summary['medians'][cand][item]['pooled']['total']:9.3f} "
              + ' '.join(f"{pct(row['change']['pooled'][m]):>8}" for m in ['total', 'script', 'active']) + ' '
              + ' '.join(f"{pct(row['change'][s]['total']):>8}" for s in CPU_ROUNDS)
              + f"  [{pct(row['ci95']['total'][0])}, {pct(row['ci95']['total'][1])}]")
    for item in MEM:
        print(f"{item:24} {summary['memory'][base][item]['pooled']:9.3f} {summary['memory'][cand][item]['pooled']:9.3f} "
              + ' '.join(f"{pct(pair['memory'][item][s]):>8}" for s in ['pooled'] + MEM_ROUNDS))

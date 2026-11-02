"""Audit official CPU traces and summarize a two-order baseline/candidate run.

Official total/script/paint are retained. Active is the union of main-thread
trace events in the official click-to-commit window; wait = total - active.
These extra diagnostics do not replace the official total score.
"""
import hashlib
import json
import math
import os
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
METRICS = ['total', 'script', 'paint', 'active', 'wait']
ORDERS = ['main', 'reverse']


def read(file):
    return json.loads(Path(file).read_text())


def sha(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def trace_times(file):
    # Independent translation of the official timeline parser's click/commit
    # rule, also used by the earlier select-vsync/bulk-removal diagnostics.
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

weight_source = Path(initial['bench']) / 'webdriver-ts-results/src/Common.ts'
text = weight_source.read_text()
weight_text = re.search(r'benchmarkWeights\s*=\s*\[([^]]+)\]', text).group(1)
weights = dict(zip(ITEMS, [float(v) for v in weight_text.split(',') if v.strip()]))
assert len(weights) == 9
(OUT / 'weight-source.ts').write_text(text)

data, runs, audited = {}, {}, 0
for order in ORDERS:
    stage = OUT / ('official-' + order)
    run = read(stage / 'production-cpu.json')
    assert run['complete'] and len(run['samples']) == 18, order
    assert not run.get('failedBatches'), run.get('failedBatches')
    assert run['build'] == manifest
    runs[order] = {k: run[k] for k in ['startedAt', 'finishedAt', 'chrome', 'machine', 'loadStart', 'loadEnd']}
    runs[order]['samples'] = 0
    groups = set()
    for sample in run['samples']:
        name, item = sample['name'], sample['id']
        assert name in ['baseline', 'candidate'] and item in ITEMS
        assert (name, item) not in groups
        groups.add((name, item))
        assert not sample.get('error') and not sample.get('warnings'), sample
        count = 25 if item.startswith('04_') else 15
        assert len(sample['result']) == count
        rows = []
        for index, result in enumerate(sample['result']):
            trace = stage / 'traces' / f'{name}-production-keyed_{item}_{index}.json'
            total, active = trace_times(trace)
            assert abs(total - result['total']) < 1e-6, (trace, total, result['total'])
            assert 0 <= active <= total + 1e-6
            rows.append(dict(result, active=active, wait=total-active))
            audited += 1
        data.setdefault(name, {}).setdefault(item, {})[order] = rows
        runs[order]['samples'] += count
assert audited == 580
assert runs['main']['chrome'] == runs['reverse']['chrome']


def values(name, item, metric, order):
    orders = ORDERS if order == 'pooled' else [order]
    return [r[metric] for o in orders for r in data[name][item][o]]


def med(name, item, metric, order):
    return st.median(values(name, item, metric, order))


def bootstrap(item, metric, order, n=4000):
    # Resample within each order so the pooled interval retains its balance.
    rng = random.Random(1)
    orders = ORDERS if order == 'pooled' else [order]
    groups = [[values(name, item, metric, o) for o in orders]
              for name in ['baseline', 'candidate']]
    changes = []
    for _ in range(n):
        a, b = [st.median([v for group in side for v in rng.choices(group, k=len(group))])
                for side in groups]
        changes.append(b / a - 1)
    changes.sort()
    return [changes[int(.025*n)], changes[int(.975*n)]]


def weighted(ratios):
    return math.exp(sum(weights[item]*math.log(value) for item, value in ratios.items())
                    / sum(weights.values())) - 1


summary = {'rows': {}, 'weighted': {}, 'weightedUsingMeans': {}, 'runs': runs, 'weights': weights,
           'weightSourceSha256': sha(weight_source), 'traceTotalsAudited': audited,
           'bootstrap': '4000 resamples, seed 1, independent samples within each execution order; excludes session-to-session/systematic uncertainty'}
for order in ['pooled'] + ORDERS:
    summary['rows'][order] = []
    for item in ITEMS:
        row = {'id': item, 'samplesPerVariant': len(values('baseline', item, 'total', order)),
               'baseline': {}, 'candidate': {}, 'change': {}, 'ci95': {}}
        for metric in METRICS:
            a, b = [med(name, item, metric, order) for name in ['baseline', 'candidate']]
            row['baseline'][metric], row['candidate'][metric] = a, b
            row['change'][metric] = b/a-1 if a else None
            if metric in ['total', 'script', 'active']:
                row['ci95'][metric] = bootstrap(item, metric, order)
        summary['rows'][order].append(row)
    summary['weighted'][order] = {
        metric: weighted({row['id']: row['change'][metric]+1 for row in summary['rows'][order]})
        for metric in ['total', 'script', 'active']}
    summary['weightedUsingMeans'][order] = {
        metric: weighted({item: st.mean(values('candidate', item, metric, order)) /
                          st.mean(values('baseline', item, metric, order)) for item in ITEMS})
        for metric in ['total', 'script', 'active']}

result = {'scope': __doc__.strip(), 'staging': str(OUT), 'summary': summary,
          'build': manifest, 'versions': read(OUT / 'versions.json'),
          'samples': data, 'analysisSha256': sha(__file__)}
with (OUT / 'official-results.json').open('x') as file:
    json.dump(result, file, indent=2)

pct = lambda x: f'{100*x:+.2f}%'
print('Audited traces:', audited)
print('Chrome:', runs['main']['chrome'])
for order, metrics in summary['weighted'].items():
    print(order, 'weighted', ' '.join(f'{m}={pct(v)}' for m, v in metrics.items()))
print(f"{'item':25} {'main ms':>9} {'branch ms':>9} {'total':>9} {'JS':>9} {'order1':>9} {'order2':>9}  total 95% CI")
for index, row in enumerate(summary['rows']['pooled']):
    order_changes = [summary['rows'][order][index]['change']['total'] for order in ORDERS]
    print(f"{row['id']:25} {row['baseline']['total']:9.3f} {row['candidate']['total']:9.3f} "
          f"{pct(row['change']['total']):>9} {pct(row['change']['script']):>9} "
          f"{pct(order_changes[0]):>9} {pct(order_changes[1]):>9}  "
          f"[{pct(row['ci95']['total'][0])}, {pct(row['ci95']['total'][1])}]")

"""Analyze the bulk-removal v2 collection.

Official total/script/paint come from production-cpu.json. From each trace we
also derive "active" time: the union of main-thread trace events inside the
official click->commit window. total - active is idle main-thread time, which
in select1k is mostly waiting for the next 60Hz BeginFrame (see
docs/benchmark/SELECT_VSYNC_PHASE.md). Both are reported; neither replaces the
official score.
"""
import glob
import json
import math
import os
import random
import statistics as st
import sys

out = os.path.realpath(sys.argv[1])
ITEMS = ['01_run1k', '02_replace1k', '03_update10th1k_x16', '04_select1k',
         '05_swap1k', '06_remove-one-1k', '07_create10k',
         '08_create1k-after1k_x2', '09_clear1k_x8']
# Weights of the existing weighted geometric mean (DC-25 final results).
WEIGHTS = json.load(open('docs/benchmark/dc25-keyed-fast-path-final-results.json'))
W = {r['id']: w for r, w in zip(WEIGHTS['rows']['pooled'], WEIGHTS['weights'])}
assert list(W) == ITEMS
MEM = ['21_ready-memory', '22_run-memory', '23_update5-memory',
       '25_run-clear-memory', '26_run-10k-memory']
initial = json.load(open(os.path.join(out, 'initial.json')))
names = initial['names']
PAIRS = [('baseline', 'candidate'), ('rows-baseline', 'rows-candidate')]


def official_window(ev):
    clicks = [e for e in ev if e.get('name') == 'EventDispatch'
              and (e.get('args') or {}).get('data', {}).get('type') == 'click']
    assert len(clicks) == 1
    click = clicks[0]
    pid, t0 = click['pid'], click['ts']
    cend = t0 + click['dur']
    logic = [cend]
    for e in ev:
        if e['pid'] != pid or e['ts'] <= cend:
            continue
        n = e.get('name')
        if n in ('Layout', 'FunctionCall', 'FireAnimationFrame') and e.get('ph') == 'X':
            logic.append(e['ts'] + e.get('dur', 0))
        elif n == 'TimerFire' and e.get('ph') == 'X':
            logic.append(e['ts'])
    start_from = max(logic)
    commits = [e for e in ev if e['pid'] == pid and e.get('name') == 'Commit'
               and e.get('ph') == 'X' and e['ts'] > cend]
    after = sorted((c for c in commits if c['ts'] > start_from), key=lambda c: c['ts'])
    commit = after[0] if after else sorted(commits, key=lambda c: c['ts'] + c['dur'])[-1]
    return click, t0, commit['ts'] + commit['dur']


def trace_times(file):
    ev = json.load(open(file))['traceEvents']
    click, t0, t1 = official_window(ev)
    iv = sorted((max(e['ts'], t0), min(e['ts'] + e['dur'], t1)) for e in ev
                if e['pid'] == click['pid'] and e['tid'] == click['tid']
                and e.get('ph') == 'X' and e.get('dur')
                and e['ts'] < t1 and e['ts'] + e['dur'] > t0)
    busy, end = 0, -1e30
    for a, b in iv:
        if b > end:
            busy += b - max(a, end)
            end = b
    return (t1 - t0) / 1000, busy / 1000


cpu, mem = {}, {}
for order in ('main', 'reverse'):
    stage = os.path.join(out, 'official-' + order)
    run = json.load(open(os.path.join(stage, 'production-cpu.json')))
    assert run['complete']
    for s in run['samples']:
        assert not s['warnings'], s['warnings']
        rows = []
        for i, r in enumerate(s['result']):
            f = f"{stage}/traces/{s['name']}-production-keyed_{s['id']}_{i}.json"
            total, active = trace_times(f)
            assert abs(total - r['total']) < 1e-6, (f, total, r['total'])
            rows.append(dict(r, active=active, wait=total - active))
        cpu.setdefault(s['name'], {}).setdefault(s['id'], {})[order] = rows
    run = json.load(open(os.path.join(stage, 'production-mem.json')))
    assert run['complete']
    for s in run['samples']:
        mem.setdefault(s['name'], {}).setdefault(s['id'], {})[order] = s['result']


def med(name, item, key, order=None):
    orders = ('main', 'reverse') if order is None else (order,)
    return st.median([r[key] for o in orders for r in cpu[name][item][o]])


def weighted(ratios):
    return math.exp(sum(W[i] * math.log(r) for i, r in ratios.items()) / sum(W.values()))


summary = {'items': {}, 'weighted': {}, 'memory': {}, 'counts': {}}
for name in names:
    summary['counts'][name] = {i: {o: len(cpu[name][i][o]) for o in ('main', 'reverse')} for i in ITEMS}
    summary['items'][name] = {
        i: {k: {o or 'pooled': med(name, i, k, o) for o in (None, 'main', 'reverse')}
            for k in ('total', 'script', 'paint', 'active', 'wait')} for i in ITEMS}
    summary['memory'][name] = {
        i: {o or 'pooled': st.median(mem[name][i]['main'] + mem[name][i]['reverse'] if o is None else mem[name][i][o])
            for o in (None, 'main', 'reverse')} for i in MEM}
for base, cand in PAIRS:
    key = f'{cand}/{base}'
    summary['weighted'][key] = {}
    for metric in ('total', 'script', 'active'):
        for o in (None, 'main', 'reverse'):
            ratios = {i: med(cand, i, metric, o) / med(base, i, metric, o) for i in ITEMS}
            summary['weighted'][key][f'{metric}/{o or "pooled"}'] = {
                'weighted': weighted(ratios) - 1,
                'items': {i: r - 1 for i, r in ratios.items()}}


def boot(a, b, n=4000):
    """95% bootstrap interval of median(b)/median(a) - 1, fixed seed."""
    rng = random.Random(1)
    xs = sorted(st.median(rng.choices(b, k=len(b))) / st.median(rng.choices(a, k=len(a))) - 1
                for _ in range(n))
    return [xs[int(0.025 * n)], xs[int(0.975 * n)]]


# Per order: interval and P(candidate sample < baseline sample).
summary['ci'] = {}
for base, cand in PAIRS:
    for i in ITEMS:
        for metric in ('total', 'script', 'active'):
            for o in ('main', 'reverse'):
                a = [r[metric] for r in cpu[base][i][o]]
                b = [r[metric] for r in cpu[cand][i][o]]
                summary['ci'].setdefault(f'{cand}/{base}', {}).setdefault(i, {}).setdefault(metric, {})[o] = {
                    'change': st.median(b) / st.median(a) - 1, 'ci95': boot(a, b),
                    'pFaster': sum((y < x) + 0.5 * (y == x) for x in a for y in b) / (len(a) * len(b))}
summary['build'] = json.load(open(os.path.join(out, 'build-manifest.json')))
summary['runs'] = {}
for order in ('main', 'reverse'):
    for mode in ('cpu', 'mem'):
        run = json.load(open(os.path.join(out, f'official-{order}', f'production-{mode}.json')))
        summary['runs'][f'{order}/{mode}'] = {
            k: run[k] for k in ('startedAt', 'finishedAt', 'chrome', 'loadStart', 'loadEnd')}
        summary['runs'][f'{order}/{mode}']['samples'] = sum(len(s['result']) for s in run['samples'])
summary['browserCheck'] = json.load(open(os.path.join(out, 'browser-check.json')))['results']
# Diagnostic Clear timings (clear-ab.mjs), not official scores. The page-reuse
# runs disagreed with each other; the fresh-page run is the one reported.
summary['clearAB'] = {}


def sign_test(base_rows, cand_rows, metric):
    """Per-round two-sided sign test, ties excluded."""
    faster = sum(c[metric] < b[metric] for b, c in zip(base_rows, cand_rows))
    slower = sum(c[metric] > b[metric] for b, c in zip(base_rows, cand_rows))
    k, n = min(faster, slower), faster + slower
    p = min(1.0, 2 * sum(math.comb(n, i) for i in range(k + 1)) / 2 ** n)
    return {'faster': faster, 'slower': slower, 'ties': len(base_rows) - n, 'p': p}


for f in sorted(glob.glob(os.path.join(out, 'clear-ab-*.json'))):
    run = json.load(open(f))
    entry = {k: run.get(k) for k in ('at', 'rounds', 'perPage', 'summary', 'pairs')}
    entry['signTest'] = {
        f'{cand}/{base}': {m: sign_test(run['samples'][base], run['samples'][cand], m)
                           for m in ('script', 'layout')} for base, cand in PAIRS}
    summary['clearAB'][os.path.basename(f)] = entry
json.dump({'scope': __doc__.strip(), 'summary': summary, 'cpu': cpu, 'memory': mem},
          open(os.path.join(out, 'results.json'), 'x'), indent=1)
json.dump({'scope': __doc__.strip(), 'staging': out, 'summary': summary},
          open('docs/benchmark/bulk-removal-v2-results.json', 'x'), indent=1)

pct = lambda x: f'{100 * x:+.2f}%'
for base, cand in PAIRS:
    key = f'{cand}/{base}'
    w = summary['weighted'][key]
    print(f'== {key}')
    for metric in ('total', 'active', 'script'):
        print(f"  weighted {metric:6} pooled {pct(w[metric + '/pooled']['weighted'])}"
              f"  main {pct(w[metric + '/main']['weighted'])}  reverse {pct(w[metric + '/reverse']['weighted'])}")
    print(f"  {'item':24}{'base ms':>9}{'cand ms':>9}{'total':>9}{'active':>9}{'JS':>9}{'main':>9}{'reverse':>9}")
    for i in ITEMS:
        b, c = summary['items'][base][i], summary['items'][cand][i]
        print(f"  {i:24}{b['total']['pooled']:9.3f}{c['total']['pooled']:9.3f}"
              f"{pct(w['total/pooled']['items'][i]):>9}{pct(w['active/pooled']['items'][i]):>9}"
              f"{pct(w['script/pooled']['items'][i]):>9}{pct(w['total/main']['items'][i]):>9}{pct(w['total/reverse']['items'][i]):>9}")
    for i in MEM:
        b, c = summary['memory'][base][i]['pooled'], summary['memory'][cand][i]['pooled']
        print(f"  {i:24}{b:9.4f}{c:9.4f}{pct(c / b - 1):>9}")

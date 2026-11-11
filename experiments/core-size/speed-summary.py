#!/usr/bin/env python3
"""Compare apps across sessions of experiments/memo-free-rows/measure.mjs.

  python3 experiments/core-size/speed-summary.py <baseline app> <run.json> [...] [--json out.json]

For every other app: the ratio of medians to the baseline per scenario and
metric (script, layout, total), averaged over the sessions in log space, with
a 95% bootstrap interval (samples redrawn within each session), and the
weighted geometric mean with the official result table's weights. Heap sizes
are medians over all sessions.

These are local in-page timings, not the official runner's.
"""
import json
import math
import random
import statistics
import sys

args = sys.argv[1:]
out = None
if '--json' in args:
    index = args.index('--json')
    out = args[index + 1]
    del args[index:index + 2]
baseline, files = args[0], args[1:]
runs = [json.load(open(file)) for file in files]
weights = runs[0]['weights']
ids = sorted(weights)
apps = [app for app in runs[0]['raw'] if app != baseline]
random.seed(7)
ROUNDS = 2000


def log_ratio(app, metric, ident, resample):
    logs = []
    for run in runs:
        cand = [s[metric] for s in run['raw'][app][ident]]
        base = [s[metric] for s in run['raw'][baseline][ident]]
        if resample:
            cand = random.choices(cand, k=len(cand))
            base = random.choices(base, k=len(base))
        logs.append(math.log(statistics.median(cand) / statistics.median(base)))
    return sum(logs) / len(logs)


def weighted(app, metric, resample):
    total = sum(weights[i] * log_ratio(app, metric, i, resample) for i in ids)
    return total / sum(weights.values())


def interval(stat):
    point = stat(False)
    boots = sorted(stat(True) for _ in range(ROUNDS))
    pct = lambda value: round((math.exp(value) - 1) * 100, 2)
    return {
        'change': pct(point),
        'low': pct(boots[int(ROUNDS * 0.025)]),
        'high': pct(boots[int(ROUNDS * 0.975)]),
    }


result = {
    'tool': 'experiments/core-size/speed-summary.py',
    'baseline': baseline,
    'sessions': [
        {'file': file.split('/')[-1], 'date': run.get('date'), 'samples': run.get('samples'),
         'chromium': run.get('chromium'), 'node': run.get('node'), 'order': list(run['raw'])}
        for file, run in zip(files, runs)
    ],
    'unit': 'percent change against the baseline; 95% bootstrap interval',
    'apps': {},
}
for app in apps:
    entry = result['apps'][app] = {}
    for metric in ('script', 'layout', 'total'):
        entry[metric] = {
            'weighted': interval(lambda r, m=metric: weighted(app, m, r)),
            'scenarios': {
                i: interval(lambda r, m=metric, i=i: log_ratio(app, m, i, r))
                for i in ids
            },
        }
result['heapMB'] = {
    app: {
        name: round(statistics.median(v for run in runs for v in run['heaps'][app][name]), 3)
        for name in runs[0]['heaps'][app]
    }
    for app in runs[0].get('heaps', {})
}

for app in apps:
    print(app, 'against', baseline)
    for metric in ('script', 'total'):
        w = result['apps'][app][metric]['weighted']
        print(f"  {metric:6} weighted {w['change']:+6.2f}%  [{w['low']:+6.2f}, {w['high']:+6.2f}]")
        for i in ids:
            s = result['apps'][app][metric]['scenarios'][i]
            mark = '' if s['low'] <= 0 <= s['high'] else ('  slower' if s['low'] > 0 else '  faster')
            print(f"    {i} {s['change']:+6.2f}%  [{s['low']:+6.2f}, {s['high']:+6.2f}]{mark}")
if result['heapMB']:
    print('heap MB', json.dumps(result['heapMB']))
if out:
    with open(out, 'w') as file:
        json.dump(result, file, indent=2)
        file.write('\n')

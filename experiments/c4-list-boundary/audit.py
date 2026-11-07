"""Independent audit of the existing raw official CPU/memory samples."""
import hashlib
import json
import math
import pathlib
import statistics
import sys

out = pathlib.Path(sys.argv[1])
read = lambda p: json.loads(p.read_text())
result = read(out / 'results.json')
rounds = {order: {mode: read(out / ('official-' + order) / ('production-' + mode + '.json'))
                  for mode in ('cpu', 'mem')} for order in ('main', 'reverse')}
distributions = 0
for order in ('main', 'reverse', 'pooled'):
    runs = list(rounds.values()) if order == 'pooled' else [rounds[order]]
    for mode, rows in (('cpu', result['cpu'][order]), ('mem', result['memory'][order])):
        for row in rows:
            for name in ('baseline', 'candidate'):
                raw = [v for r in runs for s in r[mode]['samples']
                       if s['id'] == row['id'] and s['name'] == name for v in s['result']]
                for metric in (('total', 'script', 'paint') if mode == 'cpu' else ('memory',)):
                    values = sorted(v[metric] for v in raw) if mode == 'cpu' else sorted(raw)
                    n = len(values)
                    d = row['conditions'][name][metric] if mode == 'cpu' else row['conditions'][name]
                    expected = dict(n=n, median=statistics.median(values),
                                    p25=statistics.median(values[:n//2]),
                                    p75=statistics.median(values[(n+1)//2:]),
                                    min=values[0], max=values[-1])
                    for k, v in expected.items():
                        assert math.isclose(d[k], v, rel_tol=1e-12, abs_tol=1e-12), (order, row['id'], k)
                    distributions += 1
    for metric in ('total', 'script', 'paint'):
        rows = result['cpu'][order]
        geo = math.exp(sum(r['weight'] * math.log(r['conditions']['candidate'][metric]['median'] /
                                                r['conditions']['baseline'][metric]['median']) for r in rows) /
                       sum(r['weight'] for r in rows)) - 1
        assert math.isclose(geo, result['weighted'][order][metric], abs_tol=1e-12)
for mode in ('cpu', 'mem'):
    first = [(s['id'], s['name']) for s in rounds['main'][mode]['samples']]
    second = [(s['id'], s['name']) for s in rounds['reverse'][mode]['samples']]
    assert len(first) == len(second)
    for i in range(0, len(first), 2):
        assert first[i:i+2] == list(reversed(second[i:i+2]))
for name, item in result['builds'].items():
    assert hashlib.sha256((out / 'apps' / name / 'main.js').read_bytes()).hexdigest() == item['bundle']
audit = dict(passed=True, distributions=distributions, weighted=9,
             samples=result['counts'], oppositeOrders=True, appBundleHashes=True)
(out / 'audit.json').write_text(json.dumps(audit, indent=2) + '\n')
print(json.dumps(audit))

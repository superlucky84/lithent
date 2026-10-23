"""Recompute distributions, normalization, weights and the CPU goal independently."""
import hashlib
import json
import math
from pathlib import Path
import re
import statistics
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/lithent-peers-20261023')
a = json.loads((out / 'analysis.json').read_text())
names = ['lithent', 'react-hooks', 'react-classes', 'preact-hooks', 'preact-classes']
peers = names[1:]
checked = 0
comparisons = 0


def equal(actual, expected):
    assert math.isfinite(actual) and math.isfinite(expected)
    assert abs(actual - expected) < 1e-12, (actual, expected)


def geometric(values, weights):
    return math.exp(sum(w * math.log(v) for w, v in zip(weights, values)) / sum(weights))


def color(factor):
    if factor < 2:
        alpha, start, end = factor - 1, [99, 191, 124], [255, 236, 132]
    else:
        alpha, start, end = min((factor - 2) / 2, 1), [255, 236, 132], [249, 105, 108]
    channels = [math.floor((1 - alpha) * x + alpha * y + 0.5) for x, y in zip(start, end)]
    return 'rgb(' + ', '.join(map(str, channels)) + ')'


common = (out / 'Common.ts').read_bytes()
assert hashlib.sha256(common).hexdigest() == a['color']['sourceSHA256']
weights = [float(v.strip()) for v in re.search(rb'benchmarkWeights = \[([\s\S]*?)\];', common)[1].split(b',') if v.strip()]
assert weights == a['weights'] and len(weights) == 9
for kind, source, summary in [('cpu', a['cpu'], a['rows']), ('memory', a['mem'], a['memory'])]:
    for round_name, indices in [('main', [0]), ('reverse', [1]), ('pooled', [0, 1])]:
        for item in summary[round_name]:
            for name, recorded in item['conditions'].items():
                values = [value for index in indices for sample in source[index]['samples']
                          if sample['name'] == name and sample['id'] == item['id']
                          for value in sample['result']]
                for metric in (['total', 'script', 'paint'] if kind == 'cpu' else [None]):
                    numbers = sorted(value[metric] if metric else value for value in values)
                    expected = recorded[metric] if metric else recorded
                    assert len(numbers) == expected['count']
                    checks = dict(median=statistics.median(numbers),
                                  p25=statistics.median(numbers[:len(numbers)//2]),
                                  p75=statistics.median(numbers[(len(numbers)+1)//2:]),
                                  min=numbers[0], max=numbers[-1])
                    for key, value in checks.items():
                        equal(value, expected[key])
                    checked += 1
        normalized = a['normalized' if kind == 'cpu' else 'normalizedMemory'][round_name]
        for item, entry in zip(summary[round_name], normalized):
            assert item['id'] == entry['id']
            value = lambda n: item['conditions'][n]['total']['median'] if kind == 'cpu' else item['conditions'][n]['median']
            best_all, best_peer = min(map(value, names)), min(map(value, peers))
            equal(best_all, entry['bestAll'])
            equal(best_peer, entry['bestPeer'])
            assert entry['referencePeers'] == [n for n in peers if value(n) == best_peer]
            for name in names:
                equal(value(name) / best_all, entry['factors'][name]['ratio'])
                assert color(value(name) / best_all) == entry['factors'][name]['color']
            ratio = value('lithent') / best_peer
            equal(ratio, entry['lithentPeerRatio'])
            equal(value('lithent') - best_peer, entry['delta'])
            if kind == 'cpu':
                equal(best_peer * 1.10, entry['allowedMs'])
                equal(max(0, value('lithent') - best_peer * 1.10), entry['excessMs'])
                equal(max(0, 1 - 1.10 / ratio), entry['requiredReduction'])
                assert (ratio <= 1.10) == entry['pass']
        for name in names:
            for metric in (['total', 'script'] if kind == 'cpu' else [None]):
                value = lambda row, n: row['conditions'][n][metric]['median'] if metric else row['conditions'][n]['median']
                ratios = [value(row, name) / min(value(row, n) for n in names) for row in summary[round_name]]
                score = geometric(ratios, weights if kind == 'cpu' else [1] * 5)
                expected = a['weightedCPU'][round_name][name][metric] if metric else a['weightedMemory'][round_name][name]
                equal(score, expected)
                comparisons += 1

for peer, comparison in a['peerComparisons'].items():
    for round_name, report in comparison['cpu'].items():
        for metric in ['total', 'script']:
            ratios = [row['conditions']['lithent'][metric]['median'] / row['conditions'][peer][metric]['median']
                      for row in a['rows'][round_name]]
            for ratio, entry in zip(ratios, report['rows']):
                equal(ratio, entry[metric])
            equal(geometric(ratios, weights), report['weighted'][metric])
            comparisons += 1
    for round_name, entries in comparison['memory'].items():
        for entry, row in zip(entries, a['memory'][round_name]):
            left, right = row['conditions']['lithent']['median'], row['conditions'][peer]['median']
            equal(left / right, entry['ratio'])
            equal(left - right, entry['deltaMB'])

assert a['goal']['threshold'] == 1.10
assert a['goal']['reference'] == peers
passes = {}
for round_name in ['main', 'reverse', 'pooled']:
    passes[round_name] = sum(row['pass'] for row in a['normalized'][round_name])
    assert a['goal'][round_name + 'Passed'] == passes[round_name]
assert a['goal']['allPooled'] == (passes['pooled'] == 9)
assert a['goal']['allOrders'] == (passes['main'] == 9 and passes['reverse'] == 9)
for i, row in enumerate(a['goal']['rows']):
    for round_name in ['main', 'reverse']:
        equal(row['orders'][round_name], a['normalized'][round_name][i]['lithentPeerRatio'])
    assert row['consistent'] == all(a['normalized'][r][i]['pass'] for r in ['main', 'reverse'])
expected_targets = sorted((row for row in a['normalized']['pooled'] if not row['pass']), key=lambda row: -row['lithentPeerRatio'])[:2]
assert [row['id'] for row in expected_targets] == [row['id'] for row in a['targets']]
assert sum(len(s['result']) for run in a['cpu'] for s in run['samples']) == 1450
assert sum(len(s['result']) for run in a['mem'] for s in run['samples']) == 150
result = dict(complete=True, distributions=checked, weightedComparisons=comparisons,
              cpuSamples=1450, memorySamples=150, goalPasses=passes, tolerance=1e-12,
              implementation='Independent Python statistics/math; raw samples, five-app colors, four-peer CPU goal and upstream weights')
(out / 'audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

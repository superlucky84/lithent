"""Independent checks of the DC-22 raw samples, distributions and ratios."""
from pathlib import Path
import hashlib
import json
import math
import re
import statistics
import sys

out = Path(sys.argv[1]).resolve()
scope = sys.argv[2] if len(sys.argv) > 2 else 'core'
result = json.loads((out / f'{scope}-results.json').read_text())
names = result['names']
cpu = {order: json.loads((out / f'{scope}-{order}/production-cpu.json').read_text()) for order in ['main', 'reverse']}
memory = {order: json.loads((out / f'{scope}-{order}/production-mem.json').read_text()) for order in ['main', 'reverse']}
initial = json.loads((out / 'initial.json').read_text())
inputs = json.loads((out / 'app-inputs.json').read_text())
common = Path(inputs['bench'], 'webdriver-ts-results/src/Common.ts').read_text()
weights = [float(value) for value in re.search(r'benchmarkWeights\s*=\s*\[([^\]]+)\]', common)[1].split(',') if value.strip()]
assert result['weights'] == weights

def close(actual, expected):
    assert math.isclose(actual, expected, rel_tol=1e-12, abs_tol=1e-12), (actual, expected)

def distribution(values):
    values = sorted(values)
    half = len(values) // 2
    return {'count': len(values), 'median': statistics.median(values), 'p25': statistics.median(values[:half]), 'p75': statistics.median(values[(len(values) + 1) // 2:]), 'min': values[0], 'max': values[-1]}

samples = {}
for kind, runs, groups, per_app in [('cpu', cpu, 9, 145), ('memory', memory, 5, 15)]:
    samples[kind] = 0
    for order, run in runs.items():
        assert run['complete']
        assert run['chromeBinarySha256'] == initial['browser']['sha256']
        assert run['chromeFrameworkSha256'] == initial['browser']['engineSHA256']
        assert len(run['samples']) == len(names) * groups
        assert sum(len(sample['result']) for sample in run['samples']) == len(names) * per_app
        seen = set()
        for sample in run['samples']:
            assert sample['name'] in names
            assert not sample.get('error')
            expected = 3 if kind == 'memory' else 25 if sample['id'].startswith('04_') else 15
            assert len(sample['result']) == expected
            key = (sample['name'], sample['id'])
            assert key not in seen
            seen.add(key)
            assert run['build'][sample['name']]['bundle'] == inputs['apps'][sample['name']]['bundle']
            samples[kind] += expected
        for index in range(0, len(run['samples']), len(names)):
            main = runs['main']['samples'][index:index + len(names)]
            reverse = runs['reverse']['samples'][index:index + len(names)]
            assert [sample['name'] for sample in main] == [sample['name'] for sample in reverse][::-1]
            assert len({sample['id'] for sample in main + reverse}) == 1

distributions = 0
weighted_checks = 0
ratio_checks = 0
for order in ['main', 'reverse', 'pooled']:
    orders = ['main', 'reverse'] if order == 'pooled' else [order]
    for key, runs, metric_names in [('rows', cpu, ['total', 'script', 'paint']), ('memory', memory, [None])]:
        for row in result[key][order]:
            for name in names:
                raw = [value for which in orders for sample in runs[which]['samples'] if sample['name'] == name and sample['id'] == row['id'] for value in sample['result']]
                for metric in metric_names:
                    expected = distribution(raw if metric is None else [value[metric] for value in raw])
                    actual = row['conditions'][name] if metric is None else row['conditions'][name][metric]
                    for stat, value in expected.items():
                        close(actual[stat], value)
                    distributions += 1
    for comparison, info in result['ratios'][order].items():
        candidate, reference = comparison.split('/')
        for metric in ['total', 'script', 'paint']:
            ratios = []
            for row, compared in zip(result['rows'][order], info['items']):
                assert row['id'] == compared['id']
                expected = row['conditions'][candidate][metric]['median'] / row['conditions'][reference][metric]['median']
                close(compared[metric], expected)
                ratios.append(expected)
                ratio_checks += 1
            expected = math.exp(math.fsum(weight * math.log(ratio) for weight, ratio in zip(weights, ratios)) / math.fsum(weights))
            close(info['weighted'][metric], expected)
            weighted_checks += 1
    if result['goal'] is not None:
        selected = result['selected']
        peers = ['react-hooks', 'react-classes', 'preact-hooks', 'preact-classes']
        for row, goal in zip(result['rows'][order], result['goal'][order]):
            best = min(row['conditions'][peer]['total']['median'] for peer in peers)
            expected = row['conditions'][selected]['total']['median'] / best
            close(goal['ratio'], expected)
            close(goal['bestPeerMs'], best)
            assert goal['pass'] == (expected <= 1.1)

for name, app in inputs['apps'].items():
    file = out / 'round-main' / name / app.get('entryJS', 'main.js')
    assert hashlib.sha256(file.read_bytes()).hexdigest() == app['bundle']

summary = {'scope': scope, 'distributions': distributions, 'weighted': weighted_checks, 'ratios': ratio_checks, 'samples': samples, 'pass': True}
(out / f'{scope}-audit.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary))

"""Independently recompute CPU/memory medians and weighted comparisons."""
import json
import math
from pathlib import Path
import statistics
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/lithent-c3-cache-20261022')
analysis = json.loads((out / 'analysis.json').read_text())
checked = 0
for kind, source, summary in [('cpu', analysis['cpu'], analysis['rows']), ('memory', analysis['mem'], analysis['memory'])]:
    for round_name, indices in [('main', [0]), ('reverse', [1]), ('pooled', [0, 1])]:
        for item in summary[round_name]:
            for name, recorded in item['conditions'].items():
                values = [value for index in indices for sample in source[index]['samples']
                          if sample['name'] == name and sample['id'] == item['id']
                          for value in sample['result']]
                metrics = ['total', 'script', 'paint'] if kind == 'cpu' else [None]
                for metric in metrics:
                    numbers = sorted(value[metric] if metric else value for value in values)
                    expected = recorded[metric] if metric else recorded
                    assert len(numbers) == expected['count']
                    checks = dict(median=statistics.median(numbers),
                                  p25=statistics.median(numbers[:len(numbers)//2]),
                                  p75=statistics.median(numbers[(len(numbers)+1)//2:]),
                                  min=numbers[0], max=numbers[-1])
                    for key, value in checks.items():
                        assert abs(value - expected[key]) < 1e-12, (kind, round_name, item['id'], name, metric, key)
                    checked += 1
for key, comparison in analysis['comparisons'].items():
    for round_name, reports in comparison['memory'].items():
        for report in reports:
            item = next(row for row in analysis['memory'][round_name] if row['id'] == report['id'])
            on = item['conditions'][comparison['on']]['median']
            off = item['conditions'][comparison['off']]['median']
            assert abs(on / off - report['ratio']) < 1e-12
            assert abs(on - off - report['deltaMB']) < 1e-12
    for round_name, report in comparison['cpu'].items():
        for metric in ['total', 'script']:
            ratios = [item['conditions'][comparison['on']][metric]['median'] /
                      item['conditions'][comparison['off']][metric]['median']
                      for item in analysis['rows'][round_name]]
            weighted = math.exp(sum(weight * math.log(ratio) for weight, ratio in zip(analysis['weights'], ratios)) / sum(analysis['weights']))
            assert abs(weighted - report['weighted'][metric]) < 1e-12, (key, round_name, metric)
assert sum(len(sample['result']) for run in analysis['cpu'] for sample in run['samples']) == 1450
assert sum(len(sample['result']) for run in analysis['mem'] for sample in run['samples']) == 150
result = dict(complete=True, distributions=checked, weightedComparisons=36, cpuSamples=1450, memorySamples=150, tolerance=1e-12, implementation='Python statistics.median/math; independent calculation from raw samples')
(out / 'audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

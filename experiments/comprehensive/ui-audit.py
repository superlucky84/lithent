"""Independent raw/distribution audit of the separate directory UI."""
from pathlib import Path
import json
import math
import statistics
import sys

out = Path(sys.argv[1]).resolve()
data = json.loads((out / 'ui-results.json').read_text())
runs = {order: json.loads((out / f'ui-{order}/production-cpu.json').read_text()) for order in ['main', 'reverse']}
assert all(run['complete'] for run in runs.values())
assert sum(len(sample['result']) for run in runs.values() for sample in run['samples']) == 320
distributions = 0
ratios = 0
for order in ['main', 'reverse', 'pooled']:
    sources = list(runs.values()) if order == 'pooled' else [runs[order]]
    for row in data['rows'][order]:
        for name in data['names']:
            for metric in ['total', 'script', 'paint']:
                values = sorted(value[metric] for run in sources for sample in run['samples'] if sample['name'] == name and sample['id'] == row['id'] for value in sample['result'])
                half = len(values) // 2
                expected = {'count': len(values), 'median': statistics.median(values), 'p25': statistics.median(values[:half]), 'p75': statistics.median(values[(len(values) + 1) // 2:]), 'min': values[0], 'max': values[-1]}
                for key, value in expected.items():
                    assert math.isclose(value, row['conditions'][name][metric][key], rel_tol=1e-12, abs_tol=1e-12)
                distributions += 1
    for comparison, items in data['ratios'][order].items():
        candidate, reference = comparison.split('/')
        for item, row in zip(items, data['rows'][order]):
            assert item['id'] == row['id']
            for metric in ['total', 'script', 'paint']:
                expected = row['conditions'][candidate][metric]['median'] / row['conditions'][reference][metric]['median']
                assert math.isclose(expected, item[metric], rel_tol=1e-12, abs_tol=1e-12)
                ratios += 1
result = {'samples': 320, 'distributions': distributions, 'ratios': ratios, 'pass': True}
(out / 'ui-audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

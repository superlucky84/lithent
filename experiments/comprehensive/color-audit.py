"""Independent six-app color normalization audit, separate from four-peer goals."""
from pathlib import Path
import hashlib
import json
import math
import sys

out = Path(sys.argv[1]).resolve()
data = json.loads((out / 'final-event-results.json').read_text())
colors = json.loads((out / 'colors.json').read_text())
inputs = json.loads((out / 'app-inputs.json').read_text())
common = Path(inputs['bench'], 'webdriver-ts-results/src/Common.ts').read_bytes()
assert hashlib.sha256(common).hexdigest() == colors['sourceSHA256']
assert hashlib.sha256((out / 'color-function.js').read_bytes()).hexdigest() == colors['extractedSHA256']

def color(factor):
    if factor < 2:
        alpha, start, end = factor - 1, [99, 191, 124], [255, 236, 132]
    else:
        alpha, start, end = min((factor - 2) / 2, 1), [255, 236, 132], [249, 105, 108]
    channels = [math.floor((1 - alpha) * x + alpha * y + 0.5) for x, y in zip(start, end)]
    return 'rgb(' + ', '.join(map(str, channels)) + ')'

checks = 0
for key, memory in [('rows', False), ('memory', True)]:
    for order, rows in data[key].items():
        for row, actual in zip(rows, colors[key][order]):
            assert row['id'] == actual['id']
            for metric in ['memory'] if memory else ['total', 'script', 'paint']:
                values = {name: row['conditions'][name]['median'] if memory else row['conditions'][name][metric]['median'] for name in data['names']}
                best = min(values.values())
                for name, value in values.items():
                    expected = value / best
                    entry = actual['metrics'][metric][name]
                    assert math.isclose(entry['factor'], expected, rel_tol=1e-12, abs_tol=1e-12)
                    assert entry['color'] == color(expected)
                    checks += 1
summary = {'colors': checks, 'pass': True, 'scope': colors['normalization']}
(out / 'color-audit.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary))

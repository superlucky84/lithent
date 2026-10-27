"""Independent audit of the event comparison's nested samples and GC deltas."""
from pathlib import Path
import json
import math
import statistics
import sys

out = Path(sys.argv[1]).resolve()
raw = json.loads((out / 'event-comparison/raw.json').read_text())
data = json.loads((out / 'event-results.json').read_text())
assert raw['finishedAt'] and not raw['failures']
assert len(raw['timings']) == 128 and len(raw['memory']) == 48
checks = 0

def check(values, actual):
    global checks
    values = sorted(values)
    half = len(values) // 2
    expected = {'count': len(values), 'median': statistics.median(values), 'p25': statistics.median(values[:half]), 'p75': statistics.median(values[(len(values) + 1) // 2:]), 'min': values[0], 'max': values[-1]}
    for key, value in expected.items():
        assert math.isclose(value, actual[key], rel_tol=1e-12, abs_tol=1e-12)
    checks += 1

for order, kinds in data['timing'].items():
    for kind, names in kinds.items():
        for name, actual in names.items():
            pages = [page for page in raw['timings'] if page['kind'] == kind and page['variant'] == name and (order == 'pooled' or page['order'] == (0 if order == 'main' else 1))]
            check([value / 5 for page in pages for value in page['updates']], actual['updateMs'])
            check([statistics.median(page['updates']) / 5 for page in pages], actual['pageUpdateMedians'])
            check([page['mount'] for page in pages], actual['mountMs'])
            check([value['elapsed'] for page in pages for value in page['dispatch']], actual['dispatch20kMs'])
        for comparison, actual in data['ratios'][order][kind].items():
            candidate, reference = comparison.split('/')
            for metric, ratio in actual.items():
                expected = names[candidate][metric]['median'] / names[reference][metric]['median']
                assert math.isclose(expected, ratio, rel_tol=1e-12, abs_tol=1e-12)
for kind, names in data['memory'].items():
    for name, actual in names.items():
        pages = [page for page in raw['memory'] if page['kind'] == kind and page['variant'] == name]
        for key, phase in [('updatedDeltaBytes','updated'),('churnDeltaBytes','churned'),('disposedDeltaBytes','disposed'),('settledDeltaBytes','settled')]:
            check([page[phase]['heap'] - page['empty']['heap'] for page in pages], actual[key])
        assert actual['settledNodeGrowth'] == [page['settled']['nodes'] - page['empty']['nodes'] for page in pages]
        assert actual['settledListenerGrowth'] == [page['settled']['jsEventListeners'] - page['empty']['jsEventListeners'] for page in pages]
summary = {'timingPages':128,'nestedUpdateBatches':3840,'actualUpdates':19200,'dispatchBatches':1280,'dispatchEvents':25600000,'memoryContexts':48,'distributions':checks,'pass':True}
(out / 'event-audit.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary))

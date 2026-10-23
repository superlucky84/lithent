"""Independent arithmetic/input audit of the synthetic Linux experiment."""
import hashlib
import json
import statistics
import sys
from pathlib import Path

out = Path(sys.argv[1]).resolve()
raw = json.loads((out / 'raw.json').read_text())
build = json.loads((out / 'build.json').read_text())
boundary = json.loads((out / 'snapshot-boundary.json').read_text())
assert raw['complete'] and not raw['failures']
assert len(raw['gates']) == len(raw['diagnostics']) == 6
assert len(raw['timings']) == 36 and len(raw['memory']) == 18
for file, digest in raw['frozen'].items():
    assert hashlib.sha256(Path(file).read_bytes()).hexdigest() == digest, file
for variant, files in build['files'].items():
    for file, digest in files.items():
        assert hashlib.sha256((out / variant / 'source' / file).read_bytes()).hexdigest() == digest, file
        if variant == 'candidate' and file != 'src/render.ts':
            assert digest == build['files']['baseline'][file]
for variant in ['baseline', 'candidate']:
    for name, item in build['bundles'][variant + '/production'].items():
        data = (out / variant / 'production' / name).read_bytes()
        assert len(data) == item['raw']
        assert hashlib.sha256(data).hexdigest() == item['sha256']
        assert b'__anchorMetrics' not in data
for kind in ['reveal', 'reorder', 'control']:
    pair = {row['variant']: row for row in raw['diagnostics'] if row['kind'] == kind}
    assert pair['candidate']['slices'] == pair['candidate']['singleton'] == 0
    assert pair['candidate']['nodeReads'] == pair['baseline']['nodeReads']
    assert pair['candidate']['visits'] <= pair['baseline']['visits']
assert boundary['observationallyEquivalent'] is False

def distribution(values):
    values = sorted(values)
    n = len(values)
    return dict(n=n, median=statistics.median(values),
                q1=statistics.median(values[:n//2]),
                q3=statistics.median(values[(n+1)//2:]),
                minimum=values[0], maximum=values[-1])

summary = {'scope': 'Synthetic Linux A/B; no official CPU/memory/peer score',
           'cpu': {}, 'memory': {}, 'diagnostics': raw['diagnostics'],
           'boundary': boundary, 'sizes': {}, 'adoption': 'deferred: accessor/snapshot observation differs',
           'checks': {'timingSamples': 1080, 'memoryContexts': 18, 'productionGates': 6,
                      'diagnosticConditions': 6, 'runtimeSourcesPerVariant': len(build['files']['baseline'])}}
samples = [sample['updateMs'] for row in raw['timings'] for sample in row['samples']]
summary['updateTimerObservedGridMs'] = 0.1 if all(abs(value * 10 - round(value * 10)) < 1e-6 for value in samples) else None
for kind in ['reveal', 'reorder', 'control']:
    summary['cpu'][kind] = {}
    for order in [0, 1, 'pooled']:
        summary['cpu'][kind][str(order)] = {}
        for metric in ['updateMs', 'twoRafMs']:
            pair = {}
            for variant in ['baseline', 'candidate']:
                batches = [row for row in raw['timings'] if row['kind'] == kind and row['variant'] == variant and (order == 'pooled' or row['order'] == order)]
                assert len(batches) == (6 if order == 'pooled' else 3)
                samples = []
                for batch in batches:
                    assert len(batch['samples']) == 30
                    for sample in batch['samples']:
                        assert 0 <= sample['updateMs'] <= sample['twoRafMs']
                        samples.append(sample[metric])
                pair[variant] = distribution(samples)
            pair['ratio'] = pair['candidate']['median'] / pair['baseline']['median']
            pair['changePercent'] = (pair['ratio'] - 1) * 100
            summary['cpu'][kind][str(order)][metric] = pair
    summary['memory'][kind] = {}
    for variant in ['baseline', 'candidate']:
        rows = [row for row in raw['memory'] if row['kind'] == kind and row['variant'] == variant]
        assert len(rows) == 3
        summary['memory'][kind][variant] = {
            phase: {metric: statistics.median(row[phase][metric] for row in rows)
                    for metric in ['heapBytes', 'documents', 'nodes', 'jsEventListeners']}
            for phase in ['initial', 'after', 'disposed']}
        summary['memory'][kind][variant]['afterMinusInitialHeapMedian'] = statistics.median(row['after']['heapBytes'] - row['initial']['heapBytes'] for row in rows)
for variant in ['baseline', 'candidate']:
    summary['sizes'][variant] = build['bundles'][variant + '/production']
(out / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
for kind, row in summary['cpu'].items():
    metric = row['pooled']['updateMs']
    print(kind, 'update_ms', metric['baseline']['median'], '->', metric['candidate']['median'], 'percent', round(metric['changePercent'], 3))
print('PASS independent audit: 1080 samples, 18 memory contexts, inputs/source/counters/bundles')

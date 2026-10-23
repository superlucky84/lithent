"""Independent input/completeness/statistics audit; Python stdlib only."""
import hashlib
import json
import math
from pathlib import Path
import statistics as s
import sys

out = Path(sys.argv[1]).resolve()
raw = json.loads((out / 'raw.json').read_text())
build = json.loads((out / 'build.json').read_text())
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert raw.get('finishedAt') and not raw['failures']
assert raw['protocol'] == dict(size=2000, orders=2, pagesPerOrder=3, warmupBatches=10, retainedBatches=30, updatesPerBatch=5, dispatchWarmup=3, dispatchBatches=10, dispatchesPerBatch=20000, memoryPages=3, memoryUpdates=100, churn=10, official=False)
for file, expected in raw['frozen'].items():
    assert sha(file) == expected, file
for variant, files in build['files'].items():
    for file, expected in files.items():
        assert sha(out / variant / 'source' / file) == expected, file
for key, files in build['bundles'].items():
    for file, info in files.items():
        target = out / key / file
        assert sha(target) == info['sha256'] and target.stat().st_size == info['raw'], target
changed = {file for file, digest in build['files']['candidate'].items() if digest != build['files']['baseline'].get(file)}
assert changed == {'src/render.ts', 'src/hook/internal/unmount.ts', 'src/utils/event.ts'}, changed
assert len(raw['timings']) == 48 and len(raw['memory']) == 24
assert len(raw['contracts']) == 2 and len(raw['diagnostics']) == 8 and len(raw['observations']) == 2
assert raw['contracts'][0]['calls'] == raw['contracts'][1]['calls']
assert all(row['remaining'] == 0 and row['external'] == 4 for row in raw['contracts'])
kinds = ['inline-only', 'inline-text', 'stable-text', 'noevent-text']
variants = ['baseline', 'candidate']
seen = set()
for row in raw['timings']:
    key = tuple(row[x] for x in ['kind', 'variant', 'order', 'round'])
    assert key not in seen
    seen.add(key)
    assert len(row['updates']) == 30 and len(row['dispatch']) == 10
    assert all(isinstance(x, (int, float)) and math.isfinite(x) and x > 0 for x in row['updates'])
    assert row['final']['size'] == 2000 and row['final']['epoch'] == 200
    assert row['final']['calls'] == (0 if row['kind'] == 'noevent-text' else 260000)
    for d in row['dispatch']:
        assert d['elapsed'] > 0
        assert d['calls'] == (0 if row['kind'] == 'noevent-text' else 20000)
assert seen == {(k, v, o, r) for k in kinds for v in variants for o in range(2) for r in range(3)}
assert {(r['kind'], r['variant'], r['round']) for r in raw['memory']} == {(k,v,r) for k in kinds for v in variants for r in range(3)}
for row in raw['observations']:
    is_base=row['variant']=='baseline'
    assert row['externalOrder']==(['external','new'] if is_base else ['new','external'])
    assert row['externalRemove']==(0 if is_base else 1)
    assert row['externalDedup']==(1 if is_base else 2)
    assert row['sameDispatchReplacement']==([] if is_base else ['new'])
    assert row['nextDispatchReplacement']==(['new'] if is_base else ['new','new'])
    assert row['aliasReplacementOrder']==['b','c'] and row['aliasDedup']==['a','b']
for row in raw['diagnostics']:
    changing = row['kind'].startswith('inline') and row['variant'] == 'baseline'
    assert row['update'] == {'add': 24000 if changing else 0, 'remove': 24000 if changing else 0}
    assert row['mount'] == {'add': 0 if row['kind']=='noevent-text' else 2000, 'remove': 0}
    assert row['dispose'] == {'add':0, 'remove':0}


def stats(values):
    values = sorted(values)
    def percentile(p):
        at=(len(values)-1)*p
        i=int(at)
        return values[i]+(values[min(i+1,len(values)-1)]-values[i])*(at-i)
    return dict(n=len(values), min=min(values), p10=percentile(.1), median=s.median(values), p90=percentile(.9), max=max(values), mean=s.mean(values))


def series(rows, metric):
    if metric == 'updateMs':
        return [x/5 for row in rows for x in row['updates']]
    if metric == 'dispatch20kMs':
        return [x['elapsed'] for row in rows for x in row['dispatch']]
    return [row['mount'] for row in rows]


summary = dict(startedAt=raw['startedAt'], finishedAt=raw['finishedAt'], environment=raw['environment'], protocol=raw['protocol'], timing={}, memory={}, size=build['bundles'], observations=raw['observations'], diagnostics=raw['diagnostics'], inputAudit=dict(frozen=len(raw['frozen']), baselineSources=len(build['files']['baseline']), candidateSources=len(build['files']['candidate']), changed=sorted(changed), timingPages=48, updateBatches=1440, actualTimedUpdates=7200, dispatchBatches=480, actualTimedDispatches=9600000, memoryContexts=24))
for kind in kinds:
    summary['timing'][kind] = {}
    for metric in ['updateMs','dispatch20kMs','mountMs']:
        result = dict(pooled={}, orders=[], pageMedians={})
        for v in variants:
            rows=[r for r in raw['timings'] if r['kind']==kind and r['variant']==v]
            result['pooled'][v]=stats(series(rows,metric))
            result['pageMedians'][v]=[s.median(series([r],metric)) for r in rows]
        result['changePct']=(result['pooled']['candidate']['median']/result['pooled']['baseline']['median']-1)*100
        for order in range(2):
            entry={v:stats(series([r for r in raw['timings'] if r['kind']==kind and r['variant']==v and r['order']==order],metric)) for v in variants}
            entry['changePct']=(entry['candidate']['median']/entry['baseline']['median']-1)*100
            result['orders'].append(entry)
        summary['timing'][kind][metric]=result
    summary['memory'][kind]={}
    for stage in ['mounted','updated','churned','disposed']:
        entry={}
        for v in variants:
            rows=[r for r in raw['memory'] if r['kind']==kind and r['variant']==v]
            entry[v]={name:stats([r[stage][name]-r['empty'][name] for r in rows]) for name in ['heap','nodes','jsEventListeners']}
            entry[v]['absoluteHeap']=stats([r[stage]['heap'] for r in rows])
        entry['heapDeltaBytes']=entry['candidate']['heap']['median']-entry['baseline']['heap']['median']
        denominator=entry['baseline']['heap']['median']
        entry['heapDeltaPct']=100*entry['heapDeltaBytes']/denominator if denominator else None
        summary['memory'][kind][stage]=entry
summary['initialDisposal']={v:dict(contexts=12,extraDOM=sum(r['disposed']['nodes']>r['empty']['nodes'] for r in raw['memory'] if r['variant']==v),extraListeners=sum(r['disposed']['jsEventListeners']>r['empty']['jsEventListeners'] for r in raw['memory'] if r['variant']==v)) for v in variants}
retention_path=out/'retention.json'
if retention_path.exists():
    follow=json.loads(retention_path.read_text())
    assert follow.get('finishedAt') and not follow['failures'] and len(follow['rows'])==24
    for file,expected in follow['frozen'].items():
        assert sha(file)==expected,file
    assert {(r['kind'],r['variant'],r['round']) for r in follow['rows']} == {(k,v,r) for k in kinds for v in variants for r in range(3)}
    summary['retention']=dict(startedAt=follow['startedAt'],finishedAt=follow['finishedAt'],protocol=follow['protocol'],contexts=24,byVariant={})
    for v in variants:
        rows=[r for r in follow['rows'] if r['variant']==v]
        summary['retention']['byVariant'][v]={stage:dict(contextsWithExtraDOM=sum(r[stage]['nodes']>r['empty']['nodes'] for r in rows), contextsWithExtraListeners=sum(r[stage]['jsEventListeners']>r['empty']['jsEventListeners'] for r in rows), nodeDeltas=[r[stage]['nodes']-r['empty']['nodes'] for r in rows], listenerDeltas=[r[stage]['jsEventListeners']-r['empty']['jsEventListeners'] for r in rows],heapDeltas=[r[stage]['heap']-r['empty']['heap'] for r in rows]) for stage in ['immediate','settled']}
(out/'audit.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({k:{m:round(x['changePct'],3) for m,x in v.items()} for k,v in summary['timing'].items()},indent=2))
print('PASS: hashes, three changed files, gate/counters, 48 timing/24 memory contexts, 1440 update/480 dispatch batches; independent Python statistics')

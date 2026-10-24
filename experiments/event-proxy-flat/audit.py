"""Independent 3-way input, sample completeness and statistics audit."""
import hashlib
import json
import math
from pathlib import Path
import statistics as s
import sys

out=Path(sys.argv[1]).resolve()
r=json.loads((out/'raw.json').read_text())
b=json.loads((out/'build.json').read_text())
variants=['baseline','slot','flat']
kinds=['inline-only','inline-text','stable-text','noevent-text']
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert r.get('finishedAt') and not r['failures']
assert r['protocol']==dict(size=2000,variants=variants,orderPolicy='rotated-triplets-and-reverse',settleFrames=2,settleMs=100,orders=2,pagesPerOrder=3,warmupBatches=10,retainedBatches=30,updatesPerBatch=5,dispatchWarmup=3,dispatchBatches=10,dispatchesPerBatch=20000,memoryPages=3,memoryUpdates=100,churn=10,official=False)
for file,digest in r['frozen'].items(): assert sha(file)==digest,file
for variant,files in b['files'].items():
    for file,digest in files.items(): assert sha(out/variant/'source'/file)==digest,file
for lane,files in b['bundles'].items():
    for file,info in files.items():
        p=out/lane/file
        assert sha(p)==info['sha256'] and p.stat().st_size==info['raw'],p
assert set(b['files'])==set(variants)
for v in ['slot','flat']:
    changed={file for file,h in b['files'][v].items() if h!=b['files']['baseline'].get(file)}
    assert changed=={'src/render.ts','src/hook/internal/unmount.ts','src/utils/event.ts'},changed
assert {f for f,h in b['files']['flat'].items() if h!=b['files']['slot'][f]}=={'src/utils/event.ts'}
assert len(r['contracts'])==3 and len(r['observations'])==3 and len(r['diagnostics'])==12
assert r['contracts'][0]['calls']==r['contracts'][1]['calls']==r['contracts'][2]['calls']
assert all(x['remaining']==0 and x['external']==4 for x in r['contracts'])
for x in r['observations']:
    base=x['variant']=='baseline'
    assert x['externalOrder']==(['external','new'] if base else ['new','external'])
    assert x['externalRemove']==(0 if base else 1)
    assert x['externalDedup']==(1 if base else 2)
    assert x['sameDispatchReplacement']==([] if base else ['new'])
    assert x['nextDispatchReplacement']==(['new'] if base else ['new','new'])
    assert x['aliasReplacementOrder']==['b','c'] and x['aliasDedup']==['a','b']
for x in r['diagnostics']:
    changing=x['variant']=='baseline' and x['kind'].startswith('inline')
    assert x['update']==dict(add=24000 if changing else 0,remove=24000 if changing else 0)
    assert x['mount']==dict(add=0 if x['kind']=='noevent-text' else 2000,remove=0)
    assert x['dispose']==dict(add=0,remove=0)
seen=set()
for x in r['timings']:
    key=tuple(x[k] for k in ['kind','variant','order','round'])
    assert key not in seen; seen.add(key)
    assert len(x['updates'])==30 and len(x['dispatch'])==10
    assert x['final']['size']==2000 and x['final']['epoch']==200
    assert x['final']['calls']==(0 if x['kind']=='noevent-text' else 260000)
    assert x['mount']>0 and all(math.isfinite(z) and z>0 for z in x['updates'])
    for d in x['dispatch']:
        assert d['elapsed']>0 and d['calls']==(0 if x['kind']=='noevent-text' else 20000)
assert seen=={(k,v,o,i) for k in kinds for v in variants for o in range(2) for i in range(3)}
for kind in kinds:
    for order in range(2):
        for i in range(3):
            seq=variants[i:]+variants[:i]
            if order:seq=seq[::-1]
            assert [x['variant'] for x in r['timings'] if x['kind']==kind and x['order']==order and x['round']==i]==seq
assert len(r['timings'])==72 and len(r['memory'])==36
assert {(x['kind'],x['variant'],x['round']) for x in r['memory']}=={(k,v,i) for k in kinds for v in variants for i in range(3)}


def stats(values):
    values=sorted(values)
    def percentile(p):
        t=(len(values)-1)*p; i=int(t)
        return values[i]+(values[min(i+1,len(values)-1)]-values[i])*(t-i)
    return dict(n=len(values),min=min(values),p10=percentile(.1),median=s.median(values),p90=percentile(.9),max=max(values),mean=s.mean(values))


def series(rows,metric):
    if metric=='updateMs':return [z/5 for x in rows for z in x['updates']]
    if metric=='dispatch20kMs':return [z['elapsed'] for x in rows for z in x['dispatch']]
    return [x['mount'] for x in rows]


def change(a,b):return (b/a-1)*100 if a else None


def ratios(values):
    return dict(slotVsBaselinePct=change(values['baseline'],values['slot']),flatVsBaselinePct=change(values['baseline'],values['flat']),flatVsSlotPct=change(values['slot'],values['flat']))


summary=dict(startedAt=r['startedAt'],finishedAt=r['finishedAt'],environment=r['environment'],protocol=r['protocol'],size=b['bundles'],sourceCommits=dict(baseline=b['base'],slot=b['slotSourceCommit']),observations=r['observations'],diagnostics=r['diagnostics'],timing={},memory={},audit=dict(frozenFiles=len(r['frozen']),sourceCounts={v:len(x) for v,x in b['files'].items()},slotFlatOnlyDifferentFile='src/utils/event.ts',timingPages=72,updateBatches=2160,timedUpdates=10800,dispatchBatches=720,timedDispatches=14400000,memoryContexts=36))
for kind in kinds:
    summary['timing'][kind]={}
    for metric in ['updateMs','dispatch20kMs','mountMs']:
        x=dict(pooled={},orders=[],pageMedians={})
        for v in variants:
            rows=[z for z in r['timings'] if z['kind']==kind and z['variant']==v]
            x['pooled'][v]=stats(series(rows,metric))
            x['pageMedians'][v]=[s.median(series([z],metric)) for z in rows]
        x.update(ratios({v:x['pooled'][v]['median'] for v in variants}))
        for order in range(2):
            d={v:stats(series([z for z in r['timings'] if z['kind']==kind and z['variant']==v and z['order']==order],metric)) for v in variants}
            d.update(ratios({v:d[v]['median'] for v in variants}));x['orders'].append(d)
        summary['timing'][kind][metric]=x
    summary['memory'][kind]={}
    for stage in ['mounted','updated','churned','disposed','settled']:
        x={}
        for v in variants:
            rows=[z for z in r['memory'] if z['kind']==kind and z['variant']==v]
            x[v]={name:stats([z[stage][name]-z['empty'][name] for z in rows]) for name in ['heap','nodes','jsEventListeners']}
            x[v]['absoluteHeap']=stats([z[stage]['heap'] for z in rows])
        values={v:x[v]['heap']['median'] for v in variants}
        slotExtra=values['slot']-values['baseline'];flatExtra=values['flat']-values['baseline']
        x.update(ratios(values));x.update(slotExtraBytes=slotExtra,flatExtraBytes=flatExtra,extraBytesSaved=slotExtra-flatExtra,extraOverheadSavedPct=100*(slotExtra-flatExtra)/slotExtra if slotExtra>0 and kind!='noevent-text' and stage in ['mounted','updated','churned'] else None)
        summary['memory'][kind][stage]=x
summary['disposal']={v:{stage:dict(contexts=12,extraDOM=sum(z[stage]['nodes']>z['empty']['nodes'] for z in r['memory'] if z['variant']==v),extraListeners=sum(z[stage]['jsEventListeners']>z['empty']['jsEventListeners'] for z in r['memory'] if z['variant']==v)) for stage in ['disposed','settled']} for v in variants}
(out/'audit.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({k:dict(update=v['updateMs']['flatVsBaselinePct'],dispatch=v['dispatch20kMs']['flatVsBaselinePct'],flatVsSlotHeapSaved=summary['memory'][k]['updated']['extraOverheadSavedPct']) for k,v in summary['timing'].items()},indent=2))
print('PASS: all inputs/9bundles, baseline17/slot18/flat18 scope, 72 timing pages/24 rotated triplets/36 memory contexts,2160 update/720 dispatch batches independently audited')

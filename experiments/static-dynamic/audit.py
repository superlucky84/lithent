"""Independent raw distribution, ratio, weighting and provenance audit."""
import hashlib
import json
import math
import pathlib
import statistics
import sys

out=pathlib.Path(sys.argv[1]).resolve()
root=pathlib.Path.cwd()
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
result=read(out/'results.json')
weight_source=read(root/'docs/benchmark/dc25-keyed-fast-path-final-results.json')
weights={row['id']:weight_source['weights'][i] for i,row in enumerate(weight_source['rows']['pooled'])}
rounds={o:{m:read(out/('official-'+o)/('production-'+m+'.json')) for m in ['cpu','mem']} for o in ['main','reverse']}
for mode,expected in [('cpu',870),('mem',90)]:
    assert sum(len(s['result']) for r in rounds.values() for s in r[mode]['samples'])==expected
    for r in rounds.values():
        run=r[mode]
        assert len(run['samples'])==(27 if mode=='cpu' else 15)
        assert len({(s['id'],s['name']) for s in run['samples']})==len(run['samples'])
        for s in run['samples']:assert len(s['result'])==(3 if mode=='mem' else 25 if s['id'].startswith('04') else 15)
distributions=ratios=weighted=0
for order in ['main','reverse','pooled']:
    runs=list(rounds.values()) if order=='pooled' else [rounds[order]]
    for row in result['cpu'][order]:assert row['weight']==weights[row['id']]
    for mode,rows in [('cpu',result['cpu'][order]),('mem',result['memory'][order])]:
        for row in rows:
            for name in ['stock','control','candidate']:
                raw=[v for r in runs for s in r[mode]['samples'] if s['id']==row['id'] and s['name']==name for v in s['result']]
                for metric in (['total','script','paint'] if mode=='cpu' else ['memory']):
                    values=sorted(v[metric] for v in raw) if mode=='cpu' else sorted(raw)
                    n=len(values);d=row['conditions'][name][metric] if mode=='cpu' else row['conditions'][name]
                    expected=dict(n=n,median=statistics.median(values),p25=statistics.median(values[:n//2]),p75=statistics.median(values[(n+1)//2:]),min=values[0],max=values[-1])
                    for k,v in expected.items():assert math.isclose(d[k],v,rel_tol=1e-12,abs_tol=1e-12),(order,row['id'],name,k)
                    distributions+=1
            for pair,(a,b) in result['pairs'].items():
                for metric in (['total','script','paint'] if mode=='cpu' else ['memory']):
                    av=row['conditions'][a][metric]['median'] if mode=='cpu' else row['conditions'][a]['median']
                    bv=row['conditions'][b][metric]['median'] if mode=='cpu' else row['conditions'][b]['median']
                    actual=row['change'][pair][metric] if mode=='cpu' else row['change'][pair]
                    assert math.isclose(av/bv-1,actual,abs_tol=1e-12)
                    ratios+=1
    for pair,(a,b) in result['pairs'].items():
        for metric in ['total','script','paint']:
            rows=result['cpu'][order]
            expected=math.exp(sum(r['weight']*math.log(r['conditions'][a][metric]['median']/r['conditions'][b][metric]['median']) for r in rows)/sum(r['weight'] for r in rows))-1
            assert math.isclose(expected,result['weighted'][order][pair][metric],abs_tol=1e-12)
            weighted+=1
for mode in ['cpu','mem']:
    a=[(s['id'],s['name']) for s in rounds['main'][mode]['samples']]
    b=[(s['id'],s['name']) for s in rounds['reverse'][mode]['samples']]
    for i in range(0,len(a),3):assert a[i:i+3]==list(reversed(b[i:i+3]))
initial=read(out/'initial.json');extra=read(out/'collection-inputs.json');runner=read(out/'runner-inputs.json')
for file,digest in initial['files'].items():assert sha(root/file)==digest,file
for file,digest in initial['browser']['files'].items():assert sha(pathlib.Path(file))==digest,file
for file,digest in extra['root'].items():assert sha(root/file)==digest,file
for file,digest in extra['stage'].items():assert sha(out/file)==digest,file
for file,digest in runner['frozen'].items():assert sha(pathlib.Path(runner['bench'])/file)==digest,file
for file,expected in runner['packages'].items():
    p=pathlib.Path(runner['installed']).parent/file/'package.json'
    assert read(p)['version']==expected['version'];assert sha(p)==expected['sha256']
for name,p in read(out/'tool-inputs.json').items():
    assert sha(pathlib.Path(p['file']))==p['sha256'],name
for name,expected in result['builds'].items():
    app=out/'apps'/name
    assert sha(app/expected['entryJS'])==expected['bundle'];assert sha(app/'index.html')==expected['html']
    if name!='diagnostic':
        text=(app/expected['entryJS']).read_text()
        assert not any(word in text for word in ['wdCreated','diffVisits','comparedSlots','templateClones'])
framework=next(v for k,v in initial['browser']['files'].items() if k!=initial['browser']['binary'])
for r in rounds.values():
    for run in r.values():
        assert run['complete'];assert run['chromeBinarySha256']==initial['browser']['files'][initial['browser']['binary']]
        assert run['chromeFrameworkSha256']==framework
        assert run['build']==result['builds']
gate=read(out/'gate/production-verify.json');assert gate['complete'] and len(gate['samples'])==3
assert all(s['scenarios']==9 and s['fontLoaded'] for s in gate['samples'])
assert result['validation']['identity']['passed']
browser=result['validation']['browser'];assert browser['native']['checks']==14
assert len(browser['retention'])==9
for r in browser['retention']:
    assert r['before']['dom']==r['afterChurn']['dom']==r['afterUpdatesAndClear']['dom']
for p in out.glob('*-exit.json'):assert read(p)['status']==0,str(p)
audit=dict(passed=True,distributions=distributions,ratios=ratios,weighted=weighted,samples=result['counts'],oppositeOrders=True,
           frozenRoot=len(initial['files']),additionalRoot=len(extra['root']),frozenStage=len(extra['stage']),runnerFiles=len(runner['frozen']),runnerPackages=len(runner['packages']),nativeChecks=14,retentionContexts=9,bundleAndBrowserHashes=True,diagnosticCountersAbsent=True)
(out/'audit.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit))

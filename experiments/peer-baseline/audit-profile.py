"""Independently audit diagnostic exclusions, sample sums and marked trace windows."""
import gzip
import hashlib
import json
from pathlib import Path
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/lithent-peers-20261023')
diagnosis = json.loads((out / 'diagnosis.json').read_text())
analysis = json.loads((out / 'profile-analysis.json').read_text())
traces = json.loads((out / 'trace-diagnosis.json').read_text())
valid = invalid = windows_checked = 0
assert diagnosis['complete'] and traces['complete'] and analysis['complete']
for run in diagnosis['runs']:
    summary = next(s for s in analysis['summaries'] if all(s[k] == run[k] for k in ['id', 'name', 'round']))
    raw = (out / run['profileFile']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run['profileSHA256']
    profiles = json.loads(gzip.decompress(raw))['profiles']
    functions, excluded = {}, []
    totals = dict(applicationUs=0, driverUs=0, gcUs=0, idleUs=0, otherUs=0)
    for i, p in enumerate(profiles):
        nodes = {n['id']: n['callFrame'] for n in p['nodes']}
        assert len(p['samples']) == len(p['timeDeltas'])
        assert all(n in nodes for n in p['samples'])
        if any(d < 0 for d in p['timeDeltas']):
            invalid += 1
            excluded.append(i)
            continue
        valid += 1
        for node, delta in zip(p['samples'], p['timeDeltas']):
            frame = nodes[node]
            app = '/' + run['name'] + '/' in frame['url']
            category = ('applicationUs' if app else 'gcUs' if frame['functionName'] == '(garbage collector)'
                        else 'idleUs' if frame['functionName'] == '(idle)'
                        else 'driverUs' if 'evaluation' in frame['url'] or 'pptr:' in frame['url'] else 'otherUs')
            totals[category] += delta
            if app:
                key = (frame['url'], frame['lineNumber'], frame['columnNumber'], frame['functionName'])
                duration, count = functions.get(key, (0, 0))
                functions[key] = (duration + delta, count + 1)
    assert totals == summary['categories']
    assert sum(totals.values()) == summary['sampledUs']
    assert summary['validProfiles'] == len(profiles) - len(excluded)
    assert excluded == [p['iteration'] for p in summary['excludedProfiles']]
    for fn in summary['topFunctions']:
        assert functions[(fn['url'], fn['line'], fn['column'], fn['name'])] == (fn['selfUs'], fn['samples'])

for run in traces['runs']:
    raw = (out / run['traceFile']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run['traceSHA256']
    trace = json.loads(gzip.decompress(raw))
    events = trace['traceEvents'] if isinstance(trace, dict) else trace
    summary = next(s['trace'] for s in analysis['summaries'] if s['round'] == 0 and s['id'] == run['id'] and s['name'] == run['name'])
    windows = []
    for i in range(10):
        start = next(e for e in events if e['name'] == f'peer-diag-{i}-start')
        end = next(e for e in events if e['name'] == f'peer-diag-{i}-end')
        assert end['ts'] >= start['ts']
        windows.append((start['ts'], end['ts'], start['pid'], start['tid']))
        windows_checked += 1
    for name, report in summary['events'].items():
        selected = [e for e in events if e['name'] == name and e.get('ph') == 'X' and 'dur' in e
                    and any(e['pid'] == pid and e['tid'] == tid and e['ts'] >= start and e['ts'] + e['dur'] <= end
                            for start, end, pid, tid in windows)]
        assert len(selected) == report['count']
        assert abs(sum(e['dur'] for e in selected) / 1000 - report['inclusiveMs']) < 1e-9

first_count = first_invalid = 0
first = out / 'diagnosis-first-attempt'
if first.exists():
    metadata = json.loads((first / 'metadata.json').read_text())
    for run in metadata['runs']:
        raw = (first / Path(run['profileFile']).name).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == run['profileSHA256']
        profiles = json.loads(gzip.decompress(raw))['profiles']
        first_count += len(profiles)
        first_invalid += sum(any(d < 0 for d in p['timeDeltas']) for p in profiles)
    assert first_invalid == analysis['excludedFirstAttempt']['invalidProfiles']

result = dict(complete=True, profileContexts=len(diagnosis['runs']), validProfiles=valid,
              excludedProfiles=invalid, traceContexts=len(traces['runs']), traceWindows=windows_checked,
              excludedFirstAttemptProfiles=first_count, invalidFirstAttemptProfiles=first_invalid,
              implementation='Independent Python raw profile/trace hash, negative-profile exclusion, category/function sums and marked complete-event audit')
(out / 'profile-audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

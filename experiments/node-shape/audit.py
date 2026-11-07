"""Independent archive, raw statistics, IC ownership and preservation audit."""
from pathlib import Path
import base64
import gzip
import hashlib
import json
import math
import re
import statistics
import sys

root = Path(__file__).resolve().parents[2]
decoded = {}
raw_log_count = 0
statistics_only = len(sys.argv) > 1 and sys.argv[1] == '--statistics'
if statistics_only:
    out = Path(sys.argv[2]).resolve()
    files = {}
    for prefix in ['', 'compact-experiment/']:
        names = ['performance.json', 'official-benchmark/webdriver-ts-results/src/Common.ts']
        names += [f'measure-{order}/production-{mode}.json' for order in ['main', 'reverse'] for mode in ['cpu', 'mem']]
        for name in names:
            decoded['run/' + prefix + name] = (out / prefix / name).read_bytes()
else:
    result = json.loads((root / 'docs/benchmark/node-shape-results.json').read_text())
    archive = (root / result['evidence']['file']).read_bytes()
    assert hashlib.sha256(archive).hexdigest() == result['evidence']['sha256']
    assert len(archive) == result['evidence']['bytes']
    files = json.loads(gzip.decompress(archive))['files']
    assert len(files) == result['evidence']['entries']
for name, item in files.items():
    data = base64.b64decode(item['content']) if item['encoding'] == 'base64' else item['content'].encode()
    assert hashlib.sha256(data).hexdigest() == item['sha256'], name
    assert len(data) == item['bytes'], name
    if 'original' in item:
        original = gzip.decompress(data)
        assert hashlib.sha256(original).hexdigest() == item['original']['sha256'], name
        assert len(original) == item['original']['bytes'], name
        decoded[item['original']['file']] = original
        raw_log_count += 1
    else:
        decoded[name] = data

def load(name):
    return json.loads(decoded['run/' + name])

def close(a, b):
    assert math.isclose(a, b, rel_tol=1e-12, abs_tol=1e-12), (a, b)

def distribution(values):
    values = sorted(values)
    half = len(values) // 2
    return {'count': len(values), 'median': statistics.median(values), 'p25': statistics.median(values[:half]), 'p75': statistics.median(values[(len(values)+1)//2:]), 'min': values[0], 'max': values[-1]}

count = 0
weighted_checks = 0
for prefix in ['', 'compact-experiment/']:
    performance = load(prefix + 'performance.json')
    cpu = {order: load(prefix + f'measure-{order}/production-cpu.json') for order in ['main', 'reverse']}
    memory = {order: load(prefix + f'measure-{order}/production-mem.json') for order in ['main', 'reverse']}
    assert all(run['complete'] for run in [*cpu.values(), *memory.values()])
    assert sum(len(s['result']) for r in cpu.values() for s in r['samples']) == 580
    assert sum(len(s['result']) for r in memory.values() for s in r['samples']) == 60
    common = decoded['run/' + prefix + 'official-benchmark/webdriver-ts-results/src/Common.ts'].decode()
    weights = [float(x) for x in re.search(r'benchmarkWeights\s*=\s*\[([^\]]+)\]', common)[1].split(',') if x.strip()]
    assert len(weights) == 9
    assert performance['weights'] == weights
    for order in ['main', 'reverse', 'pooled']:
        rounds = ['main', 'reverse'] if order == 'pooled' else [order]
        for row in performance['cpuOrders'][order]['rows']:
            for metric, info in row['metrics'].items():
                for name in ['baseline', 'candidate']:
                    values = [item[metric] for r in rounds for sample in cpu[r]['samples'] if sample['id'] == row['id'] and sample['name'] == name for item in sample['result']]
                    expected = distribution(values)
                    for key, value in expected.items(): close(value, info[name][key])
                    count += 1
                close(info['candidate']['median'] / info['baseline']['median'], info['ratio'])
                close(100 * (info['ratio'] - 1), info['changePercent'])
        for metric in ['total', 'script', 'paint']:
            ratios = [row['metrics'][metric]['ratio'] for row in performance['cpuOrders'][order]['rows']]
            close(math.exp(sum(w * math.log(r) for w, r in zip(weights, ratios)) / sum(weights)), performance['cpuOrders'][order]['weighted'][metric])
            weighted_checks += 1
        for row in performance['memoryOrders'][order]:
            for name in ['baseline', 'candidate']:
                values = [value for r in rounds for sample in memory[r]['samples'] if sample['id'] == row['id'] and sample['name'] == name for value in sample['result']]
                for key, value in distribution(values).items(): close(value, row[name][key])
                count += 1
            close(row['candidate']['median'] / row['baseline']['median'], row['ratio'])
            close(row['candidate']['median'] - row['baseline']['median'], row['differenceMB'])
assert count == 384 and weighted_checks == 18
if statistics_only:
    print(json.dumps({'distributions': count, 'weightedChecks': weighted_checks, 'cpuSamples': 1160, 'memorySamples': 120, 'pass': True}))
    sys.exit(0)

# A separate sequential range-owner parser checks IC events and raw state totals.
ic_checks = 0
deopt_checks = 0
for prefix, lane in [('', 'production'), ('', 'layout-baseline'), ('', 'layout-candidate'), ('compact-experiment/', 'layout-candidate')]:
    analysis = load(prefix + ('analysis.json' if lane == 'production' else f'analysis-{lane}.json'))
    stdout = decoded[f'run/{prefix}{lane}-diagnostic/stdout.log'].decode()
    raw_deopts = [line for line in stdout.splitlines() if 'deopt' in line]
    assert raw_deopts == [item['raw'] for item in analysis['production']['deopts']]
    assert sum('reason: wrong map' in line for line in raw_deopts) == sum(item['reason'] == 'wrong map' for item in analysis['production']['deopts'])
    deopt_checks += len(raw_deopts)
    for context in analysis['production']['contexts']:
        text = decoded[f'run/{prefix}{lane}-diagnostic/{context["file"]}'].decode()
        code, sites = {}, {}
        target_id = None
        matched = 0
        for row_number, line in enumerate(text.splitlines(), 1):
            parts = line.split(',')
            kind = parts[0]
            if kind == 'script-source' and parts[2].endswith('/' + lane + '/main.js'):
                target_id = int(parts[1])
            elif kind == 'code-creation':
                start = int(parts[4], 16)
                code[start] = {'start': start, 'size': int(parts[5]), 'row': row_number, 'sid': None}
            elif kind == 'code-source-info':
                entry = code.get(int(parts[1], 16))
                if entry is not None: entry['sid'] = int(parts[2])
            elif kind == 'code-move':
                entry = code.pop(int(parts[1], 16), None)
                if entry:
                    entry['start'] = int(parts[2], 16)
                    code[entry['start']] = entry
            elif kind == 'code-delete': code.pop(int(parts[1], 16), None)
            elif kind in ['LoadIC', 'StoreIC', 'KeyedLoadIC', 'KeyedStoreIC', 'StoreInArrayLiteralIC', 'DefineKeyedOwnIC']:
                pc = int(parts[1], 16)
                owners = [entry for entry in code.values() if entry['start'] <= pc < entry['start'] + entry['size']]
                owner = max(owners, key=lambda entry: entry['row'], default=None)
                if owner is None or target_id is None or owner['sid'] != target_id: continue
                matched += 1
                key = ':'.join([kind, parts[3], parts[4]])
                site = sites.setdefault(key, {'states': set(), 'last': None, 'events': 0})
                site['states'].update(parts[5:7]); site['last'] = parts[6]; site['events'] += 1
        assert matched == context['matchedIC']
        assert len(sites) == len(context['accessSites'])
        for item in context['accessSites']:
            site = sites[item['key']]
            assert site['states'] == set(item['states'])
            assert site['last'] == item['final']
            assert site['events'] == len(item['transitions'])
            ic_checks += 1

for prefix, label in [('', 'probe'), ('', 'probe-candidate'), ('compact-experiment/', 'probe-candidate')]:
    probe = load(prefix + label + '-diagnostic/result.json')
    assert probe['complete']
    for run in probe['runs']:
        for phase in run['phases']:
            observation = phase.get('observation', phase)
            live = observation['live']
            assert live['fast'] + live['dictionary'] == live['nodes']
            assert sum(group['count'] for group in live['groups']) == live['nodes']
            if label == 'probe-candidate' and not prefix and live['nodes']:
                assert live['mapGroups'] == 1
                assert all(len(group['fields']) == 22 for group in live['groups'])
            if prefix and live['nodes']:
                assert live['dictionary'] == 0
                assert live['mapGroups'] <= 3
                assert all(len(group['fields']) >= 13 for group in live['groups'])
            if phase.get('name', '').startswith(('select-', 'partial-')):
                assert observation['counts'].get('clickListenerAdds', 0) == 0
                assert observation['counts'].get('clickListenerRemoves', 0) == 0
for prefix in ['', 'compact-experiment/']:
    retention = load(prefix + 'retention.json')
    assert retention['complete'] and len(retention['samples']) == 6
    for sample in retention['samples']:
        for key in ['checkpoints', 'updateCheckpoints']:
            assert sample[key][0]['nodes'] == sample[key][-1]['nodes']
            assert sample[key][0]['jsEventListeners'] == sample[key][-1]['jsEventListeners']

final_files = (result.get('adoption') or {}).get('files', result['preservation']['initialFiles'])
for name, sha in final_files.items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == sha, name
print(json.dumps({'entries': len(files), 'packedRawLogs': raw_log_count, 'distributions': count, 'weightedChecks': weighted_checks, 'icAccessSiteChecks': ic_checks, 'rawDeoptChecks': deopt_checks, 'cpuSamples': 1160, 'memorySamples': 120, 'retentionContexts': 12, 'finalFiles': len(final_files), 'pass': True}))

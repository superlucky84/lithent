"""Independent archive, source, counter, parity and size-arithmetic audit."""
from pathlib import Path
import base64
import gzip
import hashlib
import json

root = Path(__file__).resolve().parents[2]
result = json.loads((root / 'docs/benchmark/keyed-placement-results.json').read_text())
archive = (root / result['evidence']['file']).read_bytes()
assert hashlib.sha256(archive).hexdigest() == result['evidence']['sha256']
assert len(archive) == result['evidence']['bytes']
files = json.loads(gzip.decompress(archive))['files']
assert len(files) == result['evidence']['entries']
for name, item in files.items():
    data = base64.b64decode(item['content']) if item['encoding'] == 'base64' else item['content'].encode()
    assert len(data) == item['bytes'], name
    assert hashlib.sha256(data).hexdigest() == item['sha256'], name

def stored(name):
    return files[name]['content'].encode()

for variant in ['baseline', 'candidate']:
    for name, sha in result[variant]['sources'].items():
        assert hashlib.sha256(stored('run/' + variant + '/' + name)).hexdigest() == sha
    for name, info in result[variant]['bundles'].items():
        data = stored('run/' + variant + '/dist/' + name)
        assert hashlib.sha256(data).hexdigest() == info['sha256']
        assert len(data) == info['raw']
        assert len(gzip.compress(data, compresslevel=9, mtime=0)) == info['gzip']
        if variant == 'baseline':
            assert info['sha256'] == info['historicalSHA256']

baseline = result['counters']['variants']['baseline']['samples']
candidate = result['counters']['variants']['candidate']['samples']
assert len(baseline) == len(candidate) == 11
parity = ['diffLoopChildren', 'diffKeyReads', 'mapBuildVisits', 'mapSet', 'mapHas', 'mapGet', 'mapDelete', 'unusedVisits', 'clearDiffMeta', 'wDomUpdate']
arrays = ['matchedArrays', 'oiArrays', 'moverArrays', 'createdArrays']
comparisons = 0
for before, after in zip(baseline, candidate):
    assert before['name'] == after['name'] and before['rows'] == after['rows']
    a, b = before['counts'], after['counts']
    for key in parity:
        assert a.get(key, 0) == b.get(key, 0), (before['name'], key)
        comparisons += 1
    fast = before['name'] in ['select', 'select-next', 'partial']
    assert b.get('fastLoops', 0) == int(fast)
    assert b.get('frameStart', 0) == b.get('frameEnd', 0)
    assert b.get('matchAnalysisVisits', 0) == (0 if fast else a.get('matchAnalysisVisits', 0))
    for key in arrays:
        assert b.get(key, 0) == a.get(key, 0) - int(fast)
        comparisons += 1
    if fast:
        assert a['matchAnalysisVisits'] == b['fastChildren'] == 1000
        assert b['proofWrites'] == b['proofReads'] == b['proofDeletes'] == 1

size = result['sizeGate']
assert size['added'] == size['candidate'] - size['baseline'] == 154
assert size['exceeded'] == size['candidate'] - size['budget'] == 152
assert result['decision'] == 'defer-this-prototype-size-gate'
for name, sha in result['preservation']['files'].items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == sha, name
print(json.dumps({'archiveEntries': len(files), 'counterComparisons': comparisons, 'defaultFilesUnchanged': len(result['preservation']['files']), 'sizeExceeded': size['exceeded'], 'pass': True}))

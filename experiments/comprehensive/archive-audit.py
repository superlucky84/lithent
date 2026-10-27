"""Stream-check every preserved archive member against its manifest."""
from pathlib import Path
import hashlib
import json
import sys
import tarfile

folder = Path(sys.argv[1]).resolve()
manifest = json.loads((folder / 'comprehensive-evidence-manifest.json').read_text())

def digest(stream):
    result = hashlib.sha256()
    for block in iter(lambda: stream.read(1024 * 1024), b''):
        result.update(block)
    return result.hexdigest()

seen = set()
traces = 0
for archive in manifest['archives']:
    file = folder / archive['file']
    assert file.stat().st_size == archive['bytes'] < 100 * 1024 ** 2
    with file.open('rb') as stream:
        assert digest(stream) == archive['sha256']
    count = 0
    with tarfile.open(file, 'r|gz') as stream:
        for member in stream:
            assert member.isfile()
            assert member.name not in seen
            expected = manifest['files'][member.name]
            assert expected['archive'] == archive['file']
            assert expected['bytes'] == member.size
            with stream.extractfile(member) as entry:
                assert digest(entry) == expected['sha256']
            seen.add(member.name)
            count += 1
            traces += '/traces/' in member.name
    assert count == archive['entries']
assert seen == set(manifest['files'])
assert len(seen) == manifest['totalEntries']
assert traces == manifest['traceFiles']
summary = {'archives': len(manifest['archives']), 'entries': len(seen), 'traces': traces, 'pass': True}
(folder / 'comprehensive-archive-audit.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary))

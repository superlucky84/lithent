"""Independently hash every compressed part and decoded tar member."""
from pathlib import Path
import hashlib
import json
import tarfile

root = Path(__file__).resolve().parents[2]
directory = root / 'docs/benchmark'
manifest = json.loads((directory / 'dc25-keyed-fast-path-evidence-manifest.json').read_text())
expected = {entry['path']: entry for entry in manifest['entries']}
assert len(expected) == len(manifest['entries'])
seen = set()
for part in manifest['parts']:
    file = directory / part['file']
    assert file.stat().st_size == part['bytes']
    with file.open('rb') as stream:
        assert hashlib.file_digest(stream, 'sha256').hexdigest() == part['sha256']
    count = 0
    with tarfile.open(file, 'r:gz') as archive:
        for member in archive:
            assert member.isfile() and member.name not in seen
            assert not member.name.startswith('/') and '..' not in Path(member.name).parts
            entry = expected[member.name]
            assert entry['part'] == part['file'] and entry['bytes'] == member.size
            with archive.extractfile(member) as stream:
                assert hashlib.file_digest(stream, 'sha256').hexdigest() == entry['sha256']
            seen.add(member.name)
            count += 1
    assert count == part['entries']
assert seen == set(expected)
result = {'pass': True, 'parts': len(manifest['parts']), 'decodedEntries': len(seen),
          'compressedBytes': sum(part['bytes'] for part in manifest['parts'])}
(directory / 'dc25-keyed-fast-path-archive-audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

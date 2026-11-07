"""Audit DC-23 logs/artifacts and preserve evidence without changing DC-22 data."""
from pathlib import Path
import hashlib
import io
import json
import re
import subprocess
import sys
import tarfile

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
docs = root / 'docs/benchmark'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def load(file):
    return json.loads(file.read_bytes())


artifacts = load(out / 'artifacts.json')
expected_names = {'full-build', 'full-tests', 'ssr-base', 'satellites-concurrent',
                  'verify-concurrent', 'size', 'types-base', 'types-concurrent',
                  'types-e2e', 'lint', 'package-formats', 'playwright'}
records = [load(file) for file in sorted(out.glob('*.json'))]
records = [record for record in records if 'command' in record]
assert {record['name'] for record in records} == expected_names
assert len(records) == len(expected_names), 'Unexpected repeated/failed run: review explicitly'
for record in records:
    assert record['exitCode'] == 0, record['name']
    assert record['sources'] == artifacts['sources'], record['name']
    assert digest((out / record['log']).read_bytes()) == record['logSHA256']
for file, expected in artifacts['sources'].items():
    data = (root / file).read_bytes()
    assert digest(data) == expected, file
    old = subprocess.check_output(['git', 'show', f'fb481f3:{file}'], cwd=root)
    assert data == old, file
assert not (root / 'src/utils/event.ts').exists()
assert (root / 'experiments/comprehensive/event.ts').read_bytes() == subprocess.check_output(
    ['git', 'show', '95d6faf:src/utils/event.ts'], cwd=root)
for file, sizes in artifacts['bundles'].items():
    assert digest((root / file).read_bytes()) == sizes['sha256'], file
with tarfile.open(docs / 'comprehensive-evidence.tar.gz') as old:
    for suffix in ['mjs', 'umd.js', 'cjs']:
        file = f'dist/lithent.{suffix}'
        assert old.extractfile(f'run/baseline/{file}').read() == (root / file).read_bytes()

proxy = load(out / 'same-compressor-proxy.json')
assert (proxy['node'], proxy['zlib']) == (artifacts['node'], artifacts['zlib'])
adoption = load(docs / 'comprehensive-adoption.json')
for name, sizes in proxy['files'].items():
    table = adoption['concurrentBundles' if name.startswith('lithentConcurrent.') else 'bundles']
    assert sizes['sha256'] == table[name]['sha256']
    assert digest((out / 'previous-proxy' / name).read_bytes()) == sizes['sha256']

packages = load(out / 'packages.json')
assert packages['complete'] and len(packages['samples']) == 18
playwright = load(out / 'playwright.json')
stats = playwright['stats']
assert (stats['expected'], stats['unexpected'], stats['skipped'], stats['flaky']) == (78, 0, 0, 0)
browser_tests = []


def walk(suite):
    for spec in suite.get('specs', []):
        for test in spec['tests']:
            assert len(test['results']) == 1
            assert test['results'][0]['status'] == 'passed'
            assert test['results'][0]['retry'] == 0
            browser_tests.append((test['projectName'], spec['file']))
    for child in suite.get('suites', []):
        walk(child)


for suite in playwright['suites']:
    walk(suite)
assert len(browser_tests) == 78
for core in ['base', 'concurrent']:
    assert sum(project == core and file.endswith('events.spec.ts')
               for project, file in browser_tests) == 7
test_totals = {}
for record in records:
    if record['name'] in ['full-tests', 'ssr-base', 'satellites-concurrent']:
        text = (out / record['log']).read_text()
        counts = [int(count) for count in re.findall(r'^\s*Tests\s+(\d+) passed', text, re.M)]
        test_totals[record['name']] = sum(counts)
assert test_totals == {'full-tests': 974, 'ssr-base': 15, 'satellites-concurrent': 172}

# Verify immutable archives; do not repeat the historical decompression audit.
old_manifest = load(docs / 'comprehensive-evidence-manifest.json')
for item in old_manifest['archives']:
    data = (docs / item['file']).read_bytes()
    assert len(data) == item['bytes'] and digest(data) == item['sha256'], item['file']
assert len(old_manifest['archives']) == 56
unchanged = subprocess.check_output(['git', 'diff', '--name-only', '95d6faf', '--',
                                   'experiments/comprehensive', 'docs/benchmark/comprehensive-*'], cwd=root)
assert not unchanged, unchanged.decode()
preservation = {'archives': old_manifest['archives'], 'archiveCount': 56,
                'bytes': sum(item['bytes'] for item in old_manifest['archives']),
                'manifestSHA256': digest((docs / 'comprehensive-evidence-manifest.json').read_bytes()),
                'historicalScriptsAndRawDataUnchanged': True}
(out / 'preservation.json').write_text(json.dumps(preservation, indent=2) + '\n')
final = load(docs / 'comprehensive-final-results.json')
goals = {order: {'pass': sum(row['baselineRatio'] <= 1.10 for row in rows), 'total': len(rows),
                 'items': [{key: row[key] for key in ['id', 'baselineRatio']} for row in rows]}
         for order, rows in final['goal'].items()}
assert goals['pooled']['pass'] == 6

summary = {'decision': 'DC-23: compact13 + native event registration',
           'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root).decode().strip(),
           'uncommitted': True, 'newPerformanceCollection': False,
           'baselineCommit': 'fb481f3aa6d315c3d55fb1b2cb97d86f4e53c2e4',
           'preservedEventCommit': '95d6faf42c860bfb87e180f594287a9e3d717334',
           'sourceAndBaseArtifactsMatchMeasuredB': True,
           'artifacts': artifacts, 'sameCompressorProxy': proxy, 'commands': records,
           'unitExecutionCounts': test_totals, 'existingSkipped': 3,
           'playwright': stats, 'playwrightRetries': 0, 'packageProbes': 18,
           'nativeBaselineGoal': goals, 'preservation': preservation,
           'reusedResultsSHA256': digest((docs / 'comprehensive-final-results.json').read_bytes()),
           'complete': True}
(out / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')

files = {f'run/{file.relative_to(out)}': file for file in out.rglob('*')
         if file.is_file() and 'node_modules' not in file.parts and 'package-consumer' not in file.parts}
for file in [*artifacts['sources'], *artifacts['bundles'], 'scripts/size-report.js',
             'README.md', 'lithent-agent-addon.md', 'skills/lithent/SKILL.md',
             'skills/lithent/reference/events.md', 'e2e/events.spec.ts', 'e2e/fixtures/events.ts',
             'src/tests/core-eventContract.test.ts', 'src/tests/core-eventDispatch.test.ts',
             'src/tests/core-portal-events.test.ts', 'lithentConcurrent/src/tests/concurrent-portalEvents.test.ts',
             'docs/benchmark/NATIVE_EVENTS_RESULTS.md']:
    files['repo/' + file] = root / file
for pattern in ['experiments/native-events/*', 'docs/performance-improvement/*.md']:
    for file in root.glob(pattern):
        if file.is_file():
            files['repo/' + str(file.relative_to(root))] = file
archive = docs / 'native-events-evidence.tar.gz'
entries = {}
with tarfile.open(archive, 'w:gz') as tar:
    for name, file in sorted(files.items()):
        data = file.read_bytes()
        info = tarfile.TarInfo(name)
        info.size, info.mode, info.mtime = len(data), 0o644, 0
        tar.addfile(info, io.BytesIO(data))
        entries[name] = {'bytes': len(data), 'sha256': digest(data)}
with tarfile.open(archive) as tar:
    assert len(tar.getmembers()) == len(entries)
    for member in tar.getmembers():
        assert digest(tar.extractfile(member).read()) == entries[member.name]['sha256']
summary['evidence'] = {'file': archive.name, 'bytes': archive.stat().st_size,
                       'sha256': digest(archive.read_bytes()), 'entries': entries}
(docs / 'native-events-validation.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps({'pass': True, 'commands': len(records), 'unitExecutions': sum(test_totals.values()),
                  'playwright': 78, 'packages': 18, 'preservedArchives': 56,
                  'archiveBytes': archive.stat().st_size, 'entries': len(entries)}))

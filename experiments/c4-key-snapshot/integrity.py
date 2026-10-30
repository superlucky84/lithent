"""Audit frozen sources, browser, dependencies and actual collection manifests."""
import hashlib
import json
import pathlib
import subprocess
import sys

out = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path.cwd()
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
initial = read(out / 'initial.json')
build = read(out / 'build-manifest.json')
prior_stage = pathlib.Path(read(out / 'preparation-notes.json')['unitResultsReused']['sourceStage'])
prior_inputs = read(prior_stage / 'initial.json')
for file, expected in initial['files'].items():
    if file != 'experiments/c4-key-snapshot/prepare.mjs':
        assert prior_inputs['files'][file] == expected, file
for name in ['check.json', 'snapshot-check.json']:
    assert sha(prior_stage / name) == sha(out / name), name
for file, expected in initial['files'].items():
    assert sha(root / file) == expected, file
for file, expected in initial['browser']['files'].items():
    assert sha(pathlib.Path(file)) == expected, file
framework_hash = next(v for k, v in initial['browser']['files'].items() if k != initial['browser']['binary'])
counts = {}
for kind, key in [('runner', 'installed'), ('peer', 'modules')]:
    inventory = read(out / (kind + '-inputs.json'))
    modules = pathlib.Path(inventory[key])
    for name, expected in inventory['packages'].items():
        file = modules.parent / name / 'package.json'
        assert read(file)['version'] == expected['version'], name
        assert sha(file) == expected['sha256'], name
    counts[kind] = len(inventory['packages'])
runner = read(out / 'runner-inputs.json')
for file, expected in runner['frozen'].items():
    assert sha(pathlib.Path(runner['bench']) / file) == expected, file
shared = [
    'experiments/c4-owner/boundary.ts', 'experiments/c4-owner/fixture.ts',
    'experiments/c4-owner/measure.mjs', 'experiments/c4-owner/browser.mjs',
    'experiments/c4-owner/analyze.mjs', 'experiments/c4-owner/audit.py',
    'docs/benchmark/production-run.mjs', 'docs/benchmark/official-memory.mjs',
    'docs/benchmark/dc25-keyed-fast-path-final-results.json',
]
shared_hashes = {}
for file in shared:
    committed = subprocess.check_output(['git', 'show', '7f4df5c:' + file])
    expected = hashlib.sha256(committed).hexdigest()
    assert sha(root / file) == expected, file
    shared_hashes[file] = expected
for name, expected in build.items():
    folder = out / 'apps' / name
    assert sha(folder / expected['entryJS']) == expected['bundle']
    assert sha(folder / 'index.html') == expected['html']
for folder, modes in [('gate', ['verify']), ('official-main', ['cpu', 'mem']), ('official-reverse', ['cpu', 'mem'])]:
    for mode in modes:
        run = read(out / folder / ('production-' + mode + '.json'))
        assert run['complete']
        assert run['build'] == build
        assert run['chromeBinarySha256'] == initial['browser']['files'][initial['browser']['binary']]
        assert run['chromeFrameworkSha256'] == framework_hash
        if mode == 'verify':
            assert len(run['samples']) == 3
            assert all(s['scenarios'] == 9 and s['fontLoaded'] for s in run['samples'])
for exit_file in out.glob('*-exit.json'):
    assert read(exit_file)['status'] == 0, str(exit_file)
browser = read(out / 'browser.json')
assert browser['ownerContracts']['checks'] == 12
assert browser['contracts']['passed'] == 9
assert len(browser['retention']) == 6
for context in browser['retention']:
    for phase in ['afterChurn', 'afterUpdatesAndClear']:
        assert context['before']['dom'] == context[phase]['dom'], context
result = dict(passed=True, frozenSourceFiles=len(initial['files']),
              reusedUnitSourceHashesMatched=True,
              runnerFrozenFiles=len(runner['frozen']), packageInventories=counts,
              sharedCommit='7f4df5c', sharedHashes=shared_hashes,
              browser=initial['browser'], appBundlesAndHTML=True,
              completedRuns=5, nativeOwnerChecks=12, nativeAppChecks=9,
              retentionContexts=6, retentionDOMAndListenersRestored=True)
(out / 'integrity.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({k: v for k, v in result.items() if k not in ['sharedHashes', 'browser']}))

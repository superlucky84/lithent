// Keep raw timing samples and compact, inspectable CPU/allocation evidence.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const [profileDir, diagnosticDir, allocationDir, officialDir, out, reverseDir] =
  process.argv.slice(2);
if (!out)
  throw Error(
    'Expected profile, diagnostic, allocation, official and output directories'
  );
mkdirSync(out, { recursive: true });
const json = file => JSON.parse(readFileSync(file));
const hash = value => createHash('sha256').update(value).digest('hex');
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const baselineName = readdirSync(profileDir).includes(
  'beforeAddType-profile.js'
)
  ? 'beforeAddType'
  : 'base';
const candidateName = baselineName === 'base' ? 'addType' : 'base';
const diagnosticNames = [baselineName, candidateName, 'addLeaf'];
const diagnostic = json(
  diagnosticDir + '/measure-' + diagnosticNames.join('-') + '.json'
);
const allocation = json(allocationDir + '/allocations.json');
const official = json(officialDir + '/production-cpu.json');
if (!official.finishedAt) throw Error('Official measurement is incomplete');
const reverse = reverseDir
  ? json(reverseDir + '/production-cpu.json')
  : undefined;
if (
  reverse &&
  (!reverse.finishedAt ||
    JSON.stringify(reverse.build) !== JSON.stringify(official.build))
)
  throw Error('Reverse measurement is incomplete or uses different builds');
const profiles = Object.fromEntries(
  readdirSync(profileDir + '/profiles')
    .filter(file => file.endsWith('.cpuprofile'))
    .map(file => [file, json(profileDir + '/profiles/' + file)])
);
const cpu = [];
for (const scenario of ['create', 'create10k']) {
  const selected = Object.entries(profiles).filter(([name]) =>
    name.startsWith(baselineName + '-' + scenario + '-')
  );
  const self = {},
    inclusive = {};
  for (const [, profile] of selected) {
    const byId = new Map(profile.nodes.map(node => [node.id, node]));
    const parents = new Map(
      profile.nodes.flatMap(node =>
        (node.children || []).map(id => [id, node.id])
      )
    );
    const key = node =>
      (node.callFrame.functionName || '(anonymous)') +
      ':' +
      (node.callFrame.url.endsWith('main.js')
        ? node.callFrame.lineNumber + 1
        : 'external');
    profile.samples.forEach((id, index) => {
      const ms = profile.timeDeltas[index] / 1000 / selected.length;
      self[key(byId.get(id))] = (self[key(byId.get(id))] || 0) + ms;
      const seen = new Set();
      for (
        let cursor = id;
        cursor !== undefined;
        cursor = parents.get(cursor)
      ) {
        const frame = key(byId.get(cursor));
        if (!seen.has(frame)) inclusive[frame] = (inclusive[frame] || 0) + ms;
        seen.add(frame);
      }
    });
  }
  const activeSelf = Object.entries(self).filter(
    ([key]) => !/^\((idle|program|root)\)/.test(key)
  );
  cpu.push({
    scenario,
    profiles: selected.length,
    activeSampledMsPerRun: activeSelf.reduce((sum, [, ms]) => sum + ms, 0),
    self: activeSelf.sort((a, b) => b[1] - a[1]),
    inclusive: Object.entries(inclusive)
      .filter(([key]) =>
        /^(h|makeRow|buildData|makeNewWDomTree|wDomToDom):/.test(key)
      )
      .sort((a, b) => b[1] - a[1]),
  });
}
const diagnosticSummary = [];
for (const scenario of ['create', 'create10k', 'replace']) {
  for (const name of diagnosticNames) {
    const times = diagnostic.rounds
      .filter(item => item.scenario === scenario && item.name === name)
      .flatMap(item => item.times);
    diagnosticSummary.push({
      name,
      scenario,
      count: times.length,
      median: median(times),
    });
  }
}
const officialSummary = official.samples.map(sample => ({
  name: sample.name,
  id: sample.id,
  count: sample.result.length,
  ...Object.fromEntries(
    ['total', 'script', 'paint'].map(key => [
      key,
      median(sample.result.map(value => value[key])),
    ])
  ),
}));
const pooledCreate = ['lithent-before', 'lithent'].map(name => {
  const samples = [official, reverse]
    .filter(Boolean)
    .flatMap(run =>
      run.samples
        .filter(sample => sample.name === name && sample.id === '01_run1k')
        .flatMap(sample => sample.result)
    );
  return {
    name,
    count: samples.length,
    ...Object.fromEntries(
      ['total', 'script', 'paint'].map(key => [
        key,
        median(samples.map(value => value[key])),
      ])
    ),
  };
});
const evidence = {
  cpuProfiles: profiles,
  heapProfiles: Object.fromEntries(
    readdirSync(allocationDir)
      .filter(file => file.endsWith('.heapprofile'))
      .map(file => [file, json(allocationDir + '/' + file)])
  ),
  namedProfileBundle: readFileSync(
    profileDir + '/' + baselineName + '-profile.js',
    'utf8'
  ),
  diagnosticBundles: Object.fromEntries(
    diagnosticNames.map(name => [
      name,
      readFileSync(diagnosticDir + '/' + name + '.js', 'utf8'),
    ])
  ),
  productionInputs: Object.fromEntries(
    ['lithent-before', 'lithent'].map(name => [
      name,
      Object.fromEntries(
        ['src/main.tsx', 'index.html', 'lithent.mjs', 'helper.mjs'].map(
          file => [
            file,
            readFileSync(officialDir + '/sources/' + name + '/' + file, 'utf8'),
          ]
        )
      ),
    ])
  ),
};
const archive = gzipSync(JSON.stringify(evidence));
writeFileSync(out + '/creation-evidence.json.gz', archive);
const result = {
  date: new Date().toISOString(),
  evidenceSHA256: hash(archive),
  diagnosticBundleSHA256: Object.fromEntries(
    Object.entries(evidence.diagnosticBundles).map(([name, code]) => [
      name,
      hash(code),
    ])
  ),
  baselineName,
  candidateName,
  profile: json(profileDir + '/profile-' + baselineName + '.json'),
  cpu,
  diagnosticSummary,
  diagnostic,
  allocation,
  officialSummary,
  pooledCreate,
  official,
  reverse,
  verification: json(officialDir + '/production-verify.json'),
};
writeFileSync(out + '/creation-results.json', JSON.stringify(result, null, 2));
console.log(
  JSON.stringify(
    {
      cpu: cpu.map(item => ({ ...item, self: item.self.slice(0, 8) })),
      diagnosticSummary,
      officialSummary,
      pooledCreate,
    },
    null,
    2
  )
);

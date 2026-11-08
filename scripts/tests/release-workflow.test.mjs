import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { parsers } from 'prettier/plugins/yaml';

// Reuse the pinned, declared formatter's YAML parser. Keep GitHub's "on" key
// as a string and fail on unsupported AST structures rather than misreading it.
async function workflow(name) {
  const ast = await parsers.yaml.parse(
    await readFile(
      new URL(`../../.github/workflows/${name}`, import.meta.url),
      'utf8'
    )
  );
  function value(node) {
    if (!node) return null;
    if (typeof node.value === 'string') return node.value;
    if (node.type === 'document')
      return value(node.children.find(child => child.type === 'documentBody'));
    if (['mapping', 'flowMapping'].includes(node.type))
      return Object.fromEntries(
        node.children.map(item => item.children.map(value))
      );
    if (['sequence', 'flowSequence'].includes(node.type))
      return node.children.map(value);
    assert(
      node.children.length <= 1,
      `Unsupported YAML structure: ${node.type}`
    );
    return value(node.children[0]);
  }
  return value(ast);
}
const evaluate = (expression, context) =>
  Boolean(
    runInNewContext(expression.replace(/^\$\{\{\s*|\s*\}\}$/g, ''), {
      ...context,
      always: () => true,
    })
  );
function context() {
  return {
    github: {
      repository: 'superlucky84/lithent',
      ref: 'refs/heads/main',
      event_name: 'workflow_dispatch',
    },
    vars: { NPM_PUBLISH_ENABLED: 'true' },
    needs: {
      quality: { result: 'success' },
      browser: { result: 'success' },
      gate: { result: 'success' },
      publish: {
        result: 'failure',
        outputs: { receipt_artifact: 'publication-receipt' },
      },
    },
  };
}

test('actual workflow permits publishing only from a manual main run after every validation and preserves partial-failure recording', async () => {
  const config = await workflow('ci.yml');
  assert.deepEqual(config.on.push.branches, ['main']);
  assert(Object.hasOwn(config.on, 'workflow_dispatch'));
  assert.deepEqual(config.jobs.browser.strategy.matrix.browser, [
    'chromium',
    'firefox',
    'webkit',
  ]);
  assert.equal(config.jobs.gate.name, 'CI');
  assert.deepEqual(config.jobs.gate.needs, ['quality', 'browser']);
  assert.deepEqual(config.jobs.publish.needs, ['quality', 'browser', 'gate']);
  assert(evaluate(config.jobs.publish.if, context()));
  for (const mutate of [
    c => {
      c.github.event_name = 'push';
    },
    c => {
      c.github.event_name = 'pull_request';
    },
    c => {
      c.github.repository = 'fork/lithent';
    },
    c => {
      c.github.ref = 'refs/heads/feature';
    },
    c => {
      c.github.ref = 'refs/tags/lithent@1.25.6';
    },
    c => {
      c.vars.NPM_PUBLISH_ENABLED = '';
    },
    ...['quality', 'browser', 'gate'].flatMap(job =>
      ['failure', 'skipped', 'cancelled'].map(result => c => {
        c.needs[job].result = result;
      })
    ),
  ]) {
    const c = context();
    mutate(c);
    assert.equal(evaluate(config.jobs.publish.if, c), false);
  }
  const mainPush = context();
  mainPush.github.event_name = 'push';
  for (const c of [context(), mainPush])
    assert.equal(evaluate(config.concurrency['cancel-in-progress'], c), false);
  const pr = context();
  pr.github.event_name = 'pull_request';
  assert.equal(evaluate(config.concurrency['cancel-in-progress'], pr), true);
  assert.equal(config.jobs.publish.concurrency['cancel-in-progress'], 'false');
  assert(
    evaluate(config.jobs['release-records'].if, context()),
    'Failed publisher with a durable receipt must still record confirmed successes'
  );
  const missing = context();
  missing.needs.publish.outputs.receipt_artifact = '';
  assert.equal(evaluate(config.jobs['release-records'].if, missing), false);
  assert.equal(
    evaluate(config.jobs['release-records'].if, mainPush),
    false,
    'A main merge validates only; tags and docs follow a manual release run'
  );
});

test('workflow wiring keeps original-attempt artifacts and restricts privilege to the two release jobs', async () => {
  const config = await workflow('ci.yml');
  assert.deepEqual(config.permissions, { contents: 'read' });
  assert.deepEqual(config.jobs.publish.permissions, {
    contents: 'read',
    'id-token': 'write',
  });
  assert.deepEqual(config.jobs['release-records'].permissions, {
    contents: 'write',
    actions: 'write',
  });
  assert.equal(
    config.jobs.quality.outputs.build_artifact,
    '${{ steps.bundle.outputs.artifact }}'
  );
  for (const name of ['browser', 'publish', 'release-records']) {
    const job = config.jobs[name];
    const download = job.steps.find(
      step => step.uses === 'actions/download-artifact@v4'
    );
    assert.equal(
      download.with.name,
      '${{ needs.quality.outputs.build_artifact }}'
    );
    if (name !== 'browser') {
      assert.equal(job.environment, 'npm');
      assert(
        job.steps.some(
          step => step.run === 'pnpm install --frozen-lockfile --ignore-scripts'
        )
      );
      assert.equal(job.env.GH_TOKEN, undefined);
    }
  }
  for (const name of ['quality', 'browser', 'gate'])
    assert.equal(config.jobs[name].permissions, undefined);
  const receipts = config.jobs['release-records'].steps.find(
    step => step.with?.pattern
  );
  assert.equal(
    receipts.with.pattern,
    'release-results-${{ github.run_id }}-*-${{ github.sha }}'
  );
  assert.equal(receipts.with['merge-multiple'], 'false');
  const docs = await workflow('docs.yml');
  assert.equal(docs.on.workflow_dispatch.inputs.release_sha.type, 'string');
  assert(
    docs.jobs.deploy.steps.some(
      step =>
        step.env?.RELEASE_SHA === '${{ inputs.release_sha }}' &&
        step.run.includes('"$RELEASE_SHA" != "$GITHUB_SHA"')
    )
  );
});

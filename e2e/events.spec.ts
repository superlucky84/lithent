import { test, expect, ready } from './test';

for (const mode of ['alias', 'nested']) {
  test(`events: trusted ${mode} update preserves the existing callback`, async ({
    page,
  }, info) => {
    await ready(
      page,
      `/e2e/fixtures/events.html?mode=${mode}`,
      info.project.name
    );
    await page.locator('event-edge').click();
    const first = await page.evaluate(() => ({
      calls: window.eventProbe.calls.splice(0),
      trusted: window.eventProbe.trusted,
    }));
    expect(first.trusted).toEqual([true]);
    expect(first.calls.filter(call => call === 'a')).toHaveLength(
      mode === 'nested' ? 2 : 1
    );
    if (mode === 'alias') expect(first.calls).toEqual(['a']);
    await page.locator('event-edge').click();
    expect(await page.evaluate(() => window.eventProbe.calls)).toEqual([
      'a',
      'b',
    ]);
  });
}

for (const mode of ['replace', 'ancestor']) {
  test(`events: ${mode} proxy reads the latest handler during trusted dispatch`, async ({
    page,
  }, info) => {
    await ready(
      page,
      `/e2e/fixtures/events.html?mode=${mode}`,
      info.project.name
    );
    await page.locator('event-edge').click();
    expect(
      await page.evaluate(() => ({
        calls: window.eventProbe.calls,
        trusted: window.eventProbe.trusted,
      }))
    ).toEqual({ calls: ['latest'], trusted: [true] });
  });
}

test('events: a thrown callback preserves the next listener and following dispatch', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/events.html?mode=error', info.project.name);
  await page.locator('event-edge').click();
  await page.locator('event-edge').click();
  expect(
    await page.evaluate(() => ({
      calls: window.eventProbe.calls,
      errors: window.eventProbe.errors,
    }))
  ).toEqual({
    calls: ['throws', 'b', 'throws', 'b'],
    errors: ['event-probe-error', 'event-probe-error'],
  });
});

test('events: ref and mountCallback preserve native identity, capture, dedup and cleanup', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/events.html?mode=native', info.project.name);
  await page.getByRole('button').click();
  expect(
    await page.evaluate(() => ({
      calls: window.eventProbe.calls,
      trusted: window.eventProbe.trusted,
      receivers: window.eventProbe.receivers,
    }))
  ).toEqual({ calls: ['native'], trusted: [true], receivers: [true] });
  await page.evaluate(() => window.eventProbe.removeNative());
  await page.getByRole('button').click();
  expect(await page.evaluate(() => window.eventProbe.calls)).toEqual([
    'native',
  ]);
  await page.evaluate(() => window.eventProbe.addNative());
  await page.getByRole('button').click();
  await page.evaluate(() => {
    window.eventProbe.dispose();
    window.eventProbe.retainedClick();
  });
  expect(await page.evaluate(() => window.eventProbe.calls)).toEqual([
    'native',
    'native',
  ]);
  await expect(page.locator('#app')).toBeEmpty();
});

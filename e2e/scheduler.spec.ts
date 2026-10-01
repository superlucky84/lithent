import { test, expect, ready } from './test';

test.beforeEach(async ({ page }, info) => {
  expect(info.project.name).toBe('concurrent');
  await ready(page, '/e2e/fixtures/scheduler.html', info.project.name);
  await expect(page.locator('#list li')).toHaveCount(1000);
});

test('B-4/B-9: urgent commits first; nextTick and whenIdle observe different DOM', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'priority', exact: true }).click();
  await expect(page.locator('#result')).toContainText('afterIdle');
  const result = JSON.parse(await page.locator('#result').innerText());
  expect(result.before).toBe('initial:0');
  expect(result.afterNextTick).toBe('initial:0');
  expect(result.urgentAtNextTick).toBe('1');
  expect(result.afterIdle).toBe('omega:0');
  expect(result.log).toEqual(['urgent', 'deferred']);
});

test('B-2/B-3/B-5: old DOM, pending lifetime, queued updates converge to one commit', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'batch', exact: true }).click();
  await expect(page.locator('#result')).toContainText('afterIdle');
  const result = JSON.parse(await page.locator('#result').innerText());
  expect(result.queued).toBe(true);
  expect(result.afterNextTick).toBe(result.before);
  expect(result.rows).toBe(1000);
  expect(result.afterIdle).toBe('omega:0');
  expect(result.pendingAfter).toBe(false);
  expect(result.commits).toEqual(['omega:0']);
});

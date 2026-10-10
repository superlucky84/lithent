import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { EditorMetrics } from '../demo/metrics';

type Host = 'plain' | 'element';
const metrics = (page: Page, host: Host): Promise<EditorMetrics> =>
  page.evaluate(name => window.lifecycleDemo.snapshot()[name], host);
const errors: string[] = [];
test.beforeEach(async ({ page }, info) => {
  errors.length = 0;
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute(
    'data-core',
    info.project.name
  );
  await expect.poll(async () => (await metrics(page, 'plain')).timers).toBe(1);
  await expect
    .poll(async () => (await metrics(page, 'element')).timers)
    .toBe(1);
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

for (const host of ['plain', 'element'] as const) {
  const selector = host === 'plain' ? '#plain-root' : '#element-widget';
  test.describe(`${host} host`, () => {
    test('keeps draft, undo history and the same DOM across hiding', async ({
      page,
    }) => {
      const root = page.locator(selector);
      const draft = root.locator('.draft');
      await draft.fill('alpha');
      await draft.fill('beta');
      await draft.evaluate(element => {
        (element as HTMLElement).dataset.kept = 'yes';
      });
      await page.locator(`#${host}-toggle`).click();
      await expect.poll(async () => (await metrics(page, host)).timers).toBe(0);
      await expect(draft).toBeHidden();
      await page.locator(`#${host}-toggle`).click();
      await expect(draft).toBeVisible();
      await expect(draft).toHaveValue('beta');
      await expect(draft).toHaveAttribute('data-kept', 'yes');
      await root.locator('.undo').click();
      await expect(draft).toHaveValue('alpha');
      expect((await metrics(page, host)).created).toBe(1);
    });

    test('ignores a late search even when its transport ignores abort', async ({
      page,
    }) => {
      const root = page.locator(selector);
      await root.locator('.search-a').click();
      await root.locator('.search-b').click();
      await expect(root.locator('.result')).toHaveText('검색 결과 B');
      await expect
        .poll(async () => (await metrics(page, host)).searchesFinished)
        .toBe(2);
      await expect(root.locator('.result')).toHaveText('검색 결과 B');
      await expect(root.locator('.pending')).toHaveText('검색 대기');
      const state = await metrics(page, host);
      expect(state.searchesAborted).toBe(1);
      expect(state.searchesCommitted).toBe(1);
    });

    test('expires the previous activity and resets pending on reopening', async ({
      page,
    }) => {
      const root = page.locator(selector);
      await root.locator('.search-a').click();
      await expect(root.locator('.pending')).toHaveText('검색 중');
      await page.locator(`#${host}-toggle`).click();
      await expect.poll(async () => (await metrics(page, host)).timers).toBe(0);
      expect((await metrics(page, host)).searchesAborted).toBe(1);
      await page.locator(`#${host}-toggle`).click();
      await expect(root.locator('.pending')).toHaveText('검색 대기');
      await root.locator('.search-b').click();
      await expect
        .poll(async () => (await metrics(page, host)).searchesFinished)
        .toBe(2);
      await expect(root.locator('.result')).toHaveText('검색 결과 B');
      expect((await metrics(page, host)).searchesCommitted).toBe(1);
    });

    test('finishes saving while hidden without drawing or restarting the save', async ({
      page,
    }) => {
      const root = page.locator(selector);
      await root.locator('.draft').fill('saved draft');
      await root.locator('.save').click();
      await expect(root.locator('.saved')).toHaveText('저장 중');
      await page.locator(`#${host}-toggle`).click();
      await expect.poll(async () => (await metrics(page, host)).timers).toBe(0);
      const before = await metrics(page, host);
      await expect
        .poll(async () => (await metrics(page, host)).savesCommitted)
        .toBe(1);
      await expect(root.locator('.saved')).toHaveText('저장 중');
      expect((await metrics(page, host)).draws).toBe(before.draws);
      await page.locator(`#${host}-toggle`).click();
      await expect(root.locator('.saved')).toHaveText('저장됨: saved draft');
      const after = await metrics(page, host);
      expect(after.savesStarted).toBe(1);
      expect(after.savesAborted).toBe(0);
    });

    test('stops polling and subscriptions, catches up on reactivation without duplicates', async ({
      page,
    }) => {
      const root = page.locator(selector);
      await page.evaluate(() => window.lifecycleDemo.emit('before hide'));
      await expect(root.locator('.external')).toHaveText('before hide');
      for (let repeat = 0; repeat < 3; repeat++) {
        await page.locator(`#${host}-toggle`).click();
        await expect
          .poll(async () => (await metrics(page, host)).timers)
          .toBe(0);
        const before = await metrics(page, host);
        await page.evaluate(() => window.lifecycleDemo.emit('while hidden'));
        // Observe a complete 250 ms polling interval while inactive.
        await page.waitForTimeout(350);
        const inactive = await metrics(page, host);
        expect(inactive.ticks).toBe(before.ticks);
        expect(inactive.draws).toBe(before.draws);
        expect(inactive.externalEvents).toBe(before.externalEvents);
        expect(inactive.subscriptions).toBe(0);
        await page.locator(`#${host}-toggle`).click();
        await expect(root.locator('.external')).toHaveText('while hidden');
        const active = await metrics(page, host);
        expect(active.timers).toBe(1);
        expect(active.subscriptions).toBe(1);
        expect(active.created).toBe(1);
      }
    });

    test('permanent removal cancels work and late completion cannot revive DOM', async ({
      page,
    }) => {
      const root = page.locator(selector);
      await root.locator('.search-a').click();
      await root.locator('.save').click();
      await page.locator(`#${host}-remove`).click();
      await expect.poll(async () => (await metrics(page, host)).live).toBe(0);
      const removed = await metrics(page, host);
      expect(removed.timers).toBe(0);
      expect(removed.subscriptions).toBe(0);
      expect(removed.searchesAborted).toBe(1);
      expect(removed.savesAborted).toBe(1);
      await expect
        .poll(async () => (await metrics(page, host)).searchesFinished)
        .toBe(1);
      await expect(root.locator('.draft')).toHaveCount(0);
      const after = await metrics(page, host);
      expect(after.searchesCommitted).toBe(0);
      expect(after.savesCommitted).toBe(0);
      expect(after.draws).toBe(removed.draws);
    });
  });
}

test('Custom Element keeps the same view across a same-task DOM move', async ({
  page,
}) => {
  const draft = page.locator('#element-widget .draft');
  await draft.fill('moved draft');
  await draft.evaluate(element => {
    (element as HTMLElement).dataset.kept = 'yes';
  });
  await page.locator('#element-move').click();
  await expect(
    page.locator('#element-slot-b #element-widget .draft')
  ).toHaveValue('moved draft');
  await expect(draft).toHaveAttribute('data-kept', 'yes');
  const state = await metrics(page, 'element');
  expect(state.created).toBe(1);
  expect(state.activations).toBe(1);
  expect(state.timers).toBe(1);
  await page.locator('#element-move').click();
  await expect(
    page.locator('#element-slot-a #element-widget .draft')
  ).toHaveValue('moved draft');
});

test('active properties and attributes hide in place; reconnect after removal starts fresh', async ({
  page,
}) => {
  const draft = page.locator('#element-widget .draft');
  await draft.fill('old draft');
  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement & { active: boolean }>(
      '#element-widget'
    )!;
    element.active = false;
  });
  await expect(draft).toBeHidden();
  expect((await metrics(page, 'element')).timers).toBe(0);
  await page.evaluate(() =>
    document.querySelector('#element-widget')!.setAttribute('active', '')
  );
  await expect(draft).toBeVisible();
  await expect(draft).toHaveValue('old draft');
  await page.locator('#element-remove').click();
  await expect.poll(async () => (await metrics(page, 'element')).live).toBe(0);
  await page.locator('#element-connect').click();
  await expect(draft).toBeVisible();
  await expect(draft).toHaveValue('');
  const state = await metrics(page, 'element');
  expect(state.created).toBe(2);
  expect(state.live).toBe(1);
  expect(state.timers).toBe(1);
});

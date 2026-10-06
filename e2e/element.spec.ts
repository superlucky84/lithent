import { test, expect } from './test';

// lithent/element DESIGN §10 R-1: a widget bundle and a host app bundle on
// the same page. Base project: two copies of the base core. Concurrent
// project: base host + concurrent widget.
test('R-1: two lithent copies on one page render and update independently', async ({
  page,
}, info) => {
  await page.goto(
    `/e2e/fixtures/element-dual.html?second=${info.project.name}`
  );
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');

  const cores = await page.evaluate(() => {
    const w = window as unknown as Record<string, Record<string, unknown>>;
    return {
      distinct: w.hostCore !== w.widgetCore,
      widgetConcurrent: 'deferRender' in w.widgetCore,
    };
  });
  expect(cores.distinct).toBe(true);
  expect(cores.widgetConcurrent).toBe(info.project.name === 'concurrent');

  const hostItems = page.locator('#host > .app > ul > .item');
  const widgetItems = page.locator('#widget-slot .item');
  const hostButton = page.locator('#host > .app > .inc');
  const widgetButton = page.locator('#widget-slot .inc');

  await expect(hostItems).toHaveText(['host:1', 'host:2', 'host:3']);
  await expect(widgetItems).toHaveText(['widget:1', 'widget:2', 'widget:3']);

  // Tag a widget node so we can tell whether host re-renders replace it.
  await page
    .locator('#widget-slot .item')
    .first()
    .evaluate(el => {
      (el as HTMLElement).dataset.mark = 'kept';
    });

  await hostButton.click();
  await expect(hostButton).toHaveText('host 1');
  await expect(hostItems).toHaveText(['host:3', 'host:2', 'host:1', 'host:4']);
  await expect(widgetItems).toHaveText(['widget:1', 'widget:2', 'widget:3']);
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveCount(1);

  await widgetButton.click();
  await widgetButton.click();
  await expect(widgetButton).toHaveText('widget 2');
  await expect(widgetItems).toHaveText([
    'widget:4',
    'widget:1',
    'widget:2',
    'widget:3',
    'widget:5',
  ]);
  // Keyed moves keep the tagged node rather than recreating it.
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveText(
    'widget:1'
  );
  await expect(hostItems).toHaveText(['host:3', 'host:2', 'host:1', 'host:4']);

  await hostButton.click();
  await expect(hostButton).toHaveText('host 2');
  await expect(widgetButton).toHaveText('widget 2');
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveCount(1);
});

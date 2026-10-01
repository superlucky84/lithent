import { test, expect, ready } from './test';

for (const mode of ['jsx', 'jsxDEV']) {
  test(`${mode}/jsxs: dynamic keyed arrays preserve state and DOM among static siblings`, async ({
    page,
  }, info) => {
    await ready(page, `/e2e/fixtures/jsx.html?mode=${mode}`, info.project.name);
    await expect(page.locator('li')).toHaveCount(3);
    await page.getByRole('button', { name: 'row 1', exact: true }).click();
    await expect(page.locator('[data-id="1"] output')).toHaveText('1');
    const original = await page.locator('[data-id="1"]').elementHandle();
    await page.getByRole('button', { name: 'reorder', exact: true }).click();
    await expect(page.locator('li button')).toHaveText([
      'row 3',
      'row 1',
      'row 4',
    ]);
    await expect(page.locator('[data-id="1"] output')).toHaveText('1');
    expect(
      await original!.evaluate(
        node => node === document.querySelector('[data-id="1"]')
      )
    ).toBe(true);
    await expect(page.getByRole('heading')).toHaveText('static heading');
    await expect(page.locator('footer')).toHaveText('static tail');
  });
}

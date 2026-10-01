import { test, expect, ready } from './test';

test('release docs: bilingual concurrent guides, real demo and related API navigation', async ({
  page,
}, info) => {
  const origin = `http://127.0.0.1:${info.project.name === 'concurrent' ? 43135 : 43134}`;
  await ready(
    page,
    `${origin}/lithent/#/guide/concurrent-rendering`,
    info.project.name
  );
  const main = page.locator('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Concurrent Rendering'
  );
  const demo = main.locator('[data-concurrent-demo]');
  await expect(demo).toHaveAttribute('data-runtime', 'concurrent');
  await expect(demo.locator('li')).toHaveCount(300);
  await demo.getByRole('textbox').fill('release');
  await expect(demo.locator('[data-demo-query]')).toHaveText('release');
  await expect(demo.locator('[data-demo-idle]')).toHaveText('release:0');
  await expect(demo.locator('[data-demo-tick]')).toHaveText('initial:0');
  await expect(demo.locator('[data-demo-status]')).toHaveText('idle');
  await expect(demo.locator('li').first()).toHaveText('release:0');

  await page.getByRole('button', { name: 'KO', exact: true }).click();
  await expect(page).toHaveURL(/#\/ko\/guide\/concurrent-rendering$/);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Concurrent 렌더링'
  );
  await expect(demo.locator('li').first()).toHaveText('initial:0');
  await demo.getByRole('textbox').fill('문서');
  await expect(demo.locator('[data-demo-idle]')).toHaveText('문서:0');

  // Navigate away while low-priority work may still be queued; cleanup must
  // prevent late renders from touching the detached demo host.
  await demo.getByRole('textbox').fill('leave');
  await main
    .getByRole('link', { name: '미룬 상태 헬퍼 →', exact: true })
    .click();
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    '미룬 상태 헬퍼'
  );
  await expect(demo).toHaveCount(0);
  await expect(main).toContainText('hasPendingRender');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Deferred State Helpers'
  );
  await page
    .locator('aside nav')
    .getByRole('link', { name: 'Rendering & Scheduling', exact: true })
    .click();
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Concurrent Rendering'
  );

  for (const language of ['', '/ko']) {
    for (const [route, heading, contract] of [
      ['next-tick', 'nextTick', 'whenIdle'],
      ['mount-hooks', 'Mount Hooks', 'mountCallback'],
      ['update-hooks', 'Update Hooks', 'updateCallback'],
      ['jsx-manual', 'Manual JSX Setup', '1.22.1'],
    ]) {
      await page.evaluate(hash => {
        location.hash = hash;
      }, `${language}/guide/${route}`);
      await expect(main.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(main.locator('aside')).toContainText(contract);
      const noteLink = main.locator('aside').getByRole('link');
      await noteLink.click();
      await expect(page).toHaveURL(
        new RegExp(`#${language}/guide/concurrent-rendering$`)
      );
      await expect(demo).toHaveAttribute('data-runtime', 'concurrent');
    }
  }
});

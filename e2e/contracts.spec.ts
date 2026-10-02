import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect, ready } from './test';

test('consumer: exact checks, correct core, live store/context/portal', async ({
  page,
}, info) => {
  const concurrent = info.project.name === 'concurrent';
  await ready(
    page,
    '/lithentConcurrent/consumer/index.html',
    info.project.name
  );
  await expect(page.locator('#checks table tr')).toHaveCount(
    concurrent ? 13 : 10
  );
  await expect(page.locator('#checks .bad')).toHaveCount(0);
  await expect(
    page.locator('#checks tr').filter({ hasText: '❌' })
  ).toHaveCount(0);
  await expect(page.locator('#checks')).toContainText(
    concurrent ? 'lithent-concurrent (deferRender 있음)' : 'lithent (기본)'
  );
  await expect(page.locator('.rows li')).toHaveCount(2000);
  await page.getByRole('button', { name: 'store +1' }).click();
  await expect(page.locator('.badge')).toHaveText('2');
  await page.getByRole('button', { name: 'theme', exact: true }).click();
  await expect(page.locator('.theme')).toHaveText('light');
  await page.getByPlaceholder('타이핑').fill('e2e');
  await expect(page.locator('.rows li').first()).toContainText('e2e');
  await expect(page.locator('#toast-host')).toHaveText('portal ok');
});

test('C/F: all twelve named lifecycle and tearing checks run', async ({
  page,
}, info) => {
  await ready(
    page,
    '/lithentConcurrent/html/lifecycle.html',
    info.project.name
  );
  const rows = page.locator('#checks table tr');
  await expect(rows).toHaveCount(12);
  await expect(page.locator('#checks .bad')).toHaveCount(0);
  await expect(rows.filter({ hasText: '❌' })).toHaveCount(0);
  for (const id of [
    'C-1',
    'C-2',
    'C-3',
    'C-4',
    'C-5',
    'C-6',
    'F-1',
    'F-2',
    'F-3',
  ])
    await expect(page.locator('#checks')).toContainText(id);
  await expect(page.locator('#checks')).toContainText('A:1, B:2');
  await expect(page.locator('#checks')).toContainText('A:2, B:2');
  await page.locator('#run').click();
  await expect(rows).toHaveCount(12);
  await expect(page.locator('#checks .bad')).toHaveCount(0);
});

test('A-6/B-6: context and lcontext find Providers; deferred portal stays in its host', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/integration.html', info.project.name);
  await expect(page.locator('#context')).toHaveText('outer');
  await expect(page.locator('#lcontext')).toHaveText('light');
  await expect(page.locator('#portal-host #portal-content')).toHaveText(
    'portal initial'
  );
  await page.getByRole('button').click();
  await expect(page.locator('#context')).toHaveText('updated');
  await expect(page.locator('#lcontext')).toHaveText('light updated');
  await expect(page.locator('#portal-host #portal-content')).toHaveText(
    'portal deferred'
  );
  await expect(page.locator('#app #portal-content')).toHaveCount(0);
});

test('D-1/2/3: server markup is hydrated in place; events and keyed deferred updates work', async ({
  page,
  request,
}, info) => {
  const response = await request.get('/e2e/hydration.html');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('row 1');
  expect(html).toContain('>server</button>');
  await ready(page, '/e2e/hydration.html', info.project.name);
  await expect(page.locator('#app')).toHaveAttribute('data-reused', 'true');
  await page.evaluate(() => {
    (window as unknown as { savedRows: Element[] }).savedRows = [
      ...document.querySelectorAll('li'),
    ];
  });
  await page.locator('#value').click();
  await expect(page.locator('#value')).toHaveText('client');
  expect(
    await page.evaluate(() => {
      const saved = (window as unknown as { savedRows: Element[] }).savedRows;
      return [...document.querySelectorAll('li')].every(
        (node, index) => node === saved[index]
      );
    })
  ).toBe(true);
  await page.locator('[data-id="1"] button').click();
  await expect(page.locator('[data-id="1"] output')).toHaveText('1');
  await page.getByRole('button', { name: 'add', exact: true }).click();
  await expect(page.locator('.row-label')).toHaveText([
    'row 4',
    'row 1',
    'row 2',
    'row 3',
  ]);
  await page.getByRole('button', { name: 'remove', exact: true }).click();
  await expect(page.locator('.row-label')).toHaveText([
    'row 4',
    'row 1',
    'row 3',
  ]);
  await page.getByRole('button', { name: 'reverse', exact: true }).click();
  await expect(page.locator('.row-label')).toHaveText([
    'row 3',
    'row 1',
    'row 4',
  ]);
  await expect(page.locator('[data-id="1"] output')).toHaveText('1');
  await expect(page.locator('[data-id="4"] output')).toHaveText('0');
  expect(
    await page.evaluate(() => {
      const saved = (window as unknown as { savedRows: Element[] }).savedRows;
      return document.querySelector('[data-id="1"]') === saved[0];
    })
  ).toBe(true);
});

test('D-4: real Vite HMR replaces the boundary without a page reload', async ({
  page,
}, info) => {
  const core = info.project.name;
  await ready(page, `/.e2e-work/${core}/index.html`, core);
  await expect(page.getByRole('heading')).toHaveText('original counter');
  await page.getByRole('button').click();
  await expect(page.locator('output')).toHaveText('1');
  const token = await page.evaluate(() => {
    const value = crypto.randomUUID();
    (window as unknown as { reloadToken: string }).reloadToken = value;
    return value;
  });
  const file = resolve('.e2e-work', core, 'Counter.tsx');
  const original = await readFile(file, 'utf8');
  try {
    await writeFile(
      file,
      original.replace('original counter', 'updated counter')
    );
    await expect(page.getByRole('heading')).toHaveText('updated counter');
    expect(
      await page.evaluate(
        () => (window as unknown as { reloadToken: string }).reloadToken
      )
    ).toBe(token);
    // Boundary replacement remounts the component; closure state starts afresh.
    await expect(page.locator('output')).toHaveText('0');
    await page.getByRole('button').click();
    await expect(page.locator('output')).toHaveText('1');
  } finally {
    await writeFile(file, original);
  }
});

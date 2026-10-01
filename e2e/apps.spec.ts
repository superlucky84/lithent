import { test, expect, ready } from './test';

const titles = [
  [
    'Calculating banana smoothie calories with computed',
    'computed로 바나나 칼로리 계산',
  ],
  ['Store helper – sharing state across components', 'Store Helper'],
  ['Render Props (Mouse tracker)'],
  ['Effect helper', 'Effect Helper'],
  ['Nested Fragments (Notification Center)'],
  ['Key-based List Updates (Playlist Manager)'],
  ['innerHTML Property (Markdown Editor)'],
  ['Select Controls (Character Creator)'],
  ['Input Controls (Business Card Generator)'],
  ['Checkbox & Radio Controls (Pizza Builder)'],
  [
    'Context Helper (Theme & User Panel)',
    'Context Helper (테마 & 사용자 패널)',
  ],
  ['Mixed DOM Elements (Social Media Timeline)'],
  ['Mixed DOM with Loop (Restaurant Waitlist)'],
  ['Nested Component Unmount Callbacks'],
  ['Nested Props Update (Volume Controller)'],
  ['insertBefore + Loop + Destroy (Music Library Manager)'],
  ['SVG Rendering (Traffic Light)'],
  ['CacheUpdate (Product Filter Dashboard)'],
  ['Smart Todo List with FTags (CDN Ready)'],
  ['Image Gallery Lightbox', '이미지 갤러리 라이트박스'],
  [
    'Example 21: Quick Notes with HTM Tags (CDN Ready)',
    'Example 21: HTM Tags로 만드는 빠른 메모 (CDN 지원)',
  ],
];

test('B-7: examples JSX, HTM, MDX, shared store and complex app interactions', async ({
  page,
}, info) => {
  const origin = `http://127.0.0.1:${info.project.name === 'concurrent' ? 43133 : 43132}`;
  await ready(page, `${origin}/html/htmExample.html`, info.project.name);
  await expect(page.locator('#root li')).toHaveText('count: 0');
  await page.getByRole('button', { name: 'increase', exact: true }).click();
  await expect(page.locator('#root li')).toHaveText('count: 1');

  await ready(page, `${origin}/html/mdx.html`, info.project.name);
  await expect(page.locator('#root h1')).toBeVisible();
  await page.getByRole('button', { name: 'change', exact: true }).click();
  await expect(page.locator('#root h2')).toHaveText('mark down title');
  await page.getByRole('button', { name: 'change', exact: true }).click();
  await expect(page.locator('#root h1')).toBeVisible();

  await ready(page, `${origin}/html/sharedStore.html`, info.project.name);
  await expect(page.locator('textarea')).toHaveCount(2);
  await page.locator('textarea').first().fill('shared e2e');
  await expect(page.locator('textarea').last()).toHaveValue('shared e2e');
  await page.locator('textarea').last().fill('backwards e2e');
  await expect(page.locator('textarea').first()).toHaveValue('backwards e2e');

  await ready(page, `${origin}/html/jsxExample.html`, info.project.name);
  await expect(
    page.getByRole('button', { name: 'Increase', exact: true }).first()
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Increase', exact: true })
    .first()
    .click();
  await expect(page.locator('#root')).toContainText('count: 2');

  await ready(page, `${origin}/html/complexExample.html`, info.project.name);
  await expect(page.locator('input').first()).toBeVisible();
  await page.locator('input').first().fill('42');
  await expect(page.locator('input').first()).toHaveValue('42');
  const button = page
    .getByRole('button', { name: 'gdataupdate', exact: true })
    .first();
  const before = await page.locator('#root').innerText();
  await button.click();
  await expect(page.locator('#root')).not.toHaveText(before);
});

test('B-8: all 42 docs routes and computed/store/keyed/context/portal interactions work', async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  const origin = `http://127.0.0.1:${info.project.name === 'concurrent' ? 43135 : 43134}`;
  await ready(page, `${origin}/lithent/#/examples/1`, info.project.name);
  const main = page.locator('main');
  await expect(main.getByRole('heading', { level: 1 })).toContainText('banana');
  await main.getByRole('button', { name: '+1', exact: true }).click();
  await expect(main).toContainText('190 kcal');
  await main.getByRole('link', { name: 'Computed guide', exact: true }).click();
  await expect(page).toHaveURL(/#\/guide\/computed$/);
  await expect(main.getByRole('heading', { level: 1 })).toContainText(
    'Computed'
  );

  // Change only the hash: exercise the actual SPA listener and unmount path.
  for (const language of ['', '/ko']) {
    for (let id = 1; id <= 21; id++) {
      await page.evaluate(hash => {
        location.hash = hash;
      }, `${language}/examples/${id}`);
      await expect(page).toHaveURL(new RegExp(`#${language}/examples/${id}$`));
      await expect(main.getByRole('heading', { level: 1 }).first()).toHaveText(
        titles[id - 1][language ? 1 : 0] || titles[id - 1][0]
      );
      await expect(main).not.toBeEmpty();
    }
  }

  await page.evaluate(() => {
    location.hash = '/examples/2';
  });
  await expect(main.getByRole('heading', { level: 1 }).first()).toHaveText(
    titles[1][0]
  );
  const writers = main.getByPlaceholder('Type your shared text here...');
  await expect(writers).toHaveCount(2);
  await writers.first().fill('docs shared e2e');
  await expect(writers.last()).toHaveValue('docs shared e2e');

  await page.evaluate(() => {
    location.hash = '/examples/6';
  });
  await expect(main.getByRole('heading', { level: 1 }).first()).toHaveText(
    titles[5][0]
  );
  const addSong = main.getByRole('button', {
    name: '➕ Add Song',
    exact: true,
  });
  const before = await main.innerText();
  await addSong.click();
  await expect(main).not.toHaveText(before);
  const songButtons = main.getByTitle('Play', { exact: true });
  await expect(songButtons).toHaveCount(6);
  await songButtons.first().click();
  await expect(main).toContainText('Total plays: 1');
  const songTitles = main.locator('h4');
  const order = await songTitles.allTextContents();
  expect(order).toHaveLength(6);
  await main.getByRole('button', { name: '🔄 Reverse', exact: true }).click();
  await expect(songTitles).toHaveText([...order].reverse());
  await expect(main).toContainText('Total plays: 1');

  await page.evaluate(() => {
    location.hash = '/examples/11';
  });
  await expect(main.getByRole('heading', { level: 1 }).first()).toHaveText(
    titles[10][0]
  );
  await main
    .getByRole('button', { name: 'Toggle theme (Light)', exact: true })
    .click();
  await expect(
    main.getByRole('button', { name: 'Toggle theme (Dark)', exact: true })
  ).toBeVisible();

  await page.evaluate(() => {
    location.hash = '/examples/20';
  });
  await expect(main.getByRole('heading', { level: 1 }).first()).toHaveText(
    titles[19][0]
  );
  await main.getByRole('button').first().click();
  const close = page.getByRole('button', { name: 'Close', exact: true });
  await expect(close).toBeVisible();
  expect(
    await close.evaluate(
      node => !document.querySelector('main')!.contains(node)
    )
  ).toBe(true);
  await close.click();
  await expect(close).toHaveCount(0);
});

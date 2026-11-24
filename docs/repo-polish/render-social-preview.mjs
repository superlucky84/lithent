/**
 * Renders docs/repo-polish/social-preview.html to
 * lithentDocs/public/social-preview.png (1280×640) for the GitHub social
 * preview and the docs site og:image.
 *
 *   node docs/repo-polish/render-social-preview.mjs
 */
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'social-preview.html');
const output = resolve(here, '../../lithentDocs/public/social-preview.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
await page.goto(pathToFileURL(source).href);
await page.screenshot({ path: output });
await browser.close();
console.log(`wrote ${output}`);

import { describe, expect, it } from 'vitest';
import { h, render, mount, getComponentKey, mountCallback } from 'lithent';
import { createBoundary } from '../createBoundary';

// docs/hmr-root-remount: a layout component that renders the whole document.
// Rendering it replaces the page's <html>, and the root kept the detached one
// as its wrapper, so the first HMR replacement emptied the page and inserted
// the new document nowhere. The hydrated case (the SSR template, which broke
// on the second replacement) is in ssr/src/tests: lithent/ssr is built after
// this package.
describe('an <html> root attached by render', () => {
  it('stays on the page through repeated HMR replacements', async () => {
    const boundary = createBoundary('html-root-render');
    let label = 'v1';
    const Layout = mount(() => {
      const unregister = boundary.register(getComponentKey()!);
      mountCallback(() => () => unregister());
      return () => (
        <html lang="en">
          <head>
            <title>t</title>
          </head>
          <body>
            <header>h</header>
            <main>
              <h1>{label}</h1>
            </main>
          </body>
        </html>
      );
    });

    document.documentElement.innerHTML = '';
    render(<Layout />, document.documentElement);

    try {
      for (let version = 2; version <= 4; version++) {
        label = `v${version}`;
        expect(boundary.update(Layout)).toBe(true);
        await new Promise(resolve => setTimeout(resolve));
        expect(document.querySelectorAll('header')).toHaveLength(1);
        expect(document.querySelectorAll('h1')).toHaveLength(1);
        expect(document.querySelector('main > h1')?.textContent).toBe(
          `v${version}`
        );
        expect(document.documentElement.getAttribute('lang')).toBe('en');
      }
    } finally {
      boundary.dispose();
    }
  });
});

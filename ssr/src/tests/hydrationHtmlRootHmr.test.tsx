import { describe, expect, it } from 'vitest';
import { h, mount, getComponentKey, mountCallback } from 'lithent';
import { createBoundary } from 'lithent/devHelper';
import { hydration } from '../hydration';

// docs/hmr-root-remount: the SSR template's src/layout.tsx renders the whole
// document and is hydrated onto the server HTML. Its second HMR replacement
// emptied the page: the first one replaced the page's <html>, and the root
// kept the detached one as its wrapper. The same replacements of a root
// attached with render are covered in devHelper/src/tests.
const serverMarkup =
  '<head><title>t</title></head><body><header>h</header><main><h1>v1</h1></main></body>';

describe('a hydrated <html> root', () => {
  it('stays on the page through repeated HMR replacements', async () => {
    const boundary = createBoundary('ssr-html-root');
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

    document.documentElement.innerHTML = serverMarkup;
    // Called with h, like the other ssr tests: the root runner compiles them
    // with the classic h pragma, this package with the automatic runtime.
    hydration(h(Layout, {}), document.documentElement);
    expect(document.querySelector('main > h1')?.textContent).toBe('v1');

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
      }
    } finally {
      boundary.dispose();
    }
  });
});

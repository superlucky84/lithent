import { describe, expect, it } from 'vitest';
import { transformWithHmr } from '../index';

// docs/hmr-propagation: Vite decides whether a module accepts its own updates
// by finding `import.meta.hot.accept(` in the served source, whether or not
// the call ever runs. A module that never calls it in the browser but has it
// in its source swallows every edit: no update, no reload.
const transform = (code: string) =>
  transformWithHmr({
    code,
    markerRegex: /\/\*\s*lithent:hmr-boundary(?:\s+([A-Za-z0-9_,\s]+))?\s*\*\//,
    boundaryImportSpecifier: 'lithent/devHelper',
    tagFunctionImportSpecifier: 'lithent',
  });

const selfAccepting = (code: string) =>
  /import\.meta\.hot\??\.accept/.test(code);

describe('modules without component boundaries', () => {
  it.each([
    [
      'a store module',
      `import { store } from 'lithent/helper';
export const favorites = store({ ids: [] });`,
    ],
    [
      'an entry that only renders',
      `import { render } from 'lithent';
import { App } from './App';
render(<App />, document.getElementById('app'));`,
    ],
    [
      'an entry that only defines elements',
      `import { defineElement } from 'lithent/element';
import { Card } from './Card';
defineElement('x-card', Card);`,
    ],
    [
      'a marked module without components',
      `/* lithent:hmr-boundary */
import { store } from 'lithent/helper';
export const settings = store({ dark: false });`,
    ],
  ])('pass updates of %s on to their importers', (_name, code) => {
    const result = transform(code);
    expect(result.transformed).toBe(true);
    expect(selfAccepting(result.code)).toBe(false);
    // Cleanup hooks stay registered.
    expect(result.code).toContain('import.meta.hot.dispose(');
    expect(result.code).toContain('import.meta.hot.prune(');
  });
});

describe('modules with component boundaries', () => {
  it.each([
    [
      'a mount component',
      `import { mount } from 'lithent';
export const App = mount(() => () => <p />);`,
    ],
    ['a stateless component', 'export const Badge = () => <span />;'],
    [
      'a marked component',
      `/* lithent:hmr-boundary Card */
export function Card() { return <article />; }`,
    ],
    [
      'a component rendered in the same file',
      `import { mount, render } from 'lithent';
const App = mount(() => () => <p />);
render(<App />, document.body);`,
    ],
  ])('keep %s as an HMR boundary', (_name, code) => {
    expect(selfAccepting(transform(code).code)).toBe(true);
  });
});

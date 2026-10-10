import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import { transformWithMarker } from '../markerParse';

const transform = (code: string) =>
  transformWithMarker({
    code,
    markerRegex: /\/\*\s*lithent:hmr-boundary(?:\s+([A-Za-z0-9_,\s]+))?\s*\*\//,
    boundaryImportSpecifier: 'lithent/devHelper',
    tagFunctionImportSpecifier: 'lithent',
  });

describe('explicit component markers', () => {
  it('wraps local and exported components independently and guards render calls', () => {
    const result = transform(`
'use client';
import {mount, render} from 'lithent';
/* lithent:hmr-boundary default */
const App = mount(() => {return () => <Secondary/>;});
const Secondary = () => <span/>;
render(<App/>, document.body);
export default App;
`);
    expect(result.transformed).toBe(true);
    expect(result.code).not.toContain('/* lithent:hmr-boundary');
    expect(result.code).toContain('__lithentWrapComponent("App", mount(');
    expect(result.code).toContain('__lithentWrapComponent("Secondary",');
    expect(result.code).toContain('__lithentRenderOnce(0, () => render(');
    expect(() =>
      parse(result.code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })
    ).not.toThrow();
  });

  it('does not rely on unaliased lifecycle imports or snippet text', () => {
    const result = transform(`
import {createBoundary} from 'lithent/devHelper';
import {mount, getComponentKey as key} from 'lithent';
const snippet = "import {mountCallback} from 'lithent'";
/* lithent:hmr-boundary Counter */
export const Counter = mount(() => {return () => <span/>;});
`);
    const ast = parse(result.code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
    const boundaryImports = ast.program.body.filter(
      node =>
        node.type === 'ImportDeclaration' &&
        node.source.value === 'lithent/devHelper'
    );
    expect(boundaryImports).toHaveLength(2);
    expect(result.code).toContain('createBoundary as __lithentCreateBoundary');
    expect(result.code).toContain(
      'getComponentKey as __lithentGetComponentKey'
    );
    expect(result.code).toContain('mountCallback as __lithentMountCallback');
  });

  it('initializes wrappers before declarations even when the marker follows them', () => {
    const result = transform(`
export const Badge = () => <span/>;
/* lithent:hmr-boundary Badge */
`);
    expect(result.code.indexOf('const __lithentWrapComponent')).toBeLessThan(
      result.code.indexOf('export const Badge')
    );
  });
});
